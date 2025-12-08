---
title: Build Arpeggios
layout: ../../layouts/MainLayout.astro
---

Note: This has been (partly) translated from https://tidalcycles.org/docs/patternlib/howtos/buildarpeggios

# Build Arpeggios

This page will teach you how to get started writing arpeggios using different techniques. It is a good way to learn Strudel in a more intuitive way.

## Arpeggios from notes

Start with a simple sequence of notes:

```javascript
note("c a f e").piano().slow(2)
```

Now, let's play one per cycle:

```javascript
note("<c a f e>").piano().slow(2)
```

On top of that, put a copy of the sequence, offset in time and pitch:

```javascript
"<c a f e>".off(1/8, add(7))
  .note().piano().slow(2)
```

Add some structure to the original sequence:

```javascript
"<c*2 a(3,8) f(3,8,2) e*2>"
  .off(1/8, add(7))
  .note().piano().slow(2)
```

Reverse in one speaker:

```javascript
"<c*2 a(3,8) f(3,8,2) e*2>"
  .off(1/8, add(7))
  .note().piano()
  .jux(rev).slow(2)
```

Let's add another layer:

```javascript
"<c*2 a(3,8) f(3,8,2) e*2>"
  .off(1/8, add(7))
  .off(1/8, add(12))
  .note().piano()
  .jux(rev).slow(2)
```

- added slow(2) to approximate tidals cps
- n was replaced with note, because using n does not work as note for samples
- legato 2 was removed because it does not work in combination with rev (bug)

## Arpeggios from chords

TODO
