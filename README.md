# Roadtrip-Planer

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

## Neu in v17 (Online-Funktionen)
1. Wetter: Vorhersage pro Etappenort und Tag (Open-Meteo, bis 16 Tage voraus), mit Regenwahrscheinlichkeit, Wind, UV. An der Küste zusätzlich Wassertemperatur und Wellenhöhe (bis 8 Tage voraus). Das        Wetter steht auch in Tagesplan und Heute. Zuletzt geladene Daten bleiben offline gespeichert. Liegt die Reise weiter als 16 Tage entfernt, zeigt die App eine Vorschau der nächsten Tage am Ort.
2. Unterwegs:
   Wo bin ich: Standort per GPS (funktioniert auch offline), Entfernung und grobe Fahrzeit zum Hotel und zu den nächsten Zielen, Navi-Button. „Genaue Fahrzeit“ rechnet online.
   In der Nähe: Tankstelle, Supermarkt, Apotheke, Toilette, Essen, Geldautomat um deinen Standort oder ein Hotel (OpenStreetMap).
3. Wechselkurs: aktueller EUR/USD-Kurs (EZB), Umrechner, Übernahme als Budget-Kurs (nur am Laptop).
4. Organisation → Teilen: erzeugt einen Link mit einem Kompaktplan (ohne Preise, Kreditkarten, Notizen, Dokumente), optional mit Notfallnummern und Buchungscodes. Wer den Link öffnet, kann den Plan als     Reise übernehmen (nur lesen). Zusätzlich ein QR-Code zur App. Der Link ist etwa 8.000–9.000 Zeichen lang, ein QR-Code für den ganzen Plan ist zu klein dafür.
   Die Tab-Nummern haben sich verschoben (jetzt 12 Tabs).
5. Entfernt: ein fremdes Statistik-Skript von Cloudflare, das in der Originaldatei steckte und bei jedem Start eine Verbindung aufbaute.
Hinweis: Die Server von OpenStreetMap, Open-Meteo, Frankfurter und OSRM sind kostenlose Dienste ohne Zusage. Fallen sie aus, zeigt die App eine Meldung und läuft sonst normal weiter.

## Neu in v18 – neues Layout
1. 5 Bereiche statt 12 Tabs: Heute · Planen (Etappen, Tagesplan, Karte) · Buchungen & Budget (Flug & Mietwagen, Karten & Notfall, Budget) · Unterwegs (Wo bin ich, 1-Klick Navi, Wetter, US-Tools) · Mehr     (Organisation, Reisen & Daten).
2. Am Laptop: Seitenleiste links mit Reisetitel, Countdown, Speicherstatus und „Reise wechseln“. Am Handy: untere Leiste mit genau 5 Punkten.
3. Heute: Tageschips zum Wischen, Karte „Als Nächstes“ mit Navigation, darunter der Tagesablauf.
4. Etappen sind beim Öffnen eingeklappt; ein Klick auf die Übersicht öffnet die Etappe.
5. Reisen & Daten: Reisen und Datei-Verbindung oben, Sicherungen/Export unter „Erweitert“.
6. Behoben: leere Leiste und fehlende Etappen-Übersicht im Nur-Lesen-Modus am Handy, mehrzeilige Tagesauswahl.

## Neu in v19 – ruhigere Optik (Farbe: edles Blau)
Einheitliche Farben: weiße Karten, Blau als Akzent; Rot/Gelb/Grün nur noch als Signalfarben.
Etappen-Köpfe und Zeitstrahl hell statt dunkelblau; Budget-Kacheln neutral, nur die Gesamtsumme hervorgehoben.
Weniger Emojis in Überschriften und Buttons (Wetter-, Kategorie- und Karten-Symbole bleiben).
Einheitliche Buttons (Blau), keine Monospace-Schrift, Mindestschrift 11 px, Reisetitel und Datum in der Seitenleiste getrennt.
Update wie gehabt: index.html und sw.js ersetzen (Cache roadtrip-v19).

## Neu in v20 – Startassistent und Etappen-Finder
Startassistent: Das Enddatum kann nicht vor dem Startdatum liegen. Alternativ gibst du die Anzahl der Reisetage ein, das Enddatum wird berechnet (und umgekehrt). Bei der Zahl der Reisenden erscheinen gleich Namensfelder; leere Felder werden „Reisende 1, 2 …“.
Nächste Etappe finden (Planen → Etappen): Wähle die Etappe, von der du startest, und begrenze nach Entfernung (km) oder Fahrzeit (Std.), optional mit Mindestwert. Die App schlägt Städte vor, die dazu passen (OpenStreetMap, Fahrstrecken über OSRM; Internet nötig). „Übernehmen“ trägt Zielort, Strecke, Fahrzeit und GPS in die folgende Etappe ein, oder legt eine neue an. Danach beliebig oft für die nächste Etappe wiederholen.
Der GPS-Punkt ist der Ortsmittelpunkt, nicht das Hotel – bitte später durch die Hoteladresse ersetzen.

