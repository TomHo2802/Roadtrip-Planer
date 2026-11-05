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

## v29 – Etappen-Assistent, Schritt 1 „Weg“
Bei jeder Etappe steht unter der Kopfzeile eine Leiste Assistent: ① Weg · ② Hotel · ③ Vor Ort (② und ③ folgen in den nächsten Versionen).
① Weg: „Ziele suchen“ lädt die Strecke vom Ziel der vorigen Etappe zum Ziel dieser Etappe und sucht bekannte Orte entlang der Straße (Sehenswürdigkeiten, Natur & Aussicht, Museen, Freizeit, Städte). Zu jedem Ziel steht der Umweg in Minuten; Filter nach Art, Regler „Umweg höchstens“, Sortierung in Fahrtreihenfolge oder nach kleinstem Umweg. Links Fotos, rechts die Karte; bei Auswahl zeigt die Karte die Fahrt über den Stopp.
Ein Fortschrittsbalken in % zeigt die Teilschritte (Route, Orte pro Streckenabschnitt, Fotos, Umwege) mit Abbrechen-Button. Ergebnisse werden 30 Tage auf dem Gerät zwischengespeichert, ein zweiter Aufruf dauert nur Sekunden.
„Als Stopp übernehmen“ trägt das Ziel unter „Weg zum Hotel“ der Etappe ein (Aufenthalt vorbelegt mit ca. 1 Std., danach anpassbar).
Start ist das Hotel/Ziel der vorigen Etappe, Ziel das Hotel dieser Etappe (sonst werden die Ortsnamen gesucht).

## v30
„Ziele auf dem Weg“ nutzt jetzt Wikidata (Abschnitt für Abschnitt entlang der Route) statt Overpass.
„Neu suchen“ umgeht den Zwischenspeicher und startet wirklich eine neue Suche.
Leere oder unvollständige Ergebnisse werden nicht mehr gespeichert; Fehler werden im Panel angezeigt.
Prüfen: In der Seitenleiste muss „Version 30“ stehen (sonst alte Version im Cache: Seite neu laden).

## v31
Jede Station beim Etappen-Assistenten hat „Mehr anzeigen“ mit ausführlicher Beschreibung (Wikipedia, Quelle verlinkt).
Beim Übernehmen als Zwischenstopp wird dieser Text samt Quelle in die Notizen geschrieben.

## v32
Fix: In der Assistenten-Leiste gibt es jetzt „Details anzeigen/ausblenden“ – die Etappe lässt sich auch bei geöffnetem Assistenten öffnen (Panel schließt sich dabei, Etappe wird ins Bild gescrollt).
② Hotel: Unterkünfte aus OpenStreetMap (bis 8 km), Filter Typ/Sterne/Entfernung/WLAN/Merkliste, Sortierung, eigene Felder für Preis und Bewertung (werden auf diesem Gerät gespeichert), Links zu Booking (mit Reisedaten und Personenzahl) und Google, „Als Hotel übernehmen“ (Name, Adresse, GPS, Preis × Nächte, Bewertung, Links).
③ Vor Ort: bekannte Orte im Umkreis (Wikidata/Wikipedia) mit Foto, Beschreibung, Filter, Umkreis, „Zu Aktionen hinzufügen“ (bei mehreren Nächten Tag wählbar).
Übernommene Karten zeigen „✓ Übernommen“.

## v33
Hotelsuche robuster: kleinere Abfrage (6 km), zweiter Versuch mit 3,5 km, zusätzliche Overpass-Server und als Ersatz Nominatim, wenn Overpass nicht antwortet (Hinweis in der Liste).
Neue Kategorie „Shopping“ (Einkaufszentren, Outlets, Kaufhäuser, Märkte) bei ① Weg und ③ Vor Ort.

## v34
Wird ein Punkt auf der Karte angeklickt (Weg, Hotel, Vor Ort), scrollt die Liste zur ausgewählten Karte.

## v35
- „Details anzeigen/ausblenden“ überarbeitet: Die Suche (Weg, Hotel, Vor Ort) bleibt beim Umschalten erhalten. Die Etappen-Details erscheinen direkt unter der Assistenten-Leiste, das Suchfeld darunter.

## v36
- Der Assistent (Weg, Hotel, Vor Ort) erscheint jetzt ganz oben in der Etappe, direkt unter der Kopfzeile. Beim Einblenden der Details scrollt die Seite zu den Etappen-Details.

