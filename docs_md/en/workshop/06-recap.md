---
title: Recap
layout: ../../layouts/MainLayout.astro
---

# Workshop Recap

This page is just a listing of all functions covered in the workshop!

## Mini Notation

| Concept           | Syntax   | Example                                                               |
| ----------------- | -------- | --------------------------------------------------------------------- |
| Sequence          | space    | <!-- Interactive example available in web version --> |
| Sample Number     | :x       | <!-- Interactive example available in web version -->     |
| Rests             | ~        | <!-- Interactive example available in web version -->     |
| Sub-Sequences     | \[\]     | <!-- Interactive example available in web version --> |
| Sub-Sub-Sequences | \[\[\]\] | <!-- Interactive example available in web version -->    |
| Speed up          | \*       | <!-- Interactive example available in web version -->            |
| Parallel          | ,        | <!-- Interactive example available in web version -->      |
| Slow down         | \/       | <!-- Interactive example available in web version -->              |
| Alternate         | \<\>     | <!-- MINIREPL_START -->")`} />                  |
| Elongate          | @        | <!-- Interactive example available in web version -->                    |
| Replicate         | !        | <!-- Interactive example available in web version -->                    |

## Sounds

| Name  | Description                       | Example                                                                 |
| ----- | --------------------------------- | ----------------------------------------------------------------------- |
| sound | plays the sound of the given name | <!-- Interactive example available in web version -->                     |
| bank  | selects the sound bank            | <!-- Interactive example available in web version --> |
| n     | select sample number              | <!-- Interactive example available in web version -->         |

## Notes

| Name      | Description                   | Example                                                                           |
| --------- | ----------------------------- | --------------------------------------------------------------------------------- |
| note      | set pitch as number or letter | <!-- Interactive example available in web version -->               |
| n + scale | set note in scale             | <!-- Interactive example available in web version --> |
| $:        | play patterns in parallel     | <!-- Interactive example available in web version -->             |

## Audio Effects

| name  | example                                                                                 |
| ----- | --------------------------------------------------------------------------------------- |
| lpf   | <!-- Interactive example available in web version -->  |
| vowel | <!-- MINIREPL_START -->")`} /> |
| gain  | <!-- Interactive example available in web version -->                       |
| delay | <!-- Interactive example available in web version -->                        |
| room  | <!-- Interactive example available in web version -->                         |
| pan   | <!-- Interactive example available in web version -->                       |
| speed | <!-- MINIREPL_START -->")`} />             |
| range | <!-- Interactive example available in web version -->                |

## Pattern Effects

| name   | description                         | example                                                                             |
| ------ | ----------------------------------- | ----------------------------------------------------------------------------------- |
| setcpm | sets the tempo in cycles per minute | <!-- Interactive example available in web version -->           |
| fast   | speed up                            | <!-- Interactive example available in web version -->               |
| slow   | slow down                           | <!-- Interactive example available in web version -->               |
| rev    | reverse                             | <!-- Interactive example available in web version -->            |
| jux    | split left/right, modify right      | <!-- Interactive example available in web version -->         |
| add    | add numbers / notes                 | <!-- MINIREPL_START -->")).scale("C:minor")`} /> |
| ply    | speed up each event n times         | <!-- MINIREPL_START -->")`} />                      |
| off    | copy, shift time & modify           | <!-- MINIREPL_START -->x.speed(2))`} />       |

