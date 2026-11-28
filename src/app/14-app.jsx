function App() {
      const [tripData, setTripData] = useState(getInitialData);
      const tripDataRef = useRef(tripData);
      useEffect(() => { tripDataRef.current = tripData; }, [tripData]);
      // Tabs: 'stages' | 'basics' | 'cards' | 'finance' | 'navi' | 'ustools' | 'cloud'
      const [activeTab, setActiveTab] = useState(() => { try { const sv = JSON.parse(sessionStorage.getItem('rt_nav_v1') || 'null'); if (sv && typeof sv.tab === 'string' && sv.tab) return sv.tab; } catch (e) {} try { const n = new Date(); const iso = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; return (tripData.meta && tripData.meta.tripId === 'demo-florida-v1') ? 'stages' : (buildDays(tripData).some((d) => d.iso === iso) ? 'today' : 'stages'); } catch (e) { return 'stages'; } });
      useEffect(() => {
        const activeMobileTab = document.querySelector(`nav[aria-label="Hauptnavigation"] [data-mobile-tab="${activeTab}"]`);
        activeMobileTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, [activeTab]);
      const [isReadOnly, setIsReadOnly] = useState(IS_READ_ONLY_COPY);
      useEffect(() => { document.body.classList.toggle('read-only-mode', isReadOnly); }, [isReadOnly]);
      const [expandedStages, setExpandedStages] = useState({});
      const [openStageId, setOpenStageId] = useState(() => { try { const sv = JSON.parse(sessionStorage.getItem('rt_nav_v1') || 'null'); return sv && sv.stage && ((tripData.stages || []).some((x) => x.id === sv.stage) || rtIsTravelId(sv.stage)) ? sv.stage : null; } catch (e) { return null; } }); const [stageTab, setStageTab] = useState('way');
      // v123: Zurück-Taste und Neuladen: Tab und geöffnete Etappe werden im Verlauf und in der Sitzung gemerkt
      const navRef = useRef({ init: false, pop: false, tab: null, stage: null });
      useEffect(() => { const r = navRef.current, st = { rt: 1, tab: activeTab, stage: openStageId || null }; try { if (!r.init) { r.init = true; history.replaceState(st, ''); } else if (!r.pop && (r.tab !== activeTab || r.stage !== (openStageId || null))) history.pushState(st, ''); r.pop = false; r.tab = activeTab; r.stage = openStageId || null; sessionStorage.setItem('rt_nav_v1', JSON.stringify({ tab: activeTab, stage: openStageId || null })); } catch (e) {} }, [activeTab, openStageId]);
      useEffect(() => { const f = (e) => { const x = e.state; if (!x || x.rt !== 1) return; const r = navRef.current; if (x.tab !== r.tab || (x.stage || null) !== r.stage) r.pop = true; setActiveTab(x.tab); setOpenStageId(x.stage || null); }; window.addEventListener('popstate', f); return () => window.removeEventListener('popstate', f); }, []);
      const openStagePage = (id, tab) => { setOpenStageId(id); setStageTab(tab || 'way'); try { window.scrollTo({ top: 0 }); } catch (e) {} };
      // Active Day Tab per multi-night stage: { 'stage-1': 1, 'stage-7': 1 } (0 = Alle Tage, 1 = Tag 1, 2 = Tag 2...)
      const [stageActiveDayTab, setStageActiveDayTab] = useState({});
      const [toastMessage, setToastMessage] = useState(null);
      const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
      const [offlineCacheStatus, setOfflineCacheStatus] = useState(() => {
        try {
          return JSON.parse(localStorage.getItem(OFFLINE_CACHE_STATUS_KEY)) || { cachedAt: null, count: 0 };
        } catch (e) {
          return { cachedAt: null, count: 0 };
        }
      });

      // Google Apps Script / Drive ist die einzige Cloud-Datenquelle.
      const [syncStatus, setSyncStatus] = useState('connecting');
      const [cloudVersion, setCloudVersion] = useState(0);
      const cloudVersionRef = useRef(0);
      const dirtyRef = useRef(false);
      const [cloudConflict, setCloudConflict] = useState(null);
      const [storageError, setStorageError] = useState('');
      const [fileDiff, setFileDiff] = useState(() => {
        try {
          if (IS_READ_ONLY_COPY) return false;
          const emb = getEmbeddedDefaultData();
          if (!hasTripData(emb) || !localStorage.getItem(LOCAL_STORAGE_KEY)) return false;
          const strip = (d) => canonical({ stages: d.stages || [], participants: d.participants || [], customExpenses: d.customExpenses || [], flights: d.flights || [], rentalCars: d.rentalCars || [] });
          let e; try { e = strip(normalizeTrip(JSON.parse(JSON.stringify(emb)))); } catch (x) { e = strip(emb); }
          return JSON.stringify(e) !== JSON.stringify(strip(getInitialData()));
        } catch (e) { return false; }
      });
      const [importPreview, setImportPreview] = useState(null);
      const [importError, setImportError] = useState('');
      const [deletePhrase, setDeletePhrase] = useState('');
      const [deleteBackup, setDeleteBackup] = useState(true);

      // Modals
      const [editingStageModal, setEditingStageModal] = useState(null);
      const [editingStageSection, setEditingStageSection] = useState('all');
      const [editingFlightModal, setEditingFlightModal] = useState(null);
      const [editingCarModal, setEditingCarModal] = useState(null);
      const [editingCardModal, setEditingCardModal] = useState(null);
      const [editingEmergencyModal, setEditingEmergencyModal] = useState(null);
      const [editingMetaModal, setEditingMetaModal] = useState(false);
      const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
      const [isNewTripWizardOpen, setIsNewTripWizardOpen] = useState(() => {
        if (IS_READ_ONLY_COPY) return false;
        try {
          if (hasTripData(getEmbeddedDefaultData())) return false;
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (!saved) return true;
          const parsed = JSON.parse(saved);
          return !(parsed && parsed.meta && parsed.meta.title);
        } catch (e) { return !hasTripData(getEmbeddedDefaultData()); }
      });
      const [wizardStep, setWizardStep] = useState(0);
      const [wizOpen, setWizOpen] = useState(false); const [wizStart, setWizStart] = useState(null);
      useEffect(() => { const f = (e) => { const d = e.detail || {}; if (d.stageId) { setOpenStageId(d.stageId); setStageTab(d.step || 'way'); } }; const g = () => setOpenStageId(null); const fo = (e) => { setActiveTab('stages'); f(e); setTimeout(() => { try { window.scrollTo(0, 0); } catch (x) {} }, 60); }; window.addEventListener('rt-assist', f); window.addEventListener('rt-stage-open', fo); window.addEventListener('rt-stage-list', g); return () => { window.removeEventListener('rt-assist', f); window.removeEventListener('rt-stage-open', fo); window.removeEventListener('rt-stage-list', g); }; }, []);
      useEffect(() => { if (openStageId && !rtIsTravelId(openStageId) && !(tripData.stages || []).some((s) => s.id === openStageId)) setOpenStageId(null); }, [tripData]);
      useEffect(() => { const f = (e) => { setWizStart((e.detail && e.detail.step) || null); setWizOpen(true); }; const gS = () => { setActiveTab('stages'); window.dispatchEvent(new CustomEvent('rt-stage-list')); setTimeout(() => { const el = document.querySelector('[data-plan-status]'); if (el) { el.scrollIntoView({ block: 'start' }); const dt = el.querySelector('[data-status-list]'); if (dt && el.querySelector('[data-state="todo"]')) dt.open = true; } }, 350); }; window.addEventListener('rt-wizard', f); window.addEventListener('rt-status', gS); return () => { window.removeEventListener('rt-wizard', f); window.removeEventListener('rt-status', gS); }; }, []);
      const [gateSkipped, setGateSkipped] = useState(false);
      const [linkClosed, setLinkClosed] = useState(false);
      const [wizardData, setWizardData] = useState({ title: '', startDate: '', endDate: '', days: '', startLocation: '', destination: '', people: '1', names: [], vehicle: '', budget: '', currency: 'EUR' });
      const wzSet = (patch) => setWizardData((w) => ({ ...w, ...patch }));
      const wzStart = (v) => setWizardData((w) => { const n = { ...w, startDate: v }; const d = parseInt(w.days, 10); if (v && d >= 1) n.endDate = isoDay(v, Math.min(d, 120) - 1); else if (v && w.endDate && w.endDate < v) { n.endDate = v; n.days = '1'; } else if (v && w.endDate) n.days = String(tripDayCount(v, w.endDate) || ''); return n; });
      const wzEnd = (v) => setWizardData((w) => ({ ...w, endDate: v, days: w.startDate && v ? String(tripDayCount(w.startDate, v) || '') : w.days }));
      const wzDays = (v) => setWizardData((w) => { const n = { ...w, days: v }; const d = parseInt(v, 10); if (w.startDate && d >= 1) n.endDate = isoDay(w.startDate, Math.min(d, 120) - 1); return n; });

      // Participants & Expenses State
      const [newParticipantName, setNewParticipantName] = useState('');
      const [newExpense, setNewExpense] = useState({
        title: '',
        category: 'Verpflegung & Restaurant',
        amountEur: '',
        paidBy: '',
        splitAmong: []
      });

      // Card Number Visibility & Expanded Card Bookings
      const [visibleCardNumbers, setVisibleCardNumbers] = useState({});
      const [expandedCardDetails, setExpandedCardDetails] = useState({});

      // Separate Distance & Unit Calculators State
      const [calcUsd, setCalcUsd] = useState('');
      const [calcGallonPriceUsd, setCalcGallonPriceUsd] = useState('');
      const [calcKmToMiInput, setCalcKmToMiInput] = useState(''); // Window 1: km -> mi
      const [calcMiToKmInput, setCalcMiToKmInput] = useState('');  // Window 2: mi -> km
      const [calcFahrenheit, setCalcFahrenheit] = useState('');
      const [calcCelsius, setCalcCelsius] = useState('');
      const [newCheckItem, setNewCheckItem] = useState('');
      const [gpsSearchQuery, setGpsSearchQuery] = useState('');
      const [gpsFilterType, setGpsFilterType] = useState('ALL');

      // Tastatur: Escape schließt den jeweils obersten Dialog.
      useEffect(() => { const key=e=>{ if(e.key==='Escape'){ if(importPreview) setImportPreview(null); else if(cloudConflict) setCloudConflict(null); else if(deleteConfirmModal){setDeleteConfirmModal(null);setDeletePhrase('');} } }; window.addEventListener('keydown',key); return ()=>window.removeEventListener('keydown',key); }, [importPreview,cloudConflict,deleteConfirmModal]);

      // Online / Offline detector
      useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }, []);

      const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
          setToastMessage((prev) => (prev === msg ? null : prev));
        }, 2600);
      };

      // Gerätespeicher: Rolling-Backups (5) und sichtbare Quota-/Zugriffsfehler
      useEffect(() => {
        if (isReadOnly) return;
        try {
          const normalized = normalizeTrip(tripData);
          const previous = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (previous && previous !== JSON.stringify(normalized)) {
            let backups = []; try { backups = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]'); } catch (_) {}
            backups.unshift({ savedAt: new Date().toISOString(), data: JSON.parse(previous) });
            localStorage.setItem(BACKUP_KEY, JSON.stringify(backups.slice(0,5)));
          }
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized)); setStorageError(''); fsSync.queueWrite(normalized);
        } catch (e) { const msg = 'Speichern fehlgeschlagen (Speicher voll oder gesperrt). Bitte JSON-Backup exportieren. ' + (e?.message || ''); setStorageError(msg); console.error(msg,e); }
      }, [tripData, isReadOnly]);

      // Reisezeitraum nach lokalen Kalendertagen berechnen.
      const departureCountdown = useMemo(
        () => calculateTripTimeline(tripData.meta?.startDate, tripData.meta?.endDate),
        [tripData.meta?.startDate, tripData.meta?.endDate]
      );
      // Today is derived from the local calendar (never UTC); refresh periodically for an app left open overnight.
      const [todayIso, setTodayIso] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      });
      useEffect(() => {
        const refreshLocalDay = () => {
          const d = new Date();
          setTodayIso(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
        };
        const timer = setInterval(refreshLocalDay, 60000);
        return () => clearInterval(timer);
      }, []);
      const tripIsActiveToday = isDate(tripData.meta?.startDate) && !!tripData.meta?.startDate &&
        isDate(tripData.meta?.endDate) && !!tripData.meta?.endDate &&
        localDateDayNumber(todayIso) >= localDateDayNumber(tripData.meta.startDate) &&
        localDateDayNumber(todayIso) <= localDateDayNumber(tripData.meta.endDate);
      useEffect(() => { if (tripIsActiveToday && !(tripData.meta && tripData.meta.tripId === 'demo-florida-v1')) setActiveTab((t) => (t === 'stages' ? 'today' : t)); }, []);
      const todayStages = useMemo(() => {
        if (!tripIsActiveToday) return [];
        const day = localDateDayNumber(todayIso);
        return (tripData.stages || []).filter(stage => {
          const start = dateInputValue(stage.dateRange);
          if (!start) return false;
          const startDay = localDateDayNumber(start);
          // An overnight stage covers its arrival date through checkout date.
          const nights = Math.max(0, parseInt(stage.nights, 10) || 0);
          return day >= startDay && day <= startDay + nights;
        });
      }, [tripData.stages, tripIsActiveToday, todayIso]);
      const todayStageKey = todayStages.map(stage => stage.id).join('|');
      const formattedToday = (() => {
        const [y,m,d] = todayIso.split('-').map(Number);
        return new Date(y, m-1, d).toLocaleDateString('de-DE', {day:'2-digit',month:'2-digit',year:'numeric'});
      })();
      const jumpToToday = () => {
        const first = todayStages[0];
        if (!first) return;
        setExpandedStages(prev => ({ ...prev, ...Object.fromEntries(todayStages.map(stage => [stage.id, true])) }));
        setTimeout(() => document.getElementById(`stage-card-${first.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      };
      useEffect(() => {
        if (activeTab !== 'stages' || !todayStages.length) return;
        setExpandedStages(prev => ({ ...prev, ...Object.fromEntries(todayStages.map(stage => [stage.id, true])) }));
        const first = todayStages[0];
        const timer = setTimeout(() => document.getElementById(`stage-card-${first.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
        return () => clearTimeout(timer);
      }, [activeTab, todayStageKey]);

      // Drive-Abgleich: lokale Änderungen bleiben im Cache. Server prüft erwartete Version atomar.
      const driveRead = () => new Promise((resolve, reject) => {
        if (!(window.google && google.script && google.script.run)) {
          // No JSON chosen means local-only mode, not a read error.
          return window.__roadtripFallbackRead ? window.__roadtripFallbackRead().then(resolve,reject) : resolve({ version: 0, payload: null });
        }
        google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).readTripData();
      });
      const driveWrite = (data, expectedVersion, force=false) => new Promise((resolve, reject) => {
        if (!(window.google && google.script && google.script.run)) return window.__roadtripFallbackWrite ? window.__roadtripFallbackWrite(data,expectedVersion,force).then(resolve,reject) : reject(new Error('Apps-Script-Verbindung fehlt.'));
        google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).writeTripData(data, expectedVersion, force);
      });
      const canonicalSame = (a,b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
      if (!(window.google && google.script && google.script.run)) { const picker=document.getElementById('fallback-file-pick'); if(picker) picker.style.display='block'; }
      const commitToDrive = async (data=tripDataRef.current, force=false) => {
        if (!(window.google && google.script && google.script.run) && !window.__roadtripHandle) {
          setSyncStatus('local');
          return false;
        }
        try {
          const result = await driveWrite(data, cloudVersionRef.current, force);
          if (result.conflict) {
            cloudVersionRef.current = result.version; setCloudVersion(result.version);
            if (result.payload && canonicalSame(data, result.payload)) { dirtyRef.current=false; setSyncStatus('synced'); return true; }
            if (result.payload && !canonicalSame(data, result.payload)) {
              setCloudConflict({remote: result.payload, version: result.version, localVersion: Number(data.meta?.version)||1});
              setSyncStatus('conflict'); return false;
            }
          }
          if (result.ok) {
            cloudVersionRef.current = result.version; setCloudVersion(result.version);
            tripDataRef.current = result.payload; setTripData(result.payload);
            dirtyRef.current = false; setSyncStatus('synced'); return true;
          }
          throw new Error(result.message || 'Drive-Speichern fehlgeschlagen.');
        } catch (e) { console.error('Drive-Sync:', e); setSyncStatus('error'); showToast('Drive-Sync nicht möglich. Änderungen bleiben lokal zwischengespeichert.'); return false; }
      };
      const checkDrive = async () => {
        if (isReadOnly) { setSyncStatus('readonly'); return; }
        if (!navigator.onLine) { setSyncStatus('offline'); return; }
        if (!(window.google && google.script && google.script.run) && !window.__roadtripHandle) {
          setSyncStatus('local');
          return;
        }
        try {
          const result = await driveRead();
          const remote = result.payload ? normalizeTrip(result.payload) : null;
          const rv = Number(result.version)||0;
          const local=tripDataRef.current;
          if (dirtyRef.current) {
            const known = cloudVersionRef.current;
            if (rv !== known) {
              cloudVersionRef.current=rv; setCloudVersion(rv);
              if (remote && !canonicalSame(remote,local)) { setCloudConflict({remote,version:rv,localVersion:Number(local.meta?.version)||1}); setSyncStatus('conflict'); return; }
              if (remote && canonicalSame(remote,local)) { dirtyRef.current=false; setSyncStatus('synced'); return; }
            }
            await commitToDrive(local, false); return;
          }
          cloudVersionRef.current=rv; setCloudVersion(rv);
          if (remote && !canonicalSame(remote,local)) {
            const localVer=Number(local.meta?.version)||1, remoteVer=Number(remote.meta?.version)||rv;
            if (remoteVer > localVer) { tripDataRef.current=remote; setTripData(remote); setSyncStatus('synced'); }
            else { setCloudConflict({remote,version:rv,localVersion:localVer}); setSyncStatus('conflict'); }
          } else setSyncStatus(remote ? 'synced' : 'cloud-empty');
        } catch(e) {
          // A file-picker read before a file is selected is expected local-only state; keep it quiet.
          if (/Wähle zuerst die Drive-JSON-Datei|Bitte zuerst die JSON-Datei auswählen/i.test(e?.message || '')) {
            setSyncStatus('local');
            return;
          }
          console.warn('Drive-Lesen fehlgeschlagen:',e);
          setSyncStatus(navigator.onLine?'error':'offline');
        }
      };
      useEffect(() => {
        checkDrive();
        const timer=setInterval(checkDrive,20000);
        const online=()=>{ setIsOnline(true); checkDrive(); };
        window.addEventListener('online',online);
        return ()=>{clearInterval(timer);window.removeEventListener('online',online);};
      }, []);
      const syncNow = async () => { dirtyRef.current=true; await checkDrive(); };

      // Einheitliche lokale Versionierung. Cloud-Uploads nur über explizite Konflikt-/Sync-Aktion.
      const saveTripData = async (updatedData, toastText = 'Lokal gespeichert!') => {
        if (isReadOnly) { showToast('Ansichtsmodus: Änderungen sind gesperrt.'); return; }
        let withTimestamp;
        try { validateTripDateValues(updatedData, tripData); withTimestamp = normalizeTrip({ ...updatedData, meta: { ...updatedData.meta, schemaVersion: SCHEMA_VERSION, version: (Number(tripData.meta?.version)||1)+1, lastUpdated: new Date().toISOString() } }); }
        catch(e) { setStorageError('Änderung nicht gespeichert: ' + e.message); showToast('Eingaben ungültig – bitte prüfen.'); return; }
        tripDataRef.current = withTimestamp; setTripData(withTimestamp);
        // Autosave effect creates the rolling snapshot from the prior locally persisted state.
        dirtyRef.current = true; setSyncStatus(navigator.onLine ? 'local-ahead' : 'offline');
        if (toastText) showToast(toastText);
      };
      const uploadCloud = async (data=tripData, force=false) => { dirtyRef.current=true; return commitToDrive(data,force); };
      const applyCloud = () => { if(!cloudConflict) return; try { const r=normalizeTrip(cloudConflict.remote); tripDataRef.current=r; setTripData(r); localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(r)); cloudVersionRef.current=cloudConflict.version; setCloudVersion(cloudConflict.version); dirtyRef.current=false; setCloudConflict(null); setSyncStatus('synced'); showToast('Drive-Version lokal übernommen.'); } catch(e) { showToast('Drive-Daten ungültig: '+e.message); } };
      const mergeCloud = () => { if(!cloudConflict) return; try { const merged=mergeById(tripData,cloudConflict.remote); merged.meta.lastUpdated=new Date().toISOString(); merged.meta.version=Math.max(Number(tripData.meta.version)||1,cloudConflict.version)+1; tripDataRef.current=merged; setTripData(merged); dirtyRef.current=true; cloudVersionRef.current=cloudConflict.version; setCloudConflict(null); setSyncStatus('local-ahead'); showToast('Zusammengeführt – wird jetzt in Drive gespeichert.'); commitToDrive(merged,true); } catch(e) { showToast('Zusammenführen nicht möglich: '+e.message); } };

      // Interactive 1-Click Toggle Helpers for Options (Ja / Nein / Möglich / Inkl.)
      const handleToggleHotelField = (stageId, field, options = ['ja', 'nein']) => {
        const updatedStages = (tripData.stages || []).map((s) => {
          if (s.id !== stageId) return s;
          const current = s.hotel?.[field] || 'nein';
          const nextVal = cycleYesNoOption(current, options);
          return {
            ...s,
            hotel: {
              ...s.hotel,
              [field]: nextVal
            }
          };
        });
        saveTripData({ ...tripData, stages: updatedStages }, `${field === 'breakfast' ? 'Frühstück' : field === 'parking' ? 'Parken' : 'Vorab bezahlt'} umgeschaltet`);
      };

      const handleToggleFlightPrepaid = (flightId) => {
        const updated = (tripData.flights || []).map((f) =>
          f.id === flightId ? { ...f, prepaid: cycleYesNoOption(f.prepaid, ['ja', 'nein']) } : f
        );
        saveTripData({ ...tripData, flights: updated }, 'Flug Bezahlstatus umgeschaltet');
      };

      const handleToggleCarPrepaid = (carId) => {
        const updated = (tripData.rentalCars || []).map((c) =>
          c.id === carId ? { ...c, prepaid: cycleYesNoOption(c.prepaid, ['ja', 'nein']) } : c
        );
        saveTripData({ ...tripData, rentalCars: updated }, 'Mietwagen Bezahlstatus umgeschaltet');
      };

      const handleToggleLocalAttractionBooked = (stageId, actId) => {
        const options = ['ja', 'nein', 'Vor Ort', 'Frei zugänglich'];
        const updatedStages = (tripData.stages || []).map((s) => {
          if (s.id !== stageId) return s;
          const updatedLocs = (s.localAttractions || []).map((act) =>
            act.id === actId ? { ...act, booked: cycleYesNoOption(act.booked, options) } : act
          );
          return { ...s, localAttractions: updatedLocs };
        });
        saveTripData({ ...tripData, stages: updatedStages }, 'Ticket-Status umgeschaltet');
      };

      // Assign an attraction to a specific Day (1..nights) in multi-night stages
      const handleAssignAttractionDay = (stageId, actId, dayNum) => {
        const updatedStages = (tripData.stages || []).map((s) => {
          if (s.id !== stageId) return s;
          const updatedLocs = (s.localAttractions || []).map((act) =>
            act.id === actId ? { ...act, day: dayNum } : act
          );
          return { ...s, localAttractions: updatedLocs };
        });
        saveTripData({ ...tripData, stages: updatedStages }, `Auf Tag ${dayNum} verschoben`);
      };

      // Download Updated Standalone HTML File
      const handleDownloadStandaloneHtml = () => {
        try {
          const docClone = document.documentElement.cloneNode(true);
          const rootClone = docClone.querySelector('#root');
          if (rootClone) rootClone.innerHTML = '';
          const dataScript = docClone.querySelector('#embedded-trip-data');
          if (dataScript) {
            dataScript.textContent = '\n' + JSON.stringify(tripData, null, 2) + '\n';
          }
          const htmlContent = '<!DOCTYPE html>\n' + docClone.outerHTML;
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `roadtrip-planer-${new Date().toISOString().slice(0, 10)}.html`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          showToast('HTML-App inkl. aller aktuellen Daten heruntergeladen!');
        } catch (err) {
          showToast('Fehler beim Erstellen der HTML-Datei');
        }
      };

      const handleDownloadReadOnlyHtml = () => {
        try {
          const clone = document.documentElement.cloneNode(true);
          clone.setAttribute('data-roadtrip-readonly', 'true');
          const data = clone.querySelector('#embedded-trip-data');
          if (!data) throw new Error('Datenbereich der HTML-Datei fehlt.');
          data.textContent = JSON.stringify(normalizeTrip(tripData)).replace(/</g, '\\u003c');
          const blob = new Blob(['<!DOCTYPE html>\n' + clone.outerHTML], {type:'text/html;charset=utf-8'});
          const url = URL.createObjectURL(blob); const a = document.createElement('a');
          a.href=url; a.download='roadtrip-ansicht-nur-lesen.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
          showToast('Nur-Lesen-Kopie mit aktuellem Datenstand heruntergeladen.');
        } catch(e) { setStorageError('Nur-Lesen-Export fehlgeschlagen: '+e.message); }
      };

      // JSON-Austauschdatei ist der verlässlichste Geräte-zu-Geräte-Workflow.
      const handleExportJson = () => {
        try { downloadTripFile(normalizeTrip(tripData), `roadtrip-backup-${new Date().toISOString().slice(0,10)}.json`).then(()=>showToast('JSON-Backup heruntergeladen')).catch(e=>setStorageError('Export fehlgeschlagen: '+e.message)); }
        catch(e) { setStorageError('Export fehlgeschlagen: '+e.message); showToast('JSON-Export fehlgeschlagen'); }
      };
      const handleImportJson = (e) => {
        const file=e.target.files?.[0]; if(!file) return; setImportError('');
        if(file.size>20*1024*1024) { setImportError('Datei zu groß (max. 20 MB).'); return; }
        const reader=new FileReader(); reader.onerror=()=>setImportError('Datei konnte nicht gelesen werden.');
        reader.onload=event=>{ try { const imported=stripPendingDocs(normalizeTrip(JSON.parse(event.target.result))); setImportPreview({data:imported, filename:file.name}); } catch(err) { setImportError('Import abgebrochen: '+err.message); } };
        reader.readAsText(file); e.target.value='';
      };
      const confirmImport = () => { if(!importPreview) return; try { const backups=JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]'); backups.unshift({savedAt:new Date().toISOString(),data:tripData}); localStorage.setItem(BACKUP_KEY,JSON.stringify(backups.slice(0,5))); tripDataRef.current=importPreview.data; saveTripData(importPreview.data,'Import abgeschlossen; vorherige Version gesichert.'); if(window.__pendingDocs){ replaceDocs(window.__pendingDocs); window.__pendingDocs=null; } setImportPreview(null); } catch(e) { setImportError('Sicherungsbackup fehlgeschlagen, Import nicht ausgeführt: '+e.message); } };
      const restoreRollingBackup = () => { try { const backups=JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]'); if(!backups.length) { setImportError('Kein lokales Rolling-Backup vorhanden.'); return; } const b=backups[0]; setImportPreview({data:normalizeTrip(b.data),filename:'Lokales Rolling-Backup ('+new Date(b.savedAt).toLocaleString('de-DE')+')'}); } catch(e) { setImportError('Rolling-Backup kann nicht gelesen werden: '+e.message); } };

      // Available Credit Card Names for Dropdowns
      const availableCardOptions = useMemo(() => [...(tripData.creditCards || []).map((c) => c.name), RT_NO_CARD], [tripData]);
      useEffect(() => {
        if (isReadOnly || !(tripData.creditCards || []).length) return;
        const names = new Set((tripData.creditCards || []).map((c) => c.name));
        const cleaned = rtDropCardRefs(tripData, (n) => !names.has(n));
        if (cleaned) saveTripData(cleaned, 'Gelöschte Kreditkarte aus Buchungen entfernt');
      }, [tripData, isReadOnly]);

      const participantNames = useMemo(() => {
        const list = (tripData.participants || []).map((p) => p.name);
        return list.length > 0 ? list : ['Teilnehmer 1'];
      }, [tripData.participants]);

      // Computed Financials, Separate Category Totals, Credit Card Utilization & Participant Split
      const financeSummary = useMemo(() => {
        const flightsNew = (tripData.flights || []).reduce((acc, f) => acc + (parseFloat(f.priceNewEur) || 0), 0);
        const flightsOld = (tripData.flights || []).reduce((acc, f) => acc + (parseFloat(f.priceOldEur) || parseFloat(f.priceNewEur) || 0), 0);

        const carsNew = (tripData.rentalCars || []).reduce((acc, c) => acc + (parseFloat(c.priceNewEur) || 0), 0);
        const carsOld = (tripData.rentalCars || []).reduce((acc, c) => acc + (parseFloat(c.priceNewEur) || parseFloat(c.priceOldEur) || 0), 0);

        const hotelsNew = (tripData.stages || []).reduce((acc, s) => acc + (parseFloat(s.hotel?.priceNewEur) || 0), 0);
        const hotelsOld = (tripData.stages || []).reduce((acc, s) => acc + (parseFloat(s.hotel?.priceOldEur) || parseFloat(s.hotel?.priceNewEur) || 0), 0);

        const routeStopsCost = (tripData.stages || []).reduce((acc, s) => {
          return acc + (s.routeToHotel?.stopsOnWay || []).reduce((rAcc, st) => rAcc + (parseFloat(st.costEur) || 0), 0);
        }, 0);

        const localAttractionsCost = (tripData.stages || []).reduce((acc, s) => {
          return acc + (s.localAttractions || []).reduce((lAcc, at) => lAcc + (parseFloat(at.priceEur) || 0), 0);
        }, 0);

        const customExpensesCost = (tripData.customExpenses || []).reduce((acc, ex) => acc + (parseFloat(ex.amountEur) || 0), 0);

        const stopsAndAttractions = routeStopsCost + localAttractionsCost;
        const totalNew = flightsNew + carsNew + hotelsNew + stopsAndAttractions + customExpensesCost;
        const totalOld = flightsOld + carsOld + hotelsOld + stopsAndAttractions + customExpensesCost;
        const totalSaved = Math.max(0, totalOld - totalNew);
        const totalNights = (tripData.stages || []).reduce((acc, s) => acc + (parseInt(s.nights, 10) || 0), 0);

        // Build Card Map
        const byCard = {};
        (tripData.creditCards || []).forEach((cc) => {
          byCard[cc.name] = {
            cardMeta: cc,
            limitEur: parseFloat(cc.limitEur) || 0,
            total: 0,
            paid: 0,
            open: 0,
            bookings: []
          };
        });

        // Build Participant Split Map
        const byPerson = {};
        participantNames.forEach((name) => {
          byPerson[name] = {
            paidTotal: 0,
            shareTotal: 0,
            byCategory: {
              hotels: 0,
              flights: 0,
              cars: 0,
              activities: 0,
              extras: 0
            },
            itemsPaid: []
          };
        });

        const getDefaultPayerFromCard = (cardName) => {
          const foundCard = (tripData.creditCards || []).find((c) => c.name === cardName);
          if (foundCard && foundCard.holder && byPerson[foundCard.holder]) {
            return foundCard.holder;
          }
          return participantNames[0];
        };

        const registerSharedCost = (amountEur, categoryKey, paidByPerson, splitNames, label) => {
          const amt = parseFloat(amountEur) || 0;
          if (amt <= 0) return;
          const payer = byPerson[paidByPerson] ? paidByPerson : participantNames[0];
          const validSplit = (splitNames || []).filter((n) => byPerson[n]);
          const targets = validSplit.length > 0 ? validSplit : participantNames;
          const sharePerPerson = amt / targets.length;

          if (byPerson[payer]) {
            byPerson[payer].paidTotal += amt;
            byPerson[payer].itemsPaid.push({ label, amt, categoryKey });
          }

          targets.forEach((pName) => {
            if (byPerson[pName]) {
              byPerson[pName].shareTotal += sharePerPerson;
              byPerson[pName].byCategory[categoryKey] = (byPerson[pName].byCategory[categoryKey] || 0) + sharePerPerson;
            }
          });
        };

        const addBookingToCard = (cardName, amountEur, isPrepaid, label, typeLabel, dateInfo, paidByOverride, splitOverride, catKey) => {
          const key = (cardName || 'Sonstige').trim();
          if (!byCard[key]) {
            byCard[key] = {
              cardMeta: null,
              limitEur: 0,
              total: 0,
              paid: 0,
              open: 0,
              bookings: []
            };
          }
          byCard[key].total += amountEur;
          const paidBool = isPositiveValue(isPrepaid);
          if (paidBool) byCard[key].paid += amountEur;
          else byCard[key].open += amountEur;

          if (amountEur > 0 || label) {
            byCard[key].bookings.push({
              label,
              typeLabel,
              amountEur,
              paidBool,
              prepaidRaw: isPrepaid,
              dateInfo
            });
          }

          const payer = paidByOverride || getDefaultPayerFromCard(cardName);
          registerSharedCost(amountEur, catKey, payer, splitOverride || participantNames, label);
        };

        (tripData.flights || []).forEach((f) =>
          addBookingToCard(
            f.creditCard,
            parseFloat(f.priceNewEur) || 0,
            f.prepaid,
            `${f.direction}: ${f.airline} ${f.flightNumber}`,
            'Flug',
            f.cardCharged || f.departureDate,
            f.paidBy,
            f.splitAmong,
            'flights'
          )
        );
        (tripData.rentalCars || []).forEach((c) =>
          addBookingToCard(
            c.creditCard,
            parseFloat(c.priceNewEur) || 0,
            c.prepaid,
            `${c.provider} – ${c.carClass}`,
            'Mietwagen',
            c.cardCharged || c.pickupDate,
            c.paidBy,
            c.splitAmong,
            'cars'
          )
        );
        (tripData.stages || []).forEach((s, idx) => {
          addBookingToCard(
            s.hotel?.creditCard,
            parseFloat(s.hotel?.priceNewEur) || 0,
            s.hotel?.prepaid,
            `Etappe ${idx + 1} (${s.toCity}): ${s.hotel?.name}`,
            'Hotel',
            s.hotel?.cardCharged || s.dateRange,
            s.hotel?.paidBy,
            s.hotel?.splitAmong,
            'hotels'
          );
          (s.routeToHotel?.stopsOnWay || []).forEach((st) => {
            if (parseFloat(st.costEur) > 0) {
              registerSharedCost(st.costEur, 'activities', st.paidBy || participantNames[0], st.splitAmong || participantNames, `Stopp: ${st.name}`);
            }
          });
          (s.localAttractions || []).forEach((at) => {
            if (parseFloat(at.priceEur) > 0) {
              registerSharedCost(at.priceEur, 'activities', at.paidBy || participantNames[0], at.splitAmong || participantNames, `Vor Ort (${s.toCity}): ${at.name}`);
            }
          });
        });

        (tripData.customExpenses || []).forEach((ex) => {
          if (ex.creditCard) addBookingToCard(ex.creditCard, parseFloat(ex.amountEur) || 0, 'ja', ex.title, ex.source === 'receipt' ? 'Beleg' : 'Ausgabe', ex.date || '', ex.paidBy || participantNames[0], ex.splitAmong || participantNames, 'extras');
          else registerSharedCost(ex.amountEur, 'extras', ex.paidBy || participantNames[0], ex.splitAmong || participantNames, ex.title);
        });

        // Calculate balances & compensation transactions ("Wer schuldet wem?")
        const balances = Object.entries(byPerson).map(([name, data]) => ({
          name,
          ...data,
          netBalance: data.paidTotal - data.shareTotal // > 0 means gets money back, < 0 means owes money
        }));

        const debtors = balances.filter((b) => b.netBalance < -0.01).map((b) => ({ name: b.name, amount: Math.abs(b.netBalance) }));
        const creditors = balances.filter((b) => b.netBalance > 0.01).map((b) => ({ name: b.name, amount: b.netBalance }));
        const settlements = [];

        let dIdx = 0;
        let cIdx = 0;
        while (dIdx < debtors.length && cIdx < creditors.length) {
          const d = debtors[dIdx];
          const c = creditors[cIdx];
          const transfer = Math.min(d.amount, c.amount);
          if (transfer > 0.01) {
            settlements.push({ from: d.name, to: c.name, amount: transfer });
          }
          d.amount -= transfer;
          c.amount -= transfer;
          if (d.amount <= 0.01) dIdx++;
          if (c.amount <= 0.01) cIdx++;
        }

        return {
          flightsNew,
          flightsOld,
          carsNew,
          carsOld,
          hotelsNew,
          hotelsOld,
          routeStopsCost,
          localAttractionsCost,
          customExpensesCost,
          stopsAndAttractions,
          totalNew,
          totalOld,
          totalSaved,
          totalNights,
          byCard,
          balances,
          settlements
        };
      }, [tripData, participantNames]);

      // All GPS points & Offline Cached Links Vault
      const allGpsPoints = useMemo(() => {
        const points = [];
        (tripData.stages || []).forEach((stage, idx) => {
          const stageLabel = `Etappe ${idx + 1}: ${stage.fromCity} → ${stage.toCity}`;
          (stage.routeToHotel?.stopsOnWay || []).forEach((stop) => {
            points.push({
              id: stop.id,
              stageIdx: idx + 1,
              stageLabel,
              type: 'Stopp unterwegs',
              name: stop.name,
              address: stop.address,
              gps: stop.gps,
              notes: stop.notes,
              urls: extractUrlsFromText(stop.notes),
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
            });
          });
          if (stage.hotel?.name) {
            points.push({
              id: `hotel-${stage.id}`,
              stageIdx: idx + 1,
              stageLabel,
              type: 'Hotel / Unterkunft',
              name: stage.hotel.name,
              address: stage.hotel.address,
              gps: stage.hotel.gps,
              notes: stage.hotel.remarks,
              urls: extractUrlsFromText(stage.hotel.remarks),
              badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
            });
          }
          if (stage.hotel?.parkingGarageName) {
            points.push({
              id: `park-${stage.id}`,
              stageIdx: idx + 1,
              stageLabel,
              type: 'Parkhaus / Parkplatz',
              name: stage.hotel.parkingGarageName,
              address: stage.hotel.parkingGarageAddress,
              gps: stage.hotel.parkingGarageGps,
              notes: 'Parkmöglichkeit zur Unterkunft',
              urls: [],
              badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
            });
          }
          (stage.localAttractions || []).forEach((loc) => {
            const bookedUrls = extractUrlsFromText(loc.booked);
            const noteUrls = extractUrlsFromText(loc.notes);
            points.push({
              id: loc.id,
              stageIdx: idx + 1,
              stageLabel,
              type: 'Vor Ort / Aktivität',
              name: loc.name,
              address: loc.address,
              gps: loc.gps,
              notes: loc.notes,
              urls: Array.from(new Set([...bookedUrls, ...noteUrls])),
              badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
            });
          });
        });
        return points;
      }, [tripData]);

      // All Extracted Web Links across the entire roadtrip for Offline Caching
      const allExtractedLinks = useMemo(() => {
        const linkList = [];
        allGpsPoints.forEach((pt) => {
          (pt.urls || []).forEach((url) => {
            linkList.push({
              url,
              title: pt.name,
              stageLabel: pt.stageLabel,
              gps: pt.gps,
              address: pt.address,
              notes: pt.notes
            });
          });
        });
        return linkList;
      }, [allGpsPoints]);

      // Bibliotheken sind Bestandteil dieser Datei. Online-Karten/Links bleiben externe Dienste.
      const handleCacheForOffline = async () => {
        const statusObj={cachedAt:new Date().toLocaleString('de-DE'),count:allGpsPoints.length+allExtractedLinks.length};
        setOfflineCacheStatus(statusObj);
        try { localStorage.setItem(OFFLINE_CACHE_STATUS_KEY,JSON.stringify(statusObj)); localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(tripData)); showToast('Reisedaten und Link-Verzeichnis lokal gespeichert. Karten, Routen und Webseiten brauchen Internet.'); }
        catch(e) { setStorageError('Offline-Speichern fehlgeschlagen: '+e.message); showToast('Speicherfehler – bitte JSON exportieren.'); }
      };

      const createEmptyTripData = () => ({
        meta: { title: '', subtitle: '', startDate: '', endDate: '', exchangeRate: 1.09, lastUpdated: new Date().toISOString() },
        participants: [], customExpenses: [], creditCards: [], emergencyContacts: [], flights: [], rentalCars: [], stages: [], checklist: []
      });

      const handleCompleteNewTripWizard = async () => {
        if (!isDate(wizardData.startDate) || !isDate(wizardData.endDate) || (wizardData.startDate && wizardData.endDate && wizardData.endDate < wizardData.startDate)) { showToast('Bitte gültige Reisedaten eingeben (Ende nicht vor Start).'); return; }
        if (wizardData.budget && (!Number.isFinite(Number(wizardData.budget)) || Number(wizardData.budget)<0)) { showToast('Bitte einen gültigen Betrag eingeben.'); return; }
        const dayCount = tripDayCount(wizardData.startDate,wizardData.endDate);
        if(dayCount>120){ showToast('Eine Reise darf höchstens 120 Tage umfassen.'); return; }
        if(dayCount>0 && !(await window.rtAsk(`Es werden ${dayCount} Etappen (eine pro Reisetag) angelegt. Fortfahren?`))) return;
        const title = wizardData.title.trim() || wizardData.destination.trim() || 'Neue Reise';
        const names = Array.from({ length: Math.max(1, Math.min(20, parseInt(wizardData.people, 10) || 1)) }, (_, i) => ((wizardData.names || [])[i] || '').trim() || `Reisende ${i + 1}`);
        const start = wizardData.startLocation.trim() || 'Startort';
        const destination = wizardData.destination.trim();
        const stages = dayCount ? makeDailyStages(wizardData.startDate,wizardData.endDate,start,destination,1.09) : [];
        const trip = {
          ...createEmptyTripData(),
          meta: { ...createEmptyTripData().meta, title, subtitle: [start, destination].filter(Boolean).join(' • '), startDate: wizardData.startDate, endDate: wizardData.endDate, startLocation: start, destination, vehicle: wizardData.vehicle.trim(), budget: wizardData.budget ? Number(wizardData.budget) : null, currency: wizardData.currency },
          participants: names.map((name, i) => ({ id: `p-${Date.now()}-${i}`, name, color: ['blue', 'emerald', 'amber', 'purple'][i % 4] })), stages
        };
        setTripData(trip);
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trip)); } catch (e) {}
        if (stages.length) setExpandedStages({ [stages[0].id]: true });
        setIsNewTripWizardOpen(false);
        setWizardStep(0);
        showToast('Neue Reise angelegt');
      };

      const handleResetAllData = async () => {
        try {
          if(deleteBackup) handleExportJson();
          const backups=JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]'); backups.unshift({savedAt:new Date().toISOString(),data:tripData}); localStorage.setItem(BACKUP_KEY,JSON.stringify(backups.slice(0,5)));
          [LOCAL_STORAGE_KEY,DRIVE_SETTINGS_KEY,OFFLINE_CACHE_STATUS_KEY].forEach(key=>localStorage.removeItem(key));
          const empty=createEmptyTripData(); setTripData(empty); localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(empty));
          dirtyRef.current=false; cloudVersionRef.current=0; setCloudVersion(0); setOfflineCacheStatus({cachedAt:null,count:0}); setExpandedStages({}); setActiveTab('stages'); setWizardData({title:'',startDate:'',endDate:'',startLocation:'',destination:'',people:'',vehicle:'',budget:'',currency:'EUR'}); setWizardStep(0); setIsNewTripWizardOpen(true);
          setDeleteConfirmModal(null); setDeletePhrase(''); showToast('Lokale Daten zurückgesetzt. Rolling-Backup bleibt erhalten.');
        } catch(e) { setStorageError('Reset/Sicherung fehlgeschlagen: '+e.message); showToast('Zurücksetzen nicht vollständig möglich.'); }
      };
      const emptyHotel = () => ({ name:'', rating:'', address:'', gps:'', checkIn:'', checkOut:'', breakfast:'', parking:'', cancelUntil:'', priceOldEur:'', priceNewEur:'', priceUsd:'', prepaid:'', creditCard:'', paidBy:'', splitAmong:[], parkingGarageName:'', parkingGarageAddress:'', parkingGarageGps:'', remarks:'', chargeAnnounced:'', cardCharged:'' });
      const openStageEditor = (stage, section = 'all') => { const copy = JSON.parse(JSON.stringify(stage)); if (section === 'hotel' && !copy.hotel) copy.hotel = emptyHotel(); setEditingStageModal(copy); setEditingStageSection(section); };

      const handleDeleteStageHotel = (stage) => {
        setDeleteConfirmModal({type:'hotel',id:stage.id,title:`Hotel/Unterkunft für „${stage.toCity || stage.fromCity}“`,detail:'Etappe, Übernachtungen und sonstige Etappendaten bleiben erhalten.'}); setDeletePhrase(''); setDeleteBackup(true);
      };

      window.__rtSaveTrip = saveTripData; window.__rtActiveTripId = (tripData.meta || {}).tripId;
      const cancelStageEditor = () => { const m = editingStageModal; setEditingStageModal(null); if (m && window.__rtNewStageId === m.id) { window.__rtNewStageId = null; saveTripData({ ...tripData, stages: (tripData.stages || []).filter((s) => s.id !== m.id) }, 'Neue Etappe verworfen'); } };
      const handleAddStage = () => {
        const stages = tripData.stages || [];
        const lastStage = stages[stages.length - 1];
        const newId = `stage-${Date.now()}`;
        const newStage = {
          id: newId,
          fromCity: lastStage ? (lastStage.toCity || '') : '',
          toCity: '',
          dateRange: '',
          nights: '',
          routeToHotel: {
            distanceKm: '',
            duration: '',
            routeDescription: '',
            stopsOnWay: []
          },
          hotel: {
            name: '',
            rating: '',
            address: '',
            gps: '',
            checkIn: '',
            checkOut: '',
            breakfast: '',
            parking: '',
            cancelUntil: '',
            priceOldEur: '',
            priceNewEur: '',
            priceUsd: '',
            prepaid: '',
            creditCard: '',
            paidBy: '',
            splitAmong: [],
            parkingGarageName: '',
            parkingGarageAddress: '',
            parkingGarageGps: '',
            remarks: '',
            chargeAnnounced: '',
            cardCharged: ''
          },
          localAttractions: []
        };
        const updated = [...stages, newStage];
        setExpandedStages((prev) => ({ ...prev, [newId]: true }));
        saveTripData({ ...tripData, stages: updated }, 'Neue Etappe angelegt');
        window.__rtNewStageId = newId;
        setEditingStageModal(JSON.parse(JSON.stringify(newStage)));
      };

      const handleAddSuggestedStage = (idx, c) => { // idx: Etappe, deren Ziel gewählt wird (idx = Anzahl: neue Etappe)
        const stages = tripData.stages || []; const o = idx > 0 ? stages[idx - 1] : null;
        const km = Math.round(c.km), hrs = (c.min / 60).toFixed(1).replace('.', ',');
        const route = { distanceKm: `${km} km (${Math.round(km * 0.621)} mi)`, duration: `${hrs} h`, routeDescription: '', stopsOnWay: [] };
        const gps = `${c.lat.toFixed(5)}, ${c.lon.toFixed(5)}`;
        if (idx < stages.length) {
          const oldTo = String((stages[idx] || {}).toCity || '').trim().toLowerCase(); const upd = stages.map((s, i) => i === idx ? { ...s, fromCity: s.fromCity || (o && o.toCity) || '', toCity: c.name, routeToHotel: { ...(s.routeToHotel || {}), ...route }, hotel: { ...(s.hotel || {}), gps } } : (i === idx + 1 && oldTo && String(s.fromCity || '').trim().toLowerCase() === oldTo ? { ...s, fromCity: c.name } : s));
          saveTripData({ ...tripData, stages: upd }, `Etappe ${idx + 1}: ${c.name}`);
        } else {
          const id = `stage-${Date.now()}`;
          const ns = { id, fromCity: (o && o.toCity) || '', toCity: c.name, dateRange: '', nights: '', routeToHotel: route, hotel: { ...emptyHotel(), gps }, localAttractions: [] };
          saveTripData({ ...tripData, stages: [...stages, ns] }, `Etappe ${idx + 1}: ${c.name}`);
          setEditingStageModal(JSON.parse(JSON.stringify(ns)));
        }
      };

      const handleAddWayStop = (stageId, c, lt) => {
        const st = (tripData.stages || []).map((s) => s.id !== stageId ? s : { ...s, routeToHotel: { ...(s.routeToHotel || {}), stopsOnWay: [...((s.routeToHotel && s.routeToHotel.stopsOnWay) || []), { id: `stop-${Date.now()}`, name: c.name, time: '', duration: 'ca. 1 Std.', address: '', gps: `${c.lat.toFixed(5)}, ${c.lon.toFixed(5)}`, costEur: 0, notes: `${SFW_KINDS[c.kind] || 'Stopp'}, ca. ${c.detour} min Umweg` + ((lt && lt.text) ? `

${lt.text}` : (c.d ? `

${c.d}` : '')) + ((lt && lt.url) ? `
Quelle: ${lt.url}` : '') }] } });
        saveTripData({ ...tripData, stages: st }, `Zwischenstopp „${c.name}“ eingetragen`);
      };

      const handleSetStageHotel = (stageId, h, name) => {
        const st = (tripData.stages || []).map((s) => s.id !== stageId ? s : { ...s, hotel: { ...emptyHotel(), ...(s.hotel || {}), ...h } });
        saveTripData({ ...tripData, stages: st }, `Hotel „${name}“ übernommen`);
      };
      const handleAddLocalFromAssistant = (stageId, c, lt, day) => {
        const st = (tripData.stages || []).map((s) => s.id !== stageId ? s : { ...s, localAttractions: [...(s.localAttractions || []), { id: `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: c.name, category: SFW_KINDS[c.kind] || 'Sehenswürdigkeit', time: '', booked: '', priceEur: 0, address: '', gps: `${c.lat.toFixed(6)},${c.lon.toFixed(6)}`, notes: ((lt && lt.text) || c.d || '') + ((lt && lt.url) ? `\nQuelle: ${lt.url}` : ''), ...(day ? { day } : {}) }] });
        saveTripData({ ...tripData, stages: st }, `„${c.name}“ zu den Aktionen vor Ort hinzugefügt`);
      };

      const rtHotelSet = (stageId, patch) => saveTripData({ ...tripData, stages: (tripData.stages || []).map((s) => (s.id === stageId ? { ...s, hotel: { ...(s.hotel || {}), ...patch } } : s)) }, '');
      const handleMoveStage = (index, direction) => {
        const stages = [...(tripData.stages || [])];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= stages.length) return;
        const temp = stages[index];
        stages[index] = stages[targetIndex];
        stages[targetIndex] = temp;
        { const lo = Math.min(index, targetIndex); const first = ((tripData.stages || [])[0] || {}).fromCity; saveTripData({ ...tripData, stages: rtRechain(stages, tripData.meta, first, [lo, lo + 1, lo + 2]) }, 'Reihenfolge geändert. Daten und Startorte angepasst, Strecken bitte neu ermitteln.'); }
      };

      const moveStageTo = (from, to) => {
        const old = tripData.stages || []; const stages = [...old]; if (from === to || from < 0 || to < 0 || from >= stages.length || to >= stages.length) return;
        const [m] = stages.splice(from, 1); stages.splice(to, 0, m); const lo = Math.min(from, to), hi = Math.max(from, to); const idxs = []; for (let k = lo; k <= Math.min(stages.length - 1, hi + 2); k++) idxs.push(k);
        saveTripData({ ...tripData, stages: rtRechain(stages, tripData.meta, (old[0] || {}).fromCity, idxs) }, 'Reihenfolge geändert. Daten und Startorte angepasst, Strecken bitte neu ermitteln.');
      };
      const stageDnd = rtUseDragSort((tripData.stages || []).length, moveStageTo, !IS_READ_ONLY_COPY && !rtUiClassic() && !openStageId);
      const rtDelStage = (stage, sIdx) => { const before = tripData; confirmDeleteEntity({ type: 'stage', id: stage.id }); rtUndo(`Etappe ${sIdx + 1} (${stage.toCity || 'ohne Ziel'}) gelöscht`, before); };
      const confirmDeleteEntity = async (direct) => {
        const dcm = direct && direct.type ? direct : deleteConfirmModal; if (!dcm) return;
        const { type, id } = dcm;
        if (type === 'stage') {
          { const old = tripData.stages || []; const di = old.findIndex((s) => s.id === id); const isLast = di === old.length - 1; const rest = old.filter((s) => s.id !== id); let meta = tripData.meta; const m0 = tripData.meta || {}; const sumN = (a) => a.reduce((x, s) => x + Math.max(0, parseInt(s.nights, 10) || 0), 0); if (/^\d{4}-\d{2}-\d{2}$/.test(m0.startDate || '') && /^\d{4}-\d{2}-\d{2}$/.test(m0.endDate || '') && rest.length) { const oe = isoAdd(m0.startDate, sumN(old)), ne = isoAdd(m0.startDate, sumN(rest)); const dm = (x) => `${x.slice(8, 10)}.${x.slice(5, 7)}.${x.slice(0, 4)}`; if (m0.endDate === oe && ne < oe && (await window.rtAsk(`Die Etappen enden jetzt am ${dm(ne)} statt am ${dm(oe)}.\n\nSoll das Reiseende auf den ${dm(ne)} vorgezogen werden?\n\nAbbrechen lässt das Reiseende beim ${dm(oe)}.`))) meta = { ...m0, endDate: ne }; } saveTripData({ ...tripData, meta, stages: rtRechain(rest, tripData.meta, (old[0] || {}).fromCity, isLast ? [] : [di]) }, 'Etappe gelöscht' + (isLast ? '' : '. Daten der folgenden Etappen angepasst.')); }
        } else if (type === 'flight') {
          saveTripData({ ...tripData, flights: (tripData.flights || []).filter((f) => f.id !== id) }, 'Flug gelöscht');
        } else if (type === 'car') {
          saveTripData({ ...tripData, rentalCars: (tripData.rentalCars || []).filter((c) => c.id !== id) }, 'Mietwagen gelöscht');
        } else if (type === 'card') {
          { const gone = (tripData.creditCards || []).find((c) => c.id === id); const rest = (tripData.creditCards || []).filter((c) => c.id !== id); const next = { ...tripData, creditCards: rest }; saveTripData(rtDropCardRefs(next, (n) => !!gone && n === gone.name && !rest.some((c) => c.name === n)) || next, 'Kreditkarte gelöscht'); }
        } else if (type === 'emergency') {
          saveTripData({ ...tripData, emergencyContacts: (tripData.emergencyContacts || []).filter((e) => e.id !== id) }, 'Notfallkontakt gelöscht');
        }
        setDeleteConfirmModal(null);
      };

      const handleQuickStageCardChange = (stageId, newCardName) => {
        const updatedStages = (tripData.stages || []).map((s) =>
          s.id === stageId ? { ...s, hotel: { ...s.hotel, creditCard: newCardName } } : s
        );
        saveTripData({ ...tripData, stages: updatedStages }, `Kreditkarte auf „${newCardName}“ geändert`);
      };

      const handleQuickStagePayerChange = (stageId, newPayer) => {
        const updatedStages = (tripData.stages || []).map((s) =>
          s.id === stageId ? { ...s, hotel: { ...s.hotel, paidBy: newPayer } } : s
        );
        saveTripData({ ...tripData, stages: updatedStages }, `Zahler auf „${newPayer}“ geändert`);
      };

      const copyToClipboard = (text, label = 'Kopiert!') => {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
        } else {
          const el = document.createElement('textarea');
          el.value = text;
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        }
        showToast(`${label}: ${text}`);
      };

      return (
        <div className="min-h-screen pb-24 md:pb-12">
          {isNewTripWizardOpen && !gateSkipped && <DataGate onSkip={() => setGateSkipped(true)} />}
          {LINK_PLAN && !linkClosed && <LinkImportGate onClose={() => setLinkClosed(true)} />}
          {/* TOAST */}
          {toastMessage && (
            <div role="status" style={{ pointerEvents: 'none' }} className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700">
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          )}

          <V18Shell activeTab={activeTab} setActiveTab={setActiveTab} trip={tripData} countdown={departureCountdown} onMeta={() => setEditingMetaModal(true)} isOnline={isOnline} syncStatus={syncStatus} total={financeSummary.totalNew} people={participantNames.length} />

          {/* MAIN CONTENT */}
          <main className="v18-main max-w-7xl mx-auto px-3 sm:px-6 py-5">
            <V18SubHead activeTab={activeTab} setActiveTab={setActiveTab} />
            {/* ===============================================================
                TAB 1: ETAPPEN, VISUELLER ZEITSTRAHL & MEHRTAGES-REITER
            =============================================================== */}
            {activeTab === 'stages' && (
              <div className={`space-y-6 ${openStageId ? 'stage-page-mode' : ''}`}>
                {tripIsActiveToday && todayStages.length > 0 && (
                  <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 sm:p-5 shadow-sm" aria-live="polite">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Heute unterwegs</div>
                        <div className="mt-1 text-base sm:text-lg font-bold text-emerald-950">
                          Heute: {todayStages.map((stage, index) => {
                            const stageNumber = (tripData.stages || []).findIndex(item => item.id === stage.id) + 1;
                            return <React.Fragment key={stage.id}>{index > 0 ? ' · ' : ''}Etappe {stageNumber} – {stage.toCity || stage.fromCity} ({formattedToday})</React.Fragment>;
                          })}
                        </div>
                      </div>
                      <button type="button" onClick={jumpToToday} className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">
                        Zu heutiger Etappe springen
                      </button>
                    </div>
                  </section>
                )}
                {rtUiClassic() ? <>
{/* VISUAL ROADTRIP TIMELINE BAR */}
                <div data-ro-ok data-etappen-strip className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 overflow-x-auto no-print">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Etappen-Übersicht
                    </span>
                    <span className="text-xs text-slate-500">
                      Gesamt: {(tripData.stages || []).length} Stationen • {financeSummary.totalNights} Übernachtungen
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-max py-1">
                    {(tripData.stages || []).map((st, idx) => {
                      const isExp = expandedStages[st.id] === true;
                      return (
                        <React.Fragment key={st.id}>
                          <button
                            onClick={() => {
                              openStagePage(st.id);
                            }}
                            className={`group flex flex-col items-start p-2.5 rounded-xl border text-left transition min-w-[145px] ${
                              todayStages.some(stage => stage.id === st.id)
                                ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-200'
                                : isExp
                                  ? 'bg-blue-50/80 border-blue-400 shadow-2xs'
                                  : 'bg-slate-50 border-slate-200 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${todayStages.some(stage => stage.id === st.id) ? 'bg-emerald-700 text-white' : 'bg-blue-600 text-white'}`}>
                                #{idx + 1} • {st.nights}N{todayStages.some(stage => stage.id === st.id) ? ' · Heute' : ''}
                              </span>
                              <span className="text-[11px] text-slate-500">{st.routeToHotel?.duration || ''}</span>
                            </div>
                            <div className="font-bold text-xs text-slate-900 mt-1 truncate w-full group-hover:text-blue-700">
                              {st.toCity}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate w-full">{st.dateRange}</div>
                          </button>
                          {idx < (tripData.stages || []).length - 1 && (
                            <span className="text-slate-300 font-bold text-lg select-none">→</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                    <button
                      onClick={() => {
                        const allOpen = (tripData.stages || []).every((s) => expandedStages[s.id]);
                        const nextState = {};
                        (tripData.stages || []).forEach((s) => {
                          nextState[s.id] = !allOpen;
                        });
                        setExpandedStages(nextState);
                      }}
                      data-readonly-allow
                      className="hidden"
                    >
                      Alle auf-/zuklappen
                    </button>
                    <button
                      onClick={handleAddStage}
                      className="v18-edit-only bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition"
                    >
                      + Neue Etappe anlegen
                    </button>
                  </div>
                </div>

                <RtPlanStatus trip={tripData} goTab={setActiveTab} />
                <CardExpiryAlerts trip={tripData} goCards={() => setActiveTab('cards')} />
                <RtMigrate trip={tripData} onSave={saveTripData} />
                <RtGeoFill trip={tripData} onSave={saveTripData} />
                <RouteCalcAll trip={tripData} onSave={saveTripData} />
                <RtRouteEdit trip={tripData} />
                <StageFinder trip={tripData} onPick={handleAddSuggestedStage} />

                </> : <>
                <RtPlanTop trip={tripData} goTab={setActiveTab}>
                  <RouteCalcAll trip={tripData} onSave={saveTripData} />
                  <RtRouteEdit trip={tripData} />
                  <StageFinder trip={tripData} onPick={handleAddSuggestedStage} />
                </RtPlanTop>
                <CardExpiryAlerts trip={tripData} goCards={() => setActiveTab('cards')} />
                <RtMigrate trip={tripData} onSave={saveTripData} />
                <RtGeoFill trip={tripData} onSave={saveTripData} />
</>}

                {openStageId && rtUiClassic() && <StagePageBar stages={tripData.stages || []} openId={openStageId} tab={stageTab} setTab={setStageTab} onBack={() => setOpenStageId(null)} onOpen={(id) => openStagePage(id, stageTab)} />}
                {/* Stages List with Vertical Timeline Connector */}
                <div data-stage-wrap className={rtUiClassic() ? '' : 'rt2-split'}><div className={rtUiClassic() ? '' : 'rt2-main'}>
                <div data-stage-list className={`${openStageId ? 'rt2-page ' : ''}relative space-y-8 before:hidden md:before:block before:absolute before:top-8 before:bottom-8 before:left-5 before:w-0.5 before:bg-slate-200 before:rounded-full`}>
                  {!rtUiClassic() && (!openStageId || openStageId === 'travel-out') && <RtTravelStage kind="out" trip={tripData} open={openStageId === 'travel-out'} onOpen={(id) => openStagePage(id || 'travel-out')} onBack={() => setOpenStageId(null)} save={saveTripData} />}
                  {stageDnd.order.map((oi, pos) => { const stage = (tripData.stages || [])[oi]; const sIdx = rtUiClassic() || openStageId ? oi : pos; const dndOi = oi;
                    if (openStageId && stage.id !== openStageId) return null;
                    const isPage = openStageId === stage.id; const isExpanded = isPage;
                    if (!isPage && !rtUiClassic()) return <RtStageRow key={stage.id} dnd={stageDnd} oi={dndOi} stage={stage} idx={sIdx} count={(tripData.stages || []).length} today={todayStages.some((item) => item.id === stage.id)} onOpen={() => openStagePage(stage.id)} onBasics={() => openStageEditor(stage, 'basics')} onUp={() => handleMoveStage(sIdx, -1)} onDown={() => handleMoveStage(sIdx, 1)} onDelete={() => rtDelStage(stage, sIdx)} />;
                    if (isPage && !rtUiClassic()) return <RtStagePage key={stage.id} trip={tripData} stage={stage} idx={sIdx} tab={stageTab} setTab={setStageTab} onBack={() => setOpenStageId(null)} onOpen={(id) => openStagePage(id, stageTab)} save={saveTripData} openEditor={openStageEditor} onDelete={() => rtDelStage(stage, sIdx)} onUp={() => handleMoveStage(sIdx, -1)} onDown={() => handleMoveStage(sIdx, 1)} assist={(k) => <StageSectionAssist kind={k} trip={tripData} stage={stage} index={sIdx} onAddStop={handleAddWayStop} onSetHotel={handleSetStageHotel} onAddLocal={handleAddLocalFromAssistant} />} wayTools={<>{sIdx === 0 && rtHasLeg(tripData, 'out') && <HomeLegCard kind="out" trip={tripData} stage={stage} onSave={saveTripData} />}{sIdx === (tripData.stages || []).length - 1 && rtHasLeg(tripData, 'back') && <HomeLegCard kind="back" trip={tripData} stage={stage} onSave={saveTripData} />}<RouteCalcBar trip={tripData} stage={stage} index={sIdx} onSave={saveTripData} /></>} />;
                    const h = stage.hotel || {};
                    const priceSaved = (parseFloat(h.priceOldEur) || 0) - (parseFloat(h.priceNewEur) || 0);
                    const nightsCount = Math.max(1, parseInt(stage.nights, 10) || 1);
                    const currentDayFilter = stageActiveDayTab[stage.id] !== undefined ? stageActiveDayTab[stage.id] : 0; // 0 = Alle Tage

                    // Distribute attractions across days if not explicitly set when nights >= 2
                    const attractionsWithDays = (stage.localAttractions || []).map((act, idx) => {
                      const assignedDay = act.day ? parseInt(act.day, 10) : (idx % nightsCount) + 1;
                      return { ...act, computedDay: Math.min(nightsCount, Math.max(1, assignedDay)) };
                    });

                    const visibleAttractions =
                      nightsCount >= 2 && currentDayFilter > 0
                        ? attractionsWithDays.filter((a) => a.computedDay === currentDayFilter)
                        : attractionsWithDays;

                    return (
                      <div
                        id={`stage-card-${stage.id}`}
                        key={stage.id}
                        className={`relative ${isPage ? '' : 'md:pl-14'} ${todayStages.some(item => item.id === stage.id) ? 'today-stage' : ''}`}
                      >
                        {/* Timeline Node Badge on Desktop */}
                        <div className={`${isPage ? "hidden" : "hidden md:flex"} absolute left-0 top-3 w-11 h-11 rounded-full bg-[#E8EEF7] border-2 border-[#1F4E8C] text-[#173B6B] font-extrabold text-xs items-center justify-center shadow-md z-10`}>
                          #{sIdx + 1}
                        </div>

                        <div className={`flex flex-col bg-white rounded-2xl shadow-xs border overflow-hidden ${todayStages.some(item => item.id === stage.id) ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md' : 'border-slate-200'}`}>
                          {/* Stage Top Header */}
                          <div className="bg-white text-slate-900 px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div
                              onClick={() => { if (!isPage) openStagePage(stage.id); }}
                              className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-[230px]"
                            >
                              <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${todayStages.some(item => item.id === stage.id) ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                                Etappe {sIdx + 1}{todayStages.some(item => item.id === stage.id) && <span className="ml-1 rounded bg-white/20 px-1.5 py-0.5">Heute</span>}
                              </span>
                              <div>
                                <div className="flex items-center gap-2 text-sm sm:text-base font-bold">
                                  <span>{stage.fromCity}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="text-[#173B6B]">{stage.toCity || `Ziel Etappe ${sIdx + 1}`}</span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                                  <span>{stage.dateRange}</span>
                                  {!(sIdx === (tripData.stages || []).length - 1 && (tripData.stages || []).length > 1 && !(parseInt(stage.nights, 10) > 0)) && <><span>•</span>
                                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                                    {nightsCount} {nightsCount === 1 ? 'Übernachtung' : 'Übernachtungen'}
                                  </span></>}
                                  <span>•</span>
                                  <span className="text-[#173B6B] font-medium">{h.name}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 no-print">
                              {rtUiClassic() ? <><button
                                onClick={() => handleMoveStage(sIdx, -1)}
                                disabled={sIdx === 0}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-xs"
                                title="Nach oben"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleMoveStage(sIdx, 1)}
                                disabled={sIdx === (tripData.stages || []).length - 1}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-xs"
                                title="Nach unten"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => openStageEditor(stage, 'basics')}
                                className="bg-[#1F4E8C] hover:bg-[#173B6B] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                              >
                                ✎ Grunddaten bearbeiten
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    type: 'stage',
                                    id: stage.id,
                                    title: `Etappe ${sIdx + 1}: ${stage.fromCity} → ${stage.toCity}`
                                  })
                                }
                                className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-600 text-slate-600 hover:text-white text-xs transition"
                                title="Löschen"
                              >
                                🗑
                              </button></> : <>
                              <button type="button" data-stage-basics onClick={() => openStageEditor(stage, 'basics')} className="v18-btn">Grunddaten bearbeiten</button>
                              <RtStageMenu label={`Etappe ${sIdx + 1}`} upOff={sIdx === 0} downOff={sIdx === (tripData.stages || []).length - 1} onUp={() => handleMoveStage(sIdx, -1)} onDown={() => handleMoveStage(sIdx, 1)} onDelete={() => setDeleteConfirmModal({ type: 'stage', id: stage.id, title: `Etappe ${sIdx + 1}: ${stage.fromCity} → ${stage.toCity}` })} />
                              </>}
                            </div>
                          </div>

                          {isPage ? null : <StageListFoot ret={(sIdx === (tripData.stages || []).length - 1 && (tripData.stages || []).length > 1 && !(parseInt(stage.nights, 10) > 0))} stage={stage} onOpen={() => openStagePage(stage.id)} />}

                          {isExpanded && (
                            <div style={{ order: 2 }} className="p-3 sm:p-5 space-y-6">
                              {/* 1. DER WEG ZUM HOTEL */}
                              <details className={`stage-section rounded-xl border border-amber-200 bg-amber-50/40 overflow-hidden ${stageTab === 'way' || stageTab === 'all' ? '' : 'hidden'}`} open>
                                <summary className="bg-amber-100/80 text-amber-950"><span className="w-7 h-7 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center shrink-0">1</span><span className="min-w-0">Weg zum Hotel · {stage.fromCity || `Start Etappe ${sIdx + 1}`} → {stage.toCity || `Ziel Etappe ${sIdx + 1}`}</span><button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openStageEditor(stage, 'route'); }} className="stage-edit-action" aria-label="Weg zum Hotel bearbeiten">✎ Bearbeiten</button></summary><StageSectionAssist kind="way" trip={tripData} stage={stage} index={sIdx} onAddStop={handleAddWayStop} onSetHotel={handleSetStageHotel} onAddLocal={handleAddLocalFromAssistant} />{sIdx === 0 && rtHasLeg(tripData, 'out') && <HomeLegCard kind="out" trip={tripData} stage={stage} onSave={saveTripData} />}{sIdx === (tripData.stages || []).length - 1 && rtHasLeg(tripData, 'back') && <HomeLegCard kind="back" trip={tripData} stage={stage} onSave={saveTripData} />}<RouteCalcBar trip={tripData} stage={stage} index={sIdx} onSave={saveTripData} />
                                <div className="rounded-xl border border-amber-200 bg-amber-50/40 overflow-hidden">
                                <div className="bg-amber-100/80 px-4 py-2.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 flex-wrap">
                                    {stage.routeToHotel?.distanceKm && (
                                      <span className="bg-white/90 px-2.5 py-0.5 rounded-md border border-amber-300">
                                        Strecke: {stage.routeToHotel.distanceKm}
                                      </span>
                                    )}
                                    {stage.routeToHotel?.duration && (
                                      <span className="bg-white/90 px-2.5 py-0.5 rounded-md border border-amber-300">
                                        Fahrzeit: {stage.routeToHotel.duration}
                                      </span>
                                    )}
                                    {/* Bearbeiten-Aktion liegt einheitlich im Bereichs-Kopf. */}
                                  </div>
                                </div>

                                <div className="p-3 sm:p-4 space-y-3">
                                  {stage.routeToHotel?.routeDescription && (
                                    <p className="text-xs sm:text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-amber-200/80">
                                      <strong className="text-amber-900">Routen-Info: </strong>
                                      {stage.routeToHotel.routeDescription}
                                    </p>
                                  )}

                                  {(stage.routeToHotel?.stopsOnWay || []).length === 0 ? (
                                    <div className="text-xs text-slate-500 py-1 text-center">
                                      Direktfahrt zum Hotel (keine Zwischenstopps eingetragen).
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {(stage.routeToHotel?.stopsOnWay || []).map((stop, stIdx) => (
                                        <div
                                          key={stop.id || stIdx}
                                          className="bg-white rounded-lg p-3 border border-amber-200 shadow-2xs flex flex-col justify-between gap-2"
                                        >
                                          <div>
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                                                  Stopp {stIdx + 1}
                                                </span>
                                                <h4 className="font-bold text-sm text-slate-900">{stop.name || `Zwischenstopp #${stIdx + 1}`}</h4>
                                              </div>
                                              {parseFloat(stop.costEur) > 0 && (
                                                <span className="text-xs font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded shrink-0">
                                                  {formatEur(stop.costEur)}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                                              {stop.time && <span>{stop.time}</span>}
                                              {stop.duration && <span>Dauer: {stop.duration}</span>}
                                            </div>
                                            {stop.notes && (
                                              <p className="text-xs text-slate-700 mt-1.5 bg-slate-50 p-2 rounded border border-slate-100">
                                                {stop.notes}
                                              </p>
                                            )}
                                          </div>

                                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                                            <span className="text-slate-500 truncate">
                                              📍 {stop.gps || stop.address || 'Keine Koordinaten'}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0 no-print">
                                              {stop.gps && (
                                                <button
                                                  onClick={() => copyToClipboard(stop.gps, 'GPS kopiert')}
                                                  className="compact-action px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px]"
                                                >
                                                  Copy GPS
                                                </button>
                                              )}
                                              <a
                                                href={getGoogleMapsUrl(stop.gps, stop.address, stop.name)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pointer-events-auto cursor-pointer px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium"
                                              >
                                                Maps
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              </details>

                              <details className={`stage-section rounded-xl border border-blue-200 bg-white overflow-hidden ${(stageTab === 'hotel' || stageTab === 'all') && !(sIdx === (tripData.stages || []).length - 1 && (tripData.stages || []).length > 1 && !(parseInt(stage.nights, 10) > 0)) ? '' : 'hidden'}`} open>
                                <summary className="bg-blue-50 text-blue-950"><span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0">2</span><span className="min-w-0">Hotel & Unterkunft{stage.hotel?.name ? ` · ${stage.hotel.name}` : ''}</span><button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openStageEditor(stage, 'hotel'); }} className="stage-edit-action" aria-label="Hotel bearbeiten">✎ Bearbeiten</button></summary><StageSectionAssist kind="hotel" trip={tripData} stage={stage} index={sIdx} onAddStop={handleAddWayStop} onSetHotel={handleSetStageHotel} onAddLocal={handleAddLocalFromAssistant} />
                                {stage.hotel && (<>
                              {/* 2. HOTEL / UNTERKUNFT (SCREENSHOT-TABELLE ODER ÜBERSICHTLICHE KOMPAKT-KARTE MIT ALLEN DATEN) */}
                              <div className="rounded-xl border border-blue-200 bg-white overflow-hidden">
                                <div className="bg-blue-50/90 px-4 py-2.5 border-b border-blue-200 flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap no-print">
                                    
                                    {priceSaved > 0 && (
                                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        Ersparnis: {formatEur(priceSaved)}
                                      </span>
                                    )}
                                    {/* Kreditkartenangaben bleiben in den Hoteldetails sichtbar. */}
                                  </div>
                                </div>

                                {/* ÜBERSICHTLICHE HOTEL-KOMPAKTKARTE MIT ALLEN FELDERN */}
                                <div className="p-4 space-y-4 text-xs">
                                  {/* Top Banner: Hotel Name, Address, Rating & Quick GPS */}
                                  <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex-1 min-w-[15rem]">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="bg-blue-500/30 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded font-semibold">
                                          Start / Ziel: {stage.toCity}
                                        </span>
                                        <h4 className="text-base sm:text-lg font-extrabold text-white break-words min-w-0">{h.name}</h4>
                                        <span className="bg-amber-400 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-md">
                                          ★ Bew.: {h.rating || '—'}
                                        </span>
                                        <RtCardChip name={h.creditCard} cards={tripData.creditCards} dark />
                                      </div>
                                      <p className="text-slate-300 italic mt-1"><Ic n="pin" />{h.address}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 max-w-full min-w-0">
                                      {normalizeHotelLink(h.bookingLink) && <a href={normalizeHotelLink(h.bookingLink)} target="_blank" rel="noopener" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">Buchung</a>}
                                      {normalizeHotelLink(h.hotelLink) && <a href={normalizeHotelLink(h.hotelLink)} target="_blank" rel="noopener" className="bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">Hotel-Webseite</a>}
                                      <a
                                        href={getGoogleMapsUrl(h.gps, h.address, h.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg"
                                      >
                                        Hotel Koordinate
                                      </a>
                                      {(h.parkingGarageName || h.parkingGarageGps) && (
                                        <a
                                          href={getGoogleMapsUrl(h.parkingGarageGps, h.parkingGarageAddress, h.parkingGarageName)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-1.5 rounded-lg"
                                        >
                                          🅿️ Parkhaus Koordinate
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  {/* 4-Column Structured Grid with ALL Fields & Interactive Toggle Buttons */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {/* Spalte 1: Zeiten & Storno */}
                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                                      <div className="font-bold uppercase text-slate-500 border-b border-slate-200 pb-1">
                                        Check-In / Out & Storno
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Check IN:</span>
                                        <span className="font-bold text-slate-900">{h.checkIn}</span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Check OUT:</span>
                                        <span className="font-bold text-slate-900">{h.checkOut}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Storno bis:</span>
                                        <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded">
                                          {h.cancelUntil || '—'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Spalte 2: Umschaltbare Leistungen (Frühstück, Parken, Vorab bez.) */}
                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                                      <div className="font-bold uppercase text-slate-500 border-b border-slate-200 pb-1">
                                        ☕ Leistungen (Klick = Umschalten)
                                      </div>
                                      <div className="flex items-center justify-between py-0.5">
                                        <span className="text-slate-600 font-medium">Frühstück:</span>
                                        <button type="button" data-hotel-toggle="breakfast" aria-pressed={isPositiveValue(h.breakfast)} title="Klicken zum Umschalten" onClick={() => rtHotelSet(stage.id, { breakfast: isPositiveValue(h.breakfast) ? 'nein' : 'ja' })} className={`px-3 py-1 rounded-lg font-bold border transition cursor-pointer ${
 isPositiveValue(h.breakfast)
                                              ? 'bg-emerald-200 text-emerald-950 border-emerald-400'
                                              : 'bg-rose-200 text-rose-900 border-rose-400'
                                          }`}>{h.breakfast || '—'}</button>
                                      </div>
                                      <div className="flex items-center justify-between py-0.5">
                                        <span className="text-slate-600 font-medium">Parken:</span>
                                        <button type="button" data-hotel-toggle="parking" aria-pressed={isPositiveValue(h.parking)} title="Klicken zum Umschalten" onClick={() => rtHotelSet(stage.id, { parking: isPositiveValue(h.parking) ? 'nein' : 'ja' })} className={`px-3 py-1 rounded-lg font-bold border transition cursor-pointer ${
 isPositiveValue(h.parking)
                                              ? 'bg-emerald-200 text-emerald-950 border-emerald-400'
                                              : 'bg-rose-200 text-rose-900 border-rose-400'
                                          }`}>{h.parking || '—'}</button>
                                      </div>
                                      <div className="flex items-center justify-between py-0.5">
                                        <span className="text-slate-600 font-medium">Vorab bez.:</span>
                                        <button type="button" data-hotel-toggle="prepaid" aria-pressed={isPositiveValue(h.prepaid)} title="Klicken zum Umschalten" onClick={() => rtHotelSet(stage.id, { prepaid: isPositiveValue(h.prepaid) ? 'nein' : 'ja' })} className={`px-3 py-1 rounded-lg font-bold border transition cursor-pointer ${
 isPositiveValue(h.prepaid)
                                              ? 'bg-emerald-200 text-emerald-950 border-emerald-400'
                                              : 'bg-rose-200 text-rose-900 border-rose-400'
                                          }`}>{h.prepaid || '—'}</button>
                                      </div>
                                    </div>

                                    {/* Spalte 3: Preise (ALT, NEU, USD) */}
                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                                      <div className="font-bold uppercase text-slate-500 border-b border-slate-200 pb-1">
                                        Preisvergleich (€ & $)
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Preis ALT:</span>
                                        <span className="line-through text-slate-500 font-semibold">{formatEur(h.priceOldEur)}</span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Preis NEU:</span>
                                        <span className="font-extrabold text-sm text-blue-700">{formatEur(h.priceNewEur)}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Preis $:</span>
                                        <span className="font-bold text-slate-900">{formatUsd(h.priceUsd)}</span>
                                      </div>
                                    </div>

                                    {/* Spalte 4: Kreditkarte & Belastungsdaten */}
                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                                      <div className="font-bold uppercase text-slate-500 border-b border-slate-200 pb-1">
                                        Karte & Abbuchung
                                      </div>
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-slate-500">Kreditkarte:</span>
                                        <span title="Nur im Bearbeiten-Dialog änderbar"><RtCardChip name={h.creditCard} cards={tripData.creditCards} /></span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Abbuchung angekündigt:</span>
                                        <span className="font-semibold text-slate-900">{h.chargeAnnounced || '—'}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Kred.K. belastet:</span>
                                        <span className="font-semibold text-slate-900">{h.cardCharged || '—'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bemerkungen & Parkhaus-Zeile unten */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-2 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                                      <span className="font-bold underline text-slate-900 block mb-1">Bemerkungen:</span>
                                      <p className="whitespace-pre-line text-slate-800 leading-relaxed">
                                        {h.remarks || 'Keine Bemerkungen'}
                                      </p>
                                    </div>
                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                                      <span className="font-bold underline text-slate-900 block">GPS-Koordinaten:</span>
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-slate-600 truncate">{h.gps || '—'}</span>
                                        {h.gps && (
                                          <button
                                            onClick={() => copyToClipboard(h.gps, 'Hotel-GPS kopiert')}
                                            className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[11px]"
                                          >
                                            Copy
                                          </button>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-slate-600 truncate"><Ic n="park" />{h.parkingGarageName || '—'} ({h.parkingGarageGps || '—'})</span>
                                        {h.parkingGarageGps && (
                                          <button
                                            onClick={() => copyToClipboard(h.parkingGarageGps, 'Parkhaus-GPS kopiert')}
                                            className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[11px]"
                                          >
                                            Copy
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              </>)}
                              {!stage.hotel && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 flex flex-wrap items-center justify-between gap-3"><span>Keine Unterkunft für diese Etappe hinterlegt.</span><button type="button" onClick={() => openStageEditor(stage, 'hotel')} className="min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg">+ Hotel hinzufügen</button></div>}
                              </details>

                              {/* 3. SEHENSWÜRDIGKEITEN & AKTIONEN VOR ORT (MIT TAGES-REITERN BEI >= 2 ÜBERNACHTUNGEN) */}
                              <details className={`stage-section rounded-xl border border-emerald-200 bg-emerald-50/40 overflow-hidden ${(stageTab === 'do' || stageTab === 'all') && !(sIdx === (tripData.stages || []).length - 1 && (tripData.stages || []).length > 1 && !(parseInt(stage.nights, 10) > 0)) ? '' : 'hidden'}`} open>
                                <summary className="bg-emerald-100 text-emerald-950"><span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center shrink-0">3</span><span className="min-w-0">Aktionen vor Ort · {stage.toCity || `Ziel Etappe ${sIdx + 1}`}</span><button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openStageEditor(stage, 'activities'); }} className="stage-edit-action" aria-label="Aktionen vor Ort bearbeiten">✎ Bearbeiten</button></summary><StageSectionAssist kind="do" trip={tripData} stage={stage} index={sIdx} onAddStop={handleAddWayStop} onSetHotel={handleSetStageHotel} onAddLocal={handleAddLocalFromAssistant} />
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 overflow-hidden">
                                <div className="bg-emerald-100/80 px-4 py-2.5 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2">

                                  {/* DAY TABS FOR MULTI-NIGHT STAGES (2 OR MORE NIGHTS) */}
                                  {nightsCount >= 2 && (
                                    <div className="flex items-center gap-1 bg-white/90 p-1 rounded-lg border border-emerald-300 flex-wrap">
                                      <button
                                        onClick={() => setStageActiveDayTab((prev) => ({ ...prev, [stage.id]: 0 }))}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                                          currentDayFilter === 0
                                            ? 'bg-emerald-600 text-white shadow-2xs'
                                            : 'text-emerald-900 hover:bg-emerald-100'
                                        }`}
                                      >
                                        Alle ({attractionsWithDays.length})
                                      </button>
                                      {Array.from({ length: nightsCount }, (_, i) => i + 1).map((dayNum) => {
                                        const countForDay = attractionsWithDays.filter((a) => a.computedDay === dayNum).length;
                                        return (
                                          <button
                                            key={dayNum}
                                            onClick={() => setStageActiveDayTab((prev) => ({ ...prev, [stage.id]: dayNum }))}
                                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                                              currentDayFilter === dayNum
                                                ? 'bg-emerald-600 text-white shadow-2xs'
                                                : 'text-emerald-900 hover:bg-emerald-100'
                                            }`}
                                          >
                                            Tag {dayNum} vor Ort ({countForDay})
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Bearbeiten-Aktion liegt einheitlich im Bereichs-Kopf. */}
                                </div>

                                <div className="p-3 sm:p-4">
                                  {visibleAttractions.length === 0 ? (
                                    <p className="text-xs text-slate-500 text-center py-2">
                                      Keine Aktivitäten für diesen Tag hinterlegt.
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {visibleAttractions.map((act, aIdx) => (
                                        <div
                                          key={act.id || aIdx}
                                          className="bg-white rounded-lg p-3 border border-emerald-200 shadow-2xs flex flex-col justify-between gap-2"
                                        >
                                          <div>
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex items-center gap-1 flex-wrap">
                                                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                                                  {act.category || 'Ausflug'}
                                                </span>
                                                {nightsCount >= 2 && (
                                                  <select
                                                    value={act.computedDay}
                                                    onChange={(e) => handleAssignAttractionDay(stage.id, act.id, parseInt(e.target.value, 10))}
                                                    className="compact-select text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded px-1.5 py-0.5 cursor-pointer"
                                                    title="Aufenthaltstag wechseln"
                                                  >
                                                    {Array.from({ length: nightsCount }, (_, i) => i + 1).map((d) => (
                                                      <option key={d} value={d}>Tag {d}</option>
                                                    ))}
                                                  </select>
                                                )}
                                              </div>
                                              <span className="text-xs font-bold text-slate-800">
                                                {parseFloat(act.priceEur) > 0 ? formatEur(act.priceEur) : 'Kostenlos'}
                                              </span>
                                            </div>
                                            <h4 className="font-bold text-sm text-slate-900 mt-1.5">{act.name || `Aktion #${aIdx + 1}`}</h4>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between gap-1 flex-wrap">
                                              <span>{act.date ? `📅 ${act.date} · ` : ''}{act.time || 'Flexibel'}</span>
                                              <span aria-disabled="true" title="Nur im Etappen-Bearbeiten-Dialog änderbar" className={`px-2 py-0.5 rounded font-semibold border transition ${
                                                  isPositiveValue(act.booked)
                                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                                    : 'bg-slate-100 text-slate-700 border-slate-300'
                                                }`}>Ticket: {act.booked || 'Offen'}</span>
                                            </div>
                                            {act.notes && (
                                              <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                                                {act.notes}
                                              </p>
                                            )}
                                          </div>

                                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                                            <span className="text-slate-500 truncate">
                                              📍 {act.gps || act.address || stage.toCity}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0 no-print">
                                              {act.gps && (
                                                <button
                                                  onClick={() => copyToClipboard(act.gps, 'GPS kopiert')}
                                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px]"
                                                >
                                                  Copy
                                                </button>
                                              )}
                                              <a
                                                href={getGoogleMapsUrl(act.gps, act.address, act.name)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                              >
                                                Maps
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              </details>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!rtUiClassic() && (!openStageId || openStageId === 'travel-back') && <RtTravelStage kind="back" trip={tripData} open={openStageId === 'travel-back'} onOpen={(id) => openStagePage(id || 'travel-back')} onBack={() => setOpenStageId(null)} save={saveTripData} />}
                </div>
                </div>{!openStageId && !rtUiClassic() && <aside className="rt2-mapbox" aria-label="Karte der Etappen"><RtRouteMini trip={tripData} onOpen={(id) => openStagePage(id)} /></aside>}</div>
                {!rtUiClassic() && <>
{/* Toolbar */}
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                    <button
                      onClick={() => {
                        const allOpen = (tripData.stages || []).every((s) => expandedStages[s.id]);
                        const nextState = {};
                        (tripData.stages || []).forEach((s) => {
                          nextState[s.id] = !allOpen;
                        });
                        setExpandedStages(nextState);
                      }}
                      data-readonly-allow
                      className="hidden"
                    >
                      Alle auf-/zuklappen
                    </button>
                    <button
                      onClick={handleAddStage}
                      className="v18-edit-only bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition"
                    >
                      + Neue Etappe anlegen
                    </button>
                  </div>
                </div>

                {/* VISUAL ROADTRIP TIMELINE BAR */}
                <div data-ro-ok data-etappen-strip className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 overflow-x-auto no-print">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Etappen-Übersicht
                    </span>
                    <span className="text-xs text-slate-500">
                      Gesamt: {(tripData.stages || []).length} Stationen • {financeSummary.totalNights} Übernachtungen
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-max py-1">
                    {(tripData.stages || []).map((st, idx) => {
                      const isExp = expandedStages[st.id] === true;
                      return (
                        <React.Fragment key={st.id}>
                          <button
                            onClick={() => {
                              openStagePage(st.id);
                            }}
                            className={`group flex flex-col items-start p-2.5 rounded-xl border text-left transition min-w-[145px] ${
                              todayStages.some(stage => stage.id === st.id)
                                ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-200'
                                : isExp
                                  ? 'bg-blue-50/80 border-blue-400 shadow-2xs'
                                  : 'bg-slate-50 border-slate-200 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${todayStages.some(stage => stage.id === st.id) ? 'bg-emerald-700 text-white' : 'bg-blue-600 text-white'}`}>
                                #{idx + 1} • {st.nights}N{todayStages.some(stage => stage.id === st.id) ? ' · Heute' : ''}
                              </span>
                              <span className="text-[11px] text-slate-500">{st.routeToHotel?.duration || ''}</span>
                            </div>
                            <div className="font-bold text-xs text-slate-900 mt-1 truncate w-full group-hover:text-blue-700">
                              {st.toCity}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate w-full">{st.dateRange}</div>
                          </button>
                          {idx < (tripData.stages || []).length - 1 && (
                            <span className="text-slate-300 font-bold text-lg select-none">→</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                </>}
              </div>
            )}

            {/* ===============================================================
                TAB 2: FLUG & MIETWAGEN (MIT 1-KLICK STATUS-BUTTONS)
            =============================================================== */}
            {activeTab === 'map' && (<div data-ro-ok className="space-y-6"><RoadtripMap trip={tripData} onSave={saveTripData} /><OvMap trip={tripData} focus={null} onFocusDone={() => {}} /><RtOfflineMaps trip={tripData} /></div>)}
            {activeTab === 'today' && (<div data-ro-ok className="space-y-4"><TodayView trip={tripData} onSave={saveTripData} todayIso={todayIso} goTab={setActiveTab} /><RtReceipts compact trip={tripData} onSave={saveTripData} readOnly={isReadOnly} /></div>)}
            {activeTab === 'overview' && (<div data-ro-ok><TripOverview trip={tripData} onSave={saveTripData} todayIso={todayIso} goTab={setActiveTab} /></div>)}
            {activeTab === 'plan' && (<div data-ro-ok><PlanView trip={tripData} onSave={saveTripData} todayIso={todayIso} /></div>)}
            {activeTab === 'org' && (<div data-ro-ok><OrgView trip={tripData} onSave={saveTripData} /></div>)}
            {activeTab === 'wx' && (<div data-ro-ok><WeatherView trip={tripData} todayIso={todayIso} /></div>)}
            {activeTab === 'trip' && (<div data-ro-ok><TripToolsView trip={tripData} onSave={saveTripData} todayIso={todayIso} /></div>)}

            {activeTab === 'basics' && (
              <div className="space-y-8">
                <CardExpiryAlerts trip={tripData} goCards={() => setActiveTab('cards')} />
                {rtUiClassic() ? <BookingHotels trip={tripData} onSave={saveTripData} goStage={(s) => { setActiveTab('stages'); setTimeout(() => window.dispatchEvent(new CustomEvent('rt-assist', { detail: { stageId: s.id, step: 'hotel' } })), 80); }} /> : <RtBookList trip={tripData} save={saveTripData} goStage={(s) => { setActiveTab('stages'); setTimeout(() => openStagePage(s.id, 'hotel'), 60); }} editFlight={(f) => setEditingFlightModal(JSON.parse(JSON.stringify(f)))} editCar={(c) => setEditingCarModal(JSON.parse(JSON.stringify(c)))} newFlight={() => { const b = document.querySelector('[data-legacy-book="flight"] [data-legacy-add]'); if (b) b.click(); }} newCar={() => { const b = document.querySelector('[data-legacy-book="car"] [data-legacy-add]'); if (b) b.click(); }} />}
                {rtUiClassic() && <RtIcsButton trip={tripData} className="v18-btn" />}
                {/* FLÜGE */}
                <section data-legacy-book="flight" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold">Flugdaten (Hin- & Rückflug)</h2>
                      <p className="text-xs text-slate-300">Airlines, Flugnummern, Buchungscode (PNR), Sitzplätze & Gepäck</p>
                    </div>
                    <button data-legacy-add
                      onClick={() =>
                        setEditingFlightModal({
                          id: `fl-${Date.now()}`,
                          direction: '',
                          airline: '',
                          flightNumber: '',
                          from: '',
                          to: '',
                          departureDate: '',
                          departureTime: '',
                          arrivalTime: '',
                          bookingCode: '',
                          seats: '',
                          luggage: '',
                          priceOldEur: '',
                          priceNewEur: '',
                          priceUsd: '',
                          prepaid: '',
                          creditCard: '',
                          paidBy: '',
                          chargeAnnounced: '',
                          cardCharged: '',
                          notes: ''
                        })
                      }
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg"
                    >
                      + Flug hinzufügen
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(tripData.flights || []).map((fl) => (
                      <div key={fl.id} className="rounded-xl border border-slate-300 p-4 bg-slate-50/60 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                                {fl.direction}
                              </span>
                              <span className="font-bold text-slate-900 text-base">
                                {fl.airline} • {fl.flightNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingFlightModal(JSON.parse(JSON.stringify(fl)))}
                                className="text-xs bg-white hover:bg-blue-50 text-blue-700 border border-slate-300 px-2.5 py-1 rounded font-semibold"
                              >
                                ✎ Bearbeiten
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    type: 'flight',
                                    id: fl.id,
                                    title: `${fl.direction}: ${fl.airline} ${fl.flightNumber}`
                                  })
                                }
                                className="px-2 py-1 text-slate-400 hover:text-rose-600"
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3 text-xs">
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Route</span>
                              <span className="font-bold text-slate-900">{fl.from} → {fl.to}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Datum & Zeit</span>
                              <span className="font-bold text-slate-900">{fl.departureDate} ({fl.departureTime})</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Buchungscode</span>
                              <span className="font-mono font-bold text-blue-700 text-sm">{fl.bookingCode || '—'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Sitzplätze</span>
                              <span className="font-bold text-slate-900">{fl.seats || '—'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Gepäck</span>
                              <span className="font-bold text-slate-900">{fl.luggage || '—'}</span>
                            </div>
                            <div className="bg-emerald-100 p-2.5 rounded-lg border border-emerald-300 flex items-center justify-between">
                              <div>
                                <span className="text-emerald-800 block">Karte / Vorab bez.</span>
                                <span className="font-bold text-emerald-950">{fl.creditCard}</span>
                              </div>
                              <span aria-disabled="true" title="Im Ansichtsmodus schreibgeschützt; über Flugdaten bearbeiten ändern" className={`px-2 py-1 rounded font-bold border ${
                                  isPositiveValue(fl.prepaid)
                                    ? 'bg-emerald-300 text-emerald-950 border-emerald-500'
                                    : 'bg-rose-200 text-rose-900 border-rose-400'
                                }`}>{fl.prepaid}</span>
                            </div>
                          </div>

                          {fl.notes && (
                            <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                              <strong>Hinweis:</strong> {fl.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                          <span className="text-slate-600">Belastet am: <strong>{fl.cardCharged || '—'}</strong></span>
                          <span className="text-sm font-bold text-slate-900">Preis: {formatEur(fl.priceNewEur)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* MIETWAGEN */}
                <section data-legacy-book="car" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold">Leihwagen / Mietwagen</h2>
                      <p className="text-xs text-slate-300">Vermieter, Fahrzeugklasse, Abholung/Rückgabe, Maut-Pass & Preis-Vergleich</p>
                    </div>
                    <button data-legacy-add
                      onClick={() =>
                        setEditingCarModal({
                          id: `car-${Date.now()}`,
                          provider: 'Alamo',
                          carClass: 'Minivan / SUV',
                          pickupLocation: '',
                          pickupDate: '',
                          pickupTime: '16:30 Uhr',
                          dropoffLocation: '',
                          dropoffDate: '',
                          dropoffTime: '14:00 Uhr',
                          bookingCode: '',
                          insuranceAndToll: 'Vollkasko ohne SB, SunPass aktiv',
                          cancelUntil: '',
                          priceOldEur: 0,
                          priceNewEur: 0,
                          priceUsd: 0,
                          prepaid: 'nein',
                          creditCard: tripData.creditCards?.[0]?.name || 'TF-Bank',
                          paidBy: participantNames[0],
                          chargeAnnounced: '',
                          cardCharged: '',
                          notes: ''
                        })
                      }
                      className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg"
                    >
                      + Mietwagen hinzufügen
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4">
                    {(tripData.rentalCars || []).map((car) => {
                      const saved = (parseFloat(car.priceOldEur) || 0) - (parseFloat(car.priceNewEur) || 0);
                      return (
                        <div key={car.id} className="rounded-xl border border-slate-300 p-4 bg-slate-50/60 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded">
                                  {car.provider}
                                </span>
                                <h3 className="text-base font-bold text-slate-900">{car.carClass}</h3>
                                {saved > 0 && (
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {formatEur(saved)} gespart!
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Buchungscode: <strong className="font-mono">{car.bookingCode}</strong> • Storno bis: <strong>{car.cancelUntil || '—'}</strong>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingCarModal(JSON.parse(JSON.stringify(car)))}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold"
                              >
                                ✎ Bearbeiten
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    type: 'car',
                                    id: car.id,
                                    title: `Mietwagen: ${car.provider}`
                                  })
                                }
                                className="px-2 py-1 text-slate-400 hover:text-rose-600"
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-500 font-semibold block">Abholung</span>
                              <span className="font-bold text-slate-900 block mt-0.5">{car.pickupLocation}</span>
                              <span className="text-blue-700 font-semibold">{car.pickupDate} • {car.pickupTime}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-500 font-semibold block">Rückgabe</span>
                              <span className="font-bold text-slate-900 block mt-0.5">{car.dropoffLocation}</span>
                              <span className="text-blue-700 font-semibold">{car.dropoffDate} • {car.dropoffTime}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-500 font-semibold block">Preis ALT / NEU</span>
                              <div className="mt-0.5 flex items-baseline gap-2">
                                <span className="line-through text-slate-400">{formatEur(car.priceOldEur)}</span>
                                <span className="font-bold text-sm text-slate-900">{formatEur(car.priceNewEur)}</span>
                              </div>
                            </div>
                            <div className="bg-emerald-100 p-3 rounded-lg border border-emerald-300 flex items-center justify-between">
                              <div>
                                <span className="text-emerald-800 font-semibold block">Kreditkarte</span>
                                <span className="font-bold text-emerald-950 block mt-0.5">{car.creditCard}</span>
                              </div>
                              <span aria-disabled="true" title="Im Ansichtsmodus schreibgeschützt; über Mietwagen bearbeiten ändern" className={`px-2.5 py-1 rounded font-bold border ${
                                  isPositiveValue(car.prepaid)
                                    ? 'bg-emerald-300 text-emerald-950 border-emerald-500'
                                    : 'bg-rose-200 text-rose-900 border-rose-400'
                                }`}>Vorab: {car.prepaid}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <strong className="block mb-0.5">Versicherung & Maut:</strong>
                              <span className="text-slate-700">{car.insuranceAndToll}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <strong className="block mb-0.5">Hinweise / Skip the Counter:</strong>
                              <span className="text-slate-700">{car.notes}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* ===============================================================
                TAB 3: KREDITKARTEN & NOTFALLNUMMERN (NEU!)
            =============================================================== */}
            {activeTab === 'cards' && (
              <div className="space-y-8">
                <CardExpiryAlerts trip={tripData} goCards={null} />
                <TemplateBar trip={tripData} onSave={saveTripData} />
                {/* SEKTION 1: KREDITKARTEN-VERWALTUNG & LIVE-KREDITRAHMEN */}
                <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                        <span>Kreditkarten & Konditionen</span>
                      </h2>
                      <p className="text-xs text-slate-300">
                        Hier hinterlegte Karten können direkt bei Flügen, Mietwagen und Hotels ausgewählt werden. Belastungen und freier Rahmen stehen im Budget.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setEditingCardModal({
                          id: `cc-${Date.now()}`,
                          name: '',
                          fullName: '',
                          holder: '',
                          limitEur: '',
                          foreignFee: '',
                          cashFee: '',
                          autoDebit: '',
                          cardNumber: '',
                          validUntil: '',
                          purpose: '',
                          emergencyPhone: '',
                          color: 'emerald'
                        })
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition"
                    >
                      + Neue Kreditkarte anlegen
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {(tripData.creditCards || []).map((card) => {
                      const stats = financeSummary.byCard[card.name] || { total: 0, paid: 0, open: 0, bookings: [] };
                      const limit = parseFloat(card.limitEur) || 0;
                      const remaining = limit - stats.total;
                      const usagePercent = limit > 0 ? Math.min(100, Math.round((stats.total / limit) * 100)) : 0;
                      const colorTheme = getCardColorClasses(card.color);
                      const isNumberShown = !!visibleCardNumbers[card.id];
                      const areBookingsExpanded = !!expandedCardDetails[card.id];

                      const l4 = String(card.cardNumber || '').replace(/\D/g, '').slice(-4);
                      const displayCardNumber = l4 ? `•••• •••• •••• ${l4}` : 'Keine Ziffern hinterlegt';

                      return (
                        <div
                          key={card.id}
                          className="rounded-2xl border border-slate-300 bg-white shadow-xs overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            {/* Visual Credit Card Header */}
                            <div className={`bg-gradient-to-r ${colorTheme.header} text-white p-4 space-y-3`}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[11px] uppercase tracking-wider opacity-80 block">
                                    Kreditkarte ({card.holder || 'Inhaber'})
                                  </span>
                                  <h3 className="text-lg font-extrabold tracking-tight flex items-center gap-2">{card.logo && <span className="inline-flex w-8 h-8 rounded-lg bg-white items-center justify-center overflow-hidden shrink-0"><img src={card.logo} alt="" className="max-w-full max-h-full object-contain" /></span>}{card.name}</h3>
                                  <p className="text-xs opacity-90">{card.fullName}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setEditingCardModal(JSON.parse(JSON.stringify(card)))}
                                    className="text-xs bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-md font-semibold transition"
                                    title="Karte bearbeiten"
                                  >
                                    ✎ Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteConfirmModal({
                                        type: 'card',
                                        id: card.id,
                                        title: `Kreditkarte: ${card.name}`
                                      })
                                    }
                                    className="text-xs bg-white/10 hover:bg-rose-600 text-white px-2 py-1 rounded-md transition"
                                    title="Karte löschen"
                                  >
                                    🗑
                                  </button>
                                </div>
                              </div>

                              {/* Card Number & Expiry */}
                              <div className="flex items-center justify-between pt-1 border-t border-white/15 text-xs font-mono">
                                <div className="flex items-center gap-2">
                                  <span className="tracking-widest text-sm font-bold">{displayCardNumber}</span>
                                </div>
                                <span>Gültig: <strong>{card.validUntil || '—'}</strong></span>
                              </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"><span><span className="font-semibold text-slate-600">Kreditrahmen:</span> <span className="font-bold text-slate-900">{formatEur(limit)}</span></span><button type="button" data-card-budget onClick={() => setActiveTab('finance')} className="text-blue-700 font-semibold hover:underline">Belastungen im Budget →</button></div>

                            {/* Card Terms & Conditions */}
                            <div className="p-4 space-y-2 text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-500 block font-medium">🌍 Auslandseinsatz</span>
                                  <span className="font-bold text-slate-900">{card.foreignFee || '—'}</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-500 block font-medium">🏧 Bargeldabhebung</span>
                                  <span className="font-bold text-slate-900">{card.cashFee || '—'}</span>
                                </div>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <span className="text-slate-500 block font-medium">🔄 Autom. Bankeinzug / Abrechnung</span>
                                <span className="font-bold text-slate-900">{card.autoDebit || '—'}</span>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <span className="text-slate-500 block font-medium"><Ic n="target" />Verwendung auf der Reise</span>
                                <span className="font-semibold text-slate-800">{card.purpose || '—'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer: Emergency Phone & Expandable Bookings List */}
                          <div className="p-3 bg-slate-100 border-t border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              {card.emergencyPhone ? (
                                <a
                                  href={`tel:${card.emergencyPhone.replace(/\s+/g, '')}`}
                                  className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-2.5 py-1.5 rounded-lg transition"
                                >
                                  Sperr-Notruf: {card.emergencyPhone}
                                </a>
                              ) : (
                                <span className="text-slate-500">Keine Sperrnummer</span>
                              )}

                              <button
                                onClick={() =>
                                  setExpandedCardDetails((prev) => ({
                                    ...prev,
                                    [card.id]: !areBookingsExpanded
                                  }))
                                }
                                className="text-blue-700 hover:underline font-semibold"
                              >
                                {areBookingsExpanded
                                  ? '▲ Buchungen ausblenden'
                                  : `▼ ${stats.bookings.length} zugeordnete Buchungen`}
                              </button>
                            </div>

                            {areBookingsExpanded && (
                              <div className="bg-white rounded-lg border border-slate-200 p-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                                {stats.bookings.length === 0 ? (
                                  <p className="text-slate-400 text-center py-1">
                                    Noch keine Buchung auf diese Karte zugeordnet.
                                  </p>
                                ) : (
                                  stats.bookings.map((b, bIdx) => (
                                    <div
                                      key={bIdx}
                                      className="flex items-center justify-between gap-2 border-b last:border-b-0 border-slate-100 pb-1 last:pb-0 text-[11px]"
                                    >
                                      <div className="truncate">
                                        <span className="font-semibold text-slate-800">{b.label}</span>
                                        <span className="text-slate-400 block">
                                          {b.typeLabel} • Vorab bez.: {b.prepaidRaw}
                                        </span>
                                      </div>
                                      <span className="font-bold text-slate-900 shrink-0">
                                        {formatEur(b.amountEur)}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* SEKTION 2: NOTFALLNUMMERN & WICHTIGE KONTAKTE (BANK, ADAC, VERSICHERUNG, KONSULAT) */}
                <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                  <div className="bg-rose-950 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                        <span>Notfallnummern & Wichtige Kontakte (Bank, ADAC, Versicherung)</span>
                      </h2>
                      <p className="text-xs text-rose-200">
                        Mit 1-Klick-Anruffunktion für Android & iPhone sowie Vertrags-/Mitgliedsnummern für den Ernstfall
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setEditingEmergencyModal({
                          id: `em-${Date.now()}`,
                          organization: '',
                          category: '',
                          phone: '',
                          displayPhone: '',
                          contractNumber: '',
                          notes: ''
                        })
                      }
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition"
                    >
                      + Notfallkontakt hinzufügen
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 space-y-6">
                    {RT_EM_GROUPS.map((grp) => { const emList = (tripData.emergencyContacts || []).filter((e) => rtEmGroup(e) === grp); if (!emList.length) return null; return (<div key={grp} data-em-group={grp}><h3 className="text-sm font-bold text-slate-700 mb-2">{grp} <span className="font-normal text-slate-400">({emList.length})</span></h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emList.map((em) => (
                      <div
                        key={em.id}
                        data-emergency-card className="rounded-xl border-2 border-red-600 bg-slate-50/70 p-4 flex flex-col justify-between gap-3 transition"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span style={{ background: rtEmTheme(em).grad }} className="text-[11px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded">
                              {rtEmGroup(em)}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingEmergencyModal(JSON.parse(JSON.stringify(em)))}
                                className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded font-semibold"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    type: 'emergency',
                                    id: em.id,
                                    title: `Notfallkontakt: ${em.organization}`
                                  })
                                }
                                className="text-xs text-slate-400 hover:text-rose-600 px-1"
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-2">
                            {em.organization}
                          </h3>

                          {em.contractNumber && (
                            <div className="mt-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
                              <span className="text-slate-500 block text-[11px]">Vertrags- / Mitgliedsnummer / Info:</span>
                              <span className="font-mono font-bold text-slate-900">{em.contractNumber}</span>
                            </div>
                          )}

                          {em.notes && (
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                              {em.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                          <a
                            href={`tel:${(em.phone || em.displayPhone || '').replace(/\s+/g, '')}`}
                            style={{ background: rtEmTheme(em).grad }} className="flex-1 text-white text-xs font-bold py-2 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 shadow-2xs transition"
                          >
                            <span>Anrufen: {em.displayPhone || em.phone}</span>
                          </a>
                          <button
                            onClick={() => copyToClipboard(em.displayPhone || em.phone, 'Nummer kopiert')}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold py-2 px-2.5 rounded-lg"
                            title="Telefonnummer kopieren"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div></div>); })}
                  </div>
                </section>
                <RtPinCards trip={tripData} onSave={saveTripData} />
              </div>
            )}

            {/* ===============================================================
                TAB 4: BUDGETPLANER, TEILNEHMER-KOSTENAUFTEILUNG & KATEGORIEN
            =============================================================== */}
            {activeTab === 'finance' && (
              <div className="space-y-6">
                <RtReceipts trip={tripData} onSave={saveTripData} readOnly={isReadOnly} />
                {/* 1. GETRENNTE KOSTEN-ÜBERSICHT NACH KATEGORIEN (HOTEL, FLUG, MIETWAGEN, AKTIVITÄTEN, EXTRAS) */}
                <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Budgetplaner: Kosten getrennt nach Kategorien
                      </h2>
                      <p className="text-xs text-slate-500">
                        Transparente Aufschlüsselung für Hotels, Flüge, Mietwagen, Touren/Stopps und sonstige Reiseausgaben
                      </p>
                    </div>
                    {financeSummary.totalSaved > 0 && (
                      <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                        Durch Preisvergleich (ALT vs. NEU) gespart: {formatEur(financeSummary.totalSaved)}
                      </div>
                    )}
                  </div>

                  <div className="v19-tiles grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                      <span className="text-[11px] font-bold uppercase text-blue-800 block">Hotels ({financeSummary.totalNights} N.)</span>
                      <div className="text-lg font-extrabold text-blue-950 mt-1">{formatEur(financeSummary.hotelsNew)}</div>
                      <span className="text-[11px] text-blue-700">
                        Ø {formatEur(financeSummary.totalNights ? financeSummary.hotelsNew / financeSummary.totalNights : 0)} / Nacht
                      </span>
                    </div>

                    <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200">
                      <span className="text-[11px] font-bold uppercase text-sky-800 block">Flüge ({tripData.flights?.length || 0})</span>
                      <div className="text-lg font-extrabold text-sky-950 mt-1">{formatEur(financeSummary.flightsNew)}</div>
                      <span className="text-[11px] text-sky-700">Hin- & Rückflüge</span>
                    </div>

                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                      <span className="text-[11px] font-bold uppercase text-amber-900 block">Mietwagen</span>
                      <div className="text-lg font-extrabold text-amber-950 mt-1">{formatEur(financeSummary.carsNew)}</div>
                      <span className="text-[11px] text-amber-800">Inkl. Maut / Paket</span>
                    </div>

                    <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                      <span className="text-[11px] font-bold uppercase text-emerald-800 block">Touren & Stopps</span>
                      <div className="text-lg font-extrabold text-emerald-950 mt-1">{formatEur(financeSummary.stopsAndAttractions)}</div>
                      <span className="text-[11px] text-emerald-700">Eintritte & Parken</span>
                    </div>

                    <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
                      <span className="text-[11px] font-bold uppercase text-purple-800 block">Extras & Sonstiges</span>
                      <div className="text-lg font-extrabold text-purple-950 mt-1">{formatEur(financeSummary.customExpensesCost)}</div>
                      <span className="text-[11px] text-purple-700">Essen, Tanken, Sonstiges</span>
                    </div>

                    <div className="bg-slate-900 text-white p-3.5 rounded-xl">
                      <span className="text-[11px] font-bold uppercase text-slate-300 block">Gesamtsumme</span>
                      <div className="text-lg font-extrabold text-white mt-1">{formatEur(financeSummary.totalNew)}</div>
                      {(rtTripMiles(tripData) || tripData.meta?.currency === 'USD') && <span className="text-[11px] text-emerald-300">
                        ≈ {formatUsd(financeSummary.totalNew * (tripData.meta?.exchangeRate || 1.09))}
                      </span>}
                    </div>
                  </div>
                  {Number(tripData.meta?.budget) > 0 && (() => { const bud = Number(tripData.meta.budget), rest = bud - financeSummary.totalNew, pct = Math.min(100, Math.round(financeSummary.totalNew / bud * 100)); return (
                    <div data-budget-line className={`rounded-xl border p-3.5 ${rest < 0 ? 'bg-red-50 border-red-300' : 'bg-sky-50 border-sky-200'}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm"><span className="font-bold text-slate-900">Budget {formatEur(bud)}</span><span className={`font-extrabold ${rest < 0 ? 'text-red-800' : 'text-sky-900'}`}>{rest < 0 ? `${formatEur(-rest)} über Budget` : `${formatEur(rest)} übrig`}</span></div>
                      <div className="mt-2 h-2 rounded-full bg-white overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={pct} aria-label="Budget verbraucht"><div className={`h-full ${rest < 0 ? 'bg-red-600' : 'bg-sky-600'}`} style={{ width: pct + '%' }} /></div>
                      <p className="mt-1 text-xs text-slate-700 m-0">{pct} % des Budgets sind eingeplant. Das Budget änderst du unter Planen → Reise & Zeitraum ändern.</p>
                    </div>); })()}
                </section>

                {/* 2. TEILNEHMER-VERWALTUNG & KOSTENAUFTEILUNG PRO PERSON */}
                <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Teilnehmer & Kostenaufteilung (Wer zahlt was / Wer bekommt wie viel?)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Füge Mitreisende hinzu, ordne Ausgaben zu und sieh sofort den fairen Kostenausgleich
                      </p>
                    </div>

                    {/* Add Participant Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newParticipantName.trim()) {
                            const exists = participantNames.some((n) => n.toLowerCase() === newParticipantName.trim().toLowerCase());
                            if (!exists) {
                              const updated = [
                                ...(tripData.participants || []),
                                { id: `p-${Date.now()}`, name: newParticipantName.trim(), color: 'blue' }
                              ];
                              setNewParticipantName('');
                              saveTripData({ ...tripData, participants: updated }, `Teilnehmer „${newParticipantName.trim()}“ hinzugefügt`);
                            }
                          }
                        }}
                        placeholder="Name des Teilnehmers..."
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                      <button
                        onClick={() => {
                          if (!newParticipantName.trim()) return;
                          const exists = participantNames.some((n) => n.toLowerCase() === newParticipantName.trim().toLowerCase());
                          if (exists) {
                            showToast('Name existiert bereits');
                            return;
                          }
                          const updated = [
                            ...(tripData.participants || []),
                            { id: `p-${Date.now()}`, name: newParticipantName.trim(), color: 'blue' }
                          ];
                          setNewParticipantName('');
                          saveTripData({ ...tripData, participants: updated }, `Teilnehmer „${newParticipantName.trim()}“ hinzugefügt`);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
                      >
                        + Teilnehmer
                      </button>
                    </div>
                  </div>

                  {!(tripData.participants||[]).length && <p className="text-sm text-slate-600">Noch keine Mitreisenden. Füge oben Namen hinzu, um Ausgaben aufzuteilen.</p>}
                  {/* Active Participants Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Aktive Mitreisende ({participantNames.length}):</span>
                    {(tripData.participants || []).map((p) => (
                      <div
                        key={p.id}
                        className="inline-flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1 rounded-full text-xs font-bold text-slate-800"
                      >
                        <span>{p.name}</span>
                        {(tripData.participants || []).length > 1 && (
                          <button
                            onClick={() => {
                              const updated = (tripData.participants || []).filter((item) => item.id !== p.id);
                              saveTripData({ ...tripData, participants: updated }, `Teilnehmer „${p.name}“ entfernt`);
                            }}
                            className="text-slate-400 hover:text-rose-600"
                            title="Teilnehmer entfernen"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Per-Person Breakdown Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {financeSummary.balances.map((person) => {
                      const isPositive = person.netBalance >= 0;
                      return (
                        <div key={person.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="font-extrabold text-sm text-slate-900">{person.name}</span>
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                Math.abs(person.netBalance) < 0.05
                                  ? 'bg-slate-200 text-slate-700 border-slate-300'
                                  : isPositive
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border-rose-300'
                              }`}
                            >
                              {Math.abs(person.netBalance) < 0.05
                                ? 'Ausgeglichen'
                                : isPositive
                                ? `Bekommt +${formatEur(person.netBalance)}`
                                : `Schuldet ${formatEur(Math.abs(person.netBalance))}`}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Selbst ausgelegt</span>
                              <span className="font-bold text-slate-900">{formatEur(person.paidTotal)}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Eigener Kostenanteil</span>
                              <span className="font-bold text-blue-700">{formatEur(person.shareTotal)}</span>
                            </div>
                          </div>

                          {/* Category Share per Person */}
                          <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="font-bold text-slate-700 mb-1">Eigener Anteil nach Kategorie:</div>
                            <div className="flex justify-between"><span>Hotels:</span><strong>{formatEur(person.byCategory.hotels)}</strong></div>
                            <div className="flex justify-between"><span>Flüge:</span><strong>{formatEur(person.byCategory.flights)}</strong></div>
                            <div className="flex justify-between"><span>Mietwagen:</span><strong>{formatEur(person.byCategory.cars)}</strong></div>
                            <div className="flex justify-between"><span>Touren/Stopps:</span><strong>{formatEur(person.byCategory.activities)}</strong></div>
                            <div className="flex justify-between"><span>Extras:</span><strong>{formatEur(person.byCategory.extras)}</strong></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(() => { const sx = tripData.stages || []; let n = 0; const need = (o) => { if (o && !o.paidBy) n++; };
                    (tripData.flights || []).forEach((f) => { if (Number(f.priceNewEur) > 0) need(f); }); (tripData.rentalCars || []).forEach((c) => { if (Number(c.priceNewEur) > 0) need(c); });
                    sx.forEach((s) => { if (s.hotel && parseFloat(s.hotel.priceNewEur) > 0) need(s.hotel); });
                    return n > 0 && participantNames.length > 1 ? <p data-payer-hint className="text-xs text-amber-900 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 m-0">Bei {n} {n === 1 ? 'Posten' : 'Posten'} ist kein Zahler eingetragen. Die Rechnung nimmt deshalb an, dass {participantNames[0]} sie bezahlt hat. Wähle den Zahler im jeweiligen Eintrag, dann stimmt der Ausgleich.</p> : null; })()}
                  {/* Compensation / Settlement Box + Add Extra Expense */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                    <div className="bg-emerald-50/70 rounded-xl border border-emerald-200 p-4 space-y-2">
                      <h4 className="font-bold text-xs uppercase text-emerald-950">
                        Direkter Ausgleich (Wer überweist wem?)
                      </h4>
                      {financeSummary.settlements.length === 0 ? (
                        <p className="text-xs text-emerald-800">
                          Alle Kosten sind aktuell exakt ausgeglichen – keine Ausgleichszahlung nötig.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {financeSummary.settlements.map((s, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-emerald-300 flex items-center justify-between text-xs">
                              <span>
                                <strong>{s.from}</strong> zahlt an <strong>{s.to}</strong>
                              </span>
                              <span className="font-extrabold text-emerald-800 text-sm">{formatEur(s.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Shared Expense (Tanken, Essen, ESTA, Trinkgeld) */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
                      <h4 className="font-bold uppercase text-slate-700">
                        Zusätzliche Ausgabe eintragen (z.B. Tanken, Restaurant, Eintritt)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Bezeichnung (z.B. Tanken Miami)"
                          value={newExpense.title}
                          onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                          className="sm:col-span-2 px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        />
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Betrag (€)"
                          value={newExpense.amountEur}
                          onChange={(e) => setNewExpense({ ...newExpense, amountEur: e.target.value })}
                          className="px-2.5 py-1.5 rounded border border-slate-300 bg-white font-bold"
                        />
                        <select
                          value={newExpense.paidBy || participantNames[0]}
                          onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                          className="px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                        >
                          {participantNames.map((n) => (
                            <option key={n} value={n}>Bezahlt von: {n}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (!newExpense.title.trim() || !parseFloat(newExpense.amountEur)) return;
                            const item = {
                              id: `exp-${Date.now()}`,
                              title: newExpense.title.trim(),
                              category: newExpense.category,
                              amountEur: parseFloat(newExpense.amountEur) || 0,
                              paidBy: newExpense.paidBy || participantNames[0],
                              splitAmong: participantNames,
                              date: new Date().toLocaleDateString('de-DE')
                            };
                            const updated = [...(tripData.customExpenses || []), item];
                            setNewExpense({ ...newExpense, title: '', amountEur: '' });
                            saveTripData({ ...tripData, customExpenses: updated }, 'Ausgabe hinzugefügt');
                          }}
                          className="sm:col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded"
                        >
                          + Ausgabe speichern & aufteilen
                        </button>
                      </div>

                      {(tripData.customExpenses || []).length > 0 && (
                        <div className="pt-2 space-y-1 max-h-32 overflow-y-auto">
                          {(tripData.customExpenses || []).map((ex) => (
                            <div key={ex.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200">
                              <span>
                                <strong>{ex.title}</strong> (bezahlt von {ex.paidBy})
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{formatEur(ex.amountEur)}</span>
                                <button
                                  onClick={() => {
                                    const filtered = (tripData.customExpenses || []).filter((i) => i.id !== ex.id);
                                    saveTripData({ ...tripData, customExpenses: filtered }, 'Ausgabe gelöscht');
                                  }}
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  🗑
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* 3. KREDITKARTEN-BELASTUNGEN & STORNO-WÄCHTER */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-bold text-slate-900">Kreditkarten-Belastungen & Rahmen</h3>
                      <button
                        onClick={() => setActiveTab('cards')}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Karten verwalten →
                      </button>
                    </div>
                    {Object.entries(financeSummary.byCard).map(([cardName, stats]) => {
                      const limit = stats.limitEur || 0;
                      const remaining = limit - stats.total;
                      return (
                        <div key={cardName} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="bg-emerald-200 text-emerald-950 font-bold text-xs px-2.5 py-1 rounded">
                              {cardName}
                            </span>
                            <span className="font-bold text-sm">{formatEur(stats.total)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-emerald-50 border border-emerald-200 p-2 rounded">
                              Bezahlt (ja): <strong>{formatEur(stats.paid)}</strong>
                            </div>
                            <div className="bg-rose-50 border border-rose-200 p-2 rounded">
                              Offen (nein): <strong>{formatEur(stats.open)}</strong>
                            </div>
                          </div>
                          {limit > 0 && (
                            <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                              <span>Kreditrahmen: {formatEur(limit)}</span>
                              <span className="font-bold text-emerald-700">Verfügbar: {formatEur(remaining)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 overflow-x-auto">
                    <h3 className="font-bold text-slate-900 border-b pb-2">🛡 Storno-Wächter & Direkt-Umschalter (Vorab bez.)</h3>
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                          <th className="py-2 px-2">Buchung</th>
                          <th className="py-2 px-2">Storno bis</th>
                          <th className="py-2 px-2">Preis ALT</th>
                          <th className="py-2 px-2">Preis NEU</th>
                          <th className="py-2 px-2">Vorab bez. (Klick)</th>
                          <th className="py-2 px-2">Karte / Zahler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(tripData.rentalCars || []).map((c) => (
                          <tr key={c.id}>
                            <td className="py-2 px-2 font-semibold">{c.provider}</td>
                            <td className="py-2 px-2 text-amber-800 font-medium">{c.cancelUntil || '—'}</td>
                            <td className="py-2 px-2 text-slate-500">{formatEur(c.priceOldEur)}</td>
                            <td className="py-2 px-2 font-bold">{formatEur(c.priceNewEur)}</td>
                            <td className="py-2 px-2">
                              <span aria-disabled="true" title="Nur im Bearbeiten-Dialog änderbar" className={`px-2 py-0.5 rounded font-bold border ${
                                  isPositiveValue(c.prepaid)
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : 'bg-rose-100 text-rose-900 border-rose-300'
                                }`}>{c.prepaid}</span>
                            </td>
                            <td className="py-2 px-2">{c.creditCard} ({c.paidBy || participantNames[0]})</td>
                          </tr>
                        ))}
                        {(tripData.stages || []).map((s, idx) => (
                          <tr key={s.id}>
                            <td className="py-2 px-2 font-semibold">
                              <div>{idx + 1}. {s.toCity}: {s.hotel?.name}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {normalizeHotelLink(s.hotel?.bookingLink) && <a href={normalizeHotelLink(s.hotel.bookingLink)} target="_blank" rel="noopener" className="inline-flex bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded">Buchung</a>}
                                {normalizeHotelLink(s.hotel?.hotelLink) && <a href={normalizeHotelLink(s.hotel.hotelLink)} target="_blank" rel="noopener" className="inline-flex bg-sky-700 hover:bg-sky-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded">Hotel-Webseite</a>}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-amber-800 font-medium">{s.hotel?.cancelUntil || '—'}</td>
                            <td className="py-2 px-2 text-slate-500">{formatEur(s.hotel?.priceOldEur)}</td>
                            <td className="py-2 px-2 font-bold">{formatEur(s.hotel?.priceNewEur)}</td>
                            <td className="py-2 px-2">
                              <span aria-disabled="true" title="Nur im Bearbeiten-Dialog änderbar" className={`px-2 py-0.5 rounded font-bold border ${
                                  isPositiveValue(s.hotel?.prepaid)
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : 'bg-rose-100 text-rose-900 border-rose-300'
                                }`}>{s.hotel?.prepaid}</span>
                            </td>
                            <td className="py-2 px-2"><RtCardChip name={s.hotel?.creditCard} cards={tripData.creditCards} />{s.hotel?.creditCard ? ` (${s.hotel?.paidBy || participantNames[0]})` : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 5: 1-KLICK NAVI-ZENTRALE (EIGENER REITER)
            =============================================================== */}
                        {activeTab === 'navi' && (<div data-ro-ok><NaviHub points={allGpsPoints} trip={tripData} todayIso={todayIso} /></div>)}

            {/* ===============================================================
                TAB 6: US-TOOLS, SEPARATE KM/MEILEN-FENSTER & ETAPPEN-DISTANZEN
            =============================================================== */}
            {activeTab === 'ustools' && (
              <div className="space-y-6">
                {/* 1. ZWEI GETRENNTE STRECKEN-FENSTER: KM -> MEILEN & MEILEN -> KM */}
                <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      🛣 Strecken- & Distanz-Rechner (Getrennte Fenster für km → Meilen & Meilen → km)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Sofortige Umrechnung von Entfernungen und Geschwindigkeitsbegrenzungen (Speed Limits) in beide Richtungen
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* FENSTER 1: EINGABE KILOMETER (KM) -> BERECHNUNG MEILEN (MI) */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border-2 border-blue-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                          Fenster 1: Kilometer → Meilen
                        </span>
                        <span className="text-xs text-blue-800 font-mono">1 km = 0,6214 mi</span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Eingabe in Kilometern (km oder km/h):
                        </label>
                        <input
                          type="number"
                          value={calcKmToMiInput}
                          onChange={(e) => setCalcKmToMiInput(e.target.value)}
                          placeholder="z.B. 100"
                          className="w-full px-3.5 py-2 rounded-xl border border-blue-300 font-extrabold text-base bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-blue-200 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">Ergebnis in Meilen:</span>
                        <span className="text-xl font-extrabold text-blue-700">
                          {((parseFloat(calcKmToMiInput) || 0) * 0.621371).toLocaleString('de-DE', {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 2
                          })}{' '}
                          mi
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[30, 50, 80, 100, 120, 200, 250].map((presetKm) => (
                          <button
                            key={presetKm}
                            onClick={() => setCalcKmToMiInput(String(presetKm))}
                            className="text-[11px] bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded font-semibold"
                          >
                            {presetKm} km
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* FENSTER 2: EINGABE MEILEN (MI) -> BERECHNUNG KILOMETER (KM) */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                          Fenster 2: Meilen → Kilometer
                        </span>
                        <span className="text-xs text-amber-900 font-mono">1 mi = 1,6093 km</span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Eingabe in Meilen (mi oder mph Speed-Limit):
                        </label>
                        <input
                          type="number"
                          value={calcMiToKmInput}
                          onChange={(e) => setCalcMiToKmInput(e.target.value)}
                          placeholder="z.B. 65"
                          className="w-full px-3.5 py-2 rounded-xl border border-amber-300 font-extrabold text-base bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">Ergebnis in Kilometern:</span>
                        <span className="text-xl font-extrabold text-amber-800">
                          {((parseFloat(calcMiToKmInput) || 0) * 1.60934).toLocaleString('de-DE', {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 2
                          })}{' '}
                          km
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[25, 35, 45, 55, 65, 70, 100].map((presetMi) => (
                          <button
                            key={presetMi}
                            onClick={() => setCalcMiToKmInput(String(presetMi))}
                            className="text-[11px] bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded font-semibold"
                          >
                            {presetMi} mph/mi
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                                    <p data-dist-hint className="text-xs text-slate-600 pt-2">Entfernung und Fahrzeit der Etappen stehen in den Etappen und in der Übersicht.</p>
                </section>

                {(rtTripMiles(tripData) || tripData.meta?.currency === 'USD') && <FxPanel trip={tripData} onSave={saveTripData} />}
                {/* 2. WÄHRUNG, TRINKGELD, TANKSTELLEN-RECHNER & CHECKLISTE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div hidden={!(rtTripMiles(tripData) || tripData.meta?.currency === 'USD')} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
                    <h3 className="font-bold text-slate-900 border-b pb-2">US-Rechner (Währung, Trinkgeld, Gallonen & Temperatur)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <label className="font-bold text-slate-700 block">Betrag in US-Dollar ($)</label>
                        <input
                          type="number"
                          value={calcUsd}
                          onChange={(e) => setCalcUsd(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-sm bg-white"
                        placeholder="Betrag in $, z.B. 100" />
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between font-bold text-blue-700 text-sm">
                            <span>In Euro:</span>
                            <span>{formatEur((parseFloat(calcUsd) || 0) / (tripData.meta?.exchangeRate || 1.09))}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>+ 18% Tip:</span>
                            <span>{formatUsd((parseFloat(calcUsd) || 0) * 1.18)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>+ 20% Tip:</span>
                            <span>{formatUsd((parseFloat(calcUsd) || 0) * 1.2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                        <label className="font-bold text-amber-950 block">⛽ Tankstellen-Preis ($ / Gallone)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={calcGallonPriceUsd}
                          onChange={(e) => setCalcGallonPriceUsd(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-amber-300 font-bold text-sm bg-white"
                        placeholder="Preis pro Gallone in $, z.B. 3,49" />
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between font-bold text-amber-900 text-sm">
                            <span>Preis pro Liter:</span>
                            <span>
                              {formatEur((parseFloat(calcGallonPriceUsd) || 0) / 3.78541 / (tripData.meta?.exchangeRate || 1.09))} / L
                            </span>
                          </div>
                          <div className="text-slate-500">1 US-Gallone = 3,785 Liter</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <label className="font-bold text-slate-700 block">Fahrenheit (°F) → Celsius (°C)</label>
                        <input
                          type="number"
                          value={calcFahrenheit}
                          onChange={(e) => setCalcFahrenheit(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-sm bg-white"
                        placeholder="Temperatur in °F, z.B. 82" />
                        <div className="flex justify-between font-bold text-slate-900 pt-1">
                          <span>Grad Celsius:</span>
                          <span>{((((parseFloat(calcFahrenheit) || 0) - 32) * 5) / 9).toFixed(1)} °C</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <label className="font-bold text-slate-700 block">Celsius (°C) → Fahrenheit (°F)</label>
                        <input
                          type="number"
                          value={calcCelsius}
                          onChange={(e) => setCalcCelsius(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-sm bg-white"
                        placeholder="Temperatur in °C, z.B. 28" />
                        <div className="flex justify-between font-bold text-slate-900 pt-1">
                          <span>Grad Fahrenheit:</span>
                          <span>{(((parseFloat(calcCelsius) || 0) * 9) / 5 + 32).toFixed(1)} °F</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkliste */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-bold text-slate-900"><Ic n="check" />Interaktive Reise-Checkliste</h3>
                      <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                        {(tripData.checklist || []).filter((i) => i.done).length} / {(tripData.checklist || []).length} erledigt
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCheckItem}
                        onChange={(e) => setNewCheckItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newCheckItem.trim()) {
                            const updated = [...(tripData.checklist || []), { id: `chk-${Date.now()}`, text: newCheckItem.trim(), done: false }];
                            setNewCheckItem('');
                            saveTripData({ ...tripData, checklist: updated }, 'Punkt ergänzt');
                          }
                        }}
                        placeholder="Neuen Punkt eintragen..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                      <button
                        onClick={() => {
                          if (!newCheckItem.trim()) return;
                          const updated = [...(tripData.checklist || []), { id: `chk-${Date.now()}`, text: newCheckItem.trim(), done: false }];
                          setNewCheckItem('');
                          saveTripData({ ...tripData, checklist: updated }, 'Punkt ergänzt');
                        }}
                        className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {(tripData.checklist || []).map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs ${
                            item.done ? 'bg-emerald-50/60 border-emerald-200 text-slate-400 line-through' : 'bg-slate-50 border-slate-200 font-medium'
                          }`}
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={() => {
                                const updated = (tripData.checklist || []).map((c) => (c.id === item.id ? { ...c, done: !c.done } : c));
                                saveTripData({ ...tripData, checklist: updated }, null);
                              }}
                              className="w-4 h-4 rounded"
                            />
                            <span>{item.text}</span>
                          </label>
                          <button
                            onClick={() => {
                              const updated = (tripData.checklist || []).filter((c) => c.id !== item.id);
                              saveTripData({ ...tripData, checklist: updated }, 'Gelöscht');
                            }}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            🗑
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div data-packlist-block><OrgView trip={tripData} onSave={saveTripData} /></div>
              </div>
            )}

            {/* ===============================================================
                TAB 7: OFFLINE-LINK-TRESOR, CLOUD-SYNC & STANDALONE BACKUP
            =============================================================== */}
            {activeTab === 'cloud' && (
              <AppErrorBoundary>
              <div className="space-y-6">
                <RtGroupHead title="Reise" sub="Reisen wechseln, laden und als Vorlage speichern." />
                <a href="assistent.html" data-open-assistant-opt data-readonly-allow className="block rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-[#1F4E8C] no-underline">Routen-Vorschlag: neue Reise aus Start, Ziel und Fixpunkten aufbauen</a>
                <RtUiSwitch />
                <TripsCard trip={tripData} />
                <TemplateBar trip={tripData} onSave={saveTripData} />
                <RtGroupHead title="Unterwegs ohne Netz" sub="Karten vorab laden und Termine in den Kalender übernehmen." />
                <RtOfflineMaps trip={tripData} />
                <div data-ro-ok className="sp3"><div className="sp3-card"><h2 className="sp3-h2">Termine in den Kalender</h2><p className="sp3-txt">Flüge, Mietwagen, Hotels (Anreise bis Abreise), Aktionen mit Uhrzeit und Storno-Fristen mit Erinnerung als .ics-Datei. Die Uhrzeiten gelten als Ortszeit.</p><div className="sp3-acts"><RtIcsButton trip={tripData} className="sp3-btn pri" /></div></div></div>
                <RtGroupHead title="Daten & Sicherung" sub="Deine Reise als Datei sichern oder mit Drive verbinden." />
                <DeviceDataCard trip={tripData} />
                <RtGroupHead title="Routen" sub="Wie Strecken und Fahrzeiten berechnet werden." />
                <RtRouteBar />
                <RtGroupHead title="Darstellung" sub="Handy-, Tablet- oder Laptop-Ansicht." />
                <RtViewBar />
                <details className="v18-adv rounded-2xl border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-5 py-4"><span className="text-base font-bold text-slate-900">Erweitert</span><span className="block text-[13px] text-slate-500 font-normal">Sicherungen, Export und Hintergrund – selten gebraucht</span></summary>
                  <div className="space-y-6 p-5 pt-0">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={handleDownloadStandaloneHtml} className="v18-btn sm" title="Speichert diese komplette HTML-Datei inklusive deiner aktuellen Eingaben">Offline-HTML speichern</button>
                    </div>
                    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-blue-950">Teilen / Nur-Lesen</h2>
                  <p className="text-sm leading-relaxed text-blue-950"><strong>Empfohlen:</strong> Lege die HTML-Datei in Google Drive und gib Mitreisenden ausschließlich die Rolle <strong>„Betrachter“</strong>. Der Besitzer bearbeitet den Planer am Laptop. Mitreisende öffnen die Datei nur zum Lesen; Änderungen von Betrachtern werden nicht in Drive gespeichert. Google-Drive-Freigaben und der lokale Ansichtsmodus sind keine Verschlüsselung.</p>
                  <div className="flex flex-wrap gap-2">
                    <button data-readonly-allow type="button" onClick={handleDownloadReadOnlyHtml} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">⬇ Nur-Lesen-Version exportieren</button>
                    <button data-readonly-allow type="button" onClick={()=>setIsReadOnly(v=>!v)} className="rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-sm font-bold text-blue-950 hover:bg-blue-100">{isReadOnly ? '🔓 Ansichtsmodus beenden' : 'Ansichtsmodus einschalten'}</button>
                  </div>
                  <p className="text-xs text-blue-800">Die exportierte Kopie enthält den aktuellen Datenstand und blendet Bearbeitungs-/Lösch-/Anlegen-Steuerelemente aus. Sie bleibt eine HTML-Datei; zum Verteilen in Drive zusätzlich Betrachterrechte setzen. Der Schalter hier ist nur eine Anzeige-Sperre, kein Zugriffsschutz.</p>
                </section>
                {/* 1. OFFLINE-LINK-TRESOR & APP-CACHE */}
                <details className="rounded-2xl border border-teal-200 bg-teal-50 p-4" open>
                  <summary className="cursor-pointer font-bold text-teal-950 focus-visible:ring-2">Hilfe: Drive, Offline und Datenübertragung</summary>
                  <div className="mt-3 space-y-2 text-sm text-teal-950"><p><strong>Empfohlen:</strong> Auf dem Laptop im Planer JSON-Backup herunterladen; die .json-Datei in Drive speichern. Auf Android in Drive „Offline verfügbar“ aktivieren, die HTML-Datei herunterladen und – falls der Drive-Viewer nicht funktioniert – über Dateimanager/„Öffnen mit“ Chrome starten. In der App JSON-Backup einlesen und Vorschau bestätigen. Nach Änderungen erneut exportieren und die Datei in Drive ersetzen/Versionierung beachten.</p><p><strong>Grenzen:</strong> localStorage ist je Gerät, Browser und teils je Datei-/Origin getrennt; er wird nicht durch Drive synchronisiert. file:// kann Speicher-/Browserfunktionen einschränken; private Tabs löschen Daten oft. Offline öffnen lädt nur die HTML-App und gespeicherte Reisedaten – Karten-Tiles, Wetter, Routing, Geocoding, Webseiten, Firebase und Karten-App-Links brauchen Internet oder separate Offline-Karten. Vor jedem Import/Reset ein Backup aufbewahren.</p><p><strong>Einschätzung:</strong> Drive-Datei plus expliziter JSON-Export/Import ist praktikabel für gelegentliche Übertragung, aber fehleranfällig bei gleichzeitigen Änderungen und manuellem Austausch. Bequemer ist Hosting über HTTPS mit PWA/IndexedDB plus abgesicherte Synchronisation; GitHub Pages/Netlify allein synchronisieren jedoch keine Nutzerdaten und ersetzen kein Backend/Backup.</p></div>
                </details>
                <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        📴 Offline-Link-Tresor & lokaler Datenspeicher
                      </h2>
                      <p className="text-xs text-slate-600">
                        Speichert alle angegebenen Web-Links, Restaurant-Seiten, Adressen, Beschreibungen und GPS-Koordinaten fest im lokalen Offline-Speicher, sodass du unterwegs in den Everglades oder auf den Keys auch komplett ohne Funknetz die lokal gespeicherten Reisedaten parat hast. Webseiten werden dadurch nicht offline gespeichert.
                      </p>
                    </div>
                    <button
                      onClick={handleCacheForOffline}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 shadow-xs transition"
                    >
                      ⚡ Reisedaten & Link-Verzeichnis lokal sichern
                    </button>
                  </div>

                  {offlineCacheStatus.cachedAt && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between">
                      <span>
                        ✓ <strong>Offline-Speicher aktiv:</strong> Zuletzt gesichert am {offlineCacheStatus.cachedAt} ({allGpsPoints.length} GPS-Ziele & {allExtractedLinks.length} Web-Links inkl. Notizen)
                      </span>
                      <span className="font-bold">Status: Bereit für Flugmodus</span>
                    </div>
                  )}

                  {/* Cached Web Links Directory with Offline Snapshot Info */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-slate-500">
                      Zwischengespeicherte Web-Links & Restaurant-Infos ({allExtractedLinks.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allExtractedLinks.map((lnk, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{lnk.title}</span>
                            <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                              {lnk.stageLabel}
                            </span>
                          </div>
                          <div className="font-mono text-blue-700 break-all">{lnk.url}</div>
                          {lnk.notes && (
                            <p className="text-slate-600 bg-white p-2 rounded border border-slate-200">
                              <strong>Offline-Info:</strong> {lnk.notes}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-slate-500 font-mono"><Ic n="pin" />{lnk.gps || lnk.address || '—'}</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => copyToClipboard(lnk.url, 'Link kopiert')}
                                className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 font-semibold"
                              >
                                Copy URL
                              </button>
                              <a
                                href={lnk.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold"
                              >
                                Öffnen ↗
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <details className="mt-5 rounded-xl border border-rose-200 bg-rose-50/70 p-4">
                    <summary className="cursor-pointer select-none text-sm font-bold text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 rounded">
                      ⚠️ Gefahrenbereich: Neue Reise starten / alle Daten löschen
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-rose-900">
                      Löscht lokale Reisedaten, Einstellungen und Offline-Caches. Bei aktivierter Cloud kann auch das Cloud-Backup entfernt werden.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setDeleteConfirmModal({type:'reset',title:'alle lokalen Reisedaten, Einstellungen und Offline-Caches',detail:'Cloud-Daten werden nicht automatisch gelöscht.'}); setDeletePhrase(''); setDeleteBackup(true); }}
                      className="mt-3 rounded-lg border border-rose-400 bg-rose-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2"
                      title="Gesamte App zurücksetzen; zusätzliche Sicherheitsabfragen folgen"
                    >
                      ＋ Neue Reise / Alle Daten löschen
                    </button>
                  </details>
                </section>

                {/* 2. DATEI-EXPORT & CLOUD-SYNC */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      💾 1. Komplette HTML-Einzeldatei inkl. Daten speichern
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Lädt diese komplette App inklusive deiner aktuellen Eingaben, Teilnehmer-Abrechnungen und Offline-Daten als eine einzige `.html`-Datei herunter:
                    </p>

                    <div className="space-y-3 pt-2">
                      <button
                        onClick={handleDownloadStandaloneHtml}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs text-sm flex items-center justify-center gap-2 transition"
                      >
                        ⬇ Komplette HTML-App inkl. aktueller Daten herunterladen
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleExportJson}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-3 rounded-xl text-xs"
                        >
                          ⬇ JSON-Backup speichern
                        </button>
                        <button type="button" onClick={restoreRollingBackup} className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2.5 px-3 rounded-xl text-xs">↶ Letztes Geräte-Backup wiederherstellen</button>
                        <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold py-2.5 px-3 rounded-xl text-xs text-center cursor-pointer">
                          ⬆ JSON-Backup einlesen
                          <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">☁️ Google Drive-Synchronisierung</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">Diese persönliche Apps-Script-Web-App speichert Reisedaten als <code>roadtrip-daten.json</code> in deinem Google Drive. Zugriff ist auf dein Konto begrenzt; Konflikte werden nicht still überschrieben.</p>
                    <div role="status" aria-live="polite" className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"><strong>Sync-Status:</strong> {({local:'Nur lokal',connecting:'Verbinde …',synced:'Drive und lokal abgeglichen',conflict:'Konflikt – Entscheidung nötig',offline:'Offline – im Cache gespeichert',error:'Sync-Fehler – lokal zwischengespeichert','cloud-empty':'Drive-Datei wird beim ersten Sync angelegt','local-ahead':'Lokale Änderungen warten auf Sync'})[syncStatus]||syncStatus} · Drive-Version {cloudVersion}</div>
                    <button id="fallback-file-pick" type="button" style={{ display: 'none' }} onClick={() => window.__roadtripChooseFile && window.__roadtripChooseFile()} className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold px-4 py-3 rounded-lg">Drive-JSON-Datei wählen (Laptop/Chrome)</button>
                    <button type="button" onClick={syncNow} className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-3 rounded-lg">↻ Jetzt synchronisieren</button>
                    <p className="text-xs text-slate-500">Abgleich erfolgt außerdem automatisch etwa alle 20 Sekunden und nach Wiederherstellung der Verbindung. Änderungen bleiben zusätzlich im Browser-Cache und im vorhandenen JSON-Backup-Workflow.</p>
                    <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">Offline sind nur bereits geladene App und lokal gespeicherte Daten nutzbar. Beim nächsten erfolgreichen Aufruf werden Änderungen mit der Drive-Version abgeglichen. Bei gleichzeitig geänderten Versionen erscheint der Konfliktdialog.</p>
                  </div>
                </div>
              </div>
                </details>
                </div>
              </AppErrorBoundary>
            )}
          </main>

          {fileDiff && !isReadOnly && <div role="status" className="fixed bottom-3 left-3 right-3 z-[89] mx-auto max-w-2xl rounded-xl border border-amber-500 bg-amber-50 p-3 text-sm text-amber-950 shadow-xl"><div className="font-bold mb-1">Datei und Browser-Speicher unterscheiden sich</div><div className="mb-2">Angezeigt wird der Stand aus dem Browser. Die Daten in dieser Datei sind andere.</div><div className="flex flex-wrap gap-2"><button type="button" className="min-h-[44px] rounded-lg bg-amber-600 px-3 py-2 font-bold text-white" onClick={() => { try { saveTripData(normalizeTrip(JSON.parse(JSON.stringify(getEmbeddedDefaultData()))), 'Daten aus der Datei geladen (Browser-Stand liegt im Backup)'); } catch (e) { setStorageError('Dateidaten nicht ladbar: ' + e.message); } setFileDiff(false); }}>Daten aus Datei laden</button><button type="button" className="min-h-[44px] rounded-lg border border-amber-600 bg-white px-3 py-2 font-semibold" onClick={() => setFileDiff(false)}>Browser-Stand behalten</button></div></div>}
          {storageError && <div role="alert" className="fixed top-3 left-3 right-3 z-[90] rounded-xl border border-rose-500 bg-rose-50 p-3 text-sm text-rose-950 shadow-xl">{storageError}<button className="float-right font-bold" onClick={()=>setStorageError('')} aria-label="Meldung schließen">×</button></div>}
          {importError && <div role="alert" className="fixed top-3 left-3 right-3 z-[90] rounded-xl border border-rose-500 bg-rose-50 p-3 text-sm text-rose-950 shadow-xl">{importError}<button className="float-right font-bold" onClick={()=>setImportError('')} aria-label="Meldung schließen">×</button></div>}
          

          {/* =================================================================
              MODAL 1: ETAPPEN-GRUNDLAGEN ODER EINZELNEN ETAPPENBEREICH BEARBEITEN
          ================================================================= */}
          {editingStageModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">
                      ✎ {editingStageSection === 'basics' ? 'Etappen-Grunddaten' : editingStageSection === 'route' ? 'Weg zum Hotel' : editingStageSection === 'hotel' ? 'Hotel' : editingStageSection === 'activities' ? 'Aktionen vor Ort' : 'Etappe bearbeiten'}: {editingStageModal.fromCity} → {editingStageModal.toCity}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {editingStageSection === 'basics' ? 'Datum, Orte und Übernachtungen anpassen' : editingStageSection === 'route' ? 'Anfahrt, Zwischenstopps, Parken und Maut anpassen' : editingStageSection === 'hotel' ? 'Hoteldaten und Buchungsoptionen anpassen' : editingStageSection === 'activities' ? 'Sehenswürdigkeiten und Aktivitäten inklusive Tag-Zuordnung anpassen' : 'Angaben zu Etappe, Anfahrt, Hotel und Aktivitäten anpassen'}
                    </p>
                  </div>
                  <button
                    onClick={cancelStageEditor}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
{(editingStageSection === 'all' || editingStageSection === 'basics') && (<>
                  {/* 0. Grunddaten der Etappe */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                      0. Grunddaten & Zeitraum der Etappe
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Startort (Von)</label>
                        <input data-place="city"
                          type="text"
                          value={editingStageModal.fromCity || ''}
                          onChange={(e) => setEditingStageModal({ ...editingStageModal, fromCity: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder="Startort, z.B. Miami" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Zielort (Stadt / Ort)</label>
                        <input data-place-near={editingStageModal.fromCity || ''} data-place="city"
                          type="text"
                          value={editingStageModal.toCity || ''}
                          onChange={(e) => setEditingStageModal({ ...editingStageModal, toCity: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                        placeholder="Zielort, z.B. Key West" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Zeitraum (Datum)</label>
                        <input
                          type="date"
                          {...tripDateProps(tripData)}
                          value={dateInputValue(editingStageModal.dateRange)}
                          onChange={(e) => setEditingStageModal({ ...editingStageModal, dateRange: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Übernachtungen (Nächte)</label>
                        <input
                          type="number"
                          min="1"
                          value={editingStageModal.nights ?? ''}
                          onChange={(e) =>
                            setEditingStageModal({ ...editingStageModal, nights: e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1) })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                        placeholder="Anzahl Nächte, z.B. 2" />
                      </div>
                    </div>
                  </div>

                  </>) }

{(editingStageSection === 'all' || editingStageSection === 'route') && (<>
                  {/* 1. Der Weg zum Hotel & Zwischenstopps */}
                  <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-amber-950 uppercase tracking-wider">
                        1. Der Weg zum Hotel & Zwischenstopps unterwegs
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const stops = editingStageModal.routeToHotel?.stopsOnWay || [];
                          setEditingStageModal({
                            ...editingStageModal,
                            routeToHotel: {
                              ...editingStageModal.routeToHotel,
                              stopsOnWay: [
                                ...stops,
                                {
                                  id: `rw-${Date.now()}`,
                                  name: '',
                                  time: '',
                                  duration: '',
                                  address: '',
                                  gps: '',
                                  costEur: '',
                                  notes: ''
                                }
                              ]
                            }
                          });
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        + Zwischenstopp hinzufügen
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Strecke (z.B. 277 km (172 mi))</label>
                        <input
                          type="text"
                          value={editingStageModal.routeToHotel?.distanceKm || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              routeToHotel: { ...editingStageModal.routeToHotel, distanceKm: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder="Strecke, z.B. 277 km (172 mi)" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Fahrzeit (z.B. 3,5 h)</label>
                        <input
                          type="text"
                          value={editingStageModal.routeToHotel?.duration || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              routeToHotel: { ...editingStageModal.routeToHotel, duration: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder="Fahrzeit, z.B. 3,5 h" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Routen-Hinweis / Beschreibung</label>
                        <input
                          type="text"
                          value={editingStageModal.routeToHotel?.routeDescription || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              routeToHotel: { ...editingStageModal.routeToHotel, routeDescription: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder="Routenhinweis, z.B. über Highway 1" />
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      {(editingStageModal.routeToHotel?.stopsOnWay || []).map((stop, stIdx) => (
                        <div key={stop.id || stIdx} className="bg-white p-3 rounded-xl border border-amber-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900">Zwischenstopp #{stIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = (editingStageModal.routeToHotel?.stopsOnWay || []).filter((_, i) => i !== stIdx);
                                setEditingStageModal({
                                  ...editingStageModal,
                                  routeToHotel: { ...editingStageModal.routeToHotel, stopsOnWay: filtered }
                                });
                              }}
                              className="text-rose-600 hover:underline font-semibold"
                            >
                              🗑 Entfernen
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input
                              type="text"
                              placeholder="Name des Stopps, z.B. Tankstelle"
                              value={stop.name || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.routeToHotel?.stopsOnWay || [])];
                                list[stIdx] = { ...stop, name: e.target.value };
                                setEditingStageModal({
                                  ...editingStageModal,
                                  routeToHotel: { ...editingStageModal.routeToHotel, stopsOnWay: list }
                                });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300 font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Zeit / Etappe (z.B. 14 km / 0,5 h)"
                              value={stop.time || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.routeToHotel?.stopsOnWay || [])];
                                list[stIdx] = { ...stop, time: e.target.value };
                                setEditingStageModal({
                                  ...editingStageModal,
                                  routeToHotel: { ...editingStageModal.routeToHotel, stopsOnWay: list }
                                });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300"
                            />
                            <input
                              type="text"
                              placeholder="Dauer, z.B. ca. 45 Min."
                              value={stop.duration || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.routeToHotel?.stopsOnWay || [])];
                                list[stIdx] = { ...stop, duration: e.target.value };
                                setEditingStageModal({
                                  ...editingStageModal,
                                  routeToHotel: { ...editingStageModal.routeToHotel, stopsOnWay: list }
                                });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300"
                            />
                            <input
                              type="number"
                              step="0.5"
                              placeholder="Kosten in $, z.B. 12"
                              value={stop.costEur || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.routeToHotel?.stopsOnWay || [])];
                                list[stIdx] = { ...stop, costEur: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) };
                                setEditingStageModal({
                                  ...editingStageModal,
                                  routeToHotel: { ...editingStageModal.routeToHotel, stopsOnWay: list }
                                });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300"
                            />
                            <input data-place="addr" data-place-near={editingStageModal.hotel?.gps || editingStageModal.toCity || ''}
                              type="text"
                              placeholder="Adresse"
                              value={stop.address || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.routeToHotel?.stopsOnWay || [])];
                                list[stIdx] = { ...stop, address: e.target.value };
                                setEditingStageModal({
                                  ...editingStageModal,
                                  routeToHotel: { ...editingStageModal.routeToHotel, stopsOnWay: list }
                                });
                              }}
                              className="sm:col-span-2 px-2.5 py-1.5 rounded border border-slate-300"
                            />
                            <input
                              type="text"
                              placeholder="GPS-Koordinaten (z.B. 24.6573,-81.2816)"
                              value={stop.gps || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.routeToHotel?.stopsOnWay || [])];
                                list[stIdx] = { ...stop, gps: e.target.value };
                                setEditingStageModal({
                                  ...editingStageModal,
                                  routeToHotel: { ...editingStageModal.routeToHotel, stopsOnWay: list }
                                });
                              }}
                              className="sm:col-span-2 px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                            />
                            <textarea
                              rows={2}
                              placeholder="Notizen / Beschreibung zum Stopp"
                              value={stop.notes || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.routeToHotel?.stopsOnWay || [])];
                                list[stIdx] = { ...stop, notes: e.target.value };
                                setEditingStageModal({
                                  ...editingStageModal,
                                  routeToHotel: { ...editingStageModal.routeToHotel, stopsOnWay: list }
                                });
                              }}
                              className="sm:col-span-4 px-2.5 py-1.5 rounded border border-slate-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  </>) }

{(editingStageSection === 'all' || editingStageSection === 'hotel') && (<>
                  {/* 2. Hotel / Unterkunft */}
                  <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
                    <h4 className="font-bold text-blue-950 uppercase tracking-wider">
                      2. Unterkunft / Hotel & Buchungsdaten
                    </h4>
                    <button type="button" onClick={() => handleDeleteStageHotel(editingStageModal)} className="min-h-[44px] text-xs font-semibold text-rose-700 hover:text-white hover:bg-rose-600 px-3 py-2 rounded-lg border border-rose-200 bg-white" title="Nur das Hotel dieser Etappe entfernen">🗑 Hotel entfernen</button>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Hotelname</label>
                        <input
                          type="text"
                          value={editingStageModal.hotel?.name || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, name: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                        placeholder="Hotelname, z.B. Bayside Inn" />
                      </div>
                      <div className="sm:col-span-2"><label className="block font-semibold text-slate-700 mb-1">Buchungscode / Reservierungsnummer</label><input type="text" value={editingStageModal.hotel?.bookingCode||''} onChange={e=>setEditingStageModal({...editingStageModal,hotel:{...editingStageModal.hotel,bookingCode:e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300" placeholder="Buchungscode / Reservierungsnummer" /></div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Buchungslink</label>
                        <input type="url" inputMode="url" style={{fontSize:'16px'}} placeholder="https://…" value={editingStageModal.hotel?.bookingLink || ''} onChange={e=>setEditingStageModal({...editingStageModal,hotel:{...editingStageModal.hotel,bookingLink:e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Direkter Hotel-Link</label>
                        <input type="url" inputMode="url" style={{fontSize:'16px'}} placeholder="https://…" value={editingStageModal.hotel?.hotelLink || ''} onChange={e=>setEditingStageModal({...editingStageModal,hotel:{...editingStageModal.hotel,hotelLink:e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300" />
                      </div>
                        <div>
                        <label className="block font-semibold text-slate-700 mb-1">Bewertung</label>
                        <input
                          type="text"
                          value={editingStageModal.hotel?.rating || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, rating: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder="Bewertung, z.B. 8,5" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Storno bis</label>
                        <RtDateField flexible value={editingStageModal.hotel?.cancelUntil} onChange={(v) => setEditingStageModal({ ...editingStageModal, hotel: { ...editingStageModal.hotel, cancelUntil: v } })} />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Hotel-Adresse</label>
                        <input data-place="addr" data-place-near={editingStageModal.hotel?.gps || editingStageModal.toCity || ''}
                          type="text"
                          value={editingStageModal.hotel?.address || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, address: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder="Hoteladresse" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Hotel GPS-Koordinaten</label>
                        <input
                          type="text"
                          value={editingStageModal.hotel?.gps || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, gps: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                        placeholder="GPS-Koordinaten, z.B. 25.7617,-80.1918" />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Check IN</label>
                        <RtCheckIn value={editingStageModal.hotel?.checkIn} onChange={(v) => setEditingStageModal({ ...editingStageModal, hotel: { ...editingStageModal.hotel, checkIn: v } })} />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Check OUT</label>
                        <RtTimeSel suffix=" Uhr" empty="Uhrzeit" value={editingStageModal.hotel?.checkOut} onChange={(v) => setEditingStageModal({ ...editingStageModal, hotel: { ...editingStageModal.hotel, checkOut: v } })} />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Frühstück</label>
                        <select
                          value={editingStageModal.hotel?.breakfast || 'nein'}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, breakfast: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                        >
                          <option value="ja">ja</option>
                          <option value="nein">nein</option>
                          <option value="möglich">möglich</option>
                          <option value="inkl.">inkl.</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Parken</label>
                        <select
                          value={editingStageModal.hotel?.parking || 'nein'}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, parking: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                        >
                          <option value="ja">ja</option>
                          <option value="nein">nein</option>
                          <option value="kostenlos">kostenlos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Preis Preis ursprünglich (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingStageModal.hotel?.priceOldEur || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, priceOldEur: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder="Alter Preis in €, z.B. 280" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Preis Preis aktuell (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingStageModal.hotel?.priceNewEur || ''}
                          onChange={(e) => {
                            const valEur = parseFloat(e.target.value) || 0;
                            const rate = tripData.meta?.exchangeRate || 1.09;
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: {
                                ...editingStageModal.hotel,
                                priceNewEur: valEur,
                                priceUsd: Math.round(valEur * rate * 100) / 100
                              }
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-blue-400 bg-white font-bold"
                        placeholder="Neuer Preis in €, z.B. 260" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Preis ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingStageModal.hotel?.priceUsd || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, priceUsd: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder="Preis in $, z.B. 285" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Vorab bezahlt</label>
                        <select
                          value={editingStageModal.hotel?.prepaid || 'nein'}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, prepaid: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                        >
                          <option value="ja">ja</option>
                          <option value="nein">nein</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Kreditkarte</label>
                        <select
                          value={availableCardOptions.includes(editingStageModal.hotel?.creditCard) ? editingStageModal.hotel.creditCard : ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, creditCard: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-emerald-400 bg-emerald-50 font-bold"
                        >
                          {!availableCardOptions.includes(editingStageModal.hotel?.creditCard) && <option value="">— bitte wählen —</option>}
                          {availableCardOptions.map((cName) => (
                            <option key={cName} value={cName}>{cName}</option>
                          ))}
                        </select>
                      </div>
                      {/* Hotel-Zahlende bleibt als Datenfeld erhalten; hier nicht angezeigt. */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Abbuchung angekündigt</label>
                        <RtDateField value={editingStageModal.hotel?.chargeAnnounced} onChange={(v) => setEditingStageModal({ ...editingStageModal, hotel: { ...editingStageModal.hotel, chargeAnnounced: v } })} />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Kred.K. belastet</label>
                        <RtDateField value={editingStageModal.hotel?.cardCharged} onChange={(v) => setEditingStageModal({ ...editingStageModal, hotel: { ...editingStageModal.hotel, cardCharged: v } })} />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Parkhaus / Parkplatz Bezeichnung</label>
                        <input
                          type="text"
                          value={editingStageModal.hotel?.parkingGarageName || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, parkingGarageName: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder="Name des Parkhauses" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Parkhaus Adresse</label>
                        <input data-place="addr" data-place-near={editingStageModal.hotel?.gps || editingStageModal.toCity || ''}
                          type="text"
                          value={editingStageModal.hotel?.parkingGarageAddress || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, parkingGarageAddress: e.target.value }
                            })
                          }
                          placeholder="Straße & Ort des Parkhauses"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Parkhaus GPS-Koordinaten</label>
                        <input
                          type="text"
                          value={editingStageModal.hotel?.parkingGarageGps || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, parkingGarageGps: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                        placeholder="GPS-Koordinaten des Parkhauses" />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block font-semibold text-slate-700 mb-1">Bemerkungen</label>
                        <textarea
                          rows={3}
                          value={editingStageModal.hotel?.remarks || ''}
                          onChange={(e) =>
                            setEditingStageModal({
                              ...editingStageModal,
                              hotel: { ...editingStageModal.hotel, remarks: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="Notizen oder Beschreibung eingeben" />
                      </div>
                    </div>
                  </div>

                  </>) }

{(editingStageSection === 'all' || editingStageSection === 'activities') && (<>
                  {/* 3. Sehenswürdigkeiten & Aktionen vor Ort */}
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-emerald-950 uppercase tracking-wider">
                        3. Sehenswürdigkeiten & Aktionen vor Ort ({editingStageModal.localAttractions?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const list = editingStageModal.localAttractions || [];
                          setEditingStageModal({
                            ...editingStageModal,
                            localAttractions: [
                              ...list,
                              {
                                id: `loc-${Date.now()}`,
                                name: '',
                                category: '',
                                day: '',
                                date: dateInputValue(editingStageModal.dateRange) || tripData.meta?.startDate || '',
                                time: '',
                                booked: '',
                                priceEur: '',
                                address: '',
                                gps: '',
                                notes: ''
                              }
                            ]
                          });
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        + Aktivität vor Ort hinzufügen
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(editingStageModal.localAttractions || []).map((act, aIdx) => (
                        <div key={act.id || aIdx} className="bg-white p-3 rounded-xl border border-emerald-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-900">Aktivität #{aIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = (editingStageModal.localAttractions || []).filter((_, i) => i !== aIdx);
                                setEditingStageModal({ ...editingStageModal, localAttractions: filtered });
                              }}
                              className="text-rose-600 hover:underline font-semibold"
                            >
                              🗑 Entfernen
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input
                              type="text"
                              placeholder="Name der Sehenswürdigkeit"
                              value={act.name || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.localAttractions || [])];
                                list[aIdx] = { ...act, name: e.target.value };
                                setEditingStageModal({ ...editingStageModal, localAttractions: list });
                              }}
                              className="sm:col-span-2 px-2.5 py-1.5 rounded border border-slate-300 font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Kategorie (z.B. Strand, Bootstour)"
                              value={act.category || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.localAttractions || [])];
                                list[aIdx] = { ...act, category: e.target.value };
                                setEditingStageModal({ ...editingStageModal, localAttractions: list });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300"
                            />
                            <select
                              value={act.day ?? ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.localAttractions || [])];
                                list[aIdx] = { ...act, day: parseInt(e.target.value, 10) || 1 };
                                setEditingStageModal({ ...editingStageModal, localAttractions: list });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300 bg-white font-semibold"
                            >
                              {Array.from({ length: Math.max(1, parseInt(editingStageModal.nights, 10) || 1) }, (_, i) => i + 1).map((d) => (
                                <option key={d} value={d}>Aufenthalt: Tag {d}</option>
                              ))}
                            </select>
                            <input
                              type="date"
                              {...tripDateProps(tripData)}
                              aria-label="Aktivitätsdatum"
                              title="Aktivitätsdatum innerhalb der Reise"
                              value={dateInputValue(act.date)}
                              onChange={(e) => {
                                const list = [...(editingStageModal.localAttractions || [])];
                                list[aIdx] = { ...act, date: e.target.value };
                                setEditingStageModal({ ...editingStageModal, localAttractions: list });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300"
                            />
                            <RtTimeSel value={act.time} empty="Uhrzeit" onChange={(v) => { const list = [...(editingStageModal.localAttractions || [])]; list[aIdx] = { ...act, time: v }; setEditingStageModal({ ...editingStageModal, localAttractions: list }); }} className="px-2.5 py-1.5 rounded border border-slate-300" />
                            <input
                              type="text"
                              placeholder="Ticket / Status (ja / nein / Vor Ort)"
                              value={act.booked || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.localAttractions || [])];
                                list[aIdx] = { ...act, booked: e.target.value };
                                setEditingStageModal({ ...editingStageModal, localAttractions: list });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300"
                            />
                            <input
                              type="number"
                              step="0.5"
                              placeholder="Preis (€)"
                              value={act.priceEur || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.localAttractions || [])];
                                list[aIdx] = { ...act, priceEur: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) };
                                setEditingStageModal({ ...editingStageModal, localAttractions: list });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300"
                            />
                            <input
                              type="text"
                              placeholder="GPS-Koordinaten"
                              value={act.gps || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.localAttractions || [])];
                                list[aIdx] = { ...act, gps: e.target.value };
                                setEditingStageModal({ ...editingStageModal, localAttractions: list });
                              }}
                              className="px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                            />
                            <input data-place="addr" data-place-near={editingStageModal.hotel?.gps || editingStageModal.toCity || ''}
                              type="text"
                              placeholder="Adresse"
                              value={act.address || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.localAttractions || [])];
                                list[aIdx] = { ...act, address: e.target.value };
                                setEditingStageModal({ ...editingStageModal, localAttractions: list });
                              }}
                              className="sm:col-span-4 px-2.5 py-1.5 rounded border border-slate-300"
                            />
                            <textarea
                              rows={2}
                              placeholder="Beschreibung / Tipps"
                              value={act.notes || ''}
                              onChange={(e) => {
                                const list = [...(editingStageModal.localAttractions || [])];
                                list[aIdx] = { ...act, notes: e.target.value };
                                setEditingStageModal({ ...editingStageModal, localAttractions: list });
                              }}
                              className="sm:col-span-4 px-2.5 py-1.5 rounded border border-slate-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  </>) }
                </div>

                <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={cancelStageEditor}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={() => {
                      const cf = chainFix(tripData.stages || [], editingStageModal, tripData.meta || {});
                      saveTripData({ ...tripData, stages: cf.stages, ...(cf.meta ? { meta: cf.meta } : {}) }, `Etappe „${editingStageModal.toCity}“ gespeichert!`);
                      if (cf.notice) window.rtNotice(cf.notice);
                      window.__rtNewStageId = null;
                      setEditingStageModal(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-xs"
                  >
                    ✓ Änderungen speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              MODAL 2: FLUG BEARBEITEN / ANLEGEN
          ================================================================= */}
          {editingFlightModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-3 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base">Flugdaten bearbeiten / anlegen</h3>
                  <button onClick={() => setEditingFlightModal(null)} className="text-slate-300 hover:text-white font-bold">
                    ✕
                  </button>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-h-[75vh] overflow-y-auto">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Richtung (z.B. Hinflug / Rückflug)</label>
                    <input
                      type="text"
                      value={editingFlightModal.direction || ''}
                      onChange={(e) => setEditingFlightModal({ ...editingFlightModal, direction: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    placeholder="Flugrichtung, z.B. Hinflug" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Airline & Flugnummer</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Airline"
                        value={editingFlightModal.airline || ''}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, airline: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type="text"
                        placeholder="Flugnr."
                        value={editingFlightModal.flightNumber || ''}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, flightNumber: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Von (Abflughafen)</label>
                    <input data-place="city"
                      type="text"
                      value={editingFlightModal.from || ''}
                      onChange={(e) => setEditingFlightModal({ ...editingFlightModal, from: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    placeholder="Abflughafen, z.B. MUC" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nach (Zielflughafen)</label>
                    <input data-place="city"
                      type="text"
                      value={editingFlightModal.to || ''}
                      onChange={(e) => setEditingFlightModal({ ...editingFlightModal, to: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    placeholder="Zielflughafen, z.B. FCO" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Datum</label>
                    <input
                      type="date"
                      {...tripDateProps(tripData)}
                      value={dateInputValue(editingFlightModal.departureDate)}
                      onChange={(e) => setEditingFlightModal({ ...editingFlightModal, departureDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Abflugzeit / Ankunftszeit</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Abflug"
                        value={editingFlightModal.departureTime || ''}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, departureTime: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type="text"
                        placeholder="Ankunft"
                        value={editingFlightModal.arrivalTime || ''}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, arrivalTime: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Buchungscode (PNR)</label>
                    <input
                      type="text"
                      value={editingFlightModal.bookingCode || ''}
                      onChange={(e) => setEditingFlightModal({ ...editingFlightModal, bookingCode: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                    placeholder="Buchungscode / Reservierungsnummer" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sitzplätze & Gepäck</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Sitze"
                        value={editingFlightModal.seats || ''}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, seats: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type="text"
                        placeholder="Gepäck"
                        value={editingFlightModal.luggage || ''}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, luggage: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Preis Preis ursprünglich (€) & Preis Preis aktuell (€)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preis ursprünglich (€)"
                        value={editingFlightModal.priceOldEur || ''}
                        onChange={(e) =>
                          setEditingFlightModal({ ...editingFlightModal, priceOldEur: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) })
                        }
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preis aktuell (€)"
                        value={editingFlightModal.priceNewEur || ''}
                        onChange={(e) => {
                          const valEur = parseFloat(e.target.value) || 0;
                          const rate = tripData.meta?.exchangeRate || 1.09;
                          setEditingFlightModal({
                            ...editingFlightModal,
                            priceNewEur: valEur,
                            priceUsd: Math.round(valEur * rate * 100) / 100
                          });
                        }}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-blue-400 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Preis ($) & Vorab bezahlt</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preis ($)"
                        value={editingFlightModal.priceUsd || ''}
                        onChange={(e) =>
                          setEditingFlightModal({ ...editingFlightModal, priceUsd: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) })
                        }
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <select
                        value={editingFlightModal.prepaid || 'ja'}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, prepaid: e.target.value })}
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                      >
                        <option value="ja">Vorab bez.: ja</option>
                        <option value="nein">Vorab bez.: nein</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kreditkarte & Bezahlt von</label>
                    <div className="flex gap-2">
                      <select
                        value={availableCardOptions.includes(editingFlightModal.creditCard) ? editingFlightModal.creditCard : ''}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, creditCard: e.target.value })}
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-emerald-400 bg-emerald-50 font-bold"
                      >
                        {!availableCardOptions.includes((editingFlightModal||editingCarModal||{}).creditCard) && <option value="">— bitte wählen —</option>}
                        {availableCardOptions.map((cName) => (
                          <option key={cName} value={cName}>{cName}</option>
                        ))}
                      </select>
                      <select
                        value={editingFlightModal.paidBy || participantNames[0]}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, paidBy: e.target.value })}
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                      >
                        {participantNames.map((pName) => (
                          <option key={pName} value={pName}>{pName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Abbuchung angekündigt & Kred.K. belastet am</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Abbuchung angekündigt"
                        value={editingFlightModal.chargeAnnounced || ''}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, chargeAnnounced: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type={dateInputValue(editingFlightModal.cardCharged) ? 'date' : 'text'}
                        {...(dateInputValue(editingFlightModal.cardCharged) ? tripDateProps(tripData) : {})}
                        placeholder="Belastet am (Datum)"
                        value={dateInputValue(editingFlightModal.cardCharged) || editingFlightModal.cardCharged || ''}
                        onChange={(e) => setEditingFlightModal({ ...editingFlightModal, cardCharged: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Notizen / Hinweise</label>
                    <textarea
                      rows={2}
                      value={editingFlightModal.notes || ''}
                      onChange={(e) => setEditingFlightModal({ ...editingFlightModal, notes: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    placeholder="Notizen zum Flug" />
                  </div>
                </div>
                <div className="bg-slate-100 px-5 py-3 flex justify-end gap-2">
                  <button onClick={() => setEditingFlightModal(null)} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600">
                    Abbrechen
                  </button>
                  <button
                    onClick={() => {
                      const exists = (tripData.flights || []).some((f) => f.id === editingFlightModal.id);
                      const updated = exists
                        ? (tripData.flights || []).map((f) => (f.id === editingFlightModal.id ? editingFlightModal : f))
                        : [...(tripData.flights || []), editingFlightModal];
                      saveTripData({ ...tripData, flights: updated }, 'Flugdaten gespeichert!');
                      setEditingFlightModal(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                  >
                    ✓ Speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              MODAL 3: MIETWAGEN BEARBEITEN / ANLEGEN
          ================================================================= */}
          {editingCarModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-3 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base">Mietwagen bearbeiten / anlegen</h3>
                  <button onClick={() => setEditingCarModal(null)} className="text-slate-300 hover:text-white font-bold">
                    ✕
                  </button>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-h-[75vh] overflow-y-auto">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vermieter</label>
                    <input
                      type="text"
                      value={editingCarModal.provider || ''}
                      onChange={(e) => setEditingCarModal({ ...editingCarModal, provider: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    placeholder="Vermieter, z.B. Sixt" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fahrzeugklasse / Modell</label>
                    <input
                      type="text"
                      value={editingCarModal.carClass || ''}
                      onChange={(e) => setEditingCarModal({ ...editingCarModal, carClass: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    placeholder="Fahrzeugklasse, z.B. Kombi" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Abholstation & Datum/Uhrzeit</label>
                    <input data-place="city"
                      type="text"
                      placeholder="Abholort"
                      value={editingCarModal.pickupLocation || ''}
                      onChange={(e) => setEditingCarModal({ ...editingCarModal, pickupLocation: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mb-1.5"
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        {...tripDateProps(tripData)}
                        placeholder="Datum"
                        value={dateInputValue(editingCarModal.pickupDate)}
                        onChange={(e) => setEditingCarModal({ ...editingCarModal, pickupDate: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type="text"
                        placeholder="Uhrzeit"
                        value={editingCarModal.pickupTime || ''}
                        onChange={(e) => setEditingCarModal({ ...editingCarModal, pickupTime: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Rückgabestation & Datum/Uhrzeit</label>
                    <input data-place="city"
                      type="text"
                      placeholder="Rückgabeort"
                      value={editingCarModal.dropoffLocation || ''}
                      onChange={(e) => setEditingCarModal({ ...editingCarModal, dropoffLocation: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mb-1.5"
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        {...tripDateProps(tripData)}
                        placeholder="Datum"
                        value={dateInputValue(editingCarModal.dropoffDate)}
                        onChange={(e) => setEditingCarModal({ ...editingCarModal, dropoffDate: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type="text"
                        placeholder="Uhrzeit"
                        value={editingCarModal.dropoffTime || ''}
                        onChange={(e) => setEditingCarModal({ ...editingCarModal, dropoffTime: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Buchungscode (z.B. Skip the Counter / Res.-Nr.)</label>
                    <input
                      type="text"
                      placeholder="Buchungscode eintragen"
                      value={editingCarModal.bookingCode || ''}
                      onChange={(e) => setEditingCarModal({ ...editingCarModal, bookingCode: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Storno bis (Datum / Frist)</label>
                    <input
                      type={dateInputValue(editingCarModal.cancelUntil) ? 'date' : 'text'}
                      {...(dateInputValue(editingCarModal.cancelUntil) ? tripDateProps(tripData) : {})}
                      placeholder="TT.MM.JJJJ oder Flexibel"
                      value={dateInputValue(editingCarModal.cancelUntil) || editingCarModal.cancelUntil || ''}
                      onChange={(e) => setEditingCarModal({ ...editingCarModal, cancelUntil: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50/40 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Preis Preis ursprünglich (€) & Preis Preis aktuell (€)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preis ursprünglich (€)"
                        value={editingCarModal.priceOldEur || ''}
                        onChange={(e) =>
                          setEditingCarModal({ ...editingCarModal, priceOldEur: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) })
                        }
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preis aktuell (€)"
                        value={editingCarModal.priceNewEur || ''}
                        onChange={(e) => {
                          const valEur = parseFloat(e.target.value) || 0;
                          const rate = tripData.meta?.exchangeRate || 1.09;
                          setEditingCarModal({
                            ...editingCarModal,
                            priceNewEur: valEur,
                            priceUsd: Math.round(valEur * rate * 100) / 100
                          });
                        }}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-blue-400 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Preis ($) & Vorab bezahlt</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preis ($)"
                        value={editingCarModal.priceUsd || ''}
                        onChange={(e) =>
                          setEditingCarModal({ ...editingCarModal, priceUsd: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) })
                        }
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <select
                        value={editingCarModal.prepaid || 'nein'}
                        onChange={(e) => setEditingCarModal({ ...editingCarModal, prepaid: e.target.value })}
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                      >
                        <option value="ja">Vorab bez.: ja</option>
                        <option value="nein">Vorab bez.: nein</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kreditkarte & Bezahlt von</label>
                    <div className="flex gap-2">
                      <select
                        value={availableCardOptions.includes(editingCarModal.creditCard) ? editingCarModal.creditCard : ''}
                        onChange={(e) => setEditingCarModal({ ...editingCarModal, creditCard: e.target.value })}
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-emerald-400 bg-emerald-50 font-bold"
                      >
                        {!availableCardOptions.includes((editingFlightModal||editingCarModal||{}).creditCard) && <option value="">— bitte wählen —</option>}
                        {availableCardOptions.map((cName) => (
                          <option key={cName} value={cName}>{cName}</option>
                        ))}
                      </select>
                      <select
                        value={editingCarModal.paidBy || participantNames[0]}
                        onChange={(e) => setEditingCarModal({ ...editingCarModal, paidBy: e.target.value })}
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                      >
                        {participantNames.map((pName) => (
                          <option key={pName} value={pName}>{pName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Abbuchung angekündigt & Kred.K. belastet am</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Abbuchung angekündigt"
                        value={editingCarModal.chargeAnnounced || ''}
                        onChange={(e) => setEditingCarModal({ ...editingCarModal, chargeAnnounced: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type={dateInputValue(editingCarModal.cardCharged) ? 'date' : 'text'}
                        {...(dateInputValue(editingCarModal.cardCharged) ? tripDateProps(tripData) : {})}
                        placeholder="Belastet am (Datum)"
                        value={dateInputValue(editingCarModal.cardCharged) || editingCarModal.cardCharged || ''}
                        onChange={(e) => setEditingCarModal({ ...editingCarModal, cardCharged: e.target.value })}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Versicherung, Maut & Rabattkarten</label>
                    <input
                      type="text"
                      value={editingCarModal.insuranceAndToll || ''}
                      onChange={(e) => setEditingCarModal({ ...editingCarModal, insuranceAndToll: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    placeholder="Versicherung / Maut, z.B. Vollkasko, Vignette" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Hinweise / Skip the Counter</label>
                    <textarea
                      rows={2}
                      value={editingCarModal.notes || ''}
                      onChange={(e) => setEditingCarModal({ ...editingCarModal, notes: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    placeholder="Notizen zum Mietwagen" />
                  </div>
                </div>
                <div className="bg-slate-100 px-5 py-3 flex justify-end gap-2">
                  <button onClick={() => setEditingCarModal(null)} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600">
                    Abbrechen
                  </button>
                  <button
                    onClick={() => {
                      const exists = (tripData.rentalCars || []).some((c) => c.id === editingCarModal.id);
                      const updated = exists
                        ? (tripData.rentalCars || []).map((c) => (c.id === editingCarModal.id ? editingCarModal : c))
                        : [...(tripData.rentalCars || []), editingCarModal];
                      saveTripData({ ...tripData, rentalCars: updated }, 'Mietwagen gespeichert!');
                      setEditingCarModal(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                  >
                    ✓ Speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 4: TITEL, ABREISE-DATUM (COUNTDOWN) & WECHSELKURS */}
          {editingMetaModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
                  <h3 className="font-bold text-sm">Roadtrip-Titel, Abreisedatum & Kurs</h3>
                  <button onClick={() => setEditingMetaModal(false)}>✕</button>
                </div>
                <div className="p-5 space-y-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">Titel</label>
                    <input
                      type="text"
                      value={tripData.meta?.title || ''}
                      onChange={(e) => setTripData({ ...tripData, meta: { ...tripData.meta, title: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded border font-bold"
                    placeholder="Reisetitel, z.B. Florida-Rundreise" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Untertitel</label>
                    <input
                      type="text"
                      value={tripData.meta?.subtitle || ''}
                      onChange={(e) => setTripData({ ...tripData, meta: { ...tripData.meta, subtitle: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded border"
                    placeholder="Untertitel, z.B. Sommer 2026" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold block mb-1">Abreisedatum (für Countdown)</label>
                      <input
                        type="date"
                        value={tripData.meta?.startDate || ''}
                        onChange={(e) => setTripData({ ...tripData, meta: { ...tripData.meta, startDate: e.target.value } })}
                        className="w-full px-3 py-1.5 rounded border font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Rückreisedatum</label>
                      <input
                        type="date"
                        value={tripData.meta?.endDate || ''}
                        onChange={(e) => setTripData({ ...tripData, meta: { ...tripData.meta, endDate: e.target.value } })}
                        className="w-full px-3 py-1.5 rounded border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="font-bold block mb-1">Startort<input data-place="city" type="text" value={tripData.meta?.startLocation||''} onChange={e=>setTripData({...tripData,meta:{...tripData.meta,startLocation:e.target.value}})} className="mt-1 w-full px-3 py-2 rounded border" placeholder="Startort, z.B. München" /></label>
                    <label className="font-bold block mb-1">Ziel / Zielregion<input data-place="city" type="text" value={tripData.meta?.destination||''} onChange={e=>setTripData({...tripData,meta:{...tripData.meta,destination:e.target.value}})} className="mt-1 w-full px-3 py-2 rounded border" placeholder="Ziel, z.B. Florida" /></label>
                    <label className="font-bold block mb-1">Fahrzeug<input type="text" value={tripData.meta?.vehicle||''} onChange={e=>setTripData({...tripData,meta:{...tripData.meta,vehicle:e.target.value}})} className="mt-1 w-full px-3 py-2 rounded border" placeholder="Fahrzeug, z.B. Mietwagen / SUV" /></label>
                    <label className="font-bold block mb-1">Reisebudget<input type="number" min="0" step="0.01" value={tripData.meta?.budget??''} onChange={e=>setTripData({...tripData,meta:{...tripData.meta,budget:e.target.value===''?null:Number(e.target.value)}})} className="mt-1 w-full px-3 py-2 rounded border" placeholder="Budget in €, z.B. 5000" /></label>
                    <label className="font-bold block mb-1">Währung<select value={tripData.meta?.currency||'EUR'} onChange={e=>setTripData({...tripData,meta:{...tripData.meta,currency:e.target.value}})} className="mt-1 w-full px-3 py-2 rounded border"><option>EUR</option><option>USD</option><option>GBP</option><option>CHF</option></select></label>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Wechselkurs (1 € = X $)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={tripData.meta?.exchangeRate || 1.09}
                      onChange={(e) => setTripData({ ...tripData, meta: { ...tripData.meta, exchangeRate: parseFloat(e.target.value) || 1.09 } })}
                      className="w-full px-3 py-1.5 rounded border"
                    placeholder="Wechselkurs, z.B. 1,09" />
                  </div>
                </div>
                <div className="bg-slate-100 px-5 py-3 flex justify-end">
                  <button
                    onClick={async () => {
                      const {startDate,endDate}=tripData.meta||{};
                      if(startDate&&endDate&&(endDate<startDate||tripDayCount(startDate,endDate)>120)){showToast(endDate<startDate?'Das Enddatum darf nicht vor dem Startdatum liegen.':'Maximal 120 Tage pro Reise.');return;}
                      const desired=tripDayCount(startDate,endDate);
                      let stages=[...(tripData.stages||[])];
                      if(desired && desired!==stages.length){
                        const delta=desired-stages.length;
                        const question=delta>0?`Reisedaten ergeben ${desired} Tage. ${delta} Etappen ergänzen?`:`Reisedaten ergeben ${desired} Tage. ${-delta} Etappen am Ende entfernen? Dabei gehen deren Etappendaten verloren. Fortfahren?`;
                        if(!(await window.rtAsk(question))) return;
                        if(delta>0){const more=makeDailyStages(startDate,endDate,tripData.meta.startLocation,tripData.meta.destination,tripData.meta.exchangeRate).slice(stages.length);stages=[...stages,...more];}
                        else stages=stages.slice(0,desired);
                      }
                      if(desired && stages.length){stages=stages.map((stage,i)=>({...stage,dateRange:isoDay(startDate,i)}));}
                      const updated={...tripData,stages};
                      saveTripData(updated, 'Einstellungen & Etappen gespeichert');
                      setEditingMetaModal(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 5: KREDITKARTE BEARBEITEN / ANLEGEN */}
          {editingCardModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Kreditkarte bearbeiten / anlegen</h3>
                    <p className="text-xs text-slate-300">Wird automatisch in allen Buchungs-Dropdowns bereitgestellt</p>
                  </div>
                  <button onClick={() => setEditingCardModal(null)}>✕</button>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kurzname (für Tabelle/Dropdown, z.B. TF-Bank)</label>
                    <input
                      type="text"
                      value={editingCardModal.name}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, name: e.target.value })}
                      placeholder="z.B. TF-Bank"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vollständige Bezeichnung</label>
                    <input
                      type="text"
                      value={editingCardModal.fullName}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, fullName: e.target.value })}
                      placeholder="z.B. TF-Bank Mastercard Gold"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Karteninhaber</label>
                    <input
                      type="text"
                      value={editingCardModal.holder}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, holder: e.target.value })}
                      placeholder="z.B. Name der Person"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kreditrahmen (€)</label>
                    <input
                      type="number"
                      step="100"
                      value={editingCardModal.limitEur}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, limitEur: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-blue-400 font-bold"
                    placeholder="Kreditrahmen in €, z.B. 3000" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Letzte 4 Ziffern der Karte</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={String(editingCardModal.cardNumber || '').replace(/\D/g, '').slice(-4)}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="1234"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Aus Sicherheitsgründen nur die letzten 4 Ziffern. Keine Prüfnummer (CVC) eintragen.</p>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Gültig bis (MM/JJ)</label>
                    <input
                      type="text"
                      value={editingCardModal.validUntil}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, validUntil: e.target.value })}
                      placeholder="09/27"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Auslandseinsatzgebühr</label>
                    <input
                      type="text"
                      value={editingCardModal.foreignFee}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, foreignFee: e.target.value })}
                      placeholder="0% (weltweit kostenlos)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bargeldabhebung (Gebühr / Zinsen)</label>
                    <input
                      type="text"
                      value={editingCardModal.cashFee}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, cashFee: e.target.value })}
                      placeholder="0% Gebühr, Zinsen beachten"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Automatischer Bankeinzug / Lastschrift</label>
                    <input
                      type="text"
                      value={editingCardModal.autoDebit}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, autoDebit: e.target.value })}
                      placeholder="z.B. Nein (Manuelle Überweisung bis 20. des Monats) oder Ja (100% Lastschrift)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Verwendung / Einsatzzweck</label>
                    <input
                      type="text"
                      value={editingCardModal.purpose}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, purpose: e.target.value })}
                      placeholder="z.B. Hauptkarte für Hotels & Mietwagen-Kaution"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sperr- / Notfallnummer der Bank</label>
                    <input
                      type="text"
                      value={editingCardModal.emergencyPhone}
                      onChange={(e) => setEditingCardModal({ ...editingCardModal, emergencyPhone: e.target.value })}
                      placeholder="+49 116 116"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Karten-Farbe</label>
                    <RtCardColors value={editingCardModal.color} onChange={(v) => setEditingCardModal({ ...editingCardModal, color: v })} />
                  </div>
                  <div className="sm:col-span-2"><label className="font-bold text-slate-700 block mb-1">Logo</label><RtCardLogo card={editingCardModal} onChange={(v) => setEditingCardModal({ ...editingCardModal, logo: v })} /></div>
                </div>
                <div className="bg-slate-100 px-5 py-3 flex justify-end gap-2">
                  <button onClick={() => setEditingCardModal(null)} className="px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Abbrechen
                  </button>
                  <button
                    onClick={() => {
                      if (!editingCardModal.name.trim()) return;
                      const existingCard = (tripData.creditCards || []).find((c) => c.id === editingCardModal.id);
                      const oldName = existingCard ? existingCard.name : null;
                      const newName = editingCardModal.name.trim();

                      const updatedCards = existingCard
                        ? (tripData.creditCards || []).map((c) => (c.id === editingCardModal.id ? { ...editingCardModal, name: newName } : c))
                        : [...(tripData.creditCards || []), { ...editingCardModal, name: newName }];

                      // Falls der Kurzname einer bestehenden Karte geändert wurde, alle verknüpften Buchungen automatisch mitaktualisieren
                      let updatedFlights = tripData.flights || [];
                      let updatedCars = tripData.rentalCars || [];
                      let updatedStages = tripData.stages || [];

                      if (oldName && oldName !== newName) {
                        updatedFlights = updatedFlights.map((f) => (f.creditCard === oldName ? { ...f, creditCard: newName } : f));
                        updatedCars = updatedCars.map((c) => (c.creditCard === oldName ? { ...c, creditCard: newName } : c));
                        updatedStages = updatedStages.map((s) =>
                          s.hotel?.creditCard === oldName ? { ...s, hotel: { ...s.hotel, creditCard: newName } } : s
                        );
                      }

                      saveTripData(
                        {
                          ...tripData,
                          creditCards: updatedCards,
                          flights: updatedFlights,
                          rentalCars: updatedCars,
                          stages: updatedStages
                        },
                        `Kreditkarte „${newName}“ gespeichert`
                      );
                      setEditingCardModal(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                  >
                    ✓ Karte speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 6: NOTFALLKONTAKT BEARBEITEN / ANLEGEN */}
          {editingEmergencyModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden">
                <div className="bg-rose-950 text-white px-5 py-3.5 flex justify-between items-center">
                  <h3 className="font-bold text-sm sm:text-base">Notfallkontakt bearbeiten / anlegen</h3>
                  <button onClick={() => setEditingEmergencyModal(null)}>✕</button>
                </div>
                <div className="p-5 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Organisation / Bezeichnung</label>
                    <input
                      type="text"
                      value={editingEmergencyModal.organization}
                      onChange={(e) => setEditingEmergencyModal({ ...editingEmergencyModal, organization: e.target.value })}
                      placeholder="z.B. ADAC Auslandsnotruf"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kategorie</label>
                      <select data-em-group-select value={rtEmGroup(editingEmergencyModal)} onChange={(e) => setEditingEmergencyModal({ ...editingEmergencyModal, group: e.target.value, category: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white">{RT_EM_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}</select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Telefonnummer</label>
                      <input
                        type="text"
                        value={editingEmergencyModal.displayPhone || editingEmergencyModal.phone}
                        onChange={(e) =>
                          setEditingEmergencyModal({
                            ...editingEmergencyModal,
                            displayPhone: e.target.value,
                            phone: e.target.value.replace(/\s+/g, '')
                          })
                        }
                        placeholder="+49 89 22 22 22"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                  <div><label className="font-bold text-slate-700 block mb-1">Farbe (der rote Rand bleibt immer)</label><RtCardColors value={editingEmergencyModal.color || 'red'} onChange={(v) => setEditingEmergencyModal({ ...editingEmergencyModal, color: v })} /></div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vertrags- / Mitglieds- / Policennummer</label>
                    <input
                      type="text"
                      value={editingEmergencyModal.contractNumber}
                      onChange={(e) => setEditingEmergencyModal({ ...editingEmergencyModal, contractNumber: e.target.value })}
                      placeholder="z.B. ADAC Mitglieds-Nr. 849-201-993"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Wichtige Hinweise</label>
                    <textarea
                      rows={2}
                      value={editingEmergencyModal.notes}
                      onChange={(e) => setEditingEmergencyModal({ ...editingEmergencyModal, notes: e.target.value })}
                      placeholder="z.B. 24h erreichbar..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
                <div className="bg-slate-100 px-5 py-3 flex justify-end gap-2">
                  <button onClick={() => setEditingEmergencyModal(null)} className="px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Abbrechen
                  </button>
                  <button
                    onClick={() => {
                      if (!editingEmergencyModal.organization.trim()) return;
                      const exists = (tripData.emergencyContacts || []).some((e) => e.id === editingEmergencyModal.id);
                      const updated = exists
                        ? (tripData.emergencyContacts || []).map((e) => (e.id === editingEmergencyModal.id ? editingEmergencyModal : e))
                        : [...(tripData.emergencyContacts || []), editingEmergencyModal];
                      saveTripData({ ...tripData, emergencyContacts: updated }, 'Notfallkontakt gespeichert');
                      setEditingEmergencyModal(null);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                  >
                    ✓ Kontakt speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          <RtUndoBar />
          {(wizOpen || isNewTripWizardOpen) && !IS_READ_ONLY_COPY && <TripWizard trip={tripData} onSave={saveTripData} onClose={() => { setWizOpen(false); setIsNewTripWizardOpen(false); }} goTab={setActiveTab} startStep={isNewTripWizardOpen && !wizOpen ? 'frame' : wizStart} />}

          {false && isNewTripWizardOpen && (
            <div className="fixed inset-0 z-[60] bg-slate-950/75 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="new-trip-title">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white px-5 py-4">
                  <div className="flex justify-between items-start gap-3"><div><p className="text-xs uppercase tracking-widest text-blue-200">Neue Reise einrichten · Schritt {wizardStep + 1} von 3</p><h2 id="new-trip-title" className="text-xl font-bold mt-1">{['Reise & Zeitraum', 'Start & Ziel', 'Reisende & Budget'][wizardStep]}</h2></div><button type="button" onClick={() => setIsNewTripWizardOpen(false)} className="text-slate-300 hover:text-white" aria-label="Wizard abbrechen">✕</button></div>
                  <div className="mt-4 h-2 rounded-full bg-white/20"><div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${((wizardStep + 1) / 3) * 100}%` }} /></div>
                </div>
                <div className="p-5 sm:p-6 space-y-4">
                  {wizardStep === 0 && <><label className="block text-sm font-semibold">Reisename<input autoFocus type="text" value={wizardData.title} onChange={(e) => setWizardData({ ...wizardData, title: e.target.value })} placeholder="z. B. Sommer-Roadtrip" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" /></label><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><label className="text-sm font-semibold">Startdatum<input type="date" value={wizardData.startDate} onChange={(e) => wzStart(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" /></label><label className="text-sm font-semibold">Reisetage<input type="number" min="1" max="120" value={wizardData.days} onChange={(e) => wzDays(e.target.value)} placeholder="z. B. 14" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" /></label><label className="text-sm font-semibold">Enddatum<input type="date" min={wizardData.startDate || undefined} value={wizardData.endDate} onChange={(e) => wzEnd(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" /></label></div><p className="text-xs text-slate-500">Gib entweder das Enddatum oder die Anzahl der Reisetage ein, das jeweils andere wird berechnet (Start- und Endtag zählen mit).</p><div aria-live="polite" className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-950">{tripDayCount(wizardData.startDate,wizardData.endDate)>0 ? `Vorschau: ${tripDayCount(wizardData.startDate,wizardData.endDate)} Etappen – je eine pro Kalendertag; der letzte Tag ist die Rückreise (ohne Übernachtung).` : 'Bitte Start- und Enddatum eingeben, um die Etappenanzahl zu sehen.'}{tripDayCount(wizardData.startDate,wizardData.endDate)>120 && <span className="block text-rose-800">Maximal 120 Tage pro Reise.</span>}</div></>}
                  {wizardStep === 1 && <><label className="block text-sm font-semibold">Startort / Abflughafen<input data-place="city" type="text" value={wizardData.startLocation} onChange={(e) => setWizardData({ ...wizardData, startLocation: e.target.value })} placeholder="z. B. München (MUC)" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" /></label><label className="block text-sm font-semibold">Zielregion / Land oder erste Etappe<input data-place="city" type="text" value={wizardData.destination} onChange={(e) => setWizardData({ ...wizardData, destination: e.target.value })} placeholder="z. B. Florida / Miami" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" /></label><label className="block text-sm font-semibold">Fahrzeug / Mietwagen (optional)<input type="text" value={wizardData.vehicle} onChange={(e) => setWizardData({ ...wizardData, vehicle: e.target.value })} placeholder="z. B. Mietwagen / SUV" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" /></label><p className="text-xs text-slate-500">Bei Angabe eines Ziels wird eine erste Etappe ohne Hotel angelegt. Weitere Details können später ergänzt werden.</p></>}
                  {wizardStep === 2 && <><label className="block text-sm font-semibold">Anzahl Reisende<input type="number" min="1" max="20" value={wizardData.people} onChange={(e) => setWizardData({ ...wizardData, people: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" placeholder="Anzahl Reisende, z.B. 2" /></label><div className="space-y-2"><div className="text-sm font-semibold">Namen der Reisenden</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{Array.from({ length: Math.max(1, Math.min(20, parseInt(wizardData.people, 10) || 1)) }, (_, i) => <input key={i} type="text" aria-label={`Name Reisende ${i + 1}`} value={(wizardData.names || [])[i] || ''} onChange={(e) => { const nm = [...(wizardData.names || [])]; nm[i] = e.target.value; setWizardData({ ...wizardData, names: nm }); }} placeholder={`Reisende ${i + 1}`} className="w-full px-3 py-2 rounded-lg border border-slate-300" />)}</div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="text-sm font-semibold">Budget (optional)<input type="number" min="0" step="0.01" value={wizardData.budget} onChange={(e) => setWizardData({ ...wizardData, budget: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" placeholder="Budget, z.B. 5000" /></label><label className="text-sm font-semibold">Währung<select value={wizardData.currency} onChange={(e) => setWizardData({ ...wizardData, currency: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"><option value="EUR">EUR (€)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option><option value="CHF">CHF</option></select></label></div><div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900">Die Eingaben werden in den Reisedaten gespeichert. Namen, die du leer lässt, werden als „Reisende 1, 2 …“ angelegt und lassen sich später ändern.</div></>}
                </div>
                <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 flex items-center justify-between gap-2"><button type="button" onClick={() => wizardStep > 0 ? setWizardStep(wizardStep - 1) : setIsNewTripWizardOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm">{wizardStep === 0 ? 'Abbrechen' : 'Zurück'}</button><div className="flex gap-2">{wizardStep < 2 ? <button type="button" onClick={() => { if(wizardStep===0 && wizardData.startDate && wizardData.endDate && wizardData.endDate<wizardData.startDate){showToast('Das Enddatum darf nicht vor dem Startdatum liegen.');return;} if(wizardStep===0 && tripDayCount(wizardData.startDate,wizardData.endDate)>120){showToast('Maximal 120 Tage pro Reise.');return;} setWizardStep(wizardStep + 1); }} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm">Weiter →</button> : <button type="button" onClick={handleCompleteNewTripWizard} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm">Reise anlegen ✓</button>}</div></div>
              </div>
            </div>
          )}

          {/* Gemeinsamer, barrierearmer Löschdialog */}
          {deleteConfirmModal && (
            <div className="fixed inset-0 z-[80] bg-slate-950/75 flex items-center justify-center p-4" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget){setDeleteConfirmModal(null);setDeletePhrase('');}}}>
              <section role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-desc" className="bg-white rounded-2xl shadow-xl border max-w-md w-full p-5 space-y-4">
                <h3 id="delete-title" className="font-bold text-lg text-rose-700">{deleteConfirmModal.type==='reset'?'Alle lokalen Daten zurücksetzen?':'Eintrag entfernen?'}</h3>
                <p id="delete-desc" className="text-sm text-slate-700"><strong>{deleteConfirmModal.title}</strong><br/>{deleteConfirmModal.detail}</p>
                <><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={deleteBackup} onChange={e=>setDeleteBackup(e.target.checked)}/> JSON-Backup herunterladen und Rolling-Backup erstellen</label><label className="block text-sm font-semibold">Zum Bestätigen „LÖSCHEN“ eintippen<input autoFocus value={deletePhrase} onChange={e=>setDeletePhrase(e.target.value)} className="mt-1 w-full rounded-lg border p-2" placeholder="LÖSCHEN" /></label></>
                <div className="flex justify-end gap-2"><button onClick={()=>{setDeleteConfirmModal(null);setDeletePhrase('');}} className="px-4 py-2 rounded border">Abbrechen</button><button disabled={deletePhrase!=='LÖSCHEN'} onClick={()=>{if(deleteConfirmModal.type==='reset') handleResetAllData(); else if(deleteConfirmModal.type==='hotel'){if(deleteBackup) handleExportJson(); try{let b=JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]');b.unshift({savedAt:new Date().toISOString(),data:tripData});localStorage.setItem(BACKUP_KEY,JSON.stringify(b.slice(0,5)));}catch(e){setStorageError('Rolling-Backup fehlgeschlagen: '+e.message);return;} const st=tripData.stages.map(item=>{if(item.id!==deleteConfirmModal.id)return item;const {hotel,...rest}=item;return rest;});saveTripData({...tripData,stages:st},'Hotel/Unterkunft entfernt');setDeleteConfirmModal(null);setEditingStageModal(null);}else confirmDeleteEntity();}} className="px-4 py-2 rounded bg-rose-700 text-white font-bold disabled:opacity-40">{deleteConfirmModal.type==='reset'?'Zurücksetzen':'Entfernen'}</button></div>
              </section>
            </div>
          )}
          {importPreview && <div className="fixed inset-0 z-[80] bg-slate-950/70 flex items-center justify-center p-4"><section role="dialog" aria-modal="true" aria-labelledby="import-title" className="bg-white rounded-2xl p-5 max-w-lg w-full space-y-3"><h2 id="import-title" className="text-lg font-bold">JSON-Import prüfen</h2><p>Datei: <strong>{importPreview.filename}</strong></p><p>Reise: {importPreview.data.meta.title||'Ohne Titel'} · {importPreview.data.stages.length} Etappen · Schema {importPreview.data.meta.schemaVersion||'alt (wird migriert)'}</p><p className="text-xs text-amber-900">Vor Import wird die aktuelle Reise gesichert (Rolling-Backup). Import ersetzt die aktuelle Reise.</p><pre className="max-h-40 overflow-auto rounded bg-slate-100 p-2 text-xs">{JSON.stringify({meta:importPreview.data.meta,stages:importPreview.data.stages.map(x=>({id:x.id,toCity:x.toCity}))},null,2)}</pre><div className="flex justify-end gap-2"><button onClick={()=>setImportPreview(null)} className="px-3 py-2 border rounded">Abbrechen</button><button onClick={confirmImport} className="px-3 py-2 bg-teal-700 text-white rounded font-bold">Backup erstellen & importieren</button></div></section></div>}
          <RtFsBanner trip={tripData} />
          <RtHelpHost hasTrip={(tripData.stages || []).length > 0} />
          <RtBackupBar trip={tripData} />
          <RtDraftBar hasTrip={((tripData.stages || []).length > 0)} />
          {cloudConflict && <div className="fixed inset-0 z-[80] bg-slate-950/75 flex items-center justify-center p-4"><section role="dialog" aria-modal="true" aria-labelledby="conflict-title" className="bg-white rounded-2xl p-5 max-w-lg w-full space-y-4"><h2 id="conflict-title" className="text-lg font-bold text-amber-800">Drive-Konflikt erkannt</h2><p>Lokale Version {Number(tripData.meta?.version)||1} · Drive-Version {cloudConflict.version}. Es wurde nichts automatisch überschrieben. Vorher JSON exportieren empfohlen.</p><div className="grid gap-2"><button onClick={()=>{setCloudConflict(null);uploadCloud(tripData,true);}} className="p-3 rounded bg-teal-700 text-white font-bold">Lokal behalten – Drive bewusst überschreiben</button><button onClick={applyCloud} className="p-3 rounded border font-bold">Drive übernehmen – lokale Version ersetzen</button><button onClick={mergeCloud} className="p-3 rounded border font-bold">Zusammenführen – Listen nach ID kombinieren (lokale Felder gewinnen)</button><button onClick={()=>setCloudConflict(null)} className="p-2 text-slate-600">Später entscheiden</button></div></section></div>}
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<AppErrorBoundary><App /></AppErrorBoundary>);
  