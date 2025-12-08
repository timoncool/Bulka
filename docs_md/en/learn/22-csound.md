---
title: Csound
layout: ../../layouts/MainLayout.astro
---

# Using CSound with Strudel

🧪 Strudel has experimental support for csound, using [@csound/browser](https://www.npmjs.com/package/@csound/browser).

## Importing .orc files

To use existing csound instruments, you can load and use an orc file from an URL like this:

<!-- Interactive example available in web version -->

Note that the above url uses the `github:` shortcut, which resolves to the raw file on github, but you can use any URL you like.

The awesome [`livecode.orc by Steven Yi`](https://github.com/kunstmusik/csound-live-code) comes packed with many sounds ready for use:

<!-- MINIREPL_START -->0.025 index, nice for bass
"Noi", // 	Filtered noise, exponential envelope
"Wobble", // 	Wobble patched based on Jacob Joaquin's "Tempo-Synced Wobble Bass"
"Sine", // 	Simple Sine-wave instrument with exponential envelope
"Square", // 	Simple Square-wave instrument with exponential envelope
"Saw", // 	Simple Sawtooth-wave instrument with exponential envelope
"Squine1", // 	Squinewave Synth, 2 osc
"Form1", // 	Formant Synth, buzz source, soprano ah formants
"Mono", // 	Monophone synth using sawtooth wave and 4pole lpf. Use "start("Mono") to run the monosynth, then use MonoNote instrument to play the instrument.
"MonoNote", // 	Note playing instrument for Mono synth. Be careful to use this and not try to create multiple Mono instruments!
"Click", // 	Bandpass-filtered impulse glitchy click sound. p4 = center frequency (e.g., 3000, 6000)
"NoiSaw", // 	Highpass-filtered noise+saw sound. Use NoiSaw.cut channel to adjust cutoff.
"Clap", // 	Modified clap instrument by Istvan Varga (clap1.orc)
"BD", // 	Bass Drum - From Iain McCurdy's TR-808.csd
"SD", // 	Snare Drum - From Iain McCurdy's TR-808.csd
"OHH", // 	Open High Hat - From Iain McCurdy's TR-808.csd
"CHH", // 	Closed High Hat - From Iain McCurdy's TR-808.csd
"HiTom", // 	High Tom - From Iain McCurdy's TR-808.csd
"MidTom", // 	Mid Tom - From Iain McCurdy's TR-808.csd
"LowTom", // 	Low Tom - From Iain McCurdy's TR-808.csd
"Cymbal", // 	Cymbal - From Iain McCurdy's TR-808.csd
"Rimshot", // 	Rimshot - From Iain McCurdy's TR-808.csd
"Claves", // 	Claves - From Iain McCurdy's TR-808.csd
"Cowbell", // 	Cowbell - From Iain McCurdy's TR-808.csd
"Maraca", // 	Maraca - from Iain McCurdy's TR-808.csd
"HiConga", // 	High Conga - From Iain McCurdy's TR-808.csd
"MidConga", // 	Mid Conga - From Iain McCurdy's TR-808.csd
"LowConga", // 	Low Conga - From Iain McCurdy's TR-808.csd
))`}
/>

## Writing your own instruments

You can define your own instrument(s) with `loadCsound` like this:

<!-- MINIREPL_START -->"
.off(1/4, add(2))
.off(1/2, add(6))
.scale('D minor')
.note()
.csound('CoolSynth')`}
/>

## Parameters

The `.csound` function sends the following p values:

|     |                                  |
| --- | -------------------------------- |
| p1  | instrument name e.g. `CoolSynth` |
| p2  | time offset, when it should play |
| p3  | the duration of the event / hap  |
| p4  | frequency in Hertz               |
| p5  | normalized `gain`, 0-1           |

There is an alternative `.csoundm` function with a different flavor:

|     |                                   |
| --- | --------------------------------- |
| p4  | midi key number, unrounded, 0-127 |
| p5  | midi velocity, 0-127              |

In both cases, p4 is derived from the value of `freq` or `note`.

## Limitations / Future Plans

Apart from the above listed p values, no other parameter can be patterned so far.
This also means that [audio effects](/learn/effects/) will not work.
In the future, the integration could be improved by passing all patterned control parameters to the csound instrument.
This could work by a unique [channel](https://kunstmusik.github.io/icsc2022-csound-web/tutorial2-interacting-with-csound/#step-4---writing-continuous-data-channels)
for each value. Channels could be read [like this](https://github.com/csound/csound/blob/master/Android/CsoundForAndroid/CsoundAndroidExamples/src/main/res/raw/multitouch_xy.csd).
Also, it might make sense to have a standard library of csound instruments for strudel's effects.

Now, let's dive into the [Functional JavaScript API](/functions/intro)

