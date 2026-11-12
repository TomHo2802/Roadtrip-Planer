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

## v48

- **An- und Rückreise:** Auf der Etappenseite (Reiter „Weg“) zeigt die erste Etappe die **Anreise** vom Heimatort und die letzte Etappe die **Rückreise** zum Heimatort. Aus den eingetragenen Flügen (Buchungen → Flug & Mietwagen, „Hinflug“ bzw. „Rückflug“) berechnet der Planer die Reisedauer inklusive Umstieg, die Ankunft in Ortszeit und die **Zeitverschiebung** (inklusive Sommer-/Winterzeit). Reisedauer, Zeitverschiebung und eine Notiz lassen sich unter „Angaben anpassen“ überschreiben. Der Heimatort kommt aus „Start / Abflughafen“ im Reise-Assistenten, sonst aus dem ersten Hinflug.

## v49
- Beim Speichern einer Etappe (Grunddaten bearbeiten) werden alle folgenden Etappen neu durchgerechnet: Datum = Reisebeginn + Nächte (z. B. 05.11. + 2 Nächte → nächste Etappe ab 07.11.).
- Der Startort jeder folgenden Etappe wird automatisch auf den Zielort der vorherigen gesetzt.
- Der Rückreisetag bekommt keine eigene Etappe mehr (keine Übernachtung); neue Reisen legen Tage − 1 Etappen an. Die Rückreise steht in der letzten Etappe.
- Wird die im Startdialog angegebene Reisedauer durch zusätzliche Nächte überschritten, erscheint eine Meldung; die Reise verlängert sich (Enddatum wird angepasst), es wird nichts gelöscht.

## v50
- Die letzte Etappe (Rückreise) bleibt erhalten. Sie hat keine Übernachtung: Hotel und „Vor Ort“ sind für sie ausgeblendet; „Punkte auf dem Weg“ und die Rückreise-Angaben bleiben.
- Neue Reisen legen Etappen pro Kalendertag an; die letzte ist die Rückreise zum Startort.
- Entfernung (km) und voraussichtliche Fahrzeit lassen sich pro Etappe („Entfernung & Fahrzeit ermitteln“ im Abschnitt Weg) oder für alle offenen Etappen auf einmal (oben in der Etappen-Liste) berechnen. Benötigt Internet; vorhandene Angaben werden bei „für alle“ nicht überschrieben.
- Bestehende Planungen ohne Rückreise-Etappe: einmalige Rückfrage, ob sie ergänzt werden soll (Start = letztes Ziel, Ziel = Startort). Bestehende Etappen bleiben unverändert.

## v51
- Die Rückreise-Etappe zeigt in der Kopfzeile keine Übernachtung mehr an.

## v52
- Sehenswürdigkeiten-Suche (Vor Ort und Auf dem Weg): Treffer werden jetzt nach Art des Ortes (Wikidata: Sehenswürdigkeit, Museum, Schloss, Park, Strand, Nationalpark …) gefiltert und nach Bekanntheit sortiert. Unbekannte Objekte ohne passende Art werden ausgeblendet.
- Die Liste zeigt zuerst die 10 besten Treffer, „Mehr anzeigen“ lädt jeweils 10 weitere nach (Karte folgt der Liste).
- Neu: „Nach Namen suchen“ in beiden Suchen – findet auch bekannte Orte, die in der Vorschlagsliste fehlen (mit Foto, Entfernung und Übernahme in die Etappe).
- Alte gespeicherte Suchergebnisse werden nicht mehr verwendet; mit „Neu suchen“ gibt es die verbesserte Liste.

## v53 – Aufräumen: doppelte Funktionen zusammengelegt
- **Reise & Zeitraum:** Der Link „Datum & Kurs ändern“ in der Seitenleiste heißt jetzt „Reise & Zeitraum ändern“ und öffnet den Reise-Assistenten bei Schritt 1. Der Reisedatum-Chip oben öffnet weiterhin den kleinen Dialog (inkl. Wechselkurs).
- **Übersicht:** zeigt nur noch Tage mit Hinweisen (lange Fahrt, Warnung, Regen, freier Tag); „Alle Tage zeigen“ blendet den Rest ein, „Tagesplan öffnen“ springt zum vollständigen Ablauf. Die Gesamtkarte ist in den Tab Karte umgezogen; in der Übersicht führt ein Knopf dorthin.
- **Karte:** unter der Routenkarte steht jetzt auch die Gesamtkarte der Reise (Ebenen, Straßenverlauf).
- **Rechner & Listen (früher US-Tools):** „Alle Etappen-Distanzen“ entfällt (Entfernungen stehen in Etappen und Übersicht). Der Wechselkurs ist von „Wo bin ich“ hierher gezogen. Checkliste und Packliste stehen zusammen auf dieser Seite; der Tab „Organisation“ entfällt.
- **Karten & Notfall:** zeigt pro Karte nur noch Kreditrahmen und Konditionen; Belastungen und freier Rahmen stehen im Budget (Link „Belastungen im Budget“).
- **Heute:** Die Notfallnummern-Liste ist durch einen Knopf zu „Karten & Notfall“ ersetzt.
- Bewusst unverändert: „Nächste Etappe finden“ und die Vorschläge in der Karte (verschiedene Aufgaben, Merkliste), „In der Nähe“ (Tankstelle, Supermarkt usw., keine Sehenswürdigkeiten).

