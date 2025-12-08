---
title: Tonal Functions
layout: ../../layouts/MainLayout.astro
---

# Tonal Functions

These functions use [tonaljs](https://github.com/tonaljs/tonal) to provide helpers for musical operations.

### voicing()

<!-- API documentation available in web version -->

Here's an example of how you can play chords and a bassline:

<!-- MINIREPL_START -->*2")
  .dict('ireal').layer(
  x=>x.struct("[~ x]*2").voicing()
  ,
  x=>n("0*4").set(x).mode("root:g2").voicing()
  .s('sawtooth').cutoff("800:4:2")
)`}
/>

### scale(name)

<!-- API documentation available in web version -->

### transpose(semitones)

Transposes all notes to the given number of semitones:

<!-- MINIREPL_START -->").note()`} />

This method gets really exciting when we use it with a pattern as above.

Instead of numbers, scientific interval notation can be used as well:

<!-- MINIREPL_START -->").note()`} />

### scaleTranspose(steps)

Transposes notes inside the scale by the number of steps:

<!-- MINIREPL_START -->*2")
.note()`}
/>

### rootNotes(octave = 2)

Turns chord symbols into root notes of chords in given octave.

<!-- MINIREPL_START -->*2".rootNotes(3).note()`} />

Together with layer, struct and voicings, this can be used to create a basic backing track:

<!-- MINIREPL_START -->*2".layer(
  x => x.voicings('lefthand').struct("[~ x]*2").note(),
  x => x.rootNotes(2).note().s('sawtooth').cutoff(800)
)`}
/>

