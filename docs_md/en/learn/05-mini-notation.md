---
title: Mini Notation
layout: ../../layouts/MainLayout.astro
---

# Mini-notation

Just like [Tidal Cycles](https://tidalcycles.org/), Strudel uses a so called "Mini-Notation", which is a custom language that is designed for writing rhythmic patterns using little amounts of text.

## Note

This page just explains the entirety of the Mini-Notation syntax.
If you are just getting started with Strudel, you can learn the basics of the Mini-Notation in a more practical manner in the [workshop](/workshop/first-sounds).
After that, you can come back here if you want to understand every little detail.

## Example

Before diving deeper into the details, here is a flavour of how the Mini-Notation looks like:

<!-- MINIREPL_START -->\`)`}
/>

## Mini Notation Format

The snippet above is enclosed in backticks (`), which allows you to write multi-line strings.

You can also use regular double quotes (`"`) for single line mini-notation, as we have done already.

If you do just want to get a regular string that is _not_ parsed as mini-notation, use single quotes (`'`).

## Sequences of events in a cycle

We can play more notes by separating them with spaces:

<!-- Interactive example available in web version -->

Here, those four notes are squashed into one cycle, so each note is a quarter second long.
Try adding or removing notes and notice how the tempo changes!

<!-- Interactive example available in web version -->

Note that the overall duration of time does not change, and instead each note length decreases.
This is a key idea, as it illustrates the 'Cycle' in TidalCycles!

Each space-separated note in this sequence is an _event_.
The time duration of each event is based on the speed or tempo of the cycle, and how many events are present.
Taking the two examples above, we have four and eight events respectively, and since they have the same cycle duration, they each have to fit their events inside the same amount of time.

This is perhaps counter-intuitive if you are used to adding notes in a sequencer or piano roll and the overall length increasing.
But, it will begin to make sense as we go through more elements of mini-notation.

## Multiplication

A sequence can be sped up by multiplying it by a number using the asterisk symbol (`*`):

<!-- Interactive example available in web version -->

The multiplication by two here means that the sequence will play twice per cycle.

Multiplications can also be decimal (`*2.75`):

<!-- Interactive example available in web version -->

## Division

Contrary to multiplication, division can slow the sequence down by enclosing it in brackets and dividing it by a number (`/2`):

<!-- Interactive example available in web version -->

The division by two means that the sequence will be played over the course of two cycles.
You can also use decimal numbers for any tempo you like (`/2.75`).

<!-- Interactive example available in web version -->

## Angle Brackets

Using angle brackets `<>`, we can define the sequence length based on the number of events:

<!-- MINIREPL_START -->")`} punchcard />

The above snippet is the same as:

<!-- Interactive example available in web version -->

The advantage of the angle brackets, is that we can add more events without needing to change the number at the end.

<!-- MINIREPL_START -->")`} punchcard />

<!-- MINIREPL_START -->")`} punchcard />

This is more similar to traditional music sequencers and piano rolls, where adding a note increases the perceived overall duration.
We can also play a certain number of notes per cycle by using angle brackets with multiplication:

<!-- MINIREPL_START -->*8")`} punchcard />

Now we are playing 8 notes per cycle!

## Subdividing time with bracket nesting

To create more interesting rhythms, you can _nest_ or _enclose_ sequences (put sequences inside sequences) with brackets `[]`, like this:

Compare the difference between the following:

<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->

What's going on here? When we nest/enclose multiple events inside brackets (`[]`), their duration becomes the length of one event in the outer sequence.

This is a very simple change to make, but it has profound consequences.
Remember what we said earlier about how the cycles in tidal stay the same length, and the individual event lengths are divided up in this cycle?
Well, what this means is that in TidalCycles, not only can you divide time any way you want, and you can also subdivide time any way you want!

## Rests

The "~" represents a rest, and will create silence between other events:

<!-- Interactive example available in web version -->

## Parallel / polyphony

Using commas, we can play chords.
The following are the same:

<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->

But to play multiple chords in a sequence, we have to wrap them in brackets:

<!-- MINIREPL_START -->*2")`} punchcard />

## Elongation

With the "@" symbol, we can specify temporal "weight" of a sequence child:

<!-- MINIREPL_START -->*2")`} punchcard />

Here, the first chord has a weight of 2, making it twice the length of the other chords. The default weight is 1.

## Replication

Using "!" we can repeat without speeding up:

<!-- MINIREPL_START -->*2")`} punchcard />

## Randomness

Events with a "?" placed after them will have a 50% chance of being removed from the pattern:

<!-- Interactive example available in web version -->

Adding a number between 0 and 1 after the "?" will affect the likelihood of the event being removed. For example, events with "?0.1" placed after them will have a 10% chance of being removed:

<!-- Interactive example available in web version -->

Events separated by a "|" will be chosen from at random:

<!-- Interactive example available in web version -->

## Mini-notation review

To recap what we've learned so far, compare the following patterns:

<!-- MINIREPL_START -->*2")`} />
<!-- MINIREPL_START -->*2")`} />
<!-- MINIREPL_START -->*2")`} />
<!-- MINIREPL_START -->*2")`} />
<!-- MINIREPL_START -->*2")`} />
<!-- MINIREPL_START -->*2")`} />
<!-- MINIREPL_START -->*2")`} />
<!-- MINIREPL_START -->*2")`} />
<!-- MINIREPL_START -->*2")`} />

## Euclidian rhythms

Using round brackets after an event, we can create rhythmical sub-divisions based on three parameters: `beats`, `segments` and `offset`.
This algorithm can be found in many different types of music software, and is often referred to as a [Euclidean rhythm](https://en.wikipedia.org/wiki/Euclidean_rhythm) sequencer, after computer scientist Godfriend Toussaint.
Why is it interesting? Well, consider the following simple example:

<!-- Interactive example available in web version -->

Sound familiar?
This is a popular Euclidian rhythm going by various names, such as "Pop Clave".
These rhythms can be found in all musical cultures, and the Euclidian rhythm algorithm allows us to express them extremely easily.
Writing this rhythm out in full require describing:

<!-- Interactive example available in web version -->

But using the Euclidian rhythm notation, we only need to express "3 beats over 8 segments, starting on position 1".

This makes it easy to write patterns with interesting rhythmic structures and variations that still sound familiar:

<!-- Interactive example available in web version -->

Note that since the example above does not use the third `offset` parameter, it can be written simply as `"(3,8)"`.

<!-- Interactive example available in web version -->

Let's look at those three parameters in detail.

### Beats

`beats`: the first parameter controls how may beats will be played.
Compare these:

<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->

### Segments

`segments`: the second parameter controls the total amount of segments the beats will be distributed over:

<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->

### Offsets

`offset`: the third (optional) parameter controls the starting position for distributing the beats.
We need a secondary rhythm to hear the difference:

<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->
<!-- Interactive example available in web version -->

## Mini-notation exercise

The most fun thing about the mini-notation, is that everything you have just learned can be combined in various ways!

Starting with this one `n`, can you make a _pattern string_ that uses every single mini-notation element above?

<!-- Interactive example available in web version -->

Next: How do [Samples](/learn/samples) play into this?

