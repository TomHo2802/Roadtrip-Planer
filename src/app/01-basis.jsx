
    const { useState, useEffect, useMemo, useRef } = React;

    const LOCAL_STORAGE_KEY = 'roadtrip_florida_complete_v4';
    const DRIVE_SETTINGS_KEY = 'roadtrip_planner_cloud_config_v1';
    const OFFLINE_CACHE_STATUS_KEY = 'roadtrip_offline_cache_status_v1';
    const BACKUP_KEY = 'roadtrip_rolling_backups_v1';
    const SCHEMA_VERSION = 2;
    try { if (localStorage.getItem('roadtrip_device_mode_v1') === 'readonly') document.documentElement.setAttribute('data-roadtrip-readonly', 'true'); } catch (e) {}
    const IS_READ_ONLY_COPY = document.documentElement.hasAttribute('data-roadtrip-readonly');
    const freshId = () => { const bytes=new Uint8Array(18); if(globalThis.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes); else for(let i=0;i<bytes.length;i++) bytes[i]=Math.floor(Math.random()*256); return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join(''); };
    const isDate = v => { if(!v) return true; if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false; const d=new Date(v+'T00:00:00Z'); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10)===v; };
    const normalizeHotelLink = value => { const raw=String(value||'').trim(); if(!raw) return ''; const hasHttp=/^https?:\/\//i.test(raw); const looksLikeOtherScheme=/^[a-z][a-z\d+.-]*:/i.test(raw)&&!/^[^/?#]+:\d+(?:[/?#]|$)/.test(raw); if(!hasHttp&&looksLikeOtherScheme) return ''; const candidate=hasHttp?raw:`https://${raw}`; try { const url=new URL(candidate); return (url.protocol==='http:'||url.protocol==='https:')&&url.hostname?url.href:''; } catch { return ''; } };
    const normalizeTrip = value => {
      if (!value || typeof value !== 'object' || Array.isArray(value) || !value.meta || typeof value.meta !== 'object' || !Array.isArray(value.stages)) throw new Error('Erwartet werden Reisedaten mit meta und stages[].');
      const out = { ...value, meta: { ...value.meta }, participants: Array.isArray(value.participants)?value.participants:[], customExpenses: Array.isArray(value.customExpenses)?value.customExpenses:[], creditCards: (Array.isArray(value.creditCards)?value.creditCards:[]).map(cardSanitize), emergencyContacts: Array.isArray(value.emergencyContacts)?value.emergencyContacts:[], flights: Array.isArray(value.flights)?value.flights:[], rentalCars: Array.isArray(value.rentalCars)?value.rentalCars:[], stages: value.stages, checklist: Array.isArray(value.checklist)?value.checklist:[] };
      out.stages = out.stages.map(stage => stage && typeof stage === 'object' ? { ...stage, hotel: { ...(stage.hotel||{}), bookingLink: normalizeHotelLink(stage.hotel?.bookingLink), hotelLink: normalizeHotelLink(stage.hotel?.hotelLink) } } : stage);
      if (!isDate(out.meta.startDate) || !isDate(out.meta.endDate)) throw new Error('Start- und Enddatum müssen gültige ISO-Daten sein.');
      if (out.meta.startDate && out.meta.endDate && out.meta.endDate < out.meta.startDate) throw new Error('Das Enddatum liegt vor dem Startdatum.');
      if (out.meta.exchangeRate != null && (!Number.isFinite(Number(out.meta.exchangeRate)) || Number(out.meta.exchangeRate) <= 0)) throw new Error('Ungültiger Wechselkurs.');
      for (const key of ['stages','participants','customExpenses','creditCards','emergencyContacts','flights','rentalCars','checklist']) {
        const ids = new Set(); for (const item of out[key]) { if (!item || typeof item !== 'object' || (item.id != null && (typeof item.id !== 'string' || item.id.length > 200))) throw new Error('Ungültiger Eintrag oder ID in ' + key + '.'); if (item.id && ids.has(item.id)) throw new Error('Doppelte ID in ' + key + '.'); if(item.id) ids.add(item.id); for(const [k,v] of Object.entries(item)) if(/amount|price|budget|limit|rate/i.test(k) && v !== '' && v != null && (!Number.isFinite(Number(v)) || Number(v)<0)) throw new Error('Ungültiger Betrag in ' + key + '.'); }
      }
      out.meta.schemaVersion = SCHEMA_VERSION; out.meta.version = Math.max(1, Number(out.meta.version)||1); return out;
    };
    const tripDayCount = (start,end) => {
      if(!isDate(start)||!isDate(end)||!start||!end||end<start) return 0;
      return Math.floor((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000)+1;
    };
    // Lokale Kalendertage vergleichen; UTC-Tagesnummern vermeiden Sommerzeit-/Zeitzonenfehler.
    const localDateDayNumber = (iso) => {
      if (!isDate(iso) || !iso) return null;
      const [year, month, day] = iso.split('-').map(Number);
      return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
    };
    const formatElapsedTripTime = (days) => {
      if (days < 7) return `Vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
      if (days < 30) { const weeks = Math.floor(days / 7); return `Vor ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`; }
      if (days < 365) { const months = Math.floor(days / 30.4375); return `Vor ${months} ${months === 1 ? 'Monat' : 'Monaten'}`; }
      const years = Math.floor(days / 365.2425);
      const remainderMonths = Math.floor((days - years * 365.2425) / 30.4375);
      return `Vor ${years} ${years === 1 ? 'Jahr' : 'Jahren'}${remainderMonths > 0 ? ` und ${remainderMonths} ${remainderMonths === 1 ? 'Monat' : 'Monaten'}` : ''}`;
    };
    const calculateTripTimeline = (start, end, todayIso) => {
      if (!isDate(start) || !start) return { status: 'none', label: 'Kein Startdatum', days: null };
      const today = todayIso || (() => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
      const todayNum = localDateDayNumber(today), startNum = localDateDayNumber(start), endNum = isDate(end) && end ? localDateDayNumber(end) : null;
      const remaining = startNum - todayNum;
      const formattedStart = new Date(startNum * 86400000).toLocaleDateString('de-DE', {day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'});
      if (remaining > 0) return {status:'upcoming', days:remaining, label:remaining===1 ? 'Morgen geht’s los' : `Noch ${remaining} ${remaining===1?'Tag':'Tage'} bis zum Start`, formattedStart};
      if (remaining === 0) return {status:'today', days:0, label:'Heute geht’s los', formattedStart};
      if (endNum !== null && endNum < todayNum) {
        const elapsed = todayNum - endNum;
        return {status:'past', days:-elapsed, label:`${formatElapsedTripTime(elapsed)} beendet`, formattedStart};
      }
      if (endNum !== null && endNum >= todayNum) {
        const tripDay = todayNum - startNum + 1, totalDays = endNum - startNum + 1;
        return {status:'ongoing', days:0, label:`Tag ${tripDay} von ${totalDays}`, formattedStart};
      }
      return {status:'none', days:null, label:'Kein Enddatum', formattedStart};
    };
    const isoDay = (start,index) => new Date(Date.parse(start+'T00:00:00Z')+index*86400000).toISOString().slice(0,10);
    const dateInputValue = value => { if (isDate(value)) return value; if (typeof value === 'string') { const iso = value.match(/\d{4}-\d{2}-\d{2}/); if (iso && isDate(iso[0])) return iso[0]; const de = value.match(/(?:^|\D)(\d{2})\.(\d{2})\.(\d{4})(?:$|\D)/); if (de) { const candidate = `${de[3]}-${de[2]}-${de[1]}`; if (isDate(candidate)) return candidate; } } return ''; };
    const tripDateProps = (trip, extra = {}) => ({ min: trip?.meta?.startDate || undefined, max: trip?.meta?.endDate || undefined, ...extra });
    const validateTripDateValues = (data, previousData = null) => {
      const start=data?.meta?.startDate||'', end=data?.meta?.endDate||'';
      if(start&&end&&end<start) throw new Error('Das Reiseende liegt vor dem Reisestart.');
      const fields=new Set(['dateRange','departureDate','pickupDate','dropoffDate','date']);
      const visit=(value, previous, path=[])=>{
        if(Array.isArray(value)){value.forEach((item,index)=>visit(item,Array.isArray(previous)?previous[index]:undefined,[...path,index]));return;}
        if(!value||typeof value!=='object'){
          const key=path[path.length-1];
          if(fields.has(key)&&value!==previous&&typeof value==='string'&&value!==''&&isDate(value)&&((start&&value<start)||(end&&value>end)))
            throw new Error(`Das geänderte Datum ${value} liegt außerhalb der Reise (${start||'offen'} bis ${end||'offen'}).`);
          return;
        }
        Object.entries(value).forEach(([key,child])=>{ if(key==='variants'||key==='packing') return; visit(child,previous&&typeof previous==='object'?previous[key]:undefined,[...path,key]); });
      };
      visit(data,previousData);
    };
    const makeDailyStages = (start,end,from,to,rate=1.09) => Array.from({length:Math.max(1,tripDayCount(start,end)-1)},(_,i)=>({
      id:`stage-${Date.now()}-${i}-${freshId().slice(0,8)}`, fromCity:i===0?(from||'Startort'):(to||from||'Weiteres Ziel'),
      toCity:(i>0&&i===tripDayCount(start,end)-1)?(from||'Heimatort'):(to||'Ziel eintragen'), dateRange:isoDay(start,i), nights:i<tripDayCount(start,end)-1?1:0,
      routeToHotel:{distanceKm:'',duration:'',routeDescription:'',stopsOnWay:[]},
      hotel:{name:'',bookingLink:'',hotelLink:'',rating:'',address:'',gps:'',checkIn:'',checkOut:'',breakfast:'',parking:'',cancelUntil:'',priceOldEur:'',priceNewEur:'',priceUsd:'',prepaid:'',creditCard:'',paidBy:'',splitAmong:[],parkingGarageName:'',parkingGarageAddress:'',parkingGarageGps:'',remarks:'',chargeAnnounced:'',cardCharged:'',bookingCode:''},
      localAttractions:[]
    }));
    const canonical = x => Array.isArray(x) ? x.map(canonical) : x && typeof x==='object' ? Object.keys(x).sort().reduce((o,k)=>(o[k]=canonical(x[k]),o),{}) : x;
    const mergeById = (local, remote) => { const m={...remote, ...local, meta:{...remote.meta,...local.meta}}; for(const k of ['stages','participants','customExpenses','creditCards','emergencyContacts','flights','rentalCars','checklist']) if(Array.isArray(remote[k])||Array.isArray(local[k])) { const rows=new Map(); (remote[k]||[]).forEach(x=>rows.set(x.id||JSON.stringify(x),x)); (local[k]||[]).forEach(x=>rows.set(x.id||JSON.stringify(x),x)); m[k]=[...rows.values()]; } return normalizeTrip(m); };

    // Load initial data from embedded script or localStorage
    const getEmbeddedDefaultData = () => {
      try {
        const raw = document.getElementById('embedded-trip-data').textContent;
        return JSON.parse(raw);
      } catch (e) {
        return {
          meta: { title: '', startDate: '', endDate: '', exchangeRate: 1.0 },
          participants: [
            { id: 'p-1', name: 'Person 1', color: 'blue' },
            { id: 'p-2', name: 'Person 2', color: 'emerald' }
          ],
          customExpenses: [],
          creditCards: [],
          emergencyContacts: [],
          flights: [],
          rentalCars: [],
          stages: [],
          checklist: []
        };
      }
    };

    const hasTripData = (d) => !!(d && d.meta && d.meta.title && Array.isArray(d.stages) && d.stages.length > 0);
    const getInitialData = () => {
      const defaultData = getEmbeddedDefaultData();

      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Leerer/kaputter lokaler Stand darf eingebettete Reisedaten nicht überdecken.
          if (!hasTripData(parsed) && hasTripData(defaultData)) return defaultData;
          if (parsed && parsed.meta && parsed.meta.title === '' && Array.isArray(parsed.stages) && !hasTripData(defaultData)) {
            return { ...parsed, participants: parsed.participants || [], customExpenses: parsed.customExpenses || [], creditCards: parsed.creditCards || [], emergencyContacts: parsed.emergencyContacts || [], flights: parsed.flights || [], rentalCars: parsed.rentalCars || [], stages: parsed.stages || [], checklist: parsed.checklist || [] };
          }
          if (parsed && Array.isArray(parsed.stages)) {
            return {
              ...defaultData,
              ...parsed,
              participants: parsed.participants && parsed.participants.length ? parsed.participants : defaultData.participants,
              customExpenses: parsed.customExpenses || defaultData.customExpenses || [],
              creditCards: parsed.creditCards && parsed.creditCards.length ? parsed.creditCards : defaultData.creditCards,
              emergencyContacts: parsed.emergencyContacts && parsed.emergencyContacts.length ? parsed.emergencyContacts : defaultData.emergencyContacts
            };
          }
        }
      } catch (e) {
        console.warn('LocalStorage Lese-Warnung:', e);
      }
      // Kein lokaler Stand: eingebettete Reisedaten verwenden, falls vorhanden.
      if (hasTripData(defaultData)) return defaultData;
      // Sonst leeres Modell und Wizard.
      return {
        meta: { title: '', subtitle: '', startDate: '', endDate: '', exchangeRate: 1.09 },
        participants: [], customExpenses: [], creditCards: [], emergencyContacts: [], flights: [], rentalCars: [], stages: [], checklist: []
      };
    };

    const formatEur = (val) => {
      const num = parseFloat(val) || 0;
      return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    };

    const formatUsd = (val) => {
      const num = parseFloat(val) || 0;
      return '$' + num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const isPositiveValue = (val) => {
      if (!val) return false;
      const v = String(val).toLowerCase().trim();
      return v === 'ja' || v === 'inkl.' || v === 'inklusive' || v === 'kostenlos' || v === 'bezahlt' || v === 'gebucht' || v === 'möglich';
    };

    const cycleYesNoOption = (currentVal, options = ['ja', 'nein']) => {
      const norm = String(currentVal || '').toLowerCase().trim();
      const idx = options.findIndex((o) => o.toLowerCase() === norm);
      if (idx === -1) return options[0];
      return options[(idx + 1) % options.length];
    };

    const getGoogleMapsUrl = (gps, address, name) => {
      const query = gps && gps.trim() !== '' ? gps.trim() : `${name || ''} ${address || ''}`.trim();
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    };

    const getAppleMapsUrl = (gps, address, name) => {
      const query = gps && gps.trim() !== '' ? gps.trim() : `${name || ''} ${address || ''}`.trim();
      return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
    };

    const getOpenStreetMapUrl = (gps) => {
      if (!gps || !gps.includes(',')) return null;
      const [lat, lon] = gps.split(',').map((s) => s.trim());
      return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
    };

    // Extract URLs from free text for Offline Link Vault
    const extractUrlsFromText = (text) => {
      if (!text) return [];
      const regex = /(https?:\/\/[^\s,)]+|www\.[^\s,)]+)/gi;
      const matches = text.match(regex) || [];
      return matches.map((u) => (u.startsWith('http') ? u : `https://${u}`));
    };

    // Helper to parse km and mi from strings like "277 km (172 mi)"
    const parseKmAndMi = (str) => {
      if (!str) return { km: '', mi: '' };
      const kmMatch = String(str).match(/(\d+(?:[.,]\d+)?)\s*km/i);
      const miMatch = String(str).match(/(\d+(?:[.,]\d+)?)\s*mi/i);
      if (kmMatch || miMatch) {
        const km = kmMatch ? kmMatch[1].replace(',', '.') : '';
        const mi = miMatch ? miMatch[1].replace(',', '.') : km ? (parseFloat(km) * 0.621371).toFixed(0) : '';
        return { km, mi };
      }
      const numMatch = String(str).match(/(\d+(?:[.,]\d+)?)/);
      if (numMatch) {
        const km = numMatch[1].replace(',', '.');
        return { km, mi: (parseFloat(km) * 0.621371).toFixed(0) };
      }
      return { km: '', mi: '' };
    };

    // v118: Entfernungen in km und (je nach Zielland) in Meilen
    const RT_MI_BOX = [[24, 50, -125, -66], [51, 72, -170, -129], [18.5, 22.5, -161, -154], [49.8, 60.9, -5.9, 1.9], [17, 19, -68, -64]]; // USA, Alaska, Hawaii, Großbritannien, Puerto Rico/Jungferninseln
    const rtMilesAt = (g) => { const a = typeof parseGps === 'function' ? parseGps(g) : null; return !!a && RT_MI_BOX.some((b) => a[0] >= b[0] && a[0] <= b[1] && a[1] >= b[2] && a[1] <= b[3]); };
    const rtStageMiles = (stage) => rtMilesAt(stage && stage.hotel && stage.hotel.gps) || (!(stage && stage.hotel && stage.hotel.gps) && rtMilesAt(((stage && stage.routeToHotel && stage.routeToHotel.stopsOnWay) || []).map((x) => x.gps).filter(Boolean).pop()));
    const rtTripMiles = (trip) => { const st = ((trip && trip.stages) || []).filter((s) => s.hotel && s.hotel.gps); if (!st.length) return false; return st.filter(rtStageMiles).length * 2 > st.length; };
    const rtKmVal = (x) => { const m = /(\d+(?:[.,]\d+)?)\s*km/i.exec(String(x == null ? '' : x)); return m ? parseFloat(m[1].replace(',', '.')) : (typeof x === 'number' ? x : NaN); };
    // 277 -> "277 km" bzw. "277 km · 172 mi"
    const rtDist = (km, mi) => { if (!Number.isFinite(km) || km <= 0) return ''; const k = km < 10 ? (Math.round(km * 10) / 10).toString().replace('.', ',') : Math.round(km).toLocaleString('de-DE'); if (!mi) return `${k} km`; const m = km * 0.621371; return `${k} km · ${m < 10 ? (Math.round(m * 10) / 10).toString().replace('.', ',') : Math.round(m).toLocaleString('de-DE')} mi`; };
    // "Etappe 1 (14 km / 0,5 h)" -> "Etappe 1 (14 km · 9 mi / 0,5 h)"
    const rtMiText = (t, mi) => (!mi || !t ? t : String(t).replace(/(\d+(?:[.,]\d+)?)\s*km(?!\s*·)/gi, (all, n) => { const v = parseFloat(n.replace(',', '.')); return `${n} km · ${v * 0.621371 < 10 ? (Math.round(v * 0.621371 * 10) / 10).toString().replace('.', ',') : Math.round(v * 0.621371)} mi`; }));

    const getCardColorClasses = (color) => rtCardTheme(color);

    class AppErrorBoundary extends React.Component {
      constructor(props) { super(props); this.state = { error: null }; }
      static getDerivedStateFromError(error) { return { error }; }
      componentDidCatch(error, info) { console.error('Roadtrip-App-Fehler:', error, info); }
      render() {
        if (this.state.error) return <main role="alert" className="min-h-screen bg-rose-50 p-6 text-rose-950"><section className="mx-auto max-w-2xl rounded-2xl border border-rose-300 bg-white p-6 shadow"><h1 className="text-xl font-bold">Dieser Bereich konnte nicht angezeigt werden</h1><p className="mt-2">Ein Laufzeitfehler ist aufgetreten. Die übrigen Reisedaten bleiben erhalten.</p><pre className="mt-3 whitespace-pre-wrap rounded bg-rose-50 p-3 text-sm">{this.state.error?.message || String(this.state.error)}</pre><button type="button" className="mt-4 rounded-lg bg-rose-800 px-4 py-2 font-bold text-white" onClick={() => location.reload()}>App neu laden</button></section></main>;
        return this.props.children;
      }
    }

    