## v54
- **Buchungen:** Der Tab (früher „Flug & Mietwagen“) beginnt jetzt mit „Hotels (aus der Planung)“. Jede Etappe mit Übernachtung erscheint als Zeile: ohne Preis rot „Nicht gebucht“, mit Preis grün „Gebucht“. Der Preis lässt sich direkt in der Zeile eintragen; „In Etappe öffnen“ springt zum Hotel der Etappe.
- **Reisen ohne Flug/Mietwagen:** Anreise und Rückreise in der ersten und letzten Etappe erscheinen nur, wenn unter Buchungen Flug- oder Mietwagen-Daten eingetragen sind. Mit Mietwagen steht dort Abholung bzw. Rückgabe, Reisedauer und Zeitverschiebung nur bei Flügen. Das Badge „Anreise“ in der Übersicht erscheint nur bei eingetragenem Hinflug.
- **Packliste:** Neuer Knopf „Packliste vorschlagen“ (Rechner & Listen → Packliste). Erstellt aus Reisedauer, Jahreszeit/Temperatur (Vorhersage, sonst Schätzung), Flug oder Auto, Ziel, Aktivitäten und Mitreisenden eine Liste, je Person und gemeinsam. Vorhandene Einträge bleiben, nichts wird doppelt angelegt.

## v55
- **Karten nur mit letzten 4 Ziffern:** Im Karten-Dialog ist nur noch „Letzte 4 Ziffern“ möglich; es gibt kein Feld für Prüfnummer (CVC). Bereits gespeicherte längere Nummern und Prüfnummern werden beim Laden automatisch auf die letzten 4 Ziffern gekürzt bzw. entfernt (mit Hinweis).
- **Ablaufwarnung:** Läuft eine Karte vor, während oder bis 30 Tage nach der Reise ab, erscheint eine rote bzw. gelbe Meldung (Etappen, Übersicht, Buchungen, Karten).
- **Reisevorlage:** Unter Karten & Notfall und Reisen & Daten gibt es „Als Vorlage speichern“ und „Vorlage laden …“. Die Vorlage enthält nur Karten (Name, letzte 4 Ziffern, Ablaufdatum, Limit, Gebühren, Bedingungen), Mitreisende und Notfallnummern, keine Etappen oder Buchungen. Beim Laden wird nichts doppelt angelegt. Die Datei nicht auf GitHub hochladen.

## v56
- Hotel-Kacheln: Frühstück, Parken und Vorab bezahlt lassen sich wieder per Klick zwischen „ja“ und „nein“ umschalten. Die Kreditkarte wird in der Kachel aus den angelegten Karten ausgewählt (Auswahlliste); ohne angelegte Karten erscheint ein Hinweis.
- Die Meldung „Reisedauer überschritten“ erscheint nur noch, wenn eine Änderung die Nächte tatsächlich erhöht, nicht mehr bei jedem Speichern einer Etappe.

## v57
- Die Kreditkarte in der Hotel-Kachel ist wieder nur anzeigend und wird im Bearbeiten-Dialog gewählt (Frühstück, Parken, Vorab bez. bleiben per Klick umschaltbar).
- Fehler behoben: Im Bearbeiten-Dialog wurde bei Hotels ohne Karte die erste Karte nur angezeigt, aber nicht gespeichert. Die Auswahl beginnt jetzt mit „— bitte wählen —“, und die gewählte Karte erscheint danach in der Kachel.