## v21
Etappen-Finder robuster: Die Ortssuche fragt zuerst nur Städte mit Einwohnerzahl ab (schnell, auch bei 300 km Radius), dann bei Bedarf alle Großstädte. Bei einem Fehler zeigt die Meldung jetzt die technische Ursache.

## v22
Unten in der Seitenleiste steht jetzt „Version 22“, damit du siehst, welche Programmversion läuft. Zeigt die App eine ältere Version, einmal neu laden (am Handy: App schließen und neu öffnen) oder den Browser-Cache der Seite leeren.

## v23
Ortssuche im Etappen-Finder nutzt jetzt zwei Quellen parallel: Wikidata (Städte mit Einwohnerzahl, schnell) und OpenStreetMap/Overpass (leichtere Abfrage). Ergebnisse werden zusammengeführt; es genügt, wenn eine der beiden Quellen antwortet.

## v24
Etappen-Finder: Bereichs-Regler mit zwei Punkten (0–750 km bzw. 0–10 Std.): linker Punkt = Mindestabstand, rechter Punkt = Höchstabstand.
Kompassrose: Himmelsrichtung antippen (N, NO, O, SO, S, SW, W, NW); „alle“ in der Mitte hebt die Auswahl auf. Gesucht wird grob in diese Richtung (±35°).

## v25
Etappen-Finder: Regler-Punkte sitzen exakt auf der Linie.
Nur noch „interessante“ Orte: Wikidata-Treffer brauchen Einwohnerzahl und mehrere Sprachversionen bei Wikipedia (keine Statistik-Orte ohne Bedeutung); OpenStreetMap-Treffer nur Städte, Orte ab 10.000 Einwohnern oder mit Wikipedia-Eintrag. Orte, deren Mittelpunkt mehr als 2,5 km vom Straßennetz entfernt liegt, werden aussortiert (die „Punkte in der Botanik“).

## v26
Etappen-Finder mit Bild und Karte: links die gefundenen Orte als Karten mit Foto (Wikimedia Commons bzw. Wikipedia), Entfernung, Fahrzeit, Einwohnerzahl und Kurzbeschreibung; rechts eine Karte mit dem Routenabschnitt vom Startort zum gewählten Ort. Ort anklicken (Liste oder Karte) wählt ihn aus, „Übernehmen“ trägt ihn als Etappe ein. Am Handy steht die Karte über der Liste.
Fotos und Karte brauchen Internet; ohne Foto erscheint ein Platzhalter, ohne Routing eine gestrichelte Luftlinie.

## v27
Etappen-Finder: Treffer sind standardmäßig nach Entfernung sortiert (nah → weit); umschaltbar auf „Größte zuerst“. Es werden bis zu 40 Orte geladen.
Filter-Buttons (mit Trefferanzahl): Größe (Großstadt / Stadt / Kleinstadt, untereinander „oder“), dazu Am Wasser, Bekannt, Hauptstadt, Höhenlage, Mit Foto (alle „und“). „Zurücksetzen“ löscht die Auswahl. Liste und Karte zeigen nur die passenden Orte.
Eigenschaften stammen aus Wikidata; Orte, die nur aus OpenStreetMap stammen, haben keine Angabe zu „Am Wasser“, „Hauptstadt“ oder „Höhenlage“ und fallen bei diesen Filtern heraus.

## v28
Etappen-Finder: neue Filter nach Eigenschaften (aus OpenStreetMap, werden nach der Suche im Hintergrund geladen, solange zeigen die Buttons „…“):
Strand – Sandstrand höchstens ca. 4 km vom Ort
Nationalpark / Natur – Nationalpark im Umkreis von 25 km oder Naturschutzgebiet im Umkreis von 8 km
See / Fluss / Wasserfall – Gewässer oder Wasserfall in der Nähe
Freizeitpark / Zoo – auch Aquarium, im Umkreis von 10 km
Viele Sehenswürdigkeiten – mindestens 15 Attraktionen und historische Orte im Umkreis von 2,5 km
Daneben bleiben die Größenfilter (Großstadt / Stadt / Kleinstadt). Zutreffende Eigenschaften stehen als Etiketten an jedem Ort.
