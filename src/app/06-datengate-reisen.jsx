function DataGate({ onSkip }) {
      const fs = useFsSync(); const [err, setErr] = useState(''); const [lib, setLib] = useState([]); const [busy, setBusy] = useState(false);
      const [ro, setRo] = useState(() => { try { return navigator.maxTouchPoints > 0 && window.innerWidth < 900; } catch (e) { return false; } });
      useEffect(() => { libAll().then(setLib); }, []);
      const run = async (fn) => { setErr(''); setBusy(true); try { await fn(); } catch (x) { if (!x || x.name !== 'AbortError') setErr(x && x.message ? x.message : String(x)); } setBusy(false); };
      const onFile = (e) => run(async () => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return; const d = await readTripFile(f); await loadTripFileAsActive(d); setDeviceMode(ro ? 'readonly' : 'edit'); location.reload(); });
      const onConnect = () => run(async () => { const h = await fsSync.pickRaw(); const d = await fsSync.readHandle(h); if (!d) throw new Error('Die Datei ist leer.'); await loadTripFileAsActive(d, h); setDeviceMode('edit'); location.reload(); });
      const onSwitch = (id) => run(async () => { await switchTrip(id); location.reload(); });
      return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-100 p-4" data-readonly-allow>
          <div className="mx-auto max-w-xl space-y-4 py-6">
            <h1 className="text-2xl font-extrabold text-slate-900">Roadtrip-Planer</h1>
            <p className="text-sm text-slate-600">Reise planen, alles Gebuchte an einem Ort und unterwegs offline dabei. Wie möchtest du starten?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" data-demo-open disabled={busy} onClick={() => run(async () => { await loadDemo(); location.reload(); })} className="sm:col-span-2 text-left rounded-2xl border-2 border-blue-600 bg-white p-4 space-y-1"><span className="block text-base font-extrabold text-slate-900">Demo ansehen</span><span className="block text-xs text-slate-600">Beispielreise Florida mit allen Funktionen zum Ausprobieren. Deine Daten bleiben getrennt.</span><span className="inline-block mt-1 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold">Empfohlen für den Einstieg</span></button>
              <h2 className="sm:col-span-2 text-base font-bold text-slate-900 pt-1">Eigene Reise planen</h2>
              <a href="assistent.html" data-open-assistant className="flex flex-col justify-center rounded-2xl border border-slate-300 bg-white p-4 space-y-1 min-h-[112px] no-underline"><span className="block text-base font-extrabold text-slate-900">Route vorschlagen lassen</span><span className="block text-xs text-slate-600">Du gibst Zeitraum, Start, Ziel, Fixpunkte und Tagesstrecke an. Daraus entsteht ein Routen-Vorschlag, den du prüfst und im Planer anlegst.</span></a>
              <button type="button" data-new-trip onClick={onSkip} className="text-left rounded-2xl border border-slate-300 bg-white p-4 space-y-1 min-h-[112px]"><span className="block text-base font-extrabold text-slate-900">Etappen selbst eintragen</span><span className="block text-xs text-slate-600">Du kennst deine Route schon. In drei Schritten trägst du Zeitraum, Mitreisende und Etappen ein.</span></button>
              
              <div className="sm:col-span-2"><RtDraftBar hasTrip={false} gate={true} /></div>
            </div>
            {lib.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                <h2 className="text-base font-bold">Gespeicherte Reisen auf diesem Gerät</h2>
                {lib.map((e) => <div key={e.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2"><div className="min-w-0"><div className="text-sm font-semibold break-words">{e.title || 'Ohne Titel'}</div><div className="text-[11px] text-slate-500">{e.start ? e.start.split('-').reverse().join('.') : ''} · {e.stages} Etappen · {(e.docs || []).length} Dokumente</div></div><button type="button" disabled={busy} onClick={() => onSwitch(e.id)} className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-white text-sm font-bold">Öffnen</button></div>)}
              </section>
            )}
