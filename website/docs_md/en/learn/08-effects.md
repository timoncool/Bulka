---
title: Audio effects
layout: ../../layouts/MainLayout.astro
---


```javascript
note("[c eb g <f bb>](3,8,<0 1>)".sub(12))
  .s("<sawtooth>/64")
  .lpf(sine.range(300,2000).slow(16))
  .lpa(0.005)
  .lpd(perlin.range(.02,.2))
  .lps(perlin.range(0,.5).slow(3))
  .lpq(sine.range(2,10).slow(32))
  .release(.5)
  .lpenv(perlin.range(1,8).slow(2))
  .ftype('24db')
  .room(1)
  .juxBy(.5,rev)
  .sometimes(add(note(12)))
  .stack(s("bd*2").bank('RolandTR909'))
  .gain(.5).fast(2)
```

# Audio Effects

Whether you're using a synth or a sample, you can apply any of the following built-in audio effects.
As you might suspect, the effects can be chained together, and they accept a pattern string as their argument.


```javascript
n("<-4,0 5 2 1>*<2!3 4>")
  .scale("<C F>/8:pentatonic")
  .s("gm_electric_guitar_jazz")
  .penv("<.5 0 7 -2>*2").vib("4:.1")
  .phaser(2).delay(.25).room(.3)
  .size(4).fast(1.5)
```

# Signal chain

<img src="/img/strudel-signal-flow.png"></img>

The signal chain in Strudel is as follows:

- An sound-generating event is triggered by a pattern
  - This has a start time and a duration, which is usually
    controlled by the note length and ADSR parameters
  - If we exceed the max polyphony, old sounds begin to die off
  - Muted sounds (one whose `s` value is `-`, `~`, or `_`) are skipped
- A sound is produced (through, say, a sample or an oscillator)
  - This is where detune-based effects (like `detune`, `penv`, etc. occur)
- The following will occur _in order_ and only if they've been called in the pattern. Note that all of these are
  single use effects, meaning that multiple occurrences of them in a pattern will simply override the values
  (e.g. you can't do `s("bd").lpf(100).distort(2).lpf(800)` to lowpass, distort, and then lowpass
  again)
  - Phase vocoder (`stretch`)
  - Gain is applied (`gain`)
    - This is where the main (volume) ADSR happens
  - A lowpass filter (`lpf`)
  - A highpass filter (`hpf`)
  - A bandpass filter (`bandpass`)
  - A vowel filter (`vowel`)
  - Sample rate reduction (`coarse`)
  - Bit crushing (`crush`)
  - Waveshape distortion (`shape`)
  - Normal distortion (`distort`)
  - Tremolo (`tremolo`)
  - Compressor (`compressor`)
  - Panning (`pan`)
  - Phaser (`phaser`)
  - Postgain (`post`)
- The sound is then split into multiple destinations
  - Dry output (amount controlled by `dry` parameter)
  - The sends
    - Analyzers
      - These are used for tooling like `scope` and `spectrum` and their setup usually happens behind the scenes
    - Delay (amount controlled by `delay` parameter)
    - Reverb (amount controlled by `room` parameter)
- The dry output, delay, and reverb are joined into what is called the "orbit" of the pattern (see more in the section below)
  - The `duck` effect affects the volume of all signals in the orbit
  - The orbit is then sent to the mixer


```javascript
n(run("<4 8>/16")).jux(rev)
.chord("<C^7 <Db^7 Fm7>>")
.dict('ireal')
.voicing().add(note("<0 1>/8"))
.dec(.1).room(.2)
.segment("<4 [2 8]>")
.penv("<0 <2 -2>>").patt(.02).fast(2)
```

## Orbits

Orbits are the way in which outputs are handled in Strudel. They also prescribe which delay and reverb to associate with the dry signal.
By default, all orbits are mixed down to channels `1` and `2` in stereo, however with the "Multi Channel Orbits" setting
(under Settings at the right) you can use them as individual 2 channel stereo outs (orbit `i` will be mapped to
to channels `2i` and `2i + 1`). You can then use routers like Blackhole 16 to retrieve and record all of the channels in a DAW for later processing.

The default orbit is `1` and it is set with `orbit`. You may send a sound to multiple orbits via mininotation


```javascript
s("white").orbit("2,3,4").gain(0.2)
```


but please be careful as this will create three copies of the sound behind the scenes, meaning that if they are mixed
down to a single output, they will triple the volume. We've reduced the gain here to save your ears.

⚠️ There is only one delay and reverb per orbit, so please be aware that if you attempt to change the parameters on two
patterns pointing to the same orbit, it can lead to unpredictable results. Compare, for example, this pretty pluck
with a large reverb:


