/* ===== v18: neue Navigation, Heute-Karte ===== */
    const V18_ICONS = {
      today: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/></>,
      plan: <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2zM9 3v16M15 5v16"/>,
      book: <><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20M6 15h4"/></>,
      go: <path d="m3 11 19-9-9 19-2-8-8-2z"/>,
      more: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
      swap: <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>,
      logo: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></>
    };
    function V18Icon({ n, size = 20 }) { return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="v18-ico">{V18_ICONS[n]}</svg>; }
    const V18_GROUPS = [
      { id: 'plan', label: 'Planen', tabs: [{ id: 'stages', label: 'Etappen' }, { id: 'plan', label: 'Tagesplan' }, { id: 'overview', label: 'Übersicht' }, { id: 'map', label: 'Karte' }] },
      { id: 'book', label: 'Buchen', tabs: [{ id: 'basics', label: 'Buchungen' }, { id: 'cards', label: 'Karten & Notfall' }, { id: 'finance', label: 'Budget' }] },
      { id: 'go', label: 'Unterwegs', tabs: [{ id: 'today', label: 'Heute' }, { id: 'trip', label: 'Wo bin ich' }, { id: 'navi', label: '1-Klick Navi' }, { id: 'wx', label: 'Wetter' }, { id: 'ustools', label: 'Rechner & Listen' }] },
      { id: 'more', label: 'Einstellungen', short: 'Optionen', tabs: [{ id: 'cloud', label: 'Reisen & Daten' }] }
    ];

    const v18Last = {};
    const v18GroupOf = (tab) => V18_GROUPS.find((g) => g.tabs.some((t) => t.id === tab)) || V18_GROUPS[0];

    const THEME_KEY = 'roadtrip_theme_v1';
    const themeGet = () => { try { const v = localStorage.getItem(THEME_KEY); return v === 'light' || v === 'dark' ? v : 'auto'; } catch (e) { return 'auto'; } };
    const themeIsDark = (m) => m === 'dark' || (m === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const dkLum = (c) => { const m = String(c).match(/[\d.]+/g); if (!m || m.length < 3) return null; const [r, g, b, a = 1] = m.map(Number); return { l: (0.299 * r + 0.587 * g + 0.114 * b) / 255, a }; };
    function dkProcess(el) {
      if (!el || el.nodeType !== 1 || el.closest('.leaflet-container') || /^(SCRIPT|STYLE|IMG|SVG|PATH|CANVAS|INPUT|SELECT|TEXTAREA)$/i.test(el.tagName)) return;
      const cs = getComputedStyle(el); const keep = /(^|\s)bg-[a-z]+-[4-9]00(\s|$)|bg-\[#(1F4E8C|0|1[0-9A-F]{5}|173B6B)/i.test(String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className)) || el.matches('.v18-btn.pri');
      if (!el.classList.contains('dk-bg') && !keep) { const bg = dkLum(cs.backgroundColor); if (bg && bg.a > 0.3 && bg.l > 0.6) { const m = String(cs.backgroundColor).match(/[\d.]+/g).map(Number); const mx = Math.max(m[0], m[1], m[2]), mn = Math.min(m[0], m[1], m[2]); const sat = mx ? (mx - mn) / mx : 0; if (sat < 0.06) { el.style.setProperty('--dk', '#fff'); el.style.setProperty('--dka', '.04'); el.classList.add('dk-n'); } else { const d = mx - mn; let h = mx === m[0] ? ((m[1] - m[2]) / d) % 6 : mx === m[1] ? (m[2] - m[0]) / d + 2 : (m[0] - m[1]) / d + 4; h = (h * 60 + 360) % 360; el.style.setProperty('--dk', `hsl(${h.toFixed(0)}, 62%, 46%)`); el.style.setProperty('--dka', String(Math.min(0.42, 0.22 + sat * 0.5).toFixed(2))); } el.classList.add('dk-bg'); } }
      if (!el.classList.contains('dk-fg') && !keep) { const fg = dkLum(cs.color); if (fg && fg.l < 0.45) el.classList.add('dk-fg'); }
    }
    function dkFull() { document.querySelectorAll('body *').forEach(dkProcess); }
    let dkObs = null, dkTimer = null; const dkQueue = new Set();
    function dkStart() {
      if (dkObs) return; dkFull();
      dkObs = new MutationObserver((recs) => { recs.forEach((r) => { if (r.type === 'attributes') dkQueue.add(r.target); else r.addedNodes.forEach((n) => { if (n.nodeType === 1) { dkQueue.add(n); n.querySelectorAll && n.querySelectorAll('*').forEach((x) => dkQueue.add(x)); } }); }); if (!dkTimer) dkTimer = setTimeout(() => { dkTimer = null; const q = [...dkQueue]; dkQueue.clear(); q.forEach(dkProcess); }, 120); });
      dkObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    function dkStop() { if (dkObs) { dkObs.disconnect(); dkObs = null; } dkQueue.clear(); document.querySelectorAll('.dk-bg,.dk-fg').forEach((e) => { e.classList.remove('dk-bg', 'dk-fg', 'dk-n'); e.style.removeProperty('--dk'); e.style.removeProperty('--dka'); }); }
    function themeApply(m) {
      const dark = themeIsDark(m || themeGet()); const h = document.documentElement;
      if (dark) { h.setAttribute('data-dark', '1'); dkStart(); } else { h.removeAttribute('data-dark'); dkStop(); }
    }
    try {
      themeApply();
      if (window.matchMedia) { const mq = window.matchMedia('(prefers-color-scheme: dark)'); const f = () => { if (themeGet() === 'auto') themeApply('auto'); }; mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener && mq.addListener(f); }
      window.addEventListener('beforeprint', () => { document.documentElement.removeAttribute('data-dark'); });
      window.addEventListener('afterprint', () => { themeApply(); });
    } catch (e) {}
    function ThemeSwitch({ compact }) {
      const [m, setM] = useState(themeGet());
      const set = (v) => { try { localStorage.setItem(THEME_KEY, v); } catch (e) {} setM(v); themeApply(v); };
      const opts = [['light', 'Hell'], ['auto', 'Auto'], ['dark', 'Dunkel']];
      if (compact) { const nxt = { light: 'dark', dark: 'auto', auto: 'light' }[m]; return <button type="button" data-theme-cycle onClick={() => set(nxt)} aria-label={`Darstellung: ${{ light: 'Hell', dark: 'Dunkel', auto: 'Automatisch' }[m]} (tippen zum Wechseln)`} className="text-xs font-semibold px-2 py-1 rounded-full border border-slate-300">{{ light: '☀', dark: '☾', auto: '◐' }[m]}</button>; }
      return <div className="theme-seg" role="group" aria-label="Darstellung">{opts.map(([k, l]) => <button key={k} type="button" data-theme={k} aria-pressed={m === k} onClick={() => set(k)}>{l}</button>)}</div>;
    }
    function V18Shell({ activeTab, setActiveTab, trip, countdown, onMeta, isOnline, syncStatus, total, people }) {
      const g = v18GroupOf(activeTab); v18Last[g.id] = activeTab;
      const go = (grp) => { if (grp.id === g.id && activeTab === 'stages') window.dispatchEvent(new Event('rt-stage-list')); setActiveTab(v18Last[grp.id] || grp.tabs[0].id); };
      const meta = (trip && trip.meta) || {};
      const status = !isOnline ? { c: '#B45309', t: 'Offline' } : syncStatus === 'synced' ? { c: '#15803D', t: 'Cloud aktiv' } : { c: '#15803D', t: 'Offline bereit' };
      const cdCls = countdown && (countdown.status === 'upcoming') ? 'v18-cd warn' : 'v18-cd';
      return (
        <div data-ro-ok className="no-print">
          <aside className="v18-side hidden md:flex" aria-label="Seitenleiste">
            <div className="flex items-center gap-3">
              <div className="v18-logo"><V18Icon n="logo" size={22} /></div>
              <div className="min-w-0"><div className="font-bold text-[15px] leading-tight break-words">{String(meta.title || 'Roadtrip Planer').replace(/\s*\([^)]*\)\s*$/, '')}</div><div className="text-xs text-slate-500">{(String(meta.title || '').match(/\(([^)]*)\)\s*$/) || [])[1] ? (String(meta.title).match(/\(([^)]*)\)\s*$/))[1] + ' · ' : ''}{people} Personen</div></div>
            </div>
            {trip.meta && trip.meta.tripId === 'demo-florida-v1' && <div data-demo-chip className="v18-demo"><span>Demo-Reise</span><button type="button" data-demo-reset-chip onClick={async () => { if ((await window.rtAsk('Die Demo-Reise wird auf den Ursprungszustand zurückgesetzt. Alle Änderungen daran gehen verloren. Fortfahren?'))) { await loadDemo(); location.reload(); } }}>Zurücksetzen</button></div>}
            <RtSideStatus trip={trip} />
            {countdown && <button type="button" onClick={onMeta} className={cdCls} title="Abreisedatum, Titel oder Wechselkurs anpassen">{countdown.label}</button>}
            <nav className="flex flex-col gap-1" aria-label="Bereiche">
              {V18_GROUPS.filter((x) => x.id !== 'more').map((x) => <button key={x.id} type="button" data-nav={x.id} aria-current={x.id === g.id ? 'page' : undefined} onClick={() => go(x)} className={`v18-nav ${x.id === g.id ? 'on' : ''}`}><V18Icon n={x.id} />{x.label}</button>)}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <div className="border-t border-slate-200 pt-4 text-[13px] text-slate-700 space-y-1.5">
                <div className="flex items-center gap-2"><span style={{ width: 8, height: 8, borderRadius: '50%', background: status.c, display: 'inline-block' }} />{status.t}</div>
                <div className="text-slate-500">Gesamt: {formatEur(total)}</div><div className="text-[11px] text-slate-400">Version 107</div>
                <button type="button" data-meta-open onClick={() => window.dispatchEvent(new CustomEvent('rt-wizard', { detail: { step: 'frame' } }))} className="text-[13px] font-semibold" style={{ color: '#173B6B' }}>Reise & Zeitraum ändern</button>
              </div>
              <div className="flex items-center justify-between gap-2 text-[12px] text-slate-500"><span>Darstellung</span><ThemeSwitch /></div>
              <button type="button" data-nav="more" aria-current={g.id === 'more' ? 'page' : undefined} onClick={() => go(V18_GROUPS[3])} className={`v18-btn justify-center ${g.id === 'more' ? 'pri' : ''}`}><V18Icon n="more" />Einstellungen</button>
              <button type="button" onClick={() => setActiveTab('cloud')} className="v18-btn justify-center"><V18Icon n="swap" />Reise wechseln</button>
              <button type="button" data-readonly-allow data-help-open onClick={rtOpenHelp} className="v18-btn justify-center">Hilfe / Erste Schritte</button>
            </div>
          </aside>
          <header className="v18-mhead md:hidden">
            <div className="font-bold text-[17px]">{g.label}<span className="ml-2 text-[10px] font-normal text-slate-400">{'Version 107'.replace('Version ', 'v')}</span>{trip.meta && trip.meta.tripId === 'demo-florida-v1' && <span className="ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">DEMO</span>}</div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" data-readonly-allow data-help-open onClick={rtOpenHelp} aria-label="Hilfe: Erste Schritte" title="Hilfe" className="rt-help-btn">?</button>
              <ThemeSwitch compact />
              <button type="button" onClick={() => setActiveTab('cloud')} title={status.t} aria-label={status.t} className="rt-stat-btn"><span style={{ width: 10, height: 10, borderRadius: '50%', background: status.c, display: 'inline-block' }} /><span className="rt-stat-t">{status.t}</span></button>
            </div>
          </header>
          <nav className="v18-bottom md:hidden" aria-label="Bereiche (unten)">
            {V18_GROUPS.map((x) => <button key={x.id} type="button" data-mobile-tab={x.id} aria-current={x.id === g.id ? 'page' : undefined} onClick={() => go(x)} className={x.id === g.id ? 'on' : ''}><i><V18Icon n={x.id} size={22} /></i>{x.short || x.label}</button>)}
          </nav>
        </div>
      );
    }
    function V18SubHead({ activeTab, setActiveTab }) {
      const g = v18GroupOf(activeTab);
      return (
        <div data-ro-ok className="v18-subhead no-print">
          <h1 className="hidden md:block text-2xl font-bold tracking-tight">{g.label}</h1>
          {g.tabs.length > 1 && <div className="v18-seg" role="tablist">{g.tabs.map((t) => <button key={t.id} type="button" role="tab" aria-selected={t.id === activeTab} data-sub={t.id} onClick={() => { if (t.id === 'stages') window.dispatchEvent(new Event('rt-stage-list')); setActiveTab(t.id); }} className={t.id === activeTab ? 'on' : ''}>{t.label}</button>)}</div>}
        </div>
      );
    }
    function V18DayChips({ days, sel, onSel }) {
      const ref = useRef(null);
      useEffect(() => { try { const el = ref.current && ref.current.querySelector('[aria-pressed="true"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {} }, [sel]);
      return (
        <div ref={ref} className="v18-chips" role="group" aria-label="Tag wählen">
          {days.map((d) => { const [y, m, dd] = d.iso.split('-').map(Number); const wd = new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString('de-DE', { weekday: 'short', timeZone: 'UTC' }); const on = d.iso === sel; return <button key={d.iso} type="button" aria-pressed={on} onClick={() => onSel(d.iso)} className={`v18-day ${on ? 'on' : ''}`}><span>{wd}</span><b>{dd}</b></button>; })}
        </div>
      );
    }
    function V18NextCard({ trip, day, isToday, nowMin }) {
      const stage = day.stage; const h = stage.hotel || {};
      const tl = day.kind === 'travel' ? buildTimeline(trip, day) : null;
      let label, title, sub = '', nav = null;
      if (tl && tl.events.length) {
        const evs = tl.events; let i = isToday ? evs.findIndex((e) => e.at >= nowMin) : 0; if (i < 0) i = evs.length - 1;
        const ev = evs[i], nx = evs[i + 1];
        label = `${isToday ? 'Als Nächstes' : 'Tagesstart'} · ${fmtHM(ev.at)}`; title = ev.title; sub = nx ? `Danach ${fmtHM(nx.at)} ${nx.title}` : '';
        const t = ev.kind !== 'depart' && ev.gps ? ev : nx; if (t && t.gps) nav = { gps: t.gps, address: t.address, name: t.title };
      } else {
        label = isToday ? 'Heute' : 'Tagesübersicht';
        title = day.kind === 'stay' ? `Aufenthalt in ${stage.toCity || ''}` : day.kind === 'checkout' ? `Check-out ${hotelName(stage)}` : `Tag in ${stage.toCity || ''}`;
        if (parseGps(h.gps)) nav = { gps: h.gps, address: h.address, name: h.name };
      }
      return (
        <div className="v18-hero">
          <div className="v18-lbl">{label}</div>
          <h3 className="text-lg font-bold mt-0.5 break-words">{title}</h3>
          {sub && <p className="text-[13px] text-slate-600 break-words">{sub}</p>}
          {(stage.toCity || h.name) && (
            <dl className="v18-facts">
              {stage.toCity && <div><dt>Ziel</dt><dd>{stage.toCity}</dd></div>}
              {h.name && <div><dt>Hotel</dt><dd>{h.name}</dd></div>}
            </dl>
          )}
          {nav && <NavLink gps={nav.gps} address={nav.address} name={nav.name} label="Navigation starten" className="v18-btn pri mt-3 w-full sm:w-auto justify-center" />}
        </div>
      );
    }

        /* ===== v20: Etappen-Finder (Entfernung / Fahrzeit) ===== */
    const sfFmtH = (min) => { const h = Math.floor(min / 60), m = Math.round(min % 60); return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`; };
    async function sfGeocode(q) {
      const tg = (window.__rtTripGeo || {})[rtNormName(q)]; if (tg) return tg;
      const pk = rtPickGet(q); if (pk) return pk;
      const j = await fetchJsonT(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`, 12000);
      return j && j[0] ? [Number(j[0].lat), Number(j[0].lon)] : null;
    }
    const SF_TOL = { narrow: 25, normal: 45, wide: 70 };
    const sfSectors = (origin, Rkm, dirs, tol) => dirs.map((d) => {
      const pts = [origin]; const R = Rkm * 1.01 / Math.cos(5 * Math.PI / 180); const angs = []; for (let a = d - tol; a < d + tol; a += 10) angs.push(a); angs.push(d + tol);
      angs.forEach((a) => { const r = a * Math.PI / 180; pts.push([origin[0] + (R / 111.2) * Math.cos(r), origin[1] + (R / (111.2 * Math.cos(origin[0] * Math.PI / 180))) * Math.sin(r)]); });
      return pts;
    });
    async function sfWikidata(origin, Rkm, minPop, minSl, sectors) {
      let area;
      if (sectors) { const all = sectors.flat(); const la = all.map((p) => p[0]), lo = all.map((p) => p[1]); const s = Math.max(-89, Math.min(...la)), n = Math.min(89, Math.max(...la)), w = Math.max(-179, Math.min(...lo)), e = Math.min(179, Math.max(...lo));
        area = `SERVICE wikibase:box { ?item wdt:P625 ?loc . bd:serviceParam wikibase:cornerSouthWest "Point(${w.toFixed(4)} ${s.toFixed(4)})"^^geo:wktLiteral . bd:serviceParam wikibase:cornerNorthEast "Point(${e.toFixed(4)} ${n.toFixed(4)})"^^geo:wktLiteral . }`; }
      else area = `SERVICE wikibase:around { ?item wdt:P625 ?loc . bd:serviceParam wikibase:center "Point(${origin[1]} ${origin[0]})"^^geo:wktLiteral . bd:serviceParam wikibase:radius "${Math.round(Rkm)}" . }`;
      const q = `SELECT ?item ?itemLabel ?loc ?pop ?img ?sl ?elev ?water ?cap WHERE { ${area} ?item wdt:P1082 ?pop . FILTER(?pop > ${minPop}) ?item wdt:P31/wdt:P279* wd:Q486972 . ?item wikibase:sitelinks ?sl . FILTER(?sl >= ${minSl}) FILTER NOT EXISTS { ?item wdt:P31 wd:Q498162 } . BIND(EXISTS { ?item wdt:P206 ?w0 } AS ?water) BIND(EXISTS { ?item wdt:P1376 ?c0 } AS ?cap) OPTIONAL { ?item wdt:P2044 ?elev } OPTIONAL { ?item wdt:P18 ?img } SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } } ORDER BY DESC(?pop) LIMIT 250`;
      const j = await fetchJsonT(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`, 40000);
      const m = new Map();
      ((j.results && j.results.bindings) || []).forEach((r) => {
        const mm = /Point\(([-\d.eE]+) ([-\d.eE]+)\)/.exec(r.loc && r.loc.value); if (!mm) return;
        const name = r.itemLabel && r.itemLabel.value; if (!name || /^Q\d+$/.test(name)) return;
        const id = r.item.value, pop = Number(r.pop.value) || 0, prev = m.get(id);
        const img = r.img && r.img.value ? r.img.value.replace(/^http:/, 'https:') + '?width=360' : (prev && prev.img) || '';
        const extra = { sl: Number(r.sl && r.sl.value) || 0, water: !!(r.water && r.water.value === 'true'), cap: !!(r.cap && r.cap.value === 'true'), elev: r.elev ? Number(r.elev.value) : null };
        if (!prev || pop > prev.pop) m.set(id, { id, name, lat: Number(mm[2]), lon: Number(mm[1]), pop, type: 'city', img, ...extra }); else if (img && !prev.img) prev.img = img;
      });
      return [...m.values()];
    }
    async function sfOverpass(origin, Rm, sectors) {
      const sel = (t) => (sectors ? sectors.map((pts) => `node["place"="${t}"](poly:"${pts.map((p) => p[0].toFixed(4) + ' ' + p[1].toFixed(4)).join(' ')}");`).join('') : `node["place"="${t}"](around:${Math.round(Rm)},${origin[0]},${origin[1]});`);
      const q = `[out:json][timeout:50];(${sel('city')}${sel('town')});out center 400;`;
      let j, lastErr;
      for (let attempt = 0; attempt < 2 && !j; attempt++) {
        try { j = await Promise.any(OVERPASS.map((u) => fetchJsonT(`${u}?data=${encodeURIComponent(q)}`, 60000))); }
        catch (e) { lastErr = e; }
      }
      if (!j) throw new Error('Overpass: ' + ((lastErr && lastErr.errors || [lastErr]).map((x) => x && x.message).filter(Boolean).join(' | ') || 'keine Antwort'));
      return (j.elements || []).filter((e) => e.tags && e.tags.name && e.lat != null && (e.tags.place === 'city' || Number(e.tags.population) >= 10000 || e.tags.wikipedia || e.tags.wikidata)).map((e) => ({ id: 'o' + (e.id != null ? e.id : e.lat + ',' + e.lon), name: e.tags.name, lat: e.lat, lon: e.lon, pop: Number(e.tags.population) || 0, type: e.tags.place, wp: e.tags.wikipedia || '' }));
    }
    async function sfFindPlaces(origin, limitKm, minKm, mode, limitMin, minMin, dirs, tol, onP, cancelled) {
      const P = onP || (() => {}); dirs = dirs || []; tol = tol || 45;
      const maxStraight = mode === 'km' ? limitKm : (limitMin / 60) * 110; // Luftlinie <= Fahrstrecke, 110 km/h als obere Schranke
      const Rkm = Math.min(380, Math.max(15, maxStraight));
      const sectors = dirs.length ? sfSectors(origin, Rkm, dirs, tol) : null;
      const lbl = 'Orte werden gesucht (Wikidata, OpenStreetMap) …'; let tick = 8; P(tick, lbl);
      const tk = setInterval(() => { tick = Math.min(40, tick + 1.5); P(tick, lbl); }, 700);
      let w, o;
      try { [w, o] = await Promise.allSettled([sfWikidata(origin, Rkm, Rkm >= 150 ? 20000 : 5000, Rkm >= 150 ? 8 : 5, sectors), sfOverpass(origin, Rkm * 1000, sectors)]); } finally { clearInterval(tk); }
      if (cancelled && cancelled()) return { items: [], estimated: false, cancelled: true };
      if (w.status === 'rejected' && o.status === 'rejected') throw new Error(`Wikidata: ${w.reason && w.reason.message} | ${o.reason && o.reason.message}`);
      const all = [...(w.status === 'fulfilled' ? w.value : []), ...(o.status === 'fulfilled' ? o.value : [])];
      const seen = []; let cand = [];
      all.forEach((c) => { if (seen.some((s) => s.name === c.name && Math.abs(s.lat - c.lat) < 0.15 && Math.abs(s.lon - c.lon) < 0.15)) return; seen.push(c); cand.push({ ...c, air: haversineM(origin, [c.lat, c.lon]) / 1000 }); });
      const bearing = (c) => { const p1 = origin[0] * Math.PI / 180, p2 = c.lat * Math.PI / 180, dl = (c.lon - origin[1]) * Math.PI / 180; return (Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) * 180 / Math.PI + 360) % 360; };
      const inDir = (c) => { if (!dirs.length) return true; const b = bearing(c); return dirs.some((dd) => Math.abs(((b - dd) + 540) % 360 - 180) <= tol); };
      const minStraight = mode === 'km' ? minKm * 0.5 : 0;
      cand = cand.filter((c) => c.air <= Rkm * 1.02 && c.air >= Math.min(minStraight, 1e9) && c.air > 2 && inDir(c)).sort((a, b) => (b.pop - a.pop) || (a.air - b.air)).slice(0, 80);
      if (!cand.length) { P(100, 'Fertig'); return { items: [], estimated: false }; }
      let estimated = false; const out = []; const tot = Math.ceil(cand.length / 40);
      for (let i = 0; i < cand.length; i += 40) {
        if (cancelled && cancelled()) return { items: [], estimated: false, cancelled: true };
        P(45 + (i / cand.length) * 50, `Fahrstrecken werden berechnet (Abschnitt ${i / 40 + 1} von ${tot}) …`);
        const chunk = cand.slice(i, i + 40);
        try {
          const coords = [origin, ...chunk.map((c) => [c.lat, c.lon])].map((p) => `${p[1]},${p[0]}`).join(';');
          const t = await fetchJsonT(`https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=distance,duration`, 25000);
          if (!t.distances || !t.durations) throw new Error('osrm');
          chunk.forEach((c, k) => { const d = t.distances[0][k + 1], s = t.durations[0][k + 1]; const snap = t.destinations && t.destinations[k + 1] && t.destinations[k + 1].distance; if (snap != null && snap > 2500) return; if (d != null && s != null) out.push({ ...c, km: d / 1000, min: s / 60 }); });
        } catch (e) { estimated = true; chunk.forEach((c) => out.push({ ...c, km: c.air * 1.3, min: (c.air * 1.3) / 80 * 60 })); }
      }
      const items = out.filter((c) => (mode === 'km' ? c.km <= limitKm && c.km >= minKm : c.min <= limitMin && c.min >= minMin)).sort((a, b) => a.km - b.km).slice(0, 40);
      P(100, 'Fertig'); return { items, estimated };
    }
    const SF_DIRS = [['N', 'Norden', 0], ['NO', 'Nordosten', 45], ['O', 'Osten', 90], ['SO', 'Südosten', 135], ['S', 'Süden', 180], ['SW', 'Südwesten', 225], ['W', 'Westen', 270], ['NW', 'Nordwesten', 315]];
    function SfCompass({ value, onChange }) {
      const vals = Array.isArray(value) ? value : []; const toggle = (deg) => onChange(vals.includes(deg) ? vals.filter((x) => x !== deg) : [...vals, deg]);
      const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [60 + r * Math.cos(a), 60 + r * Math.sin(a)]; };
      const wedge = (deg) => { const [x1, y1] = pt(deg - 22.5, 54), [x2, y2] = pt(deg + 22.5, 54), [x3, y3] = pt(deg + 22.5, 20), [x4, y4] = pt(deg - 22.5, 20); return `M${x1},${y1} A54,54 0 0 1 ${x2},${y2} L${x3},${y3} A20,20 0 0 0 ${x4},${y4} Z`; };
      return (
        <svg viewBox="0 0 120 120" width="150" height="150" role="group" aria-label="Himmelsrichtungen (mehrere wählbar)" className="shrink-0">
          {SF_DIRS.map(([k, name, deg]) => { const on = vals.includes(deg); const [tx, ty] = pt(deg, 37); return (
            <g key={k} role="checkbox" aria-checked={on} aria-label={name} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }} onClick={() => toggle(deg)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(deg); } }}>
              <path d={wedge(deg)} fill={on ? '#1F4E8C' : '#F0F2F5'} stroke="#fff" strokeWidth="1.5" />
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={k.length > 1 ? 8 : 10} fontWeight="700" fill={on ? '#fff' : '#3A4354'} style={{ pointerEvents: 'none' }}>{k}</text>
            </g>); })}
          <g role="checkbox" aria-checked={!vals.length} aria-label="Alle Richtungen" tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }} onClick={() => onChange([])} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange([]); } }}>
            <circle cx="60" cy="60" r="17" fill={!vals.length ? '#1F4E8C' : '#fff'} stroke="#CBD2DC" />
            <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fontSize="7.5" fontWeight="700" fill={!vals.length ? '#fff' : '#3A4354'} style={{ pointerEvents: 'none' }}>alle</text>
          </g>
        </svg>
      );
    }
    function SfRange({ min, max, step, lo, hi, onChange, unit, ticks }) {
      const pct = (v) => ((v - min) / (max - min)) * 100;
      return (
        <div className="v20-range" style={{ '--lo': pct(lo) + '%', '--hi': pct(hi) + '%' }}>
          <div className="v20-track" aria-hidden="true"><div className="v20-fill" /></div>
          <input data-readonly-allow style={{ zIndex: pct(lo) > 50 ? 3 : 2 }} type="range" aria-label={`Mindestabstand (${unit})`} min={min} max={max} step={step} value={lo} onChange={(e) => onChange(Math.min(Number(e.target.value), hi), hi)} />
          <input data-readonly-allow style={{ zIndex: 2 }} type="range" aria-label={`Höchstabstand (${unit})`} min={min} max={max} step={step} value={hi} onChange={(e) => onChange(lo, Math.max(Number(e.target.value), lo))} />
          <div className="v20-ticks" aria-hidden="true">{ticks.map((t) => <span key={t} style={{ left: pct(t) + '%' }}>{t}</span>)}</div>
        </div>
      );
    }
    const sfInfoCache = {};
    async function sfWikiInfo(c) {
      const key = c.id || c.name; if (sfInfoCache[key]) return sfInfoCache[key];
      const tries = []; if (c.wp && /^[a-z-]+:/.test(c.wp)) { const [l, ...t] = c.wp.split(':'); tries.push([l, t.join(':')]); }
      tries.push(['de', c.name], ['en', c.name]);
      let info = { img: '', desc: '' };
      for (const [lang, title] of tries) {
        try { const j = await fetchJsonT(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}?redirect=true`, 9000);
          if (j && j.type !== 'disambiguation') { info = { img: (j.thumbnail && j.thumbnail.source) || '', desc: (j.description || '').slice(0, 110) }; if (info.img || info.desc) break; } } catch (e) {}
      }
      sfInfoCache[key] = info; return info;
    }
    function SfPlaceCard({ c, e: en, selected, onSelect, onPick }) {
      const [info, setInfo] = useState(sfInfoCache[c.id || c.name] || null);
      const [imgBad, setImgBad] = useState(false);
      const liRef = useRef(null); const mounted = useRef(false);
      useEffect(() => { if (selected && mounted.current) { asRevealCard(liRef.current, window.__asMapClick); } mounted.current = true; window.__asMapClick = false; }, [selected]);
      useEffect(() => { let on = true; if (!info) sfWikiInfo(c).then((i) => on && setInfo(i)); return () => { on = false; }; }, [c.id, c.name]);
      const photo = !imgBad && (c.img || (info && info.img));
      const desc = info && info.desc;
      return (
        <li ref={liRef} data-sf-card aria-current={selected ? 'true' : undefined} onClick={onSelect} className={`list-none flex gap-3 rounded-xl border bg-white p-2.5 cursor-pointer transition ${selected ? 'border-[#1F4E8C] ring-2 ring-[#BCCDE6]' : 'border-slate-200 hover:border-slate-300'}`}>
          <div className="shrink-0 w-28 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-[#D6E2F3] to-[#BCCDE6] flex items-center justify-center text-3xl font-bold text-[#1F4E8C]">
            {photo ? <img src={photo} alt={`Foto ${c.name}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setImgBad(true)} className="w-full h-full object-cover" /> : <span aria-hidden="true">{(c.name || '?').charAt(0)}</span>}
          </div>
          <div className="min-w-0 flex-1 flex flex-col">
            <div className="font-bold text-slate-900 leading-tight break-words">{c.name}</div>
            <div className="text-xs text-slate-600 mt-0.5">{Math.round(c.km)} km · {sfFmtH(c.min)}</div>
            <div className="flex flex-wrap gap-1 mt-0.5">{[['beach', 'Strand', (e) => e.beach > 0], ['park', 'Natur', (e) => e.park > 0], ['water', 'Gewässer', (e) => e.water > 0 || c.water === true], ['fun', 'Freizeit', (e) => e.fun > 0], ['sights', 'Sehenswürdigkeiten', (e) => e.sights >= 15]].filter(([k, l, f]) => en && f(en)).map(([k, l]) => <span key={k} className="text-[11px] px-1.5 rounded bg-[#E8EEF7] text-[#173B6B]">{l}</span>)}</div>
            <div className="text-xs text-slate-500">{c.pop ? `${c.pop.toLocaleString('de-DE')} Einwohner` : ''}{desc ? `${c.pop ? ' · ' : ''}${desc}` : ''}</div>
            <div className="mt-auto pt-1.5 flex gap-2">
              <button type="button" data-readonly-allow onClick={(e) => { e.stopPropagation(); onPick(c); }} className="v18-btn pri sm">Übernehmen</button>
              <a data-readonly-allow href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="v18-btn sm">Maps</a>
            </div>
          </div>
        </li>
      );
    }
    const sfRouteCache = {};
    function SfMap({ origin, items, selId, onSelect, originName }) {
      const el = useRef(null), mapRef = useRef(null), grp = useRef(null), routeRef = useRef(null);
      const [note, setNote] = useState('');
      const sel = items.find((x) => (x.id || x.name) === selId) || items[0] || null;
      useEffect(() => {
        if (!window.L || !el.current) return; const L = window.L;
        const map = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: true }).setView(origin, 6);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap-Mitwirkende' }).addTo(map);
        mapRef.current = map; grp.current = L.layerGroup().addTo(map);
        const t = setTimeout(() => map.invalidateSize(), 200); const onR = () => map.invalidateSize(); window.addEventListener('resize', onR);
        return () => { clearTimeout(t); window.removeEventListener('resize', onR); map.remove(); mapRef.current = null; };
      }, []);
      useEffect(() => {
        const L = window.L, map = mapRef.current; if (!L || !map) return; grp.current.clearLayers();
        L.circleMarker(origin, { radius: 9, color: '#173B6B', weight: 3, fillColor: '#fff', fillOpacity: 1 }).bindTooltip(`Start: ${originName || ''}`, { permanent: false }).addTo(grp.current);
        items.forEach((c) => { const on = sel && (c.id || c.name) === (sel.id || sel.name); L.circleMarker([c.lat, c.lon], { radius: on ? 10 : 6, color: '#1F4E8C', weight: on ? 3 : 2, fillColor: on ? '#1F4E8C' : '#fff', fillOpacity: 1 }).bindTooltip(c.name).on('click', () => onSelect(c.id || c.name)).addTo(grp.current); });
      }, [items, selId]);
      useEffect(() => {
        const L = window.L, map = mapRef.current; if (!L || !map) return; if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; } if (!sel) { setNote(''); return; } let on = true;
        if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
        const key = `${origin}|${sel.lat},${sel.lon}`;
        const draw = (pts, dashed) => { if (!on) return; routeRef.current = L.polyline(pts, { color: '#1F4E8C', weight: 5, opacity: 0.9, dashArray: dashed ? '8 8' : null }).addTo(map); map.fitBounds(routeRef.current.getBounds(), { padding: [30, 30], maxZoom: 9 }); };
        setNote(`${Math.round(sel.km)} km · ${sfFmtH(sel.min)}`);
        if (sfRouteCache[key]) { draw(sfRouteCache[key]); return () => { on = false; }; }
        fetchJsonT(`https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${sel.lon},${sel.lat}?overview=simplified&geometries=geojson`, 15000)
          .then((j) => { const g = j.routes && j.routes[0] && j.routes[0].geometry.coordinates; if (!g) throw new Error('no route'); const pts = g.map(([x, y]) => [y, x]); sfRouteCache[key] = pts; draw(pts); })
          .catch(() => { draw([origin, [sel.lat, sel.lon]], true); setNote(`${Math.round(sel.km)} km · ${sfFmtH(sel.min)} (Luftlinie, Route nicht geladen)`); });
        return () => { on = false; };
      }, [selId, items]);
      return (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
          <div ref={el} data-sf-map className="w-full h-[280px] lg:h-[520px] bg-slate-100" role="img" aria-label="Karte mit Routenabschnitt" />
          <div className="px-3 py-2 text-xs text-slate-600 border-t border-slate-100"><b className="text-slate-900">{originName} → {sel && sel.name}</b> · {note}</div>
        </div>
      );
    }
    const sfEnrCache = {};
    async function sfEnrich(items) {
      const out = {}; const todo = [];
      items.forEach((c) => { const k = `${c.lat.toFixed(3)},${c.lon.toFixed(3)}`; if (sfEnrCache[k]) out[c.id || c.name] = sfEnrCache[k]; else todo.push({ c, k }); });
      const chunks = []; for (let i = 0; i < todo.length; i += 10) chunks.push(todo.slice(i, i + 10));
      const blk = (c) => { const p = `${c.lat},${c.lon}`; return [
        `nwr["natural"="beach"](around:4000,${p});out count;`,
        `(nwr["boundary"="national_park"](around:25000,${p});nwr["leisure"="nature_reserve"]["name"](around:8000,${p}););out count;`,
        `(nwr["waterway"="waterfall"](around:15000,${p});nwr["natural"="water"]["water"~"^(lake|reservoir)$"]["name"](around:5000,${p});way["waterway"="river"]["name"](around:3000,${p}););out count;`,
        `nwr["tourism"~"^(theme_park|zoo|aquarium)$"](around:10000,${p});out count;`,
        `(nwr["tourism"="attraction"](around:2500,${p});nwr["historic"](around:2500,${p}););out count;`]; };
      let ok = 0, fail = 0;
      await Promise.all(chunks.map(async (ch) => {
        const q = `[out:json][timeout:40];\n${ch.map(({ c }) => blk(c).join('\n')).join('\n')}`;
        try {
          const j = await Promise.any(OVERPASS.map((u) => fetchJsonT(`${u}?data=${encodeURIComponent(q)}`, 45000)));
          const cnt = (j.elements || []).filter((e) => e.type === 'count').map((e) => Number(e.tags && e.tags.total) || 0);
          if (cnt.length < ch.length * 5) throw new Error('unvollständig');
          ch.forEach(({ c, k }, i) => { const v = { beach: cnt[i * 5], park: cnt[i * 5 + 1], water: cnt[i * 5 + 2], fun: cnt[i * 5 + 3], sights: cnt[i * 5 + 4] }; sfEnrCache[k] = v; out[c.id || c.name] = v; });
          ok += ch.length;
        } catch (e) { fail += ch.length; }
      }));
      return { map: out, ok, fail };
    }
    function StageFinder({ trip, onPick }) {
      const stages = trip.stages || [];
      const [from, setFrom] = useState(Math.max(0, stages.length - 1));
      const [mode, setMode] = useState('km');
      const [rng, setRng] = useState([0, 300]);
      const [pickOn, setPickOn] = useState(false); const [dir, setDir] = useState([]); const [tol, setTol] = useState('normal'); const [pg, setPg] = useState({ pct: 0, label: '', busy: false }); const cancelRef = useRef(false);
      const [selId, setSelId] = useState(null);
      const [flt, setFlt] = useState([]);
      const [enr, setEnr] = useState({ busy: false, map: {}, fail: 0 });
      const [sortBy, setSortBy] = useState('km');
      const [st, setSt] = useState({ busy: false, err: '', items: null, estimated: false, origin: null });
      useEffect(() => { if (from > stages.length) setFrom(Math.max(0, stages.length - 1)); }, [stages.length]);
      const E = (c) => enr.map[c.id || c.name] || null;
      const FLT = [['big', 'Großstadt', 'Ab 250.000 Einwohnern', (c) => c.pop >= 250000, 'size'], ['mid', 'Stadt', '50.000 bis 250.000 Einwohner', (c) => c.pop >= 50000 && c.pop < 250000, 'size'], ['small', 'Kleinstadt', 'Unter 50.000 Einwohnern', (c) => c.pop > 0 && c.pop < 50000, 'size'],
        ['beach', 'Strand', 'Sandstrand höchstens ca. 4 km vom Ort', (c) => !!E(c) && E(c).beach > 0, 'f'],
        ['park', 'Nationalpark / Natur', 'Nationalpark im Umkreis von 25 km oder Naturschutzgebiet im Umkreis von 8 km', (c) => !!E(c) && E(c).park > 0, 'f'],
        ['water', 'See / Fluss / Wasserfall', 'Gewässer oder Wasserfall in der Nähe', (c) => c.water === true || (!!E(c) && E(c).water > 0), 'f'],
        ['fun', 'Freizeitpark / Zoo', 'Freizeitpark, Zoo oder Aquarium im Umkreis von 10 km', (c) => !!E(c) && E(c).fun > 0, 'f'],
        ['sights', 'Viele Sehenswürdigkeiten', 'Mindestens 15 Attraktionen und historische Orte im Umkreis von 2,5 km', (c) => !!E(c) && E(c).sights >= 15, 'f']];
      useEffect(() => { if (!st.items || !st.items.length) { setEnr({ busy: false, map: {}, fail: 0 }); return; } let on = true; setEnr({ busy: true, map: {}, fail: 0 }); sfEnrich(st.items).then((r) => on && setEnr({ busy: false, map: r.map, fail: r.fail })); return () => { on = false; }; }, [st.items]);
      const sizeSel = FLT.filter((f) => f[4] === 'size' && flt.includes(f[0])), featSel = FLT.filter((f) => f[4] === 'f' && flt.includes(f[0]));
      const shown = useMemo(() => {
        const base = (st.items || []).filter((c) => (!sizeSel.length || sizeSel.some((f) => f[3](c))) && featSel.every((f) => f[3](c)));
        return [...base].sort(sortBy === 'km' ? (a, b) => a.km - b.km : (a, b) => b.pop - a.pop);
      }, [st.items, flt, sortBy]);
      useEffect(() => { if (shown.length && !shown.some((c) => (c.id || c.name) === selId)) setSelId(shown[0].id || shown[0].name); }, [shown]);
      if (!stages.length) return null;
      const isNew = from >= stages.length; const cur = isNew ? null : stages[from]; const prevSt = from > 0 ? stages[Math.min(from, stages.length) - 1] : null;
      const nrm = (x) => String(x || '').trim().toLowerCase();
      const startCity = isNew ? ((prevSt && prevSt.toCity) || '') : (cur.fromCity || (prevSt && prevSt.toCity) || '');
      const startGps = prevSt && (isNew || !cur.fromCity || nrm(prevSt.toCity) === nrm(cur.fromCity)) ? parseGps(prevSt.hotel && prevSt.hotel.gps) : null;
      const label = (s) => (s.toCity || s.fromCity || '–');
      const unit = mode === 'km' ? 'km' : 'Std.';
      const fmtV = (v) => (mode === 'km' ? `${v} km` : `${String(v).replace('.', ',')} Std.`);
      const dirName = !dir.length ? 'alle Richtungen' : SF_DIRS.filter((d) => dir.includes(d[2])).map((d) => d[1]).join(', ');
      const run = async () => {
        setSt({ busy: true, err: '', items: null, estimated: false, origin: null }); cancelRef.current = false; setPg({ pct: 3, label: 'Startpunkt wird gesucht …', busy: true });
        try {
          let g = startGps;
          if (!g && startCity) g = await sfGeocode(startCity);
          if (!g) throw new Error('Startpunkt nicht gefunden. Bitte den Startort der Etappe als eindeutigen Ortsnamen eintragen oder im Hotel der Vor-Etappe GPS hinterlegen.');
          const [mn, mx] = rng;
          if (!(mx > 0)) throw new Error('Wert: Der Höchstabstand muss größer als 0 sein.');
          const r = await sfFindPlaces(g, mode === 'km' ? mx : 0, mode === 'km' ? mn : 0, mode, mx * 60, mn * 60, dir, SF_TOL[tol], (pct, label) => setPg({ pct, label, busy: true }), () => cancelRef.current);
          if (r.cancelled) { setPg({ pct: 0, label: '', busy: false }); setSt({ busy: false, err: '', items: null, estimated: false, origin: null }); return; }
          setPg({ pct: 100, label: 'Fertig', busy: false });
          setSt({ busy: false, err: '', items: r.items, estimated: r.estimated, origin: g }); setSelId(r.items[0] ? (r.items[0].id || r.items[0].name) : null);
        } catch (e) { setPg({ pct: 0, label: '', busy: false }); setSt({ busy: false, err: /Startpunkt|^Wert/.test(e.message) ? e.message.replace(/^Wert: /, '') : (/Zeitüberschreitung|abort/i.test(e.message) ? 'Die Kartendienste (Wikidata, OpenStreetMap) haben nicht rechtzeitig geantwortet. Bitte nochmal versuchen, mehr Richtungen wählen, den Bereich verkleinern oder später erneut suchen (die Dienste sind manchmal überlastet).' : `Orte konnten nicht geladen werden (${String(e.message || e).slice(0, 260)}). Internet nötig; bei großem Radius hilft eine kleinere Obergrenze.`), items: null, estimated: false, origin: null }); }
      };
      return (
        <details data-finder className="v18-edit-only v20-finder rounded-2xl border border-slate-200 bg-white no-print">
          <summary className="cursor-pointer px-4 py-3"><span className="font-bold text-slate-900">Nächste Etappe finden</span><span className="block text-xs text-slate-500">Orte in einem Abstands-Bereich und einer Himmelsrichtung vorschlagen</span></summary>
          <div className="p-4 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Ziel suchen für (Abstand ab Startort der Etappe)
                <select data-readonly-allow value={from} onChange={(e) => setFrom(Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white">{stages.map((s, i) => <option key={s.id} value={i}>Etappe {i + 1}: {s.fromCity || '–'} → {s.toCity || '–'}</option>)}<option value={stages.length}>Neue Etappe anhängen (Start: {label(stages[stages.length - 1])})</option></select>
              </label>
              <div className="text-sm font-semibold">Abstand messen in
                <div className="mt-1 inline-flex rounded-lg border border-slate-300 overflow-hidden w-full">
                  {[['km', 'Entfernung (km)'], ['h', 'Fahrzeit (Std.)']].map(([k, l]) => <button key={k} type="button" data-readonly-allow aria-pressed={mode === k} onClick={() => { setMode(k); setRng(k === 'km' ? [0, 300] : [0, 3.5]); }} className={`flex-1 px-3 py-2 text-sm font-semibold ${mode === k ? 'bg-[#1F4E8C] text-white' : 'bg-white text-slate-700'}`}>{l}</button>)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex-1 min-w-[240px] space-y-2">
                <div className="flex items-baseline justify-between gap-2 text-sm"><span className="font-semibold">Abstand zum Ort</span><span data-sf-range className="font-bold text-[#1F4E8C]">{fmtV(rng[0])} – {fmtV(rng[1])}</span></div>
                {mode === 'km'
                  ? <SfRange min={0} max={750} step={10} lo={rng[0]} hi={rng[1]} unit={unit} ticks={[0, 150, 300, 450, 600, 750]} onChange={(a, b) => setRng([a, b])} />
                  : <SfRange min={0} max={10} step={0.25} lo={rng[0]} hi={rng[1]} unit={unit} ticks={[0, 2, 4, 6, 8, 10]} onChange={(a, b) => setRng([a, b])} />}
                <div className="text-xs text-slate-500">Linker Punkt: Mindestabstand · rechter Punkt: Höchstabstand</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <SfCompass value={dir} onChange={setDir} />
                <div data-sf-dir className="text-xs font-semibold text-slate-700 max-w-[180px] text-center">Richtung: {dirName}</div>
                <div className="text-[11px] text-slate-500">Mehrere Richtungen antippbar</div>
                <div data-sf-tol role="group" aria-label="Öffnung der Richtung" className="inline-flex rounded-lg border border-slate-300 overflow-hidden text-xs">{[['narrow', 'Schmal'], ['normal', 'Normal'], ['wide', 'Breit']].map(([k, l]) => <button key={k} type="button" data-readonly-allow aria-pressed={tol === k} onClick={() => setTol(k)} className={`px-2.5 py-1.5 font-semibold ${tol === k ? 'bg-[#1F4E8C] text-white' : 'bg-white text-slate-700'}`}>{l}</button>)}</div>
              </div>
            </div>
            <RtRouteInline />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" data-readonly-allow onClick={run} disabled={st.busy} className="v18-btn pri disabled:opacity-50">{st.busy ? 'Suche läuft …' : 'Orte suchen'}</button>
              <button type="button" data-readonly-allow data-sf-pick-toggle onClick={() => sfPickOpen({ from, startGps, startCity, mode, rng, dir, tol, onPick })} className="v18-btn">Ort auf der Karte wählen</button>
              <span className="text-xs text-slate-500">{!isNew ? `Start: ${startCity || '–'}. Das Ergebnis ersetzt das Ziel von Etappe ${from + 1} (${cur.toCity || '–'}).` : `Start: ${startCity || '–'}. Das Ergebnis wird als neue Etappe ${from + 1} angehängt.`}</span>
            </div>
            {(pg.busy) && <SfProgress pct={pg.pct} label={pg.label} onCancel={() => { cancelRef.current = true; }} />}
            {st.err && <div role="alert" className="text-sm rounded-lg bg-amber-50 border border-amber-300 text-amber-950 p-3">{st.err}</div>}
            {st.items && st.items.length === 0 && <div className="text-sm rounded-lg bg-slate-50 border border-slate-200 p-3">Keine Orte gefunden. Weite den Abstandsbereich aus oder wähle eine andere Richtung.</div>}
            {st.items && st.items.length > 0 && (
              <div className="space-y-2">
                {st.estimated && <div className="text-xs text-amber-900">Routing-Dienst nicht erreichbar: Werte sind geschätzt (Luftlinie × 1,3).</div>}
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Orte filtern">
                  {FLT.map(([k, l, tip, fn]) => { const on = flt.includes(k); const n = st.items.filter(fn).length; const wait = enr.busy && !['big', 'mid', 'small'].includes(k); return <button key={k} type="button" data-readonly-allow data-flt={k} aria-pressed={on} title={tip} disabled={wait || (!on && n === 0)} onClick={() => setFlt(on ? flt.filter((x) => x !== k) : [...flt, k])} className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm font-semibold disabled:opacity-40 ${on ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300 text-slate-700'}`}>{l}<span className={`text-xs ${on ? 'text-[#D6E2F3]' : 'text-slate-400'}`}>{wait ? '…' : n}</span></button>; })}
                  {flt.length > 0 && <button type="button" data-readonly-allow onClick={() => setFlt([])} className="text-sm font-semibold text-[#1F4E8C] px-1">Zurücksetzen</button>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span data-sf-count>{shown.length} von {st.items.length} Orten</span>
                  <span className="inline-flex items-center gap-1.5">Sortierung:
                    {[['km', 'Nah → weit'], ['pop', 'Größte zuerst']].map(([k, l]) => <button key={k} type="button" data-readonly-allow aria-pressed={sortBy === k} onClick={() => setSortBy(k)} className={`h-8 px-2.5 rounded-lg border text-xs font-semibold ${sortBy === k ? 'bg-[#E8EEF7] border-[#BCCDE6] text-[#173B6B]' : 'bg-white border-slate-300 text-slate-600'}`}>{l}</button>)}
                  </span>
                </div>
                {enr.busy && <div className="text-xs text-slate-500">Zusatzinfos zu Strand, Natur, Freizeit und Sehenswürdigkeiten werden geladen …</div>}
                {!enr.busy && enr.fail > 0 && <div className="text-xs text-amber-900">Für {enr.fail} Orte konnten die Zusatzinfos nicht geladen werden (Filter gelten dann nicht für sie).</div>}
                {shown.length === 0 && <div className="text-sm rounded-lg bg-slate-50 border border-slate-200 p-3">Kein Ort passt zu allen Filtern. Nimm einen Filter heraus.</div>}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                  <div className="order-2 lg:order-1 min-w-0">
                    <ul className="space-y-2 p-0 m-0 lg:max-h-[540px] lg:overflow-y-auto lg:pr-1">
                      {shown.map((c) => <SfPlaceCard key={c.id || `${c.name}-${c.lat}`} c={c} e={E(c)} selected={(c.id || c.name) === selId} onSelect={() => setSelId(c.id || c.name)} onPick={(x) => onPick(from, x)} />)}
                    </ul>
                    <div className="mt-2 text-[11px] text-slate-400">Fotos: Wikimedia Commons / Wikipedia · Karte: © OpenStreetMap</div>
                  </div>
                  <div className="order-1 lg:order-2 min-w-0 lg:sticky lg:top-4">
                    <SfMap key={`${st.origin}`} origin={st.origin} items={shown} selId={selId} onSelect={asMapSelect(setSelId)} originName={startCity || 'Start'} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </details>
      );
    }

        /* ===== v29: Etappen-Assistent, Schritt 1: Zwischenstopps entlang der Route ===== */
    const SFW_KEY = 'roadtrip_wayassist_v1';
    const sfwGet = (k) => { try { const o = JSON.parse(localStorage.getItem(SFW_KEY) || '{}'); return o[k] && Date.now() - o[k].t < 30 * 864e5 ? o[k].v : null; } catch (e) { return null; } };
    const sfwPut = (k, v) => { try { const o = JSON.parse(localStorage.getItem(SFW_KEY) || '{}'); o[k] = { t: Date.now(), v }; const n = {}; Object.keys(o).sort((a, b) => o[b].t - o[a].t).slice(0, 12).forEach((x) => { n[x] = o[x]; }); localStorage.setItem(SFW_KEY, JSON.stringify(n)); } catch (e) {} };
    const SFW_KINDS = { stadt: 'Stadt', sehensw: 'Sehenswürdigkeit', natur: 'Natur & Aussicht', museum: 'Museum', freizeit: 'Freizeit', shopping: 'Shopping' };
    const sfwKind = (t) => t.place ? 'stadt' : /^(museum)$/.test(t.tourism || '') ? 'museum' : /^(zoo|theme_park|aquarium)$/.test(t.tourism || '') ? 'freizeit' : (t.natural || t.tourism === 'viewpoint') ? 'natur' : 'sehensw';
    function SfProgress({ pct, label, onCancel }) {
      return (
        <div role="status" aria-live="polite" data-sfw-progress className="rounded-xl border border-[#BCCDE6] bg-[#F5F8FC] p-3 space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-[#173B6B]">{label}</span><span className="font-bold text-[#1F4E8C] tabular-nums">{Math.round(pct)} %</span></div>
          <div className="h-2.5 rounded-full bg-[#D6E2F3] overflow-hidden"><div className="h-full bg-[#1F4E8C] transition-all duration-300" style={{ width: `${Math.min(100, pct)}%` }} /></div>
          {onCancel && <button type="button" data-readonly-allow onClick={onCancel} className="text-xs font-semibold text-slate-600 underline">Abbrechen</button>}
        </div>
      );
    }
    const sfwDistKm = (p, a, b) => { const k = Math.cos(p[0] * Math.PI / 180); const ax = (a[1] - p[1]) * k, ay = a[0] - p[0], bx = (b[1] - p[1]) * k, by = b[0] - p[0]; const dx = bx - ax, dy = by - ay; const l2 = dx * dx + dy * dy; let t = l2 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(ax + t * dx, ay + t * dy) * 111.2; };
    const sfwKindOf = (d) => { d = (d || '').toLowerCase();
      if (/county|landkreis|bezirk|district|bundesstaat|us-bundesstaat|state of|provinz|province|region|census|unincorporated|gemeindefrei|town in|township|village in|dorf in|ort in/.test(d) && !/state park|nationalpark/.test(d)) return /(city|stadt)/.test(d) ? 'stadt' : null;
      if (/shopping|einkauf|\bmall\b|outlet|kaufhaus|warenhaus|department store|bazaar|basar|galleria|markthalle|marketplace|wochenmarkt|flea market|flohmarkt/.test(d)) return 'shopping';
      if (/museum|galerie|gallery/.test(d)) return 'museum';
      if (/zoo|aquarium|theme park|amusement|freizeitpark|vergnügungspark|wasserpark|water park|casino/.test(d)) return 'freizeit';
      if (/park|strand|beach|insel|island|bucht|bay|lake|see |wasserfall|waterfall|mountain|berg|canyon|aussicht|viewpoint|cave|höhle|nature|natur|reserve|sumpf|swamp|everglades|key |riff|reef|spring|quelle|forest|wald|river|fluss/.test(d)) return 'natur';
      if (/city|stadt|großstadt|hauptstadt|municipality|gemeinde/.test(d)) return 'stadt';
      return 'sehensw'; };
    async function sfwRun(A, B, setP, cancelled) {
      const chk = () => { if (cancelled()) throw new Error('__cancel'); };
      setP(6, 'Route wird geladen …');
      const rj = await fetchJsonT(`https://router.project-osrm.org/route/v1/driving/${A[1]},${A[0]};${B[1]},${B[0]}?overview=simplified&geometries=geojson`, 20000);
      const r0 = rj.routes && rj.routes[0]; if (!r0) throw new Error('Keine Route gefunden');
      const line = r0.geometry.coordinates.map(([x, y]) => [y, x]); const totalKm = r0.distance / 1000, totalMin = r0.duration / 60; chk();
      // Strecke in Abschnitte teilen, je Abschnitt eine Wikidata-Abfrage im Rechteck
      const nSeg = Math.min(8, Math.max(1, Math.ceil(totalKm / 50)));
      const cum = [0]; for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + haversineM(line[i - 1], line[i]));
      const segs = []; for (let s2 = 0; s2 < nSeg; s2++) { const lo = cum[cum.length - 1] * s2 / nSeg, hi = cum[cum.length - 1] * (s2 + 1) / nSeg; let pts = line.filter((_, i) => cum[i] >= lo && cum[i] <= hi); if (pts.length < 1) pts = [line[Math.min(line.length - 1, Math.max(0, cum.findIndex((c) => c >= lo)))]]; segs.push(pts); }
      setP(14, `Orte entlang der Strecke (0 von ${nSeg}) …`); let done = 0, failed = 0, lastErr = ''; const found = new Map();
      const pad = 0.12;
      const one = async (pts) => {
        const S = Math.min(...pts.map((p) => p[0])) - pad, N = Math.max(...pts.map((p) => p[0])) + pad, W = Math.min(...pts.map((p) => p[1])) - pad, Ea = Math.max(...pts.map((p) => p[1])) + pad;
        const q = `SELECT ?item ?itemLabel ?loc ?sl ?img ?d ?shop ?tour WHERE { SERVICE wikibase:box { ?item wdt:P625 ?loc . bd:serviceParam wikibase:cornerSouthWest "Point(${W.toFixed(4)} ${S.toFixed(4)})"^^geo:wktLiteral . bd:serviceParam wikibase:cornerNorthEast "Point(${Ea.toFixed(4)} ${N.toFixed(4)})"^^geo:wktLiteral . } ?item wikibase:sitelinks ?sl . BIND(EXISTS { VALUES ?shopT { wd:Q31374404 wd:Q11315 wd:Q216107 wd:Q330284 wd:Q1127689 } ?item wdt:P31 ?shopT } AS ?shop) ${RT_TOURQ} FILTER(?sl >= 12 || ?shop) OPTIONAL { ?item wdt:P18 ?img } OPTIONAL { ?item schema:description ?d . FILTER(lang(?d) IN ("de","en")) } SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } } ORDER BY DESC(?sl) LIMIT 300`;
        let j; for (let tr = 0; tr < 2 && !j; tr++) { try { j = await fetchJsonT(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(tr === 0 ? q : rtNoTour(q))}`, 30000); } catch (e) { lastErr = e.message; if (tr === 0) await new Promise((r) => setTimeout(r, 1500)); } }
        if (!j) failed++; else ((j.results && j.results.bindings) || []).forEach((r) => {
          const mm = /Point\(([-\d.eE]+) ([-\d.eE]+)\)/.exec(r.loc && r.loc.value); if (!mm) return; const id = r.item.value.split('/').pop(); const name = r.itemLabel && r.itemLabel.value; if (!name || /^Q\d+$/.test(name)) return;
          const prev = found.get(id) || {}; const d = (r.d && r.d.value) || prev.d || '';
          found.set(id, { id, name, tour: prev.tour || (r.tour && r.tour.value === 'true'), hasFlag: !!r.tour || prev.hasFlag, shop: prev.shop || (r.shop && r.shop.value === 'true'), lat: Number(mm[2]), lon: Number(mm[1]), sl: Number(r.sl.value) || 0, img: (r.img && r.img.value ? r.img.value.replace(/^http:/, 'https:') + '?width=360' : '') || prev.img || '', d });
        });
        done++; setP(14 + 60 * done / nSeg, `Orte entlang der Strecke (${done} von ${nSeg}) …`);
      };
      const queue = segs.slice(); await Promise.all([0, 1, 2].map(async () => { while (queue.length) { await one(queue.shift()); chk(); } })); chk();
      if (failed === nSeg) throw new Error(`Wikidata nicht erreichbar (${lastErr || 'keine Antwort'})`);
      // nur Orte nahe an der Strecke, sinnvolle Arten
      setP(76, 'Treffer werden geprüft …');
      let cand = [...found.values()].map((c) => ({ ...c, sl: c.sl + (c.tour ? 40 : 0), kind: c.shop ? 'shopping' : (c.tour && (!sfwKindOf(c.d) || sfwKindOf(c.d) === 'stadt') ? 'sehensw' : sfwKindOf(c.d)), off: Math.min(...line.slice(1).map((p, i) => sfwDistKm([c.lat, c.lon], line[i], p))) })).filter((c) => c.kind && !(c.hasFlag && !c.tour && !c.shop && c.sl < 35) && c.off <= (c.kind === 'stadt' ? 12 : 8) && haversineM(A, [c.lat, c.lon]) > 3000 && haversineM(B, [c.lat, c.lon]) > 3000);
      cand.sort((a, b) => b.sl - a.sl); cand = cand.slice(0, 60); chk();
      if (!cand.length) return { line, totalKm, totalMin, items: [], failed };
      setP(82, 'Umwege werden berechnet …');
      try {
        const coords = [A, B, ...cand.map((c) => [c.lat, c.lon])].map((p) => `${p[1]},${p[0]}`).join(';');
        const t = await fetchJsonT(`https://router.project-osrm.org/table/v1/driving/${coords}?sources=0;1&annotations=duration,distance`, 25000);
        const ab = t.durations[0][1] / 60;
        cand.forEach((c, i) => { const a1 = t.durations[0][i + 2] / 60, b1 = t.durations[1][i + 2] / 60; c.detour = Math.max(0, Math.round(a1 + b1 - ab)); c.fromStartKm = t.distances[0][i + 2] / 1000; c.snap = t.destinations && t.destinations[i + 2] ? t.destinations[i + 2].distance : 0; });
        cand = cand.filter((c) => !(c.snap > 2500));
      } catch (e) {
        const ab = haversineM(A, B) / 1000;
        cand.forEach((c) => { const a1 = haversineM(A, [c.lat, c.lon]) / 1000, b1 = haversineM([c.lat, c.lon], B) / 1000; c.detour = Math.round(Math.max(0, a1 + b1 - ab) * 1.3 / 80 * 60); c.fromStartKm = a1 * 1.2; c.est = true; });
      }
      setP(97, 'Ergebnisse werden aufbereitet …');
      return { line, totalKm, totalMin, items: cand, failed };
    }
    function SfwMap({ A, B, line, items, selId, onSelect }) {
      const el = useRef(null), mapRef = useRef(null), grp = useRef(null), viaRef = useRef(null);
      const sel = items.find((x) => x.id === selId) || null;
      useEffect(() => {
        if (!window.L || !el.current) return; const L = window.L;
        const map = L.map(el.current, { scrollWheelZoom: true }).setView(A, 8);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap-Mitwirkende' }).addTo(map);
        const pl = L.polyline(line, { color: '#8FA9CF', weight: 5, opacity: 0.9 }).addTo(map); map.fitBounds(pl.getBounds(), { padding: [30, 30] });
        mapRef.current = map; grp.current = L.layerGroup().addTo(map);
        const t = setTimeout(() => map.invalidateSize(), 200); const onR = () => map.invalidateSize(); window.addEventListener('resize', onR);
        return () => { clearTimeout(t); window.removeEventListener('resize', onR); map.remove(); mapRef.current = null; };
      }, []);
      useEffect(() => {
        const L = window.L, map = mapRef.current; if (!L || !map) return; grp.current.clearLayers();
        [[A, 'Start'], [B, 'Ziel']].forEach(([p, n]) => L.circleMarker(p, { radius: 9, color: '#173B6B', weight: 3, fillColor: '#fff', fillOpacity: 1 }).bindTooltip(n).addTo(grp.current));
        items.forEach((c) => { const on = c.id === selId; L.circleMarker([c.lat, c.lon], { radius: on ? 10 : 6, color: '#1F4E8C', weight: on ? 3 : 2, fillColor: on ? '#1F4E8C' : '#fff', fillOpacity: 1 }).bindTooltip(`${c.name} (+${c.detour} min)`).on('click', () => onSelect(c.id)).addTo(grp.current); });
      }, [items, selId]);
      useEffect(() => {
        const L = window.L, map = mapRef.current; if (!L || !map) return; let on = true;
        if (viaRef.current) { map.removeLayer(viaRef.current); viaRef.current = null; } if (!sel) return;
        const key = `via|${A}|${sel.lat},${sel.lon}|${B}`;
        const draw = (pts, dashed) => { if (!on) return; viaRef.current = L.polyline(pts, { color: '#1F4E8C', weight: 5, opacity: 1, dashArray: dashed ? '8 8' : null }).addTo(map); };
        if (sfRouteCache[key]) { draw(sfRouteCache[key]); return () => { on = false; }; }
        fetchJsonT(`https://router.project-osrm.org/route/v1/driving/${A[1]},${A[0]};${sel.lon},${sel.lat};${B[1]},${B[0]}?overview=simplified&geometries=geojson`, 15000)
          .then((j) => { const g = j.routes && j.routes[0] && j.routes[0].geometry.coordinates; if (!g) throw new Error('x'); const pts = g.map(([x, y]) => [y, x]); sfRouteCache[key] = pts; draw(pts); })
          .catch(() => draw([A, [sel.lat, sel.lon], B], true));
        return () => { on = false; };
      }, [selId]);
      return <div className="rounded-xl overflow-hidden border border-slate-200 bg-white"><div ref={el} data-sfw-map className="w-full h-[280px] lg:h-[480px] bg-slate-100" role="img" aria-label="Karte mit Route und Zwischenstopps" /><div className="px-3 py-2 text-xs text-slate-600 border-t border-slate-100">{sel ? <><b className="text-slate-900">{sel.name}</b> · +{sel.detour} min Umweg · {Math.round(sel.fromStartKm)} km ab Start</> : 'Ort wählen, um die Fahrt über den Stopp zu sehen'}</div></div>;
    }
    const sfwTextCache = {};
    async function sfwLongText(c) {
      if (sfwTextCache[c.id] !== undefined) return sfwTextCache[c.id];
      const tries = [];
      try { const w = await fetchJsonT(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${c.id}&props=sitelinks&sitefilter=dewiki|enwiki&format=json&origin=*`, 9000); const sl = (w.entities && w.entities[c.id] && w.entities[c.id].sitelinks) || {}; if (sl.dewiki) tries.push(['de', sl.dewiki.title]); if (sl.enwiki) tries.push(['en', sl.enwiki.title]); } catch (e) {}
      tries.push(['de', c.name], ['en', c.name]);
      let out = { text: '', url: '' };
      for (const [lang, title] of tries) {
        try { const j = await fetchJsonT(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}?redirect=true`, 9000);
          if (j && j.type !== 'disambiguation' && j.extract && j.extract.length > 60) { let t = j.extract; if (t.length > 900) { const cut = t.slice(0, 900); const k = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! ')); t = k > 300 ? cut.slice(0, k + 1) : cut + ' …'; } out = { text: t, url: (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) || '' }; break; } } catch (e) {}
      }
      sfwTextCache[c.id] = out; return out;
    }
    function asRevealCard(el, fromMap) {
      if (!el) return; let a = el.parentElement; while (a && !(a.scrollHeight > a.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(a).overflowY))) a = a.parentElement;
      if (a && a !== document.body && a !== document.documentElement) { const r = el.getBoundingClientRect(), ar = a.getBoundingClientRect(); a.scrollTo({ top: a.scrollTop + (r.top - ar.top) - (ar.height - r.height) / 2, behavior: 'smooth' }); }
      else if (fromMap) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    const asMapSelect = (fn) => (id) => { window.__asMapClick = true; fn(id); };
    function SfwCard({ c, selected, onSelect, onPick, meta, pickLabel }) {
      const [done, setDone] = useState(false); const liRef = useRef(null); const mounted = useRef(false);
      useEffect(() => { if (selected && mounted.current) { asRevealCard(liRef.current, window.__asMapClick); } mounted.current = true; window.__asMapClick = false; }, [selected]);
      const [info, setInfo] = useState(c.img ? { img: c.img, desc: '' } : (sfInfoCache[c.id] || null)); const [bad, setBad] = useState(false); const [more, setMore] = useState(false); const [lt, setLt] = useState(sfwTextCache[c.id] || null);
      const toggleMore = (e) => { e.stopPropagation(); const n = !more; setMore(n); if (n && !lt) { setLt({ loading: true }); sfwLongText(c).then(setLt); } };
      useEffect(() => { let on = true; if (!info || (!info.img && !info.desc)) sfWikiInfo({ id: c.id, name: c.name, wp: c.wp }).then((i) => on && setInfo({ img: c.img || i.img, desc: i.desc })); return () => { on = false; }; }, [c.id]);
      const photo = !bad && (c.img || (info && info.img));
      return (
        <li ref={liRef} data-sfw-card aria-current={selected ? 'true' : undefined} onClick={onSelect} className={`list-none flex gap-3 rounded-xl border bg-white p-2.5 cursor-pointer transition ${selected ? 'border-[#1F4E8C] ring-2 ring-[#BCCDE6]' : 'border-slate-200 hover:border-slate-300'}`}>
          <div className="shrink-0 w-28 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-[#D6E2F3] to-[#BCCDE6] flex items-center justify-center text-3xl font-bold text-[#1F4E8C]">{photo ? <img src={photo} alt={`Foto ${c.name}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} className="w-full h-full object-cover" /> : <span aria-hidden="true">{(c.name || '?').charAt(0)}</span>}</div>
          <div className="min-w-0 flex-1 flex flex-col">
            <div className="font-bold text-slate-900 leading-tight break-words">{c.name}</div>
            <div className="text-xs text-slate-600 mt-0.5">{meta || <>{Math.round(c.fromStartKm)} km ab Start · <b>+{c.detour} min Umweg</b>{c.est ? ' (geschätzt)' : ''}</>}</div>
            <div className="flex flex-wrap gap-1 mt-0.5"><span className="text-[11px] px-1.5 rounded bg-[#E8EEF7] text-[#173B6B]">{SFW_KINDS[c.kind]}</span></div>
            {info && info.desc && <div className="text-xs text-slate-500 line-clamp-2">{info.desc}</div>}
            {more && <div data-sfw-long className="text-xs text-slate-700 mt-1 leading-relaxed">{lt && lt.loading ? 'Beschreibung wird geladen …' : (lt && lt.text) ? <>{lt.text}{lt.url && <> <a href={lt.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="underline text-[#1F4E8C]">Wikipedia</a></>}</> : 'Keine ausführlichere Beschreibung gefunden.'}</div>}
            <button type="button" data-readonly-allow data-sfw-more onClick={toggleMore} className="self-start text-xs underline text-[#1F4E8C] mt-0.5">{more ? 'Weniger anzeigen' : 'Mehr anzeigen'}</button>
            <div className="mt-auto pt-1.5 flex gap-2"><button type="button" data-readonly-allow onClick={(e) => { e.stopPropagation(); setDone(true); onPick(c); }} disabled={done} className="v18-btn pri sm disabled:opacity-60">{done ? '✓ Übernommen' : (pickLabel || 'Als Stopp übernehmen')}</button><a data-readonly-allow href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="v18-btn sm">Maps</a></div>
          </div>
        </li>
      );
    }
    function StageWayPanel({ trip, stage, index, onAddStop }) {
      const [p, setPr] = useState({ pct: 0, label: '', busy: false });
      const [res, setRes] = useState(null); const [err, setErr] = useState('');
      const [kinds, setKinds] = useState([]); const [maxD, setMaxD] = useState(30); const [sortBy, setSortBy] = useState('route'); const [selId, setSelId] = useState(null);
      const [lim, setLim] = useState(10); const cancelRef = useRef(false);
      const prev = (trip.stages || [])[index - 1];
      const run = async (force) => {
        cancelRef.current = false; setErr(''); setRes(null); setPr({ pct: 1, label: 'Start …', busy: true });
        const setP = (pct, label) => setPr({ pct, label, busy: true });
        try {
          setP(3, 'Start und Ziel werden bestimmt …');
          let A = parseGps(prev && prev.hotel && prev.hotel.gps); if (!A) { const nm = (prev && prev.toCity) || stage.fromCity; if (nm) A = await sfGeocode(nm); }
          let B = parseGps(stage.hotel && stage.hotel.gps); if (!B && stage.toCity) B = await sfGeocode(stage.toCity);
          if (!A || !B) throw new Error('Start oder Ziel nicht gefunden. Bitte Ortsnamen prüfen oder GPS beim Hotel eintragen.');
          const key = `w2|${A.map((x) => x.toFixed(3))}|${B.map((x) => x.toFixed(3))}`;
          const cached = force === true ? null : sfwGet(key);
          if (cached) { setP(100, 'Aus dem Zwischenspeicher geladen'); cached.A = A; cached.B = B; setRes(cached); setSelId(cached.items[0] ? cached.items[0].id : null); setPr({ pct: 100, label: 'Fertig (aus Zwischenspeicher)', busy: false }); return; }
          const r = await sfwRun(A, B, setP, () => cancelRef.current);
          r.A = A; r.B = B; if (r.items.length && !r.failed) sfwPut(key, r); setRes(r); setSelId(r.items[0] ? r.items[0].id : null); setPr({ pct: 100, label: 'Fertig', busy: false });
        } catch (e) { if (e.message === '__cancel') setPr({ pct: 0, label: 'Abgebrochen', busy: false }); else { setErr(/nicht gefunden|Keine Route/.test(e.message) ? e.message : `Suche fehlgeschlagen (${String(e.message).slice(0, 200)}). Internet nötig.`); setPr({ pct: 0, label: '', busy: false }); } }
      };
      const shown = useMemo(() => { if (!res) return []; const b = res.items.filter((c) => c.detour <= maxD && (!kinds.length || kinds.includes(c.kind))); return [...b].sort(sortBy === 'route' ? (x, y) => x.fromStartKm - y.fromStartKm : (x, y) => x.detour - y.detour); }, [res, kinds, maxD, sortBy]);
      useEffect(() => { if (shown.length && !shown.some((c) => c.id === selId)) setSelId(shown[0].id); setLim(10); }, [shown]);
      const vis = shown.slice(0, lim);
      const counts = {}; (res ? res.items : []).forEach((c) => { counts[c.kind] = (counts[c.kind] || 0) + 1; });
      return (
        <div data-sfw className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><div className="font-bold text-slate-900">Ziele auf dem Weg: {(prev && prev.toCity) || stage.fromCity || '?'} → {stage.toCity || '?'}</div><div className="text-xs text-slate-500">Bekannte Orte entlang der Strecke (Wikidata), mit Umweg in Minuten</div></div>
            <button type="button" data-readonly-allow onClick={() => run(!!res)} disabled={p.busy} className="v18-btn pri disabled:opacity-50">{p.busy ? 'Suche läuft …' : res ? 'Neu suchen' : 'Ziele suchen'}</button>
          </div>
          <RtNameSearch mode="way" getAB={async () => { let A = parseGps(prev && prev.hotel && prev.hotel.gps); if (!A) { const nm = (prev && prev.toCity) || stage.fromCity; if (nm) A = await sfGeocode(nm); } let B = parseGps(stage.hotel && stage.hotel.gps); if (!B && stage.toCity) B = await sfGeocode(stage.toCity); return [A, B]; }} pick={async (x) => { let t = null; try { t = await sfwLongText(x); } catch (e) {} onAddStop(stage.id, x, t); }} />
          {(p.busy || (p.pct > 0 && p.pct < 100)) && <SfProgress pct={p.pct} label={p.label} onCancel={p.busy ? () => { cancelRef.current = true; } : null} />}
          {err && <div role="alert" className="text-sm rounded-lg bg-amber-50 border border-amber-300 text-amber-950 p-3">{err}</div>}
          {res && res.items.length === 0 && <div className="text-sm rounded-lg bg-slate-50 border border-slate-200 p-3">Auf dieser Strecke wurden keine bekannten Ziele gefunden{res.failed ? ` (bei ${res.failed} Abschnitt(en) kam keine Antwort – bitte „Neu suchen“)` : ''}.</div>}
          {res && res.items.length > 0 && res.failed > 0 && <div className="text-xs text-amber-900">Für {res.failed} Streckenabschnitt(e) kam keine Antwort, die Liste kann unvollständig sein. „Neu suchen“ versucht es erneut.</div>}
          {res && res.items.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">{Math.round(res.totalKm)} km · {sfFmtH(res.totalMin)} Fahrzeit direkt{p.label.includes('Zwischenspeicher') ? ' · gespeichertes Ergebnis' : ''}</div>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Arten filtern">
                {Object.keys(SFW_KINDS).map((k) => { const on = kinds.includes(k); return <button key={k} type="button" data-readonly-allow data-sfw-kind={k} aria-pressed={on} disabled={!on && !counts[k]} onClick={() => setKinds(on ? kinds.filter((x) => x !== k) : [...kinds, k])} className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm font-semibold disabled:opacity-40 ${on ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300 text-slate-700'}`}>{SFW_KINDS[k]}<span className={`text-xs ${on ? 'text-[#D6E2F3]' : 'text-slate-400'}`}>{counts[k] || 0}</span></button>; })}
                {kinds.length > 0 && <button type="button" data-readonly-allow onClick={() => setKinds([])} className="text-sm font-semibold text-[#1F4E8C] px-1">Zurücksetzen</button>}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <label className="flex items-center gap-3 font-semibold min-w-[240px]">Umweg höchstens <b data-sfw-maxd className="text-[#1F4E8C] w-14">{maxD} min</b><input data-readonly-allow type="range" min="0" max="90" step="5" value={maxD} onChange={(e) => setMaxD(Number(e.target.value))} aria-label="Maximaler Umweg in Minuten" className="flex-1 accent-[#1F4E8C]" /></label>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">Sortierung:{[['route', 'In Fahrtreihenfolge'], ['detour', 'Kleinster Umweg']].map(([k, l]) => <button key={k} type="button" data-readonly-allow aria-pressed={sortBy === k} onClick={() => setSortBy(k)} className={`h-8 px-2.5 rounded-lg border text-xs font-semibold ${sortBy === k ? 'bg-[#E8EEF7] border-[#BCCDE6] text-[#173B6B]' : 'bg-white border-slate-300 text-slate-600'}`}>{l}</button>)}</span>
                <span data-sfw-count className="text-xs text-slate-500">{vis.length} von {shown.length} passenden Zielen</span>
              </div>
              {shown.length === 0 && <div className="text-sm rounded-lg bg-slate-50 border border-slate-200 p-3">Nichts passt zu den Filtern. Erhöhe den Umweg oder nimm einen Filter heraus.</div>}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="order-2 lg:order-1 min-w-0"><ul className="space-y-2 p-0 m-0 lg:max-h-[480px] lg:overflow-y-auto lg:pr-1">{vis.map((c) => <SfwCard key={c.id} c={c} selected={c.id === selId} onSelect={() => setSelId(c.id)} onPick={async (x) => { let t = null; try { t = await sfwLongText(x); } catch (e) {} onAddStop(stage.id, x, t); }} />)}</ul>{shown.length > vis.length && <button type="button" data-readonly-allow data-sfw-morebtn onClick={() => setLim(lim + 10)} className="mt-2 v18-btn w-full">Mehr anzeigen ({shown.length - vis.length} weitere)</button>}<div className="mt-2 text-[11px] text-slate-400">Fotos: Wikimedia Commons / Wikipedia · Karte: © OpenStreetMap</div></div>
                <div className="order-1 lg:order-2 min-w-0 lg:sticky lg:top-4"><SfwMap key={`${res.A}|${res.B}`} A={res.A} B={res.B} line={res.line} items={vis} selId={selId} onSelect={asMapSelect(setSelId)} /></div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ---------- v32: Etappen-Assistent ② Hotel und ③ Vor Ort ----------
    const AS_NOTES_KEY = 'roadtrip_hotelnotes_v1';
    const asNotesGet = () => { try { return JSON.parse(localStorage.getItem(AS_NOTES_KEY) || '{}'); } catch (e) { return {}; } };
    const asNotesPut = (o) => { try { localStorage.setItem(AS_NOTES_KEY, JSON.stringify(o)); } catch (e) {} };
    const asDates = (stage) => {
      const m = /(\d{1,2})\.(\d{1,2})\.(?:(\d{4}))?\s*[–-]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(stage.dateRange || ''); if (!m) return null;
      const y2 = +m[6]; const y1 = m[3] ? +m[3] : (+m[2] > +m[5] ? y2 - 1 : y2); const f = (y, mo, d) => `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return { ci: f(y1, +m[2], +m[1]), co: f(y2, +m[5], +m[4]) };
    };
    const asBadWord = /schauspiel|sänger|singer|actor|actress|politik|musiker|musician|autor\b|writer|athlet|fußball|footballer|\bborn\b|gattung|genus|species|album|film\b|song\b|fernseh|television|schiff|ship\b|unternehmen|company|wikimedia|begriffsklärung|disambiguation|ehemalig|former|bahnhof|station\b|airport|flughafen|schule|school|university|universität|krankenhaus|hospital|kirchengemeinde|bank\b/;
    async function asCenter(stage) {
      let P = parseGps(stage.hotel && stage.hotel.gps); if (P) return P; if (stage.toCity) P = await sfGeocode(stage.toCity); return P;
    }
    function asProgressTicker(setP, from, to, label) {
      let v = from; setP(v, label); const t = setInterval(() => { v = Math.min(to, v + 3); setP(v, label); }, 700); return () => clearInterval(t);
    }
    function AsMap({ P, items, selId, onSelect, nameOf }) {
      const el = useRef(null), mapRef = useRef(null), grp = useRef(null);
      useEffect(() => {
        if (!window.L || !el.current) return; const L = window.L;
        const map = L.map(el.current, { scrollWheelZoom: true }).setView(P, 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap-Mitwirkende' }).addTo(map);
        mapRef.current = map; grp.current = L.layerGroup().addTo(map);
        const t = setTimeout(() => map.invalidateSize(), 200); const onR = () => map.invalidateSize(); window.addEventListener('resize', onR);
        return () => { clearTimeout(t); window.removeEventListener('resize', onR); map.remove(); mapRef.current = null; };
      }, []);
      useEffect(() => {
        const L = window.L, map = mapRef.current; if (!L || !map) return; grp.current.clearLayers();
        L.circleMarker(P, { radius: 9, color: '#173B6B', weight: 3, fillColor: '#fff', fillOpacity: 1 }).bindTooltip('Etappenziel').addTo(grp.current);
        items.forEach((c) => { const on = c.id === selId; L.circleMarker([c.lat, c.lon], { radius: on ? 10 : 6, color: '#1F4E8C', weight: on ? 3 : 2, fillColor: on ? '#1F4E8C' : '#fff', fillOpacity: 1 }).bindTooltip(nameOf(c)).on('click', () => onSelect(c.id)).addTo(grp.current); });
        const pts = [P, ...items.map((c) => [c.lat, c.lon])]; if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30], maxZoom: 15 });
      }, [items]);
      useEffect(() => { const map = mapRef.current, c = items.find((x) => x.id === selId); if (map && c) map.panTo([c.lat, c.lon]); }, [selId]);
      return <div className="rounded-xl overflow-hidden border border-slate-200"><div ref={el} style={{ height: 420 }} className="w-full bg-slate-100" /><div className="text-[11px] text-slate-500 px-2 py-1 bg-white">Kreis = Etappenziel, Punkte = Vorschläge (anklicken)</div></div>;
    }
    // ---- ② Hotel ----
    const AS_HTYPES = { hotel: 'Hotel', motel: 'Motel', guest_house: 'Pension / B&B', hostel: 'Hostel', apartment: 'Apartment' };
    const AS_OVP = [...new Set([...(typeof OVERPASS !== 'undefined' ? OVERPASS : []), 'https://overpass.openstreetmap.fr/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'])];
    const asNomHotels = async (P, d) => {
      const vb = `${P[1] - d},${P[0] + d},${P[1] + d},${P[0] - d}`; const out = [];
      for (const term of ['hotel', 'motel', 'guest house']) {
        try { const j = await fetchJsonT(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=40&extratags=1&addressdetails=1&bounded=1&viewbox=${vb}&q=${encodeURIComponent(term)}`, 15000); (j || []).forEach((x) => out.push(x)); } catch (e) {}
        await new Promise((r) => setTimeout(r, 1100));
      }
      return out;
    };
    async function asHotelRun(P, setP, cancelled) {
      setP(5, 'Unterkünfte werden gesucht …');
      const mk = (R, types) => `[out:json][timeout:20];(${types.map((k) => `nwr["tourism"="${k}"](around:${R},${P[0]},${P[1]});`).join('')});out center tags 400;`;
      const attempts = [[30000, ['hotel', 'motel', 'guest_house', 'hostel']], [15000, ['hotel', 'motel', 'guest_house']], [6000, ['hotel', 'motel', 'guest_house']]];
      let j = null, lastErr = '';
      for (let i = 0; i < attempts.length && !j; i++) {
        const stop = asProgressTicker(setP, i ? 45 : 10, i ? 60 : 40, i ? `Weiterer Versuch mit ${attempts[i][0] / 1000} km Umkreis …` : 'Unterkünfte im Umkreis von 30 km werden geladen …');
        try { j = await Promise.any(AS_OVP.map((u) => fetchJsonT(`${u}?data=${encodeURIComponent(mk(...attempts[i]))}`, 22000))); } catch (e) { lastErr = (e.errors || [e]).map((x) => x && x.message).filter(Boolean).join(' | '); } finally { stop(); }
        if (cancelled()) throw new Error('__cancel');
      }
      let elements = j ? (j.elements || []) : [];
      if (!j) {
        const stop = asProgressTicker(setP, 62, 88, 'Alternative Quelle (Nominatim) wird abgefragt …'); let nom = [];
        try { nom = await asNomHotels(P, 0.27); } finally { stop(); }
        if (cancelled()) throw new Error('__cancel');
        if (!nom.length) throw new Error('Overpass: ' + (lastErr || 'keine Antwort') + ' · Nominatim ohne Ergebnis');
        elements = nom.map((x) => ({ type: x.osm_type || 'n', id: x.osm_id, lat: Number(x.lat), lon: Number(x.lon), tags: { name: x.name || (x.display_name || '').split(',')[0], tourism: AS_HTYPES[x.type] ? x.type : (x.type === 'guest_house' ? 'guest_house' : 'hotel'), ...(x.extratags || {}), 'addr:street': x.address && x.address.road, 'addr:housenumber': x.address && x.address.house_number, 'addr:postcode': x.address && x.address.postcode, 'addr:city': x.address && (x.address.city || x.address.town || x.address.village) } }));
      }
      setP(92, 'Ergebnisse werden aufbereitet …');
      const seen = new Set(); const items = [];
      elements.forEach((e) => {
        const t = e.tags || {}; const lat = e.lat != null ? e.lat : e.center && e.center.lat, lon = e.lon != null ? e.lon : e.center && e.center.lon;
        if (!t.name || lat == null || !AS_HTYPES[t.tourism]) return; const key = t.name + '|' + lat.toFixed(3) + lon.toFixed(3); if (seen.has(key)) return; seen.add(key);
        const st = parseFloat(String(t.stars || '').replace(',', '.')); const addr = [[t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' '), [t['addr:postcode'], t['addr:city']].filter(Boolean).join(' ')].filter(Boolean).join(', ');
        items.push({ id: 'h' + e.type + e.id, name: t.name, type: t.tourism, stars: isFinite(st) ? Math.min(5, Math.round(st)) : 0, web: t.website || t['contact:website'] || '', phone: t.phone || t['contact:phone'] || '', addr, wifi: ['wlan', 'yes', 'wifi'].includes(String(t.internet_access || '').toLowerCase()), lat, lon, dist: haversineM(P, [lat, lon]) / 1000 });
      });
      return { items, via: j ? 'overpass' : 'nominatim' };
    }
    function AsHotelCard({ c, selected, onSelect, note, setNote, links, onPick }) {
      const liRef = useRef(null); const mounted = useRef(false);
      useEffect(() => { if (selected && mounted.current) { asRevealCard(liRef.current, window.__asMapClick); } mounted.current = true; window.__asMapClick = false; }, [selected]);
      return (
        <li ref={liRef} data-as-hotel aria-current={selected ? 'true' : undefined} onClick={onSelect} className={`list-none rounded-xl border bg-white p-3 cursor-pointer transition space-y-1.5 ${selected ? 'border-[#1F4E8C] ring-2 ring-[#BCCDE6]' : 'border-slate-200 hover:border-slate-300'}`}>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 leading-tight break-words">{c.name}</div>
              <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 items-center"><span className="px-1.5 rounded bg-[#E8EEF7] text-[#173B6B] text-[11px]">{AS_HTYPES[c.type]}</span>{c.stars > 0 && <span aria-label={`${c.stars} Sterne`}>{'★'.repeat(c.stars)}</span>}<span>{c.dist.toFixed(1).replace('.', ',')} km vom Zentrum</span>{c.wifi && <span>WLAN</span>}</div>
              {c.addr && <div className="text-xs text-slate-500">{c.addr}</div>}
            </div>
            <button type="button" data-readonly-allow data-as-fav aria-pressed={!!note.fav} title="Auf die Merkliste" onClick={(e) => { e.stopPropagation(); setNote({ fav: !note.fav }); }} className={`shrink-0 h-9 w-9 rounded-full border text-lg ${note.fav ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300 text-slate-500'}`}>{note.fav ? '★' : '☆'}</button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
            <label className="flex items-center gap-1">Preis/Nacht €<input data-readonly-allow data-as-price type="number" min="0" inputMode="decimal" value={note.price || ''} onChange={(e) => setNote({ price: e.target.value })} className="w-20 h-8 px-2 rounded border border-slate-300" /></label>
            <label className="flex items-center gap-1">Bewertung<input data-readonly-allow data-as-rating type="text" inputMode="decimal" placeholder="z. B. 8,4" value={note.rating || ''} onChange={(e) => setNote({ rating: e.target.value })} className="w-16 h-8 px-2 rounded border border-slate-300" /></label>
          </div>
          <div className="flex flex-wrap gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
            <button type="button" data-readonly-allow data-as-pick onClick={() => onPick(c)} className="v18-btn pri sm">Als Hotel übernehmen</button>
            <a data-readonly-allow href={links.booking} target="_blank" rel="noopener noreferrer" className="v18-btn sm">Booking</a>
            <a data-readonly-allow href={links.google} target="_blank" rel="noopener noreferrer" className="v18-btn sm">Google</a>
            {c.web && <a data-readonly-allow href={/^https?:/.test(c.web) ? c.web : 'https://' + c.web} target="_blank" rel="noopener noreferrer" className="v18-btn sm">Website</a>}
          </div>
        </li>
      );
    }
    function StageHotelPanel({ trip, stage, index, onSetHotel }) {
      const [p, setPr] = useState({ pct: 0, label: '', busy: false }); const [res, setRes] = useState(null); const [err, setErr] = useState(''); const [P, setPt] = useState(null);
      const [types, setTypes] = useState([]); const [minStars, setMinStars] = useState(0); const [maxKm, setMaxKm] = useState(4); const [onlyFav, setOnlyFav] = useState(false); const [wifi, setWifi] = useState(false); const [sortBy, setSortBy] = useState('dist'); const [selId, setSelId] = useState(null);
      const [notes, setNotes] = useState(asNotesGet); const cancelRef = useRef(false);
      const nk = (c) => `${stage.id}|${c.id}`; const getN = (c) => notes[nk(c)] || {}; const setN = (c, patch) => setNotes((o) => { const n = { ...o, [nk(c)]: { ...(o[nk(c)] || {}), ...patch } }; asNotesPut(n); return n; });
      const city = stage.toCity || ''; const dates = asDates(stage); const guests = Math.max(1, (trip.participants || []).length || 2);
      const linksOf = (c) => ({ booking: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(c.name + ', ' + city)}${dates ? `&checkin=${dates.ci}&checkout=${dates.co}` : ''}&group_adults=${guests}&no_rooms=1&lang=de`, google: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name + ' ' + city)}` });
      const run = async (force) => {
        cancelRef.current = false; setErr(''); setRes(null); setPr({ pct: 1, label: 'Start …', busy: true }); const setP = (pct, label) => setPr({ pct, label, busy: true });
        try {
          setP(3, 'Ort wird bestimmt …'); const C = await asCenter(stage); if (!C) throw new Error('Ort nicht gefunden. Bitte Zielort prüfen oder GPS beim Hotel eintragen.'); setPt(C);
          const key = `hotels30|${C[0].toFixed(3)}|${C[1].toFixed(3)}`; const cached = force === true ? null : sfwGet(key);
          if (cached) { setRes(cached); setSelId(null); setPr({ pct: 100, label: 'Fertig (aus Zwischenspeicher)', busy: false }); return; }
          const r = await asHotelRun(C, setP, () => cancelRef.current); if (r.items.length) sfwPut(key, r); setRes(r); setPr({ pct: 100, label: 'Fertig', busy: false });
        } catch (e) { if (e.message === '__cancel') setPr({ pct: 0, label: 'Abgebrochen', busy: false }); else { setErr(/nicht gefunden/.test(e.message) ? e.message : `Suche fehlgeschlagen (${String(e.message).slice(0, 200)}). Internet nötig.`); setPr({ pct: 0, label: '', busy: false }); } }
      };
      const price = (c) => parseFloat(String(getN(c).price || '').replace(',', '.')); const rate = (c) => parseFloat(String(getN(c).rating || '').replace(',', '.'));
      const shown = useMemo(() => {
        if (!res) return []; let b = res.items.filter((c) => c.dist <= maxKm && (!types.length || types.includes(c.type)) && c.stars >= minStars && (!wifi || c.wifi) && (!onlyFav || (notes[nk(c)] || {}).fav));
        const num = (v, d) => (isFinite(v) ? v : d);
        const cmp = { dist: (x, y) => x.dist - y.dist, stars: (x, y) => y.stars - x.stars || x.dist - y.dist, price: (x, y) => num(price(x), 1e9) - num(price(y), 1e9), rating: (x, y) => num(rate(y), -1) - num(rate(x), -1) }[sortBy];
        return [...b].sort(cmp);
      }, [res, types, minStars, maxKm, wifi, onlyFav, sortBy, notes]);
      useEffect(() => { if (shown.length && !shown.some((c) => c.id === selId)) setSelId(shown[0].id); }, [shown]);
      const counts = {}; (res ? res.items : []).forEach((c) => { counts[c.type] = (counts[c.type] || 0) + 1; });
      const pick = async (c) => {
        const n = getN(c); const nights = Math.max(1, parseInt(stage.nights, 10) || 1); const pr = price(c);
        if (stage.hotel && stage.hotel.name && !(await window.rtAsk(`Das bisherige Hotel „${stage.hotel.name}“ wird durch „${c.name}“ ersetzt. Fortfahren?`))) return;
        onSetHotel(stage.id, { name: c.name, address: c.addr || (stage.hotel && stage.hotel.address) || '', gps: `${c.lat.toFixed(6)},${c.lon.toFixed(6)}`, rating: n.rating || '', ...(isFinite(pr) ? { priceNewEur: Math.round(pr * nights * 100) / 100, priceOldEur: Math.round(pr * nights * 100) / 100 } : {}), hotelLink: c.web ? (/^https?:/.test(c.web) ? c.web : 'https://' + c.web) : '', bookingLink: linksOf(c).booking }, c.name);
      };
      return (
        <div data-as-hotelpanel className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><div className="font-bold text-slate-900">Unterkünfte in {city || 'der Zielstadt'}</div><div className="text-xs text-slate-500">Datenquelle OpenStreetMap. Preise und Bewertungen sind dort nicht enthalten: über „Booking“ oder „Google“ nachsehen und hier eintragen, dann lässt sich vergleichen.</div></div>
            <button type="button" data-readonly-allow data-as-hrun onClick={() => run(!!res)} disabled={p.busy} className="v18-btn pri disabled:opacity-50">{res ? 'Neu suchen' : 'Unterkünfte suchen'}</button>
          </div>
          {(p.busy || (p.pct > 0 && p.pct < 100)) && <SfProgress pct={p.pct} label={p.label} onCancel={p.busy ? () => { cancelRef.current = true; } : null} />}
          {err && <div role="alert" className="text-sm rounded-lg bg-amber-50 border border-amber-300 text-amber-950 p-3">{err}</div>}
          {res && res.via === 'nominatim' && res.items.length > 0 && <div className="text-xs text-amber-900">Die Hauptquelle war nicht erreichbar, die Liste stammt aus einer Ersatzabfrage und kann kürzer sein. „Neu suchen“ versucht es erneut.</div>}
          {res && res.items.length === 0 && <div className="text-sm rounded-lg bg-slate-50 border border-slate-200 p-3">In OpenStreetMap wurden hier keine Unterkünfte gefunden. Nutze die Suche bei Booking oder Google.</div>}
          {res && res.items.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Typ filtern">
                {Object.keys(AS_HTYPES).map((k) => { const on = types.includes(k); return <button key={k} type="button" data-readonly-allow data-as-type={k} aria-pressed={on} disabled={!on && !counts[k]} onClick={() => setTypes(on ? types.filter((x) => x !== k) : [...types, k])} className={`h-9 px-3 rounded-full border text-sm font-semibold disabled:opacity-40 ${on ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300 text-slate-800'}`}>{AS_HTYPES[k]} <span className="text-xs font-normal opacity-80">{counts[k] || 0}</span></button>; })}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5">Sterne:{[[0, 'alle'], [2, '2+'], [3, '3+'], [4, '4+']].map(([v, l]) => <button key={v} type="button" data-readonly-allow data-as-stars={v} aria-pressed={minStars === v} onClick={() => setMinStars(v)} className={`h-8 px-2.5 rounded-full border text-xs font-semibold ${minStars === v ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300'}`}>{l}</button>)}</span>
                <label className="flex items-center gap-2 font-semibold">Entfernung bis <b data-as-maxkm className="text-[#1F4E8C] w-12">{maxKm} km</b><input data-readonly-allow type="range" min="1" max="30" step="1" value={maxKm} onChange={(e) => setMaxKm(+e.target.value)} className="v20-range" aria-label="Maximale Entfernung zum Zentrum" /></label>
                <label className="inline-flex items-center gap-1.5"><input data-readonly-allow type="checkbox" checked={wifi} onChange={(e) => setWifi(e.target.checked)} />WLAN</label>
                <label className="inline-flex items-center gap-1.5"><input data-readonly-allow data-as-onlyfav type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} />Nur Merkliste ★</label>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">Sortierung:{[['dist', 'Entfernung'], ['stars', 'Sterne'], ['price', 'Preis (eigene Eingabe)'], ['rating', 'Bewertung (eigene Eingabe)']].map(([k, l]) => <button key={k} type="button" data-readonly-allow data-as-sort={k} aria-pressed={sortBy === k} onClick={() => setSortBy(k)} className={`h-8 px-2.5 rounded-full border font-semibold ${sortBy === k ? 'bg-[#E8EEF7] border-[#1F4E8C] text-[#173B6B]' : 'bg-white border-slate-300 text-slate-700'}`}>{l}</button>)}<span data-as-count>{shown.length} von {res.items.length} Unterkünften</span></div>
              {shown.length === 0 && <div className="text-sm rounded-lg bg-slate-50 border border-slate-200 p-3">Nichts passt zu den Filtern.</div>}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <ul className="order-2 lg:order-1 space-y-2 p-0 m-0 lg:max-h-[520px] lg:overflow-y-auto lg:pr-1 min-w-0">{shown.map((c) => <AsHotelCard key={c.id} c={c} selected={c.id === selId} onSelect={() => setSelId(c.id)} note={getN(c)} setNote={(pt) => setN(c, pt)} links={linksOf(c)} onPick={pick} />)}</ul>
                <div className="order-1 lg:order-2 min-w-0 lg:sticky lg:top-4">{P && <AsMap key={P.join()} P={P} items={shown} selId={selId} onSelect={asMapSelect(setSelId)} nameOf={(c) => c.name} />}</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    // ---- ③ Vor Ort ----
    async function asDoRun(P, Rkm, setP, cancelled) {
      setP(5, 'Orte in der Umgebung werden gesucht …');
      const q = `SELECT ?item ?itemLabel ?loc ?sl ?img ?d ?shop ?tour WHERE { SERVICE wikibase:around { ?item wdt:P625 ?loc . bd:serviceParam wikibase:center "Point(${P[1].toFixed(5)} ${P[0].toFixed(5)})"^^geo:wktLiteral . bd:serviceParam wikibase:radius "${Rkm}" . } ?item wikibase:sitelinks ?sl . BIND(EXISTS { VALUES ?shopT { wd:Q31374404 wd:Q11315 wd:Q216107 wd:Q330284 wd:Q1127689 } ?item wdt:P31 ?shopT } AS ?shop) ${RT_TOURQ} FILTER(?sl >= 6 || ?shop) OPTIONAL { ?item wdt:P18 ?img } OPTIONAL { ?item schema:description ?d . FILTER(lang(?d) IN ("de","en")) } SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } } ORDER BY DESC(?sl) LIMIT 250`;
      const stop = asProgressTicker(setP, 10, 85, 'Sehenswürdigkeiten werden geladen …'); let j, last = '';
      try { for (let tr = 0; tr < 2 && !j; tr++) { try { j = await fetchJsonT(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(tr === 0 ? q : rtNoTour(q))}`, 35000); } catch (e) { last = e.message; if (cancelled()) throw new Error('__cancel'); } } } finally { stop(); }
      if (!j) throw new Error(`Wikidata nicht erreichbar (${last || 'keine Antwort'})`); if (cancelled()) throw new Error('__cancel');
      setP(90, 'Ergebnisse werden aufbereitet …'); const map = new Map();
      ((j.results && j.results.bindings) || []).forEach((r) => {
        const mm = /Point\(([-\d.eE]+) ([-\d.eE]+)\)/.exec(r.loc && r.loc.value); if (!mm) return; const id = r.item.value.split('/').pop(); const name = r.itemLabel && r.itemLabel.value; if (!name || /^Q\d+$/.test(name)) return;
        const d = (r.d && r.d.value) || ''; const shop = r.shop && r.shop.value === 'true'; const tour = r.tour && r.tour.value === 'true'; const flag = !!r.tour; if (!shop && !tour && asBadWord.test(d.toLowerCase())) return; let kind = shop ? 'shopping' : sfwKindOf(d); if (tour && (!kind || kind === 'stadt')) kind = 'sehensw'; if (!kind || kind === 'stadt') return; if (flag && !tour && !shop && (Number(r.sl.value) || 0) < 30) return;
        const prev = map.get(id) || {}; const lat = Number(mm[2]), lon = Number(mm[1]);
        map.set(id, { id, name, lat, lon, sl: (Number(r.sl.value) || 0) + (tour ? 40 : 0), img: (r.img && r.img.value ? r.img.value.replace(/^http:/, 'https:') + '?width=360' : '') || prev.img || '', d, kind, dist: haversineM(P, [lat, lon]) / 1000 });
      });
      return { items: [...map.values()].filter((c) => c.dist > 0.05).sort((a, b) => b.sl - a.sl).slice(0, 80) };
    }
    function StageDoPanel({ trip, stage, index, onAddLocal }) {
      const [p, setPr] = useState({ pct: 0, label: '', busy: false }); const [res, setRes] = useState(null); const [err, setErr] = useState(''); const [P, setPt] = useState(null);
      const [kinds, setKinds] = useState([]); const [maxKm, setMaxKm] = useState(25); const [sortBy, setSortBy] = useState('pop'); const [selId, setSelId] = useState(null); const [day, setDay] = useState(0); const [lim, setLim] = useState(10); const cancelRef = useRef(false);
      const nights = Math.max(1, parseInt(stage.nights, 10) || 1); const have = new Set((stage.localAttractions || []).map((a) => (a.name || '').toLowerCase()));
      const run = async (force) => {
        cancelRef.current = false; setErr(''); setRes(null); setPr({ pct: 1, label: 'Start …', busy: true }); const setP = (pct, label) => setPr({ pct, label, busy: true });
        try {
          setP(3, 'Ort wird bestimmt …'); const C = await asCenter(stage); if (!C) throw new Error('Ort nicht gefunden. Bitte Zielort prüfen oder GPS beim Hotel eintragen.'); setPt(C);
          const key = `do2|${C[0].toFixed(3)}|${C[1].toFixed(3)}`; const cached = force === true ? null : sfwGet(key);
          if (cached) { setRes(cached); setPr({ pct: 100, label: 'Fertig (aus Zwischenspeicher)', busy: false }); return; }
          const r = await asDoRun(C, 50, setP, () => cancelRef.current); if (r.items.length) sfwPut(key, r); setRes(r); setPr({ pct: 100, label: 'Fertig', busy: false });
        } catch (e) { if (e.message === '__cancel') setPr({ pct: 0, label: 'Abgebrochen', busy: false }); else { setErr(/nicht gefunden/.test(e.message) ? e.message : `Suche fehlgeschlagen (${String(e.message).slice(0, 200)}). Internet nötig.`); setPr({ pct: 0, label: '', busy: false }); } }
      };
      const KK = Object.keys(SFW_KINDS).filter((k) => k !== 'stadt');
      const shown = useMemo(() => { if (!res) return []; const b = res.items.filter((c) => c.dist <= maxKm && (!kinds.length || kinds.includes(c.kind))); return [...b].sort(sortBy === 'dist' ? (x, y) => x.dist - y.dist : (x, y) => y.sl - x.sl); }, [res, kinds, maxKm, sortBy]);
      useEffect(() => { if (shown.length && !shown.some((c) => c.id === selId)) setSelId(shown[0].id); setLim(10); }, [shown]);
      const vis = shown.slice(0, lim);
      const counts = {}; (res ? res.items : []).forEach((c) => { counts[c.kind] = (counts[c.kind] || 0) + 1; });
      return (
        <div data-as-dopanel className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><div className="font-bold text-slate-900">Unternehmungen rund um {stage.toCity || 'das Etappenziel'}</div><div className="text-xs text-slate-500">Bekannte Orte im Umkreis (Wikidata/Wikipedia), mit Foto und Beschreibung.</div></div>
            <button type="button" data-readonly-allow data-as-drun onClick={() => run(!!res)} disabled={p.busy} className="v18-btn pri disabled:opacity-50">{res ? 'Neu suchen' : 'Vorschläge suchen'}</button>
          </div>
          <RtNameSearch mode="do" have={have} getCenter={() => asCenter(stage)} pick={async (x) => { let t = null; try { t = await sfwLongText(x); } catch (e) {} onAddLocal(stage.id, x, t, day); }} />
          {(p.busy || (p.pct > 0 && p.pct < 100)) && <SfProgress pct={p.pct} label={p.label} onCancel={p.busy ? () => { cancelRef.current = true; } : null} />}
          {err && <div role="alert" className="text-sm rounded-lg bg-amber-50 border border-amber-300 text-amber-950 p-3">{err}</div>}
          {res && res.items.length === 0 && <div className="text-sm rounded-lg bg-slate-50 border border-slate-200 p-3">Im Umkreis wurden keine bekannten Ziele gefunden.</div>}
          {res && res.items.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Arten filtern">
                {KK.map((k) => { const on = kinds.includes(k); return <button key={k} type="button" data-readonly-allow data-as-kind={k} aria-pressed={on} disabled={!on && !counts[k]} onClick={() => setKinds(on ? kinds.filter((x) => x !== k) : [...kinds, k])} className={`h-9 px-3 rounded-full border text-sm font-semibold disabled:opacity-40 ${on ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300 text-slate-800'}`}>{SFW_KINDS[k]} <span className="text-xs font-normal opacity-80">{counts[k] || 0}</span></button>; })}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <label className="flex items-center gap-2 font-semibold">Umkreis bis <b data-as-dokm className="text-[#1F4E8C] w-14">{maxKm} km</b><input data-readonly-allow type="range" min="5" max="50" step="5" value={maxKm} onChange={(e) => setMaxKm(+e.target.value)} className="v20-range" aria-label="Umkreis" /></label>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">Sortierung:{[['pop', 'Bekanntheit'], ['dist', 'Entfernung']].map(([k, l]) => <button key={k} type="button" data-readonly-allow aria-pressed={sortBy === k} onClick={() => setSortBy(k)} className={`h-8 px-2.5 rounded-full border font-semibold ${sortBy === k ? 'bg-[#E8EEF7] border-[#1F4E8C] text-[#173B6B]' : 'bg-white border-slate-300 text-slate-700'}`}>{l}</button>)}</span>
                {nights >= 2 && <label className="inline-flex items-center gap-1.5">Übernehmen für<select data-readonly-allow data-as-day value={day} onChange={(e) => setDay(+e.target.value)} className="h-8 px-2 rounded border border-slate-300 text-sm"><option value={0}>automatisch</option>{Array.from({ length: nights }, (_, i) => <option key={i} value={i + 1}>Tag {i + 1}</option>)}</select></label>}
                <span data-as-docount className="text-xs text-slate-500">{vis.length} von {shown.length} passenden Zielen</span>
              </div>
              {shown.length === 0 && <div className="text-sm rounded-lg bg-slate-50 border border-slate-200 p-3">Nichts passt zu den Filtern. Erhöhe den Umkreis oder nimm einen Filter heraus.</div>}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="order-2 lg:order-1 min-w-0"><ul className="space-y-2 p-0 m-0 lg:max-h-[520px] lg:overflow-y-auto lg:pr-1">{vis.map((c) => <SfwCard key={c.id} c={c} selected={c.id === selId} onSelect={() => setSelId(c.id)} meta={<><b>{c.dist.toFixed(1).replace('.', ',')} km</b> vom Zentrum{c.kind === 'museum' ? ' · auch bei Regen' : ''}{have.has(c.name.toLowerCase()) ? ' · bereits in der Etappe' : ''}</>} pickLabel="Zu Aktionen hinzufügen" onPick={async (x) => { let t = null; try { t = await sfwLongText(x); } catch (e) {} onAddLocal(stage.id, x, t, day); }} />)}</ul>{shown.length > vis.length && <button type="button" data-readonly-allow data-as-more onClick={() => setLim(lim + 10)} className="mt-2 v18-btn w-full">Mehr anzeigen ({shown.length - vis.length} weitere)</button>}</div>
                <div className="order-1 lg:order-2 min-w-0 lg:sticky lg:top-4">{P && <AsMap key={P.join()} P={P} items={vis} selId={selId} onSelect={asMapSelect(setSelId)} nameOf={(c) => `${c.name} (${c.dist.toFixed(1)} km)`} />}</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    function StageAssistant({ trip, stage, index, expanded, onToggleExpand, onAddStop, onSetHotel, onAddLocal }) {
      const [open, setOpen] = useState(() => { const q = window.__rtAssist; if (q && q.stageId === stage.id) { window.__rtAssist = null; return q.step; } return null; });
      useEffect(() => { const f = (e) => { if (e.detail && e.detail.stageId === stage.id) { window.__rtAssist = null; setOpen(e.detail.step); } }; window.addEventListener('rt-assist', f); return () => window.removeEventListener('rt-assist', f); }, [stage.id]);
      const steps = [['way', '① Weg', 'Ziele entlang der Strecke vorschlagen'], ['hotel', '② Hotel', 'Unterkünfte vergleichen und übernehmen'], ['do', '③ Vor Ort', 'Unternehmungen in der Umgebung']];
      return (
        <>
        <div data-stage-assistant style={{ order: 1 }} className="v18-edit-only no-print px-4 py-2.5 bg-[#F5F8FC] border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#173B6B]">Assistent</span>
            {steps.map(([k, l, tip]) => <button key={k} type="button" data-readonly-allow data-assist={k} title={tip} aria-pressed={open === k} onClick={() => setOpen(open === k ? null : k)} className={`h-9 px-3 rounded-full border text-sm font-semibold ${open === k ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-[#1F4E8C]'}`}>{l}</button>)}
            <button type="button" data-readonly-allow data-assist-details aria-pressed={expanded} onClick={() => onToggleExpand()} className="ml-auto h-9 px-3 rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-[#1F4E8C]">{expanded ? 'Details ausblenden ▴' : 'Details anzeigen ▾'}</button>
          </div>
        </div>
        {open && <div data-assist-panel style={{ order: 1 }} className="v18-edit-only no-print px-4 py-3 bg-[#F5F8FC] border-t border-slate-100">
          {open === 'way' && <StageWayPanel trip={trip} stage={stage} index={index} onAddStop={onAddStop} />}
          {open === 'hotel' && <StageHotelPanel trip={trip} stage={stage} index={index} onSetHotel={onSetHotel} />}
          {open === 'do' && <StageDoPanel trip={trip} stage={stage} index={index} onAddLocal={onAddLocal} />}
        </div>}
        </>
      );
    }

    // ===== v43: Reise-Übersicht (Fahrzeit-Warnung, Zeitleiste, Regenplan, Gesamtkarte) =====
    const OV_COLORS = ['#e4572e', '#2e86de', '#17a589', '#8e44ad', '#f39c12', '#c0392b', '#16a085', '#34495e', '#d35400', '#27ae60', '#e84393', '#6c5ce7'];
    const OV_INDOOR = [['Museum', '🏛'], ['Aquarium', '🐠'], ['Einkaufszentrum', '🛍'], ['Kino', '🎬'], ['Café', '☕'], ['Spa', '♨️']];
    const ovRainy = (w) => !!w && ((w.rain != null && w.rain >= 60) || (w.code >= 51 && w.code <= 67) || (w.code >= 80 && w.code <= 99));
    const ovWeekday = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' }); };
    const ovRainKey = (day) => String(day.dayInStage || 1);
    const ovStageRain = (stage, day) => { const r = stage.rainPlan && stage.rainPlan[ovRainKey(day)]; return Array.isArray(r) ? r : []; };

    function OvRainPlan({ trip, day, onSave }) {
      const stage = day.stage; const items = ovStageRain(stage, day); const [name, setName] = useState('');
      const acts = (stage.localAttractions || []).filter((a) => a.name && !items.some((x) => x.srcId && x.srcId === a.id));
      const H = parseGps(stage.hotel && stage.hotel.gps);
      const write = (next) => onSave({ ...trip, stages: (trip.stages || []).map((s) => (s.id === stage.id ? { ...s, rainPlan: { ...(s.rainPlan || {}), [ovRainKey(day)]: next } } : s)) }, '');
      const add = (it) => write([...items, { id: `rp-${Date.now()}-${Math.floor(Math.random() * 1000)}`, ...it }]);
      return (
        <div data-ov-rainplan className="mt-2 rounded-xl border border-sky-300 bg-sky-50 p-3 space-y-2">
          <div className="text-sm font-bold text-sky-900"><Ic n="rain" />Regenplan für diesen Tag</div>
          {items.length === 0 && <div className="text-xs text-slate-600">Noch keine Ausweichideen. Füge unten welche hinzu, damit du bei Regen nicht lange suchen musst.</div>}
          <ul className="space-y-1">
            {items.map((it) => (
              <li key={it.id} data-ov-rain-item className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
                <span className="flex-1 min-w-0 break-words text-slate-900">{it.name}</span>
                {it.gps && <NavLink gps={it.gps} name={it.name} label="Navi" className="min-h-[32px] inline-flex items-center px-2 rounded-lg bg-blue-600 text-white text-xs font-bold" />}
                <button type="button" aria-label="Entfernen" onClick={() => write(items.filter((x) => x.id !== it.id))} className="h-8 w-8 rounded-full border border-slate-300 text-slate-600">×</button>
              </li>
            ))}
          </ul>
          {acts.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-700">Aus den Aktionen vor Ort übernehmen:</div>
              <div className="flex flex-wrap gap-1.5">
                {acts.map((a) => <button key={a.id || a.name} type="button" data-ov-rain-from onClick={() => add({ name: a.name, gps: a.gps || '', srcId: a.id })} className="px-2.5 min-h-[34px] rounded-full border border-slate-300 bg-white text-xs text-slate-900">+ {a.name.length > 38 ? a.name.slice(0, 36) + '…' : a.name}</button>)}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <input data-ov-rain-input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) { add({ name: name.trim() }); setName(''); } }} placeholder="Eigene Idee, z. B. Aquarium" className="flex-1 min-w-0 h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white text-slate-900" />
            <button type="button" data-ov-rain-add disabled={!name.trim()} onClick={() => { add({ name: name.trim() }); setName(''); }} className="v18-btn pri sm disabled:opacity-40">Hinzufügen</button>
          </div>
          {H && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-700">Indoor-Ideen in der Nähe des Hotels suchen:</div>
              <div className="flex flex-wrap gap-1.5">
                {OV_INDOOR.map(([q, ic]) => <a key={q} data-readonly-allow href={`https://www.google.com/maps/search/${encodeURIComponent(q)}/@${H[0]},${H[1]},13z`} target="_blank" rel="noopener noreferrer" className="px-2.5 min-h-[34px] inline-flex items-center rounded-full border border-sky-400 bg-white text-xs font-semibold text-sky-900">{ic} {q}</a>)}
              </div>
            </div>
          )}
        </div>
      );
    }

    function OvRainToggle({ trip, day, onSave }) {
      useWx(); const w = wxStore.get(day.stage, day.iso); const rainy = ovRainy(w); const items = ovStageRain(day.stage, day); const [open, setOpen] = useState(null);
      const isOpen = open != null ? open : (rainy && items.length > 0);
      return (
        <div data-ov-daytoggle>
          <button type="button" data-readonly-allow data-ov-rain-toggle aria-expanded={isOpen} onClick={() => setOpen(!isOpen)} className={`min-h-[40px] px-3 rounded-full border text-sm font-bold ${rainy ? 'border-sky-600 bg-sky-700 text-white' : 'border-slate-300 bg-white text-slate-900'}`}><Ic n="rain" />Regenplan{items.length ? ` (${items.length})` : ''}{rainy ? ' · Regen erwartet' : ''}</button>
          {isOpen && <OvRainPlan trip={trip} day={day} onSave={onSave} />}
        </div>
      );
    }

    function OvMap({ trip, focus, onFocusDone }) {
      const stages = trip.stages || []; const elRef = useRef(null), mapRef = useRef(null), grpRef = useRef(null), boxRef = useRef(null);
      const [lay, setLay] = useState({ route: true, hotel: true, stop: true, attr: false });
      const [hidden, setHidden] = useState([]); const [road, setRoad] = useState({}); const [st, setSt] = useState({ busy: false, msg: '' });
      const [fitKey, setFitKey] = useState(0);
      const lib = typeof L !== 'undefined';
      const data = useMemo(() => stages.map((s, i) => {
        const H = parseGps(s.hotel && s.hotel.gps); const prev = stages[i - 1]; const A = prev ? parseGps(prev.hotel && prev.hotel.gps) : null;
        const stops = ((s.routeToHotel && s.routeToHotel.stopsOnWay) || []).map((x) => ({ n: x.name, g: parseGps(x.gps) })).filter((x) => x.g && !(H && haversineM(H, x.g) < 300) && !/^\s*ankunft/i.test(x.n || ''));
        const attrs = (s.localAttractions || []).map((a) => ({ n: a.name, g: parseGps(a.gps) })).filter((x) => x.g);
        const pts = [A, ...stops.map((x) => x.g), H].filter(Boolean);
        return { s, i, H, stops, attrs, pts, color: OV_COLORS[i % OV_COLORS.length] };
      }), [stages]);
      const sig = useMemo(() => data.map((d) => d.pts.map((p) => p.join(',')).join(';')).join('|'), [data]);
      useEffect(() => { setRoad({}); }, [sig]);
      useEffect(() => {
        if (!lib || !elRef.current || mapRef.current) return;
        const map = L.map(elRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([27.8, -81.7], 6);
        const ms = MAP_STYLES.esri; L.tileLayer(ms.url, { ...ms.opts, attribution: ms.attr }).addTo(map);
        grpRef.current = L.layerGroup().addTo(map); mapRef.current = map; setTimeout(() => map.invalidateSize(), 200);
        return () => { map.remove(); mapRef.current = null; };
      }, []);
      useEffect(() => {
        const map = mapRef.current, g = grpRef.current; if (!map || !g) return; g.clearLayers(); const all = [];
        const mk = (ll, html, size, title) => L.marker(ll, { icon: L.divIcon({ className: 'ov-mk', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] }), title: title || '' });
        data.forEach((d) => {
          if (hidden.includes(d.s.id)) return;
          const lbl = `${d.i + 1}. ${hotelName(d.s)}`;
          if (lay.route && d.pts.length > 1) { const line = road[d.s.id] || d.pts; L.polyline(line, { color: d.color, weight: 5, opacity: 0.85, dashArray: road[d.s.id] ? null : '8 8' }).addTo(g); }
          if (lay.stop) d.stops.forEach((p) => { mk(p.g, `<div style="width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid ${d.color}"></div>`, 12, p.n).bindPopup(`🚩 ${p.n || 'Stopp'}<br><small>${d.s.fromCity || ''} → ${d.s.toCity || ''}</small>`).addTo(g); });
          if (lay.attr) d.attrs.forEach((p) => { mk(p.g, `<div style="color:${d.color};font-size:17px;line-height:14px;text-shadow:0 0 2px #fff,0 0 2px #fff">★</div>`, 16, p.n).bindPopup(`★ ${p.n || 'Aktion'}<br><small>${hotelName(d.s)}</small>`).addTo(g); });
          if (lay.hotel && d.H) mk(d.H, `<div style="width:28px;height:28px;border-radius:50%;background:${d.color};color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)">${d.i + 1}</div>`, 28, lbl).bindPopup(`🏨 <b>${lbl}</b><br><small>${d.s.dateRange || ''}</small>`).addTo(g);
          d.pts.forEach((p) => all.push(p)); d.attrs.forEach((p) => lay.attr && all.push(p.g));
        });
        if (all.length) { try { map.fitBounds(L.latLngBounds(all), { padding: [30, 30], maxZoom: 12 }); } catch (e) {} }
      }, [data, lay, hidden, road, fitKey]);
      useEffect(() => {
        if (!focus || !mapRef.current) return; const d = data.find((x) => x.s.id === focus); if (!d || !d.pts.length) { onFocusDone(); return; }
        setHidden([]); const map = mapRef.current;
        try { map.fitBounds(L.latLngBounds(d.pts), { padding: [40, 40], maxZoom: 13 }); } catch (e) {}
        if (boxRef.current) boxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); onFocusDone();
      }, [focus]);
      const loadRoads = async () => {
        setSt({ busy: true, msg: 'Straßenverlauf wird geladen …' }); const out = {}; let ok = 0, fail = 0;
        for (const d of data) {
          if (d.pts.length < 2) continue; const pts = d.pts.slice(0, 40);
          try {
            const j = await fetchJsonTimeout(`https://router.project-osrm.org/route/v1/driving/${pts.map((p) => `${p[1]},${p[0]}`).join(';')}?overview=simplified&geometries=geojson`, {}, 15000);
            if (j.code === 'Ok' && j.routes && j.routes[0]) { out[d.s.id] = j.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]); ok++; } else fail++;
          } catch (e) { fail++; }
        }
        setRoad(out); setSt({ busy: false, msg: ok ? `Straßenverlauf für ${ok} Etappe(n) geladen${fail ? `, ${fail} nicht erreichbar (gestrichelte Luftlinie)` : ''}.` : 'Routing-Dienst nicht erreichbar. Es bleibt bei der Luftlinie (gestrichelt).' });
      };
      const Chip = ({ k, label }) => <button type="button" data-readonly-allow data-ov-layer={k} aria-pressed={lay[k]} onClick={() => setLay({ ...lay, [k]: !lay[k] })} className={`h-9 px-3 rounded-full border text-sm font-semibold ${lay[k] ? 'bg-[#1F4E8C] border-[#1F4E8C] text-white' : 'bg-white border-slate-300 text-slate-800'}`}>{label}</button>;
      return (
        <section ref={boxRef} data-ov-map className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900"><Ic n="map" />Gesamtkarte der Reise</h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" data-readonly-allow data-ov-fit onClick={() => { setHidden([]); setFitKey((k) => k + 1); }} className="v18-btn sm">Alles zeigen</button>
              <button type="button" data-readonly-allow data-ov-road disabled={st.busy} onClick={loadRoads} className="v18-btn sm">{st.busy ? 'Lädt …' : 'Straßenverlauf laden'}</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2"><Chip k="route" label="Etappen" /><Chip k="hotel" label="Hotels" /><Chip k="stop" label="Stopps" /><Chip k="attr" label="Aktionen" /></div>
          <div className="flex flex-wrap gap-1.5" data-ov-legend>
            {data.map((d) => { const off = hidden.includes(d.s.id); return (
              <button key={d.s.id} type="button" data-readonly-allow data-ov-stage={d.s.id} aria-pressed={!off} onClick={() => setHidden(off ? hidden.filter((x) => x !== d.s.id) : [...hidden, d.s.id])} className={`inline-flex items-center gap-1.5 px-2.5 min-h-[34px] rounded-full border text-xs font-semibold ${off ? 'opacity-50 border-slate-300 bg-white text-slate-700' : 'border-slate-400 bg-white text-slate-900'}`}>
                <span style={{ background: d.color }} className="inline-block h-3 w-3 rounded-full" />{d.i + 1}. {d.s.toCity || hotelName(d.s)}
              </button>); })}
          </div>
          {!lib ? <div className="text-sm text-amber-800 bg-amber-50 border border-amber-300 rounded-lg p-3">Die Kartenbibliothek ist offline nicht verfügbar. Sie wird beim nächsten Start mit Internet geladen.</div>
            : <div ref={elRef} data-ov-canvas style={{ height: 'min(70vh, 520px)', minHeight: 320 }} className="rounded-xl overflow-hidden border border-slate-200" />}
          {st.msg && <div data-ov-msg className="text-xs text-slate-700">{st.msg}</div>}
          <div className="text-xs text-slate-600">Gestrichelt = Luftlinie zwischen Hotels und Stopps. Mit „Straßenverlauf laden“ wird die echte Strecke eingezeichnet (benötigt Internet).</div>
        </section>
      );
    }

    function TripOverview({ trip, onSave, todayIso, goTab }) {
      useWx(); useEffect(() => { wxStore.ensure(trip); }, [(trip.stages || []).length]);
      const meta = trip.meta || {}; const thr = Number(meta.maxDriveHours) > 0 ? Number(meta.maxDriveHours) : 5;
      const [open, setOpen] = useState({}); const [focus, setFocus] = useState(null); const [showAll, setShowAll] = useState(false);
      const rows = useMemo(() => buildDays(trip).map((d) => {
        let tl = null; if (d.kind === 'travel') { try { tl = buildTimeline(trip, d); } catch (e) { tl = null; } }
        const acts = d.dayInStage ? attractionsForDay(d.stage, d.dayInStage) : [];
        const drive = tl ? tl.driveSum : 0; const dayKm = tl && tl.totalKm ? tl.totalKm : 0, mi = tl ? tl.miles : false; const prev = d.stageIdx > 0 ? (trip.stages || [])[d.stageIdx - 1] : null;
        return { d, tl, acts, drive, dayKm, mi, over: drive > thr * 60, change: d.kind === 'travel' && d.stageIdx > 0, free: d.kind !== 'travel' && acts.length === 0 && d.kind !== 'checkout', prev };
      }), [trip, thr]);
      const needs = (r) => { const w = wxStore.get(r.d.stage, r.d.iso); return r.over || (r.tl && r.tl.warnings.length > 0) || ovRainy(w) || r.free; };
      const vrows = showAll ? rows : rows.filter(needs);
      const total = rows.reduce((a, r) => a + r.drive, 0); const totalKm = rows.reduce((a, r) => a + (r.dayKm || 0), 0), anyMi = rows.some((r) => r.mi); const longest = rows.reduce((m, r) => (r.drive > (m ? m.drive : 0) ? r : m), null);
      const nOver = rows.filter((r) => r.over).length, nFree = rows.filter((r) => r.free).length, nChange = rows.filter((r) => r.change).length;
      const setThr = (v) => onSave({ ...trip, meta: { ...meta, maxDriveHours: Number(v) } }, '');
      const Stat = ({ k, v, sub, warn }) => <div data-ov-stat={k} className={`rounded-xl border p-3 ${warn ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><div className="text-xs font-semibold text-slate-600">{k}</div><div className="text-lg font-extrabold text-slate-900">{v}</div>{sub && <div className="text-xs text-slate-600">{sub}</div>}</div>;
      return (
        <div data-ov-root className="space-y-4">
          <CardExpiryAlerts trip={trip} goCards={goTab ? () => goTab('cards') : null} />
          <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900"><Ic n="calendar" />Reisetage im Überblick</h2>
              <label className="flex items-center gap-2 text-sm text-slate-800">Fahrzeit-Warnung ab
                <select data-ov-thr data-readonly-allow value={thr} onChange={(e) => setThr(e.target.value)} className="h-10 px-2 rounded-lg border border-slate-300 bg-white text-slate-900">{[2, 3, 4, 5, 6, 7, 8, 10].map((h) => <option key={h} value={h}>{h} Std./Tag</option>)}</select>
              </label>
            </div>
            <p className="text-xs text-slate-700">Hier stehen nur Tage mit Hinweisen: lange Fahrten, Warnungen, Regen oder freie Tage. Mit „☔ Regenplan“ sammelst du Ausweichideen. Den vollständigen Ablauf jedes Tages gibt es im Tagesplan.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat k="Reisetage" v={rows.length} sub={`${(trip.stages || []).length} Etappen`} />
              <Stat k="Fahrzeit gesamt" v={fmtDurMin(total)} sub={[totalKm ? rtDist(totalKm, anyMi) : '', longest && longest.drive ? `längster Tag: ${fmtDurMin(longest.drive)}` : ''].filter(Boolean).join(' · ')} />
              <Stat k="Hotelwechsel" v={nChange} sub={`${nFree} ${nFree === 1 ? 'freier Tag' : 'freie Tage'}`} />
              <Stat k="Lange Fahrtage" v={nOver} sub={`über ${thr} Std.`} warn={nOver > 0} />
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
            {rows.length === 0 && <div className="text-sm text-slate-700">Noch keine Reisetage. Trage in den Etappen Datum und Nächte ein.</div>}
            {rows.length > 0 && vrows.length === 0 && <div data-ov-none className="text-sm text-slate-700 mb-2">Keine Hinweise: kein langer Fahrtag, kein Regen, keine Warnungen.</div>}
            {rows.length > 0 && <div className="flex flex-wrap items-center gap-2 mb-2"><button type="button" data-readonly-allow data-ov-showall aria-pressed={showAll} onClick={() => setShowAll(!showAll)} className="v18-btn sm">{showAll ? 'Nur Tage mit Hinweisen' : `Alle ${rows.length} Tage zeigen`}</button>{goTab && <button type="button" data-readonly-allow data-ov-plan onClick={() => goTab('plan')} className="v18-btn sm">Tagesplan öffnen →</button>}</div>}
            <ol className="space-y-2">
              {vrows.map((r) => {
                const { d } = r; const st = d.stage; const w = wxStore.get(st, d.iso); const rainy = ovRainy(w); const items = ovStageRain(st, d); const isOpen = open[d.iso] != null ? open[d.iso] : false;
                const warns = r.tl ? r.tl.warnings : []; const color = OV_COLORS[d.stageIdx % OV_COLORS.length]; const isToday = d.iso === todayIso;
                const cityOf = (x) => String((x && x.toCity) || '').trim() || hotelName(x); const title = d.kind === 'travel' ? `${r.prev ? cityOf(r.prev) : (st.fromCity || 'Start')} → ${cityOf(st)}` : d.kind === 'checkout' ? `Check-out ${cityOf(st)}` : `Aufenthalt ${cityOf(st)}`;
                return (
                  <li key={d.iso} data-ov-day={d.iso} style={{ borderLeftColor: color }} className={`rounded-xl border border-slate-200 border-l-[6px] bg-white p-3 ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                      <div className="w-24 shrink-0"><div className="text-sm font-extrabold text-slate-900">{ovWeekday(d.iso)}</div><div className="text-xs text-slate-600">Etappe {d.stageIdx + 1}{isToday ? ' · heute' : ''}</div></div>
                      <div className="flex-1 min-w-[180px]">
                        <div className="text-sm font-semibold text-slate-900 break-words">{title}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                          {d.kind === 'travel' && <span data-ov-badge="drive" className={`px-2 py-0.5 rounded-full font-bold ${r.over ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-900'}`}><Ic n="car" />{fmtDurMin(r.drive)}{r.dayKm ? ` · ${rtDist(r.dayKm, r.mi)}` : ''}{r.over ? ' · zu lang' : ''}</span>}
                          {r.change && <span data-ov-badge="change" className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold"><Ic n="hotel" />Hotelwechsel</span>}
                          {d.kind === 'travel' && d.stageIdx === 0 && (trip.flights || []).some((f) => rtFlightFilled(f) && /^hin/i.test(f.direction || '')) && <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold"><Ic n="plane" />Anreise</span>}
                          {r.free && <span data-ov-badge="free" className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">🌴 Freier Tag</span>}
                          {r.acts.length > 0 && <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-900 font-semibold">★ {r.acts.length} Aktion(en)</span>}
                          {w && <span data-ov-badge="wx" className={`px-2 py-0.5 rounded-full font-semibold ${rainy ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-900'}`}>{WMO(w.code)[0]} {Math.round(w.tmax)}°/{Math.round(w.tmin)}°{w.rain != null ? ` · ${w.rain} %` : ''}{rainy ? ' · Regen' : ''}</span>}
                          {items.length > 0 && <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 font-semibold"><Ic n="rain" />{items.length} Ausweich</span>}
                        </div>
                        {warns.map((t, i) => <div key={i} data-ov-warn className="mt-1 text-xs text-amber-900 bg-amber-50 border border-amber-300 rounded-md px-2 py-1"><Ic n="warn" />{t}</div>)}
                        {r.over && <div data-ov-over className="mt-1 text-xs text-red-900 bg-red-50 border border-red-300 rounded-md px-2 py-1">Fahrzeit {fmtDurMin(r.drive)} liegt über deiner Grenze von {thr} Std. Zwischenstopp, früher starten oder die Etappe teilen.</div>}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button type="button" data-readonly-allow data-ov-focus onClick={() => goTab && goTab('map')} title="Auf der Karte zeigen" className="h-9 w-9 rounded-full border border-slate-300 bg-white text-base"><Ic n="map" /></button>
                        <button type="button" data-readonly-allow data-ov-rain-toggle aria-expanded={isOpen} onClick={() => setOpen({ ...open, [d.iso]: !isOpen })} className={`h-9 px-3 rounded-full border text-xs font-bold ${rainy && !isOpen ? 'border-sky-600 bg-sky-700 text-white' : 'border-slate-300 bg-white text-slate-900'}`}><Ic n="rain" />Regenplan</button>
                      </div>
                    </div>
                    {(isOpen || (rainy && items.length > 0 && open[d.iso] == null)) && <OvRainPlan trip={trip} day={d} onSave={onSave} />}
                  </li>
                );
              })}
            </ol>
          </section>
          <section data-ov-mapbtn className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900"><Ic n="map" />Gesamtkarte der Reise</h2><p className="text-xs text-slate-700">Die Karte mit Etappen, Hotels, Stopps und Straßenverlauf findest du im Tab Karte.</p></div>{goTab && <button type="button" data-readonly-allow data-ov-openmap onClick={() => goTab('map')} className="v18-btn pri">Karte öffnen →</button>}</section>
        </div>
      );
    }

    