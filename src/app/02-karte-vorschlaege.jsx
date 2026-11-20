// ===== Interaktive Karte (Leaflet, lokal eingebettet) =====
    const parseGps = (g) => {
      if (!g || typeof g !== 'string') return null;
      const m = g.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/);
      if (!m) return null;
      const lat = Number(m[1]), lng = Number(m[2]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
      return [lat, lng];
    };
    const escHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const haversineM = (a, b) => { const R = 6371000, r = (x) => x * Math.PI / 180; const dLat = r(b[0] - a[0]), dLng = r(b[1] - a[1]); const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
    const fmtKm = (m) => `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km (${(m / 1609.344).toFixed(m < 10000 ? 1 : 0)} mi)`;
    const fmtDur = (s) => { const mins = Math.round(s / 60); const h = Math.floor(mins / 60); return h ? `${h} h ${String(mins % 60).padStart(2, '0')} min` : `${mins} min`; };

    const MAP_STYLES = {
      esri: { label: 'Straßen (Esri)', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', opts: { maxZoom: 19 }, attr: 'Tiles © Esri' },
      sat: { label: 'Satellit (Esri)', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', opts: { maxZoom: 18 }, attr: 'Tiles © Esri' },
      osm: { label: 'OpenStreetMap (nur mit Webserver)', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', opts: { maxZoom: 19 }, attr: '© OpenStreetMap-Mitwirkende' }
    };

    const typeIcon = (t) => (t === 'hotel' ? <Ic n="hotel" /> : t === 'parking' ? <Ic n="park" /> : t === 'stop' ? <Ic n="flag" /> : '★ ');
    // ===== Vorschläge entlang der Etappe (OpenStreetMap/Overpass) =====
    const OVERPASS_URLS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
    const SUG_CATS = {
      sight: { label: 'Sehenswürdigkeiten', q: ['["tourism"~"^(attraction|viewpoint)$"]', '["man_made"~"^(lighthouse|pier)$"]'] },
      museum: { label: 'Museen & Kultur', q: ['["tourism"~"^(museum|gallery)$"]', '["amenity"~"^(theatre|arts_centre|planetarium)$"]'] },
      fun: { label: 'Freizeit & Tiere', q: ['["tourism"~"^(zoo|aquarium|theme_park)$"]', '["leisure"~"^(water_park|garden)$"]'] },
      nature: { label: 'Natur & Strand', q: ['["natural"~"^(beach|spring|waterfall|peak|cave_entrance|arch|hot_spring|geyser)$"]', '["leisure"="nature_reserve"]', '["boundary"="national_park"]'] },
      history: { label: 'Historisches', q: ['["historic"~"^(monument|memorial|castle|fort|ruins|archaeological_site|battlefield|ship|manor|building|lighthouse|mine)$"]'] },
      shop: { label: 'Mall / Shopping', q: ['["shop"~"^(mall|department_store|outlet)$"]', '["amenity"="marketplace"]'] },
      food: { label: 'Restaurant / Fastfood', q: ['["amenity"~"^(restaurant|fast_food|cafe)$"]'] }
    };
    const RT_WIKI_PLACE = /\b(city|town|village|borough|township|county|census|unincorporated|community|suburb|hamlet|municipality|neighbou?rhood|human settlement|populated place|county seat|region|metropolitan)\b/i;
    // ===== v103: Wikivoyage (Sehenswertes / Aktivitäten) =====
    const WV_API = 'https://en.wikivoyage.org/w/api.php';
    const rtWvClean = (v) => String(v || '')
      .replace(/<ref[\s\S]*?(<\/ref>|\/>)/gi, '').replace(/<[^>]+>/g, '')
      .replace(/\{\{[^{}]*\}\}/g, '').replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')
      .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, '$1').replace(/\[https?:\/\/[^\]]+\]/g, '')
      .replace(/'{2,}/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const rtWvSplit = (body) => { const out = []; let d = 0, cur = ''; for (let i = 0; i < body.length; i++) { const c = body[i], n = body[i + 1]; if ((c === '{' && n === '{') || (c === '[' && n === '[')) { d++; cur += c + n; i++; continue; } if ((c === '}' && n === '}') || (c === ']' && n === ']')) { d--; cur += c + n; i++; continue; } if (c === '|' && d === 0) { out.push(cur); cur = ''; continue; } cur += c; } out.push(cur); return out; };
    // Einträge {{see|…}}, {{do|…}} und {{listing|type=see|…}} aus dem Wikitext eines Wikivoyage-Artikels
    const rtWvParse = (text) => {
      const res = []; const re = /\{\{\s*(see|do|listing|marker)\s*\|/gi; let m;
      while ((m = re.exec(text || ''))) {
        let d = 0, k = m.index; for (; k < text.length - 1; k++) { if (text[k] === '{' && text[k + 1] === '{') { d++; k++; } else if (text[k] === '}' && text[k + 1] === '}') { d--; k++; if (d === 0) break; } }
        const body = text.slice(m.index + 2, k - 1); re.lastIndex = k;
        const parts = rtWvSplit(body), p = {}; parts.slice(1).forEach((x) => { const e = x.indexOf('='); if (e > 0) p[x.slice(0, e).trim().toLowerCase()] = x.slice(e + 1).trim(); });
        let type = m[1].toLowerCase(); if (type === 'listing' || type === 'marker') type = String(p.type || '').toLowerCase();
        if (type !== 'see' && type !== 'do') continue;
        const name = rtWvClean(p.name); const lat = parseFloat(p.lat), lon = parseFloat(p.long != null ? p.long : p.lon);
        if (!name) continue;
        res.push({ type, name, lat: Number.isFinite(lat) ? lat : null, lon: Number.isFinite(lon) ? lon : null, url: /^https?:\/\//.test(p.url || '') ? p.url.trim() : '', address: rtWvClean(p.address), hours: rtWvClean(p.hours), price: rtWvClean(p.price), content: rtWvClean(p.content || p.description) });
      }
      return res;
    };
    let SUG_CACHE = null; // überlebt Tab-Wechsel innerhalb der Sitzung

    const catLabelOf = (t) => {
      if (t.tourism === 'viewpoint') return 'Aussichtspunkt';
      if (t.tourism === 'attraction') return 'Sehenswürdigkeit';
      if (t.tourism === 'museum') return 'Museum';
      if (t.tourism === 'gallery') return 'Galerie';
      if (t.tourism === 'zoo') return 'Zoo';
      if (t.tourism === 'aquarium') return 'Aquarium';
      if (t.tourism === 'theme_park') return 'Freizeitpark';
      if (t.leisure === 'water_park') return 'Wasserpark';
      if (t.leisure === 'nature_reserve' || t.boundary === 'national_park') return 'Naturschutzgebiet';
      if (t.natural === 'beach') return 'Strand';
      if (t.natural === 'spring' || t.natural === 'hot_spring') return 'Quelle';
      if (t.natural === 'waterfall') return 'Wasserfall';
      if (t.natural === 'peak') return 'Berg / Gipfel';
      if (t.natural === 'cave_entrance') return 'Höhle';
      if (t.natural === 'arch') return 'Felsbogen';
      if (t.natural === 'geyser') return 'Geysir';
      if (t.man_made === 'lighthouse' || t.historic === 'lighthouse') return 'Leuchtturm';
      if (t.man_made === 'pier') return 'Pier';
      if (t.amenity === 'theatre') return 'Theater';
      if (t.amenity === 'arts_centre') return 'Kulturzentrum';
      if (t.amenity === 'planetarium') return 'Planetarium';
      if (t.leisure === 'garden') return 'Garten';
      if (t.shop === 'mall') return 'Mall / Einkaufszentrum';
      if (t.shop === 'department_store') return 'Kaufhaus';
      if (t.shop === 'outlet') return 'Outlet';
      if (t.amenity === 'marketplace') return 'Markt';
      if (t.amenity === 'restaurant') return 'Restaurant';
      if (t.amenity === 'fast_food') return 'Fastfood';
      if (t.amenity === 'cafe') return 'Café';
      if (t.historic) return 'Historisch';
      return 'Ort';
    };
    const projDist = (p, a, b) => {
      const k = Math.cos(a[0] * Math.PI / 180), R = 111320;
      const ax = a[1] * k * R, ay = a[0] * R, bx = b[1] * k * R, by = b[0] * R, px = p[1] * k * R, py = p[0] * R;
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
      return { d: Math.hypot(px - (ax + t * dx), py - (ay + t * dy)), t, seg: Math.sqrt(l2) };
    };
    const alongRoute = (p, coords) => {
      let best = { d: Infinity, pos: 0 }, acc = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        const r = projDist(p, coords[i], coords[i + 1]);
        if (r.d < best.d) best = { d: r.d, pos: acc + r.t * r.seg };
        acc += r.seg;
      }
      return { d: best.d, pos: best.pos, total: acc };
    };
    const thinCoords = (coords, max = 45) => {
      if (coords.length <= max) return coords;
      const out = []; const step = (coords.length - 1) / (max - 1);
      for (let i = 0; i < max; i++) out.push(coords[Math.round(i * step)]);
      return out;
    };
    const fetchJsonTimeout = async (url, opts, ms) => {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), ms);
      try { const r = await fetch(url, { ...opts, signal: ctl.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
      finally { clearTimeout(to); }
    };
    const newItemId = () => `sug-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const WIKI_API = 'https://en.wikipedia.org/w/api.php';
    const WIKI_EXCLUDE = /\b(school|college|university|census-designated|unincorporated community|neighborhood|neighbourhood|politician|footballer|player|singer|actor|actress|company|corporation|church|synagogue|hospital|interchange|highway|expressway|railway|railroad|station|television|album|film|band|newspaper)\b/i;
    const WIKI_RULES = {
      sight: /attraction|landmark|lighthouse|tower|observation|viewpoint|monument|memorial|plaza|pier|boardwalk|promenade|waterfront|market|shopping|entertainment|resort|bridge|street|mall/i,
      museum: /museum|gallery|art center|arts center|cultural|library|theat(er|re)|performing arts|science center|exhibit|planetarium|heritage/i,
      fun: /zoo|aquarium|theme park|amusement|water park|botanical|garden|marine|wildlife|adventure|space center|observatory|speedway|attraction/i,
      nature: /beach|park|preserve|reserve|refuge|sanctuary|island|\bkeys?\b|spring|nature|swamp|everglades|bay|lake|river|trail|forest|mangrove|reef|\bcay\b|lagoon|national|state|wildlife/i,
      history: /historic|fort|castle|house|mansion|plantation|ruins|mound|archaeolog|lighthouse|memorial|courthouse|district|hotel|estate|villa|cemetery|battle|site|national register|building|landmark/i,
      shop: /shopping (mall|center|centre|district|plaza)|\bmall\b|outlet|department store|marketplace|\bmarket\b|boutique|retail/i,
      food: /restaurant|diner|fast.?food|caf[eé]|bakery|\bpub\b|grill|pizzeria|burger|steakhouse|eatery|barbecue|brewery/i
    };
    const WIKI_LABELS = [[/fast.?food|burger/i, 'Fastfood'], [/restaurant|diner|steakhouse|eatery|grill|pizzeria/i, 'Restaurant'], [/caf[eé]|bakery|coffee/i, 'Café / Bäckerei'], [/shopping (mall|center|centre)|\bmall\b|outlet|department store/i, 'Mall / Shopping'], [/aquarium/i, 'Aquarium'], [/zoo\b/i, 'Zoo'], [/theme park|amusement/i, 'Freizeitpark'], [/water park/i, 'Wasserpark'], [/museum/i, 'Museum'], [/gallery/i, 'Galerie'], [/lighthouse/i, 'Leuchtturm'], [/pier|boardwalk/i, 'Pier / Promenade'], [/beach/i, 'Strand'], [/state park|national park|preserve|reserve|refuge|sanctuary/i, 'Naturschutzgebiet / Park'], [/botanical|garden/i, 'Garten'], [/\bpark\b/i, 'Park'], [/island|\bkeys?\b|\bcay\b/i, 'Insel'], [/fort|castle/i, 'Fort / Burg'], [/historic|house|mansion|plantation|estate|villa|district|site/i, 'Historisch'], [/theat(er|re)|performing/i, 'Theater / Kultur'], [/bridge/i, 'Brücke'], [/spring/i, 'Quelle'], [/market|shopping|retail|boutique/i, 'Markt / Shopping'], [/memorial|monument/i, 'Denkmal']];
    const wikiCatLabel = (desc) => { for (const [re, lab] of WIKI_LABELS) if (re.test(desc || '')) return lab; return desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : 'Ort'; };
    const sampleAlong = (coords, stepM) => {
      const out = [coords[0]]; let acc = 0, next = stepM;
      for (let i = 0; i < coords.length - 1; i++) {
        const seg = haversineM(coords[i], coords[i + 1]);
        while (seg > 0 && acc + seg >= next) { const t = (next - acc) / seg; out.push([coords[i][0] + (coords[i + 1][0] - coords[i][0]) * t, coords[i][1] + (coords[i + 1][1] - coords[i][1]) * t]); next += stepM; }
        acc += seg;
      }
      const last = coords[coords.length - 1];
      if (haversineM(out[out.length - 1], last) > stepM * 0.3) out.push(last);
      return out;
    };
    const runPool = async (items, n, fn) => {
      const res = new Array(items.length).fill(null); let i = 0;
      const worker = async () => { while (i < items.length) { const idx = i++; try { res[idx] = await fn(items[idx], idx); } catch (e) { res[idx] = null; } } };
      await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
      return res;
    };

    const DETAIL_CACHE = new Map(); // key -> { extract, lang, image, url } | { pending } | { failed }
    const loadDetails = async (items) => {
      const need = items.filter((s) => s.key.startsWith('wp-') && !DETAIL_CACHE.has(s.key));
      if (!need.length) return false;
      need.forEach((s) => DETAIL_CACHE.set(s.key, { pending: true }));
      const batches = []; for (let i = 0; i < need.length; i += 20) batches.push(need.slice(i, i + 20));
      await runPool(batches, 3, async (batch) => {
        const ids = batch.map((s) => s.key.slice(3));
        let j = null;
        try { j = await fetchJsonTimeout(`${WIKI_API}?action=query&pageids=${ids.join('%7C')}&prop=extracts%7Cpageimages%7Clanglinks&exintro=1&explaintext=1&exsentences=5&exlimit=20&piprop=thumbnail&pithumbsize=520&pilimit=20&lllang=de&lllimit=100&format=json&formatversion=2&origin=*`, {}, 15000); }
        catch (e) { batch.forEach((s) => DETAIL_CACHE.set(s.key, { failed: true })); return; }
        const byId = new Map((((j.query || {}).pages) || []).map((p) => [String(p.pageid), p]));
        const deMap = new Map(); // deTitle -> [keys]
        batch.forEach((s) => {
          const p = byId.get(s.key.slice(3)) || {};
          DETAIL_CACHE.set(s.key, { extract: (p.extract || '').replace(/\s*\n+\s*/g, ' ').trim(), lang: 'en', image: p.thumbnail ? p.thumbnail.source : '', url: s.website || '' });
          const de = p.langlinks && p.langlinks[0] && p.langlinks[0].title;
          if (de) { if (!deMap.has(de)) deMap.set(de, []); deMap.get(de).push(s.key); }
        });
        if (!deMap.size) return;
        try {
          const titles = [...deMap.keys()];
          const dj = await fetchJsonTimeout(`https://de.wikipedia.org/w/api.php?action=query&titles=${titles.map(encodeURIComponent).join('%7C')}&prop=extracts&exintro=1&explaintext=1&exsentences=5&exlimit=20&redirects=1&format=json&formatversion=2&origin=*`, {}, 15000);
          const q = dj.query || {};
          const norm = new Map((q.normalized || []).map((x) => [x.from, x.to])); const redir = new Map((q.redirects || []).map((x) => [x.from, x.to]));
          const byTitle = new Map((q.pages || []).map((p) => [p.title, p]));
          titles.forEach((t) => {
            const n = norm.get(t) || t; const r = redir.get(n) || n; const p = byTitle.get(r);
            const ex = p && p.extract ? p.extract.replace(/\s*\n+\s*/g, ' ').trim() : '';
            if (ex) deMap.get(t).forEach((k) => { const c = DETAIL_CACHE.get(k) || {}; DETAIL_CACHE.set(k, { ...c, extract: ex, lang: 'de', url: `https://de.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, '_'))}` }); });
          });
        } catch (e) { /* englischer Text bleibt */ }
      });
      return true;
    };

    function SuggestionPanel({ trip, onSave, onState, focusKey, onFocusKey, onFlyTo }) {
      const stages = trip.stages || [];
      const hotelGps = (s) => (s && s.hotel ? parseGps(s.hotel.gps) : null);
      const firstWithHotel = Math.max(0, stages.findIndex((s) => hotelGps(s)));
      const init = SUG_CACHE || {};
      const [stageIdx, setStageIdx] = useState(init.stageIdx != null && stages[init.stageIdx] ? init.stageIdx : firstWithHotel);
      const [radius, setRadius] = useState(init.radius || 5);
      const [maxDetour, setMaxDetour] = useState(init.maxDetour != null ? init.maxDetour : 0);
      const [known, setKnown] = useState(init.known != null ? init.known : false);
      const [cats, setCats] = useState({ sight: true, museum: true, fun: true, nature: true, history: true, shop: false, food: false, ...(init.cats || {}) });
      const [results, setResults] = useState(init.results || []);
      const [routeInfo, setRouteInfo] = useState(init.routeInfo || null);
      const [busy, setBusy] = useState(false);
      const [msg, setMsg] = useState('');
      const [progress, setProgress] = useState('');
      const [ctrlOpen, setCtrlOpen] = useState(!((init.results || []).length));
      const [openCards, setOpenCards] = useState(() => new Set());
      const [detailVer, setDetailVer] = useState(0);
      const mountedRef = useRef(true);
      useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
      const [useOsm, setUseOsm] = useState(init.useOsm != null ? init.useOsm : true);
      const [shown, setShown] = useState(15);
      const [sortBy, setSortBy] = useState('pos');
      const saved = trip.savedSuggestions || [];

      useEffect(() => { SUG_CACHE = { stageIdx, radius, maxDetour, known, cats, results, routeInfo, useOsm }; onState({ results, routeInfo, stageIdx }); }, [stageIdx, radius, maxDetour, known, cats, results, routeInfo, useOsm]);

      const stage = stages[stageIdx];
      const B = hotelGps(stage);
      const A = stageIdx > 0 ? hotelGps(stages[stageIdx - 1]) : null;
      const nameOf = (s) => (s && s.hotel && s.hotel.name) || (s && s.toCity) || '';

      const existingPoints = () => {
        const arr = [];
        if (B) arr.push({ name: nameOf(stage), gps: B });
        (stage.routeToHotel?.stopsOnWay || []).forEach((x) => arr.push({ name: x.name, gps: parseGps(x.gps) }));
        (stage.localAttractions || []).forEach((x) => arr.push({ name: x.name, gps: parseGps(x.gps) }));
        return arr;
      };

      const search = async () => {
        if (!B) { setMsg('Für diese Etappe sind keine Hotel-Koordinaten hinterlegt.'); return; }
        const active = Object.keys(SUG_CATS).filter((k) => cats[k]);
        if (!active.length) { setMsg('Bitte mindestens eine Kategorie wählen.'); return; }
        setBusy(true); setMsg(''); setResults([]); setShown(15);
        const notes = [];
        try {
          // 1) Strecke Hotel → Hotel
          let coords = null, straight = false;
          if (A) {
            try {
              setProgress('Strecke wird berechnet …');
              const j = await fetchJsonTimeout(`https://router.project-osrm.org/route/v1/driving/${A[1]},${A[0]};${B[1]},${B[0]}?overview=full&geometries=geojson`, {}, 12000);
              if (j.code === 'Ok' && j.routes && j.routes[0]) coords = j.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
            } catch (e) { /* Fallback unten */ }
            if (!coords) { coords = [A, B]; straight = true; }
          } else { coords = [B, B]; }
          const ri = { coords, straight, A, B, hasA: !!A };
          const R = Math.round(radius * 1000);
          const cands = [];

          // 2a) Wikipedia-Geosuche (schnell, bekannte Orte)
          setProgress('Wikipedia-Suche …');
          const rEff = Math.min(R, 10000);
          let samples;
          if (A) {
            let totalLen = 0; for (let i = 0; i < coords.length - 1; i++) totalLen += haversineM(coords[i], coords[i + 1]);
            samples = sampleAlong(coords, Math.max(rEff * 1.5, totalLen / 80, 1500));
          } else samples = [B];
          let wikiFail = 0;
          const geoRes = await runPool(samples, 4, async (pt, idx) => {
            const url = `${WIKI_API}?action=query&list=geosearch&gscoord=${pt[0].toFixed(5)}%7C${pt[1].toFixed(5)}&gsradius=${Math.max(10, rEff)}&gslimit=500&format=json&formatversion=2&origin=*`;
            try { return await fetchJsonTimeout(url, {}, 15000); } catch (e) { return await fetchJsonTimeout(url, {}, 15000); }
          });
          const pages = new Map();
          geoRes.forEach((r) => { if (!r) { wikiFail += 1; return; } ((r.query && r.query.geosearch) || []).forEach((g) => pages.set(g.pageid, { pageid: g.pageid, title: g.title, gps: [g.lat, g.lon] })); });
          if (wikiFail === samples.length) throw new Error('Wikipedia-Suche nicht erreichbar');
          if (wikiFail) notes.push(`${wikiFail} von ${samples.length} Suchpunkten entlang der Strecke konnten nicht abgefragt werden`);
          // nur Orte nahe der Strecke behalten, dann Beschreibungen holen
          let near = [...pages.values()].map((p) => ({ ...p, d: A ? alongRoute(p.gps, coords).d : haversineM(p.gps, B) })).filter((p) => p.d <= R * 1.05).sort((a, b) => a.d - b.d).slice(0, 600);
          setProgress(`Beschreibungen laden (${near.length} Orte) …`);
          const batches = []; for (let i = 0; i < near.length; i += 50) batches.push(near.slice(i, i + 50));
          const descRes = await runPool(batches, 4, async (batch) => {
            const url = `${WIKI_API}?action=query&pageids=${batch.map((p) => p.pageid).join('%7C')}&prop=description%7Cinfo&inprop=url&format=json&formatversion=2&origin=*`;
            try { return await fetchJsonTimeout(url, {}, 15000); } catch (e) { return await fetchJsonTimeout(url, {}, 15000); }
          });
          const info = new Map(); let descFail = 0;
          descRes.forEach((r) => { if (!r) { descFail += 1; return; } ((r.query && r.query.pages) || []).forEach((pg) => info.set(pg.pageid, pg)); });
          if (descFail) notes.push('Einige Beschreibungen fehlen, dadurch können Orte fehlen');
          near.forEach((p) => {
            const pg = info.get(p.pageid) || {}; const desc = pg.description || '';
            const matched = active.some((k) => WIKI_RULES[k].test(`${desc} ${p.title}`));
            const bizOk = active.some((k) => (k === 'shop' || k === 'food') && WIKI_RULES[k].test(desc));
            if (WIKI_EXCLUDE.test(desc) && !bizOk) return;
            if (!matched && (known || RT_WIKI_PLACE.test(desc) || RT_WIKI_PLACE.test(p.title))) return;
            cands.push({ key: `wp-${p.pageid}`, name: p.title, gps: p.gps, catLabel: matched ? wikiCatLabel(desc) : (desc ? wikiCatLabel(desc) : 'Ort von Interesse'), isKnown: true, rank: matched ? 3 : 1, address: '', website: pg.fullurl || '', src: 'Wikipedia' });
          });

          // 2a') Wikivoyage: Abschnitte „See“ und „Do“ der Orte an der Strecke, nicht kritisch
          const wvCats = active.filter((k) => k !== 'shop' && k !== 'food');
          if (wvCats.length) {
            try {
              setProgress('Wikivoyage-Reiseführer …');
              const wvPts = A ? [B, ...sampleAlong(coords, Math.max(30000, R * 4)).filter((pt) => haversineM(pt, B) > 8000)] : [B];
              const geo = await runPool(wvPts.slice(0, 24), 4, async (pt) => fetchJsonTimeout(`${WV_API}?action=query&list=geosearch&gscoord=${pt[0].toFixed(5)}%7C${pt[1].toFixed(5)}&gsradius=10000&gslimit=3&gsnamespace=0&format=json&formatversion=2&origin=*`, {}, 12000));
              const titles = []; geo.forEach((r) => ((r && r.query && r.query.geosearch) || []).forEach((g) => { if (!titles.includes(g.title)) titles.push(g.title); }));
              if (geo.every((r) => !r)) notes.push('Wikivoyage nicht erreichbar');
              const pagesWv = await runPool(titles.slice(0, 8), 4, async (t) => { const j = await fetchJsonTimeout(`${WV_API}?action=parse&page=${encodeURIComponent(t)}&prop=wikitext&redirects=1&format=json&formatversion=2&origin=*`, {}, 15000); return { t, text: (j && j.parse && j.parse.wikitext) || '' }; });
              let noGps = 0;
              pagesWv.forEach((pg) => {
                if (!pg) return;
                rtWvParse(pg.text).forEach((l, li) => {
                  if (l.lat == null || l.lon == null) { noGps += 1; return; }
                  const txt = `${l.name} ${l.content}`;
                  const hit = wvCats.filter((k) => WIKI_RULES[k] && WIKI_RULES[k].test(txt));
                  if (l.type === 'do' ? !(wvCats.includes('fun') || wvCats.includes('nature') || hit.length) : !(hit.length || wvCats.includes('sight'))) return;
                  const lab = hit.length ? wikiCatLabel(l.content || l.name) : (l.type === 'do' ? 'Aktivität' : 'Sehenswert');
                  const wvUrl = `https://en.wikivoyage.org/wiki/${encodeURIComponent(pg.t.replace(/ /g, '_'))}`;
                  cands.push({ key: `wv-${pg.t}-${li}`, name: l.name, gps: [l.lat, l.lon], catLabel: /^(Ort|.{40,})$/.test(lab) ? (l.type === 'do' ? 'Aktivität' : 'Sehenswert') : lab, isKnown: true, rank: 3, address: l.address, website: l.url, wvUrl, wvTitle: pg.t, src: 'Wikivoyage', extract: `${[l.content, l.price ? `Preis: ${l.price}` : '', l.hours ? `Öffnungszeiten: ${l.hours}` : ''].filter(Boolean).join(' · ')} (Quelle: Wikivoyage, ${wvUrl}, CC BY-SA)`, tags: { description: [l.content, l.price ? `Preis: ${l.price}` : ''].filter(Boolean).join(' · '), opening_hours: l.hours } });
                });
              });
              if (noGps) notes.push(`Wikivoyage: ${noGps} Einträge ohne Koordinaten nicht berücksichtigt`);
            } catch (e) { notes.push('Wikivoyage-Suche fehlgeschlagen'); }
          }

          // 2b) Optional: OpenStreetMap (Overpass), nicht kritisch
          const osmActive = useOsm ? active : active.filter((k) => k === 'shop' || k === 'food');
          if (osmActive.length) {
            try {
              const wd = known ? '["wikidata"]' : '';
              const makeBody = (geo) => {
                const clausesFor = (k) => SUG_CATS[k].q.flatMap((q) => { const base = (w) => `nw${q}${w}["name"](around:${R},${geo});`; if (k === 'shop') return [base('')]; if (k === 'food') return known ? [base('["wikidata"]'), base('["brand:wikidata"]')] : [base('')]; return [base(wd)]; });
                return `[out:json][timeout:25];(${osmActive.flatMap(clausesFor).join('')});out tags center qt 300;`;
              };
              const thin = A ? thinCoords(coords, 64) : [B];
              const chunks = [];
              if (!A) chunks.push(`${B[0]},${B[1]}`);
              else { const size = 8; for (let st = 0; st < thin.length - 1; st += size - 1) { const part = thin.slice(st, st + size); if (part.length >= 2) chunks.push(part.map((c) => `${c[0].toFixed(5)},${c[1].toFixed(5)}`).join(',')); } }
              const merged = new Map(); let failed = 0; const t0 = Date.now();
              let doneC = 0;
              setProgress(`OpenStreetMap: ${chunks.length} Abschnitte …`);
              await runPool(chunks, 3, async (chunk, ci) => {
                if (Date.now() - t0 > 90000 || (failed >= 3 && merged.size === 0)) { failed += 1; return; }
                let d = null;
                for (let ui = 0; ui < OVERPASS_URLS.length && !d; ui++) { const url = OVERPASS_URLS[(ci + ui) % OVERPASS_URLS.length]; try { d = await fetchJsonTimeout(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(makeBody(chunk)) }, 15000); } catch (e) { /* nächster Server */ } }
                if (d) (d.elements || []).forEach((el) => merged.set(`${el.type}-${el.id}`, el)); else failed += 1;
                doneC += 1; setProgress(`OpenStreetMap: ${doneC} von ${chunks.length} Abschnitten …`);
              });
              if (failed) notes.push(`OpenStreetMap: ${failed} von ${chunks.length} Abschnitten nicht erreichbar (Dienst überlastet)`);
              merged.forEach((el) => {
                const t = el.tags || {}; const lat = el.lat != null ? el.lat : el.center && el.center.lat, lon = el.lon != null ? el.lon : el.center && el.center.lon;
                const name = t['name:de'] || t.name; if (lat == null || lon == null || !name) return;
                const addr = [[t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' '), t['addr:city']].filter(Boolean).join(', ');
                cands.push({ key: `osm-${el.type}-${el.id}`, name, gps: [lat, lon], catLabel: catLabelOf(t), isKnown: !!(t.wikidata || t.wikipedia), rank: (t.wikidata || t.wikipedia) ? 3 : 2, address: addr, website: t.website || t['contact:website'] || '', src: 'OpenStreetMap', tags: { description: t['description:de'] || t.description || '', opening_hours: t.opening_hours || '', cuisine: t.cuisine || '' } });
              });
            } catch (e) { notes.push('OpenStreetMap-Zusatzsuche fehlgeschlagen'); }
          }
          setProgress('');

          // 3) Abstände, Umweg, Filter
          const exist = existingPoints();
          const savedKeys = new Set(saved.map((x) => x.id));
          const seen = new Set();
          let list = cands.map((c) => {
            const ar = A ? alongRoute(c.gps, coords) : { d: haversineM(c.gps, B), pos: 0, total: 0 };
            const detourKm = 2 * (ar.d / 1000) * 1.35;
            const distToB = haversineM(c.gps, B);
            return { ...c, tags: c.tags || {}, distM: ar.d, pos: ar.pos, total: ar.total, detourKm, detourMin: detourKm / 55 * 60, distToB, nearDest: distToB <= 8000 };
          })
            .filter((s) => s.distM <= R * 1.05)
            .filter((s) => !maxDetour || s.detourMin <= maxDetour)
            .filter((s) => !savedKeys.has(s.key))
            .filter((s) => !exist.some((e) => (e.name && e.name.trim().toLowerCase() === s.name.trim().toLowerCase()) || (e.gps && haversineM(e.gps, s.gps) < 120)))
            .sort((a, b) => (a.src === b.src ? 0 : a.src === 'Wikipedia' ? -1 : 1))
            .filter((s) => {
              const k = s.name.toLowerCase(); if (seen.has(k)) return false;
              for (const o of seen.near || []) { if (haversineM(o.gps, s.gps) < 150) return false; }
              seen.add(k); (seen.near = seen.near || []).push(s); return true;
            });
          list.sort((a, b) => ((b.rank || 2) - (a.rank || 2)) || (a.distM - b.distM));
          list = list.slice(0, 150);
          setRouteInfo(ri); setResults(list); if (list.length) setCtrlOpen(false);
          const extra = notes.length ? notes.join('. ') + '. Zum Ergänzen einfach erneut suchen. ' : '';
          if (!list.length) setMsg(extra + 'Keine passenden Orte gefunden. Vergrößere den Umkreis, wähle mehr Kategorien oder schalte „nur bekannte Orte“ aus.'); else if (extra) setMsg(extra);
        } catch (e) { setMsg('Suche fehlgeschlagen: ' + (e && e.name === 'AbortError' ? 'Zeitüberschreitung' : (e && e.message) || e) + '. Bitte Internetverbindung prüfen und erneut versuchen.'); }
        finally { setBusy(false); setProgress(''); }
      };

      const dtext = (s) => { const ex = s.extract || ((DETAIL_CACHE.get(s.key) || {}).extract) || ''; return ex ? ex.slice(0, 600) + ' — ' : ''; };
      const mkWay = (s) => ({ id: newItemId(), name: s.name, time: '', duration: '', address: s.address || '', gps: `${s.gps[0].toFixed(6)},${s.gps[1].toFixed(6)}`, costEur: 0, notes: `${dtext(s)}Vorschlag (${s.src || 'Karte'}, ${s.catLabel}), ca. ${Math.round(s.detourKm || 0)} km Umweg${s.website ? ' · ' + s.website : ''}` });
      const mkLocal = (s) => ({ id: newItemId(), name: s.name, category: s.catLabel, time: '', booked: '', priceEur: 0, address: s.address || '', gps: `${s.gps[0].toFixed(6)},${s.gps[1].toFixed(6)}`, notes: `${dtext(s)}Vorschlag (${s.src || 'Karte'})${s.website ? ' · ' + s.website : ''}` });
      const upd = (stageId, fn, text) => onSave({ ...trip, stages: stages.map((x) => (x.id === stageId ? fn(x) : x)) }, text);
      const addWay = (s, stId = stage.id) => upd(stId, (x) => ({ ...x, routeToHotel: { ...(x.routeToHotel || {}), stopsOnWay: [...((x.routeToHotel || {}).stopsOnWay || []), mkWay(s)] } }), `„${s.name}“ als Stopp auf dem Weg übernommen`);
      const addLocal = (s, stId = stage.id) => upd(stId, (x) => ({ ...x, localAttractions: [...(x.localAttractions || []), mkLocal(s)] }), `„${s.name}“ zu den Aktionen vor Ort hinzugefügt`);
      const toSavedEntry = (s) => ({ id: s.key, name: s.name, catLabel: s.catLabel, gps: `${s.gps[0].toFixed(6)},${s.gps[1].toFixed(6)}`, address: s.address || '', website: s.website || '', fromStageId: stage.id, detourKm: Math.round(s.detourKm), savedAt: new Date().toISOString(), extract: ((DETAIL_CACHE.get(s.key) || {}).extract || '').slice(0, 600), image: (DETAIL_CACHE.get(s.key) || {}).image || '' });
      const drop = (key) => setResults((r) => r.filter((x) => x.key !== key));
      const keep = (s) => { onSave({ ...trip, savedSuggestions: [...saved.filter((x) => x.id !== s.key), toSavedEntry(s)] }, `„${s.name}“ in der Merkliste gespeichert`); drop(s.key); };
      const keepRest = () => { const rest = sorted.map(toSavedEntry); const ids = new Set(rest.map((x) => x.id)); onSave({ ...trip, savedSuggestions: [...saved.filter((x) => !ids.has(x.id)), ...rest] }, `${rest.length} Vorschläge in der Merkliste gespeichert`); setResults([]); };

      const sorted = [...results].sort((a, b) => (sortBy === 'pos' ? a.pos - b.pos : sortBy === 'detour' ? a.distM - b.distM : ((b.rank || 2) - (a.rank || 2)) || (a.distM - b.distM)));
      useEffect(() => {
        loadDetails(sorted.slice(0, shown)).then((changed) => { if (changed && mountedRef.current) setDetailVer((v) => v + 1); });
      }, [results, shown, sortBy]);
      const fromSaved = (e, mode, stId) => {
        const gp = parseGps(e.gps); const s = { name: e.name, catLabel: e.catLabel, gps: gp, address: e.address, website: e.website, detourKm: e.detourKm || 0, extract: e.extract, src: 'Merkliste' };
        const stTarget = stId || e.fromStageId || stage.id;
        const fn = (x) => (mode === 'way' ? { ...x, routeToHotel: { ...(x.routeToHotel || {}), stopsOnWay: [...((x.routeToHotel || {}).stopsOnWay || []), mkWay(s)] } } : { ...x, localAttractions: [...(x.localAttractions || []), mkLocal(s)] });
        onSave({ ...trip, savedSuggestions: saved.filter((x) => x.id !== e.id), stages: stages.map((x) => (x.id === stTarget ? fn(x) : x)) }, `„${e.name}“ übernommen`);
      };
      const [savedStage, setSavedStage] = useState({});
      const chipBtn = (on, label, onClick) => (<button type="button" onClick={onClick} aria-pressed={on} className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-bold ${on ? 'bg-teal-600 text-white border-teal-700' : 'bg-white text-slate-500 border-slate-300'}`}>{label}</button>);

      const settingsSummary = `Etappe ${stageIdx + 1} · bis ${radius} km · ${maxDetour ? `Umweg ≤ ${maxDetour} Min.` : 'Umweg egal'} · ${Object.keys(SUG_CATS).filter((k) => cats[k]).length} von ${Object.keys(SUG_CATS).length} Kategorien${known ? ' · nur bekannte' : ''}${useOsm ? ' · + OSM' : ''}`;
      const toggleCard = (k) => setOpenCards((prev) => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
      return (
        <section className="bg-white rounded-2xl border-2 border-teal-300 p-3 sm:p-4 space-y-3 min-h-full" aria-label="Vorschläge entlang der Etappe">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Vorschläge von Hotel zu Hotel</h3>
              <p className="text-[11px] text-slate-500">Entlang der Strecke (Wikipedia, optional OpenStreetMap; braucht Internet). Du entscheidest pro Ort.</p>
            </div>
            <button type="button" onClick={() => setCtrlOpen((v) => !v)} aria-expanded={ctrlOpen} className="min-h-[40px] shrink-0 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold">{ctrlOpen ? '▲ Zuklappen' : '⚙ Einstellungen'}</button>
          </div>
          {ctrlOpen ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Etappe
                  <select value={stageIdx} onChange={(e) => { setStageIdx(Number(e.target.value)); setResults([]); setRouteInfo(null); setMsg(''); }} className="mt-1 w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold">
                    {stages.map((s, i) => <option key={s.id} value={i} disabled={!hotelGps(s)}>{i + 1}. {i > 0 && hotelGps(stages[i - 1]) ? nameOf(stages[i - 1]) : (s.fromCity || 'Start')} → {nameOf(s) || s.toCity}{!hotelGps(s) ? ' (keine Koordinaten)' : ''}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-700">Umkreis um die Strecke
                  <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="mt-1 w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold">
                    {[2, 5, 10, 20, 30].map((r) => <option key={r} value={r}>bis {r} km neben der Strecke</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-700">Maximaler Umweg (geschätzt)
                  <select value={maxDetour} onChange={(e) => setMaxDetour(Number(e.target.value))} className="mt-1 w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold">
                    <option value={0}>egal</option>{[10, 20, 30, 45, 60].map((m) => <option key={m} value={m}>höchstens +{m} Min.</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Sortierung
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="mt-1 w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold">
                    <option value="pos">Reihenfolge entlang der Strecke</option>
                    <option value="detour">Geringster Umweg zuerst</option>
                    <option value="known">Bekannteste zuerst</option>
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(SUG_CATS).map((k) => <React.Fragment key={k}>{chipBtn(cats[k], SUG_CATS[k].label, () => setCats((c) => ({ ...c, [k]: !c[k] })))}</React.Fragment>)}
                {chipBtn(known, '★ nur bekannte Orte', () => setKnown((v) => !v))}
                {chipBtn(useOsm, '＋ OpenStreetMap mitsuchen', () => setUseOsm((v) => !v))}
                {(cats.shop || cats.food) && !useOsm && <span className="text-[11px] text-slate-500 self-center">Mall / Restaurant werden automatisch über OpenStreetMap gesucht.</span>}
              </div>
              {!A && B && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">Für diese Etappe gibt es keinen Start-Hotelpunkt. Gesucht wird deshalb im Umkreis um das Hotel (passend für „Aktionen vor Ort“).</p>}
            </>
          ) : (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2">{settingsSummary}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 sticky top-0 z-10 bg-white py-1.5">
            <button type="button" disabled={busy || !B} onClick={search} className="min-h-[44px] px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold disabled:opacity-50">{busy ? (progress || 'Suche läuft …') : 'Vorschläge suchen'}</button>
            {results.length > 0 && <button type="button" onClick={keepRest} className="min-h-[44px] px-3 py-2 rounded-lg border border-slate-400 text-xs font-semibold">Alle {sorted.length} merken</button>}
            {results.length > 0 && <button type="button" onClick={() => setResults([])} className="min-h-[44px] px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold">Leeren</button>}
          </div>
          {msg && <div role="status" className="rounded-lg bg-amber-50 border border-amber-300 p-2 text-sm text-amber-950">{msg}</div>}
          {routeInfo && routeInfo.straight && results.length > 0 && <p className="text-[11px] text-amber-800">Die Straßenroute war nicht abrufbar, die Abstände beziehen sich auf die Luftlinie zwischen den Hotels.</p>}
          {sorted.length > 0 && <p className="text-xs text-slate-600">{sorted.length} Vorschläge · Umweg = grobe Schätzung (Hin und zurück, ca. 55 km/h).</p>}

          <ul className="space-y-3">
            {sorted.slice(0, shown).map((s) => {
              const dt = DETAIL_CACHE.get(s.key) || null;
              const extract = (dt && dt.extract) || (s.tags && s.tags.description) || '';
              const isOpen = openCards.has(s.key);
              const link = (dt && dt.url) || s.website;
              return (
                <li key={s.key} id={`sug-card-${s.key}`} className={`rounded-xl border overflow-hidden ${focusKey === s.key ? 'border-teal-600 ring-2 ring-teal-300 bg-teal-50' : 'border-slate-200 bg-slate-50'}`}>
                  {dt && dt.image && <img src={dt.image} alt={s.name} loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-full h-32 object-cover bg-slate-200" />}
                  <div className="p-3 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 break-words">{s.isKnown ? '★ ' : ''}{s.name}</div>
                        <div className="text-xs text-slate-600">{s.catLabel}{A && s.total ? ` · bei km ${Math.round(s.pos / 1000)} von ${Math.round(s.total / 1000)}` : ''} · {(s.distM / 1000).toFixed(1)} km neben der Strecke · Umweg ca. +{Math.max(1, Math.round(s.detourKm))} km / +{Math.max(1, Math.round(s.detourMin))} Min.</div>
                        <div className="text-[11px] text-slate-500">{(s.distToB / 1000).toFixed(1)} km vom Ziel-Hotel · Empfehlung: <b>{s.nearDest ? 'Aktion vor Ort' : 'Stopp auf dem Weg'}</b></div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button type="button" onClick={() => { onFocusKey(s.key); onFlyTo(s.gps); }} className="min-h-[36px] px-2 rounded-lg border border-slate-300 bg-white text-xs"><Ic n="pin" />Karte</button>
                        <a href={getGoogleMapsUrl(`${s.gps[0]},${s.gps[1]}`, s.address, s.name)} target="_blank" rel="noopener noreferrer" className="min-h-[36px] inline-flex items-center px-2 rounded-lg border border-slate-300 bg-white text-xs">Maps</a>
                      </div>
                    </div>
                    {extract ? (
                      <div>
                        <p className="text-xs text-slate-700 leading-relaxed" style={isOpen ? undefined : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{extract}</p>
                        <button type="button" onClick={() => toggleCard(s.key)} className="text-[11px] font-semibold text-teal-700 underline">{isOpen ? 'weniger anzeigen' : 'mehr lesen'}</button>
                        {dt && dt.lang === 'en' && <span className="text-[10px] text-slate-400"> · Text auf Englisch</span>}
                      </div>
                    ) : (s.key.startsWith('wp-') && (!dt || dt.pending) ? <p className="text-xs text-slate-400">Beschreibung wird geladen …</p> : null)}
                    {s.tags && s.tags.cuisine && <div className="text-[11px] text-slate-600">🍽 {String(s.tags.cuisine).replace(/;/g, ', ').replace(/_/g, ' ')}</div>}
                    {s.tags && s.tags.opening_hours && <div className="text-[11px] text-slate-600">{s.tags.opening_hours}</div>}
                    {s.address && <div className="text-[11px] text-slate-500"><Ic n="pin" />{s.address}</div>}
                    {link && <a href={link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-teal-700 underline break-all">{s.src === 'Wikipedia' ? 'Wikipedia-Artikel öffnen' : 'Webseite öffnen'}</a>}
                    {s.wvUrl && <div className="text-[11px] text-slate-500" data-wv-src>Text: <a href={s.wvUrl} target="_blank" rel="noopener noreferrer" className="text-teal-700 underline">Wikivoyage, {s.wvTitle}</a> (CC BY-SA) · Text auf Englisch</div>}
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => { addWay(s); drop(s.key); }} className="min-h-[40px] px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">Auf dem Weg zum Hotel</button>
                      <button type="button" onClick={() => { addLocal(s); drop(s.key); }} className="min-h-[40px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">Aktion vor Ort</button>
                      <button type="button" onClick={() => keep(s)} className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-400 bg-white text-xs font-semibold">Merken</button>
                      <button type="button" onClick={() => drop(s.key)} className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-500">Ausblenden</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {sorted.length > shown && <button type="button" onClick={() => setShown((n) => n + 15)} className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold">Mehr anzeigen ({sorted.length - shown})</button>}

          <div className="border-t border-slate-200 pt-3 space-y-2">
            <h4 className="text-sm font-bold text-slate-900">Merkliste ({saved.length})</h4>
            {saved.length === 0 && <p className="text-xs text-slate-500">Hier landen Orte, die du „merken“ willst. Du kannst sie später einer Etappe zuordnen.</p>}
            {saved.map((e) => (
              <div key={e.id} className="rounded-xl border border-violet-200 bg-violet-50 p-2.5 space-y-2">
                <div className="flex gap-2">
                  {e.image && <img src={e.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={(ev) => { ev.currentTarget.style.display = 'none'; }} className="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-200" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0"><div className="text-sm font-bold break-words">{e.name}</div><div className="text-xs text-slate-600">{e.catLabel}{e.detourKm ? ` · Umweg war ca. +${e.detourKm} km` : ''}</div></div>
                      <div className="flex gap-1.5"><button type="button" onClick={() => { const gp = parseGps(e.gps); if (gp) onFlyTo(gp); }} className="min-h-[36px] px-2 rounded-lg border border-slate-300 bg-white text-xs"><Ic n="pin" />Karte</button><button type="button" aria-label="Aus Merkliste entfernen" onClick={() => onSave({ ...trip, savedSuggestions: saved.filter((x) => x.id !== e.id) }, 'Aus Merkliste entfernt')} className="min-h-[36px] px-2 rounded-lg border border-rose-300 text-rose-700 bg-white text-xs">✕</button></div>
                    </div>
                    {e.extract && <p className="text-[11px] text-slate-600 mt-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.extract}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select aria-label="Etappe für diesen Ort" value={savedStage[e.id] || e.fromStageId || stage.id} onChange={(ev) => setSavedStage((m) => ({ ...m, [e.id]: ev.target.value }))} className="min-h-[40px] px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs">
                    {stages.map((s, i) => <option key={s.id} value={s.id}>Etappe {i + 1}: {s.toCity}</option>)}
                  </select>
                  <button type="button" onClick={() => fromSaved(e, 'way', savedStage[e.id])} className="min-h-[40px] px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">Auf dem Weg</button>
                  <button type="button" onClick={() => fromSaved(e, 'local', savedStage[e.id])} className="min-h-[40px] px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">Vor Ort</button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">Texte und Bilder: Wikipedia / Wikimedia Commons (Lizenzen siehe Artikel). Ortsdaten: Wikipedia, OpenStreetMap-Mitwirkende.</p>
        </section>
      );
    }

    function RoadtripMap({ trip, onSave }) {
      const stages = trip.stages || [];
      const elRef = useRef(null);
      const mapRef = useRef(null);
      const groupRef = useRef(null);
      const routeGroupRef = useRef(null);
      const markersRef = useRef({});
      const tilesRef = useRef(null);
      const errCountRef = useRef(0);
      const lastFitRef = useRef('');
      const planRef = useRef(false);
      const [show, setShow] = useState({ hotel: true, parking: true, attr: true, stop: true, saved: true, route: true });
      const sugGroupRef = useRef(null);
      const [sugState, setSugState] = useState({ results: [], routeInfo: null, stageIdx: null });
      const [focusSug, setFocusSug] = useState(null);
      const [stageFilter, setStageFilter] = useState('all');
      const [tilesFailed, setTilesFailed] = useState(false);
      const [libMissing, setLibMissing] = useState(false);
      const [mapStyle, setMapStyle] = useState(() => { try { const v = localStorage.getItem('roadtrip_map_style_v2'); return MAP_STYLES[v] ? v : 'esri'; } catch (e) { return 'esri'; } });
      const [planMode, setPlanMode] = useState(false);
      const [sel, setSel] = useState([]);            // Keys der gewählten Punkte in Reihenfolge
      const [route, setRoute] = useState(null);      // { status, coords, legs, dist, dur, fallback }

      const points = useMemo(() => {
        const out = [];
        (stages || []).forEach((s, i) => {
          const h = s.hotel || {};
          const hg = parseGps(h.gps);
          const stageLabel = `${s.fromCity || ''} → ${s.toCity || ''}`;
          if (hg) out.push({ key: `h-${s.id}`, type: 'hotel', stageIdx: i, stageId: s.id, name: h.name || s.toCity || 'Hotel', stageLabel, address: h.address, gps: hg, raw: h.gps, sub: s.dateRange });
          const pg = parseGps(h.parkingGarageGps);
          if (pg && (!hg || Math.abs(pg[0] - hg[0]) + Math.abs(pg[1] - hg[1]) > 0.0003)) out.push({ key: `p-${s.id}`, type: 'parking', stageIdx: i, stageId: s.id, name: h.parkingGarageName || 'Parkhaus', stageLabel, address: h.parkingGarageAddress, gps: pg, raw: h.parkingGarageGps });
          (s.localAttractions || []).forEach((a, j) => {
            const ag = parseGps(a.gps);
            if (ag) out.push({ key: `a-${s.id}-${a.id || j}`, type: 'attr', stageIdx: i, stageId: s.id, name: a.name || 'Ziel', stageLabel, address: a.address, gps: ag, raw: a.gps, sub: [a.category, a.time].filter(Boolean).join(' · ') });
          });
          (s.routeToHotel?.stopsOnWay || []).forEach((a, j) => {
            const ag = parseGps(a.gps);
            if (ag) out.push({ key: `w-${s.id}-${a.id || j}`, type: 'stop', stageIdx: i, stageId: s.id, name: a.name || 'Stopp', stageLabel, address: a.address, gps: ag, raw: a.gps, sub: a.time || '' });
          });
        });
        return out;
      }, [stages]);
      const byKey = useMemo(() => Object.fromEntries(points.map((p) => [p.key, p])), [points]);
      const selPoints = sel.map((k) => byKey[k]).filter(Boolean);
      const visible = points.filter((p) => show[p.type] && (stageFilter === 'all' || String(p.stageIdx) === stageFilter));

      useEffect(() => { planRef.current = planMode; }, [planMode]);
      // Auswahl bereinigen, wenn Punkte verschwinden (z. B. Hotel gelöscht)
      useEffect(() => { setSel((s) => s.filter((k) => byKey[k])); }, [byKey]);

      const toggleSel = (key) => setSel((s) => s.includes(key) ? s.filter((k) => k !== key) : [...s, key]);

      // Karte einmalig anlegen
      useEffect(() => {
        if (!window.L) { setLibMissing(true); return; }
        const L = window.L;
        const map = L.map(elRef.current, { zoomControl: true, attributionControl: true }).setView([27.5, -81.6], 7);
        groupRef.current = L.layerGroup().addTo(map);
        routeGroupRef.current = L.layerGroup().addTo(map);
        sugGroupRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        setTimeout(() => map.invalidateSize(), 150);
        return () => { map.remove(); mapRef.current = null; groupRef.current = null; routeGroupRef.current = null; sugGroupRef.current = null; tilesRef.current = null; markersRef.current = {}; };
      }, []);

      // Kartenstil
      useEffect(() => {
        const L = window.L; const map = mapRef.current;
        if (!L || !map) return;
        if (tilesRef.current) { map.removeLayer(tilesRef.current); tilesRef.current = null; }
        const st = MAP_STYLES[mapStyle] || MAP_STYLES.esri;
        errCountRef.current = 0; setTilesFailed(false);
        const tiles = L.tileLayer(st.url, { ...st.opts, attribution: st.attr });
        tiles.on('tileerror', () => { errCountRef.current += 1; if (errCountRef.current >= 3) setTilesFailed(true); });
        tiles.on('tileload', () => { errCountRef.current = 0; setTilesFailed(false); });
        tiles.addTo(map); tiles.bringToBack();
        tilesRef.current = tiles;
        try { localStorage.setItem('roadtrip_map_style_v2', mapStyle); } catch (e) {}
      }, [mapStyle]);

      // Marker zeichnen
      const fitKey = `${stageFilter}|${show.hotel}|${show.parking}|${show.attr}|${show.stop}|${points.length}`;
      useEffect(() => {
        const L = window.L; const map = mapRef.current; const group = groupRef.current;
        if (!L || !map || !group) return;
        group.clearLayers(); markersRef.current = {};
        const mk = (p) => {
          const order = sel.indexOf(p.key);
          const ring = order >= 0 ? 'outline:3px solid #dc2626;outline-offset:2px;' : '';
          const badge = order >= 0 ? `<span style="position:absolute;top:-11px;right:-11px;min-width:18px;height:18px;padding:0 3px;border-radius:9px;background:#dc2626;color:#fff;border:2px solid #fff;font:800 11px/14px system-ui;text-align:center">${String.fromCharCode(65 + (order % 26))}</span>` : '';
          let html, size;
          if (p.type === 'hotel') { size = 30; html = `<div style="position:relative;width:30px;height:30px;border-radius:50%;background:#0f172a;color:#fff;border:3px solid #3b82f6;display:flex;align-items:center;justify-content:center;font:800 13px system-ui;box-shadow:0 2px 6px rgba(0,0,0,.4);${ring}">${p.stageIdx + 1}${badge}</div>`; }
          else if (p.type === 'parking') { size = 24; html = `<div style="position:relative;width:24px;height:24px;border-radius:6px;background:#9333ea;color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font:800 13px system-ui;box-shadow:0 2px 5px rgba(0,0,0,.4);${ring}">P${badge}</div>`; }
          else if (p.type === 'stop') { size = 24; html = `<div style="position:relative;width:24px;height:24px;border-radius:6px;background:#0f766e;color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font:13px system-ui;box-shadow:0 2px 5px rgba(0,0,0,.4);${ring}">🚩${badge}</div>`; }
          else { size = 18; html = `<div style="position:relative;width:18px;height:18px;border-radius:50%;background:#f59e0b;color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font:700 10px system-ui;box-shadow:0 1px 4px rgba(0,0,0,.4);${ring}">★${badge}</div>`; }
          const marker = L.marker(p.gps, { icon: L.divIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] }), title: p.name, zIndexOffset: order >= 0 ? 900 : p.type === 'hotel' ? 500 : p.type === 'parking' ? 200 : 0 });
          if (planMode) {
            marker.on('click', () => toggleSel(p.key));
          } else {
            const typeLabel = p.type === 'hotel' ? 'Hotel' : p.type === 'parking' ? '🅿️ Parken' : p.type === 'stop' ? 'Stopp auf dem Weg' : '📍 Ziel';
            marker.bindPopup(`<div style="min-width:180px;font:13px system-ui"><div style="font-weight:800;font-size:14px">${escHtml(p.name)}</div><div style="color:#475569">${typeLabel} · Etappe ${p.stageIdx + 1}</div><div style="color:#64748b;font-size:12px">${escHtml(p.stageLabel)}</div>${p.sub ? `<div style="font-size:12px">${escHtml(p.sub)}</div>` : ''}${p.address ? `<div style="margin-top:4px;font-style:italic">${escHtml(p.address)}</div>` : ''}<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><a href="${escHtml(getGoogleMapsUrl(p.raw, p.address, p.name))}" target="_blank" rel="noopener noreferrer" style="background:#2563eb;color:#fff;padding:6px 10px;border-radius:8px;text-decoration:none;font-weight:700">Google Maps</a><a href="${escHtml(getAppleMapsUrl(p.raw, p.address, p.name))}" target="_blank" rel="noopener noreferrer" style="background:#0f172a;color:#fff;padding:6px 10px;border-radius:8px;text-decoration:none;font-weight:700">Apple Maps</a></div></div>`);
          }
          markersRef.current[p.key] = marker;
          marker.addTo(group);
        };
        if (show.route && stageFilter === 'all') {
          const hotels = points.filter((p) => p.type === 'hotel');
          if (hotels.length > 1) L.polyline(hotels.map((p) => p.gps), { color: '#2563eb', weight: 3, opacity: 0.6, dashArray: '6 8' }).addTo(group);
        }
        visible.forEach(mk);
        if (lastFitRef.current !== fitKey) {
          lastFitRef.current = fitKey;
          if (visible.length === 1) map.setView(visible[0].gps, 13);
          else if (visible.length > 1) map.fitBounds(L.latLngBounds(visible.map((p) => p.gps)), { padding: [34, 34], maxZoom: 14 });
        }
      }, [fitKey, show.route, stages, sel, planMode]);

      // Route berechnen (OSRM, Fallback Luftlinie)
      const selKey = sel.join('|');
      useEffect(() => {
        if (selPoints.length < 2) { setRoute(null); return; }
        const ctl = new AbortController();
        const pts = selPoints.map((p) => p.gps);
        const straight = (why) => {
          const legs = []; for (let i = 0; i < pts.length - 1; i++) legs.push({ dist: haversineM(pts[i], pts[i + 1]), dur: null });
          setRoute({ status: 'fallback', why, coords: pts, legs, dist: legs.reduce((a, l) => a + l.dist, 0), dur: null });
        };
        setRoute((r) => ({ ...(r || {}), status: 'loading', coords: (r && r.coords) || pts, legs: (r && r.legs) || [], dist: r ? r.dist : 0, dur: r ? r.dur : null }));
        const timer = setTimeout(async () => {
          try {
            const to = setTimeout(() => ctl.abort(), 12000);
            const coordStr = pts.map((c) => `${c[1]},${c[0]}`).join(';');
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=false`, { signal: ctl.signal });
            clearTimeout(to);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const j = await res.json();
            if (j.code !== 'Ok' || !j.routes || !j.routes[0]) throw new Error(j.message || j.code || 'keine Route');
            const r0 = j.routes[0];
            setRoute({ status: 'ok', coords: r0.geometry.coordinates.map((c) => [c[1], c[0]]), legs: r0.legs.map((l) => ({ dist: l.distance, dur: l.duration })), dist: r0.distance, dur: r0.duration });
          } catch (e) { if (!ctl.signal.aborted || true) straight(e && e.message); }
        }, 450);
        return () => { clearTimeout(timer); ctl.abort(); };
      }, [selKey, byKey]);

      // Route zeichnen
      useEffect(() => {
        const L = window.L; const map = mapRef.current; const rg = routeGroupRef.current;
        if (!L || !map || !rg) return;
        rg.clearLayers();
        if (!route || !route.coords || selPoints.length < 2) return;
        const dashed = route.status !== 'ok';
        const line = L.polyline(route.coords, { color: '#dc2626', weight: dashed ? 4 : 5, opacity: 0.9, dashArray: dashed ? '2 8' : null, lineCap: 'round' }).addTo(rg);
        if (route.status !== 'loading') map.fitBounds(line.getBounds(), { padding: [40, 40], maxZoom: 14 });
      }, [route && route.status, route && route.coords]);

      useEffect(() => {
        const L = window.L; const g = sugGroupRef.current;
        if (!L || !g) return;
        g.clearLayers();
        const ri = sugState.routeInfo;
        if (ri && ri.coords && ri.hasA) L.polyline(ri.coords, { color: '#0d9488', weight: 4, opacity: 0.65 }).addTo(g);
        sugState.results.forEach((s) => {
          const on = focusSug === s.key; const sz = on ? 30 : 22;
          const m = L.marker(s.gps, { icon: L.divIcon({ className: '', html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:#0d9488;color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font:800 ${on ? 16 : 13}px system-ui;box-shadow:0 2px 6px rgba(0,0,0,.45)">+</div>`, iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2] }), title: s.name, zIndexOffset: on ? 1000 : 300 });
          m.bindTooltip(escHtml(s.name));
          m.on('click', () => { setFocusSug(s.key); const el = document.getElementById('sug-card-' + s.key); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
          m.addTo(g);
        });
        if (show.saved) (trip.savedSuggestions || []).forEach((e) => {
          const gp = parseGps(e.gps); if (!gp) return;
          const m = L.marker(gp, { icon: L.divIcon({ className: '', html: '<div style="width:20px;height:20px;border-radius:5px;background:#7c3aed;color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font:11px system-ui;box-shadow:0 1px 4px rgba(0,0,0,.4)">🔖</div>', iconSize: [20, 20], iconAnchor: [10, 10] }), title: e.name });
          m.bindTooltip(escHtml(e.name)); m.addTo(g);
        });
      }, [sugState, focusSug, show.saved, trip.savedSuggestions]);
      useEffect(() => {
        const L = window.L; const map = mapRef.current; const ri = sugState.routeInfo;
        if (!L || !map || !ri || !sugState.results.length) return;
        const pts = [...(ri.coords || []), ...sugState.results.map((s) => s.gps)];
        map.fitBounds(L.latLngBounds(pts), { padding: [34, 34], maxZoom: 13 });
      }, [sugState.routeInfo]);
      const flyTo = (gps) => { const map = mapRef.current; if (!map) return; elRef.current && elRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); map.setView(gps, Math.max(map.getZoom(), 12), { animate: true }); };

      const focusPoint = (p) => {
        const map = mapRef.current; const mk = markersRef.current[p.key];
        if (!map || !mk) return;
        elRef.current && elRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        map.setView(p.gps, Math.max(map.getZoom(), 13), { animate: true });
        mk.openPopup();
      };
      const move = (i, d) => setSel((s) => { const j = i + d; if (j < 0 || j >= s.length) return s; const n = [...s]; [n[i], n[j]] = [n[j], n[i]]; return n; });
      const gmapsRouteUrl = () => {
        const c = selPoints.map((p) => `${p.gps[0]},${p.gps[1]}`);
        if (c.length < 2) return '#';
        const mid = c.slice(1, -1).slice(0, 9);
        return `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${c[0]}&destination=${c[c.length - 1]}${mid.length ? `&waypoints=${mid.join('%7C')}` : ''}`;
      };
      const toggle = (k) => setShow((v) => ({ ...v, [k]: !v[k] }));
      const chip = (k, label, color) => (
        <button type="button" key={k} onClick={() => toggle(k)} aria-pressed={show[k]} className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-xs font-bold ${show[k] ? 'text-white border-transparent' : 'bg-white text-slate-500 border-slate-300'}`} style={show[k] ? { background: color } : undefined}>{label}</button>
      );
      const countBy = (t) => points.filter((p) => p.type === t).length;
      const letter = (i) => String.fromCharCode(65 + (i % 26));

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] gap-4 items-stretch">
          <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 self-start lg:self-stretch">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Routenkarte</h2>
                <p className="text-xs text-slate-500">{visible.length} von {points.length} Orten sichtbar · {planMode ? 'Marker antippen = zur Route hinzufügen/entfernen' : 'Antippen zeigt Details und Navigation'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value)} aria-label="Kartenstil wählen" className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold">
                  {Object.keys(MAP_STYLES).map((k) => <option key={k} value={k}>{MAP_STYLES[k].label}</option>)}
                </select>
                <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} aria-label="Etappe wählen" className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold">
                  <option value="all">Alle Etappen</option>
                  {(stages || []).map((s, i) => <option key={s.id} value={String(i)}>{i + 1}. {s.toCity || s.fromCity}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {chip('hotel', `Hotels (${countBy('hotel')})`, '#0f172a')}
              {chip('parking', `🅿️ Parken (${countBy('parking')})`, '#9333ea')}
              {chip('attr', `★ Ziele (${countBy('attr')})`, '#d97706')}
              {chip('stop', `Stopps (${countBy('stop')})`, '#0f766e')}
              {chip('saved', `Merkliste (${(trip.savedSuggestions || []).length})`, '#7c3aed')}
              {chip('route', '┅ Hotelroute', '#2563eb')}
              <button type="button" onClick={() => setPlanMode((v) => !v)} aria-pressed={planMode} className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-xs font-bold ${planMode ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-200' : 'bg-white text-red-700 border-red-400'}`}>{planMode ? '✔ Punkte wählen: AN' : 'Eigene Route planen'}</button>
            </div>
            {libMissing && <div className="rounded-lg bg-rose-50 border border-rose-300 p-3 text-sm text-rose-900">Das Kartenmodul konnte nicht geladen werden. Die Orte stehen unten in der Liste.</div>}
            {tilesFailed && <div className="rounded-lg bg-amber-50 border border-amber-300 p-2 text-xs text-amber-900">Kartenkacheln nicht erreichbar (offline oder Anbieter gesperrt?). Orte und Route werden trotzdem angezeigt. Versuche oben einen anderen Kartenstil.</div>}
            <div ref={elRef} role="application" aria-label="Interaktive Routenkarte" style={{ position: 'relative', zIndex: 0, isolation: 'isolate', height: 'clamp(380px, calc(100vh - 440px), 720px)', background: '#dbeafe', borderRadius: '16px', overflow: 'hidden', cursor: planMode ? 'crosshair' : undefined }} />
            <p className="text-[11px] text-slate-500">Blau gestrichelt: Hotels in Reihenfolge (Luftlinie). Rot: deine gewählte Route.</p>
          </section>
          <div className="relative">
            <div className="max-h-[85vh] overflow-y-auto rounded-2xl lg:max-h-none lg:absolute lg:inset-0">
              <SuggestionPanel trip={trip} onSave={onSave} onState={setSugState} focusKey={focusSug} onFocusKey={setFocusSug} onFlyTo={flyTo} />
            </div>
          </div>
          </div>

          {(planMode || sel.length > 0) && (
            <section className="bg-white rounded-2xl border-2 border-red-300 p-4 sm:p-5 space-y-3" aria-label="Eigene Route">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">Eigene Route ({sel.length} {sel.length === 1 ? 'Punkt' : 'Punkte'})</h3>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={sel.length < 2} onClick={() => setSel((s) => [...s].reverse())} className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold disabled:opacity-40">⇅ Umkehren</button>
                  <button type="button" disabled={!sel.length} onClick={() => setSel([])} className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold disabled:opacity-40">✕ Zurücksetzen</button>
                  <a href={gmapsRouteUrl()} target="_blank" rel="noopener noreferrer" aria-disabled={sel.length < 2} className={`min-h-[40px] inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold ${sel.length < 2 ? 'opacity-40 pointer-events-none' : ''}`}>In Google Maps öffnen</a>
                </div>
              </div>
              {sel.length < 2 && <p className="text-sm text-slate-600">Wähle mindestens zwei Punkte (Marker auf der Karte oder in der Ortsliste unten antippen). Die Reihenfolge ist A, B, C … und lässt sich hier ändern.</p>}
              {selPoints.length > 0 && (
                <ol className="space-y-1.5">
                  {selPoints.map((p, i) => (
                    <li key={p.key}>
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">{letter(i)}</span>
                        <span className="min-w-0 flex-1 text-sm font-semibold truncate">{typeIcon(p.type)}{p.name}<span className="text-xs font-normal text-slate-500"> · Etappe {p.stageIdx + 1}</span></span>
                        <button type="button" aria-label="Nach oben" disabled={i === 0} onClick={() => move(i, -1)} className="w-9 h-9 rounded border border-slate-300 disabled:opacity-30">↑</button>
                        <button type="button" aria-label="Nach unten" disabled={i === selPoints.length - 1} onClick={() => move(i, 1)} className="w-9 h-9 rounded border border-slate-300 disabled:opacity-30">↓</button>
                        <button type="button" aria-label="Entfernen" onClick={() => toggleSel(p.key)} className="w-9 h-9 rounded border border-rose-300 text-rose-700">✕</button>
                      </div>
                      {route && route.legs && route.legs[i] && i < selPoints.length - 1 && selPoints.length > 1 && (
                        <div className="ml-3 pl-5 border-l-2 border-red-300 py-1 text-xs text-slate-600">↓ {fmtKm(route.legs[i].dist)}{route.legs[i].dur != null ? ` · ${fmtDur(route.legs[i].dur)}` : ''}</div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {route && sel.length >= 2 && (
                <div className={`rounded-xl p-3 text-sm ${route.status === 'ok' ? 'bg-emerald-50 border border-emerald-300 text-emerald-950' : route.status === 'loading' ? 'bg-slate-50 border border-slate-300 text-slate-700' : 'bg-amber-50 border border-amber-300 text-amber-950'}`}>
                  {route.status === 'loading' && <span>Route wird berechnet …</span>}
                  {route.status === 'ok' && <span><b>Gesamt: {fmtKm(route.dist)} · ca. {fmtDur(route.dur)}</b> reine Fahrzeit mit dem Auto (ohne Pausen und Verkehr).</span>}
                  {route.status === 'fallback' && <span><b>Luftlinie: {fmtKm(route.dist)}.</b> Die Straßenroute konnte nicht berechnet werden (offline oder Routingdienst nicht erreichbar). Mit „In Google Maps öffnen“ bekommst du die echte Route.</span>}
                </div>
              )}
              {sel.length > 11 && <p className="text-xs text-amber-800">Hinweis: Google Maps nimmt höchstens 9 Zwischenpunkte, weitere werden dort weggelassen.</p>}
            </section>
          )}

          <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Orte ({planMode ? 'antippen = zur Route hinzufügen' : 'antippen = auf Karte zeigen'})</h3>
            {(stages || []).map((s, i) => {
              const list = visible.filter((p) => p.stageIdx === i);
              if (!list.length) return null;
              return (
                <div key={s.id} className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700">Etappe {i + 1} · {s.fromCity} → {s.toCity}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((p) => {
                      const o = sel.indexOf(p.key);
                      return (
                        <button type="button" key={p.key} onClick={() => (planMode ? toggleSel(p.key) : focusPoint(p))} className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs text-left ${o >= 0 ? 'ring-2 ring-red-500 ' : ''}${p.type === 'hotel' ? 'bg-[#1F4E8C] text-white border-[#1F4E8C] font-bold' : p.type === 'parking' ? 'bg-purple-50 text-purple-900 border-purple-300' : p.type === 'stop' ? 'bg-teal-50 text-teal-950 border-teal-300' : 'bg-amber-50 text-amber-950 border-amber-300'}`}>{o >= 0 ? `${letter(o)} · ` : ''}{typeIcon(p.type)}{p.name}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {!visible.length && <div className="text-sm text-slate-500">Keine Orte mit Koordinaten für diese Auswahl.</div>}
          </section>
        </div>
      );
    }

    