<details data-have-file className="rounded-2xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer text-base font-bold text-slate-900">Ich habe schon eine Reisedatei</summary>
              <div className="space-y-3 mt-3">
            <div className="space-y-3">
              <h3 className="text-sm font-bold">Datei laden</h3>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ro} onChange={(e) => setRo(e.target.checked)} className="w-5 h-5" /> Nur lesen (empfohlen für Handys)</label>
              <label className="min-h-[48px] inline-flex items-center px-5 rounded-xl bg-blue-600 text-white text-sm font-bold cursor-pointer">Datei auswählen<input type="file" accept=".json,application/json" onChange={onFile} className="hidden" /></label>
              <p className="text-xs text-slate-500">Im Dateiauswahl-Dialog Google Drive wählen und die Reise-Datei antippen. Danach liegt eine Kopie samt Dokumenten offline auf dem Gerät.</p>
            </div>
            {FS_SUPPORTED && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold">Laptop: mit Datei verbinden</h3>
                <p className="text-xs text-slate-500">Änderungen werden automatisch in die Datei zurückgeschrieben (Chrome oder Edge).</p>
                <button type="button" disabled={busy} onClick={onConnect} className="min-h-[48px] px-5 rounded-xl bg-[#1F4E8C] text-white text-sm font-bold">Datei verbinden</button>
              </div>
            )}
              </div>
            </details>
            <button type="button" data-readonly-allow onClick={rtOpenHelp} className="text-sm font-semibold text-blue-700 underline min-h-[40px]">Kurzanleitung ansehen</button>
            {busy && <div className="text-sm text-slate-600">Bitte warten …</div>}
            {err && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-950">{err}</div>}
          </div>
        </div>
      );
    }

    function TripsCard({ trip }) {
      const [lib, setLib] = useState([]); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false); const mode = getDeviceMode();
      const reload = () => libAll().then(setLib); useEffect(() => { reload(); }, []);
      const run = async (fn) => { setMsg(''); setBusy(true); try { await fn(); } catch (x) { if (!x || x.name !== 'AbortError') setMsg(x && x.message ? x.message : String(x)); } setBusy(false); };
      const onSwitch = (e) => run(async () => { await switchTrip(e.id); location.reload(); });
      const onRemove = (e) => run(async () => { if (!(await window.rtAsk(`Reise „${e.title || 'Ohne Titel'}“ von diesem Gerät entfernen? Die Datei in Drive bleibt unberührt.`))) return; await libDel(e.id); await reload(); });
      const onFile = (ev) => run(async () => { const f = ev.target.files && ev.target.files[0]; ev.target.value = ''; if (!f) return; const d = await readTripFile(f); const same = sameTrip(getActiveTrip(), d);
        if (!(await window.rtAsk(same ? `Datei „${f.name}“ ersetzt die aktuelle Reise auf diesem Gerät. Fortfahren?` : `Reise „${d.meta.title || 'Ohne Titel'}“ laden? Die aktuelle Reise wird gesichert und bleibt in der Liste.`))) return;
        await loadTripFileAsActive(d); location.reload(); });
      const onConnect = () => run(async () => { const h = await fsSync.pickRaw(); const d = await fsSync.readHandle(h); if (!d) throw new Error('Die Datei ist leer.'); const same = sameTrip(getActiveTrip(), d);
        if (same) { const fl = (d.meta && d.meta.lastUpdated) || '', lo = (trip.meta && trip.meta.lastUpdated) || ''; if (fl > lo && (await window.rtAsk('Die Datei ist neuer als der Stand auf diesem Gerät. Datei laden und lokale Daten ersetzen?'))) { await loadTripFileAsActive(d, h); location.reload(); return; } await fsSync.adopt(h); await fsSync.write(trip); setMsg('Verbunden. Der Gerätestand wurde in die Datei geschrieben.'); return; }
        if (!(await window.rtAsk(`Die Datei gehört zur Reise „${d.meta.title || 'Ohne Titel'}“. Aktuelle Reise sichern und zu dieser wechseln?`))) return; await loadTripFileAsActive(d, h); location.reload(); });
      const onBlank = () => run(async () => { if (!(await window.rtAsk('Die aktuelle Reise wird gesichert und bleibt in der Liste. Danach kannst du eine andere Datei laden oder eine neue Reise anlegen. Fortfahren?'))) return; await startBlankTrip(); location.reload(); });
      return (
        <section data-readonly-allow className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-indigo-950">Meine Reisen</h2>
          <div className="rounded-xl border-2 border-indigo-400 bg-white p-3"><div className="text-[11px] font-bold text-indigo-700">AKTUELL GEÖFFNET</div><div className="text-sm font-bold break-words">{tripLabel(trip)}</div></div>
          {lib.map((e) => <div key={e.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3"><div className="min-w-0"><div className="text-sm font-semibold break-words">{e.title || 'Ohne Titel'}</div><div className="text-[11px] text-slate-500">{e.start ? e.start.split('-').reverse().join('.') : ''} · {e.stages} Etappen · {(e.docs || []).length} Dokumente</div></div>
            <div className="flex gap-1.5 shrink-0"><button data-readonly-allow type="button" disabled={busy} onClick={() => onSwitch(e)} className="min-h-[44px] px-3 rounded-xl bg-[#1F4E8C] text-white text-sm font-bold">Wechseln</button><button data-readonly-allow type="button" aria-label="Entfernen" disabled={busy} onClick={() => onRemove(e)} className="min-h-[44px] w-10 rounded-xl text-slate-400 hover:text-red-600">✕</button></div></div>)}
          <div data-demo-card className="rounded-xl border border-dashed border-slate-300 p-3 space-y-2">
            <div className="text-sm font-bold">Demo-Reise „Florida Rundreise“</div>
            <div className="text-xs text-slate-500">Anonymisierte Beispielreise zum Ausprobieren. Änderungen betreffen nur die Demo. Mit dem Zurücksetzen ist sie wieder im Ursprungszustand; deine echten Reisen bleiben unberührt.</div>
            {isDemoTrip(trip)
              ? <button data-readonly-allow data-demo-reset type="button" disabled={busy} onClick={() => run(async () => { if (!(await window.rtAsk('Die Demo-Reise wird auf den Ursprungszustand zurückgesetzt. Alle Änderungen daran gehen verloren. Fortfahren?'))) return; await loadDemo(); location.reload(); })} className="min-h-[44px] px-4 rounded-xl bg-amber-600 text-white text-sm font-bold">Demo auf Ursprungszustand zurücksetzen</button>
              : <button data-readonly-allow data-demo-open type="button" disabled={busy} onClick={() => run(async () => { const inLib = lib.some((e) => e.id === DEMO_ID); if (!(await window.rtAsk(inLib ? 'Die Demo wird im Ursprungszustand neu geöffnet (deine bisherigen Demo-Änderungen gehen verloren). Die aktuelle Reise wird gesichert und bleibt in der Liste. Fortfahren?' : 'Die Demo-Reise wird geöffnet. Die aktuelle Reise wird gesichert und bleibt in der Liste. Fortfahren?'))) return; await loadDemo(); location.reload(); })} className="min-h-[44px] px-4 rounded-xl bg-[#1F4E8C] text-white text-sm font-bold">{lib.some((e) => e.id === DEMO_ID) ? 'Demo neu öffnen (Ursprungszustand)' : 'Demo-Reise öffnen'}</button>}
            {!isDemoTrip(trip) && lib.some((e) => e.id === DEMO_ID) && <div className="text-xs text-slate-500">Die Demo mit deinen Änderungen findest du oben in der Liste unter „Wechseln“.</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <label data-readonly-allow className="min-h-[44px] inline-flex items-center px-4 rounded-xl bg-blue-700 text-white text-sm font-bold cursor-pointer">Reise aus Datei laden<input type="file" accept=".json,application/json" onChange={onFile} className="hidden" /></label>
            {mode !== 'readonly' && FS_SUPPORTED && <button data-readonly-allow type="button" disabled={busy} onClick={onConnect} className="min-h-[44px] px-4 rounded-xl bg-[#1F4E8C] text-white text-sm font-bold">Reise per Datei verbinden</button>}
            {mode !== 'readonly' && <button data-readonly-allow type="button" disabled={busy} onClick={onBlank} className="min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold">Neue / andere Reise</button>}
          </div>
          <p className="text-xs text-indigo-900">Beim Wechsel wird die aktuelle Reise samt Dokumenten auf diesem Gerät gesichert. Eine Datei, die zur selben Reise gehört, ersetzt deren Stand (so holst du Planänderungen aufs Handy).</p>
          {msg && <div role="status" className="text-sm rounded-lg bg-white border border-indigo-300 p-2">{msg}</div>}
        </section>
      );
    }

    function DeviceDataCard({ trip }) {
      const fs = useFsSync(); const [msg, setMsg] = useState(''); const mode = getDeviceMode();
      const run = async (fn) => { setMsg(''); try { await fn(); } catch (x) { if (!x || x.name !== 'AbortError') setMsg(x && x.message ? x.message : String(x)); } };
      const reactivate = () => run(async () => { const d = await fsSync.activate(); const fl = (d && d.meta && d.meta.lastUpdated) || '', lo = (trip.meta && trip.meta.lastUpdated) || ''; if (d && sameTrip(getActiveTrip(), d) && fl > lo && (await window.rtAsk('Die Datei ist neuer als der Stand auf diesem Gerät. Datei laden und lokale Daten ersetzen?'))) { await installTripData(d); location.reload(); } else { await fsSync.write(trip); } });
      const createFile = () => run(async () => { await fsSync.pick(true, trip); await fsSync.activate(); setMsg('Datei angelegt und verbunden.'); });
      const exportNow = () => run(async () => { await downloadTripFile(normalizeTrip(trip), 'roadtrip-daten.json'); });
      return (
        <section data-readonly-allow className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Datendatei & Gerätemodus</h2>
          <p className="text-sm text-emerald-950">Programm und Reisedaten sind getrennt. Die Datei enthält Reisedaten <b>und Dokumente</b> und liegt zum Beispiel in Google Drive. Auf diesem Gerät wird eine Kopie zwischengespeichert.</p>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold">Dieses Gerät: {mode === 'readonly' ? 'Nur lesen' : '✏️ Planung (bearbeiten)'}</span>
            <button data-readonly-allow type="button" onClick={() => { setDeviceMode(mode === 'readonly' ? 'edit' : 'readonly'); location.reload(); }} className="min-h-[44px] px-4 rounded-xl border border-emerald-400 bg-white text-sm font-bold">{mode === 'readonly' ? 'Auf Bearbeiten umstellen' : 'Auf Nur lesen umstellen'}</button>
            <button data-readonly-allow type="button" onClick={exportNow} className="min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold">⬇ Daten + Dokumente als JSON speichern</button>
          </div>
          {mode !== 'readonly' && FS_SUPPORTED && (
            <div className="rounded-xl border border-emerald-300 bg-white p-3 space-y-2">
              <div className="text-sm font-bold">Verbindung mit Datei: {fs.status === 'none' ? 'nicht verbunden' : fs.status === 'connected' ? `✅ ${fs.name}` : `⏸ ${fs.name} (Zugriff bestätigen)`}</div>
              {fs.lastWrite && <div className="text-xs text-slate-600">Zuletzt gespeichert: {fs.lastWrite.toLocaleTimeString('de-DE')}</div>}
              {fs.error && <div className="text-xs text-rose-800">{fs.error}</div>}
              <div className="flex flex-wrap gap-2">
                {fs.status === 'needs-permission' && <button type="button" onClick={reactivate} className="min-h-[44px] px-4 rounded-xl bg-[#1F4E8C] text-white text-sm font-bold">Verbindung erneuern</button>}
                {fs.status === 'none' && <button type="button" onClick={createFile} className="min-h-[44px] px-4 rounded-xl bg-[#1F4E8C] text-white text-sm font-bold">Neue Datei für diese Reise anlegen</button>}
                {fs.status === 'connected' && <button type="button" onClick={() => run(() => fsSync.write(trip))} className="min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold">Jetzt speichern</button>}
                {fs.status !== 'none' && <button type="button" onClick={() => fsSync.disconnect()} className="min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-sm">Trennen</button>}
              </div>
              <p className="text-[11px] text-slate-500">Eine bestehende Datei verbindest du oben unter „Meine Reisen“. Nach dem Neustart des Browsers fragt Chrome einmal nach („Verbindung erneuern“).</p>
            </div>
          )}
          {!FS_SUPPORTED && <div data-readonly-allow className="rounded-xl border border-emerald-300 bg-white p-3 space-y-2">
            <div className="text-sm font-bold">Stand der Daten auf diesem Gerät: {trip.meta && trip.meta.lastUpdated ? new Date(trip.meta.lastUpdated).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'unbekannt'}</div>
            <p className="text-xs text-slate-600">Dieser Browser kann eine Datei nicht dauerhaft verbinden und nicht automatisch nachladen. Änderungen vom Laptop holst du hier mit einem Tipp: Datei aus Drive wählen (die neueste Version wird übernommen).</p>
            <label data-readonly-allow className="min-h-[44px] inline-flex items-center px-4 rounded-xl bg-[#1F4E8C] text-white text-sm font-bold cursor-pointer">Neueste Datei aus Drive laden<input data-readonly-allow type="file" accept=".json,application/json" className="hidden" onChange={(e) => run(async () => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return; const d = await readTripFile(f); const fl = (d.meta && d.meta.lastUpdated) || '', lo = (trip.meta && trip.meta.lastUpdated) || ''; if (sameTrip(getActiveTrip(), d) && fl && fl <= lo) { setMsg('Diese Datei ist nicht neuer als der Stand auf dem Gerät. Nichts geändert.'); return; } if (sameTrip(getActiveTrip(), d) && mode !== 'readonly' && !(await window.rtAsk('Lokale Daten durch die Datei ersetzen?'))) return; await loadTripFileAsActive(d); location.reload(); })} /></label>
          </div>}
          {msg && <div role="status" className="text-sm rounded-lg bg-white border border-emerald-300 p-2">{msg}</div>}
        </section>
      );
    }

    