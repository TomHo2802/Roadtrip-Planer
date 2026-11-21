/* ===== v105: Buchen als Liste, Kalender-Export, Karten vorab laden, Kassenzettel ===== */
    const rtDeIso = (s) => { const t = String(s || ''); const m = /(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(t); if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; return /^\d{4}-\d{2}-\d{2}/.test(t) ? t.slice(0, 10) : ''; };
    const rtIsoNow = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    const rtDaysTo = (iso) => (iso ? Math.round((Date.parse(iso + 'T12:00:00') - Date.parse(rtIsoNow() + 'T12:00:00')) / 86400000) : null);
    const rtDm = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : '');
    const rtHm = (t) => { const m = /(\d{1,2})[:.](\d{2})/.exec(String(t || '')); return m && Number(m[1]) < 24 ? `${m[1].padStart(2, '0')}:${m[2]}` : ''; };
    const rtEur = (n) => formatEur(Math.round((Number(n) || 0) * 100) / 100);
    // Buchungsstand: eigener Schalter „booked“ (ja/nein), sonst die bisherige Regel
    const rtBooked = (kind, o, trip) => {
      if (!o) return false; const b = String(o.booked || '').toLowerCase();
      if (b === 'ja') return true; if (b === 'nein') return false;
      const legacy = !trip || (trip.meta && trip.meta.isDemo);
      if (kind === 'hotel') return legacy ? rtHotelPrice(o) > 0 : !!(String(o.bookingCode || o.confirmation || '').trim());
      return !!(String(o.bookingCode || '').trim() || (legacy && Number(o.priceNewEur) > 0));
    };
    const rtStorno = (o) => { const iso = rtDeIso(o && o.cancelUntil); if (!iso) return null; const d = rtDaysTo(iso); return { iso, d, txt: d < 0 ? `Storno-Frist am ${rtDm(iso)} vorbei` : d === 0 ? 'Storno nur noch heute' : d <= 7 ? `Storno bis ${rtDm(iso)} · noch ${d} ${d === 1 ? 'Tag' : 'Tage'}` : `Storno bis ${rtDm(iso)}`, warn: d >= 0 && d <= 7, past: d < 0 }; };
    const RT_SVG = {
      plane: <path d="M10.5 3.5l1.5-1 1.5 1V9l7 4v2l-7-2v4.5l2 1.5v1.5L12 20l-3.5 1.5V20l2-1.5V13l-7 2v-2l7-4z" />,
      car: <><path d="M5 16V11l2-5h10l2 5v5" /><path d="M3 16h18v3H3z" /><circle cx="7.5" cy="19" r="1.5" /><circle cx="16.5" cy="19" r="1.5" /></>,
      bed: <><path d="M3 18V7" /><path d="M3 14h18v4" /><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="2" /></>,
      cam: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
      cal: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
      map: <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></>,
    };
    const RtI = ({ n, s }) => <svg width={s || 20} height={s || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{RT_SVG[n]}</svg>;

    // ---------- Kalender (.ics) ----------
    const icsEsc = (t) => String(t || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');
    const icsFold = (l) => { const out = []; let s = l; while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); } out.push(s); return out.join('\r\n'); };
    const icsD = (iso) => iso.replace(/-/g, '');
    const icsDT = (iso, hm) => `${icsD(iso)}T${hm.replace(':', '')}00`;
    const icsPlus = (iso, hm, min) => { const [y, mo, d] = iso.split('-').map(Number); const [h, mi] = hm.split(':').map(Number); const t = new Date(Date.UTC(y, mo - 1, d, h, mi + min)); const p = (n) => String(n).padStart(2, '0'); return `${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}T${p(t.getUTCHours())}${p(t.getUTCMinutes())}00`; };
    function rtIcsEvents(trip) {
      const ev = []; const stages = trip.stages || []; const ranges = parseStageRanges(stages, trip.meta && trip.meta.startDate);
      (trip.flights || []).filter(rtFlightFilled).forEach((f) => { const iso = rtDeIso(f.departureDate), hm = rtHm(f.departureTime); if (!iso) return; ev.push({ uid: 'fl-' + f.id, iso, hm, min: 60, title: `Flug ${[f.airline, f.flightNumber].filter(Boolean).join(' ')} ${[f.from, f.to].filter(Boolean).join(' → ')}`.trim(), desc: [f.direction, f.arrivalTime && `Ankunft ${f.arrivalTime} (Ortszeit)`, f.bookingCode && `Buchungscode ${f.bookingCode}`, f.seats, f.luggage].filter(Boolean).join('\n'), loc: f.from }); });
      (trip.rentalCars || []).filter(rtCarFilled).forEach((c) => {
        const a = rtDeIso(c.pickupDate), b = rtDeIso(c.dropoffDate);
        if (a) ev.push({ uid: 'carp-' + c.id, iso: a, hm: rtHm(c.pickupTime), min: 60, title: `Mietwagen abholen: ${c.provider || ''}`.trim(), desc: [c.carClass, c.bookingCode && `Buchung ${c.bookingCode}`, c.pickupTime].filter(Boolean).join('\n'), loc: c.pickupLocation });
        if (b) ev.push({ uid: 'card-' + c.id, iso: b, hm: rtHm(c.dropoffTime), min: 60, title: `Mietwagen zurückgeben: ${c.provider || ''}`.trim(), desc: c.dropoffTime || '', loc: c.dropoffLocation });
        const st = rtStorno(c); if (st && !st.past) ev.push({ uid: 'cars-' + c.id, iso: st.iso, allDay: true, title: `Storno-Frist Mietwagen ${c.provider || ''}`.trim(), desc: 'Letzter Tag für eine kostenlose Stornierung.', alarm: true });
      });
      stages.forEach((s, i) => {
        const r = ranges[i]; if (!r) return; const h = s.hotel || {};
        if (h.name && r.end > r.start) ev.push({ uid: 'h-' + s.id, iso: r.start, end: r.end, allDay: true, title: `Hotel: ${h.name}`, desc: [`Etappe ${i + 1}: ${s.fromCity || ''} → ${s.toCity || ''}`, h.checkIn && `Check-in ${h.checkIn}`, h.checkOut && `Check-out ${h.checkOut}`, rtBooked('hotel', h) ? 'gebucht' : 'noch nicht gebucht'].filter(Boolean).join('\n'), loc: h.address });
        const st = rtStorno(h); if (h.name && st && !st.past) ev.push({ uid: 'hs-' + s.id, iso: st.iso, allDay: true, title: `Storno-Frist: ${h.name}`, desc: 'Letzter Tag für eine kostenlose Stornierung.', alarm: true });
        const nc = Math.max(1, parseInt(s.nights, 10) || 1);
        (s.localAttractions || []).forEach((a, k) => { const hm = rtHm(a.time); if (!hm || !a.name) return; const d = Math.min(nc, Math.max(1, a.day ? parseInt(a.day, 10) || 1 : (k % nc) + 1)); ev.push({ uid: 'a-' + (a.id || s.id + '-' + k), iso: isoAdd(r.start, d - 1), hm, min: 120, title: a.name, desc: [a.category, a.booked && `Buchung: ${a.booked}`, a.notes].filter(Boolean).join('\n'), loc: a.address }); });
      });
      return ev;
    }
    function rtIcsText(trip) {
      const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
      const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Roadtrip-Planer//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + icsEsc((trip.meta || {}).title || 'Roadtrip')];
      rtIcsEvents(trip).forEach((e) => {
        L.push('BEGIN:VEVENT', `UID:${e.uid}@roadtrip-planer`, `DTSTAMP:${now}`);
        if (e.allDay || !e.hm) { L.push(`DTSTART;VALUE=DATE:${icsD(e.iso)}`, `DTEND;VALUE=DATE:${icsD(e.end || isoAdd(e.iso, 1))}`); }
        else L.push(`DTSTART:${icsDT(e.iso, e.hm)}`, `DTEND:${icsPlus(e.iso, e.hm, e.min || 60)}`);
        L.push('SUMMARY:' + icsEsc(e.title)); if (e.desc) L.push('DESCRIPTION:' + icsEsc(e.desc)); if (e.loc) L.push('LOCATION:' + icsEsc(e.loc));
        if (e.alarm) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(e.title), 'TRIGGER:-PT12H', 'END:VALARM');
        L.push('END:VEVENT');
      });
      L.push('END:VCALENDAR'); return L.map(icsFold).join('\r\n') + '\r\n';
    }
    const rtSaveFile = async (blob, name) => {
      try { const f = new File([blob], name, { type: blob.type }); if (navigator.canShare && navigator.canShare({ files: [f] }) && /iphone|ipad|android/i.test(navigator.userAgent)) { await navigator.share({ files: [f], title: name }); return 'shared'; } } catch (e) { if (e && e.name === 'AbortError') return 'abort'; }
      const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000); return 'download';
    };
    const rtFileName = (trip, ext) => `${String((trip.meta || {}).title || 'Roadtrip').replace(/[^\wäöüÄÖÜß-]+/g, '_').replace(/_+/g, '_').slice(0, 60)}.${ext}`;
    function RtIcsButton({ trip, className }) {
      const [msg, setMsg] = useState(''); const n = useMemo(() => rtIcsEvents(trip).length, [trip]);
      const go = async () => { const r = await rtSaveFile(new Blob([rtIcsText(trip)], { type: 'text/calendar' }), rtFileName(trip, 'ics')); if (r !== 'abort') setMsg(`${n} Termine exportiert. Datei im Kalender öffnen.`); };
      return <span className="sp3-icsw"><button type="button" data-readonly-allow data-ics onClick={go} disabled={!n} className={className || 'sp3-btn'}><RtI n="cal" s={18} /> In den Kalender</button>{msg && <span role="status" className="sp3-mute">{msg}</span>}</span>;
    }

    // ---------- Buchen als Liste ----------
    function RtBookList({ trip, save, goStage, editFlight, editCar, newFlight, newCar }) {
      const [only, setOnly] = useState(false); const [open, setOpen] = useState(null);
      const stages = trip.stages || [];
      const items = [];
      (trip.flights || []).filter(rtFlightFilled).forEach((f) => items.push({ k: 'fl:' + f.id, kind: 'flight', grp: 'Flüge', icon: 'plane', o: f, title: [f.direction, [f.airline, f.flightNumber].filter(Boolean).join(' ')].filter(Boolean).join(': ') || 'Flug', sub: [f.departureDate, rtHm(f.departureTime), [f.from, f.to].filter(Boolean).join(' → ')].filter(Boolean).join(' · '), price: Number(f.priceNewEur) || 0 }));
      (trip.rentalCars || []).filter(rtCarFilled).forEach((c) => items.push({ k: 'car:' + c.id, kind: 'car', grp: 'Mietwagen', icon: 'car', o: c, title: c.provider || 'Mietwagen', sub: [c.pickupDate && `${c.pickupDate} – ${c.dropoffDate || '?'}`, c.carClass].filter(Boolean).join(' · '), price: Number(c.priceNewEur) || 0 }));
      stages.forEach((s, i) => { if (rtIsRet(stages, i)) return; const h = s.hotel || null; const has = !!(h && String(h.name || '').trim()); items.push({ k: 'h:' + s.id, kind: 'hotel', grp: 'Hotels', icon: 'bed', o: has ? h : null, s, i, title: has ? h.name : 'Hotel fehlt noch', sub: `Etappe ${i + 1} · ${s.toCity || '?'} · ${rtSpDate(s.dateRange)}`, price: has ? rtHotelPrice(h) : 0, missing: !has }); });
      items.forEach((it) => { it.ok = !it.missing && rtBooked(it.kind, it.o, trip); it.st = it.o ? rtStorno(it.o) : null; });
      const shown = only ? items.filter((it) => !it.ok) : items;
      const nOk = items.filter((it) => it.ok).length, sum = items.reduce((a, it) => a + (it.ok ? it.price : 0), 0);
      const warn = items.filter((it) => it.st && it.st.warn);
      const setBooked = (it, v) => {
        const val = v ? 'ja' : 'nein';
        if (it.kind === 'flight') save({ ...trip, flights: (trip.flights || []).map((x) => (x.id === it.o.id ? { ...x, booked: val } : x)) }, v ? 'Flug als gebucht markiert' : 'Flug als offen markiert');
        else if (it.kind === 'car') save({ ...trip, rentalCars: (trip.rentalCars || []).map((x) => (x.id === it.o.id ? { ...x, booked: val } : x)) }, v ? 'Mietwagen als gebucht markiert' : 'Mietwagen als offen markiert');
        else save({ ...trip, stages: stages.map((x) => (x.id === it.s.id ? { ...x, hotel: { ...(x.hotel || {}), booked: val } } : x)) }, v ? 'Hotel als gebucht markiert' : 'Hotel als offen markiert');
      };
      const groups = ['Flüge', 'Mietwagen', 'Hotels'];
      return (
        <div data-book-list className="sp3">
          <div className="sp3-tiles">
            <div className="sp3-tile"><b data-book-count>{nOk} von {items.length}</b><small>gebucht</small></div>
            <div className="sp3-tile"><b>{sum ? rtEur(sum) : '–'}</b><small>gebuchte Summe</small></div>
            <div className={`sp3-tile${items.length - nOk ? ' miss' : ''}`}><b>{items.length - nOk}</b><small>noch offen</small></div>
          </div>
          {warn.length > 0 && <div role="status" data-book-warn className="sp3-warn">{warn.map((it) => <div key={it.k}><b>{it.title}:</b> {it.st.txt}</div>)}</div>}
          <div className="sp3-acts">
            <div className="sp3-seg2" role="group" aria-label="Anzeige"><button type="button" data-readonly-allow aria-pressed={!only} onClick={() => setOnly(false)}>Alle</button><button type="button" data-readonly-allow data-book-only aria-pressed={only} onClick={() => setOnly(true)}>Nur offene</button></div>
            <RtIcsButton trip={trip} />
          </div>
          <div className="rt3-cols">
          {groups.map((g) => { const L = shown.filter((it) => it.grp === g); const all = items.filter((it) => it.grp === g); if (!all.length && g === 'Hotels') return null; return (
            <section key={g} aria-label={g} className="sp3-sec">
              <h2 className="sp3-h">{g}</h2>
              <div className="sp3-card list">
                {!L.length && <p className="sp3-empty">{all.length ? 'Alles gebucht.' : g === 'Flüge' ? 'Noch kein Flug eingetragen.' : 'Noch kein Mietwagen eingetragen.'}</p>}
                {L.map((it) => { const isO = open === it.k; return (
                  <div key={it.k} data-book-row={it.ok ? 'booked' : 'open'} className={`sp3-row${isO ? ' open' : ''}`}>
                    <button type="button" data-readonly-allow className="sp3-rowbtn" aria-expanded={isO} onClick={() => setOpen(isO ? null : it.k)}>
                      <span className={`sp3-lead ico${it.ok ? '' : ' miss'}`}><RtI n={it.icon} s={18} /></span>
                      <span className="sp3-grow"><span className="sp3-rt">{it.title}</span><span className="sp3-mute">{[it.sub, it.o && it.o.creditCard, it.price ? rtEur(it.price) : ''].filter(Boolean).join(' · ')}</span>{it.st && it.st.warn && <span className="sp3-stw">{it.st.txt}</span>}</span>
                      <span data-book-badge className={`sp3-chip ${it.ok ? 'ok' : 'miss'}`}>{it.missing ? 'fehlt' : it.ok ? 'gebucht' : 'offen'}</span>
                    </button>
                    {isO && <div className="sp3-rowbody">
                      {it.st && !it.st.warn && !it.st.past && <p className="sp3-mute">{it.st.txt}</p>}
                      {it.o && it.o.creditCard && <div><RtCardChip name={it.o.creditCard} cards={trip.creditCards} /></div>}
                      <div className="sp3-acts">
                        {!it.missing && <button type="button" data-book-toggle aria-pressed={it.ok} className={`sp3-btn sm v18-edit-only${it.ok ? ' soft' : ''}`} onClick={() => setBooked(it, !it.ok)}>{it.ok ? '✓ Gebucht' : 'Als gebucht markieren'}</button>}
                        {it.kind === 'flight' && <button type="button" className="sp3-btn sm v18-edit-only" data-book-edit onClick={() => editFlight(it.o)}>Bearbeiten</button>}
                        {it.kind === 'car' && <button type="button" className="sp3-btn sm v18-edit-only" data-book-edit onClick={() => editCar(it.o)}>Bearbeiten</button>}
                        {it.kind === 'hotel' && <button type="button" data-readonly-allow className={`sp3-btn sm${it.missing ? ' pri' : ''}`} data-book-open onClick={() => goStage(it.s)}>{it.missing ? 'Hotel suchen' : 'In der Etappe öffnen'}</button>}
                      </div>
                    </div>}
                  </div>); })}
                {g === 'Flüge' && <div className="sp3-addrow v18-edit-only"><button type="button" data-book-add="flight" className="sp3-btn" onClick={newFlight}>+ Flug</button></div>}
                {g === 'Mietwagen' && <div className="sp3-addrow v18-edit-only"><button type="button" data-book-add="car" className="sp3-btn" onClick={newCar}>+ Mietwagen</button></div>}
              </div>
            </section>); })}
          </div>
          <p className="sp3-hint">„Gebucht“ lässt sich je Eintrag umschalten. Ohne eigene Angabe gilt nur ein Eintrag mit Buchungscode als gebucht. Ein Preis allein reicht nicht.</p>
        </div>
      );
    }

    // ---------- Karten vorab laden ----------
    const TILE_CACHE = 'rt-tiles-v1';
    const tX = (lon, z) => Math.floor((lon + 180) / 360 * 2 ** z);
    const tY = (lat, z) => { const r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** z); };
    const tUrl = (k) => `https://tile.openstreetmap.org/${k}.png`;
    function rtTripGeo(trip) {
      const route = [], spots = [], add = (L, g) => { const p = parseGps(String(g || '')); if (p) L.push(p); };
      (trip.stages || []).forEach((s) => { const g = rtStageGps(s) || parseGps(String((s.hotel || {}).gps || '')); if (g) route.push(g); add(spots, (s.hotel || {}).gps); ((s.routeToHotel || {}).stopsOnWay || []).forEach((x) => add(spots, x.gps)); (s.localAttractions || []).forEach((x) => add(spots, x.gps)); });
      return { route, spots };
    }
    function rtTileSet(route, spots, line) {
      const set = new Set(); const pts = route.concat(spots); if (!pts.length) return set;
      const la = pts.map((p) => p[0]), lo = pts.map((p) => p[1]); const b = [Math.min(...la) - 0.5, Math.min(...lo) - 0.5, Math.max(...la) + 0.5, Math.max(...lo) + 0.5];
      for (let z = 5; z <= 8; z++) for (let x = tX(b[1], z); x <= tX(b[3], z); x++) for (let y = tY(b[2], z); y <= tY(b[0], z); y++) set.add(`${z}/${x}/${y}`);
      const path = line && line.length > 1 ? line : route;
      for (let z = 9; z <= 12; z++) {
        for (let i = 0; i < path.length; i++) {
          const a = path[i], c = path[Math.min(i + 1, path.length - 1)]; const steps = Math.max(1, Math.ceil(Math.max(Math.abs(tX(a[1], z) - tX(c[1], z)), Math.abs(tY(a[0], z) - tY(c[0], z))) * 2));
          for (let k = 0; k <= steps; k++) { const t = k / steps; const x = tX(a[1] + (c[1] - a[1]) * t, z), y = tY(a[0] + (c[0] - a[0]) * t, z); for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) set.add(`${z}/${x + dx}/${y + dy}`); }
        }
      }
      route.concat(spots).forEach((p) => { for (let z = 13; z <= 14; z++) { const x = tX(p[1], z), y = tY(p[0], z), r = z === 13 ? 1 : 1; for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) set.add(`${z}/${x + dx}/${y + dy}`); } });
      return set;
    }
    const TILE_MAX = 4000;
    function RtOfflineMaps({ trip }) {
      const [have, setHave] = useState(null); const [st, setSt] = useState(''); const [prog, setProg] = useState(null); const stop = useRef(false);
      const geo = useMemo(() => rtTripGeo(trip), [trip]);
      const est = useMemo(() => rtTileSet(geo.route, geo.spots, null).size, [geo]);
      const count = async () => { try { if (!window.caches) { setHave(-1); return; } const c = await caches.open(TILE_CACHE); setHave((await c.keys()).length); } catch (e) { setHave(-1); } };
      useEffect(() => { count(); }, []);
      const run = async () => {
        if (!navigator.onLine) { setSt('Dafür ist Internet nötig, am besten WLAN.'); return; }
        stop.current = false; setSt('Strecke wird ermittelt …'); setProg({ done: 0, total: 0 });
        let line = null;
        try { const pts = geo.route.slice(0, 80); if (pts.length > 1) { const j = await fetchJsonTimeout(`https://router.project-osrm.org/route/v1/driving/${pts.map((p) => `${p[1]},${p[0]}`).join(';')}?overview=simplified&geometries=geojson`, {}, 20000); const co = j && j.routes && j.routes[0] && j.routes[0].geometry && j.routes[0].geometry.coordinates; if (co && co.length > 1) line = co.map(([x, y]) => [y, x]); } } catch (e) { line = null; }
        let keys = [...rtTileSet(geo.route, geo.spots, line)];
        if (keys.length > TILE_MAX) keys = keys.filter((k) => Number(k.split('/')[0]) <= 12).concat(keys.filter((k) => Number(k.split('/')[0]) > 12)).slice(0, TILE_MAX);
        const c = await caches.open(TILE_CACHE); const old = new Set((await c.keys()).map((r) => r.url)); const todo = keys.filter((k) => !old.has(tUrl(k)));
        setProg({ done: keys.length - todo.length, total: keys.length }); setSt(line ? 'Lade Karten entlang der Strecke …' : 'Lade Karten (Strecke als Luftlinie, da keine Route ermittelt werden konnte) …');
        let done = keys.length - todo.length, fail = 0, i = 0;
        const work = async () => { while (i < todo.length && !stop.current) { const k = todo[i++]; try { const r = await fetch(tUrl(k), { mode: 'cors', credentials: 'omit' }); if (r.ok) await c.put(tUrl(k), r); else fail++; } catch (e) { fail++; } done++; if (done % 10 === 0 || done === keys.length) setProg({ done, total: keys.length }); if (fail > 40 && fail > done / 3) { stop.current = true; } } };
        await Promise.all([work(), work()]);
        setProg({ done, total: keys.length }); await count();
        setSt(stop.current ? (fail > 40 ? 'Abgebrochen: Der Kartendienst antwortet gerade nicht. Später noch einmal versuchen.' : 'Angehalten. Bereits geladene Karten bleiben gespeichert.') : `Fertig. ${keys.length - fail} Kartenausschnitte sind offline verfügbar${fail ? `, ${fail} fehlgeschlagen` : ''}.`);
      };
      const clear = async () => { if (!(await window.rtAsk('Gespeicherte Karten löschen?'))) return; try { await caches.delete(TILE_CACHE); } catch (e) {} setProg(null); setSt('Gespeicherte Karten gelöscht.'); count(); };
      const busy = prog && prog.total && prog.done < prog.total && !/Fertig|Angehalten|Abgebrochen/.test(st);
      return (
        <section data-ro-ok data-offline-maps aria-label="Karten für unterwegs" className="sp3"><div className="sp3-card">
          <div className="sp3-line"><span className="sp3-acc"><RtI n="map" s={22} /></span><span className="sp3-grow"><h2 className="sp3-h2">Karten für unterwegs</h2><span className="sp3-mute">{have > 0 ? `${have} Kartenausschnitte gespeichert (ca. ${Math.max(1, Math.round(have * 0.02))} MB)` : have === -1 ? 'In diesem Browser nicht möglich.' : 'Noch keine Karten offline gespeichert.'}</span></span></div>
          <p className="sp3-txt">Lädt die Karte entlang deiner Route vorab, damit sie auch ohne Empfang angezeigt wird: Überblick, Strecke bis Zoomstufe 12, Orte, Hotels und Aktionen bis Zoomstufe 14. Etwa {est} Ausschnitte, ungefähr {Math.max(1, Math.round(est * 0.02))} MB. Am besten im WLAN.</p>
          {prog && prog.total > 0 && <div className="sp3-prog" role="progressbar" aria-valuemin={0} aria-valuemax={prog.total} aria-valuenow={prog.done}><span style={{ width: `${Math.round(prog.done / prog.total * 100)}%` }} /></div>}
          {st && <p role="status" data-offline-status className="sp3-mute">{st}{prog && prog.total ? ` (${prog.done} von ${prog.total})` : ''}</p>}
          <div className="sp3-acts">
            {!busy && <button type="button" data-readonly-allow data-offline-run disabled={!geo.route.length || have === -1} className="sp3-btn pri" onClick={run}>{have > 0 ? 'Karten aktualisieren' : 'Karten laden'}</button>}
            {busy && <button type="button" data-readonly-allow className="sp3-btn" onClick={() => { stop.current = true; }}>Anhalten</button>}
            {have > 0 && !busy && <button type="button" data-readonly-allow data-offline-clear className="sp3-btn del" onClick={clear}>Löschen</button>}
          </div>
          {!geo.route.length && <p className="sp3-hint">Noch keine Etappenorte mit Koordinaten. Sobald die Etappen Orte haben, geht es los.</p>}
          <p className="sp3-hint">Kartendaten © OpenStreetMap-Mitwirkende. Geladen wird nur, was die Route braucht, höchstens Zoomstufe 14, wie es die Nutzungsregeln verlangen. Näher heranzoomen geht offline nicht.</p>
        </div></section>
      );
    }

    // ---------- Kassenzettel ----------
    const RC_CATS = ['Tanken', 'Essen & Trinken', 'Einkauf', 'Eintritt & Touren', 'Parken & Maut', 'Unterkunft', 'Sonstiges'];
    // ---------- Texterkennung für Kassenzettel (Tesseract, läuft im Browser) ----------
    const RT_OCR_SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    let RT_OCR_W = null, RT_OCR_CB = null;
    const rtOcrLib = () => (window.Tesseract ? Promise.resolve(window.Tesseract) : new Promise((res, rej) => {
      const old = document.querySelector('script[data-rt-ocr]'); if (old) old.remove();
      const s = document.createElement('script'); s.src = RT_OCR_SRC; s.async = true; s.setAttribute('data-rt-ocr', '1');
      const t = setTimeout(() => rej(new Error('timeout')), 45000);
      s.onload = () => { clearTimeout(t); window.Tesseract ? res(window.Tesseract) : rej(new Error('nicht geladen')); };
      s.onerror = () => { clearTimeout(t); rej(new Error('nicht erreichbar')); }; document.head.appendChild(s);
    }));
    // Foto für die Erkennung aufbereiten: Graustufen, Kontrast strecken, sinnvolle Größe
    const rtOcrCanvas = (blob) => new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(blob);
      img.onload = () => {
        const W = img.width, H = img.height; const k = Math.max(Math.min(1, 1800 / Math.max(W, H)), Math.min(2, 1100 / W));
        const c = document.createElement('canvas'); c.width = Math.round(W * k); c.height = Math.round(H * k); const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        try { const d = g.getImageData(0, 0, c.width, c.height), a = d.data, hist = new Array(256).fill(0); for (let i = 0; i < a.length; i += 4) { const v = (a[i] * 0.299 + a[i + 1] * 0.587 + a[i + 2] * 0.114) | 0; a[i] = v; hist[v]++; } const n = a.length / 4; let lo = 0, hi = 255, s = 0; for (; lo < 255 && (s += hist[lo]) < n * 0.02; lo++); s = 0; for (; hi > 0 && (s += hist[hi]) < n * 0.02; hi--); const r = Math.max(1, hi - lo); for (let i = 0; i < a.length; i += 4) { const v = Math.max(0, Math.min(255, ((a[i] - lo) * 255) / r)); a[i] = a[i + 1] = a[i + 2] = v; } g.putImageData(d, 0, 0); } catch (e) { /* ohne Aufbereitung */ }
        res(c);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Bild nicht lesbar')); }; img.src = url;
    });
    async function rtOcr(blob, onProg) {
      RT_OCR_CB = onProg || null;
      if (onProg) onProg({ status: 'Texterkennung wird geladen', progress: 0 });
      const T = await rtOcrLib();
      if (!RT_OCR_W) RT_OCR_W = T.createWorker('eng', 1, { logger: (m) => { if (RT_OCR_CB) RT_OCR_CB(m); } }).catch((e) => { RT_OCR_W = null; throw e; });
      const w = await RT_OCR_W; const c = await rtOcrCanvas(blob);
      const r = await w.recognize(c); return String((r && r.data && r.data.text) || '');
    }
    const RT_OCR_ST = { 'loading tesseract core': 'Texterkennung wird geladen', 'initializing tesseract': 'Texterkennung startet', 'loading language traineddata': 'Sprachdaten werden geladen', 'initializing api': 'Texterkennung startet', 'recognizing text': 'Text wird gelesen' };

    // Erkannten Text auswerten: Betrag, Währung, Datum, Geschäft, Kategorie, Karte
    const RC_KW = [
      ['Tanken', /\b(shell|chevron|exxon|mobil|sunoco|marathon|citgo|valero|speedway|wawa|racetrac|circle ?k|gulf|texaco|sinclair|phillips ?66|bp|gasoline|gas station|fuel|unleaded|diesel|gallons?|gal|pump ?#?\d*|price\/gal|tankstelle|benzin|super ?e10|aral|esso)\b/gi],
      ['Parken & Maut', /\b(parking|garage|toll|sunpass|e-?pass|valet|meter|parkhaus|maut|parkgeb\S*)\b/gi],
      ['Essen & Trinken', /\b(restaurant|cafe|caf\S|coffee|starbucks|mcdonald'?s|burger|pizza|grill|bar|tavern|pub|diner|bistro|kitchen|taco|subway|chipotle|wendy'?s|dunkin|chick-fil-a|tip|gratuity|server|table|guests?|dine ?in|take ?out|food|eatery|bakery|ice cream|wings|seafood|steak|brewery|cantina|sushi|bbq|beverage|drinks?|beer|wine|trinkgeld|gastst\S+|b\S+ckerei|imbiss)\b/gi],
      ['Eintritt & Touren', /\b(admission|tickets?|museum|tour|zoo|aquarium|entrance|attraction|state park|national park|kayak|boat|cruise|snorkel\S*|theme park|disney|universal|seaworld|eintritt|f\S+hrung)\b/gi],
      ['Unterkunft', /\b(hotel|motel|resort fee|resort|suites|lodge|room rate|check-?in|check-?out|folio|unterkunft)\b/gi],
      ['Einkauf', /\b(publix|walmart|target|winn-?dixie|whole foods|trader joe'?s|aldi|kroger|costco|cvs|walgreens|dollar general|dollar tree|family dollar|7-eleven|grocery|supermarket|market|pharmacy|outlet|souvenirs?|gift shop|store|mart|rewe|edeka|lidl|rossmann|qty|items? sold)\b/gi],
    ];
    const rcNum = (s) => { let t = String(s).replace(/\s/g, ''); const c = t.lastIndexOf(','), d = t.lastIndexOf('.'); if (c > d) t = t.replace(/\./g, '').replace(',', '.'); else t = t.replace(/,/g, ''); const n = parseFloat(t); return Number.isFinite(n) ? n : null; };
    const RC_AMT = /(\$|€|usd|eur)?\s*(\d{1,3}(?:[.,]\d{3})+[.,]\d{2}|\d{1,5}[.,]\d{2})(?![\d%])\s*(€|eur|usd)?/gi;
    const RC_TOT = [[/\b(grand\s*total|total\s*due|amount\s*due|balance\s*due|total\s*amount|total\s*sale|total\s*purchase|zu\s*zahlen|gesamtbetrag|endbetrag|summe\s*eur)\b/i, 6], [/\b(total|summe|gesamt|betrag)\b/i, 5], [/\b(visa|master\s*card|mastercard|amex|american express|discover|debit|credit|charged|sale|amount|ec-?karte|girocard|kartenzahlung)\b/i, 3]];
    const RC_NOT = /\b(sub\s*-?\s*total|subtl|zwischensumme|tax|mwst|ust|vat|netto|tip|gratuity|trinkgeld|change|r\S?ckgeld|cash\s*tend|tendered|tend|savings|you\s*saved|discount|rabatt|points|remaining|gift\s*card|suggested|\d{1,2}\s*%)/i;
    function rtReceiptParse(text, trip) {
      const raw = String(text || ''); const lines = raw.split(/\r?\n/).map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
      const out = { amount: null, currency: '', date: '', title: '', category: '', card: '', sure: false };
      // Währung
      if (/€|\beur\b/i.test(raw)) out.currency = 'EUR'; else if (/\$|\busd\b/i.test(raw)) out.currency = 'USD';
      // Beträge je Zeile
      const amts = (l) => { const r = []; let m; RC_AMT.lastIndex = 0; while ((m = RC_AMT.exec(l))) { const n = rcNum(m[2]); if (n != null && n > 0 && n < 100000) r.push(n); } return r; };
      const cands = [];
      lines.forEach((l, i) => {
        let sc = 0; for (const [re, w] of RC_TOT) if (re.test(l)) { sc = Math.max(sc, w); }
        if (!sc || RC_NOT.test(l)) return;
        let a = amts(l); if (!a.length && lines[i + 1] && !RC_NOT.test(lines[i + 1])) a = amts(lines[i + 1]);
        if (a.length) cands.push({ sc, v: a[a.length - 1], i });
      });
      if (cands.length) { const top = Math.max(...cands.map((c) => c.sc)); const best = cands.filter((c) => c.sc === top).sort((x, y) => y.v - x.v)[0]; out.amount = best.v; out.sure = top >= 5; }
      // Restaurant: Total ohne Trinkgeld, danach Betrag mit Trinkgeld -> der höhere zählt
      if (out.amount) { let tip = 0; lines.forEach((l) => { if (/\b(tip|gratuity|trinkgeld)\b/i.test(l) && !/suggest|%/i.test(l)) { const a = amts(l); if (a.length) tip = Math.max(tip, a[a.length - 1]); } }); if (tip > 0) { const want = Math.round((out.amount + tip) * 100); lines.forEach((l) => { amts(l).forEach((v) => { if (Math.round(v * 100) === want) { out.amount = v; out.tip = tip; } }); }); } }
      else { const all = []; lines.forEach((l) => { if (!RC_NOT.test(l)) all.push(...amts(l)); }); if (all.length) out.amount = Math.max(...all); }
      // Datum
      const plaus = (iso) => { const t = Date.parse(iso + 'T12:00:00'); if (!Number.isFinite(t)) return false; const m = trip && trip.meta || {}; const a = Date.parse((m.startDate || '') + 'T12:00:00'), b = Date.parse((m.endDate || '') + 'T12:00:00'); if (Number.isFinite(a) && Number.isFinite(b)) return t >= a - 90 * 864e5 && t <= b + 30 * 864e5; return Math.abs(t - Date.now()) < 400 * 864e5; };
      const mk = (y, mo, d) => { y = Number(y); if (y < 100) y += 2000; mo = Number(mo); d = Number(d); if (mo < 1 || mo > 12 || d < 1 || d > 31) return ''; const iso = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`; return plaus(iso) ? iso : ''; };
      let m;
      if ((m = /\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/.exec(raw))) out.date = mk(m[1], m[2], m[3]);
      if (!out.date && (m = /\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/.exec(raw))) out.date = mk(m[3], m[2], m[1]);
      if (!out.date && (m = /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/.exec(raw))) out.date = mk(m[3], m[1], m[2]) || mk(m[3], m[2], m[1]);
      // Kategorie
      let bestC = '', bestN = 0; RC_KW.forEach(([c, re]) => { const n = (raw.match(re) || []).length; if (n > bestN) { bestN = n; bestC = c; } }); out.category = bestC;
      // Karte: letzte 4 Ziffern, sonst Kartenart
      const cards = (trip && trip.creditCards) || []; const dig = (c) => String(c.cardNumber || '').replace(/\D/g, '');
      const l4 = [...raw.matchAll(/(?:\*+|[x#•]{2,}[\s-]*|ending\s*(?:in)?\s*:?\s*|endet\s*auf\s*|acct\s*#?\s*:?\s*|card\s*#?\s*:?\s*)(\d{4})\b/gi)].map((x) => x[1]);
      for (const d4 of l4) { const c = cards.find((k) => dig(k).length >= 4 && dig(k).slice(-4) === d4); if (c) { out.card = c.name; break; } }
      if (!out.card) { const brand = /\bvisa\b/i.test(raw) ? 'visa' : /master\s*card|mastercard|\bmc\b/i.test(raw) ? 'master' : /\bamex\b|american express/i.test(raw) ? 'amex' : ''; if (brand) { const re = brand === 'visa' ? /visa/i : brand === 'master' ? /master/i : /amex|american/i; const L = cards.filter((k) => { const d = dig(k); return re.test(`${k.fullName || ''} ${k.name || ''} ${k.type || ''}`) || (d.length >= 12 && (brand === 'visa' ? d[0] === '4' : brand === 'master' ? /^[25]/.test(d) : d[0] === '3')); }); if (L.length === 1) out.card = L[0].name; } }
      if (!out.card && /\bcash\b|\bbar\b(?!\s*&)/i.test(raw) && !l4.length && !/visa|master|amex|debit|credit/i.test(raw)) out.card = 'Bar';
      // Geschäft: erste sinnvolle Zeile
      const bad = /receipt|welcome|thank|store\s*#|tel|phone|www|http|@|\d{3}[-) .]\d{3}|^\W*\d|^(date|time|cashier|server|table|order)/i;
      const t = lines.slice(0, 6).find((l) => (l.match(/[a-zäöü]/gi) || []).length >= 4 && !bad.test(l));
      if (t) { let s = t.replace(/[^\wäöüÄÖÜß&'’.\- ]+/g, ' ').replace(/\s+/g, ' ').trim(); if (s === s.toUpperCase()) s = s.toLowerCase().replace(/(^|[\s-])(\w)/g, (x, a, c) => a + c.toUpperCase()); out.title = s.slice(0, 40); }
      return out;
    }
    try { window.__rtReceiptParse = rtReceiptParse; } catch (e) {}

    const rcDb = () => new Promise((res, rej) => { try { const r = indexedDB.open('roadtrip_receipts_v1', 1); r.onupgradeneeded = () => r.result.createObjectStore('r', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } });
    const rcTx = async (mode, fn) => { const db = await rcDb(); return new Promise((res, rej) => { const tx = db.transaction('r', mode); const rq = fn(tx.objectStore('r')); tx.oncomplete = () => res(rq && rq.result); tx.onerror = () => rej(tx.error); }); };
    const rcShrink = (file) => new Promise((res) => {
      if (!file || !/^image\//.test(file.type)) return res(file);
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { const k = Math.min(1, 1600 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob((b) => { URL.revokeObjectURL(url); res(b && b.size < file.size ? b : file); }, 'image/jpeg', 0.72); };
      img.onerror = () => { URL.revokeObjectURL(url); res(file); }; img.src = url;
    });
    const rcRate = (trip) => { const r = Number((trip.meta || {}).exchangeRate); return r > 0 ? r : 0; };
    const rcCur0 = (trip) => { const c = String((trip.meta || {}).currency || ''); if (c && c !== 'EUR') return c; return rcRate(trip) ? 'USD' : 'EUR'; };
    const rcToEur = (trip, amt, cur) => { const a = rtNum(amt); if (cur === 'EUR') return Math.round(a * 100) / 100; const r = rcRate(trip); return r ? Math.round(a / r * 100) / 100 : Math.round(a * 100) / 100; };
    const rcStageFor = (trip, iso) => { const st = trip.stages || []; const R = parseStageRanges(st, trip.meta && trip.meta.startDate); let best = null; R.forEach((r, i) => { if (r && iso >= r.start && (iso < r.end || (i === st.length - 1 && iso <= r.end))) best = st[i]; }); return best; };
    const rcPeople = (trip) => { const L = (trip.participants || []).map((p) => p.name).filter(Boolean); return L.length ? L : ['Ich']; };
    const rcHolder = (trip, card) => { const c = (trip.creditCards || []).find((x) => x.name === card); const P = rcPeople(trip); return c && P.includes(c.holder) ? c.holder : P[0]; };
    const rcBlobUrl = (blob) => { try { return blob ? URL.createObjectURL(blob) : ''; } catch (e) { return ''; } };
    const b64Of = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(r.error); r.readAsDataURL(blob); });
    const blobOf = (b64, type) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: type || 'image/jpeg' }); };

    function RcForm({ trip, init, onDone, onCancel }) {
      const P = rcPeople(trip); const cards = (trip.creditCards || []).map((c) => c.name).filter(Boolean);
      const [f, setF] = useState(() => init || { id: `rc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, amount: '', currency: rcCur0(trip), title: '', category: 'Essen & Trinken', date: rtIsoNow(), creditCard: cards[0] || 'Bar', paidBy: rcHolder(trip, cards[0]), splitAmong: P, notes: '', blob: null, isNew: true });
      const [prev, setPrev] = useState(() => rcBlobUrl(init && init.blob)); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
      useEffect(() => () => { if (prev) URL.revokeObjectURL(prev); }, [prev]);
      const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
      const touched = useRef(new Set()); const setU = (k, v) => { touched.current.add(k); set(k, v); };
      const fRef = useRef(f); fRef.current = f;
      const [ocr, setOcr] = useState(null); const [filled, setFilled] = useState([]);
      const [auto, setAuto] = useState(() => { try { return localStorage.getItem('rt_ocr_auto_v1') !== '0'; } catch (e) { return true; } });
      const runOcr = async (blob) => {
        if (!blob) return; setOcr({ st: 'run', p: 0, msg: 'Texterkennung wird geladen' }); setFilled([]);
        try {
          const text = await rtOcr(blob, (m) => setOcr((o) => (o && o.st === 'run' ? { ...o, p: m.status === 'recognizing text' ? (m.progress || 0) : o.p, msg: RT_OCR_ST[m.status] || o.msg } : o)));
          const r = rtReceiptParse(text, trip); const y = { ...fRef.current }; const fill = [];
          const put = (k, v) => { if (v && !touched.current.has(k)) { y[k] = v; fill.push(k); } };
          if (r.amount) put('amount', r.amount.toFixed(2).replace('.', ','));
          if (r.currency && [rcCur0(trip), 'EUR'].includes(r.currency)) put('currency', r.currency);
          put('title', r.title); put('category', r.category); put('date', r.date);
          if (r.card && (r.card === 'Bar' || cards.includes(r.card)) && !touched.current.has('creditCard')) { y.creditCard = r.card; fill.push('creditCard'); if (r.card !== 'Bar' && !touched.current.has('paidBy')) y.paidBy = rcHolder(trip, r.card); }
          setF(y); setFilled(fill); setOcr({ st: 'done', r, text });
        } catch (e) { setOcr({ st: 'err', msg: navigator.onLine === false ? 'Die Texterkennung braucht beim ersten Mal Internet (etwa 10 MB, am besten im WLAN). Danach geht sie auch offline. Bitte die Angaben jetzt eintippen.' : `Texterkennung nicht möglich (${e && e.message ? e.message : e}). Bitte die Angaben eintippen.` }); }
      };
      const tag = (k) => (filled.includes(k) ? <em className="sp3-auto" data-ocr-filled={k}>erkannt</em> : null);
      const onPhoto = async (e) => { const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return; setBusy(true); const b = await rcShrink(file); setBusy(false); setF((x) => ({ ...x, blob: b, blobNew: true })); setPrev(rcBlobUrl(b)); if (auto) runOcr(b); };
      const stg = rcStageFor(trip, f.date);
      const eur = rcToEur(trip, f.amount, f.currency);
      const submit = (e) => { e.preventDefault(); if (!(rtNum(f.amount) > 0)) { setErr('Bitte einen Betrag eingeben.'); return; } if (!f.splitAmong.length) { setErr('Mindestens eine Person zum Aufteilen wählen.'); return; } onDone({ ...f, amountEur: eur, stageId: stg ? stg.id : '', title: f.title.trim() || f.category }); };
      return ReactDOM.createPortal(
        <div className="sp3-sheetbg" data-ro-ok role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
          <form className="sp3 sp3-sheet" role="dialog" aria-modal="true" aria-label="Beleg erfassen" data-rc-form onSubmit={submit} onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
            <div className="sp3-line"><h2 className="sp3-h2 sp3-grow">{f.isNew ? 'Beleg erfassen' : 'Beleg bearbeiten'}</h2><button type="button" data-readonly-allow className="sp3-round" aria-label="Schließen" onClick={onCancel}>×</button></div>
            <div className="sp3-photo">
              {prev ? <img src={prev} alt="Foto des Belegs" /> : <span className="sp3-mute">Noch kein Foto</span>}
              <div className="sp3-acts">
                <label className="sp3-btn pri" data-rc-cam><RtI n="cam" s={18} />&nbsp;{prev ? 'Neu fotografieren' : 'Foto aufnehmen'}<input type="file" accept="image/*" capture="environment" onChange={onPhoto} className="sp3-hide" data-readonly-allow /></label>
                <label className="sp3-btn">Aus Fotos<input type="file" accept="image/*" onChange={onPhoto} className="sp3-hide" data-rc-file data-readonly-allow /></label>
                {busy && <span className="sp3-mute">Foto wird verkleinert …</span>}
                {f.blob && (!ocr || ocr.st !== 'run') && <button type="button" data-readonly-allow data-ocr-run className="sp3-btn" onClick={() => runOcr(f.blob)}>{ocr ? 'Erneut erkennen' : 'Text erkennen'}</button>}
              </div>
              {ocr && ocr.st === 'run' && <div className="sp3-ocr" role="status" data-ocr="run"><span>{ocr.msg} … {ocr.p ? `${Math.round(ocr.p * 100)} %` : ''}</span><div className="sp3-prog"><span style={{ width: `${Math.round((ocr.p || 0) * 100)}%` }} /></div></div>}
              {ocr && ocr.st === 'done' && <div className="sp3-ocr" role="status" data-ocr="done">
                {filled.length ? <span><b>Erkannt:</b> {[filled.includes('amount') && `Betrag ${f.amount} ${f.currency}`, filled.includes('title') && f.title, filled.includes('category') && f.category, filled.includes('date') && rtDm(f.date), filled.includes('creditCard') && (f.creditCard === 'Bar' ? 'bar bezahlt' : `Karte ${f.creditCard}`)].filter(Boolean).join(' · ')}. Bitte kurz prüfen.</span> : <span>Auf dem Foto wurde nichts Verwertbares erkannt. Bitte die Angaben eintippen.</span>}
                {ocr.r && ocr.r.amount && !ocr.r.sure && filled.includes('amount') && <span className="sp3-stw">Kein „Total“ gefunden, der Betrag ist der größte auf dem Bon.</span>}
                <details><summary>Erkannten Text zeigen</summary><pre data-ocr-text>{ocr.text || '(leer)'}</pre></details>
              </div>}
              {ocr && ocr.st === 'err' && <p className="sp3-stw" role="alert" data-ocr="err">{ocr.msg}</p>}
              <label className="sp3-chk"><input type="checkbox" data-readonly-allow data-ocr-auto checked={auto} onChange={(e) => { setAuto(e.target.checked); try { localStorage.setItem('rt_ocr_auto_v1', e.target.checked ? '1' : '0'); } catch (x) {} }} /> Text nach dem Foto automatisch erkennen</label>
            </div>
            <div className="sp3-grid">
              <label className="sp3-f"><span>Betrag {tag('amount')}</span><input data-readonly-allow name="amount" inputMode="decimal" autoComplete="off" value={f.amount} onChange={(e) => setU('amount', e.target.value)} placeholder="z. B. 23,40" /></label>
              <div className="sp3-f"><span>Währung</span><div className="sp3-seg2" role="group" aria-label="Währung">{[...new Set([rcCur0(trip), 'EUR'])].map((c) => <button key={c} type="button" data-readonly-allow aria-pressed={f.currency === c} onClick={() => setU('currency', c)}>{c}</button>)}</div></div>
              {f.currency !== 'EUR' && <p className="sp3-hint wide">{rcRate(trip) ? `= ${rtEur(eur)} (Kurs 1 € = ${String(rcRate(trip)).replace('.', ',')} ${f.currency}, einstellbar unter Budget)` : 'Kein Wechselkurs hinterlegt, der Betrag wird 1:1 als Euro gezählt.'}</p>}
              <label className="sp3-f wide"><span>Wofür / Geschäft {tag('title')}</span><input data-readonly-allow name="title" value={f.title} onChange={(e) => setU('title', e.target.value)} placeholder="z. B. Shell Tankstelle" /></label>
              <div className="sp3-f wide"><span>Kategorie {tag('category')}</span><div className="sp3-chips" role="group" aria-label="Kategorie">{RC_CATS.map((c) => <button key={c} type="button" data-readonly-allow aria-pressed={f.category === c} onClick={() => setU('category', c)}>{c}</button>)}</div></div>
              <label className="sp3-f"><span>Datum {tag('date')}</span><input data-readonly-allow type="date" name="date" value={f.date} onChange={(e) => setU('date', e.target.value)} /></label>
              <label className="sp3-f"><span>Bezahlt mit {tag('creditCard')}</span><select data-readonly-allow name="creditCard" value={f.creditCard} onChange={(e) => { const v = e.target.value; touched.current.add('creditCard'); setF((x) => ({ ...x, creditCard: v, paidBy: v === 'Bar' ? x.paidBy : rcHolder(trip, v) })); }}>{cards.map((c) => <option key={c} value={c}>{c}</option>)}<option value="Bar">Bar</option></select></label>
              <label className="sp3-f"><span>Bezahlt von</span><select data-readonly-allow name="paidBy" value={f.paidBy} onChange={(e) => setU('paidBy', e.target.value)}>{P.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
              <div className="sp3-f wide"><span>Aufteilen auf</span><div className="sp3-chips" role="group" aria-label="Aufteilen auf">{P.map((p) => { const on = f.splitAmong.includes(p); return <button key={p} type="button" data-readonly-allow aria-pressed={on} onClick={() => set('splitAmong', on ? f.splitAmong.filter((x) => x !== p) : [...f.splitAmong, p])}>{on ? '✓ ' : ''}{p}</button>; })}</div></div>
              <p className="sp3-hint wide">{stg ? `Gehört zur Etappe nach ${stg.toCity || '?'} (nach Datum).` : 'Das Datum liegt außerhalb der Etappen.'}{f.splitAmong.length > 1 && rtNum(f.amount) > 0 ? ` Je Person ${rtEur(eur / f.splitAmong.length)}.` : ''}</p>
              <label className="sp3-f wide"><span>Notiz</span><input data-readonly-allow name="notes" value={f.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="optional" /></label>
            </div>
            {err && <p role="alert" className="sp3-stw">{err}</p>}
            <div className="sp3-acts"><button type="submit" data-readonly-allow data-rc-save className="sp3-btn pri grow">Speichern</button><button type="button" data-readonly-allow className="sp3-btn" onClick={onCancel}>Abbrechen</button></div>
          </form>
        </div>, document.body);
    }

    // Belege: im Bearbeiten-Modus direkt in der Reise (Ausgabe + Foto in den Dokumenten), im Modus „Nur lesen“ in einer Sammelliste auf dem Gerät
    function RtReceipts({ trip, onSave, readOnly, compact }) {
      useEffect(() => { if (!compact) return undefined; const f = () => setForm(false); window.addEventListener('rt-new-receipt', f); return () => window.removeEventListener('rt-new-receipt', f); }, []);
      const [queue, setQueue] = useState([]); const [form, setForm] = useState(null); const [photos, setPhotos] = useState({}); const [msg, setMsg] = useState(''); const [open, setOpen] = useState(null); const [all, setAll] = useState(false);
      const latest = useRef(trip); latest.current = trip;
      const loadQ = async () => { try { const L = await rcTx('readonly', (s) => s.getAll()); setQueue((L || []).filter((x) => !x.tripId || x.tripId === (trip.meta || {}).tripId)); } catch (e) { setQueue([]); } };
      useEffect(() => { loadQ(); }, [(trip.meta || {}).tripId]);
      const inTrip = (trip.customExpenses || []).filter((x) => x.source === 'receipt');
      const list = [...inTrip.map((x) => ({ ...x, date: x.rcDate || rtDeIso(x.date) || '', where: 'trip' })), ...queue.map((x) => ({ ...x, where: 'queue' }))].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      // Fotos laden
      useEffect(() => { let dead = false; (async () => { const out = {}; for (const r of list) { if (photos[r.id]) { out[r.id] = photos[r.id]; continue; } let b = null; if (r.where === 'queue') b = r.blob; else if (r.docId) { try { const d = await docsTx('readonly', (s) => s.get(r.docId)); b = d && d.blob; } catch (e) {} } if (b) out[r.id] = rcBlobUrl(b); } if (!dead) setPhotos(out); })(); return () => { dead = true; }; }, [list.map((r) => r.id + (r.docId || '')).join(',')]);
      const toEntry = (r) => ({ id: r.id, source: 'receipt', title: r.title, category: r.category, amountEur: r.amountEur, amount: rtNum(r.amount), currency: r.currency, date: rtDm(r.date) || '', rcDate: r.date || '', creditCard: r.creditCard, paidBy: r.paidBy, splitAmong: r.splitAmong, stageId: r.stageId || '', docId: r.docId || '', notes: r.notes || '' });
      const save = async (r) => {
        setForm(null);
        if (readOnly) { const { isNew, where, ...rest } = r; await rcTx('readwrite', (s) => s.put({ ...rest, tripId: (trip.meta || {}).tripId || '', amount: rtNum(r.amount) })); await loadQ(); setMsg('Beleg auf diesem Gerät gesammelt. Mit „An den Laptop schicken“ in die Reise übernehmen.'); return; }
        let docId = r.docId || '';
        if (r.blob && r.blobNew !== false) { try { if (docId) await docsTx('readwrite', (s) => s.delete(docId)); docId = `doc-rc-${r.id}-${Date.now().toString(36)}`; await docsTx('readwrite', (s) => s.put({ id: docId, name: `Beleg ${rtDm(r.date)} ${r.title}.jpg`, type: r.blob.type || 'image/jpeg', size: r.blob.size, cat: 'Belege', added: Date.now(), blob: r.blob })); docsChanged(); } catch (e) { setMsg('Foto konnte nicht gespeichert werden, der Beleg schon.'); } }
        const e = toEntry({ ...r, docId }); const cur = latest.current; const L = cur.customExpenses || [];
        onSave({ ...cur, customExpenses: L.some((x) => x.id === e.id) ? L.map((x) => (x.id === e.id ? e : x)) : [...L, e] }, r.isNew ? `Beleg ${rtEur(e.amountEur)} gespeichert` : 'Beleg gespeichert');
      };
      const del = async (r) => {
        if (r.where === 'queue') { await rcTx('readwrite', (s) => s.delete(r.id)); await loadQ(); setMsg('Beleg gelöscht.'); return; }
        const before = latest.current; onSave({ ...before, customExpenses: (before.customExpenses || []).filter((x) => x.id !== r.id) }, ''); rtUndo(`Beleg „${r.title}“ gelöscht`, before);
        if (r.docId) setTimeout(async () => { const now = latest.current; if (!(now.customExpenses || []).some((x) => x.id === r.id)) { try { await docsTx('readwrite', (s) => s.delete(r.docId)); docsChanged(); } catch (e) {} } }, 9000);
      };
      const edit = async (r) => { let blob = null; if (r.where === 'queue') blob = r.blob; else if (r.docId) { try { const d = await docsTx('readonly', (s) => s.get(r.docId)); blob = d && d.blob; } catch (e) {} } setForm({ ...r, amount: String(r.amount != null ? r.amount : r.amountEur).replace('.', ','), blob, blobNew: false, isNew: false }); };
      const openPhoto = (r) => { const u = photos[r.id]; if (u) { const w = window.open(u, '_blank'); if (!w) { const a = document.createElement('a'); a.href = u; a.download = `Beleg-${r.date}.jpg`; a.click(); } } };
      // Übertragen Handy -> Laptop
      const exportQ = async () => { const items = []; for (const r of queue) { const { blob, ...rest } = r; items.push({ ...rest, photo: blob ? await b64Of(blob) : '', photoType: blob ? blob.type : '' }); } const res = await rtSaveFile(new Blob([JSON.stringify({ type: 'roadtrip-receipts', v: 1, tripId: (trip.meta || {}).tripId || '', items })], { type: 'application/json' }), `Belege_${rtIsoNow()}.json`); if (res !== 'abort') { for (const r of queue) await rcTx('readwrite', (s) => s.put({ ...r, sent: Date.now() })); await loadQ(); setMsg(`${items.length} Belege als Datei bereitgestellt. Am Laptop unter Budget › Belege mit „Belege vom Handy übernehmen“ einlesen.`); } };
      const dropSent = async () => { for (const r of queue.filter((x) => x.sent)) await rcTx('readwrite', (s) => s.delete(r.id)); await loadQ(); };
      const importQ = async (e) => {
        const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return;
        try { const j = JSON.parse(await file.text()); if (j.type !== 'roadtrip-receipts' || !Array.isArray(j.items)) throw new Error('keine Beleg-Datei');
          const cur = latest.current; const have = new Set((cur.customExpenses || []).map((x) => x.id)); const add = [];
          for (const it of j.items) { if (have.has(it.id)) continue; let docId = ''; if (it.photo) { docId = `doc-rc-${it.id}`; try { const b = blobOf(it.photo, it.photoType); await docsTx('readwrite', (s) => s.put({ id: docId, name: `Beleg ${rtDm(it.date)} ${it.title}.jpg`, type: b.type, size: b.size, cat: 'Belege', added: Date.now(), blob: b })); } catch (x) { docId = ''; } } add.push(toEntry({ ...it, amountEur: it.amountEur != null ? it.amountEur : rcToEur(cur, it.amount, it.currency), stageId: it.stageId || ((rcStageFor(cur, it.date) || {}).id || ''), docId })); }
          if (add.length) { docsChanged(); onSave({ ...cur, customExpenses: [...(cur.customExpenses || []), ...add] }, `${add.length} Belege übernommen`); }
          setMsg(add.length ? `${add.length} Belege übernommen${j.items.length - add.length ? `, ${j.items.length - add.length} waren schon da` : ''}.` : 'Alle Belege aus der Datei sind schon in der Reise.');
        } catch (x) { setMsg('Datei konnte nicht gelesen werden: ' + (x && x.message ? x.message : x)); }
      };
      // Auswertung
      const P = rcPeople(trip); const sum = list.reduce((a, r) => a + (Number(r.amountEur) || 0), 0);
      const byCard = {}, byCat = {}, paid = {}, share = {};
      list.forEach((r) => { const a = Number(r.amountEur) || 0; byCard[r.creditCard || 'Bar'] = (byCard[r.creditCard || 'Bar'] || 0) + a; byCat[r.category || 'Sonstiges'] = (byCat[r.category || 'Sonstiges'] || 0) + a; paid[r.paidBy] = (paid[r.paidBy] || 0) + a; const sp = (r.splitAmong && r.splitAmong.length ? r.splitAmong : P); sp.forEach((p) => { share[p] = (share[p] || 0) + a / sp.length; }); });
      const today = rtIsoNow(); const todaySum = list.filter((r) => r.date === today).reduce((a, r) => a + (Number(r.amountEur) || 0), 0);
      const newBtn = <button type="button" data-readonly-allow data-rc-new className="sp3-btn pri grow" onClick={() => setForm(false)}><RtI n="cam" s={20} />&nbsp;Kassenzettel fotografieren</button>;
      const formEl = form !== null && <RcForm trip={trip} init={form || null} onDone={save} onCancel={() => setForm(null)} />;
      const qInfo = queue.length > 0 && <div className="sp3-warn" data-rc-queue><div><b>{queue.length} {queue.length === 1 ? 'Beleg' : 'Belege'} nur auf diesem Gerät</b>{queue.some((x) => x.sent) ? ` (${queue.filter((x) => x.sent).length} schon verschickt)` : ''}. Im Modus „Nur lesen“ werden sie gesammelt und dann am Laptop in die Reise übernommen.</div><div className="sp3-acts"><button type="button" data-readonly-allow data-rc-export className="sp3-btn sm" onClick={exportQ}>An den Laptop schicken</button>{queue.some((x) => x.sent) && <button type="button" data-readonly-allow className="sp3-btn sm del" onClick={dropSent}>Verschickte entfernen</button>}</div></div>;
      if (compact) return (
        <section data-ro-ok data-receipts="compact" aria-label="Ausgaben unterwegs" className="sp3"><div className="sp3-card">
          <div className="sp3-line"><span className="sp3-grow"><h2 className="sp3-h2">Ausgaben</h2><span className="sp3-mute">Heute {rtEur(todaySum)} · Reise bisher {rtEur(sum)} · {list.length} {list.length === 1 ? 'Beleg' : 'Belege'}</span></span></div>
          {qInfo}{msg && <p role="status" className="sp3-mute">{msg}</p>}
        </div>{formEl}</section>
      );
      const shown = all ? list : list.slice(0, 8);
      return (
        <section data-ro-ok data-receipts aria-label="Belege" className="sp3"><div className="sp3-card">
          <div className="sp3-line"><span className="sp3-grow"><h2 className="sp3-h2">Belege und Ausgaben unterwegs</h2><span className="sp3-mute">{list.length} {list.length === 1 ? 'Beleg' : 'Belege'} · {rtEur(sum)}{list.length ? ` · heute ${rtEur(todaySum)}` : ''}</span></span></div>
          <div className="sp3-acts">{newBtn}{!readOnly && <label className="sp3-btn" data-rc-import>Belege vom Handy übernehmen<input type="file" accept="application/json,.json" onChange={importQ} className="sp3-hide" /></label>}</div>
          {qInfo}{msg && <p role="status" data-rc-msg className="sp3-mute">{msg}</p>}
          {list.length > 0 && <div className="sp3-sum" data-rc-sum>
            <div><h3>Je Karte</h3>{Object.entries(byCard).sort((a, b) => b[1] - a[1]).map(([k, v]) => <p key={k}><span>{k}</span><b>{rtEur(v)}</b></p>)}</div>
            <div><h3>Je Kategorie</h3>{Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => <p key={k}><span>{k}</span><b>{rtEur(v)}</b></p>)}</div>
            <div><h3>Je Person</h3>{P.map((p) => <p key={p} data-rc-person={p}><span>{p}</span><b>bezahlt {rtEur(paid[p] || 0)} · Anteil {rtEur(share[p] || 0)}</b></p>)}</div>
          </div>}
          {list.length > 0 && <div className="sp3-card list in">{shown.map((r) => { const isO = open === r.id; return (
            <div key={r.id} data-rc-row={r.where} className={`sp3-row${isO ? ' open' : ''}`}>
              <button type="button" data-readonly-allow className="sp3-rowbtn" aria-expanded={isO} onClick={() => setOpen(isO ? null : r.id)}>
                {photos[r.id] ? <img className="sp3-thumb" src={photos[r.id]} alt="" /> : <span className="sp3-lead ico"><RtI n="cam" s={18} /></span>}
                <span className="sp3-grow"><span className="sp3-rt">{r.title}</span><span className="sp3-mute">{[rtDm(r.date), r.category, r.creditCard, r.where === 'queue' ? 'nur auf diesem Gerät' : ''].filter(Boolean).join(' · ')}</span></span>
                <span className="sp3-amt"><b>{rtEur(r.amountEur)}</b>{r.currency && r.currency !== 'EUR' && <small>{String(r.amount).replace('.', ',')} {r.currency}</small>}</span>
              </button>
              {isO && <div className="sp3-rowbody">
                <p className="sp3-mute">Bezahlt von {r.paidBy}{(r.splitAmong || []).length ? `, geteilt auf ${(r.splitAmong || []).join(', ')}` : ''}{r.notes ? ` · ${r.notes}` : ''}</p>
                <div className="sp3-acts">
                  {photos[r.id] && <button type="button" data-readonly-allow className="sp3-btn sm" onClick={() => openPhoto(r)}>Foto ansehen</button>}
                  {(r.where === 'queue' || !readOnly) && <button type="button" data-readonly-allow data-rc-edit className="sp3-btn sm" onClick={() => edit(r)}>Bearbeiten</button>}
                  {(r.where === 'queue' || !readOnly) && <button type="button" data-readonly-allow data-rc-del className="sp3-btn sm del" onClick={() => del(r)}>Löschen</button>}
                </div>
              </div>}
            </div>); })}
            {list.length > 8 && <div className="sp3-addrow"><button type="button" data-readonly-allow className="sp3-btn sm" onClick={() => setAll(!all)}>{all ? 'Weniger zeigen' : `Alle ${list.length} zeigen`}</button></div>}
          </div>}
          <p className="sp3-hint">Belege zählen im Budget unter „Extras“, bei der gewählten Karte und in „Wer schuldet wem“. Fotos werden verkleinert und mit der Reise gespeichert (Dokumente › Belege).</p>
        </div>{formEl}</section>
      );
    }

    