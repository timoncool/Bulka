---
title: Erste Töne
---

# Erste Töne

Jetzt schauen wir uns an wie man mit Tönen mit der `note` Funktion spielt.

## Zahlen und Noten

**Töne mit Zahlen**

```javascript
note("48 52 55 59").sound("piano")
```

Probiere verschiedene Zahlen aus!

Versuch auch mal Kommazahlen, z.B. 55.5 (beachte die englische Schreibweise von Kommazahlen mit "." anstatt ",")

**Töne mit Buchstaben**

```javascript
note("c e g b").sound("piano")
```

Versuch verschiedene Buchstaben aus (a - g).

Findest du Melodien die auch gleichzeitig ein Wort sind? Tipp: ☕ 🙈 🧚

**Vorzeichen**

```javascript
note("db eb gb ab bb").sound("piano")
```

```javascript
note("c# d# f# g# a#").sound("piano")
```

**Andere Oktaven**

```javascript
note("c2 e3 g4 b5").sound("piano")
```

Probiere verschiedene Oktaven aus (1-8)

Normalerweise kommen Leute die keine Noten besser mit Zahlen anstatt mit Buchstaben zurecht.
Daher benutzen die folgenden Beispiele meistens Zahlen.
Später sehen wir auch noch ein paar Tricks die es uns erleichtern Töne zu spielen die zueinander passen.

## Den Sound verändern

Genau wie bei geräuschhaften Sounds können wir den Klang unserer Töne mit `sound` verändern:

```javascript
note("36 43, 52 59 62 64").sound("piano")
```

Probier ein paar sounds aus:

- gm_electric_guitar_muted - E-Gitarre
- gm_acoustic_bass - Kontrabass
- gm_voice_oohs - Chords
- gm_blown_bottle - Flasche
- sawtooth - Sägezahn-Welle
- square - Rechteck-Welle
- triangle - Dreieck-Welle
- Was ist mit bd, sd oder hh?
- Entferne `.sound('...')` komplett

**Zwischen Sounds hin und her wechseln**

```javascript
note("48 67 63 [62, 58]")
.sound("piano gm_electric_guitar_muted")
```

**Gleichzeitige Sounds**

```javascript
note("48 67 63 [62, 58]")
.sound("piano, gm_electric_guitar_muted")
```

Die patterns in `note` und `sound` werden kombiniert!

Wir schauen uns später noch mehr Möglichkeiten an wie man patterns kombiniert.

## Längere Sequenzen

**Sequenzen verlangsamen mit `/`**

```javascript
note("[36 34 41 39]/4").sound("gm_acoustic_bass")
```

Das `/4` spielt die Sequenz 4 mal so langsam, also insgesamt 4 cycles = 8s.

Jede Note ist nun also 2s lang.

Schreib noch mehr Töne in die Klammern und achte darauf dass es schneller wird.

Wenn eine Sequenz unabhängig von ihrem Inhalt immer gleich schnell bleiben soll, gibt es noch eine andere Art Klammern:

**Eins pro Cycle per \< \>**

Im letzten Kapitel haben wir schon gelernt dass `< ... >` (angle brackets) nur ein Element pro Cycle spielt.
Das ist für Melodien auch sehr nützlich:

```javascript
note("<36 34 41 39>").sound("gm_acoustic_bass")
```

Füg noch mehr Töne hinzu und achte darauf wie das Tempo gleich bleibt!

Tatsächlich sind diese Klammern nur eine Abkürzung:

`<a b c>` = `[a b c]/3`

`<a b c d>` = `[a b c d]/4`

usw..

**Eine Sequenz pro Cycle**

```javascript
note("<[36 48] [34 46] [41 53] [39 51]>")
.sound("gm_acoustic_bass")
```

oder auch...

```javascript
note("<[36 48]*4 [34 46]*4 [41 53]*4 [39 51]*4>/2")
.sound("gm_acoustic_bass")
```

**Alternativen**

Ähnlich wie Unter-Sequenzen, kann auch `<...>` innerhalb einer Sequenz verwendet werden:

```javascript
note("60 <63 62 65 63>")
.sound("gm_xylophone")
```

Das ist auch praktisch für atonale Sounds:

```javascript
sound("bd*2, ~ <sd cp>, [~ hh]*2")
.bank("RolandTR909")
```

## Skalen

Es kann mühsam sein die richtigen Noten zu finden wenn man alle zur Verfügung hat.
Mit Skalen ist das einfacher:

