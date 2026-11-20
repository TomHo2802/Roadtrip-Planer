// ===== v47: Etappe als eigene Seite =====
    const SP_TABS = { way: 'bg-amber-700 border-amber-700', hotel: 'bg-blue-700 border-blue-700', do: 'bg-emerald-700 border-emerald-700', all: 'bg-slate-800 border-slate-800' };
    const spShort = (v) => String(v || '').replace(/\s*\(.*$/, '').trim();

    function StageSectionAssist({ kind, trip, stage, index, onAddStop, onSetHotel, onAddLocal }) {
      const [open, setOpen] = useState(() => { const q = window.__rtAssist; if (q && q.stageId === stage.id && q.step === kind) { window.__rtAssist = null; return true; } return false; });
      useEffect(() => { const f = (e) => { if (e.detail && e.detail.stageId === stage.id && e.detail.step === kind) { window.__rtAssist = null; setOpen(true); } }; window.addEventListener('rt-assist', f); return () => window.removeEventListener('rt-assist', f); }, [stage.id, kind]);
      const label = { way: 'Ziele entlang der Strecke vorschlagen', hotel: 'Hotels suchen und vergleichen', do: 'Unternehmungen in der Umgebung vorschlagen' }[kind];
      return (
        <div data-section-assist={kind} className="v18-edit-only no-print px-3 sm:px-4 py-2.5 bg-[#F5F8FC] border-b border-slate-200">
          <button type="button" data-readonly-allow data-assist={kind} aria-pressed={open} onClick={() => setOpen(!open)} className={`min-h-[40px] px-4 rounded-full border text-sm font-semibold ${open ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300 text-slate-900 hover:border-[#1F4E8C]'}`}>{open ? 'Vorschläge schließen ▴' : `${label} ▾`}</button>
          {open && <div data-assist-panel className="mt-3">
            {kind === 'way' && <StageWayPanel trip={trip} stage={stage} index={index} onAddStop={onAddStop} />}
            {kind === 'hotel' && <StageHotelPanel trip={trip} stage={stage} index={index} onSetHotel={onSetHotel} />}
            {kind === 'do' && <StageDoPanel trip={trip} stage={stage} index={index} onAddLocal={onAddLocal} />}
          </div>}
        </div>
      );
    }

    function StageListFoot({ stage, onOpen, ret }) {
      const rt = stage.routeToHotel || {}, h = stage.hotel || {}; const n = (stage.localAttractions || []).length; const km = spShort(rt.distanceKm), du = spShort(rt.duration);
      return (
        <div data-stage-foot className="px-4 py-3 flex flex-wrap items-center gap-2 text-xs">
          <span data-foot-chip="way" className={rtChipCls('px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 font-semibold', !(km || du) && !(String(stage.fromCity || '').trim().toLowerCase() === String(stage.toCity || '').trim().toLowerCase()))}>① Weg: {km || du ? [km, du].filter(Boolean).join(' · ') : 'offen'}</span>
          {ret ? <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 border border-slate-300 font-semibold">Rückreise · ohne Übernachtung</span> : <><span data-foot-chip="hotel" className={rtChipCls('px-2.5 py-1 rounded-full bg-blue-100 text-blue-950 border border-blue-300 font-semibold', !h.name && (parseInt(stage.nights, 10) || 0) > 0)}>② Hotel: {h.name || 'offen'}</span>
          <span data-foot-chip="do" className={rtChipCls('px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 font-semibold', false)}>③ Vor Ort: {n ? `${n} Aktion${n === 1 ? '' : 'en'}` : 'offen'}</span></>}
          <button type="button" data-readonly-allow data-stage-open onClick={onOpen} className="ml-auto v18-btn pri">Etappe öffnen →</button>
        </div>
      );
    }

    function StagePageBar({ stages, openId, tab, setTab, onBack, onOpen }) {
      const i = stages.findIndex((s) => s.id === openId); if (i < 0) return null;
      const s = stages[i]; const rt = s.routeToHotel || {}, h = s.hotel || {}; const n = (s.localAttractions || []).length; const km = spShort(rt.distanceKm), du = spShort(rt.duration);
      const nights = Math.max(1, parseInt(s.nights, 10) || 1);
      const isRet = rtIsRet(stages, i); useEffect(() => { if (isRet && (tab === 'hotel' || tab === 'do')) setTab('way'); }, [isRet, tab]);
      const tabs = [['way', isRet ? '① Rückreise' : '① Weg', [km, du].filter(Boolean).join(' · ') || 'offen'], ...(isRet ? [] : [['hotel', '② Hotel', h.name || 'offen'], ['do', '③ Vor Ort', n ? `${n} Aktion${n === 1 ? '' : 'en'}` : 'offen']]), ['all', 'Alles', 'alle Abschnitte']];
      return (
        <div data-stage-pagebar className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 space-y-3 no-print">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" data-readonly-allow data-stage-back onClick={onBack} className="v18-btn sm">← Alle Etappen</button>
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs font-semibold text-slate-600">Etappe {i + 1} von {stages.length}</div>
              <div className="text-base sm:text-lg font-bold text-slate-900 break-words">{s.fromCity} → {s.toCity || `Ziel ${i + 1}`}</div>
              <div className="text-xs text-slate-600">{s.dateRange} · {nights} {nights === 1 ? 'Nacht' : 'Nächte'}</div>
            </div>
            <div className="flex gap-1.5">
              <button type="button" data-readonly-allow data-stage-prev disabled={i === 0} onClick={() => onOpen(stages[i - 1].id)} className="v18-btn sm disabled:opacity-40">‹ Vorherige</button>
              <button type="button" data-readonly-allow data-stage-next disabled={i === stages.length - 1} onClick={() => onOpen(stages[i + 1].id)} className="v18-btn sm disabled:opacity-40">Nächste ›</button>
            </div>
          </div>
          <div role="tablist" aria-label="Abschnitt der Etappe" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tabs.map(([k, l, st]) => (
              <button key={k} type="button" role="tab" data-readonly-allow data-stage-tab={k} aria-selected={tab === k} onClick={() => setTab(k)} className={`min-h-[56px] px-3 py-2 rounded-xl border text-left ${tab === k ? SP_TABS[k] + ' text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
                <div className="text-sm font-bold">{l}</div><div className={`text-xs break-words ${tab === k ? 'text-white' : 'text-slate-600'}`}>{st}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ===== v48: An- und Rückreise (Reisedauer, Zeitverschiebung) =====
    const HL_HOME_TZ = 'Europe/Berlin';
    const hlOffset = (tz, ms) => { try { const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(ms)); const g = (t) => Number(p.find((x) => x.type === t).value); return (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - ms) / 60000; } catch (e) { return 0; } };
    const hlLocalToUtc = (y, m, d, hh, mm, tz) => { const base = Date.UTC(y, m - 1, d, hh, mm); let ms = base - hlOffset(tz, base) * 60000; ms = base - hlOffset(tz, ms) * 60000; return ms; };
    const hlParseFlight = (f) => {
      const dm = String(f.departureDate || '').match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/); const tm = (s) => { const m = String(s || '').match(/(\d{1,2}):(\d{2})/); return m ? [Number(m[1]), Number(m[2])] : null; };
      const dt = tm(f.departureTime), at = tm(f.arrivalTime); const plus = (String(f.arrivalTime || '').match(/\(\+(\d)\)/) || [0, 0])[1];
      if (!dm || !dt || !at) return null; return { y: Number(dm[3]), m: Number(dm[2]), d: Number(dm[1]), dt, at, plus: Number(plus) };
    };
    const hlHM = (min) => { const m = Math.round(Math.abs(min)); return `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, '0')} min` : ''}`; };
    const hlDM = (y, m, d) => `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.`;

    function HomeLegCard({ kind, trip, stage, onSave }) {
      const out = kind === 'out'; const meta = trip.meta || {}; const homeTz = meta.homeTz || HL_HOME_TZ;
      const outF = (trip.flights || []).find((f) => /^hin/i.test(f.direction || '')); const home = meta.startLocation || (outF && String(outF.from || '').replace(/^[A-Z]{3}\s*\(([^)]*)\).*$/, '$1').trim()) || 'Heimatort'; const loc = stageLoc(stage) || [...(trip.stages || [])].reverse().map(stageLoc).find(Boolean); const destTz = loc ? tzFor(loc[0], loc[1]) : homeTz;
      const all = trip.flights || []; const isOut = (f) => /^hin/i.test(f.direction || ''); const isBack = (f) => /^r(ü|ue)ck/i.test(f.direction || '');
      const flights = all.filter(out ? isOut : isBack).slice().sort((a, b) => { const A = hlParseFlight(a), B = hlParseFlight(b); return A && B ? (Date.UTC(A.y, A.m - 1, A.d, ...A.dt) - Date.UTC(B.y, B.m - 1, B.d, ...B.dt)) : 0; });
      const first = flights.length ? hlParseFlight(flights[0]) : null; const lastF = flights.length ? hlParseFlight(flights[flights.length - 1]) : null;
      let dur = null, arrLocal = null, ref = null;
      const tzFrom = out ? homeTz : destTz, tzTo = out ? destTz : homeTz;
      if (first && lastF) {
        const dep = hlLocalToUtc(first.y, first.m, first.d, first.dt[0], first.dt[1], tzFrom);
        const arrBase = Date.UTC(lastF.y, lastF.m - 1, lastF.d + lastF.plus);
        const ad = new Date(arrBase); const arr = hlLocalToUtc(ad.getUTCFullYear(), ad.getUTCMonth() + 1, ad.getUTCDate(), lastF.at[0], lastF.at[1], tzTo);
        dur = (arr - dep) / 60000; arrLocal = { d: ad, t: lastF.at }; ref = dep;
      }
      const refMs = ref != null ? ref : (() => { const s = out ? meta.startDate : meta.endDate; return /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? Date.parse(s + 'T12:00:00Z') : Date.now(); })();
      const diff = hlOffset(destTz, refMs) - hlOffset(homeTz, refMs);
      const sign = diff > 0 ? '+' : diff < 0 ? '−' : '±';
      const homeShort = String(home).replace(/\s*\(.*$/, '').trim() || home; const diffTxt = diff === 0 ? 'keine Zeitverschiebung' : `${sign}${hlHM(diff)} gegenüber ${homeShort}`;
      const hint = diff === 0 ? '' : out ? (diff < 0 ? `Nach der Landung die Uhr ${hlHM(diff)} zurückstellen.` : `Nach der Landung die Uhr ${hlHM(diff)} vorstellen.`) : (diff < 0 ? `Zu Hause die Uhr ${hlHM(diff)} vorstellen.` : `Zu Hause die Uhr ${hlHM(diff)} zurückstellen.`);
      const ov = (stage.homeLeg && stage.homeLeg[kind]) || {}; const [vals, setVals] = useState({ dur: ov.duration || '', tz: ov.tz || '', note: ov.note || '' });
      const save = () => { const cur = (stage.homeLeg && stage.homeLeg[kind]) || {}; if ((cur.duration || '') === vals.dur && (cur.tz || '') === vals.tz && (cur.note || '') === vals.note) return; onSave({ ...trip, stages: (trip.stages || []).map((s) => (s.id === stage.id ? { ...s, homeLeg: { ...(s.homeLeg || {}), [kind]: { duration: vals.dur, tz: vals.tz, note: vals.note } } } : s)) }, ''); };
      const sel = out ? `${home} → ${stage.fromCity && stage.fromCity !== home ? stage.fromCity : (stage.toCity || '')}` : `${(meta.endLocation || stage.toCity || 'Ziel')} → ${home}`;
      return (
        <div data-homeleg={kind} className="m-3 sm:m-4 rounded-xl border border-slate-300 bg-white p-3 sm:p-4 space-y-2">
          <div className="text-sm font-bold text-slate-900">{flights.length ? <Ic n="plane" /> : <Ic n="car" />}{out ? 'Anreise' : 'Rückreise'} · {sel}</div>
          
          <ul className="space-y-1">
            {flights.map((f) => <li key={f.id} className="text-sm text-slate-900 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">{[f.flightNumber, [String(f.from || '').split(' ')[0], String(f.to || '').split(' ')[0]].join(' → ')].filter(Boolean).join(' · ')} · {String(f.departureDate || '').slice(0, 6)} {String(f.departureTime || '').replace(' Uhr', '')} → {String(f.arrivalTime || '').replace(' Uhr', '')}</li>)}
          </ul>
          {(trip.rentalCars || []).filter(rtCarFilled).filter((c) => (out ? (c.pickupLocation || c.pickupDate) : (c.dropoffLocation || c.dropoffDate))).map((c) => <div key={c.id} data-homeleg-car className="text-sm text-slate-900 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"><Ic n="car" />{out ? 'Mietwagen abholen' : 'Mietwagen zurückgeben'}: <b>{c.provider || 'Mietwagen'}</b>{' · ' + (out ? [c.pickupLocation, [c.pickupDate, c.pickupTime].filter(Boolean).join(' ')] : [c.dropoffLocation, [c.dropoffDate, c.dropoffTime].filter(Boolean).join(' ')]).filter(Boolean).join(' · ')}</div>)}
          {flights.length > 0 && <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div data-homeleg-dur className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-xs font-semibold text-slate-600">Reisedauer (Flug inkl. Umstieg)</div><div className="font-bold text-slate-900">{ov.duration || (dur != null ? `ca. ${hlHM(dur)}` : 'noch unbekannt')}</div></div>
            <div data-homeleg-tz className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-xs font-semibold text-slate-600">Zeitverschiebung</div><div className="font-bold text-slate-900">{ov.tz || diffTxt}</div>{!ov.tz && hint && <div className="text-xs text-slate-700">{hint}</div>}</div>
          </div>
          {arrLocal && <div data-homeleg-arr className="text-sm text-slate-900">{out ? `Ankunft in ${stage.fromCity === home ? (stage.toCity || 'Ziel') : (stage.toCity || 'Ziel')}` : `Ankunft in ${home}`}: <b>{hlDM(arrLocal.d.getUTCFullYear(), arrLocal.d.getUTCMonth() + 1, arrLocal.d.getUTCDate())} um {String(arrLocal.t[0]).padStart(2, '0')}:{String(arrLocal.t[1]).padStart(2, '0')} Uhr Ortszeit</b></div>}
          <details className="text-sm"><summary className="cursor-pointer font-semibold text-slate-800">Angaben anpassen</summary>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="block text-xs font-semibold text-slate-800">Reisedauer<input data-homeleg-in="dur" type="text" value={vals.dur} onChange={(e) => setVals({ ...vals, dur: e.target.value })} onBlur={save} placeholder={dur != null ? `ca. ${hlHM(dur)}` : 'z. B. 11 h 20 min'} className="mt-1 w-full h-10 px-2 rounded-lg border border-slate-300 bg-white text-slate-900" /></label>
              <label className="block text-xs font-semibold text-slate-800">Zeitverschiebung<input data-homeleg-in="tz" type="text" value={vals.tz} onChange={(e) => setVals({ ...vals, tz: e.target.value })} onBlur={save} placeholder={diffTxt} className="mt-1 w-full h-10 px-2 rounded-lg border border-slate-300 bg-white text-slate-900" /></label>
              <label className="block text-xs font-semibold text-slate-800">Notiz<input data-homeleg-in="note" type="text" value={vals.note} onChange={(e) => setVals({ ...vals, note: e.target.value })} onBlur={save} placeholder="z. B. Check-in 3 Std. vorher" className="mt-1 w-full h-10 px-2 rounded-lg border border-slate-300 bg-white text-slate-900" /></label>
            </div>
          </details>
          </>}
          {ov.note && <div className="text-xs text-slate-700">Notiz: {ov.note}</div>}
        </div>
      );
    }

    // v49: Etappenkette nach Änderung (Datum, Startort, Reisedauer-Hinweis)
    const chainFix = (oldStages, edited, meta) => {
      const nn = (s) => Math.max(0, parseInt(s.nights, 10) || 0);
      const startDate = (meta || {}).startDate;
      const idx = oldStages.findIndex((s) => s.id === edited.id);
      let list = oldStages.map((s) => (s.id === edited.id ? edited : s));
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(startDate || '') ? startDate : null;
      let cur = iso;
      list = list.map((s, i) => {
        let o = { ...s };
        if (i > 0 && i > idx && list[i - 1].toCity) o.fromCity = list[i - 1].toCity;
        if (cur) { const end = isoAdd(cur, nn(s)); const nr = wzRange(cur, end); o.dateRange = String(s.dateRange || '').startsWith(nr) ? s.dateRange : nr; cur = end; }
        return o;
      });
      let newMeta = null, notice = '';
      const oldN = oldStages.reduce((a, s) => a + nn(s), 0), newN = list.reduce((a, s) => a + nn(s), 0);
      if (iso && newN > oldN) {
        const endIso = /^\d{4}-\d{2}-\d{2}$/.test(meta.endDate || '') ? meta.endDate : null;
        const planned = parseInt(meta.plannedDays, 10) || (endIso ? tripDayCount(iso, endIso) : 0);
        if (planned && newN + 1 > planned) {
          const newEnd = isoAdd(iso, newN);
          notice = `Die angegebene Reisedauer von ${planned} Tagen wurde überschritten. Die Reise verlängert sich auf ${newN + 1} Tage (bis ${wzDM(newEnd)}${newEnd.slice(0, 4)}).`;
          newMeta = { ...meta, endDate: newEnd, plannedDays: planned };
        }
      }
      return { stages: list, meta: newMeta, notice };
    };

    // v50: Rückreise-Etappe, Strecken (km / Fahrzeit) und Migration bestehender Planungen
    const rtIsRet = (stages, i) => !!stages && stages.length > 1 && i === stages.length - 1 && !(parseInt((stages[i] || {}).nights, 10) > 0);
    const rtStageName = (s) => `${s.fromCity || '?'} → ${s.toCity || '?'}`;
    async function rtRoute(A, B, mode) {
      const j = await fetchJsonTimeout(`https://router.project-osrm.org/route/v1/driving/${A[1]},${A[0]};${B[1]},${B[0]}?overview=false${mode ? '&rtmode=' + mode : ''}`, {}, 15000);
      const r = j && j.routes && j.routes[0]; if (!r) throw new Error('Keine Route');
      const km = Math.round(r.distance / 1000), hrs = (r.duration / 3600).toFixed(1).replace('.', ',');
      return { distanceKm: `${km} km (${Math.round(km * 0.621)} mi)`, duration: `${hrs} h` };
    }
    async function rtCalcStage(stages, i) {
      const s = stages[i], prev = stages[i - 1];
      let A = parseGps(prev && prev.hotel && prev.hotel.gps); if (!A) { const nm = s.fromCity || (prev && prev.toCity); if (nm) A = await sfGeocode(nm); }
      let B = parseGps(s.hotel && s.hotel.gps); if (!B && s.toCity) B = await sfGeocode(s.toCity);
      if (!A || !B) throw new Error('Ort nicht gefunden');
      return rtRoute(A, B, (stages[i] || {}).routeType);
    }
    function RouteCalcBar({ trip, stage, index, onSave }) {
      const [st, setSt] = useState('');
      const run = async () => {
        setSt('Berechne …');
        const t0 = Date.now();
        try { const r = await rtCalcStage(trip.stages || [], index); const stages = (trip.stages || []).map((s) => (s.id === stage.id ? { ...s, routeToHotel: { ...(s.routeToHotel || { routeDescription: '', stopsOnWay: [] }), ...r } } : s)); onSave({ ...trip, stages }, `Strecke: ${r.distanceKm} · ${r.duration}`); setSt((window.__rtRouteFallback || 0) > t0 ? 'Routenart vom Dienst nicht unterstützt: Standardroute verwendet.' : ''); }
        catch (e) { setSt('Nicht möglich: ' + (/Ort/.test(e.message) ? 'Ortsnamen prüfen.' : 'Internet nötig.')); }
      };
      return (
        <div data-route-calc className="px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
          <label className="inline-flex items-center gap-1 text-slate-700">Routenart <select data-stage-route-type value={stage.routeType || ''} onChange={(e) => onSave({ ...trip, stages: (trip.stages || []).map((s) => (s.id === stage.id ? { ...s, routeType: e.target.value } : s)) }, 'Routenart der Etappe geändert')} className="px-2 py-1 rounded-lg border border-slate-300 bg-white"><option value="">Wie Einstellung ({rtRouteLabel(rtRoutePref())})</option>{RT_ROUTE_MODES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <button type="button" onClick={run} className="v18-btn sm">Entfernung &amp; Fahrzeit ermitteln</button>
          <span className="text-slate-600">{(stage.routeToHotel || {}).distanceKm ? '' : 'Noch keine Angabe.'} {st}</span>
        </div>
      );
    }
    function RouteCalcAll({ trip, onSave }) {
      const [st, setSt] = useState('');
      const stages = trip.stages || []; const open = stages.filter((s) => !(s.routeToHotel && s.routeToHotel.distanceKm && s.routeToHotel.duration)).length;
      if (!stages.length) return null;
      const run = async (force) => {
        let cur = stages, fail = 0;
        for (let i = 0; i < cur.length; i++) {
          const s = cur[i]; if (!force && s.routeToHotel && s.routeToHotel.distanceKm && s.routeToHotel.duration) continue;
          setSt(`Berechne Etappe ${i + 1} von ${cur.length} …`);
          try { const r = await rtCalcStage(cur, i); cur = cur.map((x, k) => (k === i ? { ...x, routeToHotel: { ...(x.routeToHotel || { routeDescription: '', stopsOnWay: [] }), ...r } } : x)); } catch (e) { fail++; }
        }
        onSave({ ...trip, stages: cur }, fail ? `Strecken berechnet, ${fail} Etappe(n) nicht möglich.` : 'Strecken für alle Etappen berechnet'); setSt(fail ? `${fail} Etappe(n) nicht möglich (Ortsname oder Internet).` : 'Fertig.');
      };
      return (
        <div data-route-all className="v18-edit-only no-print rounded-2xl border border-slate-200 bg-white p-3 flex flex-wrap items-center gap-3 text-sm">
          <button type="button" onClick={() => run(false)} disabled={!open || !!st && /Berechne/.test(st)} className="v18-btn disabled:opacity-50">Entfernung &amp; Fahrzeit für alle Etappen ermitteln</button>
          <button type="button" data-route-all-force onClick={async () => { if ((await window.rtAsk('Alle Strecken mit der aktuellen Routenart neu berechnen? Vorhandene km und Fahrzeiten werden überschrieben.'))) run(true); }} disabled={!!st && /Berechne/.test(st)} className="v18-btn">Alle neu berechnen ({rtRouteLabel(rtRoutePref())})</button>
          <span className="text-slate-700">{open ? `${open} Etappe(n) ohne Angabe` : 'Alle Etappen haben km und Fahrzeit.'} {st}</span>
        </div>
      );
    }
    function RtMigrate({ trip, onSave }) {
      useEffect(() => {(async () => {
        const m = trip.meta || {}, stages = trip.stages || [];
        if (IS_READ_ONLY_COPY || m.returnStageAsked || stages.length < 1 || !m.startLocation || !/^\d{4}-\d{2}-\d{2}$/.test(m.startDate || '')) return;
        if (window.__rtMigAsked === m.tripId + '|' + m.title) return; window.__rtMigAsked = m.tripId + '|' + m.title;
        const last = stages[stages.length - 1];
        if (rtIsRet(stages, stages.length - 1) || stages.length === 1 && !(parseInt(last.nights, 10) > 0)) return;
        if (parseInt(last.nights, 10) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(m.endDate || '')) {
          const nights = stages.reduce((a, s) => a + (parseInt(s.nights, 10) || 0), 0);
          const endIso = isoAdd(m.startDate, nights);
          const ok = (await window.rtAsk(`Die Planung hat noch keine Etappe für die Rückreise.\n\nSoll eine letzte Etappe „${last.toCity || '?'} → ${m.startLocation}“ am ${endIso.slice(8, 10)}.${endIso.slice(5, 7)}.${endIso.slice(0, 4)} ergänzt werden? Sie hat keine Übernachtung, daher kein Hotel und keine Unternehmungen vor Ort; Punkte auf dem Weg sind möglich.\n\nBestehende Etappen bleiben unverändert.`));
          const next = { ...trip, meta: { ...m, returnStageAsked: true } };
          if (ok) { const ns = wzNewStage(last.toCity || '', m.startLocation, 0); ns.dateRange = wzRange(endIso, endIso); next.stages = [...stages, ns]; }
          onSave(next, ok ? 'Rückreise-Etappe ergänzt' : 'Ok, keine Rückreise-Etappe');
        }
      })();}, [trip.meta && trip.meta.title, (trip.stages || []).length]);
      return null;
    }

    // v52: bessere Trefferqualität (Wikidata-Typen), Top-10 + Mehr, Namenssuche
    const RT_TOURQ = 'BIND(EXISTS { VALUES ?tt { wd:Q570116 wd:Q33506 wd:Q23413 wd:Q16560 wd:Q16970 wd:Q2977 wd:Q32815 wd:Q34627 wd:Q44539 wd:Q44613 wd:Q46169 wd:Q473972 wd:Q179049 wd:Q40080 wd:Q34038 wd:Q23397 wd:Q8502 wd:Q8072 wd:Q35509 wd:Q22698 wd:Q167346 wd:Q1107656 wd:Q43501 wd:Q2281788 wd:Q194195 wd:Q2416723 wd:Q839954 wd:Q4989906 wd:Q12280 wd:Q39715 wd:Q179700 wd:Q1081138 wd:Q57821 wd:Q1785071 wd:Q24354 wd:Q483110 wd:Q811534 wd:Q1075 wd:Q15700834 wd:Q41176 wd:Q2065736 } ?item wdt:P31/wdt:P279* ?tt } AS ?tour)';
    const rtNoTour = (q) => q.replace(RT_TOURQ, '').replace(' ?tour WHERE', ' WHERE');
    async function rtNameSearch(q) {
      const found = new Map();
      for (const lang of ['de', 'en']) {
        let j; try { j = await fetchJsonT(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=${lang}&uselang=${lang}&type=item&limit=20&format=json&origin=*`, 12000); } catch (e) { if (lang === 'en' && !found.size) throw e; continue; }
        (j.search || []).forEach((r) => { if (!found.has(r.id)) found.set(r.id, r); });
      }
      const ids = [...found.keys()].slice(0, 50); if (!ids.length) return [];
      const e = await fetchJsonT(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(ids.join('|'))}&props=${encodeURIComponent('claims|sitelinks|labels|descriptions')}&languages=${encodeURIComponent('de|en')}&format=json&origin=*`, 15000);
      const out = [];
      ids.forEach((id) => {
        const en = e.entities && e.entities[id]; if (!en || !en.claims) return;
        const pc = en.claims.P625 && en.claims.P625[0] && en.claims.P625[0].mainsnak && en.claims.P625[0].mainsnak.datavalue; if (!pc || !pc.value) return;
        const lb = en.labels || {}, ds = en.descriptions || {}; const name = (lb.de || lb.en || {}).value || found.get(id).label; if (!name) return;
        const d = (ds.de || ds.en || {}).value || found.get(id).description || '';
        const f = en.claims.P18 && en.claims.P18[0] && en.claims.P18[0].mainsnak && en.claims.P18[0].mainsnak.datavalue;
        out.push({ id, name, d, lat: pc.value.latitude, lon: pc.value.longitude, sl: Object.keys(en.sitelinks || {}).length, img: f && f.value ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f.value)}?width=360` : '', kind: sfwKindOf(d) || 'sehensw' });
      });
      return out.sort((a, b) => b.sl - a.sl);
    }
    function RtNameSearch({ mode, getCenter, getAB, pick, have }) {
      const [q, setQ] = useState(''); const [st, setSt] = useState(''); const [res, setRes] = useState(null); const [ref, setRef] = useState(null);
      const go = async (ev) => {
        ev.preventDefault(); const t = q.trim(); if (t.length < 2) return; setSt('Suche läuft …'); setRes(null);
        try {
          let items = await rtNameSearch(t);
          if (mode === 'do') { const C = ref || await getCenter(); setRef(C); if (C) items = items.map((c) => ({ ...c, dist: haversineM(C, [c.lat, c.lon]) / 1000 })).filter((c) => c.dist <= 400); }
          else { const AB = ref || await getAB(); setRef(AB); if (AB && AB[0] && AB[1]) { const [A, B] = AB; const ab = haversineM(A, B) / 1000; items = items.map((c) => { const a1 = haversineM(A, [c.lat, c.lon]) / 1000, b1 = haversineM([c.lat, c.lon], B) / 1000; return { ...c, detour: Math.round(Math.max(0, a1 + b1 - ab) * 1.3 / 80 * 60), fromStartKm: a1 * 1.2, est: true }; }); } else items = items.map((c) => ({ ...c, detour: 0, fromStartKm: 0, est: true })); }
          setRes(items.slice(0, 12)); setSt(items.length ? '' : 'Nichts gefunden. Anderen Namen oder eine andere Schreibweise versuchen.');
        } catch (e) { setSt('Suche nicht möglich (Internet nötig).'); }
      };
      return (
        <div data-name-search className="space-y-2">
          <form onSubmit={go} className="flex gap-2"><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nach Namen suchen, z. B. Everglades" aria-label="Nach Namen suchen" className="flex-1 min-w-0 h-10 px-3 rounded-lg border border-slate-300 text-sm" /><button type="submit" data-readonly-allow className="v18-btn">Suchen</button></form>
          {st && <div className="text-xs text-slate-600">{st}</div>}
          {res && res.length > 0 && <div className="space-y-2"><div className="flex items-center justify-between text-xs"><b className="text-slate-900">Treffer für „{q.trim()}“</b><button type="button" data-readonly-allow onClick={() => { setRes(null); setSt(''); }} className="underline text-[#1F4E8C] font-semibold">Treffer ausblenden</button></div><ul className="space-y-2 p-0 m-0">{res.map((c) => <SfwCard key={c.id} c={c} selected={false} onSelect={() => {}} meta={mode === 'do' ? <><b>{c.dist.toFixed(1).replace('.', ',')} km</b> vom Zentrum{have && have.has(c.name.toLowerCase()) ? ' · bereits in der Etappe' : ''}</> : undefined} pickLabel={mode === 'do' ? 'Zu Aktionen hinzufügen' : undefined} onPick={pick} />)}</ul></div>}
        </div>
      );
    }

    // v54: Buchungsübersicht Hotels, Packlisten-Vorschlag, Flug/Auto nur bei vorhandenen Daten
    const rtFlightFilled = (f) => !!(f && (String(f.flightNumber || '').trim() || String(f.departureDate || '').trim() || String(f.from || '').trim()));
    const rtCarFilled = (c) => !!(c && (String(c.provider || '').trim() || String(c.pickupLocation || '').trim() || String(c.pickupDate || '').trim()));
    const rtHasLeg = (trip, kind) => {
      const out = kind === 'out';
      const fl = (trip.flights || []).filter(rtFlightFilled).some((f) => (out ? /^hin/i : /^r(ü|ue)ck/i).test(f.direction || ''));
      const car = (trip.rentalCars || []).filter(rtCarFilled).some((c) => out ? (c.pickupLocation || c.pickupDate) : (c.dropoffLocation || c.dropoffDate));
      return fl || car;
    };
    const rtHotelPrice = (h) => { h = h || {}; const n = Number(h.priceNewEur) || Number(h.priceOldEur) || 0; return n > 0 ? n : (Number(h.priceUsd) > 0 ? Number(h.priceUsd) : 0); };
    function BookingHotels({ trip, onSave, goStage }) {
      const stages = trip.stages || [];
      const rows = stages.map((s, i) => ({ s, i })).filter(({ s, i }) => !rtIsRet(stages, i));
      if (!rows.length) return null;
      const booked = rows.filter(({ s }) => rtHotelPrice(s.hotel) > 0).length;
      const sum = rows.reduce((a, { s }) => a + ((s.hotel && (Number(s.hotel.priceNewEur) || Number(s.hotel.priceOldEur))) || 0), 0);
      const setPrice = (s, v) => { const n = Number(String(v).replace(',', '.')); const cur = Number((s.hotel || {}).priceNewEur) || 0; const nv = Number.isFinite(n) && n > 0 ? n : 0; if (nv === cur) return; onSave({ ...trip, stages: stages.map((x) => (x.id === s.id ? { ...x, hotel: { ...(x.hotel || {}), priceNewEur: nv, ...(nv === 0 ? { priceOldEur: 0 } : {}) } } : x)) }, nv ? 'Hotel als gebucht markiert' : 'Preis entfernt, Hotel nicht gebucht'); };
      return (
        <section data-book-hotels className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="text-base sm:text-lg font-bold">Hotels (aus der Planung)</h2><p className="text-xs text-slate-300">Ein Preis bedeutet: gebucht. Ohne Preis gilt das Hotel als nicht gebucht.</p></div>
            <span data-book-count className="text-sm font-bold">{booked} von {rows.length} gebucht{sum ? ` · ${formatEur(sum)}` : ''}</span>
          </div>
          <ul className="p-3 sm:p-4 space-y-2 m-0">
            {rows.map(({ s, i }) => { const ok = rtHotelPrice(s.hotel) > 0; const name = (s.hotel && s.hotel.name) || ''; return (
              <li key={s.id} data-book-hotel={ok ? 'booked' : 'open'} className={`list-none rounded-xl border-2 p-3 flex flex-wrap items-center gap-x-4 gap-y-2 ${ok ? 'border-emerald-500 bg-emerald-50' : 'border-red-400 bg-red-50'}`}>
                <div className="min-w-[180px] flex-1">
                  <div className="text-xs font-semibold text-slate-700">Etappe {i + 1} · {s.toCity || '?'} · {s.dateRange || ''}{s.nights ? ` · ${s.nights} ${Number(s.nights) === 1 ? 'Nacht' : 'Nächte'}` : ''}</div>
                  <div className="text-sm font-bold text-slate-900 break-words">{name || 'Hotel noch nicht gewählt'}</div>
                  <div className="mt-1 text-xs"><RtCardChip name={s.hotel && s.hotel.creditCard} cards={trip.creditCards} /></div>
                </div>
                <span data-book-badge className={`px-2.5 py-1 rounded-full text-xs font-bold ${ok ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'}`}>{ok ? '✔ Gebucht' : '✖ Nicht gebucht'}</span>
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">Preis €<input data-book-price type="number" min="0" step="1" defaultValue={rtHotelPrice(s.hotel) || ''} key={s.id + ':' + rtHotelPrice(s.hotel)} onBlur={(e) => setPrice(s, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }} className="w-28 h-10 px-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900" /></label>
                <button type="button" data-readonly-allow data-book-open onClick={() => goStage(s)} className="v18-btn sm">In Etappe öffnen</button>
              </li>); })}
          </ul>
        </section>
      );
    }
    function packSuggest(trip) {
      const meta = trip.meta || {}, stages = trip.stages || [], people = trip.participants || [];
      const nights = stages.reduce((a, s) => a + (parseInt(s.nights, 10) || 0), 0); const days = Math.max(1, nights + 1);
      const acts = stages.flatMap((s) => (s.localAttractions || []).map((a) => `${a.name || ''} ${a.category || ''} ${a.notes || ''}`)).join(' ');
      const txt = [meta.destination, meta.startLocation, meta.endLocation, meta.title, meta.subtitle, ...stages.map((s) => `${s.fromCity || ''} ${s.toCity || ''} ${(s.hotel || {}).address || ''}`)].join(' ').toLowerCase();
      const all = `${txt} ${acts.toLowerCase()}`;
      const hasFlight = (trip.flights || []).some(rtFlightFilled);
      const hasRental = (trip.rentalCars || []).some(rtCarFilled);
      const veh = String(meta.vehicle || '');
      const hasCar = hasRental || /auto|pkw|wagen|wohnmobil|camper|motorrad|van|suv/i.test(veh) || (!hasFlight && !/bahn|zug|bus|rad|fahrrad|schiff/i.test(veh));
      const usa = /usa|florida|miami|orlando|key west|everglades|kalifornien|california|new york|texas|las vegas|hawaii|arizona/.test(all);
      const alps = /österreich|tirol|innsbruck|brenner|italien|gardasee|riva|limone|schweiz|südtirol|bozen|verona|trento/.test(all);
      const eu = !usa && !/ägypten|thailand|türkei|dubai|bali|japan|mexiko|kanada|australien|marokko|südafrika/.test(all);
      let lat = null; for (const s of stages) { const g = (typeof stageLoc === 'function') ? stageLoc(s) : null; if (g) { lat = g[0]; break; } }
      if (lat == null) lat = usa ? 27 : alps ? 46 : 48;
      const iso = /^\\d{4}-\\d{2}-\\d{2}$/.test(meta.startDate || '') ? meta.startDate : null; const month = iso ? Number(iso.slice(5, 7)) : (new Date().getMonth() + 1);
      let est = 27 - 0.55 * (Math.abs(lat) - 20) + 12 * Math.cos((month - 7) * Math.PI / 6) * (Math.abs(lat) / 45);
      let wxN = 0, wxT = 0, wxRain = 0, wxR = 0;
      try { buildDays(trip).forEach((d) => { const w = wxStore.get(d.stage, d.iso); if (w && w.tmax != null) { wxN++; wxT += (Number(w.tmax) + Number(w.tmin)) / 2; } if (w && w.rain != null) { wxR++; wxRain += Number(w.rain); } }); } catch (e) {}
      const temp = Math.round(wxN >= 3 ? wxT / wxN : est); const rainy = wxR >= 3 ? wxRain / wxR >= 45 : (temp < 22 || (lat < 30 && month >= 6 && month <= 9));
      const beach = temp >= 22 || /strand|beach|baden|schnorchel|schwimm|meer\\b/.test(all);
      const hike = /wander|trail|hike|nationalpark|national park|trekking|schlucht|canyon|everglades|berg/.test(all);
      const wear = Math.min(days, 7) + 1; const items = []; const P = (cat, who, text) => items.push({ cat, who, text });
      const ids = people.length ? people.map((p) => p.id) : ['shared'];
      ids.forEach((w) => {
        P('Dokumente', w, usa ? 'Reisepass (mind. 6 Monate gültig)' : eu ? 'Personalausweis / Reisepass' : 'Reisepass');
        if (usa) P('Dokumente', w, 'ESTA-Bestätigung (digital + Ausdruck)');
        P('Gesundheit', w, 'Persönliche Medikamente'); P('Gesundheit', w, 'Kulturbeutel (Zahnbürste, Zahnpasta, Deo, Shampoo)');
        P('Kleidung', w, `Unterwäsche (ca. ${wear})`); P('Kleidung', w, `Socken (ca. ${wear})`); P('Kleidung', w, `T-Shirts / Oberteile (ca. ${wear})`); P('Kleidung', w, 'Schlafsachen'); P('Kleidung', w, 'Bequeme, eingelaufene Schuhe');
        if (temp >= 24) { P('Kleidung', w, 'Kurze Hosen / Röcke (2–3)'); P('Kleidung', w, '1 lange Hose / leichter Pullover für klimatisierte Räume und Abende'); }
        else if (temp >= 14) { P('Kleidung', w, 'Lange Hosen (2–3)'); P('Kleidung', w, 'Pullover / Fleece (2)'); P('Kleidung', w, 'Leichte Jacke'); if (temp >= 18) P('Kleidung', w, '1 kurze Hose für warme Tage'); }
        else { P('Kleidung', w, 'Lange Hosen (3)'); P('Kleidung', w, 'Pullover / Fleece (3)'); P('Kleidung', w, 'Warme Jacke'); P('Kleidung', w, 'Mütze, Schal, Handschuhe'); if (temp <= 5) P('Kleidung', w, 'Thermounterwäsche'); P('Kleidung', w, 'Wasserdichte, warme Schuhe'); }
        if (rainy) P('Kleidung', w, 'Regenjacke oder faltbarer Schirm');
        if (temp >= 20) { P('Sonne', w, 'Sonnenbrille'); P('Sonne', w, 'Cap / Sonnenhut'); }
        if (beach) { P('Strand', w, 'Badesachen (2)'); P('Strand', w, 'Flip-Flops / Sandalen'); }
        if (hike) { P('Wandern', w, 'Wanderschuhe oder feste Trailschuhe'); P('Wandern', w, 'Trinkflasche'); }
      });
      const S = (cat, text) => P(cat, 'shared', text);
      S('Dokumente', `Buchungsbestätigungen (Hotels${hasFlight ? ', Flüge' : ''}${hasRental ? ', Mietwagen' : ''}) offline gespeichert`);
      if (hasCar || hasRental) S('Dokumente', 'Führerschein (alle Fahrer)');
      if (usa && hasCar) S('Dokumente', 'Internationaler Führerschein (empfohlen)');
      S('Dokumente', eu ? 'Europäische Krankenversichertenkarte (EHIC)' : 'Auslandskrankenversicherung (Nachweis)');
      if ((trip.creditCards || []).length) S('Geld', 'Kreditkarten (getrennt aufbewahren) + Sperr-Notruf notiert');
      S('Geld', usa ? 'Bargeld USD (kleine Scheine für Trinkgeld)' : (meta.currency && meta.currency !== 'EUR' ? `Bargeld ${meta.currency}` : 'Etwas Bargeld in kleinen Scheinen und Münzen'));
      S('Technik', 'Handy + Ladekabel'); S('Technik', 'Powerbank'); S('Technik', 'Offline-Karten und diese App offline verfügbar');
      if (usa) S('Technik', 'Reiseadapter Typ A/B (USA)'); else if (/england|london|schottland|irland|\\buk\\b/.test(all)) S('Technik', 'Reiseadapter Typ G (UK)'); else if (/schweiz/.test(all)) S('Technik', 'Reiseadapter Typ J (Schweiz)');
      if (hasCar) { S('Technik', 'Handyhalterung fürs Auto'); S('Technik', 'KFZ-Ladegerät / USB-Adapter'); }
      S('Gesundheit', 'Reiseapotheke (Schmerzmittel, Pflaster, Magen-Darm, Allergie)'); S('Gesundheit', 'Desinfektionsgel / Feuchttücher');
      if (temp >= 20 || beach) S('Sonne', 'Sonnencreme (LSF 30–50)');
      if (temp >= 22 && lat < 35) S('Gesundheit', 'Insektenschutz');
      if (hasFlight) { S('Flug', 'Boardkarten / Airline-App'); S('Flug', 'Flüssigkeiten ≤ 100 ml im Beutel (Handgepäck)'); S('Flug', 'Nackenkissen, Kopfhörer, Ladekabel im Handgepäck'); }
      if (hasCar) { S('Auto', 'Snacks und Getränke'); S('Auto', 'Müllbeutel'); S('Auto', 'Tagesrucksack für Ausflüge'); if (temp >= 22) { S('Auto', 'Kühltasche'); S('Auto', 'Sonnenblende'); } if (temp <= 4 && !hasRental) { S('Auto', 'Eiskratzer, Enteiser'); S('Auto', 'Winterreifen / Schneeketten prüfen'); } if (!usa) { S('Auto', 'Warnweste, Warndreieck, Verbandkasten'); S('Auto', 'Parkscheibe'); } if (alps) { S('Auto', 'Autobahn-Vignette (Österreich/Schweiz) bzw. Mautgeld/Kreditkarte für Italien'); } if (/florida|miami|orlando|key west/.test(all)) S('Auto', hasRental ? 'Kleingeld für Maut (SunPass im Mietwagen klären)' : 'Kleingeld / Kreditkarte für Maut'); }
      if (days > 9) S('Kleidung', 'Waschmittel / Wäschebeutel (Reise länger als 9 Tage)');
      if (beach) S('Strand', 'Strandtuch'); if (beach) S('Strand', 'Wasserfeste Handyhülle'); if (hike) S('Wandern', 'Pflaster / Blasenpflaster');
      const assump = [`${days} Tage`, `Tagesmittel ca. ${temp} °C${wxN >= 3 ? ' (Vorhersage)' : ' (Schätzung)'}`, hasFlight ? 'Flug' : null, hasCar ? (hasRental ? 'Mietwagen' : 'Auto') : 'ohne Auto', beach ? 'Strand' : null, hike ? 'Wandern' : null, rainy ? 'Regen möglich' : null].filter(Boolean).join(' · ');
      return { items, assump };
    }

    // v55: Karten nur mit letzten 4 Ziffern, Ablaufwarnung, Reisevorlage
    function cardSanitize(c) {
      if (!c || typeof c !== 'object') return c; const o = { ...c }; let had = false;
      const digits = String(o.cardNumber || '').replace(/\D/g, ''); if (digits.length > 4) had = true; o.cardNumber = digits.slice(-4);
      ['cvc', 'cvv', 'cvc2', 'cvv2', 'securityCode', 'pin', 'pinCode'].forEach((k) => { if (k in o) { delete o[k]; had = true; } });
      if (had) { try { sessionStorage.setItem('rt_card_sanitized', '1'); } catch (e) {} } return o;
    }
    function cardExpiryEnd(v) { const m = String(v || '').trim().match(/^(\d{1,2})\s*[\/.\-]\s*(\d{2}|\d{4})$/); if (!m) return null; let mo = +m[1], y = +m[2]; if (y < 100) y += 2000; if (mo < 1 || mo > 12) return null; return Date.UTC(y, mo, 0); }
    function cardWarnings(trip) {
      const meta = trip.meta || {}; const iso = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s || '') ? Date.parse(s + 'T00:00:00Z') : null);
      const st = iso(meta.startDate); const en = iso(meta.endDate) || st; if (st == null) return [];
      const out = [];
      (trip.creditCards || []).forEach((c) => {
        const e = cardExpiryEnd(c.validUntil); if (e == null) return; const lbl = String(c.validUntil).trim();
        if (e < st) out.push({ id: c.id, name: c.name, level: 'red', text: `Gültig bis ${lbl}: läuft vor Reisebeginn ab. Bitte neue Karte bereithalten.` });
        else if (e <= en) out.push({ id: c.id, name: c.name, level: 'red', text: `Gültig bis ${lbl}: läuft während der Reise ab. Auf dieser Karte keine Buchungen für die Zeit danach.` });
        else if (e <= en + 30 * 864e5) out.push({ id: c.id, name: c.name, level: 'amber', text: `Gültig bis ${lbl}: läuft kurz nach der Reise ab (innerhalb von 30 Tagen). Spätere Abbuchungen oder Rückerstattungen können noch folgen.` });
      });
      return out;
    }
    function CardExpiryAlerts({ trip, goCards }) {
      const ws = cardWarnings(trip); const [gone, setGone] = useState(false); let sanitized = false; try { sanitized = !gone && sessionStorage.getItem('rt_card_sanitized') === '1'; } catch (e) {}
      if (!ws.length && !sanitized) return null;
      return (
        <div data-card-alerts className="space-y-2">
          {ws.map((w) => <div key={w.id} role="alert" data-card-alert={w.level} className={`rounded-xl border-2 px-3 py-2 text-sm flex flex-wrap items-center justify-between gap-2 ${w.level === 'red' ? 'border-red-500 bg-red-50 text-red-950' : 'border-amber-500 bg-amber-50 text-amber-950'}`}><span><Ic n="card" /><b>{w.name}</b>: {w.text}</span>{goCards && <button type="button" data-readonly-allow onClick={goCards} className="v18-btn sm">Karten öffnen</button>}</div>)}
          {sanitized && <div role="status" data-card-sanitized className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800">Aus Sicherheitsgründen speichert der Planer nur noch die letzten 4 Ziffern einer Karte. Längere Nummern und Prüfnummern wurden entfernt, beim nächsten Speichern gilt das dauerhaft. <button type="button" data-readonly-allow onClick={() => { try { sessionStorage.removeItem('rt_card_sanitized'); } catch (e) {} setGone(true); }} className="underline font-semibold">OK</button></div>}
        </div>
      );
    }
    function TemplateBar({ trip, onSave }) {
      const [msg, setMsg] = useState(''); const ref = useRef(null);
      const pick = (o, ks) => { const r = {}; ks.forEach((k) => { if (o && o[k] != null && o[k] !== '') r[k] = o[k]; }); return r; };
      const save = () => {
        const t = { templateType: 'roadtrip-vorlage', version: 1, created: new Date().toISOString().slice(0, 10), meta: pick(trip.meta, ['currency', 'exchangeRate', 'homeTz', 'startLocation', 'maxDriveHours', 'vehicle']), participants: trip.participants || [], creditCards: (trip.creditCards || []).map(cardSanitize), emergencyContacts: trip.emergencyContacts || [] };
        const url = URL.createObjectURL(new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'roadtrip-vorlage.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
        setMsg(`Vorlage gespeichert: ${t.creditCards.length} Karte(n), ${t.participants.length} Mitreisende, ${t.emergencyContacts.length} Notfallnummern.`);
      };
      const load = async (file) => {
        try {
          const t = JSON.parse(await file.text()); if (!t || t.templateType !== 'roadtrip-vorlage') throw new Error('Das ist keine Reisevorlage.');
          const nid = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const parts = [...(trip.participants || [])]; let np = 0; (Array.isArray(t.participants) ? t.participants : []).forEach((p) => { if (p && p.name && !parts.some((x) => String(x.name).toLowerCase() === String(p.name).toLowerCase())) { parts.push({ ...p, id: parts.some((x) => x.id === p.id) || !p.id ? nid('p') : p.id }); np++; } });
          const cards = [...(trip.creditCards || [])]; let nc = 0; (Array.isArray(t.creditCards) ? t.creditCards : []).forEach((c0) => { const c = cardSanitize(c0); if (c && c.name && !cards.some((x) => String(x.name).toLowerCase() === String(c.name).toLowerCase() && (x.cardNumber || '') === (c.cardNumber || ''))) { cards.push({ ...c, id: cards.some((x) => x.id === c.id) || !c.id ? nid('cc') : c.id }); nc++; } });
          const ems = [...(trip.emergencyContacts || [])]; let ne = 0; (Array.isArray(t.emergencyContacts) ? t.emergencyContacts : []).forEach((e) => { if (e && e.organization && !ems.some((x) => x.organization === e.organization && (x.phone || '') === (e.phone || ''))) { ems.push({ ...e, id: ems.some((x) => x.id === e.id) || !e.id ? nid('em') : e.id }); ne++; } });
          const meta = { ...(trip.meta || {}) }; Object.keys(t.meta || {}).forEach((k) => { if (meta[k] == null || meta[k] === '') meta[k] = t.meta[k]; });
          onSave({ ...trip, meta, participants: parts, creditCards: cards, emergencyContacts: ems }, `Vorlage übernommen: ${nc} Karte(n), ${np} Mitreisende, ${ne} Notfallnummern`);
          setMsg(`Übernommen: ${nc} Karte(n), ${np} Mitreisende, ${ne} Notfallnummern. Bereits vorhandene Einträge wurden nicht doppelt angelegt.`);
        } catch (e) { setMsg('Vorlage konnte nicht gelesen werden: ' + e.message); }
      };
      return (
        <section data-template-bar className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <h3 className="text-base font-bold text-slate-900">Reisevorlage: Karten, Mitreisende, Notfallnummern</h3>
          <p className="text-xs text-slate-700">Spare dir das erneute Eintragen bei jeder Reise. Die Vorlage enthält nur Karten (Name, letzte 4 Ziffern, Ablaufdatum, Limit, Gebühren und Bedingungen), Mitreisende und Notfallnummern. Keine Etappen, Buchungen, vollständigen Kartennummern oder Prüfnummern. Die Datei gehört nicht ins Internet (nicht auf GitHub hochladen).</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" data-template-save onClick={save} className="v18-btn">Als Vorlage speichern</button>
            <button type="button" data-readonly-allow data-template-load onClick={() => ref.current && ref.current.click()} className="v18-btn">Vorlage laden …</button>
            <input ref={ref} type="file" accept="application/json,.json" data-template-file className="hidden" onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) load(f); e.target.value = ''; }} />
          </div>
          {msg && <div data-template-msg role="status" className="text-xs text-slate-800">{msg}</div>}
        </section>
      );
    }

    /* ===== v58: Unterwegs – Navi-Hub, Karten-Dienst (Google/Apple), Schnellzugriff ===== */
    const RT_NAVI_KEY = 'roadtrip_navi_pref';
    const rtIsApple = () => { try { const ua = navigator.userAgent || ''; return /iPhone|iPad|iPod|Macintosh/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); } catch (e) { return false; } };
    const rtNaviPref = () => { try { const v = localStorage.getItem(RT_NAVI_KEY); return v === 'google' || v === 'apple' ? v : 'auto'; } catch (e) { return 'auto'; } };
    const rtNaviSet = (v) => { try { localStorage.setItem(RT_NAVI_KEY, v); } catch (e) {} try { window.dispatchEvent(new CustomEvent('rt-navi-pref')); } catch (e) {} };
    const rtNaviSvc = () => { const p = rtNaviPref(); return p === 'auto' ? (rtIsApple() ? 'apple' : 'google') : p; };
    const rtNavUrl = (svc, gps, address, name) => (svc === 'apple' ? getAppleMapsUrl(gps, address, name) : getGoogleMapsUrl(gps, address, name));
    const RT_SVC_NAME = { google: 'Google Maps', apple: 'Apple Karten' };

    function RtNaviPrefBar() {
      const [p, setP] = useState(rtNaviPref);
      const set = (v) => { rtNaviSet(v); setP(v); };
      const eff = rtNaviSvc();
      return (
        <div data-navi-pref className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Navigation mit:</span>
          {[['auto', `Automatisch (${RT_SVC_NAME[rtIsApple() ? 'apple' : 'google']})`], ['google', 'Google Maps'], ['apple', 'Apple Karten']].map(([k, l]) => (
            <button key={k} type="button" data-navi-pref-btn={k} aria-pressed={p === k} onClick={() => set(k)} className={`min-h-[36px] px-3 rounded-lg border font-semibold ${p === k ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300'}`}>{l}</button>
          ))}
          <span className="sr-only">Aktiv: {RT_SVC_NAME[eff]}</span>
        </div>
      );
    }

    const RT_NAVI_TYPES = [['ALL', 'Alle', ''], ['Hotel / Unterkunft', 'Hotel', 'hotel'], ['Parkhaus / Parkplatz', 'Parken', 'park'], ['Stopp unterwegs', 'Stopps', 'flag'], ['Vor Ort / Aktivität', 'Vor Ort', 'target']];

    function RtNaviCard({ pt, svc }) {
      const [open, setOpen] = useState(false);
      const ic = (RT_NAVI_TYPES.find((t) => t[0] === pt.type) || [])[2] || 'pin';
      return (
        <div data-navi-card className="rounded-xl border border-slate-200 bg-white p-2.5">
          <div className="flex items-center gap-2">
            <span className="rt-ico shrink-0"><Ic n={ic} size={20} /></span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 truncate">{pt.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{pt.stageLabel}</div>
            </div>
            <a data-navi-go href={rtNavUrl(svc, pt.gps, pt.address, pt.name)} target="_blank" rel="noopener noreferrer" className="shrink-0 min-h-[44px] inline-flex items-center px-3 rounded-lg bg-blue-600 text-white text-sm font-bold">Navigation</a>
            <button type="button" data-navi-more aria-expanded={open} aria-label="Mehr anzeigen" onClick={() => setOpen(!open)} className="shrink-0 min-h-[44px] min-w-[44px] rounded-lg border border-slate-300 text-slate-700 font-bold">{open ? '▴' : '▾'}</button>
          </div>
          {open && (
            <div data-navi-extra className="mt-2 pt-2 border-t border-slate-100 space-y-2">
              {pt.address && <p className="text-xs text-slate-600">{pt.address}</p>}
              {pt.gps && <p className="text-xs font-mono text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">GPS: {pt.gps}</p>}
              <div className="flex flex-wrap gap-2">
                <a href={getGoogleMapsUrl(pt.gps, pt.address, pt.name)} target="_blank" rel="noopener noreferrer" className="flex-1 min-h-[44px] inline-flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-semibold">Google Maps</a>
                <a href={getAppleMapsUrl(pt.gps, pt.address, pt.name)} target="_blank" rel="noopener noreferrer" className="flex-1 min-h-[44px] inline-flex items-center justify-center rounded-lg bg-slate-800 text-white text-xs font-semibold">Apple Karten</a>
                {pt.gps && <button type="button" onClick={() => copyToClipboard(pt.gps, 'GPS für Offline-Navi kopiert')} className="min-h-[44px] px-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold">Copy GPS</button>}
              </div>
            </div>
          )}
        </div>
      );
    }

    function NaviHub({ points, trip, todayIso }) {
      const days = useMemo(() => buildDays(trip), [trip]);
      const td = days.find((d) => d.iso === todayIso);
      const cur = td ? td.stageIdx + 1 : null;
      const [st, setSt] = useState(cur || 'all');
      const [type, setType] = useState('ALL');
      const [q, setQ] = useState('');
      const [, tick] = useState(0);
      useEffect(() => { const f = () => tick((x) => x + 1); window.addEventListener('rt-navi-pref', f); return () => window.removeEventListener('rt-navi-pref', f); }, []);
      const svc = rtNaviSvc();
      const stageOf = (pt) => pt.stageIdx;
      const base = points.filter((pt) => st === 'all' || stageOf(pt) === st);
      const cnt = (t) => base.filter((pt) => t === 'ALL' || pt.type === t).length;
      const ql = q.trim().toLowerCase();
      const shown = base.filter((pt) => (type === 'ALL' || pt.type === type) && (!ql || (pt.name || '').toLowerCase().includes(ql) || (pt.address || '').toLowerCase().includes(ql) || (pt.stageLabel || '').toLowerCase().includes(ql)));
      const stageNums = Array.from(new Set(points.map(stageOf))).sort((a, b) => a - b);
      const labelOf = (n) => { const p = points.find((x) => stageOf(x) === n); return p ? p.stageLabel : `Etappe ${n}`; };
      return (
        <div className="space-y-3" data-navi-hub>
          <section className="rounded-2xl border border-slate-200 bg-white p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900"><Ic n="pin" /> Navi · {shown.length} {shown.length === 1 ? 'Ziel' : 'Ziele'}</h2>
              {st !== 'all' ? <button type="button" data-navi-all onClick={() => setSt('all')} className="min-h-[36px] px-3 rounded-lg border border-slate-300 text-xs font-semibold">Alle Etappen</button> : cur ? <button type="button" onClick={() => setSt(cur)} className="min-h-[36px] px-3 rounded-lg border border-emerald-600 text-emerald-800 text-xs font-semibold">Aktuelle Etappe</button> : null}
            </div>
            <select data-navi-stage value={st} onChange={(e) => setSt(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="w-full min-h-[44px] px-3 rounded-lg border border-slate-300 bg-slate-50 text-sm font-semibold">
              <option value="all">Alle Etappen ({points.length})</option>
              {stageNums.map((n) => <option key={n} value={n}>{labelOf(n)}{cur === n ? ' · aktuell' : ''}</option>)}
            </select>
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Kategorie">
              {RT_NAVI_TYPES.map(([k, l, ic]) => <button key={k} type="button" data-navi-type={k} aria-pressed={type === k} onClick={() => setType(k)} className={`shrink-0 min-h-[40px] px-3 rounded-full border text-xs font-semibold ${type === k ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300'}`}>{ic && <Ic n={ic} />}{l} ({cnt(k)})</button>)}
            </div>
            <input type="search" data-navi-search value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ort, Hotel oder Stopp suchen…" className="w-full min-h-[44px] px-3 rounded-lg border border-slate-300 text-sm" />
            <RtNaviPrefBar />
          </section>
          <div data-navi-list className="space-y-2">
            {shown.map((pt) => <RtNaviCard key={pt.id} pt={pt} svc={svc} />)}
            {!shown.length && <Empty icon="pin" title="Keine Ziele gefunden" text={st !== 'all' ? 'In dieser Etappe passt nichts zu Filter oder Suche.' : 'Zu Filter oder Suche gibt es keine Ziele.'} action={st !== 'all' ? 'Alle Etappen anzeigen' : null} onAction={() => setSt('all')} />}
          </div>
        </div>
      );
    }

    function RtQuick({ stage, goTab }) {
      const h = (stage && stage.hotel) || {}; const svc = rtNaviSvc();
      const hasH = !!(parseGps(h.gps) || h.address);
      const pk = parseGps(h.parkingGarageGps) || h.parkingGarageAddress;
      const big = 'min-h-[76px] rounded-2xl border flex flex-col items-center justify-center gap-1 text-sm font-bold text-center px-2';
      const on = 'bg-white border-slate-300 text-slate-900'; const off = 'bg-slate-100 border-slate-200 text-slate-400 pointer-events-none';
      return (
        <div data-quick className="grid grid-cols-2 gap-2">
          <a data-quick-hotel href={hasH ? rtNavUrl(svc, h.gps, h.address, h.name) : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!hasH} className={`${big} ${hasH ? on : off}`}><Ic n="hotel" size={28} />Hotel</a>
          <a data-quick-park href={pk ? rtNavUrl(svc, h.parkingGarageGps, h.parkingGarageAddress, h.parkingGarageName) : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!pk} className={`${big} ${pk ? on : off}`}><Ic n="park" size={28} />Parkplatz</a>
          <button type="button" data-quick-emerg onClick={() => goTab('cards')} className={`${big} bg-rose-50 border-rose-200 text-rose-900`}><Ic n="sos" size={28} />Notfall</button>
          <button type="button" data-quick-wx onClick={() => goTab('wx')} className={`${big} ${on}`}><Ic n="wx" size={28} />Wetter</button>
        </div>
      );
    }

    /* ===== v59: Ansichts-Modus Handy / Tablet / Laptop ===== */
    const RT_VIEW_KEY = 'roadtrip_view_pref';
    const rtViewPref = () => { try { const v = localStorage.getItem(RT_VIEW_KEY); return ['phone', 'tablet', 'laptop'].includes(v) ? v : 'auto'; } catch (e) { return 'auto'; } };
    const rtViewAuto = () => {
      try {
        const w = Math.min(window.innerWidth || 1024, screen.width || 9999) < 768 || window.innerWidth < 768 ? 'phone' : null; if (w) return w;
        const touch = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || (navigator.maxTouchPoints || 0) > 1;
        return touch || window.innerWidth < 1100 ? 'tablet' : 'laptop';
      } catch (e) { return 'phone'; }
    };
    const rtViewMode = () => { const p = rtViewPref(); return p === 'auto' ? rtViewAuto() : p; };
    const rtViewApply = () => { try { document.documentElement.setAttribute('data-view', rtViewMode()); } catch (e) {} };
    rtViewApply(); try { window.addEventListener('resize', rtViewApply); window.addEventListener('rt-view-pref', rtViewApply); } catch (e) {}
    const RT_VIEW_NAME = { phone: 'Handy', tablet: 'Tablet', laptop: 'Laptop' };
    function RtViewBar() {
      const [p, setP] = useState(rtViewPref);
      const set = (v) => { try { if (v === 'auto') localStorage.removeItem(RT_VIEW_KEY); else localStorage.setItem(RT_VIEW_KEY, v); } catch (e) {} setP(v); try { window.dispatchEvent(new CustomEvent('rt-view-pref')); } catch (e) {} };
      return (
        <section data-view-bar className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Ansicht für Unterwegs</h3>
          <p className="text-xs text-slate-600">Wird automatisch erkannt (Bildschirmbreite und Touch). Jetzt aktiv: <b>{RT_VIEW_NAME[rtViewMode()]}</b>. Bei falscher Erkennung hier umschalten.</p>
          <div className="flex flex-wrap gap-2">
            {[['auto', `Automatisch (${RT_VIEW_NAME[rtViewAuto()]})`], ['phone', 'Handy'], ['tablet', 'Tablet'], ['laptop', 'Laptop']].map(([k, l]) => (
              <button key={k} type="button" data-view-btn={k} aria-pressed={p === k} onClick={() => set(k)} className={`min-h-[40px] px-3 rounded-lg border text-xs font-semibold ${p === k ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300'}`}>{l}</button>
            ))}
          </div>
        </section>
      );
    }

    