## v37 – Hell / Dunkel / Automatisch
- Neuer Schalter „Darstellung“: in der Seitenleiste (Hell · Auto · Dunkel), am Handy oben in der Kopfzeile (tippen wechselt Hell → Dunkel → Auto).
- Dunkel = Dark-Glass-Optik (dunkler Hintergrund, halbtransparente Karten, abgedunkelte Karte). Auto folgt der Einstellung des Geräts. Die Wahl wird pro Gerät gespeichert.
- Beim Drucken wird immer die helle Darstellung verwendet.

## v38
- Dunkle Darstellung freundlicher: hellere blaue Grundfarbe, kräftigere Farbverläufe, hellere Karten und Ränder, lebendigere Buttons.

## v39
- Dunkle Darstellung: bessere Lesbarkeit. Karten sind jetzt dunkel-transluzent statt hell, Texte heller und mit hohem Kontrast (geprüft nach WCAG-Richtwert 4,5:1 über alle Bereiche).

## v40
- Dunkle Darstellung: die dezenten Hintergrundfarben aus dem hellen Modus (gelb bei „Weg“, grün bei „Aktionen“, blau/grau bei Hotel, Warnhinweise usw.) bleiben erhalten, nur abgedunkelt und leicht transparent.

## v41 – ruhiger Dunkelmodus und Demo-Reise
- Dunkel überarbeitet: kein Glaseffekt mehr, ruhige Flächen in Dunkelblau/Grau, klare Ränder, sehr gut lesbare Schrift (Kontrast geprüft).
- In der Etappe sind „Weg zum Hotel“ (Gold), „Hotel“ (Blau) und „Aktionen vor Ort“ (Grün) deutlich voneinander abgesetzt (Farbe, Randstreifen, Kopfzeile).
- Demo-Reise „Florida Rundreise (Demo)“ ist ins Programm eingebaut (anonymisiert: keine echten Namen, Kartendaten oder Buchungscodes). Öffnen: Startbildschirm „Demo-Reise ausprobieren“ oder Mehr → Reisen & Daten → „Demo-Reise“. Die Demo darf beliebig geändert werden. Zurücksetzen auf den Ursprungszustand: gelbes „Zurücksetzen“ in der Seitenleiste oder Mehr → Reisen & Daten. Echte Reisen bleiben unberührt (sie werden gesichert und stehen in der Liste „Meine Reisen“).

## v42
- Dunkelmodus: In „Weg“, „Hotel“ und „Vor Ort“ ist nur der Bereichshintergrund gelb, blau oder grün, die Kacheln darin sind neutral dunkel (wie im hellen Modus). Statusfarben (ja/nein, Buttons) bleiben erhalten.

## v43

- **Dunkelmodus:** Die Etappen-Bereiche (Weg / Hotel / Vor Ort) behalten ihren gelben, blauen bzw. grünen Hintergrund, die Kacheln darin sind einheitlich grau mit hellem, gut lesbarem Text.
- **Neuer Reiter Planen → Übersicht:**
  - **Reisetage im Überblick:** Zeitleiste mit allen Tagen, Fahrzeit, Hotelwechsel, freien Tagen, Aktionen und Wetter. Kennzahlen oben (Reisetage, Fahrzeit gesamt, Hotelwechsel, lange Fahrtage).
  - **Fahrzeit-Warnung:** Grenze pro Tag einstellbar (Standard 5 Std., wird in der Reise gespeichert). Tage darüber werden rot markiert; Check-in-, Dunkelheits- und Mitternachtswarnungen werden pro Tag angezeigt.
  - **Regenplan:** Pro Tag eine Ausweichliste (eigene Ideen, Übernahme aus den Aktionen vor Ort, Indoor-Suchlinks zum Hotel). Sagt die Wettervorhersage Regen (ab 60 %) voraus, wird der Tag markiert und die Liste automatisch geöffnet.
  - **Gesamtkarte:** Alle Etappen in verschiedenen Farben, Hotels nummeriert; Ebenen (Etappen / Hotels / Stopps / Aktionen) und einzelne Etappen ein- und ausblendbar; „Straßenverlauf laden“ zeichnet die echte Route (sonst gestrichelte Luftlinie).

## v44

