# Roadtrip-Planer v15: Programm und Daten getrennt

## Dateien
- `index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`: das Programm (enthält KEINE Reisedaten)
- `roadtrip-daten.json`: deine Reisedaten (nicht ins Internet stellen, sondern nach Google Drive)

> Wichtig: `roadtrip-daten.json` ist der Stand der Datei v14. Hast du in v14 danach noch am Laptop geändert,
> exportiere dort zuerst unter „Offline-Tresor & Cloud“ die Daten als JSON und nimm diese Datei statt der mitgelieferten.

## 1. Programm online stellen (GitHub Pages, einmalig)
1. Account auf github.com anlegen (kostenlos).
2. Oben rechts „+“ → „New repository“. Name z. B. `roadtrip`. Sichtbarkeit **Public**. „Create repository“.
3. „uploading an existing file“ anklicken und diese 5 Dateien hochziehen: `index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`.
   (NICHT `roadtrip-daten.json` hochladen.) „Commit changes“.
   Hinweis: `index.html` ist ca. 5,7 MB groß, das ist für GitHub in Ordnung.
4. Im Repository: Settings → Pages → „Deploy from a branch“ → Branch `main`, Ordner `/ (root)` → Save.
5. Nach 1–2 Minuten steht dort der Link, z. B. `https://DEINNAME.github.io/roadtrip/`.

Updates später: im Repository `index.html` (und ggf. weitere Dateien) neu hochladen und ersetzen.
Die Handys holen sich die neue Version automatisch, sobald sie online sind.

## 2. Daten nach Google Drive
`roadtrip-daten.json` in einen Drive-Ordner legen. Mit „Google Drive für Desktop“ liegt der Ordner auch als normaler Ordner auf dem Laptop.

## 3. Laptop (Planung), Chrome oder Edge
1. Link öffnen. Es erscheint der Startbildschirm.
2. „Datei verbinden“ und die `roadtrip-daten.json` im Drive-Ordner wählen.
3. Ab jetzt wird jede Änderung automatisch in diese Datei zurückgeschrieben (und über Drive synchronisiert).
4. Nach einem Browser-Neustart einmal unter „Offline-Tresor & Cloud“ → „Verbindung erneuern“ klicken (Sicherheitsabfrage von Chrome).
5. Optional: In Chrome oben rechts „App installieren“.

## 4. Handys (Nur lesen)
1. Link im Browser öffnen (iPhone: Safari, Android: Chrome).
2. „Reisedaten-Datei laden“ → „Datei auswählen“ → Google Drive → `roadtrip-daten.json`. Häkchen „Nur lesen“ bleibt gesetzt.
3. Danach „Zum Home-Bildschirm“ hinzufügen:
   - iPhone: Teilen-Symbol → „Zum Home-Bildschirm“
   - Android: Menü (⋮) → „App installieren“ / „Zum Startbildschirm“
4. Wichtig: Die App einmal mit Internet öffnen, damit sie sich offline speichert. Danach läuft sie auch ohne Netz.
5. Nach Planänderungen: „Offline-Tresor & Cloud“ → „Datendatei neu laden“ und die aktuelle Datei aus Drive wählen.

## Grenzen
- Karte, Kartenkacheln, Wikipedia-Vorschläge und Routenberechnung brauchen Internet. Alles andere läuft offline.
- Dokumente (PDF/Fotos) bleiben im jeweiligen Browser und sind nicht in der JSON-Datei. Auf den Handys also eigene Kopien der Tickets speichern.
- Handy-Daten werden nicht automatisch aktualisiert, sondern per „Datendatei neu laden“.
- Lösche auf einem Handy nicht die Browser-/Website-Daten, sonst muss die Datei neu geladen werden.

## Neu in v16
1. Dokumente in der Datei
   Organisation → Dokumente: hochgeladene PDFs/Fotos werden zusammen mit den Reisedaten in roadtrip-daten.json gespeichert (am Laptop automatisch, wenn die Datei verbunden ist).
   Auf den Handys kommen die Dokumente mit „Datendatei neu laden“ und liegen danach offline vor. Dort kannst du sie nur ansehen.
   Ohne verbundene Datei: Offline-Tresor & Cloud → „Daten + Dokumente als JSON speichern“.
   Dokumente aus v15 (nur lokal im Browser) werden beim nächsten Speichern in die Datei übernommen, sobald du am Laptop etwas änderst oder „Jetzt speichern“ klickst.
2. Mehrere Reisen
   Offline-Tresor & Cloud → „Meine Reisen“: zeigt die geöffnete Reise und alle weiteren auf diesem Gerät.
   „Wechseln“ sichert die aktuelle Reise samt Dokumenten und öffnet die andere.
   „Reise aus Datei laden“: andere Reisedatei aus Drive öffnen. Gehört die Datei zur selben Reise, ersetzt sie deren Stand (so holst du Änderungen aufs Handy); sonst wird eine zweite Reise angelegt.
   Laptop: „Reise per Datei verbinden“ verbindet die Datei der Reise für automatisches Speichern. Jede Reise merkt sich ihre eigene Datei.
   Eine Reise = eine JSON-Datei, z. B. roadtrip-florida.json, roadtrip-kanada.json in Drive.
   Auf einem leeren Gerät oder nach „Neue / andere Reise“ erscheint der Startbildschirm mit der Liste der gespeicherten Reisen.
3. Update
   Programm-Update wie gehabt: index.html (und sw.js) im GitHub-Repository ersetzen. Reisen und Dokumente auf den Geräten bleiben erhalten.
