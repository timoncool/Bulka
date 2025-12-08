---
title: Recipes
layout: ../../layouts/MainLayout.astro
---

# Recipes

This page shows possible ways to achieve common (or not so common) musical goals.
There are often many ways to do a thing and there is no right or wrong.
The fun part is that each representation will give you different impulses when improvising.

## Arpeggios

An arpeggio is when the notes of a chord are played in sequence.
We can either write the notes by hand:

<!-- Interactive example available in web version -->

...or use scales:

<!-- Interactive example available in web version -->

...or chord symbols:

<!-- Interactive example available in web version -->

...using off:

<!-- Interactive example available in web version -->

## Chopping Breaks

A sample can be looped and chopped like this:

<!-- Interactive example available in web version -->

This fits the break into 8 cycles + chops it in 16 pieces.
The chops are not audible yet, because we're not doing any manipulation.
Let's add randmized doubling + reversing:

<!-- Interactive example available in web version -->

If we want to specify the order of samples, we can replace `chop` with `slice`:

<!-- MINIREPL_START -->*2")
  .cut(1).rarely(ply("2"))`}
  punchcard
/>

If we use `splice` instead of `slice`, the speed adjusts to the duration of the event:

<!-- MINIREPL_START -->*2")
  .cut(1).rarely(ply("2"))`}
  punchcard
/>

Note that we don't need `fit`, because `splice` will do that by itself.

## Filter Envelopes

Using `lpenv`, we can make the filter move:

<!-- MINIREPL_START --> d2")
  .s("sawtooth")
  .lpf(400).lpenv(4)
  .scope()`}
/>

The type of envelope depends on the methods you're setting. Let's set `lpa`:

<!-- MINIREPL_START --> d2")
  .s("sawtooth").lpq(8)
  .lpf(400).lpa(.2).lpenv(4)
  .scope()`}
/>

Now the filter is attacking, rather than decaying as before (decay is the default). We can also do both

<!-- MINIREPL_START --> d2")
  .s("sawtooth").lpq(8)
  .lpf(400).lpa(.1).lpd(.1).lpenv(4)
  .scope()`}
/>

You can play around with `lpa` | `lpd` | `lps` | `lpd` to see what the filter envelope will do.

## Layering Sounds

We can layer sounds by separating them with ",":

<!-- MINIREPL_START -->")
.s("sawtooth, square") // <------
.scope()`}
/>

We can control the gain of individual sounds like this:

<!-- MINIREPL_START -->")
.s("sawtooth, square:0:.5") // <--- "name:number:gain"
.scope()`}
/>

For more control over each voice, we can use `layer`:

<!-- MINIREPL_START -->").layer(
  x=>x.s("sawtooth").vib(4),
  x=>x.s("square").add(note(12))
).scope()`}
/>

Here, we give the sawtooth a vibrato and the square is moved an octave up.
With `layer`, you can use any pattern method available on each voice, so sky is the limit..

## Oscillator Detune

We can fatten a sound by adding a detuned version to itself:

<!-- MINIREPL_START -->")
.add(note("0,.1")) // <------ chorus
.s("sawtooth").scope()`}
  punchcard
/>

Try out different values, or add another voice!

## Polyrhythms

Here is a simple example of a polyrhythm:

<!-- Interactive example available in web version -->

A polyrhythm is when 2 different tempos happen at the same time.

## Polymeter

This is a polymeter:

<!-- MINIREPL_START -->*4")`} punchcard />

A polymeter is when 2 different bar lengths play at the same tempo.

## Phasing

This is a phasing:

<!-- MINIREPL_START -->*[6,6.1]").piano()`} punchcard />

Phasing happens when the same sequence plays at slightly different tempos.

## Running through samples

Using `run` with `n`, we can rush through a sample bank:

<!-- Interactive example available in web version -->

This works great with sample banks that contain similar sounds, like in this case different recordings of a tabla.
Often times, you'll hear the beginning of the phrase not where the pattern begins.
In this case, I hear the beginning at the third sample, which can be accounted for with `early`.

<!-- Interactive example available in web version -->

Let's add some randomness:

<!-- Interactive example available in web version -->

## Tape Warble

We can emulate a pitch warbling effect like this:

<!-- MINIREPL_START -->*8")
.add(note(perlin.range(0,.5))) // <------ warble
.clip(2).s("gm_electric_guitar_clean")`}
/>

## Sound Duration

There are a number of ways to change the sound duration. Using clip:

<!-- MINIREPL_START -->")`}
/>

The value of clip is relative to the duration of each event.
We can also create overlaps using release:

<!-- MINIREPL_START -->")`}
/>

This will smoothly fade out each sound for the given number of seconds.
We could also make the notes shorter by using a decay envelope:

<!-- MINIREPL_START -->")`}
/>

When using samples, we also have `.end` to cut relative to the sample length:

<!-- MINIREPL_START -->")`} />

Compare that to clip:

<!-- MINIREPL_START -->")`} />

or decay:

<!-- MINIREPL_START -->")`} />

## Wavetable Synthesis

You can loop a sample with `loop` / `loopEnd`:

<!-- MINIREPL_START -->").s("bd").loop(1).loopEnd(.05).gain(.2)`} />

This allows us to play the first 5% of the bass drum as a synth!
To simplify loading wavetables, any sample that starts with `wt_` will be looped automatically:

<!-- Interactive example available in web version -->

Running through different wavetables can also give interesting variations:

<!-- Interactive example available in web version -->

...adding a filter envelope + reverb:

<!-- Interactive example available in web version -->

