/* Roadtrip-Planer: gemeinsamer Baustein "Ort wählen" (Tippen, Karte, Umkreis). Wird vom Planer und vom Routen-Vorschlag benutzt. */
(function () {
  'use strict';
  if (window.RtOrt) return;
  var D = document;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hav(a, b) { var R = 6371, r = Math.PI / 180, x = Math.sin((b[0] - a[0]) * r / 2), y = Math.sin((b[1] - a[1]) * r / 2), h = x * x + Math.cos(a[0] * r) * Math.cos(b[0] * r) * y * y; return 2 * R * Math.asin(Math.sqrt(h)); }
  function fetchJ(url, ms) { var c = new AbortController(), t = setTimeout(function () { c.abort(); }, ms || 12000); return fetch(url, { signal: c.signal, headers: { Accept: 'application/json' } }).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }, function (e) { clearTimeout(t); throw e; }); }
  var KIND = { city: 'Stadt', town: 'Stadt', village: 'Ort', hamlet: 'Ort', suburb: 'Stadtteil', neighbourhood: 'Stadtteil', borough: 'Stadtteil', state: 'Bundesland', county: 'Landkreis', country: 'Land', island: 'Insel', aerodrome: 'Flughafen', hotel: 'Hotel', motel: 'Motel', guest_house: 'Pension', national_park: 'Nationalpark', attraction: 'Sehenswürdigkeit', beach: 'Strand', house: 'Adresse', street: 'Straße', car_rental: 'Autovermietung', parking: 'Parkplatz' };
  var NUMFIRST = { US: 1, CA: 1, GB: 1, AU: 1, NZ: 1, IE: 1, FR: 1 };
  function fromPhoton(f, mode) {
    var p = f.properties || {}, c = f.geometry && f.geometry.coordinates; if (!c) return null;
    var isAddr = p.type === 'house' || p.type === 'street'; if (mode !== 'addr' && (isAddr || !p.name)) return null;
    var cc = String(p.countrycode || '').toUpperCase(), street = p.street || (p.type === 'street' ? p.name : '');
    var line = street ? (p.housenumber ? (NUMFIRST[cc] ? p.housenumber + ' ' + street : street + ' ' + p.housenumber) : street) : '';
    var city = p.city || p.town || p.village || (p.type === 'city' ? p.name : '') || p.county || '', reg = p.state && p.state !== p.name ? p.state : p.country, subs = [];
    if (mode === 'addr' && line && p.name && p.name !== street) subs.push(line);
    if (city && city !== p.name) subs.push(city); if (p.state && p.state !== p.name && p.state !== city) subs.push(p.state); if (p.country) subs.push(p.country);
    var value, name;
    if (mode === 'addr') { name = p.name && p.type !== 'street' && p.name !== street ? p.name : (line || p.name || ''); var parts = []; if (line) parts.push(line); else if (p.name) parts.push(p.name); var cl = [p.postcode, city].filter(Boolean).join(' '); if (cl && cl !== parts[0]) parts.push(cl); if (p.state && p.state !== city && NUMFIRST[cc]) parts.push(p.state); if (p.country) parts.push(p.country); value = parts.join(', '); }
    else { name = p.name; value = p.name + (reg && reg !== p.name ? ', ' + reg : ''); }
    if (!name || !value) return null;
    return { value: value, name: name, sub: subs.join(', '), gps: [c[1], c[0]], kind: KIND[p.osm_value] || KIND[p.type] || '', cc: cc };
  }
  function fromNom(j, mode) {
    var ad = j.address || {}, nm = (mode !== 'addr' && (ad.city || ad.town || ad.village || ad.municipality || ad.hamlet)) || j.name || String(j.display_name || '').split(',')[0];
    if (!nm && ad.county) nm = ad.county; if (!nm) return null;
    var reg = ad.state && ad.state !== nm ? ad.state : ad.country, subs = []; if (ad.state && ad.state !== nm) subs.push(ad.state); if (ad.country) subs.push(ad.country);
    var value = mode === 'addr' ? String(j.display_name || nm) : nm + (reg && reg !== nm ? ', ' + reg : '');
    return { value: value, name: mode === 'addr' ? String(j.display_name || nm).split(',').slice(0, 2).join(',') : nm, sub: subs.join(', '), gps: [Number(j.lat), Number(j.lon)], kind: KIND[j.type] || '', cc: String(ad.country_code || '').toUpperCase() };
  }
  function search(q, mode, bias) {
    var dedupe = function (items) { var seen = {}; return items.filter(Boolean).filter(function (i) { var k = i.value + '|' + i.gps[0].toFixed(1) + i.gps[1].toFixed(1); if (seen[k]) return false; seen[k] = 1; return true; }).slice(0, 8); };
    return fetchJ('https://photon.komoot.io/api/?limit=10&lang=de&q=' + encodeURIComponent(q) + (bias ? '&lat=' + bias[0].toFixed(2) + '&lon=' + bias[1].toFixed(2) : ''), 8000).then(function (j) { return dedupe(((j && j.features) || []).map(function (f) { return fromPhoton(f, mode); })); })
      .catch(function () { return fetchJ('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&accept-language=de&q=' + encodeURIComponent(q), 10000).then(function (j) { return dedupe((j || []).map(function (x) { return fromNom(x, mode); })); }); });
  }
  function reverse(g, mode) { return fetchJ('https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&accept-language=de&zoom=' + (mode === 'addr' ? 18 : 10) + '&lat=' + g[0] + '&lon=' + g[1], 12000).then(function (j) { if (!j || j.error) return null; var it = fromNom(j, mode); if (it) it.gps = g; return it; }); }
  function around(g, km) {
    var q = '[out:json][timeout:25];(node[place~"^(city|town)$"](around:' + Math.round(km * 1000) + ',' + g[0] + ',' + g[1] + ');' + (km <= 60 ? 'node[place=village](around:' + Math.round(km * 1000) + ',' + g[0] + ',' + g[1] + ');' : '') + ');out 400;';
    return fetchJ('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q), 30000).then(function (j) {
      return ((j && j.elements) || []).filter(function (e) { return e.tags && e.tags.name; }).map(function (e) { var t = e.tags, pop = Number(t.population) || 0, d = hav(g, [e.lat, e.lon]); return { value: (t['name:de'] || t.name) + (t['addr:state'] || t['is_in:state'] ? ', ' + (t['addr:state'] || t['is_in:state']) : ''), name: t['name:de'] || t.name, sub: (KIND[t.place] || 'Ort') + (pop ? ' · ' + pop.toLocaleString('de-DE') + ' Einwohner' : '') + ' · ' + Math.round(d) + ' km entfernt', gps: [e.lat, e.lon], kind: '', cc: '', pop: pop, rank: (t.place === 'city' ? 2e6 : t.place === 'town' ? 1e5 : 0) + pop, needName: true }; })
        .sort(function (a, b) { return b.rank - a.rank; }).slice(0, 25);
    });
  }
  var cssDone = false;
  function css() {
    if (cssDone) return; cssDone = true; var st = D.createElement('style'); st.id = 'rto-css';
    st.textContent = '.rto-back{position:fixed;inset:0;z-index:100500;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:12px}' +
      '.rto{--b:#fff;--i:#0f172a;--m:#475569;--l:#cbd5e1;--p:#1d4ed8;--pi:#fff;background:var(--b);color:var(--i);border-radius:16px;width:min(980px,100%);max-height:calc(100vh - 24px);display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.4);font:15px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;overflow:hidden}' +
      'html[data-dark="1"] .rto{--b:#1e293b;--i:#f1f5f9;--m:#cbd5e1;--l:#475569;--p:#60a5fa;--pi:#0f172a}@media (prefers-color-scheme:dark){html:not([data-dark]) body.rto-auto .rto{--b:#1e293b;--i:#f1f5f9;--m:#cbd5e1;--l:#475569;--p:#60a5fa;--pi:#0f172a}}' +
      '.rto *{box-sizing:border-box}.rto-h{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--l)}.rto-h b{font-size:17px}' +
      '.rto button{font:inherit;font-weight:600;min-height:44px;padding:8px 14px;border-radius:10px;border:1px solid var(--l);background:var(--b);color:var(--i);cursor:pointer}.rto button.pri{background:var(--p);color:var(--pi);border-color:var(--p)}.rto button:disabled{opacity:.5;cursor:default}.rto button:focus-visible,.rto input:focus-visible,.rto select:focus-visible,.rto li:focus-visible{outline:3px solid var(--p);outline-offset:2px}' +
      '.rto input,.rto select{font:inherit;min-height:44px;padding:8px 12px;border-radius:10px;border:1px solid var(--l);background:var(--b);color:var(--i)}' +
      '.rto-s{display:flex;gap:8px;padding:12px 16px 6px}.rto-s input{flex:1;min-width:0}.rto-u{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:6px 16px 10px;font-size:14px;color:var(--m)}.rto-u select{min-height:40px;padding:4px 8px;width:auto;margin:0}.rto-s input{width:auto;margin:0}.rto-u button{min-height:40px}' +
      '.rto-b{display:flex;gap:0;min-height:0;flex:1;border-top:1px solid var(--l);border-bottom:1px solid var(--l)}.rto-map{flex:1;min-height:340px;background:#e2e8f0;position:relative}.rto-map .leaflet-container{position:absolute;inset:0;cursor:crosshair}' +
      '.rto-l{list-style:none;margin:0;padding:6px;width:300px;overflow:auto;border-left:1px solid var(--l)}.rto-l li{padding:8px 10px;border-radius:8px;cursor:pointer}.rto-l li small{display:block;color:var(--m);font-size:12.5px}.rto-l li[aria-selected=true]{background:var(--p);color:var(--pi)}.rto-l li[aria-selected=true] small{color:var(--pi)}.rto-l li:hover{outline:1px solid var(--p)}.rto-l .rto-empty{color:var(--m);cursor:default;outline:none}' +
      '.rto-msg{padding:0 16px;font-size:13.5px;color:var(--m);min-height:0}.rto-msg:not(:empty){padding:8px 16px}.rto-f{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:12px 16px}.rto-f>span:first-child{flex:1 1 260px;min-width:0}.rto-f small{color:var(--m)}.rto-f>span:last-child{display:flex;gap:8px}' +
      '.rto-pin{width:22px;height:22px;border-radius:50%;background:#dc2626;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.6)}.rto-dot{width:14px;height:14px;border-radius:50%;background:#1F4E8C;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)}' +
      '@media (max-width:720px){.rto-back{padding:0;align-items:stretch}.rto{border-radius:0;max-height:100vh;height:100%}.rto-b{flex-direction:column}.rto-map{min-height:230px;flex:1 1 230px}.rto-l{width:auto;border-left:0;border-top:1px solid var(--l);max-height:30vh;flex:0 0 auto}}' +
      '.rto-fab{position:absolute;z-index:99990;width:36px;height:36px;border-radius:9px;border:1px solid #94a3b8;background:#fff;color:#0f172a;font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 1px 4px rgba(0,0,0,.25)}.rto-fab[hidden]{display:none}@media print{.rto-fab,.rto-back{display:none!important}}';
    D.head.appendChild(st);
  }
  var OPEN = false;
  function pick(opts) {
    opts = opts || {}; var mode = opts.mode === 'addr' ? 'addr' : 'city';
    if (OPEN) return Promise.resolve(null); OPEN = true; css();
    return new Promise(function (resolve) {
      var prevFocus = D.activeElement, L = window.L, map = null, pin = null, dots = null, ring = null, sel = null, items = [], seq = 0, timer = null;
      var near = Array.isArray(opts.near) && isFinite(opts.near[0]) ? opts.near : null, RS = [25, 50, 100, 150, 200, 300, 500];
      var r0 = opts.radiusKm ? RS.reduce(function (p, c) { return Math.abs(c - opts.radiusKm) < Math.abs(p - opts.radiusKm) ? c : p; }, 100) : 100;
      var back = D.createElement('div'); back.className = 'rto-back'; back.setAttribute('data-rto', '');
      back.innerHTML = '<div class="rto" role="dialog" aria-modal="true" aria-label="' + esc(opts.title || 'Ort wählen') + '">' +
        '<div class="rto-h"><b>' + esc(opts.title || (mode === 'addr' ? 'Adresse wählen' : 'Ort wählen')) + '</b><button type="button" data-rto-x aria-label="Schließen">✕</button></div>' +
        '<div class="rto-s"><input data-rto-q type="search" autocomplete="off" aria-label="' + (mode === 'addr' ? 'Adresse oder Name suchen' : 'Ort suchen') + '" placeholder="' + (mode === 'addr' ? 'Adresse, Hotel oder Ort eintippen' : 'Ort eintippen, z. B. Saint Petersburg') + '"><button type="button" data-rto-go>Suchen</button></div>' +
        (mode === 'addr' ? '' : '<div class="rto-u"><span>Oder Orte im Umkreis von</span><select data-rto-r aria-label="Umkreis in Kilometern">' + RS.map(function (r) { return '<option value="' + r + '"' + (r === r0 ? ' selected' : '') + '>' + r + ' km</option>'; }).join('') + '</select><span>um <b data-rto-ref></b></span><button type="button" data-rto-around>Orte anzeigen</button></div>') +
        '<div class="rto-b"><div class="rto-map" data-rto-map role="img" aria-label="Karte. Ein Klick setzt den Ort."></div><ul class="rto-l" data-rto-list role="listbox" aria-label="Treffer"></ul></div>' +
        '<div class="rto-msg" data-rto-msg aria-live="polite"></div>' +
        '<div class="rto-f"><span data-rto-sel></span><span><button type="button" data-rto-cancel>Abbrechen</button><button type="button" class="pri" data-rto-ok disabled>Übernehmen</button></span></div></div>';
      D.body.appendChild(back);
      var $ = function (s) { return back.querySelector(s); }, q = $('[data-rto-q]'), list = $('[data-rto-list]'), msgEl = $('[data-rto-msg]'), okBtn = $('[data-rto-ok]');
      var msg = function (t) { msgEl.textContent = t || ''; };
      var refPoint = function () { return near || (sel && sel.gps) || (map ? [map.getCenter().lat, map.getCenter().lng] : null); };
      var refName = function () { return near ? (opts.nearLabel || 'den Bezugspunkt') : (sel && sel.gps ? sel.name || 'den gewählten Punkt' : 'die Kartenmitte'); };
      var drawSel = function () {
        var s = $('[data-rto-sel]');
        if (!sel) { s.innerHTML = '<small>Noch kein Ort gewählt. Tippe einen Namen ein, klicke in die Karte oder suche im Umkreis.</small>'; okBtn.disabled = true; }
        else { var d = near ? hav(near, sel.gps) : null; s.innerHTML = '<b data-rto-selname>' + esc(sel.busy ? 'Ort wird gesucht …' : (sel.value || 'Punkt ohne Namen')) + '</b><br><small>' + (sel.kind ? esc(sel.kind) + ' · ' : '') + sel.gps[0].toFixed(4) + ', ' + sel.gps[1].toFixed(4) + (d != null ? ' · etwa ' + Math.round(d * 1.3) + ' km Fahrstrecke von ' + esc(opts.nearLabel || 'dort') + (opts.radiusKm && d * 1.3 > opts.radiusKm * 1.6 ? ' · außerhalb des Suchbereichs' : '') : '') + '</small>'; okBtn.disabled = !!sel.busy || (!sel.value && !opts.allowUnnamed); }
        var rf = $('[data-rto-ref]'); if (rf) rf.textContent = refName();
        Array.prototype.forEach.call(list.children, function (li) { var it = items[+li.getAttribute('data-i')]; li.setAttribute('aria-selected', String(!!(sel && it && it.gps[0] === sel.gps[0] && it.gps[1] === sel.gps[1]))); });
      };
      var setPin = function (g, fly, zoom) { if (!map) return; if (!pin) { pin = L.marker(g, { draggable: true, zIndexOffset: 900, icon: L.divIcon({ className: '', html: '<div class="rto-pin" data-rto-pin></div>', iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(map); pin.on('dragend', function () { var ll = pin.getLatLng(); fromMap([ll.lat, ll.lng]); }); } else pin.setLatLng(g); if (fly) map.setView(g, Math.max(map.getZoom(), zoom || (mode === 'addr' ? 16 : 9))); };
      var choose = function (it, fly) { sel = { value: it.value, name: it.name, sub: it.sub, gps: it.gps, kind: it.kind, cc: it.cc }; setPin(it.gps, fly); drawSel(); if (it.needName && mode !== 'addr') { var my = ++seq; reverse(it.gps, mode).then(function (r) { if (my !== seq || !sel || !r) return; sel.value = it.name + (r.value.indexOf(', ') > 0 ? r.value.slice(r.value.indexOf(', ')) : ''); sel.cc = r.cc; drawSel(); }).catch(function () {}); } };
      var fromMap = function (g) { var my = ++seq; sel = { value: '', name: '', gps: g, busy: true }; setPin(g, false); drawSel(); msg(''); reverse(g, mode).then(function (r) { if (my !== seq) return; if (r) { sel = { value: r.value, name: r.name, sub: r.sub, gps: g, kind: r.kind, cc: r.cc }; } else { sel = { value: '', name: '', gps: g }; msg('Für diesen Punkt wurde kein Ortsname gefunden. Bitte einen anderen Punkt wählen.'); } drawSel(); }).catch(function () { if (my !== seq) return; sel = { value: '', name: '', gps: g }; drawSel(); msg('Der Ortsname konnte nicht geladen werden. Ohne Internet ist die Kartenwahl nicht möglich.'); }); };
      var showList = function (arr, emptyText) {
        items = arr; list.innerHTML = arr.length ? arr.map(function (it, i) { return '<li role="option" tabindex="0" data-i="' + i + '" aria-selected="false"><b>' + esc(it.name) + '</b>' + (it.kind ? ' <span>· ' + esc(it.kind) + '</span>' : '') + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</li>'; }).join('') : '<li class="rto-empty">' + esc(emptyText || 'Noch keine Treffer.') + '</li>';
        if (map) { if (dots) dots.clearLayers(); else dots = L.layerGroup().addTo(map); arr.forEach(function (it, i) { L.marker(it.gps, { icon: L.divIcon({ className: '', html: '<div class="rto-dot"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }), title: it.name }).on('click', function () { choose(items[i], false); }).addTo(dots); }); }
        drawSel();
      };
      var fit = function (pts) { if (!map || !pts.length) return; if (pts.length === 1) map.setView(pts[0], mode === 'addr' ? 15 : 8); else map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 12 }); };
      var doSearch = function () {
        var t = q.value.trim(); if (t.length < 3) { msg('Bitte mindestens 3 Buchstaben eingeben.'); return; } var my = ++seq; msg('Suche …');
        search(t, mode, refPoint()).then(function (arr) { if (my !== seq) return; msg(arr.length ? '' : 'Kein Treffer für „' + t + '“. Versuche es mit Bundesland oder Land.'); showList(arr, 'Kein Treffer.'); if (arr.length) { fit(arr.map(function (x) { return x.gps; })); if (arr.length === 1) choose(arr[0], false); } })
          .catch(function () { if (my !== seq) return; msg('Die Suche ist gerade nicht erreichbar. Ohne Internet ist die Ortssuche nicht möglich.'); showList([], 'Keine Verbindung.'); });
      };
      var drawRing = function (c, km) { if (!map) return; if (ring) { map.removeLayer(ring); ring = null; } ring = L.layerGroup().addTo(map); L.circle(c, { radius: km * 1000, color: '#1F4E8C', weight: 2, fillColor: '#1F4E8C', fillOpacity: 0.07, interactive: false }).addTo(ring); if (opts.minKm > 0 && near) L.circle(c, { radius: opts.minKm * 1000, color: '#1F4E8C', weight: 2, dashArray: '6 6', fillOpacity: 0, interactive: false }).addTo(ring); L.circleMarker(c, { radius: 7, color: '#173B6B', weight: 3, fillColor: '#fff', fillOpacity: 1, interactive: false }).addTo(ring); };
      var doAround = function () {
        var c = refPoint(), km = Number($('[data-rto-r]').value) || 100; if (!c) { msg('Bitte zuerst einen Punkt auf der Karte wählen.'); return; } var my = ++seq; msg('Suche Orte im Umkreis von ' + km + ' km um ' + refName() + ' …'); drawRing(c, km); if (map) map.fitBounds(L.latLng(c).toBounds(km * 2000), { padding: [10, 10] });
        around(c, km).then(function (arr) { if (my !== seq) return; msg(arr.length ? arr.length + ' Orte gefunden, die größten zuerst. Tippe einen an.' : 'Im Umkreis wurden keine Städte gefunden.'); showList(arr, 'Keine Orte gefunden.'); })
          .catch(function () { if (my !== seq) return; msg('Die Umkreissuche ist gerade nicht erreichbar. Du kannst trotzdem in die Karte klicken oder einen Namen eintippen.'); showList([], 'Keine Verbindung.'); });
      };
      var close = function (res) { if (!OPEN) return; OPEN = false; clearTimeout(timer); seq++; D.removeEventListener('keydown', onKey, true); try { if (map) map.remove(); } catch (e) {} back.remove(); try { if (prevFocus && prevFocus.focus) prevFocus.focus(); } catch (e) {} resolve(res); };
      var onKey = function (e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(null); return; }
        if (e.key === 'Tab') { var f = Array.prototype.filter.call(back.querySelectorAll('button,input,select,li[tabindex]'), function (x) { return !x.disabled && x.offsetParent !== null; }); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && D.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && D.activeElement === z) { e.preventDefault(); a.focus(); } else if (!back.contains(D.activeElement)) { e.preventDefault(); a.focus(); } }
      };
      D.addEventListener('keydown', onKey, true);
      back.addEventListener('mousedown', function (e) { if (e.target === back) close(null); });
      back.addEventListener('click', function (e) {
        var t = e.target; if (t.closest('[data-rto-x],[data-rto-cancel]')) return close(null);
        if (t.closest('[data-rto-ok]')) { if (sel && (sel.value || opts.allowUnnamed) && !sel.busy) close({ value: sel.value || '', name: sel.name || sel.value || '', sub: sel.sub || '', gps: sel.gps, kind: sel.kind || '', cc: sel.cc || '' }); return; }
        if (t.closest('[data-rto-go]')) return doSearch(); if (t.closest('[data-rto-around]')) return doAround();
        var li = t.closest('li[data-i]'); if (li) choose(items[+li.getAttribute('data-i')], true);
      });
      list.addEventListener('keydown', function (e) { var li = e.target.closest && e.target.closest('li[data-i]'); if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choose(items[+li.getAttribute('data-i')], true); } });
      q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); doSearch(); } });
      q.addEventListener('input', function () { clearTimeout(timer); if (q.value.trim().length >= 3) timer = setTimeout(doSearch, 450); });
      if (L) {
        try {
          map = L.map($('[data-rto-map]'), { scrollWheelZoom: true });
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap-Mitwirkende' }).addTo(map);
          var g0 = Array.isArray(opts.gps) && isFinite(opts.gps[0]) ? opts.gps : null;
          if (g0) map.setView(g0, mode === 'addr' ? 15 : 9); else if (near) map.setView(near, opts.radiusKm ? 6 : (mode === 'addr' ? 12 : 7)); else if (Array.isArray(opts.center) && isFinite(opts.center[0])) map.setView(opts.center, 6); else map.setView([30, 0], 2);
          map.on('click', function (e) { fromMap([e.latlng.lat, e.latlng.lng]); });
          if (typeof opts.onMap === 'function') { try { opts.onMap(map, L); } catch (e) {} }
          else if (near && opts.radiusKm) { drawRing(near, opts.radiusKm); map.fitBounds(L.latLng(near).toBounds(opts.radiusKm * 2000), { padding: [10, 10] }); }
          if (g0) setPin(g0, false);
          setTimeout(function () { if (map) try { map.invalidateSize(); } catch (e) {} }, 150);
        } catch (e) { map = null; }
      }
      if (!map) $('[data-rto-map]').innerHTML = '<div style="padding:16px;color:#334155">Die Karte konnte nicht geladen werden. Die Suche per Name funktioniert trotzdem.</div>';
      showList([], 'Treffer erscheinen hier.'); drawSel();
      var v0 = String(opts.value || '').trim(); if (v0) { q.value = v0; if (v0.length >= 3) doSearch(); }
      setTimeout(function () { try { q.focus(); q.select(); } catch (e) {} }, 60);
    });
  }
  // Kartenknopf am Ortsfeld
  var FAB = null, fabEl = null, cfgs = [];
  function cfgFor(el) { if (!el || !el.matches || el.disabled || el.readOnly) return null; for (var i = 0; i < cfgs.length; i++) if (el.matches(cfgs[i].selector)) return cfgs[i]; return null; }
  function place() { if (!FAB || !fabEl || !D.body.contains(fabEl)) { if (FAB) FAB.hidden = true; return; } var r = fabEl.getBoundingClientRect(); if (r.width < 120 || r.bottom < 0 || r.top > window.innerHeight) { FAB.hidden = true; return; } FAB.hidden = false; FAB.style.left = (r.right - 40 + window.scrollX) + 'px'; FAB.style.top = (r.top + (r.height - 36) / 2 + window.scrollY) + 'px'; }
  function openFor(el) {
    var c = cfgFor(el); if (!c) return Promise.resolve(null); if (FAB) FAB.hidden = true;
    return Promise.resolve(c.opts ? c.opts(el) : {}).then(function (o) { o = o || {}; if (o.value == null) o.value = el.value; return pick(o); }).then(function (res) { if (res) { try { c.onPick(el, res); } catch (e) {} } return res; });
  }
  function attach(cfg) {
    cfgs.push(cfg); css(); if (FAB) return;
    FAB = D.createElement('button'); FAB.type = 'button'; FAB.className = 'rto-fab'; FAB.hidden = true; FAB.setAttribute('data-rto-fab', ''); FAB.setAttribute('data-readonly-allow', ''); FAB.setAttribute('aria-label', 'Ort auf der Karte wählen'); FAB.title = 'Ort auf der Karte wählen'; FAB.textContent = '🗺'; FAB.tabIndex = -1; D.body.appendChild(FAB);
    FAB.addEventListener('mousedown', function (e) { e.preventDefault(); });
    FAB.addEventListener('click', function (e) { e.preventDefault(); var el = fabEl; if (el) openFor(el); });
    D.addEventListener('focusin', function (e) { if (OPEN) return; if (cfgFor(e.target)) { fabEl = e.target; place(); } });
    D.addEventListener('focusout', function (e) { if (e.target === fabEl) setTimeout(function () { if (D.activeElement !== fabEl && D.activeElement !== FAB) { FAB.hidden = true; } }, 250); });
    D.addEventListener('scroll', function () { if (FAB && !FAB.hidden) place(); }, { passive: true, capture: true }); window.addEventListener('resize', function () { if (FAB && !FAB.hidden) place(); });
    D.addEventListener('keydown', function (e) { if (e.altKey && (e.key === 'k' || e.key === 'K') && cfgFor(D.activeElement)) { e.preventDefault(); openFor(D.activeElement); } });
  }
  window.RtOrt = { pick: pick, attach: attach, openFor: openFor, isOpen: function () { return OPEN; } };
})();
