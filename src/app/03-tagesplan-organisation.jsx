// ===== Planungs-Werkzeuge: Tagesplan, Heute-Ansicht =====
    const isoAdd = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
    const isoDiffDays = (a, b) => { const p = (x) => { const [y, m, d] = x.split('-').map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((p(b) - p(a)) / 86400000); };
    const fmtDayLong = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }); };
    const fmtDayShort = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' }); };
    const fmtHM = (min) => { const m = ((Math.round(min) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
    const fmtDurMin = (min) => { const m = Math.max(0, Math.round(min)); const h = Math.floor(m / 60); return h ? `${h} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`; };
    const toNum = (s) => parseFloat(String(s).replace(',', '.'));
    const parseDurMin = (str) => {
      if (!str) return null; const t = String(str); let total = 0, found = false;
      const h = t.match(/(\d+(?:[.,]\d+)?)\s*(?:h\b|std|stunde)/i); if (h) { total += toNum(h[1]) * 60; found = true; }
      const m = t.match(/(\d+)\s*min/i); if (m) { total += Number(m[1]); found = true; }
      return found ? Math.round(total) : null;
    };
    const parseCheckIn = (str) => {
      if (!str) return null; const t = String(str);
      const nums = [...t.matchAll(/(\d{1,2})(?::(\d{2}))?/g)].map((x) => Number(x[1]) * 60 + Number(x[2] || 0));
      if (!nums.length) return null;
      let to = nums.length > 1 ? nums[1] : null; if (to === 0) to = 1440;
      return { from: nums[0], to };
    };
    const hotelName = (s) => (s && ((s.hotel && s.hotel.name) || s.toCity)) || '';
    const llStr = (g) => (g ? `${g[0]},${g[1]}` : '');

    // Zeitzone grob nach Längengrad (USA), sonst Zeitzone des Geräts
    const tzFor = (lat, lon) => {
      if (lat > 24 && lat < 50 && lon > -125 && lon < -66) return lon >= -85 ? 'America/New_York' : lon >= -102 ? 'America/Chicago' : lon >= -114 ? 'America/Denver' : 'America/Los_Angeles';
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return 'UTC'; }
    };
    const localMinutes = (date, tz) => { const p = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).formatToParts(date); const h = Number(p.find((x) => x.type === 'hour').value) % 24; return h * 60 + Number(p.find((x) => x.type === 'minute').value); };
    const sunTimes = (lat, lon, iso) => {
      try {
        const [y, m, d] = iso.split('-').map(Number); const rad = Math.PI / 180;
        const N = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
        const calc = (rising) => {
          const lngHour = lon / 15, t = N + ((rising ? 6 : 18) - lngHour) / 24, M = 0.9856 * t - 3.289;
          let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634; L = ((L % 360) + 360) % 360;
          let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad; RA = ((RA % 360) + 360) % 360;
          RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90; RA /= 15;
          const sinDec = 0.39782 * Math.sin(L * rad), cosDec = Math.cos(Math.asin(sinDec));
          const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
          if (cosH > 1 || cosH < -1) return null;
          const H = (rising ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad) / 15;
          const T = H + RA - 0.06571 * t - 6.622; return (((T - lngHour) % 24) + 24) % 24;
        };
        const ur = calc(true), us = calc(false); if (ur == null || us == null) return null;
        const base = Date.UTC(y, m - 1, d); let sunsetUT = us; if (sunsetUT < ur) sunsetUT += 24;
        const tz = tzFor(lat, lon);
        const sr = new Date(base + ur * 3600000), ss = new Date(base + sunsetUT * 3600000);
        return { sunrise: localMinutes(sr, tz), sunset: localMinutes(ss, tz), tz };
      } catch (e) { return null; }
    };

    // Datumsbereiche der Etappen (dateRange ist Freitext wie "25.03. – 27.03.2024 (Karfreitag)")
    const parseStageRanges = (stages, tripStart) => {
      const out = []; let prevEnd = tripStart || null;
      stages.forEach((s) => {
        const dr = String(s.dateRange || ''); const found = [...dr.matchAll(/(\d{1,2})\.(\d{1,2})\.(\d{4})?/g)];
        const nights = Math.max(0, parseInt(s.nights, 10) || 0); let start = null, end = null;
        const mk = (dd, mm, yy) => `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        const yearHint = (tripStart || '').slice(0, 4);
        if (found.length >= 2) {
          const e = found[1], st = found[0]; const ye = Number(e[3] || yearHint || new Date().getFullYear());
          const ys = st[3] ? Number(st[3]) : (Number(st[2]) > Number(e[2]) ? ye - 1 : ye);
          start = mk(st[1], st[2], ys); end = mk(e[1], e[2], ye);
        } else if (found.length === 1 && (found[0][3] || yearHint)) { start = mk(found[0][1], found[0][2], Number(found[0][3] || yearHint)); }
        if (!start && prevEnd) start = prevEnd;
        if (start && !end) end = isoAdd(start, nights);
        if (start && end && end < start) end = start;
        out.push(start && end ? { start, end } : null); if (end) prevEnd = end;
      });
      return out;
    };
    const buildDays = (trip) => {
      const stages = trip.stages || []; const ranges = parseStageRanges(stages, trip.meta && trip.meta.startDate); const map = new Map();
      stages.forEach((s, i) => {
        const r = ranges[i]; if (!r) return;
        for (let k = 1; ; k++) { const iso = isoAdd(r.start, k); if (iso >= r.end) break; map.set(iso, { iso, kind: 'stay', stage: s, stageIdx: i, dayInStage: k + 1 }); }
        if (r.end > r.start) map.set(r.end, { iso: r.end, kind: 'checkout', stage: s, stageIdx: i, dayInStage: null });
      });
      stages.forEach((s, i) => {
        const r = ranges[i]; if (!r) return; const pr = i > 0 ? ranges[i - 1] : null;
        map.set(r.start, { iso: r.start, kind: 'travel', stage: s, stageIdx: i, dayInStage: 1, checkoutStage: pr && pr.end === r.start ? stages[i - 1] : null });
      });
      return [...map.values()].sort((a, b) => (a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : 0));
    };
    const attractionsForDay = (stage, dayInStage) => {
      const nc = Math.max(1, parseInt(stage.nights, 10) || 1);
      return (stage.localAttractions || []).map((a, i) => ({ ...a, _d: Math.min(nc, Math.max(1, a.day ? parseInt(a.day, 10) : (i % nc) + 1)) })).filter((a) => a._d === dayInStage);
    };

    // Zeitleiste für einen Anreisetag
    const buildTimeline = (trip, day) => {
      const stage = day.stage, stages = trip.stages || [], prev = stages[day.stageIdx - 1] || null, plan = stage.plan || {};
      const hasFlight = (trip.flights || []).some((f) => typeof rtFlightFilled === 'function' && rtFlightFilled(f)); const depart = plan.departTime || (day.stageIdx === 0 && hasFlight ? '19:00' : '09:00'); const [dh, dm] = depart.split(':').map(Number);
      let t = dh * 60 + (dm || 0); const buf = plan.bufferPct != null ? Number(plan.bufferPct) : 20;
      const rt = stage.routeToHotel || {}, H = parseGps(stage.hotel && stage.hotel.gps), A = prev ? parseGps(prev.hotel && prev.hotel.gps) : null;
      const km = toNum(rt.distanceKm); let total = parseDurMin(rt.duration); if (total == null) total = Number.isFinite(km) ? Math.round(km / 85 * 60) : 60;
      let stops = rt.stopsOnWay || [];
      // Letzter Eintrag ist oft nur die Ankunft am Hotel: dann wird er nicht als eigener Stopp gezählt
      const lastS = stops[stops.length - 1]; let lastLegMin = null;
      if (lastS && (/^\s*ankunft/i.test(lastS.name || '') || (H && parseGps(lastS.gps) && haversineM(H, parseGps(lastS.gps)) < 300))) {
        const mm = String(lastS.time || '').match(/(\d+(?:[.,]\d+)?)\s*km\s*\/\s*(\d+(?:[.,]\d+)?)\s*h/i); lastLegMin = mm ? toNum(mm[2]) * 60 : null; stops = stops.slice(0, -1);
      }
      const pts = [A, ...stops.map((s) => parseGps(s.gps)), H];
      const cumKm = stops.map((s) => { const m = String(s.time || '').match(/nach\s*(\d+(?:[.,]\d+)?)\s*km/i); return m ? toNum(m[1]) : null; });
      const cumOk = Number.isFinite(km) && km > 0 && cumKm.length > 0 && cumKm.every((x) => x != null) && cumKm.every((x, k) => k === 0 || x >= cumKm[k - 1]) && cumKm[cumKm.length - 1] <= km;
      let legsRaw = stops.map((s) => { const m = String(s.time || '').match(/(\d+(?:[.,]\d+)?)\s*km\s*\/\s*(\d+(?:[.,]\d+)?)\s*h/i); return m ? toNum(m[2]) * 60 : null; });
      if (cumOk) { legsRaw = cumKm.map((x, k) => (x - (k ? cumKm[k - 1] : 0)) / km * total); lastLegMin = (km - cumKm[cumKm.length - 1]) / km * total; }
      const knownSum = legsRaw.reduce((a, x) => a + (x || 0), 0) + (lastLegMin || 0); const remain = Math.max(total - knownSum, total * 0.15);
      const legs = [...legsRaw, lastLegMin]; const miss = legs.map((x, i) => (x == null ? i : -1)).filter((i) => i >= 0);
      const dist = (i) => (pts[i] && pts[i + 1] ? haversineM(pts[i], pts[i + 1]) : null); const dists = miss.map(dist);
      const dsum = dists.reduce((a, b) => a + (b || 0), 0); const useDist = dists.every((x) => x != null) && dsum > 0;
      miss.forEach((i, j) => { legs[i] = useDist ? remain * dists[j] / dsum : remain / miss.length; });
      const legSum = legs.reduce((x, y) => x + y, 0); if (legSum > 0 && Math.abs(legSum - total) > 1) for (let i = 0; i < legs.length; i++) legs[i] = legs[i] * total / legSum;
      // v118: Teilstrecken in km (aus "x km / y h", sonst anteilig nach Fahrzeit)
      const kmRaw = (() => { const base = [...stops.map((s) => { const m = String(s.time || '').match(/(\d+(?:[.,]\d+)?)\s*km\s*\/\s*\d/i); return m ? toNum(m[1]) : null; }), lastS && lastLegMin != null ? (() => { const m = String(lastS.time || '').match(/(\d+(?:[.,]\d+)?)\s*km\s*\/\s*\d/i); return m ? toNum(m[1]) : null; })() : null];
        if (Number.isFinite(km) && km > 0 && cumKm.length && cumKm.every((x) => x != null) && cumKm.every((x, k) => k === 0 || x >= cumKm[k - 1])) return [...cumKm.map((x, k) => x - (k ? cumKm[k - 1] : 0)), Math.max(km - cumKm[cumKm.length - 1], 0)];
        return base; })();
      const legKm = (() => { if (!Number.isFinite(km) || km <= 0) return kmRaw.every((x) => x != null) ? kmRaw : kmRaw.map(() => null); const known = kmRaw.reduce((a, x) => a + (x || 0), 0); const mi2 = kmRaw.map((x, i) => (x == null ? i : -1)).filter((i) => i >= 0); if (!mi2.length) return kmRaw; const remK = Math.max(km - known, km * 0.1); const wsum = mi2.reduce((a, i) => a + legs[i], 0) || 1; return kmRaw.map((x, i) => (x != null ? x : remK * legs[i] / wsum)); })();
      const events = [{ kind: 'depart', at: t, title: `Abfahrt${prev ? ': ' + hotelName(prev) : stage.fromCity ? ': ' + stage.fromCity : ''}`, gps: A }];
      let driveSum = 0;
      stops.forEach((s, i) => {
        const dr = legs[i] * (1 + buf / 100); driveSum += dr; t += dr;
        const dwell = plan.dwell && plan.dwell[s.id] != null ? Number(plan.dwell[s.id]) : (parseDurMin(s.duration) != null ? parseDurMin(s.duration) : 45);
        events.push({ kind: 'stop', at: t, driveMin: dr, driveKm: legKm[i], dwell, id: s.id, title: s.name, gps: parseGps(s.gps), address: s.address, note: s.time && !/km\s*\//i.test(s.time) ? s.time : '' });
        t += dwell;
      });
      const last = legs[stops.length] * (1 + buf / 100); driveSum += last; t += last;
      events.push({ kind: 'arrive', at: t, driveMin: last, driveKm: legKm[stops.length], title: `Ankunft: ${hotelName(stage)}`, gps: H, address: stage.hotel && stage.hotel.address });
      const ci = parseCheckIn(stage.hotel && stage.hotel.checkIn); const sun = H ? sunTimes(H[0], H[1], day.iso) : null; const warnings = [];
      if (ci && ci.from - t > 120) warnings.push(`Ankunft ${fmtHM(t)} liegt ${fmtDurMin(ci.from - t)} vor dem Check-in (${fmtHM(ci.from)}). Gepäck abgeben oder einen Stopp einplanen.`);
      if (ci && ci.to && t > ci.to) warnings.push(`Ankunft ${fmtHM(t)} liegt nach dem Ende des Check-in-Fensters (${fmtHM(ci.to === 1440 ? 0 : ci.to)}). Hotel vorab informieren.`);
      if (sun && t > sun.sunset) warnings.push(`Ankunft ${fmtHM(t)} nach Sonnenuntergang (${fmtHM(sun.sunset)}), Fahrt teilweise im Dunkeln.`);
      if (driveSum > 300) warnings.push(`Reine Fahrzeit inkl. Puffer ${fmtDurMin(driveSum)}: lange Etappe, Pausen einplanen.`);
      if (t >= 1440) warnings.push('Die Ankunft liegt nach Mitternacht.');
      return { events, warnings, sun, arrival: t, driveSum, totalKm: Number.isFinite(km) && km > 0 ? km : (legKm.every((x) => x != null) ? legKm.reduce((a, b) => a + b, 0) : null), miles: rtStageMiles(stage), buffer: buf, depart, ci };
    };

    function NavLink({ gps, address, name, label, className }) {
      const g = Array.isArray(gps) ? llStr(gps) : (gps || '');
      return <a href={rtNavUrl(rtNaviSvc(), g, address, name)} target="_blank" rel="noopener noreferrer" className={className || 'min-h-[36px] inline-flex items-center px-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold'}>{label || 'Navi'}</a>;
    }

    function DayCard({ trip, day, onSave, editable, nowMin, isToday, hideWx, afterRoute }) {
      const stage = day.stage; const plan = stage.plan || {};
      const tl = day.kind === 'travel' ? buildTimeline(trip, day) : null;
      const H = parseGps(stage.hotel && stage.hotel.gps); const sun = tl ? tl.sun : H ? sunTimes(H[0], H[1], day.iso) : null;
      const acts = day.dayInStage ? attractionsForDay(stage, day.dayInStage) : [];
      const updPlan = (patch) => onSave({ ...trip, stages: (trip.stages || []).map((s) => (s.id === stage.id ? { ...s, plan: { ...(s.plan || {}), ...patch } } : s)) }, '');
      const nextIdx = isToday && tl ? tl.events.findIndex((e) => e.at >= nowMin) : -1;
      const wide = useWide(); const canOrder = !IS_READ_ONLY_COPY && acts.length > 1;
      const routePts = tl ? tl.events.filter((e) => e.gps).map((e, i) => ({ g: e.gps, t: e.title, n: i + 1 })) : [];
      const actPts = acts.map((a, i) => ({ g: parseGps(a.gps || ''), t: a.name || '', n: i + 1 })).filter((x) => x.g);
      const moveAct = (i, dir) => {
        const j = i + dir; if (j < 0 || j >= acts.length) return; const A = acts[i].id, B = acts[j].id;
        const nc = Math.max(1, parseInt(stage.nights, 10) || 1);
        const list = (stage.localAttractions || []).map((x, k) => ({ ...x, day: String(Math.min(nc, Math.max(1, x.day ? parseInt(x.day, 10) : (k % nc) + 1))) }));
        const ia = list.findIndex((x) => x.id === A), ib = list.findIndex((x) => x.id === B); if (ia < 0 || ib < 0) return;
        const t = list[ia]; list[ia] = list[ib]; list[ib] = t;
        onSave({ ...trip, stages: (trip.stages || []).map((st) => (st.id === stage.id ? { ...st, localAttractions: list } : st)) }, 'Reihenfolge geändert');
      };
      const h = stage.hotel || {};
      return (
        <article className={`rounded-2xl border bg-white p-4 space-y-3 ${isToday ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-sm font-extrabold text-slate-900">{fmtDayLong(day.iso)}{isToday ? ' · Heute' : ''}</div>
              <div className="text-xs text-slate-600">Etappe {day.stageIdx + 1} · {day.kind === 'travel' ? `Anreise ${stage.fromCity || ''} → ${stage.toCity || ''}` : day.kind === 'stay' ? `Aufenthalt in ${stage.toCity || ''} (Tag ${day.dayInStage})` : `Abreise aus ${stage.toCity || ''}`}</div>
            </div>
            {sun && <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1"><Ic n="sunrise" />{fmtHM(sun.sunrise)} · <Ic n="sunset" />{fmtHM(sun.sunset)}</div>}
          </div>
          {!hideWx && <WxChip stage={stage} iso={day.iso} />}
          <OvRainToggle trip={trip} day={day} onSave={onSave} />
          {day.checkoutStage && <div className="text-xs rounded-lg bg-slate-50 border border-slate-200 p-2">Check-out {hotelName(day.checkoutStage)}{day.checkoutStage.hotel && day.checkoutStage.hotel.checkOut ? ` bis ${day.checkoutStage.hotel.checkOut}` : ''}</div>}
          {day.kind === 'checkout' && <div className="text-xs rounded-lg bg-slate-50 border border-slate-200 p-2">Check-out {hotelName(stage)}{h.checkOut ? ` bis ${h.checkOut}` : ''}. Weiterfahrt oder Rückreise.</div>}
          {tl && (
            <div className="space-y-2">
              {editable && (
                <div className="flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 border border-slate-200 p-2">
                  <label className="text-xs font-semibold text-slate-700">Abfahrt
                    <input type="time" value={tl.depart} onChange={(e) => e.target.value && updPlan({ departTime: e.target.value })} className="mt-1 block min-h-[40px] px-2 rounded-lg border border-slate-300 bg-white text-sm" />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">Fahrzeit-Puffer
                    <select value={tl.buffer} onChange={(e) => updPlan({ bufferPct: Number(e.target.value) })} className="mt-1 block min-h-[40px] px-2 rounded-lg border border-slate-300 bg-white text-sm">
                      {[0, 10, 20, 30, 40].map((p) => <option key={p} value={p}>+{p} %</option>)}
                    </select>
                  </label>
                  <p className="text-[11px] text-slate-500 flex-1 min-w-[160px]">Maps rechnet ohne Verkehr und Pausen. Der Puffer verlängert nur die Fahrzeiten, nicht die Aufenthalte.</p>
                </div>
              )}
              <div className="rt3-sum">
                {!hideWx && <div><span>Abfahrt</span><b>{fmtHM(tl.events[0].at)}</b></div>}
                <div><span>Fahrzeit</span><b>{fmtDurMin(tl.driveSum)}</b></div>
                {tl.totalKm ? <div><span>Strecke</span><b>{rtDist(tl.totalKm, tl.miles)}</b></div> : null}
                {!hideWx && <div><span>Ankunft</span><b>ca. {fmtHM(tl.arrival)}</b></div>}
                {tl.ci && <div><span>Check-in</span><b>ab {fmtHM(tl.ci.from)}</b></div>}
              </div>
              <ol className="rt3-tl">
                {tl.events.map((ev, i) => {
                  const part = (m) => (m < 720 ? 'Vormittag' : m < 1080 ? 'Nachmittag' : 'Abend'); const showPart = i === 0 || part(ev.at) !== part(tl.events[i - 1].at);
                  return (
                    <React.Fragment key={i}>
                      {showPart && <li className="rt3-tl-part" aria-hidden="true">{part(ev.at)}</li>}
                      {ev.kind !== 'depart' && <li className="rt3-tl-drive" aria-hidden="true"><Ic n="car" />{fmtDurMin(ev.driveMin)} Fahrt{ev.driveKm ? ` · ${rtDist(ev.driveKm, tl.miles)}` : ''}</li>}
                      <li className={`rt3-tl-ev k-${ev.kind}${nextIdx === i ? ' next' : ''}${nextIdx > i ? ' past' : ''}`}>
                        <div className="rt3-tl-time"><b>{fmtHM(ev.at)}</b>{nextIdx === i && <i>als Nächstes</i>}</div>
                        <div className="rt3-tl-card">
                          <div className="rt3-tl-title">{ev.kind === 'depart' ? <Ic n="car" /> : ev.kind === 'arrive' ? <Ic n="hotel" /> : <Ic n="flag" />}{ev.title}</div>
                          <div className="rt3-tl-meta">
                            {ev.kind === 'stop' && <span className="rt3-chip">Aufenthalt {fmtDurMin(ev.dwell)}</span>}
                            {ev.note && <span>{ev.note}</span>}
                            {ev.address && <span><Ic n="pin" />{ev.address}</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {ev.kind === 'stop' && editable && (
                              <label className="text-[11px] font-semibold text-slate-700">Aufenthalt (Min.)
                                <input type="number" min="0" step="5" defaultValue={ev.dwell} key={`${ev.id}-${ev.dwell}`} onBlur={(e) => { const v = Math.max(0, Number(e.target.value) || 0); if (v !== ev.dwell) updPlan({ dwell: { ...(plan.dwell || {}), [ev.id]: v } }); }} className="ml-1 w-20 min-h-[36px] px-2 rounded-lg border border-slate-300 bg-white text-sm" />
                              </label>
                            )}
                            {ev.gps && ev.kind !== 'depart' && <NavLink gps={ev.gps} address={ev.address} name={ev.title} />}
                          </div>
                        </div>
                      </li>
                    </React.Fragment>
                  );
                })}
              </ol>
              {tl.warnings.map((w, i) => <div key={i} className="text-xs rounded-lg bg-amber-50 border border-amber-300 text-amber-950 p-2"><Ic n="warn" />{w}</div>)}
            </div>
          )}
          {tl && <RtDayMap pts={routePts} cls="route" label="Route zum Ziel" />}
          {afterRoute}
          {acts.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700">{day.kind === 'travel' ? 'Danach vor Ort' : 'Aktionen für diesen Tag'}</div>
              {wide && <RtDayMap pts={actPts} cls="acts" label="Aktionen vor Ort, Reihenfolge in der Liste" />}
              {acts.map((a, ai) => (
                <div key={a.id} className="rounded-lg border border-amber-200 bg-amber-50 p-2 flex flex-wrap items-start justify-between gap-2">
                  <div className="rt3-actnum" aria-hidden="true">{ai + 1}</div>
                  <div className="min-w-0 flex-1"><div className="text-sm font-bold text-slate-900 break-words">{a.name}</div><div className="text-[11px] text-slate-600">{[a.category, a.time, a.booked].filter(Boolean).join(' · ')}{a.priceEur ? ` · ${formatEur(a.priceEur)}` : ''}</div></div>
                  <div className="flex items-center gap-1.5">
                    {canOrder && <span className="rt3-ord"><button type="button" aria-label={`${a.name} nach oben`} disabled={ai === 0} onClick={() => moveAct(ai, -1)}>▲</button><button type="button" aria-label={`${a.name} nach unten`} disabled={ai === acts.length - 1} onClick={() => moveAct(ai, 1)}>▼</button></span>}
                    {parseGps(a.gps) && <NavLink gps={a.gps} address={a.address} name={a.name} />}
                  </div>
                </div>
              ))}
            </div>
          )}
          {day.kind === 'stay' && acts.length === 0 && <div className="text-xs text-slate-500">Für diesen Tag sind noch keine Aktionen eingetragen. Vorschläge findest du im Tab „Karte“.</div>}
        </article>
      );
    }

    function PlanView({ trip, onSave, todayIso }) {
      useEffect(() => { wxStore.ensure(trip); }, [(trip.stages || []).length]);
      const stages = trip.stages || [];
      const rows = useMemo(() => buildDays(trip).map((d) => { let tl = null; if (d.kind === 'travel') { try { tl = buildTimeline(trip, d); } catch (e) { tl = null; } } const acts = d.dayInStage ? attractionsForDay(d.stage, d.dayInStage) : []; return { d, tl, acts }; }), [trip]);
      const [open, setOpen] = useState(() => (rows.some((r) => r.d.iso === todayIso) ? todayIso : null));
      const [full, setFull] = useState({});
      const totKm = rows.reduce((a, r) => a + (r.tl && r.tl.totalKm ? r.tl.totalKm : 0), 0), totMin = rows.reduce((a, r) => a + (r.tl ? r.tl.driveSum : 0), 0), anyMi = rows.some((r) => r.tl && r.tl.miles);
      return (
        <div className="space-y-3" data-plan-compact>
          <section className="rt4-top">
            <h2>Tagesplan</h2>
            <div className="rt4-stats">
              <div><span>Strecke gesamt</span><b>{totKm ? rtDist(totKm, anyMi) : '–'}</b></div>
              <div><span>Fahrzeit gesamt</span><b>{totMin ? fmtDurMin(totMin) : '–'}</b></div>
            </div>
          </section>
          {rows.length === 0 && <Empty icon="calendar" title="Kein Datum" text="Für die Etappen ist kein gültiges Datum eingetragen. Trage unter „Etappen“ ein Datum ein, dann erscheint der Tagesplan." />}
          <ol className="rt4-list">
            {rows.map((r) => {
              const { d, tl, acts } = r, st = d.stage, prev = d.stageIdx > 0 ? stages[d.stageIdx - 1] : null, isOpen = open === d.iso, isToday = d.iso === todayIso;
              const [wd, dt] = ovWeekday(d.iso).replace('.', '').split(', ');
              const cityOf = (x) => String((x && x.toCity) || '').trim() || hotelName(x); const title = d.kind === 'travel' ? `${prev ? cityOf(prev) : (st.fromCity || 'Start')} → ${cityOf(st)}` : d.kind === 'checkout' ? `Check-out ${cityOf(st)}` : `Aufenthalt ${cityOf(st)}`;
              const nStops = tl ? tl.events.filter((e) => e.kind === 'stop').length : 0, warn = tl ? tl.warnings.length : 0;
              const sub = [tl && tl.totalKm ? rtDist(tl.totalKm, tl.miles) : '', tl ? fmtDurMin(tl.driveSum) : '', nStops ? `${nStops} ${nStops === 1 ? 'Stopp' : 'Stopps'}` : '', acts.length ? `${acts.length} ${acts.length === 1 ? 'Aktion' : 'Aktionen'}` : ''].filter(Boolean).join(' · ');
              return (
                <li key={d.iso} data-plan-day={d.iso} className={`rt4-day${isOpen ? ' open' : ''}${isToday ? ' today' : ''}`}>
                  <button type="button" data-readonly-allow aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : d.iso)} className="rt4-row">
                    <span className="rt4-date"><small>{wd}</small><b>{dt}</b></span>
                    <span className="rt4-main"><b>{title}</b>{sub && <small>{sub}</small>}</span>
                    {warn > 0 && <span className="rt4-warn" title={`${warn} Hinweis(e)`}><Ic n="warn" /></span>}
                    <span className="rt4-chev" aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
                  </button>
                  {isOpen && (
                    <div className="rt4-body">
                      {tl && tl.warnings.map((t, i) => <div key={i} className="rt4-note"><Ic n="warn" />{t}</div>)}
                      {(() => { const tk = d.kind !== 'travel' ? null : rtIsRet(trip.stages || [], d.stageIdx) ? 'back' : d.stageIdx === 0 ? 'out' : null; const ts = tk ? rtTdSteps(trip, tk) : []; return ts.length > 0 ? (<div data-day-travel><div className="rt4-h">{tk === 'out' ? 'Anreise' : 'Rückreise'}</div><ul className="rt4-ev">{ts.map((st) => <li key={st.id}><b>{st.time || '–'}</b><span>{rtTdLabel(tk, st)}{st.place ? ` · ${st.place}` : ''}</span>{rtTdNav(st) ? <small><a href={rtTdNav(st)} target="_blank" rel="noopener noreferrer">Navigation</a></small> : null}</li>)}</ul></div>) : null; })()}
                      {tl && (<>
                        <div className="rt4-h">Fahrt</div>
                        <ul className="rt4-ev">{tl.events.map((ev, i) => <li key={i}><b>{fmtHM(ev.at)}</b><span>{ev.title}</span>{ev.kind !== 'depart' && ev.driveKm ? <small>{rtDist(ev.driveKm, tl.miles)}</small> : <small />}</li>)}</ul>
                      </>)}
                      {acts.length > 0 && (<>
                        <div className="rt4-h">Vor Ort, {acts.length} {acts.length === 1 ? 'Aktion' : 'Aktionen'}</div>
                        <div className="rt4-chips">{acts.map((a, i) => <span key={a.id || i}>{a.name || 'Aktion'}</span>)}</div>
                      </>)}
                      {!tl && acts.length === 0 && <p className="rt4-empty">Für diesen Tag ist noch nichts eingetragen.</p>}
                      <button type="button" data-readonly-allow className="v18-btn sm rt4-more" onClick={() => setFull({ ...full, [d.iso]: !full[d.iso] })}>{full[d.iso] ? 'Details ausblenden' : IS_READ_ONLY_COPY ? 'Details anzeigen' : 'Details und Bearbeiten'}</button>
                      {full[d.iso] && <div className="rt4-full"><DayCard trip={trip} day={d} onSave={onSave} editable={!IS_READ_ONLY_COPY && d.kind !== 'checkout'} isToday={isToday} nowMin={-1} /></div>}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      );
    }
    function RtDayMap({ pts, label, cls }) {
      const el = useRef(null), mapRef = useRef(null), grp = useRef(null);
      const sig = pts.map((p) => p.g.join(',') + ':' + p.n).join('|');
      useEffect(() => {
        if (!window.L || !el.current || mapRef.current) return; const L = window.L;
        const map = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
        mapRef.current = map; grp.current = L.layerGroup().addTo(map); map.setView([28, -82], 5);
        return () => { try { map.remove(); } catch (e) {} mapRef.current = null; };
      }, []);
      useEffect(() => {
        const L = window.L, map = mapRef.current; if (!L || !map || !grp.current) return; grp.current.clearLayers();
        if (cls === 'route' && pts.length > 1) L.polyline(pts.map((p) => p.g), { color: '#1F4E8C', weight: 3, opacity: 0.85 }).addTo(grp.current);
        pts.forEach((p) => L.marker(p.g, { title: p.t, icon: L.divIcon({ className: '', html: `<div class="mk2${cls === 'acts' ? ' act' : ''}">${p.n}</div>`, iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(grp.current));
        const fit = () => { if (pts.length) { try { map.invalidateSize(); map.fitBounds(L.latLngBounds(pts.map((p) => p.g)), { padding: [40, 40], maxZoom: 15, animate: false }); } catch (e) {} } };
        fit(); const t = setTimeout(fit, 120);
        let ro = null; if (window.ResizeObserver && el.current) { ro = new ResizeObserver(() => fit()); ro.observe(el.current); }
        return () => { clearTimeout(t); if (ro) ro.disconnect(); };
      }, [sig]);
      if (!pts.length) return null;
      return <div data-day-map className={`rt3-daymap rt3-daymap-${cls}`}><div className="rt3-daymap-h">{label}</div><div ref={el} className="rt3-daymap-el" role="img" aria-label={label} /></div>;
    }
    const useWide = () => {
      const q = '(min-width:1100px)'; const [w, setW] = useState(() => window.matchMedia(q).matches);
      useEffect(() => { const m = window.matchMedia(q), f = () => setW(m.matches); m.addEventListener ? m.addEventListener('change', f) : m.addListener(f); return () => { m.removeEventListener ? m.removeEventListener('change', f) : m.removeListener(f); }; }, []);
      return w;
    };

    function TodayView({ trip, onSave, todayIso, goTab }) {
      const wide = useWide();
      useEffect(() => { wxStore.ensure(trip); }, [(trip.stages || []).length]);
      const days = useMemo(() => buildDays(trip), [trip]);
      const [sel, setSel] = useState(() => { const t = days.find((d) => d.iso === todayIso); return (t || days[0] || {}).iso; });
      const [nowMin, setNowMin] = useState(() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); });
      useEffect(() => { const t = setInterval(() => { const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes()); }, 30000); return () => clearInterval(t); }, []);
      if (!days.length) return <Empty icon="calendar" title="Noch kein Tag" text="Noch keine Etappen mit Datum vorhanden. Lege unter „Etappen“ Daten fest, dann zeigt dieser Tab den Tag." action="Zu den Etappen" onAction={() => goTab('stages')} />;
      let idx = days.findIndex((d) => d.iso === sel); if (idx < 0) idx = 0; const day = days[idx]; const stage = day.stage; const h = stage.hotel || {};
      const isToday = day.iso === todayIso; const first = days[0].iso, last = days[days.length - 1].iso;
      const banner = isToday ? null : todayIso < first ? `Die Reise beginnt in ${isoDiffDays(todayIso, first)} Tagen (${fmtDayShort(first)}). Du siehst gerade eine Vorschau.` : todayIso > last ? 'Die Reise ist beendet. Du siehst gerade einen Rückblick auf den gewählten Tag.' : 'Vorschau: Das ist nicht der heutige Tag.';
      const dmy = (iso) => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };
      const flights = (trip.flights || []).filter((f) => f.departureDate === dmy(day.iso));
      const cars = []; (trip.rentalCars || []).forEach((c) => { if (c.pickupDate === dmy(day.iso)) cars.push({ c, what: 'Abholung', where: c.pickupLocation, time: c.pickupTime }); if (c.dropoffDate === dmy(day.iso)) cars.push({ c, what: 'Rückgabe', where: c.dropoffLocation, time: c.dropoffTime }); });
      const emerg = trip.emergencyContacts || [];
      const hotelPts = [{ g: parseGps(h.gps), t: h.name || stage.toCity || 'Unterkunft', n: 'H' }, { g: parseGps(h.parkingGarageGps), t: h.parkingGarageName || 'Parkplatz', n: 'P' }].filter((x) => x.g);
      const hotelCard = (
          <section className="rt3-left rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Unterkunft: {h.name || stage.toCity}</h3>
            <RtDayMap pts={hotelPts} cls="hotel" label="Unterkunft und Parkplatz" />
            <div className="text-sm text-slate-700 space-y-0.5">
              {h.address && <div><Ic n="pin" />{h.address}</div>}
              <div>Check-in: <b>{h.checkIn || '—'}</b> · Check-out: <b>{h.checkOut || '—'}</b>{h.cancelUntil ? ` · Storno bis ${h.cancelUntil}` : ''}</div>
              {h.bookingCode && <div>Buchungscode: {h.bookingCode}</div>}
              <RtHotelFacts h={h} />
              {h.remarks && <div className="text-xs text-slate-500">{h.remarks}</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              {parseGps(h.gps) && <NavLink gps={h.gps} address={h.address} name={h.name} label="Zum Hotel" />}
              {parseGps(h.parkingGarageGps) && <NavLink gps={h.parkingGarageGps} address={h.parkingGarageAddress} name={h.parkingGarageName} label="Zum Parkplatz" className="min-h-[36px] inline-flex items-center px-2.5 rounded-lg bg-purple-600 text-white text-xs font-bold" />}
              <button type="button" onClick={() => goTab('map')} className="min-h-[36px] px-2.5 rounded-lg border border-slate-300 text-xs font-semibold">Karte</button>
              <button type="button" onClick={() => goTab('plan')} className="min-h-[36px] px-2.5 rounded-lg border border-slate-300 text-xs font-semibold">Tagesplan bearbeiten</button>
            </div>
          </section>
      );
      return (
        <div data-today className="rt3-today">
          <section className="space-y-3 rt3-head">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><h2 className="text-lg font-bold text-slate-900">{isToday ? 'Heute · ' : ''}Tag {idx + 1} von {days.length}</h2><div className="text-xs text-slate-600">{fmtDayLong(day.iso)} · Etappe {day.stageIdx + 1}: {hotelName(stage)}</div></div>
              {days.some((d) => d.iso === todayIso) && !isToday && <button type="button" onClick={() => setSel(todayIso)} className="v18-btn pri sm shrink-0">Heute</button>}
            </div>
            <V18DayChips days={days} sel={day.iso} onSel={setSel} />
            {banner && <div className="rt3-banner text-xs rounded-lg bg-sky-50 border border-sky-200 text-sky-950 p-2">{banner}</div>}
          </section>
          <div className="rt3-left space-y-3">
            <V18NextCard trip={trip} day={day} isToday={isToday} nowMin={nowMin} />
            <RtWxCard stage={stage} iso={day.iso} trip={trip} />
            <RtQuick stage={stage} goTab={goTab} />
          </div>

          {(() => { const tk = day.kind !== 'travel' ? null : rtIsRet(trip.stages || [], day.stageIdx) ? 'back' : day.stageIdx === 0 ? 'out' : null; const ts = tk ? rtTdSteps(trip, tk) : []; return ts.length > 0 ? (
            <section data-day-travel className="rt3-left rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">{tk === 'out' ? 'Anreise: Ablauf' : 'Rückreise: Ablauf'}</h3>
              <ol className="space-y-1.5">{ts.map((st) => <li key={st.id} className="text-sm text-slate-900 flex gap-2 items-start"><b className="shrink-0 w-12 tabular-nums">{st.time || '–'}</b><span className="min-w-0 flex-1"><b>{rtTdLabel(tk, st)}</b>{st.place ? ` · ${st.place}` : ''}{st.note ? <span className="block text-xs text-slate-600">{st.note}</span> : null}</span>{rtTdNav(st) ? <a href={rtTdNav(st)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-semibold text-blue-800 underline">Navigation</a> : null}</li>)}</ol>
            </section>) : null; })()}

          {(flights.length > 0 || cars.length > 0) && (
            <section className="rt3-left rounded-2xl border border-indigo-200 bg-indigo-50 p-4 space-y-2">
              <h3 className="text-sm font-bold text-indigo-950">Flug & Mietwagen heute</h3>
              {flights.map((f) => <div key={f.id} className="text-sm">{f.direction}: <b>{f.airline} {f.flightNumber}</b> · {f.from} → {f.to} · {f.departureTime} → {f.arrivalTime}{f.bookingCode ? ` · Buchungscode ${f.bookingCode}` : ''}</div>)}
              {cars.map((x, i) => <div key={i} className="text-sm">{x.what}: <b>{x.c.provider}</b> · {x.where} · {x.time}{x.c.bookingCode ? ` · ${x.c.bookingCode}` : ''}</div>)}
            </section>
          )}

          <div className="rt3-right space-y-3">
          <details key={day.iso} data-day-sched open className="rt-sched">
            <summary className="min-h-[48px] flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 cursor-pointer">Tagesplan {isToday ? 'heute' : fmtDayShort(day.iso)}<span className="text-xs font-semibold text-slate-500">auf-/zuklappen</span></summary>
            <div className="mt-2"><DayCard trip={trip} day={day} onSave={onSave} editable={false} nowMin={isToday ? nowMin : -1} isToday={isToday} hideWx afterRoute={wide ? null : hotelCard} /></div>
          </details>
          </div>

          {wide && hotelCard}

        </div>
      );
    }

    // ===== Organisation: Packliste, Dokumente, Reiseplan drucken, Vergleich =====
    const PACK_TEMPLATES = {
      'Dokumente': ['Reisepass / ESTA-Bestätigung', 'Führerschein + int. Führerschein', 'Kreditkarten (min. 2)', 'Flugtickets / Buchungscodes', 'Mietwagen-Bestätigung', 'Hotelbestätigungen', 'Auslandskrankenversicherung', 'Bargeld USD'],
      'Technik / Adapter': ['Adapter Typ A/B (USA)', 'Handy + Ladekabel', 'Powerbank', 'KFZ-Ladegerät / USB-Adapter', 'Handyhalterung fürs Auto', 'Kopfhörer', 'Kamera + Akku + Karte', 'Offline-Karten / diese HTML-Datei'],
      'Strand': ['Badesachen', 'Strandtuch', 'Sonnencreme LSF 50', 'Sonnenbrille', 'Cap / Hut', 'Flip-Flops', 'Wasserfeste Handyhülle'],
      'Auto / Roadtrip': ['Snacks und Getränke', 'Kühltasche', 'Müllbeutel', 'Feuchttücher', 'Reiseapotheke', 'Sonnenblende', 'Kleingeld für Maut'],
      'Kleidung': ['Unterwäsche', 'Socken', 'T-Shirts', 'Kurze Hosen', 'Lange Hose', 'Leichte Jacke / Regenjacke', 'Bequeme Schuhe', 'Schlafsachen']
    };
    function PackView({ trip, onSave }) {
      const people = trip.participants || []; const items = (trip.packing && trip.packing.items) || [];
      const [who, setWho] = useState('shared'); const [text, setText] = useState(''); const [pinfo, setPinfo] = useState('');
      const suggest = () => { const r = packSuggest(trip); const have = new Set(items.map((i) => (i.who || 'shared') + '|' + i.text)); const add2 = r.items.filter((x) => !have.has(x.who + '|' + x.text)).map((x) => ({ id: nid(), text: x.text, who: x.who, cat: x.cat, done: false })); if (add2.length) save([...items, ...add2]); setPinfo(add2.length ? `${add2.length} Einträge ergänzt. Grundlage: ${r.assump}.` : 'Es fehlt nichts: alle Vorschläge stehen schon in der Liste.'); }; const [tpl, setTpl] = useState(Object.keys(PACK_TEMPLATES)[0]);
      const save = (next) => onSave({ ...trip, packing: { ...(trip.packing || {}), items: next } }, '');
      const nid = () => `pk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const add = () => { const t = text.trim(); if (!t) return; save([...items, { id: nid(), text: t, who, done: false }]); setText(''); };
      const addTpl = () => { const have = new Set(items.filter((i) => i.who === who).map((i) => i.text)); const add2 = PACK_TEMPLATES[tpl].filter((t) => !have.has(t)).map((t) => ({ id: nid(), text: t, who, done: false })); if (add2.length) save([...items, ...add2]); };
      const groups = [{ id: 'shared', name: 'Gemeinsam' }, ...people.map((p) => ({ id: p.id, name: p.name }))];
      const done = items.filter((i) => i.done).length;
      return (
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-bold text-slate-900">Packliste</h3><span className="text-xs font-semibold text-slate-600">{done} von {items.length} gepackt</span></div>
            <div className="flex flex-wrap gap-2 items-end">
              <label className="text-xs font-semibold text-slate-700">Für
                <select value={who} onChange={(e) => setWho(e.target.value)} className="mt-1 block min-h-[44px] px-2 rounded-lg border border-slate-300 bg-white text-sm">{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
              </label>
              <div className="flex-1 min-w-[12rem] flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Neuer Gegenstand" className="flex-1 min-h-[44px] px-3 rounded-lg border border-slate-300 text-sm" />
                <button type="button" onClick={add} className="min-h-[44px] px-4 rounded-lg bg-blue-600 text-white text-sm font-bold">+</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <label className="text-xs font-semibold text-slate-700">Vorlage
                <select value={tpl} onChange={(e) => setTpl(e.target.value)} className="mt-1 block min-h-[44px] px-2 rounded-lg border border-slate-300 bg-white text-sm">{Object.keys(PACK_TEMPLATES).map((k) => <option key={k}>{k}</option>)}</select>
              </label>
              <button type="button" onClick={addTpl} className="min-h-[44px] px-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold">Vorlage zur Auswahl „Für“ hinzufügen</button>
            </div>
            <div className="rounded-xl border border-[#BCCDE6] bg-[#F5F8FC] p-3 space-y-2" data-pack-suggest>
              <div className="text-sm font-bold text-[#173B6B]">Packliste für diese Reise</div>
              <p className="text-xs text-slate-700">Erstellt eine Liste aus deinen Reisedaten: Dauer, Jahreszeit und Temperatur, Flug oder Auto, Ziele und Aktivitäten, Mitreisende. Vorhandene Einträge bleiben, nichts wird doppelt angelegt.</p>
              <button type="button" data-readonly-allow data-pack-go onClick={suggest} className="v18-btn pri">Packliste vorschlagen</button>
              {pinfo && <div data-pack-info className="text-xs text-slate-800">{pinfo}</div>}
            </div>
          </section>
          {groups.map((g) => {
            const list = items.filter((i) => (i.who || 'shared') === g.id); if (!list.length) return null;
            return (
              <section key={g.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5">
                <div className="flex items-center justify-between"><h4 className="text-sm font-bold text-slate-900">{g.name} <span className="text-xs font-normal text-slate-500">({list.filter((i) => i.done).length}/{list.length})</span></h4>
                  <button type="button" onClick={() => save(items.map((i) => (i.who === g.id ? { ...i, done: false } : i)))} className="text-xs text-slate-500 underline min-h-[32px]">alle zurücksetzen</button></div>
                {list.map((i) => (
                  <div key={i.id} className="flex items-center gap-2">
                    <label className="flex items-center gap-2 flex-1 min-h-[40px] cursor-pointer"><input type="checkbox" checked={!!i.done} onChange={() => save(items.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)))} className="w-5 h-5" /><span className={`text-sm ${i.done ? 'line-through text-slate-400' : 'text-slate-900'}`}>{i.text}</span>{i.cat && <span className="text-[11px] px-1.5 rounded bg-slate-100 text-slate-700">{i.cat}</span>}</label>
                    <button type="button" aria-label="Entfernen" onClick={() => save(items.filter((x) => x.id !== i.id))} className="min-h-[36px] w-9 rounded-lg text-slate-400 hover:text-red-600">✕</button>
                  </div>
                ))}
              </section>
            );
          })}
          {!items.length && <Empty icon="bag" title="Packliste ist leer" text="Wähle oben eine Vorlage oder füge Gegenstände hinzu." />}
        </div>
      );
    }

    // IndexedDB für Dokumente (bleibt im Browser, nicht in HTML/JSON-Export)
    const docsDb = () => new Promise((res, rej) => { try { const r = indexedDB.open('roadtrip_docs_v1', 1); r.onupgradeneeded = () => r.result.createObjectStore('docs', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } });
    const docsTx = async (mode, fn) => { const db = await docsDb(); return new Promise((res, rej) => { const tx = db.transaction('docs', mode); const st = tx.objectStore('docs'); const rq = fn(st); tx.oncomplete = () => res(rq && rq.result); tx.onerror = () => rej(tx.error); }); };
    const downscaleImage = (file) => new Promise((res) => {
      if (!/^image\//.test(file.type) || file.size < 1.5 * 1024 * 1024) return res(file);
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { const k = Math.min(1, 2000 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob((b) => { URL.revokeObjectURL(url); res(b || file); }, 'image/jpeg', 0.85); };
      img.onerror = () => { URL.revokeObjectURL(url); res(file); }; img.src = url;
    });
    const DOC_CATS = ['Flug', 'Hotel', 'Mietwagen', 'Versicherung', 'Tickets', 'Belege', 'Sonstiges'];
    function DocsView({ trip, onSave }) {
      const [docs, setDocs] = useState([]); const [err, setErr] = useState(''); const [cat, setCat] = useState('Flug'); const [busy, setBusy] = useState(false);
      const load = async () => { try { const all = await docsTx('readonly', (s) => s.getAll()); setDocs((all || []).sort((a, b) => b.added - a.added)); } catch (e) { setErr('Dokumentenablage in diesem Browser nicht verfügbar: ' + (e && e.message ? e.message : e)); } };
      useEffect(() => { load(); try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {} }, []);
      const onFiles = async (e) => {
        const files = [...e.target.files]; e.target.value = ''; if (!files.length) return; setBusy(true); setErr('');
        try { for (const f of files) { const blob = await downscaleImage(f); await docsTx('readwrite', (s) => s.put({ id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, type: blob.type || f.type, size: blob.size, cat, added: Date.now(), blob })); } await load(); docsChanged(); onSave({ ...trip }, ''); }
        catch (x) { setErr('Speichern fehlgeschlagen: ' + (x && x.message ? x.message : x)); } setBusy(false);
      };
      const open = (d) => { const u = URL.createObjectURL(d.blob); const w = window.open(u, '_blank'); if (!w) { const a = document.createElement('a'); a.href = u; a.download = d.name; a.click(); } setTimeout(() => URL.revokeObjectURL(u), 60000); };
      const del = async (d) => { if (!(await window.rtAsk(`„${d.name}“ löschen?`))) return; try { await docsTx('readwrite', (s) => s.delete(d.id)); await load(); docsChanged(); onSave({ ...trip }, ''); } catch (e) { setErr('Löschen fehlgeschlagen.'); } };
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-base font-bold text-slate-900">Dokumente</h3>
          <p className="text-xs text-slate-500">PDFs und Fotos (Tickets, Voucher, Versicherung) werden zusammen mit den Reisedaten in der Datendatei gespeichert (zum Beispiel in Google Drive) und auf jedem Gerät offline vorgehalten. Je größer die Dokumente, desto größer die Datei: am besten PDFs unter 3 MB, Fotos werden automatisch verkleinert.</p>
          {!IS_READ_ONLY_COPY && <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-semibold text-slate-700">Kategorie
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="mt-1 block min-h-[44px] px-2 rounded-lg border border-slate-300 bg-white text-sm">{DOC_CATS.map((c) => <option key={c}>{c}</option>)}</select>
            </label>
            <label className="min-h-[44px] inline-flex items-center px-4 rounded-lg bg-blue-600 text-white text-sm font-bold cursor-pointer">{busy ? 'Speichere …' : '+ Dateien wählen'}<input type="file" multiple accept="application/pdf,image/*" onChange={onFiles} className="hidden" /></label>
          </div>}
          {docs.length > 0 && <div className={`text-xs rounded-lg p-2 border ${docs.reduce((a, d) => a + d.size, 0) > 25 * 1024 * 1024 ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>Gesamtgröße: {(docs.reduce((a, d) => a + d.size, 0) / 1048576).toFixed(1)} MB{docs.reduce((a, d) => a + d.size, 0) > 25 * 1024 * 1024 ? '. Das ist viel: Laden und Speichern der Datei werden langsam, besonders auf dem Handy.' : ''}</div>}
          {err && <div className="text-xs rounded-lg bg-red-50 border border-red-200 text-red-900 p-2">{err}</div>}
          {docs.length === 0 && !err && <div className="text-sm text-slate-500">Noch keine Dokumente.</div>}
          {DOC_CATS.map((c) => { const l = docs.filter((d) => d.cat === c); if (!l.length) return null; return (
            <div key={c} className="space-y-1.5"><div className="text-xs font-bold text-slate-700">{c}</div>
              {l.map((d) => <div key={d.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2"><span className="text-lg">{/pdf/.test(d.type) ? <Ic n="file" /> : <Ic n="image" />}</span><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-slate-900 break-all">{d.name}</div><div className="text-[11px] text-slate-500">{(d.size / 1024).toFixed(0)} KB</div></div>
                <button data-readonly-allow type="button" onClick={() => open(d)} className="min-h-[36px] px-3 rounded-lg bg-slate-800 text-white text-xs font-bold">Öffnen</button>
                {!IS_READ_ONLY_COPY && <button type="button" aria-label="Löschen" onClick={() => del(d)} className="min-h-[36px] w-9 rounded-lg text-slate-400 hover:text-red-600">✕</button>}</div>)}
            </div>); })}
        </section>
      );
    }

    function PrintPlan({ trip, onClose }) {
      useEffect(() => { document.body.classList.add('printing-plan'); const done = () => { document.body.classList.remove('printing-plan'); onClose(); }; window.addEventListener('afterprint', done); const t = setTimeout(() => window.print(), 300); return () => { clearTimeout(t); window.removeEventListener('afterprint', done); document.body.classList.remove('printing-plan'); }; }, []);
      const days = buildDays(trip); const h2 = { fontSize: '14pt', fontWeight: 800, margin: '14px 0 4px' };
      return ReactDOM.createPortal(
        <div className="print-overlay" style={{ background: '#fff', color: '#000', padding: 16, fontSize: '10.5pt', lineHeight: 1.35 }}>
          <button type="button" className="no-print" onClick={onClose} style={{ position: 'fixed', top: 8, right: 8, padding: '8px 14px', background: '#111', color: '#fff', borderRadius: 8 }}>Schließen</button>
          <h1 style={{ fontSize: '20pt', fontWeight: 800 }}>{(trip.meta && trip.meta.title) || 'Reiseplan'}</h1>
          <div>{(trip.meta && trip.meta.startDate) || ''} – {(trip.meta && trip.meta.endDate) || ''} · Reisende: {(trip.participants || []).map((p) => p.name).join(', ')}</div>
          {(trip.flights || []).length > 0 && <div><div style={h2}>Flüge</div>{trip.flights.map((f) => <div key={f.id}>{f.direction}: {f.airline} {f.flightNumber}, {f.from} → {f.to}, {f.departureDate} {f.departureTime} → {f.arrivalTime}{f.bookingCode ? `, Code ${f.bookingCode}` : ''}</div>)}</div>}
          {(trip.rentalCars || []).length > 0 && <div><div style={h2}>Mietwagen</div>{trip.rentalCars.map((c) => <div key={c.id}>{c.provider}, {c.carClass}: Abholung {c.pickupDate} {c.pickupTime} ({c.pickupLocation}); Rückgabe {c.dropoffDate} {c.dropoffTime}; {c.bookingCode}</div>)}</div>}
          <div style={h2}>Unterkünfte</div>
          {(trip.stages || []).map((s, i) => <div key={s.id} style={{ breakInside: 'avoid' }}>{i + 1}. {s.dateRange}: <b>{(s.hotel && s.hotel.name) || s.toCity}</b>, {s.hotel && s.hotel.address}. Check-in {(s.hotel && s.hotel.checkIn) || '—'}, Check-out {(s.hotel && s.hotel.checkOut) || '—'}{s.hotel && s.hotel.bookingCode ? `, Code ${s.hotel.bookingCode}` : ''}</div>)}
          <div style={h2}>Tagesplan</div>
          {days.map((d) => {
            const tl = d.kind === 'travel' ? buildTimeline(trip, d) : null; const acts = d.dayInStage ? attractionsForDay(d.stage, d.dayInStage) : [];
            return <div key={d.iso} style={{ breakInside: 'avoid', borderTop: '1px solid #999', padding: '6px 0' }}>
              <b>{fmtDayLong(d.iso)}</b> – {d.kind === 'travel' ? `Anreise ${d.stage.fromCity || ''} → ${d.stage.toCity || ''}` : d.kind === 'stay' ? `Aufenthalt ${d.stage.toCity || ''}` : `Check-out ${d.stage.toCity || ''}`}
              {tl && tl.events.map((e, i) => <div key={i} style={{ marginLeft: 12 }}>{fmtHM(e.at)} {e.title}{e.kind === 'stop' ? ` (${fmtDurMin(e.dwell)})` : ''}{e.address ? ` – ${e.address}` : ''}</div>)}
              {tl && tl.warnings.map((w, i) => <div key={i} style={{ marginLeft: 12 }}>! {w}</div>)}
              {acts.map((a) => <div key={a.id} style={{ marginLeft: 12 }}>★ {a.name}{a.time ? ` (${a.time})` : ''}{a.booked ? ` – ${a.booked}` : ''}</div>)}
            </div>;
          })}
          {(trip.emergencyContacts || []).length > 0 && <div><div style={h2}>Notfallnummern</div>{trip.emergencyContacts.map((e) => <div key={e.id}>{e.organization}: {e.displayPhone || e.phone}</div>)}</div>}
        </div>, document.body);
    }

    function variantMetrics(stages) {
      let km = 0, min = 0, cost = 0, stops = 0, acts = 0;
      stages.forEach((s) => { const rt = s.routeToHotel || {}; const k = toNum(rt.distanceKm); if (Number.isFinite(k)) km += k; const d = parseDurMin(rt.duration); if (d != null) min += d; cost += Number(s.hotel && (s.hotel.priceNewEur || s.hotel.priceOldEur)) || 0; stops += (rt.stopsOnWay || []).length; acts += (s.localAttractions || []).length; });
      return { km, min, cost, stops, acts };
    }
    function CompareView({ trip, onSave }) {
      const vars = trip.variants || []; const [name, setName] = useState(''); const [a, setA] = useState('current'); const [b, setB] = useState(vars[0] ? vars[0].id : 'current');
      const nid = () => `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const snap = (stages) => JSON.parse(JSON.stringify(stages));
      const saveVar = () => { const n = name.trim() || `Variante ${vars.length + 1}`; const v = { id: nid(), name: n, created: new Date().toISOString(), stages: snap(trip.stages || []) }; onSave({ ...trip, variants: [...vars, v].slice(-8) }, ''); setName(''); };
      const restore = async (v) => { if (!(await window.rtAsk(`„${v.name}“ wiederherstellen? Der aktuelle Stand wird vorher als Variante gesichert.`))) return; const cur = { id: nid(), name: `Vor Wiederherstellung ${new Date().toLocaleString('de-DE')}`, created: new Date().toISOString(), stages: snap(trip.stages || []) }; onSave({ ...trip, stages: snap(v.stages), variants: [...vars, cur].slice(-8) }, ''); };
      const rm = async (v) => { if ((await window.rtAsk(`Variante „${v.name}“ löschen?`))) onSave({ ...trip, variants: vars.filter((x) => x.id !== v.id) }, ''); };
      const get = (id) => (id === 'current' ? { name: 'Aktuell', stages: trip.stages || [] } : vars.find((v) => v.id === id));
      const VA = get(a), VB = get(b); const opts = [{ id: 'current', name: 'Aktuell' }, ...vars];
      const row = (label, x, y, fmt, lowerBetter) => { const dx = y - x; const cls = dx === 0 ? '' : (lowerBetter ? dx < 0 : dx > 0) ? 'text-emerald-700' : 'text-red-700'; return <tr key={label} className="border-t border-slate-200"><td className="py-1.5 pr-2 font-semibold">{label}</td><td className="py-1.5 pr-2 tabular-nums">{fmt(x)}</td><td className="py-1.5 pr-2 tabular-nums">{fmt(y)}</td><td className={`py-1.5 tabular-nums font-bold ${cls}`}>{dx === 0 ? '±0' : (dx > 0 ? '+' : '−') + fmt(Math.abs(dx))}</td></tr>; };
      const ma = VA ? variantMetrics(VA.stages) : null, mb = VB ? variantMetrics(VB.stages) : null;
      const maxN = VA && VB ? Math.max(VA.stages.length, VB.stages.length) : 0;
      return (
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Routen-Varianten</h3>
            <p className="text-xs text-slate-500">Sichere den aktuellen Stand der Etappen als Variante, ändere die Route und vergleiche danach beide nebeneinander. Es werden höchstens 8 Varianten gehalten.</p>
            <div className="flex gap-2 flex-wrap"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name der Variante" className="flex-1 min-w-[12rem] min-h-[44px] px-3 rounded-lg border border-slate-300 text-sm" /><button type="button" onClick={saveVar} className="min-h-[44px] px-4 rounded-lg bg-blue-600 text-white text-sm font-bold">Aktuellen Stand sichern</button></div>
            {vars.map((v) => <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2"><div className="min-w-0"><div className="text-sm font-semibold break-words">{v.name}</div><div className="text-[11px] text-slate-500">{new Date(v.created).toLocaleString('de-DE')} · {v.stages.length} Etappen</div></div><div className="flex gap-1.5"><button type="button" onClick={() => restore(v)} className="min-h-[36px] px-3 rounded-lg border border-slate-300 text-xs font-semibold">Wiederherstellen</button><button type="button" aria-label="Löschen" onClick={() => rm(v)} className="min-h-[36px] w-9 rounded-lg text-slate-400 hover:text-red-600">✕</button></div></div>)}
          </section>
          {vars.length > 0 && VA && VB && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-slate-700">A<select value={a} onChange={(e) => setA(e.target.value)} className="mt-1 w-full min-h-[44px] px-2 rounded-lg border border-slate-300 bg-white text-sm">{opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
                <label className="text-xs font-semibold text-slate-700">B<select value={b} onChange={(e) => setB(e.target.value)} className="mt-1 w-full min-h-[44px] px-2 rounded-lg border border-slate-300 bg-white text-sm">{opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
              </div>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th></th><th>A</th><th>B</th><th>B − A</th></tr></thead><tbody>
                {row('Strecke', ma.km, mb.km, (v) => `${Math.round(v)} km`, true)}
                {row('Fahrzeit', ma.min, mb.min, (v) => fmtDurMin(v), true)}
                {row('Hotelkosten', ma.cost, mb.cost, (v) => formatEur(v), true)}
                {row('Stopps unterwegs', ma.stops, mb.stops, (v) => String(v), false)}
                {row('Aktionen vor Ort', ma.acts, mb.acts, (v) => String(v), false)}
              </tbody></table></div>
              <p className="text-[11px] text-slate-500">Grün = besser, rot = schlechter (weniger Strecke, Zeit und Kosten gelten als besser). Die Werte stammen aus den eingetragenen Etappendaten.</p>
              <div className="space-y-2">
                {Array.from({ length: maxN }).map((_, i) => { const x = VA.stages[i], y = VB.stages[i]; const sa = x ? `${hotelName(x)} · ${Number.isFinite(toNum(x.routeToHotel && x.routeToHotel.distanceKm)) ? Math.round(toNum(x.routeToHotel.distanceKm)) : '?'} km · ${(x.routeToHotel && x.routeToHotel.duration) || '?'} · ${(x.hotel && (x.hotel.priceNewEur || x.hotel.priceOldEur)) ? formatEur(x.hotel.priceNewEur || x.hotel.priceOldEur) : '—'}` : '—'; const sb = y ? `${hotelName(y)} · ${Number.isFinite(toNum(y.routeToHotel && y.routeToHotel.distanceKm)) ? Math.round(toNum(y.routeToHotel.distanceKm)) : '?'} km · ${(y.routeToHotel && y.routeToHotel.duration) || '?'} · ${(y.hotel && (y.hotel.priceNewEur || y.hotel.priceOldEur)) ? formatEur(y.hotel.priceNewEur || y.hotel.priceOldEur) : '—'}` : '—'; const diff = sa !== sb;
                  return <div key={i} className={`grid grid-cols-1 sm:grid-cols-2 gap-1 rounded-lg border p-2 text-xs ${diff ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}><div><b>A · Etappe {i + 1}:</b> {sa}</div><div><b>B · Etappe {i + 1}:</b> {sb}</div></div>; })}
              </div>
            </section>
          )}
        </div>
      );
    }

    function OrgView({ trip, onSave }) {
      const [sub, setSub] = useState('pack'); const [printing, setPrinting] = useState(false);
      const tabs = [['pack', 'Packliste'], ['docs', 'Dokumente'], ['print', 'Reiseplan drucken'], ['share', 'Teilen'], ['cmp', 'Vergleich']];
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">{tabs.map(([id, l]) => <button key={id} type="button" onClick={() => setSub(id)} className={`min-h-[44px] px-3 rounded-lg text-sm font-semibold border ${sub === id ? 'bg-[#1F4E8C] text-white border-[#1F4E8C]' : 'bg-white text-slate-700 border-slate-300'}`}>{l}</button>)}</div>
          {sub === 'pack' && <PackView trip={trip} onSave={onSave} />}
          {sub === 'docs' && <DocsView trip={trip} onSave={onSave} />}
          {sub === 'share' && <SharePanel trip={trip} />}
          {sub === 'cmp' && <CompareView trip={trip} onSave={onSave} />}
          {sub === 'print' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <h3 className="text-base font-bold text-slate-900">Reiseplan drucken</h3>
              <p className="text-xs text-slate-500">Erzeugt eine druckfreundliche Seite mit Flügen, Mietwagen, Unterkünften, Tagesplan und Notfallnummern (ohne Kreditkartendaten). Im Druckdialog kannst du „Als PDF speichern“ wählen.</p>
              <button type="button" onClick={() => setPrinting(true)} className="min-h-[44px] px-4 rounded-lg bg-blue-600 text-white text-sm font-bold">Druckansicht öffnen</button>
              {printing && <PrintPlan trip={trip} onClose={() => setPrinting(false)} />}
            </section>
          )}
        </div>
      );
    }

    