```javascript
$: s("triangle*4").decay(0.5).n(irand(12)).scale('C minor')
  .room(1).roomsize(10)
```


versus the same pluck with a muted kick drum coming in and overwriting the `roomsize` value:


```javascript
$: s("triangle*4").decay(0.5).n(irand(12)).scale('C minor')
  .room(1).roomsize(10)

$: s("bd\*4").room(0.01).roomsize(0.01).postgain(0)
```


This is due to them sharing the same orbit: the default of `1`. It can be corrected simply by updating the orbits to be
distinct:


```javascript
$: s("triangle*4").decay(0.5).n(irand(12)).scale('C minor')
  .room(1).roomsize(10).orbit(2)

$: s("bd\*4").room(0.01).roomsize(0.01).postgain(0)
```


## Continuous changes

As all of the above is triggered by a _sound occurring_, it is often the case that parameters may not be
modified continuously in time. For example,


```javascript
s("supersaw").lpf(tri.range(100, 5000).slow(2))
```


Will not produce a continually LFO'd low-pass filter due to the `tri` only being sampled every time the note hits
(in this case the default of once per cycle). You can fake it by introducing more sound-generating events, e.g.:


```javascript
s("supersaw").seg(16).lpf(tri.range(100, 5000).slow(2))
```


Some parameters _do_ induce continuous variations in time, though:

- The ADSR curve (governed by `attack`, `sustain`, `decay`, `release`)
- The pitch envelope curve (governed by `penv` and its associated ADSR)
- The FM curve (`fmenv`)
- The filter envelopes (`lpenv`, `hpenv`, `bpenv`)
- Tremolo (`tremolo`)
- Phaser (`phaser`)
- Vibrato (`vib`)
- Ducking (`duckorbit`)

# Filters

