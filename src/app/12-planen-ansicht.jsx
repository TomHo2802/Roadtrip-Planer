/* ===== v100: aufgeraeumte Ansicht "Planen" (umschaltbar: rt_ui_v1 = new | classic) ===== */
    const rtUiClassic = () => document.documentElement.getAttribute('data-ui') === 'classic';
    const rtChipCls = (classic, missing) => rtUiClassic() ? classic : (missing ? 'px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-500 font-semibold' : 'px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 font-semibold');
    function RtPlanTop({ trip, goTab, children }) {
      const S = rtPlanStats(trip), n = S.rows.length;
      const [open, setOpen] = useState(() => { try { const v = localStorage.getItem('rt_status_open_v1'); if (v === '1') return true; if (v === '0') return false; } catch (e) {} return n > 0 && S.hOk === 0 && S.rOk === 0; });
      const [tools, setTools] = useState(false);
      useEffect(() => { const f = () => setOpen(true); window.addEventListener('rt-status', f); return () => window.removeEventListener('rt-status', f); }, []);
      const tog = () => { const v = !open; setOpen(v); try { localStorage.setItem('rt_status_open_v1', v ? '1' : '0'); } catch (e) {} };
      if (!n) return <><RtPlanStatus trip={trip} goTab={goTab} /></>;
      const todo = S.rows.filter((r) => r.open > 0).length + (S.datesOk && S.nightsOk ? 0 : 1);
      const km = rtTripKm(trip), firstMiss = S.rows.find((r) => r.hotelNeed && !r.hotel), firstRoute = S.rows.find((r) => r.routeNeed && !r.route);
      const msg = !S.datesOk ? <><b>Reisezeitraum fehlt</b></> : firstMiss ? <><b>{firstMiss.to}</b> braucht noch ein Hotel{S.hN - S.hOk > 1 ? ` (und ${S.hN - S.hOk - 1} weitere)` : ''}</> : firstRoute ? <>Strecke nach <b>{firstRoute.to}</b> fehlt noch</> : !S.nightsOk ? <><b>Nächte und Zeitraum passen nicht zusammen</b></> : <>Hotels und Strecken sind vollständig</>;
      return (
        <div data-plan-top className="no-print space-y-3">
          <div className="rt2-stats">
            <div className="rt2-tile" data-stat="km"><span className="rt2-num">{km ? km.toLocaleString('de-DE') : '–'}</span><small>Kilometer</small></div>
            <div className="rt2-tile" data-stat="nights"><span className="rt2-num">{S.sum}</span><small>{S.sum === 1 ? 'Nacht' : 'Nächte'}</small></div>
            <div className="rt2-tile hidden lg:flex" data-stat="routes"><span className="rt2-num">{S.rOk}/{S.rN}</span><small>Strecken</small></div>
            <button type="button" data-readonly-allow data-status-toggle aria-expanded={open} aria-controls="rt-status-body" onClick={tog} className={`rt2-tile ${S.hOk < S.hN ? 'acc' : ''}`} data-stat="hotels"><span className="rt2-num">{S.hOk}/{S.hN}</span><small>Hotels {open ? '▴' : '▾'}</small></button>
          </div>
          <div className="rt2-bar">
            <span className="rt2-msg" data-status-line>{msg}</span>
            <span className="flex gap-2"><button type="button" data-readonly-allow data-status-more aria-expanded={open} aria-controls="rt-status-body" onClick={tog} className="v18-btn sm">Planungsstand {open ? '▴' : '▾'}</button><button type="button" data-readonly-allow data-tools-toggle aria-expanded={tools} aria-controls="rt-tools-body" onClick={() => setTools(!tools)} className="v18-btn sm v18-edit-only">Werkzeuge {tools ? '▴' : '▾'}</button></span>
          </div>
          {open && <div id="rt-status-body"><RtPlanStatus trip={trip} goTab={goTab} /></div>}
          <div id="rt-tools-body" data-plan-tools hidden={!tools} className="space-y-3">{children}</div>
        </div>
      );
    }
    const rtKmOf = (x) => { const m = /([\d.,]+)\s*km/i.exec(String(x || '')); if (!m) return 0; const t = m[1]; const n = /,\d{1,2}$/.test(t) ? parseFloat(t.replace(/\./g, '').replace(',', '.')) : parseFloat(t.replace(/[.,]/g, '')); return isFinite(n) ? n : 0; };
    const rtTripKm = (trip) => Math.round(((trip && trip.stages) || []).reduce((a, s) => a + rtKmOf((s.routeToHotel || {}).distanceKm), 0));
    const RT_WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], RT_MO = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const rtShortDate = (dr) => { const m = /(\d{1,2})\.(\d{1,2})\.(\d{4})?/.exec(String(dr || '')); if (!m) return ''; const y = m[3] || ((String(dr).match(/(\d{4})/) || [])[1]); if (!y) return `${+m[1]}. ${RT_MO[+m[2] - 1] || ''}`; const d = new Date(+y, +m[2] - 1, +m[1]); return `${RT_WD[d.getDay()]} ${+m[1]}. ${RT_MO[+m[2] - 1] || ''}`; };
    function RtStageRow({ stage, idx, count, today, onOpen, onBasics, onUp, onDown, onDelete }) {
      const n = Math.max(0, parseInt(stage.nights, 10) || 0), h = (stage.hotel || {}).name, rt = stage.routeToHotel || {}, km = rtKmOf(rt.distanceKm);
      const ret = idx === count - 1 && count > 1 && n === 0, same = String(stage.fromCity || '').trim().toLowerCase() === String(stage.toCity || '').trim().toLowerCase();
      const missH = n > 0 && !String(h || '').trim(), missR = !same && !String(rt.distanceKm || '').trim(), acts = (stage.localAttractions || []).length;
      const to = String(stage.toCity || '').trim() || `Ziel Etappe ${idx + 1}`;
      return (
        <div id={`stage-card-${stage.id}`} data-stage-row2={stage.id} className={`rt2-row ${missH || missR ? 'miss' : ''} ${today ? 'today today-stage' : ''}`}>
          <span className="rt2-rail" aria-hidden="true"><span className="rt2-badge">{idx + 1}</span></span>
          <div className="rt2-body">
            <button type="button" data-readonly-allow data-stage-open onClick={onOpen} className="rt2-open" aria-label={`Etappe ${idx + 1}: ${stage.fromCity || 'Start'} nach ${to} öffnen`}>
              <span className="rt2-top"><span className="rt2-name">{to}{today && <span className="rt2-tag">Heute</span>}</span><span className="rt2-date">{rtShortDate(stage.dateRange)}{stage.fromCity && !same ? ` · ab ${String(stage.fromCity).split(',')[0]}` : ''}</span></span>
              <span className="rt2-sub">
                {ret ? 'Rückreise, keine Übernachtung' : `${n} ${n === 1 ? 'Nacht' : 'Nächte'}`}
                {!ret && <> · {missH ? <span className="m" data-foot-chip="hotel" data-miss="1">Hotel fehlt</span> : <span data-foot-chip="hotel">{h}</span>}</>}
                {!same && <> · {missR ? <span className="m" data-foot-chip="way" data-miss="1">Strecke fehlt</span> : <span data-foot-chip="way">{km ? `${Math.round(km).toLocaleString('de-DE')} km` : String(rt.distanceKm)}</span>}</>}
                {acts > 0 && <> · <span data-foot-chip="do">{acts} {acts === 1 ? 'Aktion' : 'Aktionen'}</span></>}
              </span>
            </button>
            <span className="v18-edit-only"><RtStageMenu label={`Etappe ${idx + 1}`} upOff={idx === 0} downOff={idx === count - 1} onUp={onUp} onDown={onDown} onDelete={onDelete} onBasics={onBasics} /></span>
          </div>
        </div>
      );
    }
    function RtRouteMini({ trip, onOpen }) {
      const el = useRef(null), mapRef = useRef(null), grp = useRef(null), S = rtPlanStats(trip);
      const pts = ((trip && trip.stages) || []).map((s, i) => { const g = parseGps(s.toGps || '') || parseGps((s.hotel || {}).gps || ''); return g ? { g, i, id: s.id, name: s.toCity, miss: S.rows[i] && S.rows[i].open > 0 } : null; }).filter(Boolean);
      const sig = pts.map((p) => `${p.i}:${p.g.join(',')}:${p.miss ? 1 : 0}`).join('|');
      useEffect(() => {
        if (!window.L || !el.current || mapRef.current) return; const L = window.L;
        const map = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
        mapRef.current = map; grp.current = L.layerGroup().addTo(map); map.setView([28, -82], 5);
        return () => { try { map.remove(); } catch (e) {} mapRef.current = null; };
      }, []);
      useEffect(() => {
        const L = window.L, map = mapRef.current; if (!L || !map || !grp.current) return; grp.current.clearLayers();
        if (pts.length > 1) L.polyline(pts.map((p) => p.g), { color: getComputedStyle(document.documentElement).getPropertyValue('--u-acc').trim() || '#2457D6', weight: 3, opacity: 0.85 }).addTo(grp.current);
        pts.forEach((p) => L.marker(p.g, { title: p.name, icon: L.divIcon({ className: '', html: `<div class="mk2${p.miss ? ' miss' : ''}">${p.i + 1}</div>`, iconSize: [22, 22], iconAnchor: [11, 11] }) }).on('click', () => onOpen(p.id)).addTo(grp.current));
        if (pts.length) { try { map.fitBounds(window.L.latLngBounds(pts.map((p) => p.g)), { padding: [24, 24], maxZoom: 9 }); } catch (e) {} }
        setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 120);
      }, [sig]);
      return (
        <div className="rt2-card" data-route-mini>
          <div ref={el} className="rt2-map" role="img" aria-label="Karte der Etappen. Ein Klick auf einen Punkt öffnet die Etappe." />
          {pts.length < ((trip && trip.stages) || []).length && <p className="text-xs text-slate-600 m-0">{((trip && trip.stages) || []).length - pts.length} Etappen haben noch keine Koordinaten und fehlen auf der Karte.</p>}
          <button type="button" data-readonly-allow onClick={() => { const b = document.querySelector('[data-route-edit]'); if (b) b.click(); }} className="v18-btn v18-edit-only justify-center">Route auf der Karte bearbeiten</button>
        </div>
      );
    }
    function RtStageMenu({ onUp, onDown, onDelete, upOff, downOff, label, onBasics }) {
      const [open, setOpen] = useState(false); const box = useRef(null); const [pos, setPos] = useState(null);
      const toggle = () => { if (open) { setOpen(false); return; } const b = box.current && box.current.querySelector('[data-stage-more]'); if (b) { const q = b.getBoundingClientRect(); const mh = onBasics ? 196 : 150; const top = q.bottom + 4 + mh > window.innerHeight ? Math.max(8, q.top - 4 - mh) : q.bottom + 4; setPos({ top, left: Math.max(8, Math.min(q.right - 224, window.innerWidth - 232)) }); } setOpen(true); };
      useEffect(() => {
        if (!open) return; const sc = (e) => { if (e && e.target && e.target.closest && e.target.closest('[data-stage-menu]')) return; setOpen(false); }; window.addEventListener('scroll', sc, true); window.addEventListener('resize', sc); const out = (e) => { if (box.current && !box.current.contains(e.target) && !(e.target.closest && e.target.closest('[data-stage-menu]'))) setOpen(false); }; const key = (e) => { if (e.key === 'Escape') { setOpen(false); const b = box.current && box.current.querySelector('[data-stage-more]'); if (b) b.focus(); } };
        document.addEventListener('mousedown', out); document.addEventListener('keydown', key); return () => { window.removeEventListener('scroll', sc, true); window.removeEventListener('resize', sc); document.removeEventListener('mousedown', out); document.removeEventListener('keydown', key); };
      }, [open]);
      const it = 'w-full text-left min-h-[44px] px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent';
      return (
        <div ref={box} className="relative">
          <button type="button" data-stage-more aria-haspopup="menu" aria-expanded={open} aria-label={`Weitere Aktionen für ${label}`} title="Verschieben oder löschen" onClick={toggle} className="min-w-[44px] min-h-[44px] rounded-lg border border-slate-300 bg-white text-slate-800 text-lg font-bold leading-none hover:bg-slate-50">⋯</button>
          {open && ReactDOM.createPortal(<div role="menu" data-stage-menu style={{ position: 'fixed', top: pos ? pos.top : 0, left: pos ? pos.left : 0 }} className="z-[60] w-56 rounded-xl border border-slate-300 bg-white shadow-xl py-1">
            {onBasics && <button type="button" role="menuitem" data-stage-basics onClick={() => { setOpen(false); onBasics(); }} className={`${it} border-b border-slate-200`}>Grunddaten bearbeiten</button>}
            <button type="button" role="menuitem" data-stage-up disabled={upOff} onClick={() => { setOpen(false); onUp(); }} className={it}>Nach oben schieben</button>
            <button type="button" role="menuitem" data-stage-down disabled={downOff} onClick={() => { setOpen(false); onDown(); }} className={it}>Nach unten schieben</button>
            <button type="button" role="menuitem" data-stage-del onClick={() => { setOpen(false); onDelete(); }} className={`${it} text-rose-800 border-t border-slate-200`}>Etappe löschen …</button>
          </div>, document.body)}
        </div>
      );
    }
    function RtUiSwitch() {
      const cur = rtUiClassic() ? 'classic' : 'new';
      const set = (v) => { if (v === cur) return; try { localStorage.setItem('rt_ui_v1', v); } catch (e) {} location.reload(); };
      const b = (v, t) => <button type="button" data-readonly-allow data-ui-set={v} aria-pressed={cur === v} onClick={() => set(v)} className={`min-h-[44px] px-4 text-sm font-semibold ${cur === v ? 'bg-[#1F4E8C] text-white' : 'bg-white text-slate-900'}`}>{t}</button>;
      return (
        <div data-ui-switch className="rounded-xl border border-slate-300 bg-white p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-900 min-w-[220px] flex-1"><b>Ansicht „Planen“</b><br /><span className="text-slate-700">Aufgeräumt: Etappenliste oben, Planungsstand und Werkzeuge einklappbar, ein Menü je Etappe. Bisherig: alles wie vorher.</span></div>
          <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden" role="group" aria-label="Ansicht Planen">{b('new', 'Aufgeräumt')}{b('classic', 'Bisherig')}</div>
        </div>
      );
    }

    /* ===== v104: Etappenseite neu (A+C), direkt bearbeitbar, Wischen, Rückgängig ===== */
    const rtSpDate = (dr) => {
      const s = String(dr || ''); const a = [...s.matchAll(/(\d{1,2})\.(\d{1,2})\.(\d{4})?/g)]; if (!a.length) return s;
      const y = (a.find((m) => m[3]) || [])[3]; if (!y) return s;
      const one = (m, withMo) => { const yy = Number(m[3] || y), mo = Number(m[2]); const d = new Date(yy, mo - 1, Number(m[1])); return `${RT_WD[d.getDay()]} ${Number(m[1])}.${withMo ? ' ' + RT_MO[mo - 1] : ''}`; };
      if (a.length === 1) return one(a[0], true);
      const sameMo = a[0][2] === a[1][2]; return `${one(a[0], !sameMo)} – ${one(a[1], true)}`;
    };
    const rtGpsOk = (g) => !!parseGps(String(g || ''));
    const rtNum = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return Number.isFinite(n) ? n : 0; };

    // Rückgängig-Leiste: rtUndo(text, vorherigerStand)
    const rtUndo = (text, prev) => { try { window.dispatchEvent(new CustomEvent('rt-undo', { detail: { text, prev, t: Date.now() } })); } catch (e) {} };
    function RtUndoBar() {
      const [u, setU] = useState(null);
      useEffect(() => { const f = (e) => setU(e.detail); window.addEventListener('rt-undo', f); return () => window.removeEventListener('rt-undo', f); }, []);
      useEffect(() => { if (!u) return; const t = setTimeout(() => setU(null), 7000); return () => clearTimeout(t); }, [u]);
      if (!u) return null;
      return ReactDOM.createPortal(<div data-undo-bar role="status" className="sp3-undo"><span>{u.text}</span><button type="button" data-undo onClick={() => { const p = u.prev; setU(null); if (p && window.__rtSaveTrip) window.__rtSaveTrip(p, 'Wiederhergestellt'); }}>Rückgängig</button></div>, document.body);
    }

    // kleines Formularfeld (ungesteuert, wird beim Speichern ausgelesen)
    function SpF({ label, name, value, type, place, ph, rows, wide, opts }) {
      const id = useRef('spf-' + Math.random().toString(36).slice(2)).current;
      return (
        <label htmlFor={id} className={`sp3-f${wide ? ' wide' : ''}`}><span>{label}</span>
          {opts ? <select id={id} name={name} defaultValue={value == null ? '' : String(value)}>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
            : rows ? <textarea id={id} name={name} rows={rows} defaultValue={value || ''} placeholder={ph || ''} />
            : <input id={id} name={name} type={type === 'number' ? 'text' : (type || 'text')} inputMode={type === 'number' ? 'decimal' : undefined} defaultValue={value == null ? '' : String(value)} placeholder={ph || ''} data-place={place || undefined} autoComplete="off" />}
        </label>
      );
    }
    const spRead = (form) => { const o = {}; Array.from(form.elements).forEach((el) => { if (el.name) o[el.name] = el.value.trim(); }); return o; };
    function SpForm({ title, onSave, onCancel, onDelete, delLabel, extra, children }) {
      const ref = useRef(null);
      useEffect(() => { const f = ref.current && ref.current.querySelector('input,textarea,select'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }, []);
      return (
        <form ref={ref} data-sp-form className="sp3-form" onSubmit={(e) => { e.preventDefault(); onSave(spRead(e.currentTarget)); }} onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onCancel(); } }}>
          {title && <h3>{title}</h3>}
          <div className="sp3-grid">{children}</div>
          <div className="sp3-acts">
            <button type="submit" data-sp-save className="sp3-btn pri">Speichern</button>
            <button type="button" data-sp-cancel className="sp3-btn" onClick={onCancel}>Abbrechen</button>
            {extra}
            {onDelete && <button type="button" data-sp-del className="sp3-btn del" onClick={onDelete}>{delLabel || 'Löschen'}</button>}
          </div>
        </form>
      );
    }
    const SpMaps = ({ gps, address, name, label, big }) => (rtGpsOk(gps) || address) ? <a className={big ? 'sp3-btn' : 'sp3-btn sm'} href={getGoogleMapsUrl(gps, address, name)} target="_blank" rel="noopener noreferrer" data-sp-maps>{label || 'Karte'}</a> : null;

    // Wischen links/rechts zwischen Etappen
    const spSwipe = (onPrev, onNext) => {
      let x0 = null, y0 = 0, t0 = 0;
      return {
        onTouchStart: (e) => { const t = e.target; if (e.touches.length !== 1 || (t.closest && t.closest('input,textarea,select,.leaflet-container,[data-noswipe],[data-sp-form]'))) { x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now(); },
        onTouchEnd: (e) => { if (x0 == null) return; const t = e.changedTouches[0]; const dx = t.clientX - x0, dy = t.clientY - y0; x0 = null; if (Date.now() - t0 > 700 || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 2) return; if (dx > 0) onPrev && onPrev(); else onNext && onNext(); },
      };
    };

    function RtStagePage({ trip, stage, idx, tab, setTab, onBack, onOpen, save, openEditor, onDelete, onUp, onDown, assist, wayTools }) {
      const stages = trip.stages || []; const n = stages.length;
      const isRet = rtIsRet(stages, idx);
      const rt = stage.routeToHotel || {}, h = stage.hotel || null; const acts = stage.localAttractions || []; const stops = rt.stopsOnWay || [];
      const nights = Math.max(0, parseInt(stage.nights, 10) || 0);
      const tabNow = isRet ? 'way' : (tab === 'hotel' || tab === 'do' ? tab : 'way');
      const [edit, setEdit] = useState(null); // 'basics' | 'route' | 'hotel' | 'stop:<i>' | 'stop:new' | 'act:<i>' | 'act:new'
      const [openRow, setOpenRow] = useState(null);
      const [day, setDay] = useState(0);
      useEffect(() => { setEdit(null); setOpenRow(null); setDay(0); }, [stage.id]);
      useEffect(() => { setEdit(null); setOpenRow(null); }, [tabNow]);
      const hasHotel = !!(h && String(h.name || '').trim());
      const miss = !isRet && !hasHotel;
      const prev = idx > 0 ? stages[idx - 1] : null, next = idx < n - 1 ? stages[idx + 1] : null;
      const go = (s) => { if (s) { onOpen(s.id); try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) {} } };
      const sw = spSwipe(() => go(prev), () => go(next));
      const put = (patch, toast, undoText) => { const before = trip; const st = stages.map((s) => (s.id === stage.id ? { ...s, ...patch(s) } : s)); save({ ...trip, stages: st }, toast); if (undoText) rtUndo(undoText, before); };
      const openAssist = (k) => { window.__rtAssist = { stageId: stage.id, step: k }; try { window.dispatchEvent(new CustomEvent('rt-assist', { detail: { stageId: stage.id, step: k } })); } catch (e) {} setTimeout(() => { const el = document.querySelector(`[data-sp3-page] [data-section-assist="${k}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); };

      // --- Grunddaten
      const saveBasics = (v) => {
        const nn = Math.max(0, parseInt(v.nights, 10) || 0); const city = v.toCity || stage.toCity; const from = idx === 0 ? (v.fromCity || stage.fromCity) : stage.fromCity;
        const changedCity = city !== stage.toCity, changedFrom = from !== stage.fromCity;
        let st = stages.map((s, i) => (i === idx ? { ...s, toCity: city, fromCity: from, nights: nn } : s));
        const stale = []; if (changedCity || changedFrom) stale.push(idx); if (changedCity) stale.push(idx + 1);
        const m0 = trip.meta || {}; let meta = m0;
        const sumN = (a) => a.reduce((x, s) => x + Math.max(0, parseInt(s.nights, 10) || 0), 0);
        if (/^\d{4}-\d{2}-\d{2}$/.test(m0.startDate || '') && /^\d{4}-\d{2}-\d{2}$/.test(m0.endDate || '')) { const oe = isoAdd(m0.startDate, sumN(stages)), ne = isoAdd(m0.startDate, sumN(st)); if (m0.endDate === oe && ne !== oe) meta = { ...m0, endDate: ne }; }
        st = rtRechain(st, meta, idx === 0 ? from : (stages[0] || {}).fromCity, stale);
        const dm = (x) => `${x.slice(8, 10)}.${x.slice(5, 7)}.${x.slice(0, 4)}`;
        save({ ...trip, meta, stages: st }, meta !== m0 ? `Gespeichert. Reiseende jetzt ${dm(meta.endDate)}.` : (stale.length ? 'Gespeichert. Strecke bitte neu ermitteln.' : 'Gespeichert'));
        rtUndo('Grunddaten geändert', trip); setEdit(null);
      };
      // --- Strecke
      const saveRoute = (v) => { put((s) => ({ routeToHotel: { ...(s.routeToHotel || {}), distanceKm: v.distanceKm, duration: v.duration, routeDescription: v.routeDescription } }), 'Strecke gespeichert'); setEdit(null); };
      // --- Stopps
      const saveStop = (i, v) => { put((s) => { const L = [...((s.routeToHotel || {}).stopsOnWay || [])]; const o = { ...(i == null ? { id: `stop-${Date.now()}` } : L[i]), name: v.name, time: v.time, duration: v.duration, address: v.address, gps: v.gps, notes: v.notes, costEur: rtNum(v.costEur) }; if (i == null) L.push(o); else L[i] = o; return { routeToHotel: { ...(s.routeToHotel || {}), stopsOnWay: L } }; }, i == null ? `Stopp „${v.name}“ hinzugefügt` : 'Stopp gespeichert'); setEdit(null); };
      const delStop = (i) => { const nm = stops[i] && stops[i].name; put((s) => ({ routeToHotel: { ...(s.routeToHotel || {}), stopsOnWay: ((s.routeToHotel || {}).stopsOnWay || []).filter((_, k) => k !== i) } }), '', `Stopp „${nm || 'ohne Namen'}“ gelöscht`); setEdit(null); setOpenRow(null); };
      const moveStop = (i, d) => { const j = i + d; if (j < 0 || j >= stops.length) return; put((s) => { const L = [...((s.routeToHotel || {}).stopsOnWay || [])]; const t = L[i]; L[i] = L[j]; L[j] = t; return { routeToHotel: { ...(s.routeToHotel || {}), stopsOnWay: L } }; }, 'Reihenfolge geändert'); setOpenRow('stop:' + j); };
      // --- Hotel
      const hotelBase = () => ({ name: '', rating: '', address: '', gps: '', checkIn: '', checkOut: '', breakfast: '', parking: '', cancelUntil: '', priceOldEur: '', priceNewEur: '', priceUsd: '', prepaid: '', creditCard: '', paidBy: '', splitAmong: [], parkingGarageName: '', parkingGarageAddress: '', parkingGarageGps: '', remarks: '', chargeAnnounced: '', cardCharged: '' });
      const saveHotel = (v) => { put((s) => ({ hotel: { ...hotelBase(), ...(s.hotel || {}), name: v.name, address: v.address, gps: v.gps, checkIn: v.checkIn, checkOut: v.checkOut, priceNewEur: v.priceNewEur === '' ? '' : rtNum(v.priceNewEur), cancelUntil: v.cancelUntil, remarks: v.remarks } }), `Hotel „${v.name || 'ohne Namen'}“ gespeichert`); setEdit(null); };
      const toggleHotel = (k) => put((s) => ({ hotel: { ...(s.hotel || {}), [k]: isPositiveValue((s.hotel || {})[k]) ? 'nein' : 'ja' } }), '');
      const delHotel = () => { const nm = h && h.name; put(() => ({ hotel: null }), '', `Hotel „${nm || 'ohne Namen'}“ entfernt`); setEdit(null); };
      // --- Aktionen
      const nightsC = Math.max(1, nights);
      const actsD = acts.map((a, i) => ({ a, i, d: Math.min(nightsC, Math.max(1, a.day ? parseInt(a.day, 10) || 1 : (i % nightsC) + 1)) }));
      const shownActs = nightsC >= 2 && day > 0 ? actsD.filter((x) => x.d === day) : actsD;
      const saveAct = (i, v) => { put((s) => { const L = [...(s.localAttractions || [])]; const o = { ...(i == null ? { id: `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}` } : L[i]), name: v.name, category: v.category, day: v.day || '', time: v.time, priceEur: rtNum(v.priceEur), booked: v.booked, address: v.address, gps: v.gps, notes: v.notes }; if (i == null) L.push(o); else L[i] = o; return { localAttractions: L }; }, i == null ? `„${v.name}“ hinzugefügt` : 'Aktion gespeichert'); setEdit(null); };
      const delAct = (i) => { const nm = acts[i] && acts[i].name; put((s) => ({ localAttractions: (s.localAttractions || []).filter((_, k) => k !== i) }), '', `„${nm || 'Aktion'}“ gelöscht`); setEdit(null); setOpenRow(null); };

      const tabs = [['way', isRet ? 'Rückreise' : 'Weg', stops.length ? String(stops.length) : '']].concat(isRet ? [] : [['hotel', 'Hotel', hasHotel ? '' : '!'], ['do', 'Vor Ort', acts.length ? String(acts.length) : '']]);
      const km = spShort(rt.distanceKm), du = spShort(rt.duration);

      const stopForm = (i) => { const s = i == null ? {} : stops[i]; return (
        <SpForm title={i == null ? 'Stopp hinzufügen' : 'Stopp bearbeiten'} onSave={(v) => { if (!v.name) return; saveStop(i, v); }} onCancel={() => setEdit(null)} onDelete={i == null ? null : () => delStop(i)}>
          <SpF label="Name" name="name" value={s.name} wide />
          <SpF label="Adresse" name="address" value={s.address} place="addr" wide />
          <SpF label="GPS" name="gps" value={s.gps} ph="GPS-Koordinaten (z. B. 25.09, -80.44)" />
          <SpF label="Wann / Abschnitt" name="time" value={s.time} ph="z. B. nach 85 km" />
          <SpF label="Dauer" name="duration" value={s.duration} ph="z. B. ca. 1 Std." />
          <SpF label="Kosten €" name="costEur" value={s.costEur || ''} type="number" />
          <SpF label="Notiz" name="notes" value={s.notes} rows={3} wide />
        </SpForm>); };
      const actForm = (i) => { const a = i == null ? { day: day || '' } : acts[i]; return (
        <SpForm title={i == null ? 'Aktion hinzufügen' : 'Aktion bearbeiten'} onSave={(v) => { if (!v.name) return; saveAct(i, v); }} onCancel={() => setEdit(null)} onDelete={i == null ? null : () => delAct(i)}>
          <SpF label="Name" name="name" value={a.name} wide />
          <SpF label="Kategorie" name="category" value={a.category} ph="z. B. Museum, Strand" />
          {nightsC >= 2 ? <SpF label="Tag" name="day" value={a.day || ''} opts={[['', 'automatisch']].concat(Array.from({ length: nightsC }, (_, k) => [String(k + 1), `Tag ${k + 1}`]))} /> : <input type="hidden" name="day" value="" />}
          <SpF label="Uhrzeit" name="time" value={a.time} ph="z. B. 10:00 oder Vormittag" />
          <SpF label="Preis €" name="priceEur" value={a.priceEur || ''} type="number" />
          <SpF label="Gebucht" name="booked" value={a.booked} ph="z. B. ja, Vor Ort, Code" />
          <SpF label="Adresse" name="address" value={a.address} place="addr" wide />
          <SpF label="GPS" name="gps" value={a.gps} ph="GPS-Koordinaten (z. B. 25.09, -80.44)" />
          <SpF label="Notiz" name="notes" value={a.notes} rows={3} wide />
        </SpForm>); };

      return (
        <div data-sp3-page id={`stage-card-${stage.id}`} className="sp3" {...sw}>
          <header data-stage-pagebar className="sp3-head no-print">
            <div className="sp3-top">
              <button type="button" data-readonly-allow data-stage-back onClick={onBack} className="sp3-back"><span aria-hidden="true">‹</span> Alle Etappen</button>
              <div className="sp3-navb">
                <button type="button" data-readonly-allow data-stage-prev disabled={!prev} onClick={() => go(prev)} aria-label="Vorige Etappe" className="sp3-round">‹</button>
                <button type="button" data-readonly-allow data-stage-next disabled={!next} onClick={() => go(next)} aria-label="Nächste Etappe" className="sp3-round">›</button>
                <span className="v18-edit-only"><RtStageMenu label={`Etappe ${idx + 1}`} upOff={idx === 0} downOff={idx === n - 1} onUp={onUp} onDown={onDown} onDelete={onDelete} onBasics={() => setEdit('basics')} /></span>
              </div>
            </div>
            <div className="sp3-title">
              <span className={`sp3-num${miss ? ' miss' : ''}`} aria-label={`Etappe ${idx + 1} von ${n}`}>{idx + 1}</span>
              <div className="sp3-tt">
                <h1>{stage.fromCity || 'Start'} <span aria-hidden="true">→</span> {stage.toCity || `Ziel ${idx + 1}`}</h1>
                <span className="sp3-sub">{rtSpDate(stage.dateRange)}{isRet ? ' · Rückreise' : ` · ${nights} ${nights === 1 ? 'Nacht' : 'Nächte'}`} · Etappe {idx + 1} von {n}</span>
              </div>
              {edit !== 'basics' && <button type="button" data-sp-basics className="sp3-link v18-edit-only" onClick={() => setEdit('basics')}>Bearbeiten</button>}
            </div>
            {edit === 'basics' && (
              <SpForm title="Grunddaten" onSave={saveBasics} onCancel={() => setEdit(null)} extra={<button type="button" className="sp3-btn" onClick={() => { setEdit(null); openEditor(stage, 'basics'); }}>Alle Felder …</button>}>
                {idx === 0 && <SpF label="Start" name="fromCity" value={stage.fromCity} place="city" wide />}
                <SpF label="Ziel" name="toCity" value={stage.toCity} place="city" wide />
                <SpF label="Nächte" name="nights" value={nights} type="number" />
                <p className="sp3-hint wide">Die Daten ergeben sich aus dem Reisebeginn und den Nächten der Etappen davor. Folgende Etappen rücken automatisch nach.</p>
              </SpForm>
            )}
            <div role="tablist" aria-label="Teil der Etappe" className="sp3-seg" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
              {tabs.map(([k, l, c]) => <button key={k} type="button" role="tab" data-readonly-allow data-stage-tab={k} aria-selected={tabNow === k} onClick={() => setTab(k)}>{l}{c === '!' ? <span className="sp3-dot" aria-label="fehlt noch" /> : c ? <span className="sp3-cnt">{c}</span> : null}</button>)}
            </div>
          </header>

          {tabNow === 'way' && <div data-sp-tab="way" className="sp3-body">
            <section aria-label="Strecke" className="sp3-card">
              {edit === 'route' ? (
                <SpForm title="Strecke" onSave={saveRoute} onCancel={() => setEdit(null)}>
                  <SpF label="Entfernung" name="distanceKm" value={rt.distanceKm} ph="z. B. 159 km" />
                  <SpF label="Fahrzeit" name="duration" value={rt.duration} ph="z. B. 2,5 h" />
                  <SpF label="Beschreibung" name="routeDescription" value={rt.routeDescription} rows={3} wide />
                </SpForm>
              ) : <>
                <div className="sp3-line">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="sp3-acc"><path d="M4 19c4-2 4-12 8-12s4 10 8 12" /></svg>
                  <span className="sp3-grow"><b className="sp3-big">{[km, du].filter(Boolean).join(' · ') || 'Strecke noch offen'}</b><span className="sp3-mute">{stage.fromCity} → {stage.toCity}{stops.length ? ` · ${stops.length} ${stops.length === 1 ? 'Stopp' : 'Stopps'}` : ' · direkt'}</span></span>
                  <button type="button" data-sp-edit-route className="sp3-link v18-edit-only" onClick={() => setEdit('route')}>Bearbeiten</button>
                </div>
                {rt.routeDescription && <SpMore text={rt.routeDescription} />}
              </>}
            </section>
            {wayTools}
            <h2 className="sp3-h">Stopps auf dem Weg</h2>
            <section aria-label="Stopps auf dem Weg" className="sp3-card list">
              {!stops.length && edit !== 'stop:new' && <p className="sp3-empty">Noch keine Stopps. Direktfahrt zum {isRet ? 'Ziel' : 'Hotel'}.</p>}
              {stops.map((s, i) => edit === 'stop:' + i ? <div key={s.id || i} className="sp3-in">{stopForm(i)}</div> : (
                <SpRow key={s.id || i} k={'stop:' + i} open={openRow === 'stop:' + i} setOpen={setOpenRow} lead={String(i + 1)} title={s.name || `Stopp ${i + 1}`} sub={[s.time, s.duration, rtNum(s.costEur) > 0 ? formatEur(s.costEur) : ''].filter(Boolean).join(' · ')}>
                  {s.notes && <p className="sp3-note">{s.notes}</p>}
                  {s.address && <p className="sp3-mute">{s.address}</p>}
                  <div className="sp3-acts">
                    <SpMaps gps={s.gps} address={s.address} name={s.name} />
                    <button type="button" className="sp3-btn sm v18-edit-only" data-sp-edit onClick={() => setEdit('stop:' + i)}>Bearbeiten</button>
                    <button type="button" className="sp3-btn sm v18-edit-only" aria-label="Stopp nach oben" disabled={i === 0} onClick={() => moveStop(i, -1)}>↑</button>
                    <button type="button" className="sp3-btn sm v18-edit-only" aria-label="Stopp nach unten" disabled={i === stops.length - 1} onClick={() => moveStop(i, 1)}>↓</button>
                    <button type="button" className="sp3-btn sm del v18-edit-only" data-sp-del-row onClick={() => delStop(i)}>Löschen</button>
                  </div>
                </SpRow>))}
              {edit === 'stop:new' ? <div className="sp3-in">{stopForm(null)}</div> : <div className="sp3-addrow v18-edit-only"><button type="button" data-sp-add-stop className="sp3-btn" onClick={() => setEdit('stop:new')}>+ Stopp</button></div>}
            </section>
            {assist('way')}
          </div>}

          {tabNow === 'hotel' && <div data-sp-tab="hotel" className="sp3-body">
            {edit === 'hotel' ? (
              <section aria-label="Hotel bearbeiten" className="sp3-card">
                <SpForm title={hasHotel ? 'Hotel bearbeiten' : 'Hotel eintragen'} onSave={saveHotel} onCancel={() => setEdit(null)} onDelete={h ? delHotel : null} delLabel="Hotel entfernen" extra={<button type="button" className="sp3-btn" onClick={() => { setEdit(null); openEditor(stage, 'hotel'); }}>Alle Felder …</button>}>
                  <SpF label="Name" name="name" value={h && h.name} wide />
                  <SpF label="Adresse" name="address" value={h && h.address} place="addr" wide />
                  <SpF label="GPS" name="gps" value={h && h.gps} ph="GPS-Koordinaten (z. B. 25.09, -80.44)" />
                  <SpF label="Preis € (gesamt)" name="priceNewEur" value={h && h.priceNewEur} type="number" />
                  <SpF label="Check-in" name="checkIn" value={h && h.checkIn} ph="z. B. 15 Uhr" />
                  <SpF label="Check-out" name="checkOut" value={h && h.checkOut} ph="z. B. 11 Uhr" />
                  <SpF label="Kostenlos stornierbar bis" name="cancelUntil" value={h && h.cancelUntil} ph="TT.MM.JJJJ" />
                  <SpF label="Bemerkungen" name="remarks" value={h && h.remarks} rows={3} wide />
                  <p className="sp3-hint wide">Mit Preis gilt das Hotel als gebucht. Kreditkarte, Parkhaus und weitere Preise unter „Alle Felder“.</p>
                </SpForm>
              </section>
            ) : hasHotel ? (
              <section aria-label="Hotel" className="sp3-card">
                <div className="sp3-line top">
                  <span className="sp3-grow"><h2 className="sp3-h2">{h.name}</h2>{h.address && <span className="sp3-mute">{h.address}</span>}</span>
                  {rtBooked('hotel', h) ? <span className="sp3-chip ok">gebucht</span> : <span className="sp3-chip miss">nicht gebucht</span>}
                </div>
                <dl className="sp3-dl">
                  {(h.checkIn || h.checkOut) && <div><dt>Check-in / -out</dt><dd>{[h.checkIn, h.checkOut].filter(Boolean).join(' / ')}</dd></div>}
                  {rtNum(h.priceNewEur) > 0 && <div><dt>Preis</dt><dd>{formatEur(h.priceNewEur)}{h.priceUsd ? ` · $${h.priceUsd}` : ''}</dd></div>}
                  {h.cancelUntil && <div><dt>Storno bis</dt><dd>{h.cancelUntil}</dd></div>}
                  {h.creditCard && <div><dt>Karte</dt><dd><RtCardChip name={h.creditCard} cards={trip.creditCards} /></dd></div>}
                  {h.parkingGarageName && <div><dt>Parken</dt><dd>{h.parkingGarageName}</dd></div>}
                </dl>
                <div className="sp3-tog" role="group" aria-label="Leistungen">
                  {[['breakfast', 'Frühstück'], ['parking', 'Parkplatz'], ['prepaid', 'Vorab bezahlt']].map(([k, l]) => <button key={k} type="button" data-hotel-toggle={k} aria-pressed={isPositiveValue(h[k])} className="v18-edit-only" onClick={() => toggleHotel(k)}>{isPositiveValue(h[k]) ? '✓ ' : ''}{l}</button>)}
                </div>
                {h.remarks && <SpMore text={h.remarks} />}
                <div className="sp3-acts">
                  <SpMaps gps={h.gps} address={h.address} name={h.name} label="Navigation" big />
                  <button type="button" data-sp-edit-hotel className="sp3-btn v18-edit-only" onClick={() => setEdit('hotel')}>Bearbeiten</button>
                </div>
              </section>
            ) : (
              <section aria-label="Hotel" className="sp3-card">
                <div className="sp3-line"><h2 className="sp3-h2 sp3-grow">Hotel</h2><span className="sp3-chip miss">fehlt noch</span></div>
                <p className="sp3-txt">Für {nights === 1 ? 'die Nacht' : `die ${nights} Nächte`} ab {rtSpDate(stage.dateRange).split(' – ')[0]} ist noch keine Unterkunft eingetragen.</p>
                <div className="sp3-acts v18-edit-only">
                  <button type="button" data-sp-hotel-find className="sp3-btn pri grow" onClick={() => openAssist('hotel')}>Hotels in der Nähe zeigen</button>
                  <button type="button" data-sp-edit-hotel className="sp3-btn soft" onClick={() => setEdit('hotel')}>Eintragen</button>
                </div>
              </section>
            )}
            {assist('hotel')}
          </div>}

          {tabNow === 'do' && <div data-sp-tab="do" className="sp3-body">
            {nightsC >= 2 && <div className="sp3-days" role="group" aria-label="Tag wählen">{[0].concat(Array.from({ length: nightsC }, (_, k) => k + 1)).map((d) => <button key={d} type="button" aria-pressed={day === d} onClick={() => setDay(d)}>{d === 0 ? 'Alle Tage' : `Tag ${d}`}</button>)}</div>}
            <section aria-label="Aktionen vor Ort" className="sp3-card list">
              {!shownActs.length && edit !== 'act:new' && <p className="sp3-empty">{acts.length ? 'An diesem Tag ist nichts geplant.' : `Noch keine Aktionen in ${stage.toCity || 'diesem Ort'}.`}</p>}
              {shownActs.map(({ a, i, d }) => edit === 'act:' + i ? <div key={a.id || i} className="sp3-in">{actForm(i)}</div> : (
                <SpRow key={a.id || i} k={'act:' + i} open={openRow === 'act:' + i} setOpen={setOpenRow} lead={/^\d{1,2}:\d{2}/.test(String(a.time || '')) ? String(a.time).slice(0, 5) : String(i + 1)} title={a.name || 'Aktion'} sub={[nightsC >= 2 ? `Tag ${d}` : '', /^\d{1,2}:\d{2}/.test(String(a.time || '')) ? '' : a.time, a.category, a.booked, rtNum(a.priceEur) > 0 ? formatEur(a.priceEur) : ''].filter(Boolean).join(' · ')}>
                                    {a.notes && <p className="sp3-note">{a.notes}</p>}
                  {a.address && <p className="sp3-mute">{a.address}</p>}
                  <div className="sp3-acts">
                    <SpMaps gps={a.gps} address={a.address} name={a.name} />
                    <button type="button" className="sp3-btn sm v18-edit-only" data-sp-edit onClick={() => setEdit('act:' + i)}>Bearbeiten</button>
                    <button type="button" className="sp3-btn sm del v18-edit-only" data-sp-del-row onClick={() => delAct(i)}>Löschen</button>
                  </div>
                </SpRow>))}
              {edit === 'act:new' ? <div className="sp3-in">{actForm(null)}</div> : <div className="sp3-addrow v18-edit-only"><button type="button" data-sp-add-act className="sp3-btn" onClick={() => setEdit('act:new')}>+ Aktion</button></div>}
            </section>
            {assist('do')}
          </div>}
          <p className="sp3-swipe-hint" aria-hidden="true">Tipp: zur vorigen oder nächsten Etappe wischen</p>
        </div>
      );
    }
    function SpRow({ k, open, setOpen, lead, title, sub, children }) {
      return (
        <div className={`sp3-row${open ? ' open' : ''}`} data-sp-row>
          <button type="button" data-readonly-allow className="sp3-rowbtn" aria-expanded={open} onClick={() => setOpen(open ? null : k)}>
            <span className="sp3-lead">{lead}</span>
            <span className="sp3-grow"><span className="sp3-rt">{title}</span>{sub && <span className="sp3-mute">{sub}</span>}</span>
            <span className="sp3-chev" aria-hidden="true">›</span>
          </button>
          {open && <div className="sp3-rowbody">{children}</div>}
        </div>
      );
    }
    function SpMore({ text }) {
      const [o, setO] = useState(false); const long = String(text || '').length > 160;
      return <div className="sp3-more"><p className={o || !long ? '' : 'clamp'}>{text}</p>{long && <button type="button" data-readonly-allow className="sp3-link" onClick={() => setO(!o)}>{o ? 'weniger' : 'mehr lesen'}</button>}</div>;
    }

    