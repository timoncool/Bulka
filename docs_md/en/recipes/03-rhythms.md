---
title: Build Rhythms
layout: ../../layouts/MainLayout.astro
---

Note:

- this has been (partly) translated from https://tidalcycles.org/docs/patternlib/howtos/buildrhythms
- this only sounds good with `samples('github:tidalcycles/dirt-samples')` in prebake

# Build Rhythms

This page will teach you how to get started writing rhythms using different techniques. It is a good way to learn Strudel in a more intuitive way.

## From a simple to a complex rhythm

Simple bass drum - snare:

<!-- Interactive example available in web version -->

Let's pick a different snare sample:

<!-- Interactive example available in web version -->

Now, we are going to change the rhythm:

<!-- Interactive example available in web version -->

And add some toms:

<!-- Interactive example available in web version -->

Start to transform, shift a quarter cycle every other cycle:

<!-- Interactive example available in web version -->

Pattern the shift amount:

<!-- MINIREPL_START -->")).slow(2)`}
/>

Add some patterned effects:

<!-- MINIREPL_START -->"))
.shape("<0 .5 .3>")
.room(saw.range(0,.2).slow(4))
.slow(2)`}
/>

More transformation:

<!-- MINIREPL_START -->"))
.shape("<0 .5 .3>")
.room(saw.range(0,.2).slow(4))
.jux(id, rev, x=>x.speed(2))
.slow(2)`}
/>

## Another rhythmic construction

Let's start with a sequence:

<!-- Interactive example available in web version -->

We add a bit of flavour:

<!-- MINIREPL_START --> [2 0] [2 3]").s("feel").speed(1.5).slow(2)`} />

Swap the samples round every other cycle:

TODO: implement `rot`

