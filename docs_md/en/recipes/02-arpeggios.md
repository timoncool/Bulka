---
title: Build Arpeggios
layout: ../../layouts/MainLayout.astro
---

Note: This has been (partly) translated from https://tidalcycles.org/docs/patternlib/howtos/buildarpeggios

# Build Arpeggios

This page will teach you how to get started writing arpeggios using different techniques. It is a good way to learn Strudel in a more intuitive way.

## Arpeggios from notes

Start with a simple sequence of notes:

<!-- Interactive example available in web version -->

Now, let's play one per cycle:

<!-- MINIREPL_START -->").piano().slow(2)`} />

On top of that, put a copy of the sequence, offset in time and pitch:

<!-- MINIREPL_START -->".off(1/8, add(7))
  .note().piano().slow(2)`}
/>

Add some structure to the original sequence:

<!-- MINIREPL_START -->"
  .off(1/8, add(7))
  .note().piano().slow(2)`}
/>

Reverse in one speaker:

<!-- MINIREPL_START -->"
  .off(1/8, add(7))
  .note().piano()
  .jux(rev).slow(2)`}
/>

Let's add another layer:

<!-- MINIREPL_START -->"
  .off(1/8, add(7))
  .off(1/8, add(12))
  .note().piano()
  .jux(rev).slow(2)`}
/>

- added slow(2) to approximate tidals cps
- n was replaced with note, because using n does not work as note for samples
- legato 2 was removed because it does not work in combination with rev (bug)

## Arpeggios from chords

TODO

