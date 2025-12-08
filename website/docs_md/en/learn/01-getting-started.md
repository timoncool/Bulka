---
title: Getting Started
layout: ../../layouts/MainLayout.astro
---


```javascript
samples({
  bd: ['bd/BT0AADA.wav','bd/BT0AAD0.wav','bd/BT0A0DA.wav','bd/BT0A0D3.wav','bd/BT0A0D0.wav','bd/BT0A0A7.wav'],
  sd: ['sd/rytm-01-classic.wav','sd/rytm-00-hard.wav'],
  hh: ['hh27/000_hh27closedhh.wav','hh/000_hh3closedhh.wav'],
}, 'github:tidalcycles/dirt-samples');
stack(
s("bd,[~ <sd!3 sd(3,4,2)>],hh*8") // барабаны
.speed(perlin.range(.7,.9)) // случайная вариация скорости sample
,"<a1 b1\*2 a1(3,8) e2>" // басовая линия
.off(1/8,x=>x.add(12).degradeBy(.5)) // случайные октавные скачки
.add(perlin.range(0,.5)) // случайная вариация высоты тона
.superimpose(add(.05)) // добавить второй, слегка расстроенный голос
.note() // обернуть в "note"
.decay(.15).sustain(0) // сделать каждую ноту одинаковой длины
.s('sawtooth') // форма волны
.gain(.4) // уменьшить громкость
.cutoff(sine.slow(7).range(300,5000)) // автоматизация cutoff
,"<Am7!3 <Em7 E7b13 Em7 Ebm7b5>>".voicings('lefthand') // аккорды
.superimpose(x=>x.add(.04)) // добавить второй, слегка расстроенный голос
.add(perlin.range(0,.5)) // случайная вариация высоты тона
.note() // обернуть в "note"
.s('sawtooth') // форма волны
.gain(.16) // уменьшить громкость
.cutoff(500) // фиксированный cutoff
.attack(1) // медленное появление
)
.slow(3/2)
```

# Welcome

Welcome to the Strudel documentation pages!

These pages will introduce you to [Strudel](https://strudel.cc/), a web-based [live coding](https://github.com/toplap/awesome-livecoding/) environment that implements the [Tidal Cycles](https://tidalcycles.org) algorithmic pattern language.

# What is Strudel?

[Strudel](https://strudel.cc/) is a version of [Tidal Cycles](https://tidalcycles.org) written in [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript), initiated by [Alex McLean](https://slab.org) and [Felix Roos](https://froos.cc/) in 2022.
Tidal Cycles, also known as Tidal, is a language for [algorithmic pattern](https://algorithmicpattern.org), and though it is most commonly used for [making music](https://tidalcycles.org/docs/showcase), it can be used for any kind of pattern making activity, including [weaving](https://www.youtube.com/watch?v=TfEmEsusXjU).

Tidal was first implemented as a library written in the [Haskell](https://www.haskell.org/) functional programming language, and by itself it does not make any sound.
To make sound, it has to be connected to a sound engine, and by default this is a [SuperCollider](https://supercollider.github.io/) plugin called [SuperDirt](https://github.com/musikinformatik/SuperDirt/).
As such, it can be difficult for first-time users to install both Tidal Cycles and SuperDirt, as there are many small details to get right.
Strudel however runs directly in your web browser, does not require any custom software installation, and can make sound all by itself.

# Strudel REPL and MiniREPL

The main place to actually make music with Strudel is the [Strudel REPL](https://strudel.cc/) ([what is a REPL?](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop)), but in these pages you will also encounter interactive "MiniREPLs" where you can listen to and edit Strudel patterns.
Try clicking the play icon below:


```javascript
s("bd sd")
```


Then edit the text so it reads `s("bd sd cp hh")` and click the refresh icon.
Congratulations, you have now live coded your first Strudel pattern!

With Strudel, you can expressively write dynamic music pieces.
You don't need to know JavaScript or Tidal Cycles to make music with Strudel.
This interactive tutorial will guide you through the basics of Strudel.

# Show me some demos!

To see and hear what Strudel can do, visit the [Strudel REPL](https://strudel.cc/) and click the Shuffle icon in the top menu bar.
You can get a feel for Strudel by browsing and editing these examples and clicking the Refresh icon to update.

You can also browse through the examples [here](/examples).

Alternatively, you can get a taste of what Strudel can do by clicking play on this track:

<!-- MINIREPL_START -->],hh*8") // drums
.speed(perlin.range(.7,.9)) // random sample speed variation
,"<a1 b1\*2 a1(3,8) e2>" // bassline
.off(1/8,x=>x.add(12).degradeBy(.5)) // random octave jumps
.add(perlin.range(0,.5)) // random pitch variation
.superimpose(add(.05)) // add second, slightly detuned voice
.note() // wrap in "note"
.decay(.15).sustain(0) // make each note of equal length
.s('sawtooth') // waveform
.gain(.4) // turn down
.cutoff(sine.slow(7).range(300,5000)) // automate cutoff
,"<Am7!3 <Em7 E7b13 Em7 Ebm7b5>>".voicings('lefthand') // chords
.superimpose(x=>x.add(.04)) // add second, slightly detuned voice
.add(perlin.range(0,.5)) // random pitch variation
.note() // wrap in "note"
.s('sawtooth') // waveform
.gain(.16) // turn down
.cutoff(500) // fixed cutoff
.attack(1) // slowly fade in
)
.slow(3/2)`}
/>

# Strudel is a work in progress 🚧

Please note that this project is still in its experimental state.
In the future, parts of it might change significantly.
This tutorial is also far from complete.
You can contribute to it clicking 'Edit this page' in the top right, or by visiting the [Strudel GitHub page](https://codeberg.org/uzu/strudel/).

# What's next?

Head on over to the [Notes](/learn/notes) page.

