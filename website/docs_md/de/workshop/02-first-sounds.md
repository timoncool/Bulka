---
title: Erste Sounds
---

# Erste Sounds

Dies ist das erste Kapitel im Strudel Workshop, schön dich an Bord zu haben!

## Textfelder

Der Workshop ist voller interaktiver Textfelder. Lass uns lernen wie sie funktionieren. Hier ist eins:

```javascript
sound("casio")
```

1. Klicke in das obige Textfeld
2. Drücke `Strg`+`Enter` zum Abspielen
3. Ändere `casio` in `metal`
4. Drücke `Strg`+`Enter` zum Aktualisieren
5. Drücke `Strg`+`Punkt` zum Stoppen

Mac: `Strg` = `control` oder auch `option`

Glückwunsch, du kannst jetzt live coden!

## Sounds

Gerade haben wir schon den ersten sound mit `sound` abgespielt:

```javascript
sound("casio")
```

`casio` ist einer von vielen Standard Sounds.

Probier ein paar andere Sounds aus:

```
insect wind jazz metal east crow casio space numbers
```

Es kann sein, dass du kurz nichts hörst während ein neuer Sound lädt.

**Sample Nummer ändern mit :**

Ein Sound kann mehrere Samples (Audio Dateien) enthalten.

Du kannst ein anderes Sample wählen, indem du `:` und eine Zahl an den Sound-Namen anhängst:

```javascript
sound("casio:1")
```

Probiere verschiedene Sound / Zahlen Kombinationen.

Ohne Zahl ist gleichbedeutend mit `:0`

Jetzt weißt du wie man Sounds abspielt und ihre Sample Nummer einstellt.
Vorerst bleiben wir bei den voreingestellten Sounds, später erfahren wir noch wie man eigene benutzt.

## Drum Sounds

Strudel kommt von Haus aus mit einer breiten Auswahl an Drum Sounds:

```javascript
sound("bd hh sd oh")
```

Diese Kombinationen von Buchstaben stehen für verschiedene Teile eines Schlagzeugs:

![drumset](/img/drumset.png)

- `bd` = **b**ass **d**rum - Basstrommel
- `sd` = **s**nare **d**rum - Schnarrtrommel
- `rim` = **rim**shot - Rahmenschlag
- `hh` = **h**i**h**at - Hallo Hut
- `oh` = **o**pen **h**ihat - Offener Hallo Hut
- `lt` = **l**ow tom
- `mt` = **m**iddle tom
- `ht` = **h**igh tom
- `rd` = **r**i**d**e cymbal
- `cr` = **cr**ash cymbal

Probier verschiedene Sounds aus!

Wir können den Charakter des Drum Sounds verändern, indem wir mit `bank` die Drum Machine auswählen:

```javascript
sound("bd hh sd oh").bank("RolandTR909")
```

In diesem Beispiel ist `RolandTR909` der Name der Drum Machine, die eine prägende Rolle für House und Techno Musik spielte.

Ändere `RolandTR909` in

- `AkaiLinn`
- `RhythmAce`
- `RolandTR808`
- `RolandTR707`
- `ViscoSpaceDrum`

Es gibt noch viel mehr, aber das sollte fürs Erste reichen..

Tipp für faule: Mach Doppel-Klick auf einen Namen um ihn zu markieren.
Dann kannst du ihn mit `Strg`+`C` kopieren und mit `Strg`+`V` einfügen.

## Sequenzen / Sequences

Im letzten Beispiel haben wir schon gesehen dass man mehrere Sounds hintereinander abspielen kann wenn man sie durch Leerzeichen trennt:

```javascript
sound("bd hh sd hh")
```

Beachte wie der aktuell gespielte Sound im Code markiert und auch darunter visualisiert wird.

Versuch noch mehr Sounds hinzuzfügen!

**Je länger die Sequence, desto schneller**

```javascript
sound("bd bd hh bd rim bd hh bd")
```

Der Inhalt einer Sequence wird in einen sogenannten Cycle (=Zyklus) zusammengequetscht. Ein Cycle ist standardmäßig 2 Sekunden lang.