- **Dunkelmodus:** Der Abstands-Schieberegler in „Nächste Etappe finden“ ist wieder gut sichtbar (Spur, Füllung, beide Punkte, Skala).
- **Regenplan leichter zu finden:** Der Button „☔ Regenplan“ steht jetzt auch an jedem Tag im Tagesplan (Planen → Tagesplan), zusätzlich zur Übersicht. Die Übersicht hat einen Hinweis dazu.

## v45

- **Reise-Assistent (Wizard):** Button „Reise-Assistent“ in der Seitenleiste und oben im Reiter Etappen. Er führt in zwei Phasen durch die Planung:
  - **Grundrahmen:** 1. Reise & Zeitraum, 2. Reisende & Budget, 3. An- & Abreise (inkl. maximaler Fahrzeit pro Tag).
  - **Etappen:** 4. Route festlegen (Orte und Nächte, Datum werden automatisch berechnet, Nächte-Bilanz gegen die Reisedauer), 5. Etappen im Detail (Strecke, Fahrzeit, Hotel; Assistenten für Ziele, Hotels und Vor-Ort-Aktionen öffnen sich direkt in der Etappe, ein Button bringt zurück), 6. Prüfen & fertig (Check mit Direktsprung).
  - Jeder Schritt wird beim Weitergehen gespeichert; „Später weitermachen“ merkt sich die Stelle. Bestehende Hotels, Aktionen und Datumszusätze bleiben erhalten.
- **Neue Reise:** Der bisherige Startdialog legt keine Tages-Etappen mehr an, sondern öffnet danach den Reise-Assistenten bei „Route festlegen“.
- **Fix:** Neue Etappen mit leeren Hotelfeldern wurden bei gesetztem Reisezeitraum fälschlich als „Datum außerhalb der Reise“ abgelehnt.

## v46

- **Reise-Assistent vereinfacht (5 statt 6 Schritte):**
  - **Reise & Zeitraum:** Erster Tag und Zahl der Übernachtungen eintragen (oder Enddatum). Die Etappen ergeben sich daraus: eine Etappe pro Nacht.
  - **Reisende & Start:** Reisende, Budget, Start/Ziel und maximale Fahrzeit auf einer Seite.
  - **Etappen benennen:** Nur noch die Orte eintragen. Verlängerst du eine Etappe mit „+“, fragt der Assistent, welche andere Etappe mit einer Nacht dafür entfallen soll; die Reisedauer bleibt gleich. Mit „−“ wird die freie Nacht zu einer neuen Etappe.
  - **Hotel & Aktivitäten:** Pro Etappe ein Hotel (auch bei mehreren Nächten). Bei Etappen mit mehreren Nächten werden die einzelnen Tage nur mit Aktivitäten geplant, jeweils pro Tag mit Datum; Aktivitäten lassen sich auf einen anderen Tag verschieben.
  - **Prüfen & fertig:** wie bisher, zusätzlich Hinweis auf fehlende Orte.

## v47

- **Etappen wieder wie in v43:** Der Startdialog „Neue Reise“ legt wieder eine Etappe pro Reisetag an (Vorschau, Bestätigung und Datumsformat wie in v43) und öffnet den Reise-Assistenten nicht mehr automatisch. Der Assistent bleibt über den Button „Reise-Assistent“ erreichbar; im Schritt „Etappen benennen“ legt „Etappe(n) für freie Nächte anlegen“ bei Bedarf Etappen an.
- **Etappe als eigene Seite:** In der Etappenliste zeigt jede Etappe nur noch eine Zeile mit Weg, Hotel und Aktionen und den Button „Etappe öffnen“. Die geöffnete Etappe hat oben die Reiter Weg / Hotel / Vor Ort / Alles, „← Alle Etappen“ und Vorherige/Nächste. Die Assistenten (Ziele, Hotels, Unternehmungen) stehen direkt im jeweiligen Abschnitt. Der Reise-Assistent und die Etappen-Übersicht öffnen ebenfalls diese Seite.
- **Weniger Hauptpunkte:** Die Navigation hat nur noch Planen, Buchen und Unterwegs (dort jetzt auch „Heute“). Organisation und Reisen & Daten liegen unter dem Zahnrad „Einstellungen“ in der Seitenleiste bzw. „Optionen“ in der unteren Leiste am Handy.
- **Dunkelmodus:** Die Kostenkacheln im Budget waren kaum lesbar und sind jetzt grau mit hellem Text; die Nummer im Hotel-Abschnitt hat mehr Kontrast.