Filters are an essential building block of [subtractive synthesis](https://en.wikipedia.org/wiki/Subtractive_synthesis).
Strudel comes with 3 types of filters:

- low-pass filter: low frequencies may _pass_, high frequencies are cut off
- high-pass filter: high frequencies may _pass_, low frequencies are cut off
- band-pass filters: only a frequency band may _pass_, low and high frequencies around are cut off

Each filter has 2 parameters:

- cutoff: the frequency at which the filter starts to work. e.g. a low-pass filter with a cutoff of 1000Hz allows frequencies below 1000Hz to pass.
- q-value: Controls the resonance of the filter. Higher values sound more aggressive. Also see [Q-Factor](https://en.wikipedia.org/wiki/Q_factor)

## lpf

<!-- API documentation available in web version -->

## lpq

<!-- API documentation available in web version -->

## hpf

<!-- API documentation available in web version -->

## hpq

<!-- API documentation available in web version -->

## bpf

<!-- API documentation available in web version -->

## bpq

<!-- API documentation available in web version -->

## ftype

<!-- API documentation available in web version -->

## vowel

<!-- API documentation available in web version -->

# Amplitude Modulation

Amplitude modulation changes the amplitude (gain) periodically over time.

## am

<!-- API documentation available in web version -->

## tremolosync

<!-- API documentation available in web version -->

## tremolodepth

<!-- API documentation available in web version -->

## tremoloskew

<!-- API documentation available in web version -->

## tremolophase

<!-- API documentation available in web version -->

## tremoloshape

<!-- API documentation available in web version -->

# Amplitude Envelope

The amplitude [envelope](<https://en.wikipedia.org/wiki/Envelope_(music)>) controls the dynamic contour of a sound.
Strudel uses ADSR envelopes, which are probably the most common way to describe an envelope:

![ADSR](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/ADSR_parameter.svg/1920px-ADSR_parameter.svg.png)

[image link](https://commons.wikimedia.org/wiki/File:ADSR_parameter.svg)

## attack

<!-- API documentation available in web version -->

## decay

<!-- API documentation available in web version -->

## sustain

<!-- API documentation available in web version -->

## release

<!-- API documentation available in web version -->

## adsr

<!-- API documentation available in web version -->

# Filter Envelope

Each filter can receive an additional filter envelope controlling the cutoff value dynamically. It uses an ADSR envelope similar to the one used for amplitude. There is an additional parameter to control the depth of the filter modulation: `lpenv`|`hpenv`|`bpenv`. This allows you to play subtle or huge filter modulations just the same by only increasing or decreasing the depth.

<!-- MINIREPL_START -->](3,8,<0 1>)".sub(12))
  .s("<sawtooth>/64")
  .lpf(sine.range(300,2000).slow(16))
  .lpa(0.005)
  .lpd(perlin.range(.02,.2))
  .lps(perlin.range(0,.5).slow(3))
  .lpq(sine.range(2,10).slow(32))
  .release(.5)
  .lpenv(perlin.range(1,8).slow(2))
  .ftype('24db')
  .room(1)
  .juxBy(.5,rev)
  .sometimes(add(note(12)))
  .stack(s("bd*2").bank('RolandTR909'))
  .gain(.5).fast(2)`}
/>

There is one filter envelope for each filter type and thus one set of envelope filter parameters preceded either by `lp`, `hp` or `bp`:

- `lpattack`, `lpdecay`, `lpsustain`, `lprelease`, `lpenv`: filter envelope for the lowpass filter.
  - alternatively: `lpa`, `lpd`, `lps`, `lpr` and `lpe`.
- `hpattack`, `hpdecay`, `hpsustain`, `hprelease`, `hpenv`: filter envelope for the highpass filter.
  - alternatively: `hpa`, `hpd`, `hps`, `hpr` and `hpe`.
- `bpattack`, `bpdecay`, `bpsustain`, `bprelease`, `bpenv`: filter envelope for the bandpass filter.
  - alternatively: `bpa`, `bpd`, `bps`, `bpr` and `bpe`.

## lpattack

<!-- API documentation available in web version -->

## lpdecay

<!-- API documentation available in web version -->

## lpsustain

<!-- API documentation available in web version -->

## lprelease

<!-- API documentation available in web version -->

## lpenv

<!-- API documentation available in web version -->

# Pitch Envelope

You can also control the pitch with envelopes!
Pitch envelopes can breathe life into static sounds:

<!-- MINIREPL_START -->*<2!3 4>")
  .scale("<C F>/8:pentatonic")
  .s("gm_electric_guitar_jazz")
  .penv("<.5 0 7 -2>*2").vib("4:.1")
  .phaser(2).delay(.25).room(.3)
  .size(4).fast(1.5)`}
/>

You also create some lovely chiptune-style sounds:

<!-- MINIREPL_START -->/16")).jux(rev)
.chord("<C^7 <Db^7 Fm7>>")
.dict('ireal')
.voicing().add(note("<0 1>/8"))
.dec(.1).room(.2)
.segment("<4 [2 8]>")
.penv("<0 <2 -2>>").patt(.02).fast(2)`}
/>

Let's break down all pitch envelope controls:

## pattack

<!-- API documentation available in web version -->

## pdecay

<!-- API documentation available in web version -->

## prelease

<!-- API documentation available in web version -->

## penv

<!-- API documentation available in web version -->

## pcurve

<!-- API documentation available in web version -->

## panchor

<!-- API documentation available in web version -->

# Dynamics

## gain

<!-- API documentation available in web version -->

## velocity

<!-- API documentation available in web version -->

## compressor

<!-- API documentation available in web version -->

## postgain

<!-- API documentation available in web version -->

## xfade

<!-- API documentation available in web version -->

# Panning

## jux

<!-- API documentation available in web version -->

## juxBy

<!-- API documentation available in web version -->

## pan

<!-- API documentation available in web version -->

# Waveshaping

## coarse

<!-- API documentation available in web version -->

## crush

<!-- API documentation available in web version -->

## distort

<!-- API documentation available in web version -->

# Global Effects

## Local vs Global Effects

While the above listed "local" effects will always create a separate effects chain for each event,
global effects use the same chain for all events of the same orbit:

## orbit

<!-- API documentation available in web version -->

## Delay

### delay

<!-- API documentation available in web version -->

### delaytime

<!-- API documentation available in web version -->

### delayfeedback

<!-- API documentation available in web version -->

## Reverb

### room

<!-- API documentation available in web version -->

### roomsize

<!-- API documentation available in web version -->

### roomfade

<!-- API documentation available in web version -->

### roomlp

<!-- API documentation available in web version -->

### roomdim

<!-- API documentation available in web version -->

### iresponse

<!-- API documentation available in web version -->

## Phaser

### phaser

<!-- API documentation available in web version -->

### phaserdepth

<!-- API documentation available in web version -->

### phasercenter

<!-- API documentation available in web version -->

### phasersweep

<!-- API documentation available in web version -->

## Duck

### duckorbit

<!-- API documentation available in web version -->

### duckattack

<!-- API documentation available in web version -->

### duckdepth

<!-- API documentation available in web version -->

Next, we'll look at input / output via [MIDI, OSC and other methods](/learn/input-output).

