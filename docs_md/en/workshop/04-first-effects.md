---
title: First Effects
layout: ../../layouts/MainLayout.astro
---

# First Effects

We have sounds, we have notes, now let's look at effects!

## Some basic effects

**low-pass filter**

<!-- MINIREPL_START -->")
.sound("sawtooth").lpf(800)`}
/>

<Box>

lpf = **l**ow **p**ass **f**ilter

- Change lpf to 200. Notice how it gets muffled. Think of it as standing in front of the club with the door closed 🚪.
- Now let's open the door... change it to 5000. Notice how it gets brighter ✨🪩

</Box>

**pattern the filter**

<!-- MINIREPL_START -->")
.sound("sawtooth").lpf("200 1000 200 1000")`}
/>

<Box>

- Try adding more values
- Notice how the pattern in lpf does not change the overall rhythm

We will learn how to automate with waves later...

</Box>

**vowel**

<!-- MINIREPL_START -->")
.sound("sawtooth").vowel("<a e i o>")`}
/>

**gain**

<!-- Interactive example available in web version -->

<Box>

Rhythm is all about dynamics!

- Remove `.gain(...)` and notice how flat it sounds.
- Bring it back by undoing (ctrl+z)

</Box>

Let's combine all of the above into a little tune:

<!-- MINIREPL_START -->")
.sound("sawtooth").lpf("200 1000 200 1000")

$: note("<[c3,g3,e4] [bb2,f3,d4] [a2,f3,c4] [bb2,g3,eb4]>")
.sound("sawtooth").vowel("<a e i o>")`}
/>

**shape the sound with an adsr envelope**

<!-- Interactive example available in web version -->

<Box>

Try to find out what the numbers do.. Compare the following

- attack: `.5` vs `0`
- decay: `.5` vs `0`
- sustain: `1` vs `.25` vs `0`
- release: `0` vs `.5` vs `1`

Can you guess what they do?

</Box>

<QA q="Click to see solution">

- attack: time it takes to fade in
- decay: time it takes to fade to sustain
- sustain: level after decay
- release: time it takes to fade out after note is finished

![ADSR](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/ADSR_parameter.svg/1920px-ADSR_parameter.svg.png)

</QA>

**adsr short notation**

<!-- Interactive example available in web version -->

**delay**

<!-- MINIREPL_START --> ~]]*2")
  .sound("gm_electric_guitar_muted").delay(.5)

$: sound("bd rim").bank("RolandTR707").delay(".5")`}
/>

<Box>

Try some `delay` values between 0 and 1. Btw, `.5` is short for `0.5`

What happens if you use `.delay(".8:.125")` ? Can you guess what the second number does?

What happens if you use `.delay(".8:.06:.8")` ? Can you guess what the third number does?

</Box>

<QA q="Click to see solution">

`delay("a:b:c")`:

- a: delay volume
- b: delay time
- c: feedback (smaller number = quicker fade)

</QA>

**room aka reverb**

<!-- MINIREPL_START --> ~@16] ~>")
.scale("D4:minor").sound("gm_accordion:2")
.room(2)`}
/>

<Box>

Try different values!

Add a delay too!

</Box>

**little dub tune**

<!-- MINIREPL_START --> ~]]*2")
.sound("gm_electric_guitar_muted").delay(.5)

$: sound("bd rim").bank("RolandTR707").delay(.5)

$: n("<4 [3@3 4] [<2 0> ~@16] ~>")
.scale("D4:minor").sound("gm_accordion:2")
.room(2).gain(.5)`}
/>

Let's add a bass to make this complete:

<!-- MINIREPL_START --> ~]]*2")
.sound("gm_electric_guitar_muted").delay(.5)

$: sound("bd rim").bank("RolandTR707").delay(.5)

$: n("<4 [3@3 4] [<2 0> ~@16] ~>")
.scale("D4:minor").sound("gm_accordion:2")
.room(2).gain(.4)

$: n("[0 [~ 0] 4 [3 2] [0 ~] [0 ~] <0 2> ~]/2")
.scale("D2:minor")
.sound("sawtooth,triangle").lpf(800)`}
/>

<Box>

Try adding `.hush()` at the end of one of the patterns in the stack...

</Box>

**pan**

<!-- Interactive example available in web version -->

**speed**

<!-- MINIREPL_START -->").room(.2)`} />

**fast and slow**

We can use `fast` and `slow` to change the tempo of a pattern outside of Mini-Notation:

<!-- Interactive example available in web version -->

<Box>

Change the `slow` value. Try replacing it with `fast`.

What happens if you use a pattern like `.fast("<1 [2 4]>")`?

</Box>

By the way, inside Mini-Notation, `fast` is `*` and `slow` is `/`.

<!-- MINIREPL_START -->")`} />

## modulation with signals

Instead of changing values stepwise, we can also control them with signals:

<!-- Interactive example available in web version -->

<Box>

The basic waveforms for signals are `sine`, `saw`, `square`, `tri` 🌊

Try also random signals `rand` and `perlin`!

The gain is visualized as transparency in the pianoroll.

</Box>

**setting a range**

By default, waves oscillate between 0 to 1. We can change that with `range`:

<!-- Interactive example available in web version -->

<Box>

What happens if you flip the range values?

</Box>

We can change the modulation speed with slow / fast:

<!-- MINIREPL_START -->")
  .sound("sawtooth")
  .lpf(sine.range(100, 2000).slow(4))`}
/>

<Box>

The whole modulation will now take 8 cycles to repeat.

</Box>

## Recap

| name    | example                                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------------------- |
| lpf     | <!-- MINIREPL_START -->")`} />                         |
| vowel   | <!-- MINIREPL_START -->")`} />                          |
| gain    | <!-- Interactive example available in web version -->                                                |
| delay   | <!-- Interactive example available in web version -->                                                 |
| room    | <!-- Interactive example available in web version -->                                                  |
| pan     | <!-- Interactive example available in web version -->                                                |
| speed   | <!-- MINIREPL_START -->")`} />                                      |
| signals | `sine`, `saw`, `square`, `tri`, `rand`, `perlin`
<!-- Interactive example available in web version --> |
| range   | <!-- Interactive example available in web version -->                                         |

Let us now take a look at some of Tidal's typical [pattern effects](/workshop/pattern-effects).