## v58
**Unterwegs auf dem Handy, für Google und Apple:**
- **Heute** ist Startseite, sobald das heutige Datum in der Reise liegt. Oben "Als nächstes" mit Navigation, direkt darunter vier große Schnellzugriffe: Hotel, Parkplatz, Notfall, Wetter. Der Tagesplan ist einklappbar (heute standardmäßig eingeklappt), vergangene Punkte erscheinen grau.
- **Navi** zeigt standardmäßig nur die aktuelle Etappe (außerhalb der Reise: alle). Schnellfilter Hotel / Parken / Stopps / Vor Ort, Suche, Auswahl "Alle Etappen".
- **Kompakte Karten:** ein Name plus Knopf "Navigation". Mit "▾" erscheinen Google Maps, Apple Karten, GPS, Adresse und Copy GPS.
- **Karten-Dienst:** automatisch (iPhone/iPad/Mac = Apple Karten, sonst Google Maps), umschaltbar auf Google oder Apple. Die Wahl gilt auch für "Navigation starten" und die Schnellzugriffe.
- Mobil mehr Abstand unten, damit die untere Leiste nichts verdeckt.

## v59
**Ansicht Handy / Tablet / Laptop:** Die App erkennt automatisch (Bildschirmbreite und Touch) ob sie auf Handy, Tablet oder Laptop läuft. Unter Optionen gibt es "Ansicht für Unterwegs": Automatisch / Handy / Tablet / Laptop, falls die Erkennung falsch liegt. Heute und Navi nutzen auf Tablet und Laptop mehrere Spalten, auf dem Handy bleibt es eine Spalte. Das Layout wird als Nächstes feinjustiert.

## v60
**Neues Design-System und Icons:**
- Einheitliche Grundlage: Farben, Schrift (System-Schrift wie in nativen Apps), Abstände, Schatten, Rundungen, Fokus-Rahmen und Eingabefelder.
- Sanfte Übergänge beim Seitenwechsel und beim Antippen. Mit "Bewegung reduzieren" im Gerät werden sie abgeschaltet.
- Mobil: Kopf- und Fußleiste leicht durchscheinend, Sicherheitsbereich (Notch, Home-Balken) berücksichtigt, kein automatisches Hineinzoomen auf iPhones beim Tippen in Felder.
- Emojis in der Oberfläche (Hotel, Parken, Notfall, Navi, Flagge usw.) sind durch einheitliche Linien-Icons ersetzt, auch im Dunkel-Modus.
- Wetter- und Ausflugs-Symbole der Daten bleiben bewusst unverändert.

## v61
**App-Verhalten und klarere Seiten:**
- Auf dem Handy öffnen sich Dialoge als Bottom-Sheet von unten (mit Griff). Nach unten wischen schließt sie. Auf großen Bildschirmen bleiben sie mittig.
- Die Kopfleiste wird beim Scrollen kompakt und bekommt einen feinen Schatten.
- Platzhalter-Balken statt "Lade …" bei Wetter und Wechselkurs.
- Leere Zustände einheitlich mit Icon, Titel, kurzem Text und, wo sinnvoll, einem Knopf (Navi, Heute, Tagesplan, Packliste).
- Lange Erklärtexte (z. B. beim Tagesplan) sind hinter "Hinweis anzeigen" eingeklappt.

## v62
- Die obere Reiter-Leiste (z. B. Planen: Etappen / Tagesplan / Übersicht / Karte, Unterwegs: Heute / Wo bin ich / ...) bleibt beim Scrollen oben fixiert, auf Handy direkt unter der Kopfleiste.
- Die mobile Kopfleiste ist jetzt wirklich fixiert (war vorher nicht fest).
- Der Tagesplan unter "Heute" ist immer aufgeklappt.

## v63
**Hotel bearbeiten: Kalender und Uhrzeit-Auswahl**
- Datumsfelder haben jetzt immer die Kalenderauswahl: Storno bis, Abbuchung angekündigt, Kreditkarte belastet. Bei "Storno bis" gibt es zusätzlich "Flexibel stornierbar". Ältere Texteinträge werden als "Bisher: …" angezeigt, bis ein Datum gewählt wird.
- Uhrzeiten wählst du in 30-Minuten-Schritten: Check-in (ab / bis optional), Check-out und die Uhrzeit bei Aktionen vor Ort. Bestehende Werte wie "15 - 23 Uhr" werden richtig vorbelegt.
- Storno-, Abbuchungs- und Belastungsdatum dürfen jetzt auch außerhalb des Reisezeitraums liegen (vorher kam eine Fehlermeldung). Für Etappen-, Flug- und Mietwagen-Daten gilt die Prüfung weiter.

## v64
- Hotel bearbeiten: Check-in (von / bis) und Check-out sind gleich hoch und breit, die Uhrzeiten stehen ungekürzt und gut lesbar in den Feldern (z. B. 16:30, 22:00, 10:30).