**Eins pro Cycle mit `< .. >`**

Hier ist die gleiche Sequence, aber dieses mal umgeben von `< .. >` (angle brackets):

```javascript
sound("<bd bd hh bd rim bd hh bd>")
```

Jetzt spielt nur ein Sound pro Cycle. Mit diesen Klammern bleibt das Tempo immer gleich, ganz egal wieviele Elemente enhalten sind!

Das ist jetzt aber etwas langsam, machen wir es schneller mit `*`:

```javascript
sound("<bd bd hh bd rim bd hh bd>*8")
```

Die `*8` macht die ganze Sequenz 8 mal so schnell.

Warte mal, ist das jetzt nicht das gleiche Ergebnis wie ohne `< ... >*8`? Wofür ist das dann gut?

Korrekt, der echte Vorteil dieser Schreibweise zeigt sich wenn du Elemente entfernst oder hinzufügst. Versuch es mal!

Ändere auch mal die Zahl am Ende um das Tempo zu verändern.

**Tempo ändern mit `setcpm`**

```javascript
setcpm(90/4)
sound("<bd hh rim hh>*8")
```

cpm = **c**ycles per **m**inute = Cycles pro Minute

Das Tempo is standardmäßig is 30 Cycles pro Minute = 120/4 = 1 Cycle alle 2 Sekunden

In taditioneller Musik-Terminologie könnte man sagen, das Pattern oben besteht aus 8tel Noten auf 90bpm im 4/4 Takt.

Kein Sorge wenn dir diese Begriffe nichts sagen, das ist nicht notwendig um mit Strudel Musik zu machen.

Wir werden später noch mehr Möglichkeiten kennen lernen das Tempo zu verändern.

**Pausen mit '-' oder '~'**

```javascript
sound("bd hh - rim")
```

Du siehst wahrscheinlich auch Patterns von anderen Leuten mit '~' als Pausensymbol.
Besonders für deutsche Tastaturen ist `-` eine Alternative zum schwer tippbaren `~`.

**Unter-Sequenzen mit [Klammern]**

```javascript
sound("bd [hh hh] rim [hh hh]")
```

Der Inhalt der Klammer wird ebenfalls zusammengequetscht!

Füge noch mehr Sounds in die Klammern ein!

Genau wie bei der ganzen Sequence wird eine Unter-Sequence schneller je mehr drin ist.

**Multiplikation: Dinge schneller machen**

```javascript
sound("bd hh*2 sd hh*3")
```

**Multiplikation: Vieeeeeeel schneller**

```javascript
sound("bd hh*16 sd hh*8")
```

Tonhöhe = sehr schneller Rhythmus

**Multiplikation: Ganze Unter-Sequences schneller machen**

```javascript
sound("bd [sd hh]*2")
```

Bolero:

```javascript
setcpm(10)
sound("sd sd*3 sd sd*3 sd sd sd sd*3 sd sd*3 sd*3 sd*3")
```

**Unter-Unter-Sequenzen mit [[Klammern]]**

```javascript
sound("bd [[rim rim] hh]")
```

Du kannst so tief verschachteln wie du willst!

**Parallele Sequenzen mit Komma**

```javascript
sound("hh hh hh, bd casio")
```

Du kannst so viele Kommas benutzen wie du möchtest:

```javascript
sound("hh hh hh, bd bd, - casio")
```

Kommas können auch in Unter-Sequenzen verwendet werden:

```javascript
sound("hh hh hh, bd [bd,casio]")
```

Ist dir aufgefallen dass sich die letzten beiden Beispiele gleich anhören?

Es kommt öfter vor, dass man die gleiche Idee auf verschiedene Arten ausdrücken kann.

