---
title: Recap
---

# Workshop Rückblick

Diese Seite ist eine Auflistung aller im Workshop vorgestellten Funktionen.

## Mini Notation

| Konzept               | Syntax   | Beispiel                            |
| --------------------- | -------- | ----------------------------------- |
| Sequenz               | space    | `sound("bd bd sn hh")`              |
| Sample-Nummer         | :x       | `sound("hh:0 hh:1 hh:2 hh:3")`      |
| Pausen                | ~        | `sound("metal ~ jazz jazz:1")`      |
| Unter-Sequenzen       | \[\]     | `sound("bd wind [metal jazz] hh")`  |
| Unter-Unter-Sequenzen | \[\[\]\] | `sound("bd [metal [jazz sn]]")`     |
| Schneller             | \*       | `sound("bd sn*2 cp*3")`             |
| Verlangsamen          | \/       | `note("[c a f e]/2")`               |
| Parallel              | ,        | `sound("bd*2, hh*2 [hh oh]")`       |
| Alternieren           | \<\>     | `note("c <e g>")`                   |
| Verlängern            | @        | `note("c@3 e")`                     |
| Wiederholen           | !        | `note("c!3 e")`                     |

## Sounds

| Name  | Beschreibung               | Beispiel                                |
| ----- | -------------------------- | --------------------------------------- |
| sound | spielt den Sound mit Namen | `sound("bd sd")`                        |
| bank  | wählt die Soundbank        | `sound("bd sd").bank("RolandTR909")`    |
| n     | wählt Sample mit Nummer    | `n("0 1 4 2").sound("jazz")`            |

## Noten

| Name      | Beschreibung                       | Beispiel                                         |
| --------- | ---------------------------------- | ------------------------------------------------ |
| note      | wählt Note per Zahl oder Buchstabe | `note("b g e c").sound("piano")`                 |
| n + scale | wählt Note n in Skala              | `n("6 4 2 0").scale("C:minor").sound("piano")`   |
| stack     | spielt mehrere Patterns parallel   | `stack(s("bd sd"),note("c eb g"))`               |

## Audio-Effekte

| Name  | Beispiele                                           |
| ----- | --------------------------------------------------- |
| lpf   | `note("c2 c3").s("sawtooth").lpf("<400 2000>")`     |
| vowel | `note("c3 eb3 g3").s("sawtooth").vowel("<a e i o>")` |
| gain  | `s("hh*8").gain("[.25 1]*2")`                       |
| delay | `s("bd rim").delay(.5)`                             |
| room  | `s("bd rim").room(.5)`                              |
| pan   | `s("bd rim").pan("0 1")`                            |
| speed | `s("bd rim").speed("<1 2 -1 -2>")`                  |
| range | `s("hh*16").lpf(saw.range(200,4000))`               |

## Pattern-Effekte

| Name   | Beschreibung                      | Beispiel                                            |
| ------ | --------------------------------- | --------------------------------------------------- |
| setcpm | Tempo in Cycles pro Minute        | `setcpm(90); sound("bd sd")`                        |
| fast   | schneller                         | `sound("bd sd").fast(2)`                            |
| slow   | langsamer                         | `sound("bd sd").slow(2)`                            |
| rev    | rückwärts                         | `n("0 2 4 6").scale("C:minor").rev()`               |
| jux    | einen Stereo-Kanal modifizieren   | `n("0 2 4 6").scale("C:minor").jux(rev)`            |
| add    | addiert Zahlen oder Noten         | `n("0 2 4 6".add("<0 1 2 1>")).scale("C:minor")`    |
| ply    | jedes Element schneller machen    | `s("bd sd").ply("<1 2 3>")`                         |
| off    | verzögert eine modifizierte Kopie | `s("bd sd, hh*4").off(1/8, x=>x.speed(2))`          |
