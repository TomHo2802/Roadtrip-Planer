// ===== Programm/Daten getrennt: Datendatei laden, mit Datei verbinden, Gerätemodus =====
    const MODE_KEY = 'roadtrip_device_mode_v1';
    const readTripFile = (file) => new Promise((res, rej) => {
      if (file.size > 120 * 1024 * 1024) return rej(new Error('Datei zu groß (max. 120 MB).'));
      const r = new FileReader(); r.onerror = () => rej(new Error('Datei konnte nicht gelesen werden.'));
      r.onload = () => { try { res(normalizeTrip(JSON.parse(r.result))); } catch (e) { rej(new Error('Keine gültige Reisedatei: ' + e.message)); } };
      r.readAsText(file);
    });
    const setDeviceMode = (m) => { try { localStorage.setItem(MODE_KEY, m); } catch (e) {} };
    const getDeviceMode = () => { try { return localStorage.getItem(MODE_KEY) || 'edit'; } catch (e) { return 'edit'; } };
    const FS_SUPPORTED = typeof window !== 'undefined' && !!window.showOpenFilePicker;
    const fsIdb = () => new Promise((res, rej) => { try { const r = indexedDB.open('roadtrip_fs_v1', 1); r.onupgradeneeded = () => r.result.createObjectStore('h'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } });
    const fsIdbGet = async () => { const db = await fsIdb(); return new Promise((res) => { const rq = db.transaction('h').objectStore('h').get('handle'); rq.onsuccess = () => res(rq.result); rq.onerror = () => res(null); }); };
    const fsIdbPut = async (h) => { try { const db = await fsIdb(); return await new Promise((res) => { try { const tx = db.transaction('h', 'readwrite'); tx.objectStore('h').put(h, 'handle'); tx.oncomplete = () => res(); tx.onerror = () => res(); tx.onabort = () => res(); } catch (e) { res(); } }); } catch (e) {} };

    // ----- Dokumente in der Datendatei (Base64) -----
    const blobToB64 = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(r.error); r.readAsDataURL(blob); });
    const b64ToBlob = (b64, type) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: type || 'application/octet-stream' }); };
    let docsPayloadCache = null;
    const docsChanged = () => { docsPayloadCache = null; };
    const getRawDocs = async () => { try { return (await docsTx('readonly', (s) => s.getAll())) || []; } catch (e) { return []; } };
    const buildDocsPayload = async () => {
      if (docsPayloadCache) return docsPayloadCache; const out = [];
      for (const d of await getRawDocs()) out.push({ id: d.id, name: d.name, type: d.type, size: d.size, cat: d.cat, added: d.added, data: await blobToB64(d.blob) });
      docsPayloadCache = out; return out;
    };
    const withDocs = async (trip) => ({ ...trip, documents: await buildDocsPayload() });
    const replaceDocs = async (arr) => {
      const db = await docsDb();
      await new Promise((res, rej) => { const tx = db.transaction('docs', 'readwrite'); const st = tx.objectStore('docs'); st.clear(); (arr || []).forEach((d) => st.put({ id: d.id, name: d.name, type: d.type, size: d.size, cat: d.cat, added: d.added, blob: d.blob || b64ToBlob(d.data, d.type) })); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
      docsChanged();
    };
    const downloadTripFile = async (trip, name) => { rtMarkBackup(); const full = await withDocs(trip); const b = new Blob([JSON.stringify(full, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1500); };
    window.__pendingDocs = null;
    const stripPendingDocs = (d) => { const { documents, ...rest } = d; window.__pendingDocs = Array.isArray(documents) && documents.length ? documents : null; return rest; };

    // ----- Reisen-Bibliothek (inaktive Reisen im Browser) -----
    const ACTIVE_ID_KEY = 'roadtrip_active_trip_v1';
    const libDb = () => new Promise((res, rej) => { try { const r = indexedDB.open('roadtrip_lib_v1', 1); r.onupgradeneeded = () => r.result.createObjectStore('trips', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } });
    const libTx = async (mode, fn) => { const db = await libDb(); return new Promise((res, rej) => { const tx = db.transaction('trips', mode); const rq = fn(tx.objectStore('trips')); tx.oncomplete = () => res(rq && rq.result); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); }); };
    const libAll = async () => { try { return (await libTx('readonly', (s) => s.getAll())) || []; } catch (e) { return []; } };
    const libGet = (id) => libTx('readonly', (s) => s.get(id));
    const libPut = (e) => libTx('readwrite', (s) => s.put(e));
    const libDel = (id) => libTx('readwrite', (s) => s.delete(id));
    const getActiveTrip = () => { try { const p = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)); return hasTripData(p) ? p : null; } catch (e) { return null; } };
    const ensureActiveTripId = () => { try { const t = getActiveTrip(); if (t && !t.meta.tripId) { t.meta.tripId = freshId(); localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(t)); } if (t) localStorage.setItem(ACTIVE_ID_KEY, t.meta.tripId); } catch (e) {} };
    ensureActiveTripId();
    const sameTrip = (a, b) => !!(a && b && ((a.meta.tripId && b.meta.tripId) ? a.meta.tripId === b.meta.tripId : (a.meta.title && a.meta.title === b.meta.title && (a.meta.startDate || '') === (b.meta.startDate || ''))));
    const tripLabel = (t) => `${t.meta.title || 'Ohne Titel'}${t.meta.startDate ? ' · ' + t.meta.startDate.split('-').reverse().join('.') : ''}`;
    const fsIdbDel = async () => { try { const db = await fsIdb(); await new Promise((res) => { const tx = db.transaction('h', 'readwrite'); tx.objectStore('h').delete('handle'); tx.oncomplete = () => res(); tx.onerror = () => res(); }); } catch (e) {} };
    const stashActive = async () => {
      const t = getActiveTrip(); if (!t) return null; t.meta.tripId = t.meta.tripId || freshId();
      const h = await fsIdbGet().catch(() => null);
      await libPut({ id: t.meta.tripId, title: t.meta.title, start: t.meta.startDate, end: t.meta.endDate, stages: (t.stages || []).length, savedAt: Date.now(), trip: t, docs: await getRawDocs(), handle: h || null });
      return t.meta.tripId;
    };
    const installTripData = async (data, handle) => {
      const { documents, ...trip } = data; trip.meta = { ...trip.meta, tripId: trip.meta.tripId || freshId() };
      try { const prev = localStorage.getItem(LOCAL_STORAGE_KEY); if (prev) { const b = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]'); b.unshift({ savedAt: new Date().toISOString(), data: JSON.parse(prev) }); localStorage.setItem(BACKUP_KEY, JSON.stringify(b.slice(0, 5))); } } catch (e) {}
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trip)); localStorage.setItem(ACTIVE_ID_KEY, trip.meta.tripId);
      await replaceDocs(documents || []);
      if (handle) await fsIdbPut(handle);
    };
    // Datei als aktive Reise laden: gleiche Reise wird ersetzt, andere Reise: aktuelle wird in die Bibliothek gelegt
    const loadTripFileAsActive = async (data, handle) => {
      const active = getActiveTrip();
      if (active && sameTrip(active, data)) { data.meta.tripId = active.meta.tripId; await installTripData(data, handle); return; }
      const lib = await libAll(); const hit = lib.find((e) => sameTrip(e.trip, data));
      if (hit) { data.meta.tripId = hit.id; await libDel(hit.id); }
      await stashActive(); await installTripData(data, handle);
      if (!handle) await fsIdbDel();
    };
    const switchTrip = async (id) => {
      const e = await libGet(id); if (!e) throw new Error('Reise nicht gefunden.');
      await stashActive(); await libDel(id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(e.trip)); localStorage.setItem(ACTIVE_ID_KEY, e.id);
      await replaceDocs(e.docs || []); if (e.handle) await fsIdbPut(e.handle); else await fsIdbDel();
    };
    window.__rtAdoptDraft = async (trip) => { await stashActive(); await installTripData(trip, null); await fsIdbDel(); };
    const startBlankTrip = async () => { await stashActive(); localStorage.removeItem(LOCAL_STORAGE_KEY); localStorage.removeItem(ACTIVE_ID_KEY); await replaceDocs([]); await fsIdbDel(); };
    const fsSync = {
      handle: null, name: '', status: 'none', lastWrite: null, error: '', listeners: new Set(), timer: null, lastSeen: 0, dirty: false, incoming: null, polling: false, baseStamp: '',
      set(p) { Object.assign(this, p); this.listeners.forEach((f) => f()); },
      async init() {
        if (!FS_SUPPORTED) return;
        try { const h = await fsIdbGet(); if (!h) return; this.handle = h; this.name = h.name; const p = await h.queryPermission({ mode: 'readwrite' }); this.set({ status: p === 'granted' ? 'connected' : 'needs-permission' }); } catch (e) {}
      },
      async pick(create, data) {
        const h = create ? await window.showSaveFilePicker({ suggestedName: 'roadtrip-daten.json', types: [{ description: 'Reisedaten', accept: { 'application/json': ['.json'] } }] })
          : (await window.showOpenFilePicker({ types: [{ description: 'Reisedaten', accept: { 'application/json': ['.json'] } }] }))[0];
        await fsIdbPut(h); this.set({ handle: h, name: h.name, status: 'needs-permission', error: '' });
        if (create) { await this.write(data, true); }
        return h;
      },
      async pickRaw() { return (await window.showOpenFilePicker({ types: [{ description: 'Reisedaten', accept: { 'application/json': ['.json'] } }] }))[0]; },
      async readHandle(h) {
        if ((await h.queryPermission({ mode: 'readwrite' })) !== 'granted' && (await h.requestPermission({ mode: 'readwrite' })) !== 'granted') throw new Error('Zugriff auf die Datei wurde nicht erlaubt.');
        const txt = await (await h.getFile()).text(); if (!txt.trim()) return null;
        try { return normalizeTrip(JSON.parse(txt)); } catch (e) { throw new Error('Keine gültige Reisedatei: ' + e.message); }
      },
      async adopt(h) { await fsIdbPut(h); this.set({ handle: h, name: h.name, status: 'connected', error: '' }); },
      async activate() { // Berechtigung holen, Datei lesen
        const h = this.handle; if (!h) throw new Error('Keine Datei verbunden.');
        if ((await h.queryPermission({ mode: 'readwrite' })) !== 'granted' && (await h.requestPermission({ mode: 'readwrite' })) !== 'granted') throw new Error('Zugriff auf die Datei wurde nicht erlaubt.');
        this.set({ status: 'connected', error: '' });
        const f = await h.getFile(); const txt = await f.text(); if (!txt.trim()) return null; return normalizeTrip(JSON.parse(txt));
      },
      async write(data, force) {
        if (!this.handle || (this.status !== 'connected' && !force)) return;
        try {
          if (!force && (this.incoming || await this.checkRemote(data))) { this.set({ dirty: false }); return; }
          const full = await withDocs(data); const w = await this.handle.createWritable(); await w.write(JSON.stringify(full, null, 2)); await w.close();
          let ms = 0; try { ms = (await this.handle.getFile()).lastModified; } catch (e) {}
          rtMarkBackup(); this.set({ lastWrite: new Date(), lastSeen: ms, baseStamp: (data.meta && data.meta.lastUpdated) || '', dirty: false, incoming: null, error: '' });
        }
        catch (e) { this.set({ dirty: false, error: 'Schreiben in die Datei fehlgeschlagen: ' + (e && e.message ? e.message : e), status: 'needs-permission' }); }
      },
      queueWrite(data) {
        if (this.status !== 'connected') return;
        if (!this.incoming && this.baseStamp && data.meta && data.meta.lastUpdated === this.baseStamp) return;
        clearTimeout(this.timer); this.dirty = true; this.listeners.forEach((f) => f()); this.timer = setTimeout(() => this.write(data), 800);
      },
      // Liegt in der Datei ein neuerer Stand als unser lokaler? Dann nicht überschreiben.
      async readNewer(local) {
        const f = await this.handle.getFile(); if (f.lastModified <= (this.lastSeen || 0) + 1) return null;
        const txt = await f.text(); this.lastSeen = f.lastModified; if (!txt.trim()) return null;
        let d; try { d = normalizeTrip(JSON.parse(txt)); } catch (e) { return null; }
        if (!local || !sameTrip(local, d)) return null;
        return String((d.meta && d.meta.lastUpdated) || '') > String((local.meta && local.meta.lastUpdated) || '') ? d : null;
      },
      async checkRemote(data) { const d = await this.readNewer(data); if (d) { this.set({ incoming: { data: d, at: new Date() } }); return true; } return false; },
      async poll() {
        if (!this.handle || this.status !== 'connected' || this.polling) return; this.polling = true;
        try {
          if ((await this.handle.queryPermission({ mode: 'readwrite' })) !== 'granted') { this.set({ status: 'needs-permission' }); return; }
          if (this.incoming) return;
          const d = await this.readNewer(getActiveTrip()); if (d) this.set({ incoming: { data: d, at: new Date() } });
        } catch (e) {} finally { this.polling = false; }
      },
      async applyIncoming() {
        const inc = this.incoming; if (!inc) return; clearTimeout(this.timer);
        await installTripData(inc.data); try { sessionStorage.setItem('rt_synced', '1'); } catch (e) {} location.reload();
      },
      async renew(trip) {
        const d = await this.activate(); this.lastSeen = 0;
        const hit = d && sameTrip(getActiveTrip() || trip, d) && String((d.meta && d.meta.lastUpdated) || '') > String(((getActiveTrip() || trip).meta || {}).lastUpdated || '');
        if (hit) this.set({ incoming: { data: d, at: new Date() } }); else await this.write(getActiveTrip() || trip);
      },
      async disconnect() { try { const db = await fsIdb(); const tx = db.transaction('h', 'readwrite'); tx.objectStore('h').delete('handle'); } catch (e) {} this.set({ handle: null, name: '', status: 'none' }); }
    };
    function useFsSync() { const [, f] = useState(0); useEffect(() => { const fn = () => f((x) => x + 1); fsSync.listeners.add(fn); fsSync.init().then(fn); return () => fsSync.listeners.delete(fn); }, []); return fsSync; }

    