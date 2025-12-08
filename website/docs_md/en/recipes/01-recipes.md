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

```javascript
note("c eb g c4")
.clip(2).s("gm_electric_guitar_clean")
```

...or use scales:

```javascript
n("0 2 4 7").scale("C:minor")
.clip(2).s("gm_electric_guitar_clean")
```

...or chord symbols:

```javascript
n("0 1 2 3").chord("Cm").mode("above:c3").voicing()
.clip(2).s("gm_electric_guitar_clean")
```

...using off:

```javascript
"0"
  .off(1/3, add(2))
  .off(1/2, add(4))
  .n()
  .scale("C:minor")
  .s("gm_electric_guitar_clean")
```

## Chopping Breaks

A sample can be looped and chopped like this:

```javascript
samples('github:yaxu/clean-breaks')
s("amen/4").fit().chop(32)
```

This fits the break into 8 cycles + chops it in 16 pieces.
The chops are not audible yet, because we're not doing any manipulation.
Let's add randmized doubling + reversing:

```javascript
samples('github:yaxu/clean-breaks')
s("amen/4").fit().chop(16).cut(1)
.sometimesBy(.5, ply("2"))
.sometimesBy(.25, mul(speed("-1")))
```

If we want to specify the order of samples, we can replace `chop` with `slice`:

```javascript
samples('github:yaxu/clean-breaks')
s("amen/4").fit()
  .slice(8, "<0 1 2 3 4*2 5 6 [6 7]>*2")
  .cut(1).rarely(ply("2"))
```

If we use `splice` instead of `slice`, the speed adjusts to the duration of the event:

```javascript
samples('github:yaxu/clean-breaks')
s("amen")
  .splice(8, "<0 1 2 3 4*2 5 6 [6 7]>*2")
  .cut(1).rarely(ply("2"))
```

Note that we don't need `fit`, because `splice` will do that by itself.

## Filter Envelopes

Using `lpenv`, we can make the filter move:

```javascript
note("g1 bb1 <c2 eb2> d2")
  .s("sawtooth")
  .lpf(400).lpenv(4)
  .scope()
```

The type of envelope depends on the methods you're setting. Let's set `lpa`:

```javascript
note("g1 bb1 <c2 eb2> d2")
  .s("sawtooth").lpq(8)
  .lpf(400).lpa(.2).lpenv(4)
  .scope()
```

Now the filter is attacking, rather than decaying as before (decay is the default). We can also do both

```javascript
note("g1 bb1 <c2 eb2> d2")
  .s("sawtooth").lpq(8)
  .lpf(400).lpa(.1).lpd(.1).lpenv(4)
  .scope()
```

You can play around with `lpa` | `lpd` | `lps` | `lpd` to see what the filter envelope will do.

## Layering Sounds

We can layer sounds by separating them with ",":

```javascript
note("<g1 bb1 d2 f1>")
.s("sawtooth, square") // <------
.scope()
```

We can control the gain of individual sounds like this:

```javascript
note("<g1 bb1 d2 f1>")
.s("sawtooth, square:0:.5") // <--- "name:number:gain"
.scope()
```

For more control over each voice, we can use `layer`:

```javascript
note("<g1 bb1 d2 f1>").layer(
  x=>x.s("sawtooth").vib(4),
  x=>x.s("square").add(note(12))
).scope()
```

Here, we give the sawtooth a vibrato and the square is moved an octave up.
With `layer`, you can use any pattern method available on each voice, so sky is the limit..

## Oscillator Detune

We can fatten a sound by adding a detuned version to itself:

```javascript
note("<g1 bb1 d2 f1>")
.add(note("0,.1")) // <------ chorus
.s("sawtooth").scope()
```

Try out different values, or add another voice!

## Polyrhythms

Here is a simple example of a polyrhythm:

```javascript
s("bd*2,hh*3")
```

A polyrhythm is when 2 different tempos happen at the same time.

## Polymeter

This is a polymeter:

```javascript
s("<bd rim, hh hh oh>*4")
```

A polymeter is when 2 different bar lengths play at the same tempo.

## Phasing

This is a phasing:

```javascript
note("<C D G A Bb D C A G D Bb A>*[6,6.1]").piano()
```

Phasing happens when the same sequence plays at slightly different tempos.

## Running through samples

Using `run` with `n`, we can rush through a sample bank:

```javascript
samples('bubo:fox')
n(run(8)).s("ftabla")
```

This works great with sample banks that contain similar sounds, like in this case different recordings of a tabla.
Often times, you'll hear the beginning of the phrase not where the pattern begins.
In this case, I hear the beginning at the third sample, which can be accounted for with `early`.

```javascript
samples('bubo:fox')
n(run(8)).s("ftabla").early(2/8)
```

Let's add some randomness:

```javascript
samples('bubo:fox')
n(run(8)).s("ftabla").early(2/8)
.sometimes(mul(speed("1.5")))
```

## Tape Warble

We can emulate a pitch warbling effect like this:

```javascript
note("<c4 bb f eb>*8")
.add(note(perlin.range(0,.5))) // <------ warble
.clip(2).s("gm_electric_guitar_clean")
```

## Sound Duration

There are a number of ways to change the sound duration. Using clip:

```javascript
note("f ab bb c")
.clip("<2 1 .5 .25>")
```

The value of clip is relative to the duration of each event.
We can also create overlaps using release:

```javascript
note("f ab bb c")
.release("<2 1 .5 .25>")
```

This will smoothly fade out each sound for the given number of seconds.
We could also make the notes shorter by using a decay envelope:

```javascript
note("f ab bb c")
.decay("<2 1 .5 .25>")
```

When using samples, we also have `.end` to cut relative to the sample length:

```javascript
s("oh*4").end("<1 .5 .25 .1>")
```

Compare that to clip:

```javascript
s("oh*4").clip("<1 .5 .25 .1>")
```

or decay:

```javascript
s("oh*4").decay("<1 .5 .25 .1>")
```

## Wavetable Synthesis

You can loop a sample with `loop` / `loopEnd`:

```javascript
note("<c eb g f>").s("bd").loop(1).loopEnd(.05).gain(.2)
```

This allows us to play the first 5% of the bass drum as a synth!
To simplify loading wavetables, any sample that starts with `wt_` will be looped automatically:

```javascript
samples('github:bubobubobubobubo/dough-waveforms')
note("c eb g bb").s("wt_dbass").clip(2)
```

Running through different wavetables can also give interesting variations:

```javascript
samples('github:bubobubobubobubo/dough-waveforms')
note("c2*8").s("wt_dbass").n(run(8)).fast(2)
```

...adding a filter envelope + reverb:

```javascript
samples('github:bubobubobubobubo/dough-waveforms')
note("c2*8").s("wt_dbass").n(run(8))
.lpf(perlin.range(100,1000).slow(8))
.lpenv(-3).lpa(.1).room(.5).fast(2)
```
