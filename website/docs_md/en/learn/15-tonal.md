---
title: Tonal Functions
layout: ../../layouts/MainLayout.astro
---


```javascript
chord("<C^7 A7b13 Dm7 G7>*2")
  .dict('ireal').layer(
  x=>x.struct("[~ x]*2").voicing()
  ,
  x=>n("0*4").set(x).mode("root:g2").voicing()
  .s('sawtooth').cutoff("800:4:2")
)
```

# Tonal Functions

These functions use [tonaljs](https://github.com/tonaljs/tonal) to provide helpers for musical operations.


```javascript
"[c2 c3]*4".transpose("<0 -2 5 3>").note()
```

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


```javascript
"[c2 c3]*4".transpose("<1P -2M 4P 3m>").note()
```

### scale(name)

<!-- API documentation available in web version -->


```javascript
"[-8 [2,4,6]]*2"
.scale('C4 bebop major')
.scaleTranspose("<0 -1 -2 -3 -4 -5 -6 -4>*2")
.note()
```

### transpose(semitones)

Transposes all notes to the given number of semitones:

<!-- MINIREPL_START -->").note()`} />

This method gets really exciting when we use it with a pattern as above.

Instead of numbers, scientific interval notation can be used as well:

<!-- MINIREPL_START -->").note()`} />


```javascript
"<C^7 A7b13 Dm7 G7>*2".rootNotes(3).note()
```

### scaleTranspose(steps)

Transposes notes inside the scale by the number of steps:

<!-- MINIREPL_START -->*2")
.note()`}
/>


```javascript
"<C^7 A7b13 Dm7 G7>*2".layer(
  x => x.voicings('lefthand').struct("[~ x]*2").note(),
  x => x.rootNotes(2).note().s('sawtooth').cutoff(800)
)
```

### rootNotes(octave = 2)

Turns chord symbols into root notes of chords in given octave.

<!-- MINIREPL_START -->*2".rootNotes(3).note()`} />

Together with layer, struct and voicings, this can be used to create a basic backing track:

<!-- MINIREPL_START -->*2".layer(
  x => x.voicings('lefthand').struct("[~ x]*2").note(),
  x => x.rootNotes(2).note().s('sawtooth').cutoff(800)
)`}
/>

