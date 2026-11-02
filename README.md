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
