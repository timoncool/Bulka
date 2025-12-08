---
title: Recap
layout: ../../layouts/MainLayout.astro
---

# Workshop Recap

This page is just a listing of all functions covered in the workshop!

## Mini Notation

| Concept           | Syntax   | Example                                                               |
| ----------------- | -------- | --------------------------------------------------------------------- |
| Sequence          | space    | `sound("bd bd sd hh bd cp sd hh")` |
| Sample Number     | :x       | `sound("hh:0 hh:1 hh:2 hh:3")`     |
| Rests             | ~        | `sound("metal ~ jazz jazz:1")`     |
| Sub-Sequences     | \[\]     | `sound("bd wind [metal jazz] hh")` |
| Sub-Sub-Sequences | \[\[\]\] | `sound("bd [metal [jazz sd]]")`    |
| Speed up          | \*       | `sound("bd sd*2 cp*3")`            |
| Parallel          | ,        | `sound("bd*2, hh*2 [hh oh]")`      |
| Slow down         | \/       | `note("[c a f e]/2")`              |
| Alternate         | \<\>     | `note("c <e g>")`                  |
| Elongate          | @        | `note("c@3 e")`                    |
| Replicate         | !        | `note("c!3 e")`                    |

## Sounds

| Name  | Description                       | Example                                                                 |
| ----- | --------------------------------- | ----------------------------------------------------------------------- |
| sound | plays the sound of the given name | `sound("bd sd")`                     |
| bank  | selects the sound bank            | `sound("bd sd").bank("RolandTR909")` |
| n     | select sample number              | `n("0 1 4 2").sound("jazz")`         |

## Notes

| Name      | Description                   | Example                                                                           |
| --------- | ----------------------------- | --------------------------------------------------------------------------------- |
| note      | set pitch as number or letter | `note("b g e c").sound("piano")`               |
| n + scale | set note in scale             | `n("6 4 2 0").scale("C:minor").sound("piano")` |
| $:        | play patterns in parallel     | `$: s("bd sd")` and `$: note("c eb g")`             |

## Audio Effects

| name  | example                                                                                 |
| ----- | --------------------------------------------------------------------------------------- |
| lpf   | `note("c2 c3 c2 c3").s("sawtooth").lpf("400 2000")`  |
| vowel | `note("c3 eb3 g3").s("sawtooth").vowel("<a e i o>")` |
| gain  | `s("hh*16").gain("[.25 1]*4")`                       |
| delay | `s("bd rim bd cp").delay(.5)`                        |
| room  | `s("bd rim bd cp").room(.5)`                         |
| pan   | `s("bd rim bd cp").pan("0 1")`                       |
| speed | `s("bd rim bd cp").speed("<1 2 -1 -2>")`             |
| range | `s("hh*32").lpf(saw.range(200,4000))`                |

## Pattern Effects

| name   | description                         | example                                                                             |
| ------ | ----------------------------------- | ----------------------------------------------------------------------------------- |
| setcpm | sets the tempo in cycles per minute | `setcpm(45); sound("bd sd [~ bd] sd")`           |
| fast   | speed up                            | `sound("bd sd [~ bd] sd").fast(2)`               |
| slow   | slow down                           | `sound("bd sd [~ bd] sd").slow(2)`               |
| rev    | reverse                             | `n("0 2 4 6").scale("C:minor").rev()`            |
| jux    | split left/right, modify right      | `n("0 2 4 6").scale("C:minor").jux(rev)`         |
| add    | add numbers / notes                 | `n("0 2 4 6".add("<0 1 2 1>")).scale("C:minor")` |
| ply    | speed up each event n times         | `s("bd sd").ply("<1 2 3>")`                      |
| off    | copy, shift time & modify           | `s("bd sd, hh*4").off(1/8, x=>x.speed(2))`       |