```javascript
n("0 2 4 <[6,8] [7,9]>")
.scale("C:minor").sound("piano")
```

Probier verschiedene Zahlen aus. Jede klingt gut!

Probier verschiedene Skalen:

- C:major
- A2:minor
- D:dorian
- G:mixolydian
- A2:minor:pentatonic
- F:major:pentatonic

**Automatisierte Skalen**

Wie alle Funktionen können auch Skalen mit einem Pattern automatisiert werden:

```javascript
n("<0 -3>, 2 4 <[6,8] [7,9]>")
.scale("<C:major D:mixolydian>/4")
.sound("piano")
```

Wenn du keine Ahnung hast was die Skalen bedeuten, keine Sorge.
Es sind einfach nur Namen für verschiedene Gruppen von Tönen die gut zusammenpassen.

Nimm dir Zeit um herauszufinden welche Skalen du magst.

## Wiederholen und Verlängern

**Verlängern mit @**

```javascript
note("c@3 eb").sound("gm_acoustic_bass")
```

Ein Element ohne `@` ist gleichbedeutend mit `@1`. Im Beispiel ist `c` drei Einheiten lang, `eb` nur eine.

Spiel mit der Länge!

**Unter-Sequenzen verlängern**

```javascript
n("<[4@2 4] [5@2 5] [6@2 6] [5@2 5]>*2")
.scale("<C2:mixolydian F2:mixolydian>/4")
.sound("gm_acoustic_bass")
```

Dieser Groove wird auch `shuffle` genannt.
Jeder Schlag enthält 2 Töne, wobei der erste doppelt so lang wie der zweite ist.
Das nennt man auch manchmal `triolen swing`. Es ist ein typischer Rhythmus im Blues und Jazz.

**Wiederholen**

```javascript
note("c!2 [eb,<g a bb a>]").sound("piano")
```

Wechsel zwischen `!`, `*` und `@` hin und her.

Was ist der Unterschied?

## Rückblick

Das haben wir in diesem Kapitel gelernt:

| Concept      | Syntax | Example                       |
| ------------ | ------ | ----------------------------- |
| Verlangsamen | \/     | `note("[c a f e]/2")`         |
| Alternativen | \<\>   | `note("c <e g>")`             |
| Verlängern   | @      | `note("c@3 e")`               |
| Wiederholen  | !      | `note("c!3 e")`               |

Neue Funktionen:

| Name  | Description                             | Example                                             |
| ----- | --------------------------------------- | --------------------------------------------------- |
| note  | Tonhöhe als Buchstabe oder Zahl         | `note("b g e c").sound("piano")`                    |
| scale | Interpretiert `n` als Skalenstufe       | `n("6 4 2 0").scale("C:minor").sound("piano")`      |
| stack | Spiele mehrere Patterns parallel (s.u.) | `stack(s("bd sd"),note("c eb g"))`                  |

## Beispiele

**Bassline**

```javascript
note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2")
.sound("gm_synth_bass_1")
.lpf(800) // <-- we'll learn about this soon
```

**Melodie**

```javascript
n(`<
[~ 0] 2 [0 2] [~ 2]
[~ 0] 1 [0 1] [~ 1]
[~ 0] 3 [0 3] [~ 3]
[~ 0] 2 [0 2] [~ 2]
>*2`).scale("C4:minor")
.sound("gm_synth_strings_1")
```

**Drums**

```javascript
sound("bd*2, ~ <sd cp>, [~ hh]*2")
.bank("RolandTR909")
```

**Wenn es doch nur einen Weg gäbe das alles gleichzeitig zu spielen.......**

Das geht mit `stack` 😙

```javascript
stack(
  note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2")
  .sound("gm_synth_bass_1").lpf(800),
  n(`<
  [~ 0] 2 [0 2] [~ 2]
  [~ 0] 1 [0 1] [~ 1]
  [~ 0] 3 [0 3] [~ 3]
  [~ 0] 2 [0 2] [~ 2]
  >*2`).scale("C4:minor")
  .sound("gm_synth_strings_1"),
  sound("bd*2, ~ <sd cp>, [~ hh]*2")
  .bank("RolandTR909")
)
```

Das hört sich doch langsam nach echter Musik an!
Wir haben Sounds, wir haben Töne.. noch ein Puzzleteil fehlt: [Effekte](/de/workshop/first-effects)
