// ===== Online-Funktionen: Wetter, Strand & Meer, Wo bin ich, In der Nähe, Wechselkurs, Teilen =====
    const fetchJsonT = async (url, ms = 12000) => { const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms); try { const r = await fetch(url, { signal: ac.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } catch (e) { if (e && e.name === 'AbortError') throw new Error('Zeitüberschreitung'); throw e; } finally { clearTimeout(t); } };
    const lsGetJ = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const lsSetJ = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    const mapsLink = (lat, lon, label) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}${label ? '&destination_place_id=&travelmode=driving' : ''}`;
    const fmtDist = (m) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',')} km`);
    const WMO = (c) => c === 0 ? ['☀️', 'Klar'] : c === 1 ? ['🌤', 'Überwiegend klar'] : c === 2 ? ['⛅', 'Wechselhaft'] : c === 3 ? ['☁️', 'Bedeckt'] : (c === 45 || c === 48) ? ['🌫', 'Nebel'] : (c >= 51 && c <= 57) ? ['🌦', 'Nieselregen'] : (c >= 61 && c <= 67) ? ['🌧', 'Regen'] : (c >= 71 && c <= 77) ? ['🌨', 'Schnee'] : (c >= 80 && c <= 82) ? ['🌦', 'Schauer'] : (c === 85 || c === 86) ? ['🌨', 'Schneeschauer'] : c === 95 ? ['⛈', 'Gewitter'] : (c === 96 || c === 99) ? ['⛈', 'Gewitter, Hagel'] : ['🌡', '–'];
    const stageLoc = (s) => parseGps(s && s.hotel && s.hotel.gps) || parseGps(((s && s.routeToHotel && s.routeToHotel.stopsOnWay) || []).map((x) => x.gps).find(Boolean));
    const WX_KEY = 'roadtrip_wx_v1';
    const wxStore = {
      data: lsGetJ(WX_KEY) || {}, listeners: new Set(), loading: false, error: '', last: null,
      set(p) { Object.assign(this, p); this.listeners.forEach((f) => f()); },
      key(l) { return `${l[0].toFixed(2)},${l[1].toFixed(2)}`; },
      get(stage, iso) {
        const l = stageLoc(stage); if (!l) return null; const e = this.data[this.key(l)]; if (!e || !e.daily[iso]) return null;
        return { ...e.daily[iso], ...(e.sea && e.sea[iso] ? e.sea[iso] : {}) };
      },
      entry(stage) { const l = stageLoc(stage); return l ? this.data[this.key(l)] : null; },
      async ensure(trip, force) {
        const locs = new Map(); (trip.stages || []).forEach((s) => { const l = stageLoc(s); if (l) locs.set(this.key(l), l); });
        const todo = [...locs.entries()].filter(([k]) => force || !this.data[k] || Date.now() - this.data[k].fetchedAt > 3 * 3600 * 1000);
        if (!todo.length || this.loading || !navigator.onLine) return; this.set({ loading: true, error: '' }); let fails = 0;
        await Promise.all(todo.map(async ([k, l]) => {
          try {
            const [fc, mr] = await Promise.all([
              fetchJsonT(`https://api.open-meteo.com/v1/forecast?latitude=${l[0]}&longitude=${l[1]}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=auto&forecast_days=16`),
              fetchJsonT(`https://marine-api.open-meteo.com/v1/marine?latitude=${l[0]}&longitude=${l[1]}&hourly=sea_surface_temperature&daily=wave_height_max&timezone=auto&forecast_days=8`).catch(() => null)
            ]);
            const d = fc.daily || {}; const daily = {};
            (d.time || []).forEach((t, i) => { daily[t] = { code: d.weather_code[i], tmax: d.temperature_2m_max[i], tmin: d.temperature_2m_min[i], rain: d.precipitation_probability_max[i], wind: d.wind_speed_10m_max[i], uv: d.uv_index_max[i] }; });
            let sea = null;
            if (mr && mr.hourly && mr.hourly.time) {
              const by = {}; mr.hourly.time.forEach((t, i) => { const v = mr.hourly.sea_surface_temperature[i]; if (v != null) (by[t.slice(0, 10)] = by[t.slice(0, 10)] || []).push(v); });
              const wv = {}; ((mr.daily && mr.daily.time) || []).forEach((t, i) => { wv[t] = mr.daily.wave_height_max[i]; });
              Object.keys(by).forEach((t) => { sea = sea || {}; sea[t] = { sst: by[t].reduce((a, b) => a + b, 0) / by[t].length, wave: wv[t] }; });
            }
            this.data[k] = { fetchedAt: Date.now(), daily, sea };
          } catch (e) { fails++; }
        }));
        lsSetJ(WX_KEY, this.data); this.set({ loading: false, error: fails ? `Wetterdaten für ${fails} Ort(e) konnten nicht geladen werden. Es werden gespeicherte Daten angezeigt.` : '', last: Date.now() });
      }
    };
    function useWx() { const [, f] = useState(0); useEffect(() => { const fn = () => f((x) => x + 1); wxStore.listeners.add(fn); return () => wxStore.listeners.delete(fn); }, []); return wxStore; }
    function WxChip({ stage, iso }) {
      useWx(); const w = wxStore.get(stage, iso); if (!w) return null; const [ic, tx] = WMO(w.code); const f = (c) => Math.round(c * 9 / 5 + 32);
      return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-sky-50 border border-sky-200 px-2 py-1 text-xs text-sky-950" title={`${tx} · ${f(w.tmax)}°F / ${f(w.tmin)}°F`}><span className="text-base">{ic}</span><b>{Math.round(w.tmax)}° / {Math.round(w.tmin)}°</b><span>💧 {w.rain != null ? w.rain + ' %' : '–'}</span><span>💨 {w.wind != null ? Math.round(w.wind) + ' km/h' : '–'}</span>{w.uv != null && <span>☀ UV {Math.round(w.uv)}</span>}{w.sst != null && <span>🌊 Wasser {Math.round(w.sst)}°{w.wave != null ? `, Wellen ${String(w.wave.toFixed(1)).replace('.', ',')} m` : ''}</span>}</div>;
    }
    function RtWxCard({ stage, iso, trip }) {
      const wx = useWx(); const w = wxStore.get(stage, iso);
      if (!w) return (
        <section data-wx-card className="rt3-wx empty">
          <div className="rt3-wx-h"><span>Wetter</span></div>
          <p>{navigator.onLine ? (wx.loading ? 'Wetter wird geladen …' : 'Für diesen Tag liegt noch keine Vorhersage vor (bis 16 Tage im Voraus).') : 'Offline, keine gespeicherte Vorhersage für diesen Tag.'}</p>
          {navigator.onLine && !wx.loading && <button type="button" data-readonly-allow className="v18-btn sm" onClick={() => wxStore.ensure(trip, true)}>Wetter laden</button>}
        </section>
      );
      const [ic, tx] = WMO(w.code); const f = (c) => Math.round(c * 9 / 5 + 32); const uv = w.uv != null ? Math.round(w.uv) : null;
      const tips = []; if (w.rain != null && w.rain >= 50) tips.push('Regenjacke einpacken'); if (uv != null && uv >= 6) tips.push('Sonnenschutz nicht vergessen'); if (w.wind != null && w.wind >= 40) tips.push('Windig, Fenster und Schirm sichern');
      const tile = (k, v, sub) => <div className="rt3-wx-t"><span>{k}</span><b>{v}</b>{sub && <em>{sub}</em>}</div>;
      return (
        <section data-wx-card className="rt3-wx" aria-label="Wetter für diesen Tag">
          <div className="rt3-wx-h"><span>Wetter heute</span><span>{stage.toCity || ''}</span></div>
          <div className="rt3-wx-main">
            <div className="rt3-wx-ic" aria-hidden="true">{ic}</div>
            <div><div className="rt3-wx-temp">{Math.round(w.tmax)}°<small> / {Math.round(w.tmin)}°</small></div><div className="rt3-wx-tx">{tx} · {f(w.tmax)}°F / {f(w.tmin)}°F</div></div>
          </div>
          <div className="rt3-wx-grid">
            {tile('Regen', w.rain != null ? w.rain + ' %' : '–', w.rain != null ? (w.rain >= 60 ? 'wahrscheinlich' : w.rain >= 30 ? 'möglich' : 'gering') : '')}
            {tile('Wind', w.wind != null ? Math.round(w.wind) + ' km/h' : '–', w.wind != null ? (w.wind >= 40 ? 'stark' : w.wind >= 20 ? 'frisch' : 'schwach') : '')}
            {uv != null && tile('UV-Index', uv, uv >= 8 ? 'sehr hoch' : uv >= 6 ? 'hoch' : uv >= 3 ? 'mittel' : 'niedrig')}
            {w.sst != null && tile('Wasser', Math.round(w.sst) + '°', w.wave != null ? 'Wellen ' + String(w.wave.toFixed(1)).replace('.', ',') + ' m' : '')}
          </div>
          {tips.length > 0 && <div className="rt3-wx-tip">{tips.join(' · ')}</div>}
        </section>
      );
    }
    function WeatherView({ trip, todayIso }) {
      const wx = useWx(); const days = useMemo(() => buildDays(trip), [trip]);
      useEffect(() => { wxStore.ensure(trip); }, [(trip.stages || []).length]);
      const stages = trip.stages || [];
      return (
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base sm:text-lg font-bold text-slate-900">🌦 Wetter & Strand</h2>
              <button type="button" data-readonly-allow disabled={wx.loading} onClick={() => wxStore.ensure(trip, true)} className="min-h-[44px] px-4 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50">{wx.loading ? 'Lade …' : '↻ Aktualisieren'}</button></div>
            <p className="text-xs text-slate-500">Vorhersage für den Ort jeder Unterkunft (Open-Meteo), bis 16 Tage im Voraus, Wassertemperatur und Wellen nur an der Küste und bis 8 Tage. Die zuletzt geladenen Daten bleiben offline gespeichert.{wx.last ? ` Zuletzt aktualisiert: ${new Date(wx.last).toLocaleTimeString('de-DE')}.` : ''}</p>
            {!navigator.onLine && <div className="text-xs rounded-lg bg-amber-50 border border-amber-300 p-2">Offline: Es werden gespeicherte Daten gezeigt.</div>}
            {wx.error && <div className="text-xs rounded-lg bg-amber-50 border border-amber-300 p-2">{wx.error}</div>}
          </section>
          {stages.map((s, i) => {
            const ds = days.filter((d) => d.stageIdx === i && d.kind !== 'checkout').concat(days.filter((d) => d.stageIdx === i && d.kind === 'checkout')); const e = wxStore.entry(s);
            const have = ds.filter((d) => wxStore.get(s, d.iso));
            const preview = e && have.length === 0 ? Object.keys(e.daily).sort().slice(0, 3) : [];
            return (
              <section key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="text-sm font-bold text-slate-900">Etappe {i + 1} · {hotelName(s)}{s.toCity && hotelName(s) !== s.toCity ? ` (${s.toCity})` : ''}</div>
                <div className="text-xs text-slate-500">{s.dateRange || ''}</div>
                {!stageLoc(s) && <div className="text-xs text-slate-500">Keine Koordinaten bei dieser Unterkunft hinterlegt.</div>}
                {stageLoc(s) && !e && <div className="text-xs text-slate-500">{wx.loading ? <Skel lines={2} /> : 'Noch keine Wetterdaten geladen.'}</div>}
                {e && have.length === 0 && <div className="text-xs rounded-lg bg-slate-50 border border-slate-200 p-2">Für {s.dateRange || 'diesen Zeitraum'} gibt es noch keine Vorhersage (höchstens 16 Tage voraus). Zur Orientierung: die nächsten Tage am Ort.</div>}
                <div className="space-y-1.5">
                  {have.map((d) => <div key={d.iso} className="space-y-0.5"><div className="text-[11px] font-semibold text-slate-600">{fmtDayShort(d.iso)}</div><WxChip stage={s} iso={d.iso} /></div>)}
                  {preview.map((iso) => <div key={iso} className="space-y-0.5"><div className="text-[11px] font-semibold text-slate-600">{fmtDayShort(iso)} (Vorschau)</div><WxChip stage={s} iso={iso} /></div>)}
                </div>
              </section>
            );
          })}
        </div>
      );
    }

    // ----- Unterwegs: Wo bin ich, In der Nähe, Wechselkurs -----
    const tripPoints = (trip) => {
      const out = [];
      (trip.stages || []).forEach((s, i) => {
        const h = s.hotel || {}; const g = parseGps(h.gps); if (g) out.push({ label: `Hotel: ${h.name || s.toCity}`, gps: g, kind: 'hotel' });
        const pg = parseGps(h.parkingGarageGps); if (pg) out.push({ label: `Parken: ${h.parkingGarageName || h.name || ''}`, gps: pg, kind: 'park' });
        ((s.routeToHotel && s.routeToHotel.stopsOnWay) || []).forEach((st) => { const q = parseGps(st.gps); if (q) out.push({ label: `Stopp: ${st.name}`, gps: q, kind: 'stop' }); });
        (s.localAttractions || []).forEach((a) => { const q = parseGps(a.gps); if (q) out.push({ label: `Aktion: ${a.name}`, gps: q, kind: 'act' }); });
      });
      return out;
    };
    function GeoPanel({ trip, todayIso, onPos }) {
      const [pos, setPos] = useState(null); const [state, setState] = useState('idle'); const [err, setErr] = useState(''); const wid = useRef(null);
      const [route, setRoute] = useState(null); const days = useMemo(() => buildDays(trip), [trip]);
      const stages = trip.stages || []; const [si, setSi] = useState(() => { const d = days.find((x) => x.iso === todayIso); return d ? d.stageIdx : 0; });
      const stop = () => { if (wid.current != null) navigator.geolocation.clearWatch(wid.current); wid.current = null; setState('idle'); };
      useEffect(() => () => { if (wid.current != null) navigator.geolocation.clearWatch(wid.current); }, []);
      const start = () => {
        setErr(''); if (!navigator.geolocation) { setErr('Dieses Gerät unterstützt keine Standortbestimmung.'); return; } setState('wait');
        wid.current = navigator.geolocation.watchPosition((p) => { const v = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, ts: p.timestamp }; setPos(v); onPos(v); setState('on'); }, (e) => { setErr(e.code === 1 ? 'Standortzugriff wurde nicht erlaubt. Bitte in den Browser-Einstellungen für diese Seite erlauben.' : e.code === 3 ? 'Standort konnte nicht rechtzeitig bestimmt werden.' : 'Standort nicht verfügbar.'); setState('idle'); }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
      };
      const target = stages[si]; const tg = target && parseGps(target.hotel && target.hotel.gps);
      const near = useMemo(() => (pos ? tripPoints(trip).map((p) => ({ ...p, d: haversineM([pos.lat, pos.lon], p.gps) })).sort((a, b) => a.d - b.d).slice(0, 6) : []), [pos, trip]);
      const dT = pos && tg ? haversineM([pos.lat, pos.lon], tg) : null;
      const eta = (m) => fmtDurMin(m * 1.3 / 1000 / 80 * 60);
      const exact = async () => { if (!pos || !tg) return; setRoute({ busy: true }); try { const j = await fetchJsonT(`https://router.project-osrm.org/route/v1/driving/${pos.lon},${pos.lat};${tg[1]},${tg[0]}?overview=false`, 12000); const r = j.routes && j.routes[0]; setRoute(r ? { km: r.distance / 1000, min: r.duration / 60 } : { err: 'Keine Route gefunden.' }); } catch (e) { setRoute({ err: 'Routenberechnung nicht erreichbar (offline?).' }); } };
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-base font-bold text-slate-900"><Ic n="pin" />Wo bin ich</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {state === 'idle' ? <button data-readonly-allow type="button" onClick={start} className="min-h-[44px] px-4 rounded-xl bg-blue-600 text-white text-sm font-bold">Standort bestimmen</button> : <button data-readonly-allow type="button" onClick={stop} className="min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold">Stoppen</button>}
            {state === 'wait' && <span className="text-xs text-slate-600">Suche GPS-Signal …</span>}
            {pos && <span className="text-xs text-slate-600">Genauigkeit ca. {Math.round(pos.acc)} m · {new Date(pos.ts).toLocaleTimeString('de-DE')}</span>}
          </div>
          <p className="text-[11px] text-slate-500">Die Standortbestimmung funktioniert auch ohne Internet. Der Standort bleibt auf deinem Gerät und wird nirgends gespeichert.</p>
          {err && <div role="alert" className="text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-900 p-2">{err}</div>}
          {pos && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Ziel-Unterkunft
                <select value={si} onChange={(e) => { setSi(Number(e.target.value)); setRoute(null); }} className="mt-1 w-full min-h-[44px] px-3 rounded-lg border border-slate-300 bg-white text-sm">{stages.map((s, i) => <option key={s.id} value={i}>{i + 1}. {hotelName(s)}</option>)}</select>
              </label>
              {tg ? <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 space-y-1.5">
                <div className="text-sm font-bold text-emerald-950">{hotelName(target)}: {fmtDist(dT)} Luftlinie</div>
                <div className="text-xs text-emerald-900">Fahrzeit grob geschätzt: ca. {eta(dT)}{route && route.km != null ? ` · Route online: ${Math.round(route.km)} km, ${fmtDurMin(route.min)}` : ''}</div>
                {route && route.err && <div className="text-xs text-amber-900">{route.err}</div>}
                <div className="flex flex-wrap gap-2"><NavLink gps={tg} address={target.hotel.address} name={target.hotel.name} label="Navi zum Hotel" /><button data-readonly-allow type="button" disabled={route && route.busy} onClick={exact} className="min-h-[36px] px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold">Genaue Fahrzeit (online)</button></div>
              </div> : <div className="text-xs text-slate-500">Für diese Unterkunft sind keine Koordinaten hinterlegt.</div>}
              <div className="space-y-1.5"><div className="text-xs font-bold text-slate-700">Nächste Ziele deiner Reise</div>
                {near.map((p, i) => <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2"><div className="min-w-0"><div className="text-sm font-semibold break-words">{p.label}</div><div className="text-[11px] text-slate-500">{fmtDist(p.d)} · ca. {eta(p.d)}</div></div><NavLink gps={p.gps} label="" /></div>)}
              </div>
            </div>
          )}
        </section>
      );
    }
    const NEARBY_CATS = [
      { id: 'fuel', label: '⛽ Tankstelle', ov: '["amenity"="fuel"]', nom: 'fuel station' },
      { id: 'super', label: '🛒 Supermarkt', ov: '["shop"~"supermarket|convenience"]', nom: 'supermarket' },
      { id: 'pharm', label: '💊 Apotheke', ov: '["amenity"="pharmacy"]', nom: 'pharmacy' },
      { id: 'wc', label: '🚻 Toilette', ov: '["amenity"="toilets"]', nom: 'toilets' },
      { id: 'food', label: '🍔 Essen', ov: '["amenity"~"fast_food|restaurant|cafe"]', nom: 'restaurant' },
      { id: 'atm', label: '🏧 Geldautomat', ov: '["amenity"="atm"]', nom: 'atm' }
    ];
    const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
    const searchNearby = async (cat, lat, lon, r) => {
      const q = `[out:json][timeout:15];(node${cat.ov}(around:${r},${lat},${lon});way${cat.ov}(around:${r},${lat},${lon}););out center 60;`;
      const ov = () => Promise.any(OVERPASS.map((u) => fetchJsonT(`${u}?data=${encodeURIComponent(q)}`, 16000))).then((j) => (j.elements || []).map((e) => ({ name: (e.tags && (e.tags.name || e.tags.brand || e.tags.operator)) || cat.label.replace(/^\S+\s/, ''), lat: e.lat != null ? e.lat : e.center && e.center.lat, lon: e.lon != null ? e.lon : e.center && e.center.lon, addr: e.tags && [e.tags['addr:street'], e.tags['addr:housenumber']].filter(Boolean).join(' ') })));
      const dl = r / 111000, dlo = r / (111000 * Math.cos(lat * Math.PI / 180));
      const nom = () => fetchJsonT(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=20&bounded=1&q=${encodeURIComponent(cat.nom)}&viewbox=${lon - dlo},${lat + dl},${lon + dlo},${lat - dl}`, 12000).then((j) => j.map((e) => ({ name: e.name || (e.display_name || '').split(',')[0], lat: Number(e.lat), lon: Number(e.lon), addr: '' })));
      let list; try { list = await ov(); } catch (e) { list = await nom(); }
      return list.filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon)).map((x) => ({ ...x, d: haversineM([lat, lon], [x.lat, x.lon]) })).filter((x) => x.d <= r * 1.05).sort((a, b) => a.d - b.d).slice(0, 15);
    };
    function NearbyPanel({ trip, pos }) {
      const stages = trip.stages || []; const [src, setSrc] = useState(pos ? 'gps' : '0'); const [cat, setCat] = useState('fuel'); const [rad, setRad] = useState(3000); const [res, setRes] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
      useEffect(() => { if (pos && src !== 'gps' && !res) setSrc('gps'); }, [!!pos]);
      const center = src === 'gps' ? (pos ? [pos.lat, pos.lon] : null) : stageLoc(stages[Number(src)]);
      const go = async () => { if (!center) { setErr('Kein Standort. Bestimme zuerst deinen Standort oder wähle eine Unterkunft.'); return; } setErr(''); setBusy(true); setRes(null); try { setRes(await searchNearby(NEARBY_CATS.find((c) => c.id === cat), center[0], center[1], rad)); } catch (e) { setErr('Suche nicht möglich. Die Kartenserver sind erreichbar nur mit Internet und manchmal überlastet. Bitte später erneut versuchen.'); } setBusy(false); };
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-base font-bold text-slate-900">In der Nähe</h3>
          <div className="flex flex-wrap gap-1.5">{NEARBY_CATS.map((c) => <button key={c.id} data-readonly-allow type="button" onClick={() => { setCat(c.id); setRes(null); }} className={`min-h-[40px] px-3 rounded-full text-sm font-semibold border ${cat === c.id ? 'bg-[#1F4E8C] text-white border-[#1F4E8C]' : 'bg-white border-slate-300'}`}>{c.label}</button>)}</div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-semibold text-slate-700">Rund um<select value={src} onChange={(e) => { setSrc(e.target.value); setRes(null); }} className="mt-1 w-full min-h-[44px] px-2 rounded-lg border border-slate-300 bg-white text-sm">{pos && <option value="gps">Mein Standort</option>}{!pos && <option value="gps">Mein Standort (erst bestimmen)</option>}{stages.map((s, i) => <option key={s.id} value={String(i)}>Hotel {i + 1}: {hotelName(s)}</option>)}</select></label>
            <label className="text-xs font-semibold text-slate-700">Umkreis<select value={rad} onChange={(e) => { setRad(Number(e.target.value)); setRes(null); }} className="mt-1 w-full min-h-[44px] px-2 rounded-lg border border-slate-300 bg-white text-sm">{[1000, 3000, 5000, 10000].map((r) => <option key={r} value={r}>{r / 1000} km</option>)}</select></label>
          </div>
          <button data-readonly-allow type="button" disabled={busy} onClick={go} className="min-h-[44px] px-4 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50">{busy ? 'Suche …' : 'Suchen'}</button>
          {err && <div role="alert" className="text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-900 p-2">{err}</div>}
          {res && res.length === 0 && <div className="text-sm text-slate-500">Nichts gefunden. Vergrößere den Umkreis.</div>}
          {res && res.map((x, i) => <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2"><div className="min-w-0"><div className="text-sm font-semibold break-words">{x.name}</div><div className="text-[11px] text-slate-500">{fmtDist(x.d)}{x.addr ? ` · ${x.addr}` : ''}</div></div><NavLink gps={[x.lat, x.lon]} label="Navi" /></div>)}
          <p className="text-[11px] text-slate-500">Daten: OpenStreetMap. Die Einträge können unvollständig oder veraltet sein.</p>
        </section>
      );
    }
    const FX_KEY = 'roadtrip_fx_v1';
    function FxPanel({ trip, onSave }) {
      const [fx, setFx] = useState(() => lsGetJ(FX_KEY)); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [eur, setEur] = useState('100');
      const load = async () => {
        setBusy(true); setErr('');
        try {
          const r = await Promise.any([
            fetchJsonT('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD', 10000).then((j) => ({ rate: j.rates.USD, date: j.date, src: 'EZB via Frankfurter' })),
            fetchJsonT('https://open.er-api.com/v6/latest/EUR', 10000).then((j) => ({ rate: j.rates.USD, date: (j.time_last_update_utc || '').slice(5, 16), src: 'open.er-api.com' }))
          ]);
          if (!(r.rate > 0)) throw new Error('bad'); const v = { ...r, fetchedAt: Date.now() }; setFx(v); lsSetJ(FX_KEY, v);
        } catch (e) { setErr('Kurs konnte nicht geladen werden (offline?).' + (fx ? ' Es wird der zuletzt gespeicherte Kurs gezeigt.' : '')); }
        setBusy(false);
      };
      useEffect(() => { if (!fx || Date.now() - fx.fetchedAt > 6 * 3600 * 1000) load(); }, []);
      const cur = Number(trip.meta && trip.meta.exchangeRate) || null; const usd = fx ? (Number(String(eur).replace(',', '.')) || 0) * fx.rate : 0;
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-bold text-slate-900">Wechselkurs</h3><button data-readonly-allow type="button" disabled={busy} onClick={load} className="min-h-[40px] px-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold">{busy ? 'Lade …' : '↻ Aktualisieren'}</button></div>
          {fx ? <div className="space-y-2">
            <div className="text-sm">Aktuell: <b>1 € = {fx.rate.toFixed(4).replace('.', ',')} $</b> <span className="text-xs text-slate-500">({fx.src}, {fx.date}; geladen {new Date(fx.fetchedAt).toLocaleString('de-DE')})</span></div>
            <div className="flex items-center gap-2 flex-wrap"><input data-readonly-allow type="text" inputMode="decimal" value={eur} onChange={(e) => setEur(e.target.value)} className="w-28 min-h-[44px] px-3 rounded-lg border border-slate-300 text-sm" /><span className="text-sm">€ = <b>{usd.toFixed(2).replace('.', ',')} $</b></span></div>
            <div className="text-xs text-slate-600">Kurs im Planer: {cur ? `1 € = ${String(cur).replace('.', ',')} $` : 'nicht gesetzt'}{cur ? ` (Abweichung ${((fx.rate / cur - 1) * 100).toFixed(1).replace('.', ',')} %)` : ''}</div>
            {!IS_READ_ONLY_COPY && <button type="button" onClick={() => onSave({ ...trip, meta: { ...trip.meta, exchangeRate: Math.round(fx.rate * 10000) / 10000 } }, 'Kurs ins Budget übernommen')} className="min-h-[44px] px-4 rounded-xl bg-[#1F4E8C] text-white text-sm font-bold">Als Budget-Kurs übernehmen</button>}
          </div> : <div className="text-sm text-slate-500">{busy ? <Skel lines={2} /> : 'Noch kein Kurs geladen.'}</div>}
          {err && <div className="text-xs rounded-lg bg-amber-50 border border-amber-300 p-2">{err}</div>}
        </section>
      );
    }
    function TripToolsView({ trip, onSave, todayIso }) {
      const [pos, setPos] = useState(null);
      return <div className="space-y-4"><GeoPanel trip={trip} todayIso={todayIso} onPos={setPos} /><NearbyPanel trip={trip} pos={pos} /></div>;
    }

    // ----- Teilen per Link / QR -----
    const b64uEnc = (buf) => { let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
    const b64uDec = (t) => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
    const streamBytes = async (bytes, S) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new S('gzip'))).arrayBuffer());
    const packPlan = async (obj) => b64uEnc(await streamBytes(new TextEncoder().encode(JSON.stringify(obj)), CompressionStream));
    const unpackPlan = async (t) => JSON.parse(new TextDecoder().decode(await streamBytes(b64uDec(t), DecompressionStream)));
    const slimTrip = (trip, opt) => {
      const pick = (o, keys) => { const r = {}; keys.filter(Boolean).forEach((k) => { if (o && o[k] != null && o[k] !== '') r[k] = o[k]; }); return r; };
      const code = opt.codes ? 'bookingCode' : null;
      return {
        meta: { ...pick(trip.meta, ['title', 'startDate', 'endDate', 'tripId', 'exchangeRate', 'schemaVersion', 'version', 'lastUpdated']), slim: true },
        participants: (trip.participants || []).map((p) => pick(p, ['id', 'name', 'color'])),
        stages: (trip.stages || []).map((s, i) => ({
          ...pick(s, ['id', 'fromCity', 'toCity', 'dateRange', 'nights']),
          hotel: pick(s.hotel, ['name', 'address', 'gps', 'checkIn', 'checkOut', 'parkingGarageName', 'parkingGarageAddress', 'parkingGarageGps', code]),
          routeToHotel: { ...pick(s.routeToHotel, ['distanceKm', 'duration']), stopsOnWay: ((s.routeToHotel && s.routeToHotel.stopsOnWay) || []).map((x, j) => ({ id: `r${i}_${j}`, ...pick(x, ['name', 'gps', 'time', 'duration']) })) },
          localAttractions: (s.localAttractions || []).map((a, j) => ({ id: `a${i}_${j}`, ...pick(a, ['name', 'category', 'time', 'gps', 'day']) })),
          ...(s.plan ? { plan: pick(s.plan, ['departTime', 'bufferPct']) } : {})
        })),
        flights: (trip.flights || []).map((f) => pick(f, ['id', 'direction', 'airline', 'flightNumber', 'from', 'to', 'departureDate', 'departureTime', 'arrivalTime', code])),
        rentalCars: (trip.rentalCars || []).map((c) => pick(c, ['id', 'provider', 'carClass', 'pickupLocation', 'pickupDate', 'pickupTime', 'dropoffLocation', 'dropoffDate', 'dropoffTime', code])),
        emergencyContacts: opt.emergency ? (trip.emergencyContacts || []).map((e) => pick(e, ['id', 'organization', 'phone', 'displayPhone'])) : [],
        creditCards: [], customExpenses: [], checklist: []
      };
    };
    const qrSvg = (text) => { try { const q = qrcode(0, 'L'); q.addData(text); q.make(); return q.createSvgTag(4, 2); } catch (e) { return null; } };
    const appBaseUrl = () => (location.protocol === 'file:' ? location.href.split('#')[0] : location.origin + location.pathname);
    function SharePanel({ trip }) {
      const [opt, setOpt] = useState({ codes: false, emergency: true }); const [link, setLink] = useState(''); const [err, setErr] = useState(''); const [copied, setCopied] = useState(false);
      useEffect(() => { let off = false; setLink(''); setErr(''); (async () => { try { if (typeof CompressionStream === 'undefined') throw new Error('Dieser Browser unterstützt die Komprimierung nicht.'); const t = await packPlan(slimTrip(trip, opt)); if (!off) setLink(`${appBaseUrl()}#plan=${t}`); } catch (e) { if (!off) setErr(e.message); } })(); return () => { off = true; }; }, [trip, opt.codes, opt.emergency]);
      const qrPlan = link && link.length <= 2300 ? qrSvg(link) : null; const qrApp = qrSvg(appBaseUrl());
      const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) { setErr('Kopieren nicht möglich. Markiere den Link und kopiere ihn von Hand.'); } };
      const share = async () => { try { await navigator.share({ title: (trip.meta && trip.meta.title) || 'Reiseplan', url: link }); } catch (e) {} };
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-base font-bold text-slate-900">Teilen per Link / QR</h3>
          <p className="text-xs text-slate-500">Erzeugt einen Kompaktplan als Link: Etappen, Hotels, Stopps, Aktionen, Flüge, Mietwagen. Ohne Preise, Kreditkarten, Notizen und Dokumente. Der Plan steckt im Link selbst, es wird nichts hochgeladen. Wer den Link öffnet, sieht den Plan nur zum Lesen.</p>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={opt.emergency} onChange={(e) => setOpt({ ...opt, emergency: e.target.checked })} className="w-5 h-5" /> Notfallnummern mitgeben</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={opt.codes} onChange={(e) => setOpt({ ...opt, codes: e.target.checked })} className="w-5 h-5" /> Buchungscodes mitgeben (Hotel, Flug, Mietwagen)</label>
          {err && <div className="text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-900 p-2">{err}</div>}
          {link && <div className="space-y-2">
            <div className="text-xs text-slate-600">Link-Länge: {link.length} Zeichen{link.length > 8000 ? '. Sehr lang: manche Messenger kürzen so lange Links. Dann lieber die Datei aus Drive teilen.' : ''}</div>
            <textarea readOnly value={link} rows={3} onFocus={(e) => e.target.select()} className="w-full rounded-lg border border-slate-300 p-2 text-[11px] font-mono break-all" />
            <div className="flex flex-wrap gap-2"><button type="button" onClick={copy} className="min-h-[44px] px-4 rounded-xl bg-blue-600 text-white text-sm font-bold">{copied ? '✓ Kopiert' : 'Link kopieren'}</button>{navigator.share && <button type="button" onClick={share} className="min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold">Teilen …</button>}</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {qrPlan ? <div className="rounded-xl border border-slate-200 p-3 text-center space-y-1"><div className="text-xs font-bold">QR: Plan</div><div className="mx-auto w-48 bg-white" dangerouslySetInnerHTML={{ __html: qrPlan }} /></div> : <div className="text-xs text-slate-500 sm:col-span-2">Der Plan ist zu groß für einen QR-Code. Verschicke den Link oder öffne ihn auf dem anderen Gerät. Der QR-Code unten führt zur App.</div>}
              <div className="rounded-xl border border-slate-200 p-3 text-center space-y-1"><div className="text-xs font-bold">QR: App öffnen</div>{qrApp && <div className="mx-auto w-48 bg-white" dangerouslySetInnerHTML={{ __html: qrApp }} />}<div className="text-[11px] text-slate-500 break-all">{appBaseUrl()}</div></div>
            </div>
          </div>}
        </section>
      );
    }
    const LINK_PLAN = (() => { try { return location.hash.startsWith('#plan=') ? location.hash.slice(6) : null; } catch (e) { return null; } })();
    function LinkImportGate({ onClose }) {
      const [data, setData] = useState(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
      useEffect(() => { (async () => { try { if (typeof DecompressionStream === 'undefined') throw new Error('Dieser Browser kann den Link nicht entpacken. Bitte Chrome oder Safari ab Version 16.4 nutzen.'); setData(normalizeTrip(await unpackPlan(LINK_PLAN))); } catch (e) { setErr('Der Link ist ungültig oder unvollständig: ' + e.message); } })(); }, []);
      const clearHash = () => { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} };
      const open = async () => { setBusy(true); try { const same = sameTrip(getActiveTrip(), data); await loadTripFileAsActive(data); if (!same) setDeviceMode('readonly'); clearHash(); location.reload(); } catch (e) { setErr(e.message); setBusy(false); } };
      const cancel = () => { clearHash(); onClose(); };
      const active = getActiveTrip();
      return (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-900/70 p-4 flex items-center justify-center" data-readonly-allow>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 space-y-3">
            <h2 className="text-lg font-bold">Reiseplan aus Link</h2>
            {!data && !err && <div className="text-sm text-slate-600">Lese Plan …</div>}
            {err && <div role="alert" className="text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-900 p-2">{err}</div>}
            {data && <div className="text-sm space-y-1"><div><b>{data.meta.title || 'Ohne Titel'}</b></div><div className="text-xs text-slate-600">{data.meta.startDate ? data.meta.startDate.split('-').reverse().join('.') : ''} – {data.meta.endDate ? data.meta.endDate.split('-').reverse().join('.') : ''} · {data.stages.length} Etappen</div>
              {active && !sameTrip(active, data) && <div className="text-xs rounded-lg bg-amber-50 border border-amber-300 p-2">Die aktuell geöffnete Reise „{active.meta.title}“ bleibt gesichert und ist unter „Meine Reisen“ wieder abrufbar.</div>}
              {active && sameTrip(active, data) && <div className="text-xs rounded-lg bg-amber-50 border border-amber-300 p-2">Das ist dieselbe Reise wie auf diesem Gerät. Der Kompaktplan ersetzt deine ausführlichen Daten. Besser abbrechen, wenn du die Reise selbst planst.</div>}</div>}
            <div className="flex gap-2 justify-end"><button type="button" onClick={cancel} className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-sm font-bold">Abbrechen</button>{data && <button type="button" disabled={busy} onClick={open} className="min-h-[44px] px-4 rounded-xl bg-blue-600 text-white text-sm font-bold">Als Reise öffnen (nur lesen)</button>}</div>
          </div>
        </div>
      );
    }

        