## v65
- Check-in: zwischen "von" und "bis" steht ein Bindestrich. Die Auswahl bei "bis" beginnt direkt nach der "von"-Zeit (30 Minuten später) und reicht bis Mitternacht. Wird "von" später als "bis" gesetzt, wird "bis" geleert.

## v66
- Unterwegs > Heute: In der Unterkunfts-Karte stehen jetzt Frühstück, Parken und Bereits bezahlt als farbige Kurzangaben (grün = ja, rot = nein, gelb = möglich, grau = nicht eingetragen).

## v67
- Dunkel-Modus: Die ausgewählte Auswahl ist jetzt orange und damit klar erkennbar. Das gilt für die obere Reiter-Leiste, den gewählten Tag, die Filter-Knöpfe, die Umschalter (z. B. Hell/Auto/Dunkel) und den aktiven Bereich in der unteren bzw. seitlichen Navigation.

## v68
- Dunkel-Modus: Ja / Nein haben klare, gedeckte Farben (grün und rot) mit gut lesbarer Schrift. Das gilt für die Umschalter Frühstück, Parken und Vorab bezahlt im Hotel und für die Kurzangaben in Unterwegs > Heute. Ein "ja" wird nicht mehr orange dargestellt.

## v69
- Dunkel-Modus: Der aktive Hauptbereich (Planen / Buchen / Unterwegs) in der Seitenleiste ist jetzt orange hervorgehoben, mit orangem Streifen links. In der unteren Handy-Leiste war er schon orange.

## v70 – Drive-Synchronisation
- Ist die Reise einmal mit einer Datei verbunden (Datei angelegt oder aus Drive geöffnet), wird bei jeder Änderung automatisch in diese Datei gespeichert. Unten links steht „Drive gespeichert HH:MM“.
- Die App prüft alle 15 Sekunden und beim Zurückkehren in die App, ob die Datei neuer ist (z. B. am Laptop geändert). Eine neuere Version wird automatisch übernommen, sobald du nichts bearbeitest.
- Liegt eine neuere Version vor, während du selbst ungespeicherte Änderungen hast, wird nichts überschrieben: Du siehst eine Meldung „Jetzt laden“ oder „Meinen Stand behalten“.
- Nach einem Browser-Neustart fragt Chrome einmal nach: Meldung „Verbindung erneuern“.
- Grenzen: Dauerhafte Dateiverbindung gibt es nur in Chrome/Edge am Laptop. Auf dem Handy (Android Chrome, iOS Safari) steht in Optionen „Neueste Datei aus Drive laden“. Die Drive-App auf dem Handy synchronisiert die Datei, die Web-App kann sie aber nicht von selbst lesen.

## v71
- Die Versionsnummer steht jetzt dezent neben dem Bereichstitel im Kopf der Handy-Ansicht (am Laptop weiter in der Seitenleiste).

## v72 – Kreditkarten: mehr Farben und Logo
- Unter Buchen > Karten & Notfall > Karte bearbeiten: 18 Farben als Farbfelder statt 5. Es ist keine Obergrenze für die Zahl der Karten eingebaut.
- Logo pro Karte: Webseite eintragen (bei bekannten Namen wie Visa, DKB, ING vorbelegt) und „Logo aus Internet laden“, oder „Eigenes Bild“. Das Logo wird verkleinert und in der Karte gespeichert, also auch in Reisedatei und Reisevorlage. Es erscheint im Kopf der Karte.
- Das Laden aus dem Internet braucht Netz und klappt nicht bei jeder Seite. Dann hilft „Eigenes Bild“.

## v73
- Karten-Logo: neuer Knopf „Aus Zwischenablage“. Alternativ Bild kopieren und Strg+V drücken, solange der Karten-Dialog offen ist.

## v74 – Notfallkontakte
- Gruppen: Bank, ADAC, Privat, Mietwagen, Fluggesellschaft, Reise, Sonstiges. Bestehende Kontakte werden anhand von Name und Kategorie automatisch einer Gruppe zugeordnet; im Bearbeiten-Dialog kannst du die Gruppe ändern.
- Farbe pro Kontakt wie bei den Kreditkarten (18 Farben). Jeder Notfallkontakt hat immer einen roten Rand.

## v75 – Koffer-PINs
- Buchen > Karten & Notfall, unterhalb der Notfallkontakte: je Mitreisendem eine Karte mit beliebig vielen PINs samt Beschreibung. PINs hinzufügen (+ PIN hinzufügen) und entfernen (✕), Karte löschen. PINs sind zunächst verdeckt (Anzeigen/Verbergen).
- Sie liegen in der Reisedatei (Drive), aber nicht in der Reisevorlage und nicht im Teilen-Export.

