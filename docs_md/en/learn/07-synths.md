---
title: Synths
layout: ../../layouts/MainLayout.astro
---

# Synths

In addition to the sampling engine, strudel comes with a synthesizer to create sounds on the fly.

## Basic Waveforms

The basic waveforms are `sine`, `sawtooth`, `square` and `triangle`, which can be selected via `sound` (or `s`):

<!-- MINIREPL_START -->>".fast(2))
.sound("<sawtooth square triangle sine>")
._scope()`}
/>

If you don't set a `sound` but a `note` the default value for `sound` is `triangle`!

## Noise

You can also use noise as a source by setting the waveform to: `white`, `pink` or `brown`. These are different
flavours of noise, here written from hard to soft.

<!-- MINIREPL_START -->")._scope()`} />

Here's a more musical example of how to use noise for hihats:

<!-- MINIREPL_START -->*8")
.decay(.04).sustain(0)._scope()`}
/>

Some amount of pink noise can also be added to any oscillator by using the `noise` paremeter:

<!-- MINIREPL_START -->")._scope()`} />

You can also use the `crackle` type to play some subtle noise crackles. You can control noise amount by using the `density` parameter:

<!-- MINIREPL_START -->".slow(2))._scope()`} />

### Additive Synthesis

Periodic waveforms are composed of several [harmonics](https://en.wikipedia.org/wiki/Harmonic) above a fundamental frequency, lying at integer multiples. These overtones combine to give a sound its unique timbral quality.

For the basic waveforms, we offer you control over these harmonics with the `partials` and `phases` functions.

#### Partials

`partials` refers to the magnitude of each harmonic relative to the fundamental frequency. They can thus be used to spectrally filter these waveforms and tame some of their harshness:

<!-- MINIREPL_START -->>".fast(2))
.sound("sawtooth")
.partials([1, 1, "<1 0>", "<1 0>", "<1 0>", "<1 0>", "<1 0>"])
._scope()`}
/>

`partials` can also be used to construct _new_ waveforms not present in our basic set with the 'user' sound source:

<!-- MINIREPL_START -->>".fast(2))
.sound("user")
.partials([1, 0, 0.3, 0, 0.1, 0, 0, 0.3])
._scope()`}
/>

We may algorithmically construct lists of magnitudes with Javascript code like:

<!-- MINIREPL_START -->>".fast(2))
.sound("saw")
.partials(new Array(numHarmonics).fill(1))
._scope()`}
/>

which acts as a spectral filter. Or:

<!-- MINIREPL_START -->>").fast(2)
.sound("user")
.partials(new Array(50).fill(0)
  .map((_, idx) => ((-1) ** (idx + 1)) / (idx + 1))
)
._scope()`}
/>

which recovers a familiar waveform.

`partials` is also compatible with pattern functions designed to produce lists, like `randL` or `binaryL`:

<!-- MINIREPL_START -->>").fast(2)
.sound("user")
.partials(randL(10))
._scope()`}
/>

and with lists _of_ patterns:

<!-- MINIREPL_START -->>".fast(4))
.sound("user")
.partials([1, 0, "0 1", "0 1 0.3", rand])
._scope()`}
/>

Note that the first value in the `partials` array controls the magnitude of the fundamental harmonic rather than the DC offset, which is fixed at 0.

#### Phases

Earlier, we mentioned that periodic waveforms can be broken into a set of harmonics above a fundamental frequency. Each harmonic has two defining properties: its magnitude (how loud it is) and its phase, which determines where in its cycle that sine wave starts when the waveform is built.

These phases too can be declared in Strudel and can give your sounds interesting depth.

<!-- Interactive example available in web version -->

## Vibrato

### vib

<!-- API documentation available in web version -->

### vibmod

<!-- API documentation available in web version -->

## FM Synthesis

FM Synthesis is a technique that changes the frequency of a basic waveform rapidly to alter the timbre.

You can use fm with any of the above waveforms, although the below examples all use the default triangle wave.

### fm

<!-- API documentation available in web version -->

### fmh

<!-- API documentation available in web version -->

### fmattack

<!-- API documentation available in web version -->

### fmdecay

<!-- API documentation available in web version -->

### fmsustain

<!-- API documentation available in web version -->

### fmenv

<!-- API documentation available in web version -->

## Wavetable Synthesis

Strudel can also use the sampler to load custom waveforms as a replacement of the default waveforms used by WebAudio for the base synth. A default set of more than 1000 wavetables is accessible by default (coming from the [AKWF](https://www.adventurekid.se/akrt/waveforms/adventure-kid-waveforms/) set). You can also import/use your own. A wavetable is a one-cycle waveform, which is then repeated to create a sound at the desired frequency. It is a classic but very effective synthesis technique.

Any sample preceded by the `wt_` prefix will be loaded as a wavetable. This means that the `loop` argument will be set to `1` by default. You can scan over the wavetable by using `loopBegin` and `loopEnd` as well.

<!-- MINIREPL_START -->")
.n("<1 2 3 4 5 6 7 8 9 10>/2").room(0.5).size(0.9)
.s('wt_flute').velocity(0.25).often(n => n.ply(2))
.release(0.125).decay("<0.1 0.25 0.3 0.4>").sustain(0)
.cutoff(2000).cutoff("<1000 2000 4000>").fast(4)
._scope()
`}
/>

## ZZFX

The "Zuper Zmall Zound Zynth" [ZZFX](https://github.com/KilledByAPixel/ZzFX) is also integrated in strudel.
Developed by [Frank Force](https://frankforce.com/), it is a synth and FX engine originally intended to be used for size coding games.

It has 20 parameters in total, here is a snippet that uses all:

<!-- MINIREPL_START -->0 time after pitchJump is applied
  .lfo(0) // >0 resets slide + pitchJump + sets tremolo speed
  .tremolo(0.5) // 0-1 lfo volume modulation amount
  //.duration(.2) // overwrite strudel event duration
  //.gain(1) // change volume
  ._scope() // vizualise waveform (not zzfx related)
`}
/>

Note that you can also combine zzfx with all the other audio fx (next chapter).

Next up: [Audio Effects](/learn/effects)...

