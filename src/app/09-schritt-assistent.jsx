// ===== v45: Schritt-Assistent (Grundrahmen -> Etappen) =====
    const WZ_STEPS = [
      { id: 'frame', ph: 'Grundrahmen', label: 'Reise & Zeitraum' },
      { id: 'people', ph: 'Grundrahmen', label: 'Reisende & Start' },
      { id: 'route', ph: 'Etappen', label: 'Etappen benennen' }
    ];
    const WZ_KEY = 'roadtrip_wizard_v1';
    const WZ_HOTEL = { name: '', bookingLink: '', hotelLink: '', rating: '', address: '', gps: '', checkIn: '', checkOut: '', breakfast: '', parking: '', cancelUntil: '', priceOldEur: '', priceNewEur: '', priceUsd: '', prepaid: '', creditCard: '', paidBy: '', splitAmong: [], parkingGarageName: '', parkingGarageAddress: '', parkingGarageGps: '', remarks: '', chargeAnnounced: '', cardCharged: '', bookingCode: '' };
    const wzOk = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '') && !Number.isNaN(Date.parse(v + 'T00:00:00Z'));
    const wzDM = (iso) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`;
    const wzRange = (a, b) => `${wzDM(a)} – ${wzDM(b)}${b.slice(0, 4)}`;
    const wzNewStage = (from, to, nights) => ({ id: `stage-${Date.now()}-${Math.floor(Math.random() * 100000)}`, fromCity: from, toCity: to, dateRange: '', nights, routeToHotel: { distanceKm: '', duration: '', routeDescription: '', stopsOnWay: [] }, hotel: { ...WZ_HOTEL }, localAttractions: [] });
    const wzRedate = (stages, start) => { let cur = start; return stages.map((s) => { const n = Math.max(0, parseInt(s.nights, 10) || 0); const end = isoAdd(cur, n); const nr = wzRange(cur, end); const out = { ...s, dateRange: String(s.dateRange || '').startsWith(nr) ? s.dateRange : nr }; cur = end; return out; }); };
    const wzNum = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return Number.isFinite(n) ? n : null; };
    const wzLoad = (id) => { try { return (JSON.parse(localStorage.getItem(WZ_KEY)) || {})[id] || null; } catch (e) { return null; } };
    const wzSave = (id, v) => { try { const o = JSON.parse(localStorage.getItem(WZ_KEY)) || {}; o[id] = v; localStorage.setItem(WZ_KEY, JSON.stringify(o)); } catch (e) {} };
    const WZ_IN = 'mt-1 w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-slate-900';

    function TripWizard({ trip, onSave, onClose, goTab, startStep }) {
      const tripRef = useRef(trip); tripRef.current = trip;
      const meta = trip.meta || {}; const tid = meta.tripId || 'default';
      const saved = useMemo(() => wzLoad(tid), []);
      const firstIdx = Math.max(0, WZ_STEPS.findIndex((s) => s.id === (startStep || (saved && (saved.step === 'travel' ? 'people' : saved.step)))));
      const [step, setStep] = useState(startStep || saved ? firstIdx : 0); const [sIdx, setSIdx] = useState(saved && saved.sIdx ? saved.sIdx : 0);
      const [min, setMin] = useState(false); const [err, setErr] = useState('');
      const [d, setD] = useState(() => ({ title: meta.title || '', startDate: meta.startDate || '', endDate: meta.endDate || '', nights: (wzOk(meta.startDate) && wzOk(meta.endDate) && meta.endDate >= meta.startDate) ? String(tripDayCount(meta.startDate, meta.endDate) - 1) : '', budget: meta.budget != null ? String(meta.budget) : '', currency: meta.currency || 'EUR', startLocation: meta.startLocation || '', destination: meta.destination || '', endLocation: meta.endLocation || '', vehicle: meta.vehicle || '', maxDrive: String(Number(meta.maxDriveHours) > 0 ? Number(meta.maxDriveHours) : 5) }));
      const [names, setNames] = useState(() => { const p = (trip.participants || []).map((x) => ({ id: x.id, name: x.name || '', color: x.color, old: true })); return p.length ? p : [{ id: '', name: '', old: false }]; });
      const [sd, setSd] = useState(() => (trip.stages || []).map((s) => ({ id: s.id, city: s.toCity || '', nights: Math.max(0, parseInt(s.nights, 10) || 0) })));
      const [dd, setDd] = useState(null);
      const stages = trip.stages || [];
      const days = tripDayCount(d.startDate, d.endDate); const budgetNights = Math.max(0, days - 1); const [swap, setSwap] = useState(null);
      const usedNights = sd.reduce((a, x) => a + (Number(x.nights) || 0), 0);
      const cur = WZ_STEPS[step];
      const setF = (p) => { setErr(''); setD((x) => ({ ...x, ...p })); };
      const setStartD = (v) => setD((x) => { setErr(''); const n = parseInt(x.nights, 10); return { ...x, startDate: v, endDate: wzOk(v) && n >= 0 ? isoAdd(v, n) : x.endDate }; });
      const setNightsD = (v) => setD((x) => { setErr(''); const n = parseInt(v, 10); return { ...x, nights: v, endDate: wzOk(x.startDate) && n >= 0 && n < 120 ? isoAdd(x.startDate, n) : x.endDate }; });
      const setEndD = (v) => setD((x) => { setErr(''); return { ...x, endDate: v, nights: wzOk(x.startDate) && wzOk(v) && v >= x.startDate ? String(tripDayCount(x.startDate, v) - 1) : x.nights }; });
      const persist = (st, si) => wzSave(tid, { step: WZ_STEPS[st].id, sIdx: si });
      const put = (next) => { if (JSON.stringify(next) !== JSON.stringify(tripRef.current)) onSave(next, ''); };
      const writeMeta = (patch, extra) => { const t = tripRef.current; put({ ...t, ...(extra || {}), meta: { ...t.meta, ...patch } }); };

      // ---- Schritt 1-3 speichern ----
      const commitFrame = () => {
        if (!wzOk(d.startDate)) { setErr('Bitte ein gültiges Startdatum eingeben.'); return false; }
        if (!wzOk(d.endDate) || d.endDate < d.startDate) { setErr('Das Enddatum muss am oder nach dem Startdatum liegen.'); return false; }
        if (tripDayCount(d.startDate, d.endDate) > 120) { setErr('Eine Reise darf höchstens 120 Tage umfassen.'); return false; }
        if (d.endDate === d.startDate) { setErr('Eine Reise braucht mindestens eine Übernachtung.'); return false; }
        const t = tripRef.current; const changedStart = d.startDate !== (t.meta.startDate || '');
        writeMeta({ title: d.title.trim() || t.meta.title || 'Neue Reise', startDate: d.startDate, endDate: d.endDate }, changedStart && (t.stages || []).length ? { stages: wzRedate(t.stages, d.startDate) } : null);
        return true;
      };
      const commitPeople = () => {
        const b = d.budget.trim(); if (b && (!Number.isFinite(Number(b.replace(',', '.'))) || Number(b.replace(',', '.')) < 0)) { setErr('Bitte einen gültigen Budget-Betrag eingeben.'); return false; }
        const t = tripRef.current; const cols = ['blue', 'emerald', 'amber', 'purple'];
        const list = names.filter((x, i) => x.old || x.name.trim() || i === 0).map((x, i) => ({ id: x.id || `p-${Date.now()}-${i}`, name: x.name.trim() || `Reisende ${i + 1}`, color: x.color || cols[i % 4] }));
        const sub = [d.startLocation.trim(), d.destination.trim()].filter(Boolean).join(' • ');
        put({ ...t, participants: list, meta: { ...t.meta, budget: b ? Number(b.replace(',', '.')) : null, currency: d.currency, startLocation: d.startLocation.trim(), destination: d.destination.trim(), endLocation: d.endLocation.trim(), vehicle: d.vehicle.trim(), maxDriveHours: Number(d.maxDrive) || 5, ...(!t.meta.subtitle && sub ? { subtitle: sub } : {}) } });
        return true;
      };
      // ---- Schritt 4: Route ----
      const commitRoute = () => {
        if (!wzOk(d.startDate)) { setErr('Bitte zuerst im Schritt „Reise & Zeitraum“ das Startdatum eintragen.'); return false; }
        const rows = sd; if (!rows.length) { setErr('Lege mindestens eine Etappe an.'); return false; }
        const t = tripRef.current; const old = t.stages || []; const start = t.meta.startLocation || d.startLocation.trim() || 'Startort';
        const cty = (x) => x.city.trim() || 'Ort eintragen';
        const out = rows.map((x, i) => {
          const prevCity = i > 0 ? cty(rows[i - 1]) : start; const prevId = i > 0 ? rows[i - 1].id : null; const o = old.find((s) => s.id === x.id);
          if (!o) return wzNewStage(prevCity, cty(x), x.nights);
          const oi = old.indexOf(o); const oldPrev = oi > 0 ? old[oi - 1] : null; const s = { ...o, toCity: cty(x), nights: x.nights };
          if ((oldPrev ? oldPrev.id : null) !== prevId || (oldPrev && o.fromCity === oldPrev.toCity && oldPrev.toCity !== prevCity)) s.fromCity = prevCity;
          return s;
        });
        const sub = out.map((s) => s.toCity).join(' • ');
        put({ ...t, stages: wzRedate(out, d.startDate), meta: { ...t.meta, ...(!t.meta.subtitle ? { subtitle: sub } : {}) } }, '');
        setSd(rows.map((x) => ({ ...x, city: x.city.trim() })));
        return true;
      };
      // ---- Schritt 5: Details ----
      const initDd = (i) => {
        const s = (tripRef.current.stages || [])[i]; if (!s) { setDd(null); return; }
        const rt = s.routeToHotel || {}, h = s.hotel || {}; const km = wzNum(rt.distanceKm); const mn = parseDurMin(rt.duration);
        setDd({ id: s.id, name: h.name || '', address: h.address || '', checkIn: h.checkIn || '', km: km != null ? String(km) : '', hrs: mn != null ? String(Math.round(mn / 6) / 10).replace('.', ',') : '', km0: km != null ? String(km) : '', hrs0: mn != null ? String(Math.round(mn / 6) / 10).replace('.', ',') : '' });
      };
      const commitDetails = () => {
        if (!dd) return true; const t = tripRef.current; const s = (t.stages || []).find((x) => x.id === dd.id); if (!s) return true;
        const rt = { ...(s.routeToHotel || {}) };
        if (dd.km !== dd.km0 && wzNum(dd.km) != null) rt.distanceKm = `${Math.round(wzNum(dd.km))} km (${Math.round(wzNum(dd.km) * 0.621)} mi)`;
        if (dd.hrs !== dd.hrs0 && wzNum(dd.hrs) != null) rt.duration = `${String(wzNum(dd.hrs)).replace('.', ',')} h (reine Fahrzeit)`;
        const h = { ...(s.hotel || {}), name: dd.name.trim(), address: dd.address.trim(), checkIn: dd.checkIn.trim() };
        const changed = JSON.stringify([rt, h]) !== JSON.stringify([s.routeToHotel || {}, s.hotel || {}]); if (!changed) return true;
        put({ ...t, stages: (t.stages || []).map((x) => (x.id === dd.id ? { ...x, routeToHotel: rt, hotel: h } : x)) }, '');
        setDd({ ...dd, km0: dd.km, hrs0: dd.hrs }); return true;
      };
      const [actIn, setActIn] = useState({});
      const stgActs = (s) => { const nc = Math.max(1, parseInt(s.nights, 10) || 1); return (s.localAttractions || []).map((a, i) => ({ a, _d: Math.min(nc, Math.max(1, a.day ? parseInt(a.day, 10) || 1 : (i % nc) + 1)) })); };
      const putActs = (stageId, fn) => { const t = tripRef.current; put({ ...t, stages: (t.stages || []).map((x) => (x.id === stageId ? { ...x, localAttractions: fn(x.localAttractions || [], x) } : x)) }); };
      const addAct = (stage, k) => { const nm = (actIn[k] || '').trim(); if (!nm) return; putActs(stage.id, (list) => [...list, { id: `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: nm, category: 'Aktivität', time: '', booked: '', priceEur: 0, address: '', gps: '', notes: '', day: k }]); setActIn({ ...actIn, [k]: '' }); };
      const rmAct = (stage, id) => putActs(stage.id, (list) => list.filter((a) => a.id !== id));
      const moveAct = (stage, id, k) => putActs(stage.id, (list) => list.map((a) => (a.id === id ? { ...a, day: k } : a)));
      useEffect(() => { if (cur.id === 'route' && !sd.length && budgetNights > 0 && budgetNights <= 120) setSd(Array.from({ length: budgetNights }, (_, k) => ({ id: `new-${Date.now()}-${k}`, city: '', nights: 1 }))); }, [step]);

      const commit = (id) => (id === 'frame' ? commitFrame() : id === 'people' ? commitPeople() : id === 'route' ? commitRoute() : id === 'details' ? commitDetails() : true);
      const goStep = (n, si) => {
        if (n === step && si == null) return; if (n > 0 && !wzOk(d.startDate) && cur.id !== 'frame') { setErr('Bitte zuerst Start- und Enddatum eintragen.'); setStep(0); return; }
        if (!commit(cur.id)) return; setErr(''); const ns = si != null ? si : sIdx; setSIdx(ns); setStep(n); persist(n, ns);
      };
      const next = () => {
        if (step === WZ_STEPS.length - 1) { if (!commit(cur.id)) return; setErr(''); wzSave(tid, null); onClose(); goTab('stages'); setTimeout(() => window.dispatchEvent(new CustomEvent('rt-status')), 200); return; }
        if (cur.id === 'details' && sIdx < stages.length - 1) { if (!commitDetails()) return; setSIdx(sIdx + 1); persist(step, sIdx + 1); return; }
        goStep(Math.min(WZ_STEPS.length - 1, step + 1));
      };
      const back = () => {
        if (cur.id === 'details' && sIdx > 0) { commitDetails(); setSIdx(sIdx - 1); persist(step, sIdx - 1); return; }
        if (step > 0) goStep(step - 1);
      };
      const closeSave = () => { commit(cur.id); persist(step, sIdx); onClose(); };
      const finish = (tab) => { wzSave(tid, null); onClose(); goTab(tab); };
      const launch = (stageId, which) => {
        commitDetails(); persist(step, sIdx); window.__rtAssist = { stageId, step: which }; setMin(true); goTab('stages');
        setTimeout(() => { window.dispatchEvent(new CustomEvent('rt-assist', { detail: { stageId, step: which } })); const el = document.getElementById('stage-card-' + stageId); if (el) el.scrollIntoView({ block: 'start' }); }, 450);
      };

      if (min) return <button type="button" data-wz-pill onClick={() => setMin(false)} className="fixed bottom-20 md:bottom-6 right-4 z-[65] min-h-[48px] px-5 rounded-full bg-[#1F4E8C] text-white font-bold shadow-xl border-2 border-white"><Ic n="compass" />Zurück zum Schritt-Assistenten</button>;

      const thr = Number(d.maxDrive) || 5; const prevCity = (i) => (i > 0 ? (sd[i - 1].city || 'Ziel') : (d.startLocation || meta.startLocation || 'Start'));
      let cursor = wzOk(d.startDate) ? d.startDate : null;
      const dates = sd.map((x) => { if (!cursor) return null; const a = cursor; const b = isoAdd(a, Number(x.nights) || 0); cursor = b; return [a, b]; });
      const upd = (i, p) => { setErr(''); setSd(sd.map((x, k) => (k === i ? { ...x, ...p } : x))); };
      const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= sd.length) return; const c = [...sd]; [c[i], c[j]] = [c[j], c[i]]; setSd(c); };
      const rm = async (i) => { const x = sd[i]; const o = stages.find((s) => s.id === x.id); const has = o && ((o.hotel && o.hotel.name) || (o.localAttractions || []).length); if (has && !(await window.rtAsk(`Die Etappe „${x.city || 'ohne Namen'}“ enthält Hotel- oder Aktionsdaten. Wirklich aus dem Plan entfernen?`))) return; setSd(sd.filter((_, k) => k !== i)); };
      const nightsLess = (i) => { const x = sd[i]; if (Number(x.nights) <= 1) return; const c = sd.map((y, k) => (k === i ? { ...y, nights: Number(y.nights) - 1 } : y)); c.splice(i + 1, 0, { id: `new-${Date.now()}-${i}`, city: '', nights: 1 }); setSd(c); setErr(''); };
      const nightsMore = (i) => { setErr(''); if (usedNights < budgetNights) { upd(i, { nights: (Number(sd[i].nights) || 0) + 1 }); return; } setSwap(i); };
      const swapRemove = async (k) => { const x = sd[k]; const o = stages.find((s) => s.id === x.id); const has = o && ((o.hotel && o.hotel.name) || (o.localAttractions || []).length); if (has && !(await window.rtAsk(`Die Etappe „${x.city || 'ohne Namen'}“ enthält Hotel- oder Aktionsdaten. Wirklich aus dem Plan entfernen?`))) return; const tgt = sd[swap].id; setSd(sd.filter((_, q) => q !== k).map((y) => (y.id === tgt ? { ...y, nights: Number(y.nights) + 1 } : y))); setSwap(null); };
      const Phase = ({ p }) => <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">{p}</span>;

      const checks = (() => {
        const items = []; const ok = (t) => items.push({ ok: true, t }); const bad = (t, fix) => items.push({ ok: false, t, fix });
        if (wzOk(meta.startDate) && wzOk(meta.endDate)) ok(`Reisezeitraum ${wzRange(meta.startDate, meta.endDate)} (${tripDayCount(meta.startDate, meta.endDate)} Tage)`); else bad('Start- oder Enddatum fehlt', () => goStep(0));
        const nn = stages.reduce((a, s) => a + (parseInt(s.nights, 10) || 0), 0); const want = tripDayCount(meta.startDate, meta.endDate) - 1;
        if (stages.length === 0) bad('Es gibt noch keine Etappen', () => goStep(2));
        else if (want >= 0 && nn === want) ok(`Nächte passen: ${nn} Nächte für ${stages.length} Etappen`);
        else if (want >= 0) bad(`${nn} Nächte verplant, die Reise hat ${want}. ${nn < want ? `Es fehlen ${want - nn}.` : `${nn - want} zu viel.`}`, () => goStep(2));
        stages.forEach((s, i) => {
          const nm = s.toCity || `Etappe ${i + 1}`;
          if (!s.toCity || s.toCity === 'Ort eintragen') bad(`Etappe ${i + 1}: Ort fehlt`, () => goStep(2));
          if (!(s.hotel && s.hotel.name)) bad(`${i + 1}. ${nm}: Unterkunft fehlt`, () => goStep(3, i));
          const mn = parseDurMin(s.routeToHotel && s.routeToHotel.duration);
          if (i > 0 && mn == null) bad(`${i + 1}. ${nm}: Fahrzeit fehlt`, () => goStep(3, i));
          else if (mn != null && mn > thr * 60) bad(`${i + 1}. ${nm}: ${fmtDurMin(mn)} Fahrzeit, über deiner Grenze von ${thr} Std.`, () => goStep(3, i));
        });
        if (!(trip.flights || []).length) bad('Noch kein Flug eingetragen (unter Buchungen)', () => finish('basics')); else ok('Flug eingetragen');
        if (!(trip.rentalCars || []).length) bad('Noch kein Mietwagen eingetragen (unter Buchungen)', () => finish('basics')); else ok('Mietwagen eingetragen');
        return items;
      })();

      const stg = stages[Math.min(sIdx, Math.max(0, stages.length - 1))];
      return (
        <div data-wz className="fixed inset-0 z-[70] bg-slate-950/75 flex items-stretch sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Reise einrichten">
          <div className="bg-white w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-full overflow-hidden">
            <div className="bg-[#1F4E8C] text-white px-4 sm:px-5 pt-4 pb-3 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div><Phase p={`${cur.ph} · Schritt ${step + 1} von ${WZ_STEPS.length}`} /><h2 className="text-xl font-bold mt-0.5">{cur.label}</h2></div>
                <button type="button" data-wz-close onClick={closeSave} className="min-h-[40px] px-3 rounded-lg border border-white/50 text-sm font-semibold hover:bg-white/10">Später weitermachen</button>
              </div>
              <div className="mt-3 flex gap-1.5" role="tablist" aria-label="Schritte">
                {WZ_STEPS.map((s, i) => <button key={s.id} type="button" role="tab" aria-selected={i === step} data-wz-chip={s.id} onClick={() => goStep(i)} title={s.label} className={`flex-1 h-2.5 rounded-full ${i < step ? 'bg-emerald-300' : i === step ? 'bg-white' : 'bg-white/30'} ${i === 2 ? 'ml-2' : ''}`} />)}
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-blue-100"><span>Grundrahmen</span><span>Etappen</span></div>
            </div>
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1" data-wz-body>
              {cur.id === 'frame' && <>
                <p className="text-sm text-slate-700">Zuerst der Rahmen: Wann geht es los und wie viele Übernachtungen sind es? Daraus ergibt sich die Zahl der Etappen von selbst.</p>
                <label className="block text-sm font-semibold text-slate-900">Name der Reise<input data-wz-title type="text" value={d.title} onChange={(e) => setF({ title: e.target.value })} placeholder="z. B. Florida Rundreise" className={WZ_IN} /></label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="block text-sm font-semibold text-slate-900">Erster Reisetag<input data-wz-start type="date" value={d.startDate} onChange={(e) => setStartD(e.target.value)} className={WZ_IN} /></label>
                  <label className="block text-sm font-semibold text-slate-900">Übernachtungen<input data-wz-nights-in type="number" min="1" max="119" inputMode="numeric" value={d.nights} onChange={(e) => setNightsD(e.target.value)} placeholder="z. B. 10" className={WZ_IN} /></label>
                  <label className="block text-sm font-semibold text-slate-900">Letzter Reisetag<input data-wz-end type="date" min={d.startDate || undefined} value={d.endDate} onChange={(e) => setEndD(e.target.value)} className={WZ_IN} /></label>
                </div>
                <div aria-live="polite" data-wz-summary className="rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-950">{budgetNights > 0 ? `${budgetNights} Übernachtungen ergeben ${budgetNights} Etappen mit je einer Nacht. Wenn du später eine Etappe verlängerst, entfällt dafür eine andere.` : 'Trage den ersten Tag und die Zahl der Übernachtungen ein, das Enddatum wird berechnet (oder umgekehrt).'}</div>
              </>}
              {cur.id === 'people' && <>
                <p className="text-sm text-slate-700">Wer reist mit, wo startest du und wie viel willst du pro Tag fahren? Das Budget erscheint später im Reiter Budget.</p>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">Reisende</div>
                  {names.map((x, i) => (
                    <div key={i} className="flex gap-2"><input data-wz-name type="text" aria-label={`Name Reisende ${i + 1}`} value={x.name} onChange={(e) => setNames(names.map((y, k) => (k === i ? { ...y, name: e.target.value } : y)))} placeholder={`Reisende ${i + 1}`} className={WZ_IN.replace('mt-1 ', '')} />
                      {!x.old && names.length > 1 && <button type="button" aria-label="Entfernen" onClick={() => setNames(names.filter((_, k) => k !== i))} className="h-11 w-11 rounded-lg border border-slate-300 text-slate-700">×</button>}</div>
                  ))}
                  {names.length < 20 && <button type="button" data-wz-addperson onClick={() => setNames([...names, { id: '', name: '', old: false }])} className="v18-btn sm">+ Person hinzufügen</button>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-sm font-semibold text-slate-900">Budget (optional)<input data-wz-budget type="text" inputMode="decimal" value={d.budget} onChange={(e) => setF({ budget: e.target.value })} placeholder="z. B. 5000" className={WZ_IN} /></label>
                  <label className="block text-sm font-semibold text-slate-900">Währung<select value={d.currency} onChange={(e) => setF({ currency: e.target.value })} className={WZ_IN}><option value="EUR">EUR (€)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option><option value="CHF">CHF</option></select></label>
                </div>
                <div className="text-sm font-bold text-slate-900 pt-2">Start und Fahren</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-sm font-semibold text-slate-900">Start / Abflughafen<input data-place="city" data-wz-from type="text" value={d.startLocation} onChange={(e) => setF({ startLocation: e.target.value })} placeholder="z. B. München (MUC)" className={WZ_IN} /></label>
                  <label className="block text-sm font-semibold text-slate-900">Zielregion<input data-place="city" type="text" value={d.destination} onChange={(e) => setF({ destination: e.target.value })} placeholder="z. B. Florida" className={WZ_IN} /></label>
                  <label className="block text-sm font-semibold text-slate-900">Rückreise von (optional)<input data-place="city" type="text" value={d.endLocation} onChange={(e) => setF({ endLocation: e.target.value })} placeholder="z. B. Orlando (MCO)" className={WZ_IN} /></label>
                  <label className="block text-sm font-semibold text-slate-900">Fahrzeug (optional)<input type="text" value={d.vehicle} onChange={(e) => setF({ vehicle: e.target.value })} placeholder="z. B. Mietwagen SUV" className={WZ_IN} /></label>
                </div>
                <label className="block text-sm font-semibold text-slate-900">Maximale Fahrzeit pro Tag<select value={d.maxDrive} onChange={(e) => setF({ maxDrive: e.target.value })} className={WZ_IN}>{[2, 3, 4, 5, 6, 7, 8, 10].map((h) => <option key={h} value={h}>{h} Stunden</option>)}</select></label>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-950">Flüge und Mietwagen trägst du unter „Buchungen“ ein. Der Planungsstand unter „Planen“ erinnert dich daran.</div>
                            </>}
              {cur.id === 'route' && <>
                <p className="text-sm text-slate-700">Pro Nacht eine Etappe: Trage ein, wo du übernachtest. Die Daten rechnet der Assistent selbst aus. Brauchst du an einem Ort mehr Nächte, tippe auf „+“. Dafür entfällt dann eine andere Etappe, die Reise bleibt bei {budgetNights} Nächten.</p>
                <div data-wz-balance className={`rounded-xl border px-4 py-3 text-sm font-semibold ${usedNights === budgetNights ? 'border-emerald-400 bg-emerald-50 text-emerald-950' : 'border-amber-400 bg-amber-50 text-amber-950'}`}>
                  {usedNights === budgetNights ? `Passt: ${sd.length} Etappen für ${budgetNights} Nächte.` : usedNights < budgetNights ? `${usedNights} von ${budgetNights} Nächten verplant, ${budgetNights - usedNights} frei.` : `${usedNights} Nächte verplant, die Reise hat nur ${budgetNights}.`}
                  {usedNights < budgetNights && <button type="button" data-wz-addstage onClick={() => setSd([...sd, ...Array.from({ length: budgetNights - usedNights }, (_, k) => ({ id: `new-${Date.now()}-${k}`, city: '', nights: 1 }))])} className="ml-2 underline">Etappe(n) für freie Nächte anlegen</button>}
                  {usedNights > budgetNights && <button type="button" data-wz-fitend onClick={() => setEndD(isoAdd(d.startDate, usedNights))} className="ml-2 underline">Reiseende auf {wzDM(isoAdd(d.startDate, usedNights))}{isoAdd(d.startDate, usedNights).slice(0, 4)} setzen</button>}
                </div>
                {swap != null && sd[swap] && (
                  <div data-wz-swap role="alertdialog" className="rounded-xl border-2 border-[#1F4E8C] bg-blue-50 p-3 space-y-2">
                    <div className="text-sm font-bold text-slate-900">Welche Etappe soll dafür entfallen?</div>
                    <div className="text-xs text-slate-700">„{sd[swap].city || `Etappe ${swap + 1}`}“ bekommt eine Nacht mehr. Damit die Reise bei {budgetNights} Nächten bleibt, muss eine andere Etappe mit einer Nacht wegfallen.</div>
                    <div className="flex flex-wrap gap-1.5">
                      {sd.map((x, k) => (k !== swap && Number(x.nights) === 1) ? <button key={x.id} type="button" data-wz-swap-pick={k} onClick={() => swapRemove(k)} className="px-3 min-h-[38px] rounded-full border border-slate-400 bg-white text-sm font-semibold text-slate-900">{k + 1}. {x.city || 'ohne Ort'}</button> : null)}
                    </div>
                    {!sd.some((x, k) => k !== swap && Number(x.nights) === 1) && <div className="text-xs text-rose-900">Es gibt keine Etappe mit nur einer Nacht, die entfallen könnte.</div>}
                    <button type="button" data-wz-swap-cancel onClick={() => setSwap(null)} className="v18-btn sm">Abbrechen</button>
                  </div>
                )}
                <ol className="space-y-2">
                  {sd.map((x, i) => (
                    <li key={x.id} data-wz-row className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="h-8 w-8 shrink-0 rounded-full bg-[#1F4E8C] text-white font-bold flex items-center justify-center text-sm">{i + 1}</span>
                        <input data-place="city" data-wz-city type="text" aria-label={`Ort der Etappe ${i + 1}`} value={x.city} onChange={(e) => upd(i, { city: e.target.value })} placeholder={i === 0 ? 'Erster Übernachtungsort, z. B. Miami' : 'Ort der Übernachtung'} className="flex-1 min-w-[140px] h-11 px-3 rounded-lg border border-slate-300 bg-white text-slate-900" />
                        <div className="flex items-center gap-1" aria-label="Nächte">
                          <button type="button" aria-label="Eine Nacht weniger" data-wz-less disabled={Number(x.nights) <= 1} onClick={() => nightsLess(i)} className="h-11 w-11 rounded-lg border border-slate-300 text-lg font-bold disabled:opacity-30">−</button>
                          <span data-wz-nights className="w-20 text-center text-sm font-bold text-slate-900">{x.nights} {Number(x.nights) === 1 ? 'Nacht' : 'Nächte'}</span>
                          <button type="button" aria-label="Eine Nacht mehr" data-wz-more onClick={() => nightsMore(i)} className="h-11 w-11 rounded-lg border border-slate-300 text-lg font-bold">+</button>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" aria-label="Nach oben" disabled={i === 0} onClick={() => move(i, -1)} className="h-9 w-9 rounded-lg border border-slate-300 disabled:opacity-30">↑</button>
                          <button type="button" aria-label="Nach unten" disabled={i === sd.length - 1} onClick={() => move(i, 1)} className="h-9 w-9 rounded-lg border border-slate-300 disabled:opacity-30">↓</button>
                          <button type="button" aria-label="Etappe entfernen" data-wz-rm onClick={() => rm(i)} className="h-9 w-9 rounded-lg border border-slate-300 text-slate-700">🗑</button>
                        </div>
                      </div>
                      <div className="mt-1.5 text-xs text-slate-600">{prevCity(i)} → {x.city || 'Ort'}{dates[i] ? ` · ${wzRange(dates[i][0], dates[i][1])}` : ''}</div>
                    </li>
                  ))}
                </ol>
              </>}
              {cur.id === 'details' && (stg && dd && dd.id === stg.id ? <>
                <div className="flex flex-wrap gap-1.5" data-wz-stagechips>
                  {stages.map((s, i) => <button key={s.id} type="button" data-wz-stage={i} aria-pressed={i === sIdx} onClick={() => { commitDetails(); setSIdx(i); persist(step, i); }} className={`px-3 min-h-[36px] rounded-full border text-sm font-semibold ${i === sIdx ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300 text-slate-900'}`}>{i + 1}. {s.toCity || 'Etappe'}</button>)}
                </div>
                <div className="text-sm text-slate-700">Etappe {sIdx + 1} von {stages.length}: <b>{(sIdx > 0 ? stages[sIdx - 1].toCity : (meta.startLocation || 'Start'))} → {stg.toCity}</b> · {stg.dateRange} · {stg.nights} {Number(stg.nights) === 1 ? 'Nacht' : 'Nächte'}</div>
                <fieldset className="rounded-xl border border-slate-200 p-3 space-y-3"><legend className="px-1 text-sm font-bold text-slate-900"><Ic n="car" />Anfahrt</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-sm font-semibold text-slate-900">Strecke (km)<input data-wz-km type="text" inputMode="decimal" value={dd.km} onChange={(e) => setDd({ ...dd, km: e.target.value })} className={WZ_IN} /></label>
                    <label className="block text-sm font-semibold text-slate-900">Fahrzeit (Std.)<input data-wz-hrs type="text" inputMode="decimal" value={dd.hrs} onChange={(e) => setDd({ ...dd, hrs: e.target.value })} placeholder="z. B. 3,5" className={WZ_IN} /></label>
                  </div>
                  {wzNum(dd.hrs) != null && wzNum(dd.hrs) > thr && <div className="text-sm rounded-lg border border-red-300 bg-red-50 text-red-900 px-3 py-2">Das liegt über deiner Grenze von {thr} Std. Plane einen Zwischenstopp oder teile die Etappe.</div>}
                  <button type="button" data-wz-launch="way" onClick={() => launch(stg.id, 'way')} className="v18-btn sm"><Ic n="flag" />Ziele auf dem Weg vorschlagen lassen</button>
                </fieldset>
                <fieldset className="rounded-xl border border-slate-200 p-3 space-y-3"><legend className="px-1 text-sm font-bold text-slate-900"><Ic n="hotel" />Unterkunft{Number(stg.nights) > 1 ? ` (eine für alle ${stg.nights} Nächte)` : ''}</legend>
                  <label className="block text-sm font-semibold text-slate-900">Name<input data-wz-hotel type="text" value={dd.name} onChange={(e) => setDd({ ...dd, name: e.target.value })} className={WZ_IN} /></label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="block text-sm font-semibold text-slate-900 sm:col-span-2">Adresse<input data-place="addr" data-place-near={(stg && stg.toCity) || ''} type="text" value={dd.address} onChange={(e) => setDd({ ...dd, address: e.target.value })} className={WZ_IN} /></label>
                    <label className="block text-sm font-semibold text-slate-900">Check-in<input type="text" value={dd.checkIn} onChange={(e) => setDd({ ...dd, checkIn: e.target.value })} placeholder="z. B. ab 15 Uhr" className={WZ_IN} /></label>
                  </div>
                  <button type="button" data-wz-launch="hotel" onClick={() => launch(stg.id, 'hotel')} className="v18-btn sm"><Ic n="hotel" />Hotels suchen und vergleichen</button>
                </fieldset>
                <fieldset data-wz-acts className="rounded-xl border border-slate-200 p-3 space-y-3"><legend className="px-1 text-sm font-bold text-slate-900">★ Aktivitäten pro Tag</legend>
                  {(() => {
                    const nc = Math.max(1, parseInt(stg.nights, 10) || 1); const rg = parseStageRanges(stages, meta.startDate)[Math.min(sIdx, stages.length - 1)]; const all = stgActs(stg);
                    return Array.from({ length: nc }, (_, q) => q + 1).map((k) => {
                      const list = all.filter((x) => x._d === k);
                      return (
                        <div key={k} data-wz-day={k} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                          <div className="text-sm font-bold text-slate-900">{nc > 1 ? `Tag ${k}` : 'Tag'}{rg ? ` · ${ovWeekday(isoAdd(rg.start, k - 1))}` : ''}</div>
                          {list.length === 0 && <div className="text-xs text-slate-600">Noch nichts geplant.</div>}
                          <ul className="space-y-1">
                            {list.map(({ a }) => (
                              <li key={a.id || a.name} data-wz-act className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
                                <span className="flex-1 min-w-0 break-words text-slate-900">{a.name}</span>
                                {nc > 1 && <select aria-label="Tag ändern" value={k} onChange={(e) => moveAct(stg, a.id, Number(e.target.value))} className="h-8 px-1 rounded border border-slate-300 bg-white text-xs text-slate-900">{Array.from({ length: nc }, (_, z) => z + 1).map((z) => <option key={z} value={z}>Tag {z}</option>)}</select>}
                                <button type="button" aria-label="Entfernen" onClick={() => rmAct(stg, a.id)} className="h-8 w-8 rounded-full border border-slate-300 text-slate-700">×</button>
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-2">
                            <input data-wz-act-in type="text" value={actIn[k] || ''} onChange={(e) => setActIn({ ...actIn, [k]: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') addAct(stg, k); }} placeholder="Aktivität eintragen" className="flex-1 min-w-0 h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900" />
                            <button type="button" data-wz-act-add disabled={!(actIn[k] || '').trim()} onClick={() => addAct(stg, k)} className="v18-btn pri sm disabled:opacity-40">Hinzufügen</button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  <button type="button" data-wz-launch="do" onClick={() => launch(stg.id, 'do')} className="v18-btn sm">★ Unternehmungen vorschlagen lassen</button>
                </fieldset>
                <p className="text-xs text-slate-600">Die Vorschlags-Assistenten öffnen sich in der Etappe. Danach bringt dich der Button „Zurück zum Schritt-Assistenten“ genau hierher zurück.</p>
              </> : (stages.length ? null : <div className="text-sm text-slate-700">Es gibt noch keine Etappen. Lege sie im Schritt „Route festlegen“ an.</div>))}
              {cur.id === 'check' && <>
                <p className="text-sm text-slate-700">Zum Schluss ein Check: Alles Grüne ist erledigt, bei Rotem kannst du mit einem Klick direkt hin.</p>
                <ul className="space-y-1.5" data-wz-checks>
                  {checks.map((c, i) => (
                    <li key={i} data-wz-check={c.ok ? 'ok' : 'todo'} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${c.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-amber-400 bg-amber-50 text-amber-950'}`}>
                      <span aria-hidden="true">{c.ok ? <Ic n="check" /> : <Ic n="warn" />}</span><span className="flex-1">{c.t}</span>
                      {!c.ok && c.fix && <button type="button" onClick={c.fix} className="min-h-[34px] px-3 rounded-full border border-amber-700 bg-white text-xs font-bold text-amber-950">Ändern</button>}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button type="button" data-wz-finish="overview" onClick={() => finish('overview')} className="v18-btn pri">Zur Übersicht</button>
                  <button type="button" data-wz-finish="stages" onClick={() => finish('stages')} className="v18-btn">Zu den Etappen</button>
                </div>
              </>}
              {err && <div role="alert" data-wz-err className="rounded-xl border border-rose-400 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-950">{err}</div>}
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-5 py-3 flex items-center justify-between gap-2 shrink-0">
              <button type="button" data-wz-back disabled={step === 0 && sIdx === 0} onClick={back} className="min-h-[44px] px-4 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold text-sm disabled:opacity-40">Zurück</button>
              {cur.id !== 'check' && <button type="button" data-wz-next onClick={next} className="min-h-[44px] px-6 rounded-lg bg-[#1F4E8C] text-white font-bold text-sm">{step === WZ_STEPS.length - 1 ? 'Fertig' : 'Weiter'}</button>}
            </div>
          </div>
        </div>
      );
    }

    