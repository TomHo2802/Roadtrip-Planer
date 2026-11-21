/* ===== v60: Icon-Satz (Linienicons statt Emojis) ===== */
    const RT_IC = {
      pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
      hotel: <><path d="M3 19V5M3 15h18v4M21 15v-2.5A3.5 3.5 0 0 0 17.5 9H11v6" /><circle cx="7" cy="11.5" r="1.7" /></>,
      park: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><path d="M10 16.5V8h3a2.6 2.6 0 0 1 0 5.2h-3" /></>,
      sos: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" /><path d="M5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9" /></>,
      wx: <><path d="M7.5 19h9a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 6.4 12.3 3.5 3.5 0 0 0 7.5 19z" /><path d="M9.5 4.5V3M4.7 6.2l-1-1M14.3 6.2l1-1" /></>,
      flag: <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
      target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>,
      car: <><path d="M4 15v-3.5L6 6.5h12l2 5V15" /><rect x="3" y="15" width="18" height="3.5" rx="1.2" /><path d="M7.5 18.5V20M16.5 18.5V20" /></>,
      plane: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
      calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
      compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
      map: <><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></>,
      card: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h3" /></>,
      sunrise: <><path d="M5 18a7 7 0 0 1 14 0M12 4v4M4.5 9.5L6 11M19.5 9.5L18 11M2 18h20M9 6.5L12 4l3 2.5" /></>,
      sunset: <><path d="M5 18a7 7 0 0 1 14 0M12 4v4M4.5 9.5L6 11M19.5 9.5L18 11M2 18h20M9 5.5L12 8l3-2.5" /></>,
      warn: <><path d="M12 3.5l9.5 16.5h-19z" /><path d="M12 10v4.5M12 17.3v.1" /></>,
      check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.3l2.7 2.7L16 9.5" /></>,
      bag: <><rect x="5" y="8" width="14" height="12" rx="2.5" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
      clip: <path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.6 17.2a1.7 1.7 0 0 1-2.4-2.4L15 7" />,
      print: <><path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><rect x="7" y="14" width="10" height="6" /></>,
      link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
      scale: <path d="M12 4v16M6 20h12M5 8h14M5 8l-3 7a3.5 3.5 0 0 0 6 0zM19 8l-3 7a3.5 3.5 0 0 0 6 0z" />,
      file: <><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /></>,
      image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="M4 17l5-4 4 3 3-2.5 4 3.5" /></>,
      folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
      laptop: <><rect x="5" y="5" width="14" height="10" rx="1.8" /><path d="M3 19h18" /></>,
      lock: <><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
      spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />,
      rain: <><path d="M3 12a9 9 0 0 1 18 0z" /><path d="M12 12v6a2 2 0 0 0 4 0" /></>,
      chev: <path d="M6 9l6 6 6-6" />,
    };
    function Ic({ n, size, className }) { return <svg viewBox="0 0 24 24" className={'rt-ic ' + (className || '')} width={size || undefined} height={size || undefined} aria-hidden="true">{RT_IC[n] || null}</svg>; }

    /* ===== v61: App-Verhalten (Bottom-Sheets, Kopfleiste, Skeleton) und klare Seitenstruktur ===== */
    Object.assign(RT_IC, {
      info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.8v.1" /></>,
      inbox: <><path d="M3 13l2.5-7h13L21 13v6H3z" /><path d="M3 13h5l1 2h6l1-2h5" /></>,
    });
    function Skel({ lines }) { return <div className="rt-skel-wrap" aria-busy="true" aria-label="Lädt">{Array.from({ length: lines || 3 }).map((_, i) => <div key={i} className="rt-skel" style={{ width: (92 - i * 14) + '%' }} />)}</div>; }
    function Empty({ icon, title, text, action, onAction }) {
      return (
        <div data-empty className="rt-empty">
          <span className="rt-ico"><Ic n={icon || 'inbox'} size={22} /></span>
          {title && <div className="rt-empty-t">{title}</div>}
          <p className="rt-empty-p">{text}</p>
          {action && onAction && <button type="button" onClick={onAction} className="v18-btn pri sm">{action}</button>}
        </div>
      );
    }
    function RtHint({ children }) {
      return (
        <details className="rt-hint">
          <summary><Ic n="info" />Hinweis anzeigen</summary>
          <p>{children}</p>
        </details>
      );
    }
    (function rtAppBehaviour() {
      if (window.__rtAppBeh) return; window.__rtAppBeh = true;
      /* Höhe der mobilen Kopfleiste als CSS-Variable (für die fixierte Reiter-Leiste) */
      try { const setH = () => { const h = document.querySelector('.v18-mhead'); const vis = h && getComputedStyle(h).display !== 'none'; const v = vis ? h.getBoundingClientRect().height : 0; const r = document.documentElement; r.style.setProperty('--rt-hdr', v + 'px'); if (!r.classList.contains('rt-scrolled') && v) r.style.setProperty('--rt-hdr-full', v + 'px'); };
        setH(); window.addEventListener('resize', setH); window.addEventListener('scroll', setH, { passive: true }); setInterval(setH, 1000); } catch (e) {}
      /* Kopfleiste wird beim Scrollen kompakt */
      try { let on = false; window.addEventListener('scroll', () => { const s = (window.scrollY || 0) > 8; if (s !== on) { on = s; document.documentElement.classList.toggle('rt-scrolled', s); } }, { passive: true }); } catch (e) {}
      /* Bottom-Sheet: nach unten wischen schließt (nur Handy-Breite, Start am oberen Rand des Fensters) */
      try {
        let st = null;
        const panelOf = (t) => { const ov = t.closest && t.closest('.fixed.inset-0'); if (!ov || !/bg-slate-(950|900)/.test(ov.className)) return null; const p = ov.firstElementChild; return p && p.contains(t) ? { ov, p } : null; };
        document.addEventListener('touchstart', (e) => {
          if (window.innerWidth > 639) return; const hit = panelOf(e.target); if (!hit) return;
          const r = hit.p.getBoundingClientRect(); const y = e.touches[0].clientY;
          if (y - r.top > 40 || hit.p.scrollTop > 0) return; st = { ...hit, y0: y, dy: 0 };
        }, { passive: true });
        document.addEventListener('touchmove', (e) => { if (!st) return; st.dy = Math.max(0, e.touches[0].clientY - st.y0); st.p.style.transition = 'none'; st.p.style.transform = `translateY(${st.dy}px)`; }, { passive: true });
        document.addEventListener('touchend', () => {
          if (!st) return; const { ov, p, dy } = st; st = null;
          if (dy > 110) {
            p.style.transition = 'transform .18s ease-in'; p.style.transform = 'translateY(100%)';
            setTimeout(() => {
              ov.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
              setTimeout(() => { if (document.body.contains(ov)) { const b = [...ov.querySelectorAll('button')].find((x) => /schließen|abbrechen|✕|×|zurück/i.test(x.innerText || x.getAttribute('aria-label') || '')); if (b) b.click(); else { p.style.transform = ''; } } }, 60);
            }, 170);
          } else { p.style.transition = 'transform .18s ease-out'; p.style.transform = ''; }
        }, { passive: true });
      } catch (e) {}
    })();

    /* ===== v63: Datum mit Kalender, Uhrzeit in 30-Minuten-Schritten ===== */
    const RT_T30 = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
    const rtTimesIn = (v) => [...String(v || '').matchAll(/(\d{1,2})(?::(\d{2}))?/g)].map((m) => `${String(Number(m[1])).padStart(2, '0')}:${m[2] || '00'}`).filter((t) => Number(t.slice(0, 2)) < 24 && Number(t.slice(3)) < 60);
    const RT_SEL_CLS = 'w-full min-w-0 px-2 py-1.5 rounded-lg border border-slate-300 bg-white tabular-nums';
    function RtTimeSel({ value, onChange, suffix, className, empty }) {
      const raw = String(value || ''); const t = rtTimesIn(raw)[0] || '';
      const clean = raw.trim() === '' ? '' : (RT_T30.includes(t) && /^\s*\d{1,2}(:\d{2})?\s*(Uhr)?\s*$/.test(raw) ? t : null);
      const out = (v) => (v ? v + (suffix || '') : '');
      return (
        <select data-time30 value={clean === null ? raw : clean} onChange={(e) => onChange(out(e.target.value))} className={className || RT_SEL_CLS}>
          <option value="">{empty || '— Uhrzeit —'}</option>
          {clean === null && <option value={raw}>{raw} (bisher)</option>}
          {RT_T30.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      );
    }
    function RtCheckIn({ value, onChange }) {
      const ts = rtTimesIn(value); const from = ts[0] || '', to = ts[1] || '';
      const set = (f, t) => onChange(f ? (t ? `${f} - ${t} Uhr` : `${f} Uhr`) : '');
      const after = from ? RT_T30.filter((x) => x > from).concat(from !== '00:00' ? ['00:00'] : []) : [];
      const fromOpt = from && !RT_T30.includes(from) ? <option value={from}>{from}</option> : null;
      const toOpt = to && !after.includes(to) ? <option value={to}>{to}</option> : null;
      const onFrom = (v) => { const keep = to && v && (to === '00:00' || to > v) ? to : ''; set(v, keep); };
      return (
        <div data-checkin className="grid items-center gap-1.5" style={{ gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)' }}>
          <select data-time30 value={from} onChange={(e) => onFrom(e.target.value)} className={RT_SEL_CLS} aria-label="Check-in von"><option value="">von</option>{fromOpt}{RT_T30.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          <span aria-hidden="true" className="text-slate-500 font-bold">–</span>
          <select data-time30 value={to} onChange={(e) => set(from, e.target.value)} disabled={!from} className={RT_SEL_CLS} aria-label="Check-in bis"><option value="">bis</option>{toOpt}{after.map((x) => <option key={x} value={x}>{x}</option>)}</select>
        </div>
      );
    }
    function RtDateField({ value, onChange, flexible, className }) {
      const v = String(value || ''); const iso = dateInputValue(v); const flex = /flexibel/i.test(v);
      const legacy = v && !iso && !flex ? v : '';
      return (
        <div data-datefield>
          <input type="date" value={iso} disabled={flex} onChange={(e) => onChange(e.target.value)} className={className || RT_SEL_CLS} />
          {flexible && <label className="mt-1 flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={flex} onChange={(e) => onChange(e.target.checked ? 'Flexibel' : '')} />Flexibel stornierbar</label>}
          {legacy && <div className="mt-1 text-[11px] text-slate-500">Bisher: {legacy}. Ein Datum wählen ersetzt den Eintrag.</div>}
        </div>
      );
    }
    function RtHotelFacts({ h }) {
      const items = [['Frühstück', h.breakfast], ['Parken', h.parking], ['Bereits bezahlt', h.prepaid]];
      const tone = (v) => { const s = String(v || '').trim().toLowerCase(); if (!s) return 'bg-slate-100 text-slate-500 border-slate-200'; if (/^(ja|yes|inkl|inklusive)/.test(s)) return 'bg-emerald-50 text-emerald-900 border-emerald-200'; if (/^(nein|no)/.test(s)) return 'bg-rose-50 text-rose-900 border-rose-200'; return 'bg-amber-50 text-amber-900 border-amber-200'; };
      return (
        <div data-hotel-facts className="flex flex-wrap gap-2">
          {items.map(([l, v]) => <span key={l} className={`inline-flex items-center gap-1.5 min-h-[32px] px-2.5 rounded-lg border text-xs font-semibold ${tone(v)}`}>{l}<b>{String(v || '').trim() ? String(v).trim() : '—'}</b></span>)}
        </div>
      );
    }

    // ===== v70: Drive-Synchronisation (automatisch speichern + Änderungen übernehmen) =====
    window.__rtFs = fsSync;
    function RtFsBanner({ trip }) {
      const fs = useFsSync(); const [busy, setBusy] = useState(false); const [note, setNote] = useState(() => { try { const v = sessionStorage.getItem('rt_synced'); if (v) { sessionStorage.removeItem('rt_synced'); return 'Aktualisiert: neuere Version aus Drive übernommen.'; } } catch (e) {} return ''; });
      useEffect(() => { if (!note) return; const t = setTimeout(() => setNote(''), 6000); return () => clearTimeout(t); }, [note]);
      useEffect(() => {
        if (IS_READ_ONLY_COPY) return;
        const go = () => { if (document.visibilityState !== 'hidden') fsSync.poll(); };
        const iv = setInterval(go, 15000);
        document.addEventListener('visibilitychange', go); window.addEventListener('focus', go); window.addEventListener('online', go);
        go();
        return () => { clearInterval(iv); document.removeEventListener('visibilitychange', go); window.removeEventListener('focus', go); window.removeEventListener('online', go); };
      }, []);
      // Neuere Datei automatisch übernehmen, wenn gerade nichts bearbeitet wird und nichts ungespeichert ist
      useEffect(() => {
        if (!fs.incoming || fs.dirty) return;
        const t = setInterval(() => {
          const ae = document.activeElement, typing = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);
          const dlg = document.querySelector('[role="dialog"],[aria-modal="true"],.rt-sheet');
          if (!typing && !dlg && !fsSync.dirty && fsSync.incoming) { clearInterval(t); fsSync.applyIncoming().catch((e) => fsSync.set({ error: String(e && e.message || e) })); }
        }, 1500);
        return () => clearInterval(t);
      }, [fs.incoming, fs.dirty]);
      const run = async (fn) => { setBusy(true); try { await fn(); } catch (x) { if (!x || x.name !== 'AbortError') fsSync.set({ error: x && x.message ? x.message : String(x) }); } setBusy(false); };
      if (IS_READ_ONLY_COPY || fs.status === 'none') return note ? <div role="status" className="rt-fsbar">{note}</div> : null;
      const hh = fs.lastWrite ? fs.lastWrite.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : null;
      return (
        <>
          {note && <div role="status" className="rt-fsbar">{note}</div>}
          {fs.incoming && <div role="alert" className="rt-fsbar warn">
            <span>Auf Drive liegt eine neuere Version (z. B. vom Laptop).</span>
            <button type="button" disabled={busy} onClick={() => run(() => fsSync.applyIncoming())}>Jetzt laden</button>
            <button type="button" disabled={busy} className="ghost" onClick={async () => { if ((await window.rtAsk('Die Drive-Datei mit deinem Stand überschreiben? Änderungen der anderen Version gehen dann verloren.'))) run(async () => { fsSync.set({ incoming: null }); await fsSync.write(trip, true); }); }}>Meinen Stand behalten</button>
          </div>}
          {!fs.incoming && fs.status === 'needs-permission' && <div role="alert" className="rt-fsbar warn">
            <span>Drive-Verbindung pausiert ({fs.name}). Bitte kurz bestätigen.</span>
            <button type="button" disabled={busy} onClick={() => run(() => fsSync.renew(trip))}>Verbindung erneuern</button>
          </div>}
          {fs.status === 'connected' && !fs.incoming && <div className="rt-fspill" title={fs.error || ('Datei: ' + fs.name)}>{fs.error ? 'Drive: Fehler' : fs.dirty ? 'Drive: speichert …' : hh ? 'Drive gespeichert ' + hh : 'Drive verbunden'}</div>}
        </>
      );
    }

    // ===== v72: mehr Kartenfarben + Logo =====
    const RT_CARD_COLORS = [
      { k: 'emerald', l: 'Grün', a: '#065f46', b: '#042f2e', h: 'from-emerald-800 to-teal-950', bg: 'bg-emerald-200 text-emerald-950 border-emerald-400', bar: 'bg-emerald-600' },
      { k: 'blue', l: 'Blau', a: '#1e40af', b: '#172554', h: 'from-blue-800 to-blue-950', bg: 'bg-blue-200 text-blue-950 border-blue-400', bar: 'bg-blue-600' },
      { k: 'amber', l: 'Gold', a: '#b45309', b: '#78350f', h: 'from-amber-700 to-amber-900', bg: 'bg-amber-200 text-amber-950 border-amber-400', bar: 'bg-amber-500' },
      { k: 'purple', l: 'Violett', a: '#6b21a8', b: '#3b0764', h: 'from-purple-800 to-purple-950', bg: 'bg-purple-200 text-purple-950 border-purple-400', bar: 'bg-purple-600' },
      { k: 'rose', l: 'Rose', a: '#9f1239', b: '#4c0519', h: 'from-rose-800 to-rose-950', bg: 'bg-rose-200 text-rose-950 border-rose-400', bar: 'bg-rose-600' },
      { k: 'red', l: 'Rot', a: '#b91c1c', b: '#7f1d1d', h: 'from-red-700 to-red-900', bg: 'bg-red-200 text-red-950 border-red-400', bar: 'bg-red-600' },
      { k: 'orange', l: 'Orange', a: '#c2410c', b: '#7c2d12', h: 'from-orange-700 to-orange-900', bg: 'bg-orange-200 text-orange-950 border-orange-400', bar: 'bg-orange-600' },
      { k: 'yellow', l: 'Gelb', a: '#ca8a04', b: '#854d0e', h: 'from-yellow-600 to-yellow-800', bg: 'bg-yellow-200 text-yellow-950 border-yellow-400', bar: 'bg-yellow-500' },
      { k: 'lime', l: 'Lindgrün', a: '#4d7c0f', b: '#365314', h: 'from-lime-700 to-lime-900', bg: 'bg-lime-200 text-lime-950 border-lime-400', bar: 'bg-lime-600' },
      { k: 'teal', l: 'Petrol', a: '#0f766e', b: '#134e4a', h: 'from-teal-700 to-teal-900', bg: 'bg-teal-200 text-teal-950 border-teal-400', bar: 'bg-teal-600' },
      { k: 'cyan', l: 'Türkis', a: '#0e7490', b: '#164e63', h: 'from-cyan-700 to-cyan-900', bg: 'bg-cyan-200 text-cyan-950 border-cyan-400', bar: 'bg-cyan-600' },
      { k: 'sky', l: 'Hellblau', a: '#0369a1', b: '#0c4a6e', h: 'from-sky-700 to-sky-900', bg: 'bg-sky-200 text-sky-950 border-sky-400', bar: 'bg-sky-600' },
      { k: 'indigo', l: 'Indigo', a: '#4338ca', b: '#1e1b4b', h: 'from-indigo-700 to-indigo-950', bg: 'bg-indigo-200 text-indigo-950 border-indigo-400', bar: 'bg-indigo-600' },
      { k: 'fuchsia', l: 'Magenta', a: '#a21caf', b: '#701a75', h: 'from-fuchsia-700 to-fuchsia-900', bg: 'bg-fuchsia-200 text-fuchsia-950 border-fuchsia-400', bar: 'bg-fuchsia-600' },
      { k: 'pink', l: 'Pink', a: '#be185d', b: '#831843', h: 'from-pink-700 to-pink-900', bg: 'bg-pink-200 text-pink-950 border-pink-400', bar: 'bg-pink-600' },
      { k: 'stone', l: 'Braun', a: '#57534e', b: '#292524', h: 'from-stone-600 to-stone-800', bg: 'bg-stone-200 text-stone-950 border-stone-400', bar: 'bg-stone-600' },
      { k: 'slate', l: 'Grau', a: '#475569', b: '#1e293b', h: 'from-slate-600 to-slate-800', bg: 'bg-slate-200 text-slate-950 border-slate-400', bar: 'bg-slate-600' },
      { k: 'black', l: 'Schwarz', a: '#262626', b: '#000000', h: 'from-neutral-800 to-black', bg: 'bg-neutral-200 text-neutral-950 border-neutral-400', bar: 'bg-neutral-700' },
    ];
    const rtCardTheme = (color) => { const c = RT_CARD_COLORS.find((x) => x.k === color) || RT_CARD_COLORS[0]; return { bg: c.bg, header: c.h, bar: c.bar }; };
    function RtCardColors({ value, onChange }) {
      return (
        <div data-card-colors className="flex flex-wrap gap-2" role="radiogroup" aria-label="Kartenfarbe">
          {RT_CARD_COLORS.map((c) => {
            const on = (value || 'emerald') === c.k;
            return <button key={c.k} type="button" role="radio" aria-checked={on} title={c.l} onClick={() => onChange(c.k)} style={{ background: `linear-gradient(135deg, ${c.a}, ${c.b})`, width: 36, height: 36, borderRadius: 10, outline: on ? '3px solid #F2A044' : '1px solid rgba(0,0,0,.15)', outlineOffset: on ? 2 : 0 }} className="shrink-0"><span className="sr-only">{c.l}</span></button>;
          })}
        </div>
      );
    }
    const RT_BRAND_DOMAINS = [
      [/amex|american express/i, 'americanexpress.com'], [/visa/i, 'visa.com'], [/master ?card/i, 'mastercard.com'], [/diners/i, 'dinersclub.com'],
      [/tf[ -]?bank/i, 'tf-bank.com'], [/dkb/i, 'dkb.de'], [/ing([- ]diba)?\b/i, 'ing.de'], [/comdirect/i, 'comdirect.de'], [/consors/i, 'bnpparibas.de'],
      [/barclay/i, 'barclays.de'], [/n26/i, 'n26.com'], [/revolut/i, 'revolut.com'], [/wise/i, 'wise.com'], [/sparkasse/i, 'sparkasse.de'], [/volksbank|vr[- ]bank/i, 'vr.de'],
      [/commerzbank/i, 'commerzbank.de'], [/deutsche bank/i, 'deutsche-bank.de'], [/postbank/i, 'postbank.de'], [/hanseatic/i, 'hanseaticbank.de'], [/advanzia|gebührenfrei/i, 'advanzia.com'],
      [/paypal/i, 'paypal.com'], [/lufthansa|miles/i, 'lufthansa.com'], [/bahn/i, 'bahn.de'], [/adac/i, 'adac.de'], [/santander/i, 'santander.de'], [/hsbc/i, 'hsbc.de'],
    ];
    const rtGuessDomain = (name) => { const n = String(name || ''); const hit = RT_BRAND_DOMAINS.find((x) => x[0].test(n)); return hit ? hit[1] : ''; };
    // Bild (Datei oder Blob) auf max. 160 px verkleinern und als PNG-Datenadresse zurückgeben
    const rtLogoFromBlob = (blob) => new Promise((res, rej) => {
      const url = URL.createObjectURL(blob), img = new Image();
      img.onload = () => { try { const k = Math.min(1, 160 / Math.max(img.width, img.height, 1)); const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/png')); } catch (e) { URL.revokeObjectURL(url); rej(e); } };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Bild konnte nicht gelesen werden.')); }; img.src = url;
    });
    const rtFetchLogo = async (domain) => {
      const urls = [`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`, `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`];
      let last = null;
      for (const u of urls) {
        try { const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 10000); const r = await fetch(u, { signal: ac.signal }); clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); const b = await r.blob(); if (b.size < 100) throw new Error('leer'); return await rtLogoFromBlob(b); } catch (e) { last = e; }
      }
      throw last || new Error('nicht erreichbar');
    };
    function RtCardLogo({ card, onChange }) {
      const [dom, setDom] = useState(() => rtGuessDomain(card.name)); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
      const load = async () => {
        const d = dom.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''); if (!d) { setMsg('Bitte Webseite der Bank oder Karte eintragen, z. B. dkb.de.'); return; }
        setBusy(true); setMsg('');
        try { onChange(await rtFetchLogo(d)); setMsg('Logo geladen und in der Karte gespeichert.'); } catch (e) { setMsg('Logo konnte nicht geladen werden (kein Internet oder Seite blockiert). Wähle stattdessen ein eigenes Bild.'); }
        setBusy(false);
      };
      const pick = async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return; setBusy(true); setMsg(''); try { onChange(await rtLogoFromBlob(f)); setMsg('Bild übernommen.'); } catch (x) { setMsg(x.message || 'Fehler'); } setBusy(false); };
      const take = async (blob) => { setBusy(true); setMsg(''); try { onChange(await rtLogoFromBlob(blob)); setMsg('Bild aus der Zwischenablage übernommen.'); } catch (x) { setMsg(x.message || 'Fehler'); } setBusy(false); };
      useEffect(() => {
        const h = (e) => { const it = [...((e.clipboardData && e.clipboardData.items) || [])].find((i) => /^image\//.test(i.type)); if (!it) return; const f = it.getAsFile(); if (f) { e.preventDefault(); take(f); } };
        document.addEventListener('paste', h); return () => document.removeEventListener('paste', h);
      }, []);
      const fromClip = async () => {
        setMsg('');
        try { if (!navigator.clipboard || !navigator.clipboard.read) throw new Error('x'); const items = await navigator.clipboard.read(); for (const it of items) { const t = it.types.find((x) => /^image\//.test(x)); if (t) { await take(await it.getType(t)); return; } } setMsg('In der Zwischenablage ist kein Bild. Kopiere zuerst ein Bild.'); }
        catch (e) { setMsg('Zugriff auf die Zwischenablage nicht möglich. Kopiere das Bild und drücke Strg+V (am Handy: in das Feld unten tippen und „Einfügen“ wählen).'); }
      };
      return (
        <div data-card-logo className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden">{card.logo ? <img src={card.logo} alt="" className="max-w-full max-h-full object-contain" /> : <span className="text-[10px] text-slate-400">kein Logo</span>}</div>
            {card.logo && <button type="button" onClick={() => { onChange(''); setMsg(''); }} className="min-h-[36px] px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold">Entfernen</button>}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input type="text" value={dom} onChange={(e) => setDom(e.target.value)} placeholder="Webseite, z. B. dkb.de" className="flex-1 min-w-[10rem] px-3 py-1.5 rounded-lg border border-slate-300" />
            <button type="button" disabled={busy} onClick={load} className="min-h-[36px] px-3 rounded-lg bg-[#1F4E8C] text-white text-xs font-bold">{busy ? 'Lade …' : 'Logo aus Internet laden'}</button>
            <button type="button" disabled={busy} data-clip-paste onClick={fromClip} className="min-h-[36px] px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold">Aus Zwischenablage</button>
            <label className="min-h-[36px] inline-flex items-center px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold cursor-pointer">Eigenes Bild<input type="file" accept="image/*" className="hidden" onChange={pick} /></label>
          </div>
          {msg && <div role="status" className="text-xs text-slate-700">{msg}</div>}
        </div>
      );
    }

    // ===== v74: Notfallkontakte nach Gruppen + Farben =====
    const RT_EM_GROUPS = ['Bank', 'ADAC', 'Privat', 'Mietwagen', 'Fluggesellschaft', 'Reise', 'Sonstiges'];
    const rtEmGroup = (em) => {
      if (em && RT_EM_GROUPS.includes(em.group)) return em.group;
      const t = `${(em && em.category) || ''} ${(em && em.organization) || ''}`.toLowerCase();
      if (/adac|pannen|abschlepp/.test(t)) return 'ADAC';
      if (/bank|kredit|karte|sperr|visa|master|amex|sparkasse|dkb|ing\b/.test(t)) return 'Bank';
      if (/miet|hertz|avis|sixt|enterprise|budget|alamo|car rental|auto/.test(t)) return 'Mietwagen';
      if (/flug|airline|lufthansa|condor|eurowings|delta|united|american air|airways|air /.test(t)) return 'Fluggesellschaft';
      if (/privat|familie|freund|angehörig|zuhause|nachbar|eltern/.test(t)) return 'Privat';
      if (/reise|versicher|hotel|botschaft|konsulat|auswärtig|usa|notruf|911|arzt|klinik|krankenhaus/.test(t)) return 'Reise';
      return 'Sonstiges';
    };
    const rtEmTheme = (em) => { const c = RT_CARD_COLORS.find((x) => x.k === ((em && em.color) || 'red')) || RT_CARD_COLORS.find((x) => x.k === 'red'); return { solid: c.a, grad: `linear-gradient(135deg, ${c.a}, ${c.b})` }; };

    // ===== v75: Koffer-PINs je Mitreisendem =====
    function RtPinCards({ trip, onSave }) {
      const cards = trip.suitcasePins || []; const people = (trip.participants || []).map((p) => p.name).filter(Boolean);
      const [edit, setEdit] = useState(null); const [shown, setShown] = useState({});
      const uid = () => 'sp-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      const free = people.filter((n) => !cards.some((c) => c.name === n));
      const startNew = () => setEdit({ id: uid(), name: free[0] || '', pins: [{ id: uid(), label: '', pin: '' }], isNew: true });
      const save = () => {
        const name = (edit.name || '').trim(); if (!name) return;
        const pins = (edit.pins || []).filter((p) => (p.label || '').trim() || (p.pin || '').trim()).map((p) => ({ id: p.id, label: (p.label || '').trim(), pin: (p.pin || '').trim() }));
        const next = { id: edit.id, name, pins };
        const list = cards.some((c) => c.id === edit.id) ? cards.map((c) => (c.id === edit.id ? next : c)) : [...cards, next];
        onSave({ ...trip, suitcasePins: list }, 'Koffer-PINs gespeichert'); setEdit(null);
      };
      const del = async (c) => { if ((await window.rtAsk(`Karte „${c.name}“ mit allen PINs löschen?`))) onSave({ ...trip, suitcasePins: cards.filter((x) => x.id !== c.id) }, 'Koffer-PINs gelöscht'); };
      const setPin = (id, k, v) => setEdit({ ...edit, pins: edit.pins.map((p) => (p.id === id ? { ...p, [k]: v } : p)) });
      return (
        <section data-pin-section className="rounded-2xl border border-slate-300 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-base sm:text-lg font-bold">Koffer-PINs</h2><p className="text-xs text-slate-300">Zahlenschlösser je Mitreisendem mit Beschreibung. Liegen in der Reisedatei, nicht in der Reisevorlage.</p></div>
            <button type="button" data-pin-add-card onClick={startNew} className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg">+ Karte anlegen</button>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.length === 0 && !edit && <div className="text-sm text-slate-500 md:col-span-3">Noch keine PINs hinterlegt.</div>}
            {cards.map((c) => (edit && edit.id === c.id) ? null : (
              <div key={c.id} data-pin-card={c.name} className="rounded-xl border border-slate-300 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <div className="flex gap-1">
                    <button type="button" data-readonly-allow onClick={() => setShown({ ...shown, [c.id]: !shown[c.id] })} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded font-semibold">{shown[c.id] ? 'Verbergen' : 'Anzeigen'}</button>
                    <button type="button" onClick={() => setEdit(JSON.parse(JSON.stringify(c)))} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded font-semibold">Bearbeiten</button>
                  </div>
                </div>
                {(c.pins || []).length === 0 && <div className="text-xs text-slate-500">Keine PINs.</div>}
                {(c.pins || []).map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <span className="text-slate-700">{p.label || 'PIN'}</span>
                    <span className="font-mono font-bold text-slate-900">{shown[c.id] ? p.pin : '••••'}</span>
                  </div>
                ))}
              </div>
            ))}
            {edit && (
              <div data-pin-edit className="rounded-xl border-2 border-blue-500 bg-white p-4 space-y-3 md:col-span-2 lg:col-span-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Name</label>
                  <input list="rt-pin-names" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Mitreisende wählen oder tippen" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold" />
                  <datalist id="rt-pin-names">{people.map((n) => <option key={n} value={n} />)}</datalist>
                </div>
                <div className="space-y-2">
                  {edit.pins.map((p) => (
                    <div key={p.id} data-pin-row className="flex gap-2 items-center">
                      <input value={p.label} onChange={(e) => setPin(p.id, 'label', e.target.value)} placeholder="Beschreibung, z. B. großer blauer Koffer" className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-slate-300 text-sm" />
                      <input value={p.pin} inputMode="numeric" onChange={(e) => setPin(p.id, 'pin', e.target.value)} placeholder="PIN" className="w-20 px-2.5 py-2 rounded-lg border border-slate-300 text-sm font-mono" />
                      <button type="button" aria-label="PIN entfernen" title="PIN entfernen" onClick={() => setEdit({ ...edit, pins: edit.pins.filter((x) => x.id !== p.id) })} className="w-9 h-9 shrink-0 rounded-lg border border-slate-300 text-slate-500 hover:text-rose-600">✕</button>
                    </div>
                  ))}
                  <button type="button" data-pin-add onClick={() => setEdit({ ...edit, pins: [...edit.pins, { id: uid(), label: '', pin: '' }] })} className="text-xs font-bold text-blue-700 min-h-[36px]">+ PIN hinzufügen</button>
                </div>
                <div className="flex flex-wrap justify-between gap-2 pt-1">
                  {!edit.isNew ? <button type="button" onClick={() => { const c = cards.find((x) => x.id === edit.id); setEdit(null); if (c) del(c); }} className="text-xs font-semibold text-rose-700 px-2 min-h-[36px]">Karte löschen</button> : <span />}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEdit(null)} className="px-3 min-h-[36px] text-xs font-semibold text-slate-600">Abbrechen</button>
                    <button type="button" data-pin-save onClick={save} className="px-4 min-h-[36px] rounded-lg bg-blue-600 text-white text-xs font-bold">Speichern</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      );
    }

    // ===== v76: gelöschte Kreditkarten aus Buchungen entfernen =====
    const RT_NO_CARD = 'Bar / Vor Ort ohne Karte';
    function rtDropCardRefs(trip, gone) {
      const bad = (n) => !!n && n !== RT_NO_CARD && gone(n); let n = 0;
      const fix = (o) => { if (o && bad(o.creditCard)) { n++; return { ...o, creditCard: '' }; } return o; };
      const out = { ...trip, flights: (trip.flights || []).map(fix), rentalCars: (trip.rentalCars || []).map(fix), stages: (trip.stages || []).map((s) => (s && s.hotel && bad(s.hotel.creditCard) ? (n++, { ...s, hotel: { ...s.hotel, creditCard: '' } }) : s)) };
      return n ? out : null;
    }

    // ===== v77: Kartenanzeige bei Hotels =====
    function RtCardChip({ name, cards, dark }) {
      const has = !!name && (name === RT_NO_CARD || (cards || []).some((c) => c.name === name));
      return has
        ? <span data-card-chip="ok" className={'inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold border ' + (dark ? 'bg-emerald-400/20 border-emerald-300/50 text-emerald-100' : 'bg-emerald-200 text-emerald-950 border-emerald-400')}><Ic n="card" />{name}</span>
        : <span data-card-chip="missing" className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold border bg-red-600 text-white border-red-700"><Ic n="warn" />Karte auswählen</span>;
    }

    // ===== v78: Hilfe, Start-Bildschirm, Sicherungs-Erinnerung =====
    const RT_HELP_KEY = 'rt_help_seen_v1', RT_BK_KEY = 'rt_last_backup', RT_FIRST_KEY = 'rt_first_seen', RT_SNOOZE_KEY = 'rt_backup_snooze';
    const rtLsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const rtLsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
    function rtMarkBackup() { rtLsSet(RT_BK_KEY, String(Date.now())); try { window.dispatchEvent(new Event('rt-backup')); } catch (e) {} }
    function rtOpenHelp() { try { window.dispatchEvent(new Event('rt-help')); } catch (e) {} }
    const RT_HELP = [
      ['Aufbau', 'Unten (am Laptop links) wählst du den Bereich: Planen, Buchen, Unterwegs, Optionen. Die Unterpunkte oben bleiben beim Scrollen stehen.'],
      ['Reise anlegen', 'Mit „Neue Reise“ führt dich der Assistent durch Reisedaten, Mitreisende und Etappen. Zum Ausprobieren gibt es die Demo-Reise.'],
      ['Planen', 'Etappen mit Hotel, Anreise, Stopps und Ausflügen. Der Tagesplan rechnet Fahrzeiten und Ankunft pro Tag, die Karte zeigt die ganze Route.'],
      ['Buchen', 'Hotels, Flüge und Mietwagen auf einen Blick. Ein Preis heißt „gebucht“. Rot markiert, was noch fehlt (zum Beispiel „Karte auswählen“). Karten, Notfallnummern und Koffer-PINs stehen unter „Karten & Notfall“, Kosten unter „Budget“.'],
      ['Unterwegs', 'Heute zeigt den Tag mit Hotel, Check-in und Navigation. „1-Klick Navi“ startet Google Maps oder Apple Karten. Dazu Wetter, Wechselkurs, Trinkgeld- und Tankrechner.'],
      ['Offline und Handy', 'Die App läuft ohne Netz. Auf dem Handy über das Browser-Menü „Zum Startbildschirm“ installieren und einmal mit Netz öffnen.'],
      ['Sichern', 'Deine Daten liegen auf dem Gerät. Sichere sie regelmäßig als Datei (Optionen > Daten & Sicherung) oder verbinde am Laptop eine Datei, zum Beispiel in Google Drive. Dann wird automatisch gespeichert.'],
      ['Hell und Dunkel', 'Die Darstellung wechselst du oben mit dem Sonne/Mond-Knopf. Die Handy- oder Laptop-Ansicht erkennt die App selbst (Optionen > Darstellung).'],
    ];
    function RtHelpHost({ hasTrip }) {
      const [open, setOpen] = useState(false);
      useEffect(() => { const h = () => setOpen(true); window.addEventListener('rt-help', h); return () => window.removeEventListener('rt-help', h); }, []);
      useEffect(() => { if (!hasTrip || rtLsGet(RT_HELP_KEY)) return; let t = 0, tries = 0; const go = () => { if (document.querySelector('.rt-dlg') && tries++ < 120) { t = setTimeout(go, 700); return; } setOpen(true); }; t = setTimeout(go, 1200); return () => clearTimeout(t); }, [hasTrip]);
      useEffect(() => { if (!open) return; const k = (e) => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [open]);
      const close = () => { rtLsSet(RT_HELP_KEY, '1'); setOpen(false); };
      if (!open) return null;
      return (
        <div data-readonly-allow className="fixed inset-0 z-[90] bg-slate-950/70 flex items-end sm:items-center justify-center sm:p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="rt-help-t" className="rt-help bg-white w-full sm:max-w-xl max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-slate-200 flex items-center justify-between gap-3"><h2 id="rt-help-t" className="text-lg font-extrabold text-slate-900">Erste Schritte</h2><button type="button" data-readonly-allow onClick={close} aria-label="Schließen" className="w-10 h-10 rounded-full border border-slate-300 text-slate-600">✕</button></div>
            <ol className="px-5 py-4 space-y-3 m-0 list-none">
              {RT_HELP.map(([t, x], i) => <li key={t} className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span><div><div className="text-sm font-bold text-slate-900">{t}</div><p className="text-sm text-slate-600 m-0">{x}</p></div></li>)}
            </ol>
            <div className="px-5 pb-5"><button type="button" data-readonly-allow onClick={close} className="w-full min-h-[48px] rounded-xl bg-blue-600 text-white font-bold">Verstanden</button><p className="text-xs text-slate-500 mt-2 mb-0 text-center">Diese Hilfe öffnest du jederzeit wieder mit dem Fragezeichen.</p></div>
          </section>
        </div>
      );
    }
    function RtBackupBar({ trip }) {
      const [, f] = useState(0); const fs = useFsSync();
      useEffect(() => { const h = () => f((x) => x + 1); window.addEventListener('rt-backup', h); return () => window.removeEventListener('rt-backup', h); }, []);
      useEffect(() => { if (!rtLsGet(RT_FIRST_KEY)) rtLsSet(RT_FIRST_KEY, String(Date.now())); }, []);
      if (IS_READ_ONLY_COPY || getDeviceMode() === 'readonly' || fs.status === 'connected') return null;
      if (!trip || !trip.meta || trip.meta.tripId === 'demo-florida-v1' || !(trip.stages || []).length) return null;
      const now = Date.now(), last = Number(rtLsGet(RT_BK_KEY)) || 0, first = Number(rtLsGet(RT_FIRST_KEY)) || now, snooze = Number(rtLsGet(RT_SNOOZE_KEY)) || 0;
      const base = last || first, days = Math.floor((now - base) / 864e5);
      if (now < snooze || days < (last ? 7 : 1)) return null;
      return (
        <div role="status" data-backup-bar className="rt-bkbar">
          <span>{last ? `Letzte Sicherung vor ${days} Tagen.` : 'Deine Reise ist noch nicht als Datei gesichert.'}</span>
          <button type="button" data-readonly-allow onClick={() => downloadTripFile(normalizeTrip(trip), 'roadtrip-daten.json')}>Jetzt sichern</button>
          <button type="button" data-readonly-allow className="ghost" onClick={() => { rtLsSet(RT_SNOOZE_KEY, String(Date.now() + 3 * 864e5)); f((x) => x + 1); }}>Später</button>
        </div>
      );
    }
    function RtGroupHead({ title, sub }) { return <div data-opt-group className="pt-2"><h2 className="text-xl font-extrabold text-slate-900 m-0">{title}</h2>{sub && <p className="text-sm text-slate-500 m-0">{sub}</p>}</div>; }

    // ===== v81: Routenart (Autobahn meiden, mautfrei, Fähren meiden) =====
    const RT_ROUTE_KEY = 'roadtrip_route_pref';
    const RT_ROUTE_MODES = [['fast', 'Schnellste Route', '', 'Standard des Routing-Dienstes'], ['nomotorway', 'Autobahn meiden', 'motorway', 'Landstraßen bevorzugt, meist langsamer'], ['notoll', 'Mautfrei', 'toll', 'Mautstraßen meiden'], ['noferry', 'Fähren meiden', 'ferry', 'Nur Strecken ohne Fähre']];
    const rtRoutePref = () => { const v = rtLsGet(RT_ROUTE_KEY); return RT_ROUTE_MODES.some((m) => m[0] === v) ? v : 'fast'; };
    const rtRouteLabel = (k) => (RT_ROUTE_MODES.find((m) => m[0] === k) || RT_ROUTE_MODES[0])[1];
    (function rtPatchFetch() {
      if (window.__rtFetchPatched) return; window.__rtFetchPatched = true; const orig = window.fetch.bind(window);
      window.fetch = async function (input, init) {
        let url = typeof input === 'string' ? input : (input && input.url) || '';
        if (!/router\.project-osrm\.org\/(route|table)\/v1\/driving\//.test(url)) return orig(input, init);
        let mode = null; url = url.replace(/&rtmode=([a-z]+)/, (m, g) => { mode = g; return ''; });
        if (!mode) mode = rtRoutePref();
        const cls = (RT_ROUTE_MODES.find((m) => m[0] === mode) || [])[2];
        if (!cls) return orig(url, init);
        try {
          const r = await orig(url + (url.includes('?') ? '&' : '?') + 'exclude=' + cls, init);
          if (r.ok) { const j = await r.clone().json().catch(() => null); if (j && j.code === 'Ok') return r; }
        } catch (e) { if (e && e.name === 'AbortError') throw e; }
        window.__rtRouteFallback = Date.now(); return orig(url, init);
      };
    })();
    function rtSetRoutePref(v) { rtLsSet(RT_ROUTE_KEY, v); try { window.dispatchEvent(new Event('rt-route-pref')); } catch (e) {} }
    function useRoutePref() { const [v, setV] = useState(rtRoutePref); useEffect(() => { const h = () => setV(rtRoutePref()); window.addEventListener('rt-route-pref', h); return () => window.removeEventListener('rt-route-pref', h); }, []); return v; }
    function RtRouteBar() {
      const v = useRoutePref();
      return (
        <section data-route-pref className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-base font-bold text-slate-900 m-0">Routenart</h3>
          <p className="text-xs text-slate-600 m-0">Gilt für neue Strecken- und Fahrzeitberechnungen sowie „Nächste Etappe finden“. Einzelne Etappen können eine eigene Routenart haben (bei der Strecke der Etappe).</p>
          <div role="radiogroup" aria-label="Routenart" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RT_ROUTE_MODES.map(([k, l, , d]) => <button key={k} type="button" role="radio" aria-checked={v === k} data-readonly-allow data-route-mode={k} onClick={() => rtSetRoutePref(k)} className={`text-left rounded-xl border px-3 py-2 min-h-[52px] ${v === k ? 'border-[#F2A044] bg-[#FFF5E6] ring-2 ring-[#F2A044]' : 'border-slate-300 bg-white'}`}><span className="block text-sm font-bold text-slate-900">{l}</span><span className="block text-xs text-slate-600">{d}</span></button>)}
          </div>
          <p className="text-xs text-slate-500 m-0">Nicht möglich: „nur Autobahn“ erzwingen und „am Meer entlang“. Der Routing-Dienst kennt dafür keine Option. Meidet er eine Strecke nicht (zum Beispiel keine Landstraße vorhanden), nutzt die App die Standardroute und weist darauf hin.</p>
        </section>
      );
    }
    function RtRouteInline() {
      const v = useRoutePref();
      return <label data-route-inline className="text-sm font-semibold block">Routenart <select data-readonly-allow value={v} onChange={(e) => rtSetRoutePref(e.target.value)} className="mt-1 w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 bg-white font-normal">{RT_ROUTE_MODES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>;
    }

    /* ===== v83: Etappen-Finder – Ort direkt auf der Karte wählen ===== */
    function sfKmBetween(a, b) { const R = 6371, r = Math.PI / 180, dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r; const x = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
    async function sfReverseName(lat, lon) {
      const j = await fetchJsonT(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=de&lat=${lat}&lon=${lon}`, 12000);
      const a = (j && j.address) || {};
      const n = a.city || a.town || a.village || a.municipality || a.hamlet || a.county || (j && j.name) || (j && j.display_name ? String(j.display_name).split(',')[0] : '');
      return { name: n || '', region: a.state || a.country || '' };
    }
    function SfPickMap({ startGps, startCity, mode, rng, dir, tol, onPick, pickLabel }) {
      const el = useRef(null), mapRef = useRef(null), layer = useRef(null), mk = useRef(null);
      const [org, setOrg] = useState(startGps || null); const [err, setErr] = useState('');
      const [pk, setPk] = useState(null); // {lat,lon,name,region,km,min,busy,approx}
      const maxKm = mode === 'km' ? rng[1] : rng[1] * 70, minKm = mode === 'km' ? rng[0] : rng[0] * 70;
      useEffect(() => { let on = true; if (!org && startCity) sfGeocode(startCity).then((g) => { if (!on) return; if (g) setOrg(g); else setErr('Startort nicht gefunden.'); }).catch(() => on && setErr('Startort konnte nicht geladen werden.')); return () => { on = false; }; }, []);
      useEffect(() => {
        if (!org || !window.L || !el.current) return; const L = window.L;
        const map = L.map(el.current, { zoomControl: true, scrollWheelZoom: true }).setView(org, 7);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap-Mitwirkende' }).addTo(map);
        mapRef.current = map; layer.current = L.layerGroup().addTo(map);
        map.on('click', (e) => pick(e.latlng.lat, e.latlng.lng));
        const t = setTimeout(() => map.invalidateSize(), 200); const onR = () => map.invalidateSize(); window.addEventListener('resize', onR);
        return () => { clearTimeout(t); window.removeEventListener('resize', onR); map.remove(); mapRef.current = null; };
      }, [org]);
      useEffect(() => {
        const L = window.L, map = mapRef.current; if (!L || !map || !org) return; layer.current.clearLayers();
        const blue = { color: '#1F4E8C', weight: 2, fillColor: '#1F4E8C', fillOpacity: 0.08 };
        const secs = dir && dir.length ? sfSectors(org, maxKm, dir, SF_TOL[tol]) : null;
        let bounds;
        if (secs) { secs.forEach((p) => L.polygon(p, blue).addTo(layer.current)); bounds = L.latLngBounds(secs.flat()); }
        else { const c = L.circle(org, { radius: maxKm * 1000, ...blue }).addTo(layer.current); bounds = c.getBounds(); }
        if (minKm > 0) L.circle(org, { radius: minKm * 1000, color: '#1F4E8C', weight: 2, dashArray: '6 6', fillColor: '#fff', fillOpacity: 0.55 }).addTo(layer.current);
        L.circleMarker(org, { radius: 9, color: '#173B6B', weight: 3, fillColor: '#fff', fillOpacity: 1 }).bindTooltip('Start: ' + (startCity || '')).addTo(layer.current);
        map.fitBounds(bounds, { padding: [20, 20] });
      }, [org, rng[0], rng[1], mode, (dir || []).join(), tol]);
      useEffect(() => {
        const L = window.L, map = mapRef.current; if (!L || !map) return; if (mk.current) { map.removeLayer(mk.current); mk.current = null; }
        if (pk) mk.current = L.circleMarker([pk.lat, pk.lon], { radius: 10, color: '#1F4E8C', weight: 3, fillColor: '#1F4E8C', fillOpacity: 1 }).addTo(map);
      }, [pk && pk.lat, pk && pk.lon]);
      const pickSeq = useRef(0);
      const pick = async (lat, lon) => {
        const id = ++pickSeq.current; const lin = sfKmBetween(org || [lat, lon], [lat, lon]);
        setPk({ lat, lon, name: '', region: '', km: lin * 1.3, min: lin * 1.3 / 70 * 60, busy: true, approx: true });
        let nm = { name: '', region: '' }, km = lin * 1.3, min = lin * 1.3 / 70 * 60, approx = true;
        try { nm = await sfReverseName(lat, lon); } catch (e) {}
        try { const j = await fetchJsonT(`https://router.project-osrm.org/route/v1/driving/${org[1]},${org[0]};${lon},${lat}?overview=false`, 15000); const r = j.routes && j.routes[0]; if (r) { km = r.distance / 1000; min = r.duration / 60; approx = false; } } catch (e) {}
        if (id === pickSeq.current) setPk({ lat, lon, name: nm.name, region: nm.region, km, min, busy: false, approx });
      };
      const out = pk && (pk.km < minKm * 0.9 || pk.km > maxKm * 1.6);
      if (err) return <div role="alert" className="text-sm rounded-lg bg-amber-50 border border-amber-300 text-amber-950 p-3">{err}</div>;
      return (
        <div data-sf-pick className="space-y-2">
          <div className="text-sm text-slate-700">Die Fläche zeigt deinen Suchbereich{minKm > 0 ? ' (gestrichelt: Mindestabstand)' : ''}{mode === 'h' ? ' – bei Fahrzeit grob mit 70 km/h umgerechnet' : ''}. <b>Tippe auf der Karte den Ort an, den du als Ziel willst.</b></div>
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
            {org ? <div ref={el} data-sf-pick-map className="w-full h-[320px] lg:h-[480px] bg-slate-100" role="img" aria-label="Karte mit Suchbereich" /> : <div className="h-[200px] flex items-center justify-center text-sm text-slate-500">Karte wird geladen …</div>}
            <div data-sf-pick-info className="px-3 py-2 text-sm border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              {!pk ? <span className="text-slate-500">Noch kein Ort gewählt.</span> : <>
                <span className="min-w-0"><b className="text-slate-900">{pk.busy ? 'Ort wird gesucht …' : (pk.name || 'Ort ohne Namen')}</b>{pk.region && !pk.busy ? <span className="text-slate-500"> · {pk.region}</span> : null}<br /><span className="text-xs text-slate-600">{Math.round(pk.km)} km · {sfFmtH(pk.min)}{pk.approx && !pk.busy ? ' (geschätzt, Routing nicht erreichbar)' : ''}{out && !pk.busy ? ' · außerhalb deines Suchbereichs' : ''}</span></span>
                <button type="button" data-readonly-allow data-sf-pick-take disabled={pk.busy || !pk.name} onClick={() => onPick({ id: `pick-${pk.lat.toFixed(4)}-${pk.lon.toFixed(4)}`, name: pk.name, lat: pk.lat, lon: pk.lon, km: pk.km, min: pk.min })} className="v18-btn pri disabled:opacity-50">{pickLabel || 'Übernehmen'}</button></>}
            </div>
          </div>
        </div>
      );
    }

    /* ===== v85: Entwurf vom Schritt-Assistenten übernehmen ===== */
    const RT_DRAFT_KEY = 'rt_draft_v1';
    function rtReadDraft() { try { const d = JSON.parse(localStorage.getItem(RT_DRAFT_KEY) || 'null'); return d && d.v === 1 && d.status === 'ready' && d.trip && d.trip.meta && Array.isArray(d.trip.stages) ? d : null; } catch (e) { return null; } }
    function rtSetDraftStatus(st) { try { const d = JSON.parse(localStorage.getItem(RT_DRAFT_KEY) || 'null'); if (d) { d.status = st; localStorage.setItem(RT_DRAFT_KEY, JSON.stringify(d)); } } catch (e) {} }
    const rtDraftRestore = () => { try { const p = localStorage.getItem('rt_draft_prev_v1'); if (p) { localStorage.setItem(RT_DRAFT_KEY, p); localStorage.removeItem('rt_draft_prev_v1'); } else localStorage.removeItem(RT_DRAFT_KEY); localStorage.removeItem('rt_edit_trip_v1'); } catch (e) {} };
    function RtDraftBar({ hasTrip, gate }) {
      const [, f] = useState(0); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
      useEffect(() => { const h = () => f((x) => x + 1); window.addEventListener('storage', h); window.addEventListener('focus', h); document.addEventListener('visibilitychange', h); return () => { window.removeEventListener('storage', h); window.removeEventListener('focus', h); document.removeEventListener('visibilitychange', h); }; }, []);
      const [note, setNote] = useState(() => { try { return sessionStorage.getItem('rt_after_adopt') || ''; } catch (e) { return ''; } });
      useEffect(() => {
        if (IS_READ_ONLY_COPY) return;
        if (location.hash === '#adopt' && !window.__rtAdopting) {
          const d0 = rtReadDraft(); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
          if (d0 && d0.replaceTripId) {
            if (gate || typeof window.__rtSaveTrip !== 'function' || window.__rtActiveTripId !== d0.replaceTripId) { setErr('Die geänderte Route gehört zu einer anderen Reise. Bitte zuerst zu dieser Reise wechseln und dann „Route übernehmen“ wählen.'); return; }
            window.__rtAdopting = true;
            (async () => { try { await window.__rtSaveTrip(normalizeTrip(JSON.parse(JSON.stringify(d0.trip))), 'Route übernommen'); rtDraftRestore(); setNote('updated'); } catch (e) { setErr(String(e && e.message || e).slice(0, 200)); } window.__rtAdopting = false; })();
            return;
          }
          if (d0 && typeof window.__rtAdoptDraft === 'function') {
            window.__rtAdopting = true; setBusy(true);
            (async () => { try { const trip = normalizeTrip(JSON.parse(JSON.stringify(d0.trip))); await window.__rtAdoptDraft(trip); rtSetDraftStatus('adopted'); try { sessionStorage.setItem('rt_after_adopt', hasTrip ? 'kept' : 'new'); } catch (e) {} location.reload(); } catch (e) { window.__rtAdopting = false; setBusy(false); setErr(String(e && e.message || e).slice(0, 200)); } })();
          }
          return;
        }
        if (note && note !== 'updated' && !gate) { try { sessionStorage.removeItem('rt_after_adopt'); } catch (e) {} let n = 0; const iv = setInterval(() => { if (++n > 6) { clearInterval(iv); return; } window.dispatchEvent(new CustomEvent('rt-status')); setTimeout(() => { if (document.querySelector('[data-plan-status]')) clearInterval(iv); }, 500); }, 900); return () => clearInterval(iv); }
      }, []);
      if (IS_READ_ONLY_COPY) return null;
      if (note === 'updated' && !gate) return <div role="status" data-draft-updated className="rt-bkbar"><span><b>Die geänderte Route ist übernommen.</b> Bitte Hotels und Buchungen der geänderten Etappen prüfen und die Strecken kontrollieren.</span><span className="inline-flex gap-2"><button type="button" data-draft-done-ok data-readonly-allow onClick={() => setNote('')}>OK</button></span></div>;
      if (note && !gate) return <div role="status" data-draft-done className="rt-bkbar"><span><b>Routen-Vorschlag als neue Reise angelegt.</b> {note === 'kept' ? 'Deine bisherige Reise liegt unter „Reise wechseln“. ' : ''}Der Planungsstand zeigt, bei welchen Etappen noch Hotel, Strecke oder Aktivitäten fehlen.</span><span className="inline-flex gap-2"><button type="button" data-draft-done-ok data-readonly-allow onClick={() => setNote('')}>OK</button></span></div>;
      if (!gate && !hasTrip) return null;
      const d = rtReadDraft(); if (!d) return null;
      const t = d.trip, n = (t.stages || []).length;
      const isRep = !!d.replaceTripId;
      const adopt = async () => {
        if (isRep) { if (gate || typeof window.__rtSaveTrip !== 'function' || window.__rtActiveTripId !== d.replaceTripId) { setErr('Bitte zuerst zu der Reise wechseln, zu der die Route gehört'); return; } try { await window.__rtSaveTrip(normalizeTrip(JSON.parse(JSON.stringify(t))), 'Route übernommen'); rtDraftRestore(); setNote('updated'); } catch (e) { setErr(String(e && e.message || e).slice(0, 200)); } return; }
        if (hasTrip && !(await window.rtAsk('Der Entwurf wird als neue Reise geöffnet. Deine aktuelle Reise bleibt erhalten und liegt danach unter „Gespeicherte Reisen“. Fortfahren?'))) return;
        setBusy(true); setErr('');
        try { const trip = normalizeTrip(JSON.parse(JSON.stringify(t))); await window.__rtAdoptDraft(trip); rtSetDraftStatus('adopted'); location.reload(); }
        catch (e) { setBusy(false); setErr(String(e && e.message || e).slice(0, 200)); }
      };
      const drop = async () => { if (isRep) { if ((await window.rtAsk('Geänderte Route verwerfen? Die Reise bleibt, wie sie ist.'))) { rtDraftRestore(); f((x) => x + 1); } return; } if ((await window.rtAsk('Entwurf verwerfen? Im Routen-Vorschlag bleiben deine Eingaben erhalten.'))) { rtSetDraftStatus('dismissed'); f((x) => x + 1); } };
      const body = <>
        <span data-draft-text><b>{isRep ? 'Geänderte Route liegt bereit:' : 'Routen-Vorschlag liegt bereit:'}</b> {t.meta.title || 'Ohne Titel'} · {n} Etappen · {t.meta.startDate} bis {t.meta.endDate}{err ? ` · Fehler: ${err}` : ''}</span>
        <span className="inline-flex gap-2"><button type="button" data-draft-adopt data-readonly-allow disabled={busy} onClick={adopt}>{busy ? 'Übernehme …' : (isRep ? 'Route übernehmen' : 'Als neue Reise übernehmen')}</button><button type="button" data-draft-drop data-readonly-allow disabled={busy} onClick={drop}>Verwerfen</button></span>
      </>;
      return gate
        ? <section data-draft-bar className="rounded-2xl border-2 border-blue-600 bg-white p-4 space-y-2 text-sm text-slate-900">{body}</section>
        : <div role="status" data-draft-bar className="rt-bkbar">{body}</div>;
    }

    /* ===== v91: Ortsergaenzung fuer alle Ortsfelder (data-place="city" | "addr") ===== */
    const RT_PICK_KEY = 'rt_place_pick_v1';
    const rtPickRead = () => { try { return JSON.parse(localStorage.getItem(RT_PICK_KEY) || '{}') || {}; } catch (e) { return {}; } };
    const rtPickGet = (name) => { const k = String(name || '').trim().toLowerCase(); if (!k) return null; const e = rtPickRead()[k]; return e && Array.isArray(e.g) ? e.g : null; };
    const rtPickPut = (name, gps) => { try { const k = String(name || '').trim().toLowerCase(); if (!k) return; const m = rtPickRead(); m[k] = { g: [Number(gps[0].toFixed(5)), Number(gps[1].toFixed(5))], t: Date.now() }; const ks = Object.keys(m); if (ks.length > 300) ks.sort((a, b) => m[a].t - m[b].t).slice(0, ks.length - 300).forEach((x) => delete m[x]); localStorage.setItem(RT_PICK_KEY, JSON.stringify(m)); localStorage.setItem('rt_place_last_v1', JSON.stringify(m[k].g)); } catch (e) {} };
    const RT_AC_KIND = { city: 'Stadt', town: 'Stadt', village: 'Ort', hamlet: 'Ort', suburb: 'Stadtteil', neighbourhood: 'Stadtteil', borough: 'Stadtteil', state: 'Bundesland', county: 'Landkreis', country: 'Land', island: 'Insel', aerodrome: 'Flughafen', hotel: 'Hotel', motel: 'Motel', guest_house: 'Pension', national_park: 'Nationalpark', attraction: 'Sehenswürdigkeit', beach: 'Strand', house: 'Adresse', street: 'Straße', car_rental: 'Autovermietung', parking: 'Parkplatz' };
    const RT_AC_NUMFIRST = { US: 1, CA: 1, GB: 1, AU: 1, NZ: 1, IE: 1, FR: 1 };
    function rtAcPhoton(f, mode) {
      const p = f.properties || {}, c = f.geometry && f.geometry.coordinates; if (!c) return null;
      const isAddr = p.type === 'house' || p.type === 'street';
      if (mode !== 'addr' && (isAddr || !p.name)) return null;
      const cc = String(p.countrycode || '').toUpperCase();
      const street = p.street || (p.type === 'street' ? p.name : '');
      const line = street ? (p.housenumber ? (RT_AC_NUMFIRST[cc] ? `${p.housenumber} ${street}` : `${street} ${p.housenumber}`) : street) : '';
      const city = p.city || p.town || p.village || (p.type === 'city' ? p.name : '') || p.county || '';
      const reg = p.state && p.state !== p.name ? p.state : p.country;
      const subs = []; if (mode === 'addr' && line && p.name && p.name !== street) subs.push(line);
      if (city && city !== p.name) subs.push(city); if (p.state && p.state !== p.name && p.state !== city) subs.push(p.state); if (p.country) subs.push(p.country);
      let value, name;
      if (mode === 'addr') {
        name = p.name && p.type !== 'street' && p.name !== street ? p.name : (line || p.name || '');
        const parts = []; if (line) parts.push(line); else if (p.name) parts.push(p.name);
        const cl = [p.postcode, city].filter(Boolean).join(' '); if (cl && cl !== parts[0]) parts.push(cl);
        if (p.state && p.state !== city && RT_AC_NUMFIRST[cc]) parts.push(p.state); if (p.country) parts.push(p.country);
        value = parts.join(', ');
      } else { name = p.name; value = p.name + (reg && reg !== p.name ? ', ' + reg : ''); }
      if (!name || !value) return null;
      return { value, name, sub: subs.join(', '), gps: [c[1], c[0]], kind: RT_AC_KIND[p.osm_value] || RT_AC_KIND[p.type] || '' };
    }
    function rtAcNom(j, mode) {
      const ad = j.address || {}, nm = j.name || String(j.display_name || '').split(',')[0];
      const reg = ad.state && ad.state !== nm ? ad.state : ad.country, subs = []; if (ad.state && ad.state !== nm) subs.push(ad.state); if (ad.country) subs.push(ad.country);
      const value = mode === 'addr' ? String(j.display_name || nm) : nm + (reg && reg !== nm ? ', ' + reg : '');
      return { value, name: nm, sub: subs.join(', '), gps: [Number(j.lat), Number(j.lon)], kind: RT_AC_KIND[j.type] || '' };
    }
    const RT_AC = { ul: null, input: null, items: [], idx: -1, seq: 0, timer: null, cache: {}, skip: false };
    const rtAcOk = (el) => !!(el && el.matches && el.matches('input[data-place]') && !el.disabled && !el.readOnly);
    async function rtAcFetch(q, mode, bias) {
      const ck = `${mode}|${q.toLowerCase()}|${bias ? bias.map((x) => x.toFixed(1)).join(',') : ''}`; if (RT_AC.cache[ck]) return RT_AC.cache[ck];
      let items = [];
      try {
        const j = await fetchJsonT(`https://photon.komoot.io/api/?limit=8&lang=de&q=${encodeURIComponent(q)}${bias ? `&lat=${bias[0].toFixed(2)}&lon=${bias[1].toFixed(2)}` : ''}`, 8000);
        items = ((j && j.features) || []).map((f) => rtAcPhoton(f, mode)).filter(Boolean);
      } catch (e) {
        try { const j = await fetchJsonT(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&addressdetails=1&accept-language=de&q=${encodeURIComponent(q)}`, 10000); items = (j || []).map((x) => rtAcNom(x, mode)); } catch (e2) { items = []; }
      }
      const seen = {}; items = items.filter((i) => { const k = `${i.value}|${i.gps[0].toFixed(1)}${i.gps[1].toFixed(1)}`; if (seen[k]) return false; seen[k] = 1; return true; }).slice(0, 6);
      RT_AC.cache[ck] = items; return items;
    }
    function rtAcHide() { if (RT_AC.ul) RT_AC.ul.hidden = true; RT_AC.idx = -1; if (RT_AC.input) RT_AC.input.setAttribute('aria-expanded', 'false'); }
    function rtAcRender() {
      if (!RT_AC.ul) { const u = document.createElement('ul'); u.className = 'rt-ac'; u.id = 'rt-ac-list'; u.setAttribute('role', 'listbox'); u.setAttribute('data-ac-list', ''); document.body.appendChild(u); RT_AC.ul = u; }
      const el = RT_AC.input; if (!el || !RT_AC.items.length || !document.body.contains(el)) { rtAcHide(); return; }
      const r = el.getBoundingClientRect(), w = Math.min(Math.max(r.width, 260), window.innerWidth - 16);
      RT_AC.ul.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + window.scrollX}px`; RT_AC.ul.style.top = `${r.bottom + window.scrollY + 2}px`; RT_AC.ul.style.width = `${w}px`;
      RT_AC.ul.textContent = '';
      RT_AC.items.forEach((it, i) => {
        if (it.map) { const lm = document.createElement('li'); lm.setAttribute('role', 'option'); lm.setAttribute('data-ac-map', ''); lm.setAttribute('aria-selected', String(i === RT_AC.idx)); lm.className = 'rt-ac-map'; const bm = document.createElement('b'); bm.textContent = '🗺 Auf der Karte wählen'; lm.appendChild(bm); const sm = document.createElement('small'); sm.textContent = 'Karte öffnen, klicken oder im Umkreis suchen'; lm.appendChild(sm); RT_AC.ul.appendChild(lm); return; }
        const li = document.createElement('li'); li.setAttribute('role', 'option'); li.setAttribute('data-ac-i', String(i)); li.setAttribute('aria-selected', String(i === RT_AC.idx));
        const b = document.createElement('b'); b.textContent = it.name; li.appendChild(b);
        if (it.kind) { const k = document.createElement('span'); k.className = 'rt-ac-kind'; k.textContent = ` · ${it.kind}`; li.appendChild(k); }
        if (it.sub) { const s = document.createElement('small'); s.textContent = it.sub; li.appendChild(s); }
        RT_AC.ul.appendChild(li);
      });
      RT_AC.ul.hidden = false; el.setAttribute('role', 'combobox'); el.setAttribute('aria-autocomplete', 'list'); el.setAttribute('aria-controls', 'rt-ac-list'); el.setAttribute('aria-expanded', 'true');
    }
    function rtAcSet(el, v) { const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value'); d.set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); }
    function rtAcGpsField(el) {
      let a = el.parentElement;
      for (let n = 0; a && n < 7; n++, a = a.parentElement) {
        const g = Array.from(a.querySelectorAll('input[placeholder^="GPS-Koordinaten"]')); if (!g.length) continue;
        if (g.length === 1) return g[0];
        return g.find((x) => el.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING) || null;
      }
      return null;
    }
    function rtAcPick(i) {
      const it = RT_AC.items[i], el = RT_AC.input; if (!it || !el) return;
      if (it.map) { rtAcHide(); RT_AC.items = []; if (window.RtOrt) window.RtOrt.openFor(el); return; }
      rtAcApply(el, it);
    }
    function rtAcApply(el, it) {
      const mode = el.getAttribute('data-place') || 'city';
      if (mode !== 'addr') rtPickPut(it.value, it.gps); else { try { localStorage.setItem('rt_place_last_v1', JSON.stringify(it.gps)); } catch (e) {} }
      RT_AC.skip = true; rtAcSet(el, it.value); RT_AC.skip = false; rtAcHide(); RT_AC.items = [];
      if (mode === 'addr') setTimeout(() => { const g = rtAcGpsField(el); if (g && !g.disabled && !g.readOnly) { RT_AC.skip = true; rtAcSet(g, `${it.gps[0].toFixed(5)},${it.gps[1].toFixed(5)}`); RT_AC.skip = false; } }, 80);
    }
    async function rtAcBias(el) {
      const near = (el.getAttribute('data-place-near') || '').trim();
      if (near) { const g = parseGps(near) || rtPickGet(near); if (g) return g; try { const x = await sfGeocode(near); if (x) return x; } catch (e) {} }
      try { const l = JSON.parse(localStorage.getItem('rt_place_last_v1') || 'null'); if (Array.isArray(l)) return l; } catch (e) {}
      return null;
    }
    if (!window.__rtAcInit) {
      window.__rtAcInit = true;
      document.addEventListener('input', (e) => {
        const el = e.target; if (RT_AC.skip || !rtAcOk(el)) return; RT_AC.input = el; clearTimeout(RT_AC.timer);
        const q = el.value.trim(); if (q.length < 3) { rtAcHide(); RT_AC.items = []; return; }
        const my = ++RT_AC.seq, mode = el.getAttribute('data-place') || 'city';
        RT_AC.timer = setTimeout(async () => { const bias = await rtAcBias(el); const items = await rtAcFetch(q, mode, bias); if (my !== RT_AC.seq || document.activeElement !== el) return; RT_AC.items = window.RtOrt ? items.concat([{ map: true }]) : items; RT_AC.idx = -1; rtAcRender(); }, 300);
      });
      document.addEventListener('keydown', (e) => {
        const el = e.target; if (!rtAcOk(el) || !RT_AC.ul || RT_AC.ul.hidden || !RT_AC.items.length) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); RT_AC.idx = RT_AC.idx < 0 && e.key === 'ArrowUp' ? RT_AC.items.length - 1 : (RT_AC.idx + (e.key === 'ArrowDown' ? 1 : -1) + RT_AC.items.length) % RT_AC.items.length; rtAcRender(); }
        else if (e.key === 'Enter' && RT_AC.idx >= 0) { e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation(); rtAcPick(RT_AC.idx); }
        else if (e.key === 'Escape') { e.stopPropagation(); rtAcHide(); }
      }, true);
      const pick = (e) => { const li = e.target.closest && e.target.closest('#rt-ac-list [data-ac-i]'); if (li) { e.preventDefault(); rtAcPick(Number(li.getAttribute('data-ac-i'))); return; } const mp = e.target.closest && e.target.closest('#rt-ac-list [data-ac-map]'); if (mp) { e.preventDefault(); rtAcPick(RT_AC.items.length - 1); } };
      document.addEventListener('mousedown', pick);
      
      document.addEventListener('focusout', (e) => { if (rtAcOk(e.target)) { const t = e.target; setTimeout(() => { if (document.activeElement !== t) rtAcHide(); }, 200); } });
      document.addEventListener('scroll', () => { if (RT_AC.ul && !RT_AC.ul.hidden) rtAcRender(); }, { passive: true, capture: true });
      window.addEventListener('resize', () => { if (RT_AC.ul && !RT_AC.ul.hidden) rtAcRender(); });
    }
    /* v91: Etappenkette nach Verschieben/Loeschen neu aufbauen (Datum, Startorte) */
    const rtRechain = (stages, meta, firstFrom, staleIdx) => {
      const nn = (s) => Math.max(0, parseInt(s.nights, 10) || 0);
      const iso = /^\d{4}-\d{2}-\d{2}$/.test((meta || {}).startDate || '') ? meta.startDate : null; let cur = iso;
      return stages.map((s, i) => {
        const o = { ...s };
        if (i === 0) { if (firstFrom) o.fromCity = firstFrom; } else if (stages[i - 1].toCity) o.fromCity = stages[i - 1].toCity;
        if (cur) { const end = isoAdd(cur, nn(s)); const nr = wzRange(cur, end); o.dateRange = String(s.dateRange || '').startsWith(nr) ? s.dateRange : nr; cur = end; }
        if ((staleIdx || []).includes(i) && o.routeToHotel && (o.routeToHotel.distanceKm || o.routeToHotel.duration)) o.routeToHotel = { ...o.routeToHotel, distanceKm: '', duration: '' };
        return o;
      });
    };
    /* ===== v96: Koordinaten der Etappenorte in der Reise (toGps) + Rueckweg in den Routen-Vorschlag ===== */
    const rtNormName = (x) => String(x || '').trim().toLowerCase();
    const rtStageGps = (s) => { if (!s) return null; const g = parseGps(s.toGps || ''); if (g && rtNormName(s.toGpsFor) === rtNormName(s.toCity)) return g; return null; };
    const rtGeoFail = {};
    function RtGeoFill({ trip, onSave }) {
      const latest = useRef(trip); latest.current = trip;
      const sig = (trip.stages || []).map((s) => `${s.id}|${s.toCity}|${s.toGps || ''}|${s.toGpsFor || ''}`).join(';');
      useEffect(() => {
        const stages = trip.stages || [], mem = {};
        stages.forEach((s) => { const g = rtStageGps(s); if (g) mem[rtNormName(s.toCity)] = g; });
        window.__rtTripGeo = mem;
        if (IS_READ_ONLY_COPY) return;
        const idx = stages.findIndex((s) => String(s.toCity || '').trim() && !rtStageGps(s) && !rtGeoFail[rtNormName(s.toCity)]);
        if (idx < 0) return;
        let dead = false; const s = stages[idx], name = String(s.toCity).trim();
        const put = (g) => { if (dead || !g) return; const now = latest.current, cur = now.stages || []; const k = cur.findIndex((x) => x.id === s.id); if (k < 0 || String(cur[k].toCity || '').trim() !== name) return; onSave({ ...now, stages: cur.map((x, i) => i === k ? { ...x, toGps: `${g[0].toFixed(5)},${g[1].toFixed(5)}`, toGpsFor: x.toCity } : x) }, ''); };
        const known = rtPickGet(name) || mem[rtNormName(name)];
        const t = setTimeout(async () => {
          if (known) { put(known); return; }
          if (!navigator.onLine) return;
          try { const g = await sfGeocode(name); if (g) put(g); else rtGeoFail[rtNormName(name)] = 1; } catch (e) { rtGeoFail[rtNormName(name)] = 1; }
        }, known ? 400 : 1300);
        return () => { dead = true; clearTimeout(t); };
      }, [sig]);
      return null;
    }
    function RtRouteEdit({ trip }) {
      const n = (trip.stages || []).length; if (IS_READ_ONLY_COPY || n < 1) return null;
      const go = () => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test((trip.meta || {}).startDate || '')) { window.rtNotice('Die Reise braucht ein Startdatum. Bitte zuerst unter „Reise & Zeitraum ändern“ eintragen.'); return; }
        try { localStorage.setItem('rt_edit_trip_v1', JSON.stringify(trip)); } catch (e) { window.rtNotice('Die Reise konnte nicht übergeben werden (Speicher voll).'); return; }
        location.href = 'assistent.html#edit';
      };
      return (
        <div data-route-edit-box className="v18-edit-only no-print rounded-2xl border border-slate-200 bg-white p-3 flex flex-wrap items-center gap-3 text-sm">
          <button type="button" data-route-edit onClick={go} className="v18-btn">Route auf der Karte bearbeiten</button>
          <span className="text-slate-700">Etappen verschieben, Stopps setzen und die Richtung prüfen. Hotels und Buchungen unveränderter Etappen bleiben erhalten.</span>
        </div>
      );
    }

    /* ===== v98: gemeinsamer Baustein "Ort wählen" (ortwahl.js) ===== */
    if (window.RtOrt && !window.__rtOrtInit) {
      window.__rtOrtInit = true;
      window.RtOrt.attach({
        selector: 'input[data-place]',
        opts: async (el) => {
          const mode = el.getAttribute('data-place') || 'city', nearTxt = (el.getAttribute('data-place-near') || '').trim(), cur = el.value.trim();
          let near = null; if (nearTxt) { near = parseGps(nearTxt) || rtPickGet(nearTxt) || (window.__rtTripGeo || {})[rtNormName(nearTxt)] || null; if (!near) { try { near = await sfGeocode(nearTxt); } catch (e) { near = null; } } }
          let gps = null; if (mode === 'addr') { const gf = rtAcGpsField(el); gps = gf ? parseGps(gf.value || '') : null; } else if (cur) gps = rtPickGet(cur) || (window.__rtTripGeo || {})[rtNormName(cur)] || null;
          let center = null; try { const l = JSON.parse(localStorage.getItem('rt_place_last_v1') || 'null'); if (Array.isArray(l)) center = l; } catch (e) {}
          return { mode, near, nearLabel: nearTxt && !parseGps(nearTxt) ? nearTxt.split(',')[0] : (near ? 'dem Etappenort' : ''), gps, center };
        },
        onPick: (el, it) => { rtAcHide(); RT_AC.items = []; rtAcApply(el, it); },
      });
    }
    async function sfPickOpen({ from, startGps, startCity, mode, rng, dir, tol, onPick }) {
      if (!window.RtOrt) { window.rtNotice('Die Kartenwahl konnte nicht geladen werden. Bitte die Seite neu laden.'); return; }
      let org = startGps || null; if (!org && startCity) { try { org = await sfGeocode(startCity); } catch (e) { org = null; } }
      if (!org) { window.rtNotice('Der Startort der Etappe wurde nicht gefunden. Ohne Internet ist die Kartenwahl nicht möglich.'); return; }
      const maxKm = mode === 'km' ? rng[1] : rng[1] * 70, minKm = mode === 'km' ? rng[0] : rng[0] * 70;
      const res = await window.RtOrt.pick({ mode: 'city', title: 'Nächstes Etappenziel wählen', near: org, nearLabel: String(startCity || 'dem Startort').split(',')[0], radiusKm: maxKm, minKm,
        onMap: (map, L) => {
          const blue = { color: '#1F4E8C', weight: 2, fillColor: '#1F4E8C', fillOpacity: 0.08, interactive: false };
          const secs = dir && dir.length ? sfSectors(org, maxKm, dir, SF_TOL[tol]) : null; let bounds;
          if (secs) { secs.forEach((pg) => L.polygon(pg, blue).addTo(map)); bounds = L.latLngBounds(secs.flat()); } else { bounds = L.circle(org, { radius: maxKm * 1000, ...blue }).addTo(map).getBounds(); }
          if (minKm > 0) L.circle(org, { radius: minKm * 1000, color: '#1F4E8C', weight: 2, dashArray: '6 6', fillColor: '#fff', fillOpacity: 0.55, interactive: false }).addTo(map);
          L.circleMarker(org, { radius: 9, color: '#173B6B', weight: 3, fillColor: '#fff', fillOpacity: 1, interactive: false }).addTo(map);
          map.fitBounds(bounds, { padding: [20, 20] });
        } });
      if (!res) return;
      const lin = sfKmBetween(org, res.gps); let km = lin * 1.3, min = lin * 1.3 / 70 * 60;
      try { const j = await fetchJsonT(`https://router.project-osrm.org/route/v1/driving/${org[1]},${org[0]};${res.gps[1]},${res.gps[0]}?overview=false`, 15000); const r = j.routes && j.routes[0]; if (r) { km = r.distance / 1000; min = r.duration / 60; } } catch (e) {}
      rtPickPut(res.name, res.gps);
      onPick(from, { id: `pick-${res.gps[0].toFixed(4)}-${res.gps[1].toFixed(4)}`, name: res.name, lat: res.gps[0], lon: res.gps[1], km, min });
    }

    /* ===== v99: Planungsstand (ersetzt Schritt 4 und 5 des Assistenten) ===== */
    const rtPlanStats = (trip) => {
      const st = (trip && trip.stages) || [], meta = (trip && trip.meta) || {}, nn = (s) => Math.max(0, parseInt(s.nights, 10) || 0), tx = (v) => String(v == null ? '' : v).trim(), ph = (v) => /^(neues ziel|neues hotel( eintragen)?|ziel offen|hotel offen)$/i.test(tx(v)), real = (v) => (ph(v) ? '' : tx(v));
      const rows = st.map((s, i) => {
        const n = nn(s), same = tx(s.fromCity).toLowerCase() === tx(s.toCity).toLowerCase() && !!real(s.toCity), named = !!real(s.toCity);
        const hotelNeed = n > 0, hotel = !!real((s.hotel || {}).name), routeNeed = !same, route = named && !!tx((s.routeToHotel || {}).distanceKm), acts = (s.localAttractions || []).length;
        return { id: s.id, i, from: tx(s.fromCity) || (i === 0 ? 'Start' : '?'), to: real(s.toCity) || 'Ziel offen', n, ret: rtIsRet(st, i), named, hotelNeed, hotel, hotelName: real((s.hotel || {}).name), routeNeed, route, km: tx((s.routeToHotel || {}).distanceKm), acts, actsNeed: n > 0, open: (!named ? 1 : 0) + (hotelNeed && !hotel ? 1 : 0) + (routeNeed && !route ? 1 : 0) };
      });
      const hN = rows.filter((r) => r.hotelNeed).length, hOk = rows.filter((r) => r.hotelNeed && r.hotel).length, rN = rows.filter((r) => r.routeNeed).length, rOk = rows.filter((r) => r.routeNeed && r.route).length, aN = rows.filter((r) => r.actsNeed).length, aOk = rows.filter((r) => r.actsNeed && r.acts > 0).length;
      const datesOk = wzOk(meta.startDate) && wzOk(meta.endDate) && meta.endDate >= meta.startDate, days = datesOk ? tripDayCount(meta.startDate, meta.endDate) : 0, sum = rows.reduce((a, r) => a + r.n, 0), nightsOk = datesOk && sum === days - 1;
      const open = rows.reduce((a, r) => a + r.open, 0) + (datesOk ? 0 : 1) + (datesOk && !nightsOk ? 1 : 0);
      const short = !st.length ? '' : hOk < hN ? `${hOk} von ${hN} Etappen mit Hotel` : rOk < rN ? `${rOk} von ${rN} Strecken ermittelt` : (!datesOk || !nightsOk) ? 'Zeitraum prüfen' : aOk < aN ? `${aOk} von ${aN} Etappen mit Aktivitäten` : 'Alles Wichtige ist eingetragen';
      return { rows, hN, hOk, rN, rOk, aN, aOk, datesOk, days, sum, nightsOk, open, short, flights: ((trip && trip.flights) || []).length, cars: ((trip && trip.rentalCars) || []).length };
    };
    function RtPlanStatus({ trip, goTab }) {
      const S = rtPlanStats(trip), meta = trip.meta || {}, n = S.rows.length;
      const jump = (id, step) => window.dispatchEvent(new CustomEvent('rt-stage-open', { detail: { stageId: id, step } }));
      const frame = () => window.dispatchEvent(new CustomEvent('rt-wizard', { detail: { step: 'frame' } }));
      if (!n) return (
        <section data-plan-status data-wizard-card className="v18-edit-only no-print rounded-2xl border border-[#BCCDE6] bg-[#F5F8FC] p-4 space-y-3">
          <h2 className="text-base font-bold text-slate-900">Neue Reise planen</h2>
          <p className="text-sm text-slate-700">Die Reise hat noch keine Etappen. Lass dir eine Route vorschlagen oder trage Zeitraum und Etappen selbst ein.</p>
          <div className="flex flex-wrap gap-2"><a href="assistent.html" data-open-assistant-plan className="v18-btn pri no-underline">Route vorschlagen lassen</a><button type="button" data-wizard-card-open onClick={() => window.dispatchEvent(new CustomEvent('rt-wizard'))} className="v18-btn">Reise selbst einrichten</button></div>
        </section>
      );
      const chip = (ok, need, label, val, onClick, key) => {
        const cls = !need ? 'border-slate-200 bg-slate-50 text-slate-600' : ok ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-amber-500 bg-amber-50 text-amber-950 font-semibold';
        return <button key={key} type="button" data-readonly-allow data-status-chip={key} data-state={!need ? 'na' : ok ? 'ok' : 'todo'} onClick={onClick} className={`min-h-[36px] px-3 rounded-full border text-xs text-left ${cls}`}><span className="font-semibold">{label}:</span> {val}</button>;
      };
      const gen = [
        { k: 'dates', ok: S.datesOk, t: S.datesOk ? `Zeitraum ${wzDM(meta.startDate)} – ${wzDM(meta.endDate)}${meta.endDate.slice(0, 4)} (${S.days} Tage)` : 'Reisezeitraum fehlt', fix: frame, opt: false },
        { k: 'nights', ok: S.nightsOk, t: !S.datesOk ? 'Nächte: erst den Zeitraum eintragen' : S.nightsOk ? `${S.sum} Nächte passen zum Zeitraum` : `Etappen haben ${S.sum} Nächte, der Zeitraum hat ${S.days - 1}`, fix: frame, opt: false },
        { k: 'flight', ok: S.flights > 0, t: S.flights > 0 ? `${S.flights} ${S.flights === 1 ? 'Flug' : 'Flüge'} eingetragen` : 'Kein Flug eingetragen', fix: () => goTab('basics'), opt: true },
        { k: 'car', ok: S.cars > 0, t: S.cars > 0 ? 'Mietwagen eingetragen' : 'Kein Mietwagen eingetragen', fix: () => goTab('basics'), opt: true },
      ];
      const pct = Math.round(100 * (S.hOk + S.rOk) / Math.max(1, S.hN + S.rN));
      return (
        <section data-plan-status className="no-print rounded-2xl border border-[#BCCDE6] bg-[#F5F8FC] p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-[220px] flex-1">
              <h2 className="text-base font-bold text-slate-900">Planungsstand</h2>
              <p className="text-sm text-slate-800" data-status-summary><b>{S.hOk} von {S.hN}</b> Etappen mit Hotel · <b>{S.rOk} von {S.rN}</b> Strecken · <b>{S.aOk} von {S.aN}</b> mit Aktivitäten</p>
              <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Hotels und Strecken eingetragen"><div className="h-full bg-[#1F4E8C]" style={{ width: `${pct}%` }} /></div>
            </div>
            <button type="button" data-status-frame onClick={frame} className="v18-btn v18-edit-only">Reise &amp; Zeitraum ändern</button>
          </div>
          <ul className="flex flex-wrap gap-2" data-status-general>
            {gen.map((g) => <li key={g.k}><button type="button" data-readonly-allow data-status-gen={g.k} data-state={g.ok ? 'ok' : g.opt ? 'hint' : 'todo'} onClick={g.fix} className={`min-h-[36px] px-3 rounded-full border text-xs ${g.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : g.opt ? 'border-slate-300 bg-white text-slate-700' : 'border-amber-500 bg-amber-50 text-amber-950 font-semibold'}`}>{g.ok ? 'Erledigt: ' : g.opt ? 'Offen (falls nötig): ' : 'Fehlt: '}{g.t}</button></li>)}
          </ul>
          <details data-status-list open={S.rows.some((r) => r.open > 0)}>
            <summary className="cursor-pointer text-sm font-semibold text-slate-900 min-h-[36px] flex items-center">{S.rows.some((r) => r.open > 0) ? `Etappen im Einzelnen: bei ${S.rows.filter((r) => r.open > 0).length} fehlt noch etwas` : 'Etappen im Einzelnen: Hotels und Strecken sind vollständig'}</summary>
            <ol className="mt-2 space-y-1.5">
              {S.rows.map((r) => (
                <li key={r.id} data-status-row={r.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-900 flex-1 min-w-[200px]"><b>{r.i + 1}. {r.from} → {r.to}</b><span className="text-slate-600"> · {r.ret ? 'Rückreise, keine Übernachtung' : `${r.n} ${r.n === 1 ? 'Nacht' : 'Nächte'}`}</span></span>
                  {chip(r.route, r.routeNeed, 'Strecke', !r.routeNeed ? 'nicht nötig' : r.route ? r.km : 'fehlt', () => jump(r.id, 'way'), 'way')}
                  {chip(r.hotel, r.hotelNeed, 'Hotel', !r.hotelNeed ? 'nicht nötig' : r.hotel ? r.hotelName : 'fehlt', () => jump(r.id, 'hotel'), 'hotel')}
                  {chip(r.acts > 0, false, 'Vor Ort', r.acts > 0 ? `${r.acts} ${r.acts === 1 ? 'Aktion' : 'Aktionen'}` : (r.actsNeed ? 'noch nichts geplant' : 'nicht nötig'), () => jump(r.id, 'do'), 'do')}
                </li>
              ))}
            </ol>
          </details>
        </section>
      );
    }
    function RtSideStatus({ trip }) {
      const n = (trip.stages || []).length;
      if (!n) return <button type="button" data-wizard-open onClick={() => window.dispatchEvent(new CustomEvent('rt-wizard'))} className="v18-btn pri v18-edit-only w-full justify-center">Reise einrichten</button>;
      const S = rtPlanStats(trip);
      return <button type="button" data-status-open data-readonly-allow onClick={() => window.dispatchEvent(new CustomEvent('rt-status'))} className="v18-btn pri w-full justify-center" style={{ height: 'auto', minHeight: 44, paddingTop: 6, paddingBottom: 6 }}><span className="text-center leading-tight"><span className="block">Planungsstand</span><span className="block text-[11px] font-normal opacity-90" data-status-short>{S.short}</span></span></button>;
    }

    