**Mehrere Zeilen schreiben mit \` (backtick)**

```javascript
sound(`bd*2, - cp,
- - - oh, hh*4,
[- casio]*2`)
```

Ob man " oder \` benutzt ist nur eine Frage der Übersichtlichkeit.

**Sample Nummer separat auswählen**

Benutzt man nur einen Sound mit unterschiedlichen Sample Nummer sieht das so aus:

```javascript
sound("jazz:0 jazz:1 [jazz:4 jazz:2] jazz:3*2")
```

Das gleiche kann man auch so schreiben:

```javascript
n("0 1 [4 2] 3*2").sound("jazz")
```

## Rückblick

Wir haben jetzt die Grundlagen der sogenannten Mini-Notation gelernt, der Rhythmus-Sprache von Tidal.

Das haben wir bisher gelernt:

| Concept               | Syntax      | Example                              |
| --------------------- | ----------- | ------------------------------------ |
| Sequenz               | Leerzeichen | `sound("bd bd sd hh")`               |
| Sound Nummer          | :x          | `sound("hh:0 hh:1 hh:2 hh:3")`       |
| Pausen                | -           | `sound("metal - jazz jazz:1")`       |
| Unter-Sequenzen       | \[\]        | `sound("bd wind [metal jazz] hh")`   |
| Unter-Unter-Sequenzen | \[\[\]\]    | `sound("bd [metal [jazz sd]]")`      |
| Schneller             | \*          | `sound("bd sd*2 cp*3")`              |
| Parallel              | ,           | `sound("bd*2, hh*2 [hh oh]")`        |

Die mit Apostrophen umgebene Mini-Notation benutzt man normalerweise in einer sogenannten Funktion.
Die folgenden Funktionen haben wir bereits gesehen:

| Name   | Description                            | Example                                 |
| ------ | -------------------------------------- | --------------------------------------- |
| sound  | Spielt den Sound mit dem Namen         | `sound("bd sd")`                        |
| bank   | Wählt die Soundbank / Drum Machine     | `sound("bd sd").bank("RolandTR909")`    |
| setcpm | Tempo in **C**ycles **p**ro **M**inute | `setcpm(90); sound("bd sd")`            |
| n      | Sample Nummer                          | `n("0 1 4 2").sound("jazz")`            |

## Beispiele

**Einfacher Rock Beat**

```javascript
setcpm(100/2)
sound("bd sd, hh*4").bank("RolandTR505")
```

**Klassischer House**

```javascript
sound("bd*2, - cp, [- hh]*2").bank("RolandTR909")
```

Ist die aufgefallen dass die letzten 2 Patterns extrem ähnlich sind?
Bestimmte Drum Patterns werden oft genreübergreifend wiederverwendet.

**We Will Rock you**

```javascript
setcpm(81/2)
sound("bd*2 cp").bank("RolandTR707")
```

**Yellow Magic Orchestra - Firecracker**

```javascript
sound("bd sd, - - - hh - hh - -, - perc - perc:1*2")
.bank("RolandCompurhythm1000")
```

**Nachahmung eines 16 step sequencers**

```javascript
setcpm(90/4)
sound(`
[-  -  oh - ] [-  -  -  - ] [-  -  -  - ] [-  -  -  - ],
[hh hh -  - ] [hh -  hh - ] [hh -  hh - ] [hh -  hh - ],
[-  -  -  - ] [cp -  -  - ] [-  -  -  - ] [cp -  -  - ],
[bd -  -  - ] [-  -  -  bd] [-  -  bd - ] [-  -  -  bd]
`)
```

**Noch eins**

```javascript
setcpm(88/4)
sound(`
[-  -  -  - ] [-  -  -  - ] [-  -  -  - ] [-  -  oh:1 - ],
[hh hh hh hh] [hh hh hh hh] [hh hh hh hh] [hh hh -  - ],
[-  -  -  - ] [cp -  -  - ] [-  -  -  - ] [-  cp -  - ],
[bd bd -  - ] [-  -  bd - ] [bd bd - bd ] [-  -  -  - ]
`).bank("RolandTR808")
```

**Nicht so typische Drums**

```javascript
setcpm(100/2)
s(`jazz*2,
insect [crow metal] - -,
- space:4 - space:1,
- wind`)
```

Jetzt haben wir eine grundlegende Ahnung davon wie man mit Strudel Beats baut!
Im nächsten Kapitel werden wir ein paar [Töne spielen](/de/workshop/first-notes).