## v76 – Gelöschte Kreditkarten
- Wird eine Kreditkarte gelöscht, wird sie auch bei Hotels, Flügen und Mietwagen entfernt. Die Auswahllisten zeigen nur noch vorhandene Karten (plus „Bar / Vor Ort ohne Karte“). Betroffene Buchungen stehen danach auf „bitte wählen“.
- Bereits gelöschte Karten, die noch in Buchungen hingen (z. B. Zipfelbank), werden beim nächsten Start einmalig bereinigt.

## v77 – Karte bei den Hotels
- Buchen > Buchungen > Hotels: unter jedem Hotel steht die gewählte Kreditkarte. Ist keine gewählt (oder die Karte gelöscht), steht dort rot „Karte auswählen“. Dasselbe in der Hotel-Kopfzeile und in der Budget-Tabelle.

## v78 – Einstieg und Bedienung
- Startbildschirm: oben „Demo ansehen“ und „Eigene Reise anlegen“. Datei-Optionen stehen eingeklappt unter „Ich habe schon eine Reisedatei“.
- Hilfe „Erste Schritte“: öffnet beim ersten Start automatisch, danach über das Fragezeichen in der Kopfzeile (Handy) bzw. „Hilfe / Erste Schritte“ in der Seitenleiste (Laptop).
- Die Demo-Reise startet immer in „Planen“.
- Kopfzeile am Handy aufgeräumt: Titel, Fragezeichen, Hell/Dunkel-Knopf und Statuspunkt. Hintergrund ist jetzt undurchsichtig.
- Optionen in drei Abschnitte gegliedert: Reise, Daten & Sicherung, Darstellung.
- Sicherungs-Erinnerung: Ohne verbundene Datei erscheint nach einem Tag (nie gesichert) bzw. nach 7 Tagen ein Hinweis „Jetzt sichern“. „Später“ blendet ihn 3 Tage aus. Nicht in der Demo und nicht im Nur-Lesen-Modus.

## v79 – Nächste Etappe finden
- Die Suche geht jetzt vom Startort der gewählten Etappe aus (bei Etappen ab Nr. 2 vom Hotel der Vor-Etappe, sonst vom Ortsnamen). Die Auswahl zeigt „Etappe N: Start → Ziel“.
- „Übernehmen“ ersetzt das Ziel dieser Etappe; der Start der Folge-Etappe wird angepasst. Mit dem letzten Eintrag „Neue Etappe anhängen“ entsteht eine zusätzliche Etappe.

## v80 – Nächste Etappe finden: Richtungen, Fortschritt, Zeitüberschreitung
- Mehrere Himmelsrichtungen sind antippbar (zum Beispiel Süd und Südwest). „Öffnung“ Schmal/Normal/Breit (±25°/±45°/±70°) erweitert den Sektor. Standard ist Normal (vorher ±35°).
- Fortschrittsbalken wie bei der Aktionen-Suche, mit Abbrechen.
- Die Orte-Abfrage fragt nur noch den gewählten Richtungssektor ab (kleiner, schneller) und wartet länger auf die Kartendienste (bis 60 s, ein Wiederholungsversuch). Bei Zeitüberschreitung kommt eine verständliche Meldung statt „signal is aborted“.

## v81 – Routenart
- Optionen > Routen: Schnellste Route, Autobahn meiden, Mautfrei oder Fähren meiden. Gilt für Strecken-/Fahrzeitberechnung und „Nächste Etappe finden“ (dort auch direkt wählbar).
- Pro Etappe überschreibbar: bei „Weg zum Hotel“ neben „Entfernung & Fahrzeit ermitteln“.
- „Alle neu berechnen“ rechnet alle Etappen mit der gewählten Routenart neu.
- Meidet der Routing-Dienst eine Strecke nicht (keine Alternative), nutzt die App die Standardroute und weist darauf hin.
- Nicht möglich: „nur Autobahn“ erzwingen, „am Meer entlang“.

## v82
- Etappen-Finder: Klick auf einen Kartenpunkt wählt den Ort aus und scrollt die Liste dorthin.

## v83
- Etappen-Finder: „Ort auf der Karte wählen“ zeigt nur den Suchbereich; Ziel per Tipp auf die Karte wählen.

## v84
- Karten in Finder und Aktionen-Suche: Mausrad zoomt auf der Karte, neben der Karte scrollt die Seite.

## v85
- Reise-Assistent (assistent.html): Eckpunkte eingeben, Etappen und Tage berechnen, als Entwurf an den Planer übergeben.
