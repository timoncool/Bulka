---
title: First Notes
layout: ../../layouts/MainLayout.astro
---

# First Notes

Let's look at how we can play notes

## numbers and notes

**play notes with numbers**

<!-- MINIREPL_START --> [midi2note(i + 36), i + 36]),
  )}
/>

<Box>

Try out different numbers!

Try decimal numbers, like 55.5

</Box>

**play notes with letters**

<!-- MINIREPL_START --> [n, n.split('')[0]]))}
/>

<Box>

Try out different letters (a - g).

Can you find melodies that are actual words? Hint: ☕ 😉 ⚪

</Box>

**add flats or sharps to play the black keys**

<!-- MINIREPL_START --> [n, n.split('').slice(0, 2).join('')]),
  )}
/>

<!-- MINIREPL_START --> [n, n.split('').slice(0, 2).join('')]),
  )}
/>

**play notes with letters in different octaves**

<!-- MINIREPL_START --> [midi2note(i + 36), midi2note(i + 36)]),
  )}
/>

<Box>

Try out different octaves (1-8)

</Box>

If you are not comfortable with the note letter system, it should be easier to use numbers instead.
Most of the examples below will use numbers for that reason.
We will also look at ways to make it easier to play the right notes later.

## changing the sound

Just like with unpitched sounds, we can change the sound of our notes with `sound`:

<!-- Interactive example available in web version -->

{/* c2 g2, e3 b3 d4 e4 */}

<Box>

Try out different sounds:

- gm_electric_guitar_muted
- gm_acoustic_bass
- gm_voice_oohs
- gm_blown_bottle
- sawtooth
- square
- triangle
- how about bd, sd or hh?
- remove `.sound('...')` completely

</Box>

**switch between sounds**

<!-- Interactive example available in web version -->

**stack multiple sounds**

<!-- Interactive example available in web version -->

<Box>

The `note` and `sound` patterns are combined!

We will see more ways to combine patterns later..

</Box>

## Longer Sequences

**Divide sequences with `/` to slow them down**

<!-- Interactive example available in web version -->

<Box>

The `/4` plays the sequence in brackets over 4 cycles (=8s).

So each of the 4 notes is 2s long.

Try adding more notes inside the brackets and notice how it gets faster.

</Box>

**Play one per cycle with `< ... >`**

In the last section, we learned that `< ... >` (angle brackets) can be used to play only one thing per cycle,
which is useful for longer melodies too:

<!-- MINIREPL_START -->").sound("gm_acoustic_bass")`} punchcard />

<Box>

Try adding more notes inside the brackets and notice how the tempo stays the same.

The angle brackets are actually just a shortcut:

`<a b c>` = `[a b c]/3`

`<a b c d>` = `[a b c d]/4`

...

</Box>

**Play one sequence per cycle**

We can combine the 2 types of brackets in all sorts of different ways.
Here is an example of a repetitive bassline:

<!-- MINIREPL_START -->")
.sound("gm_acoustic_bass")`}
  punchcard
/>

**Alternate between multiple things**

<!-- MINIREPL_START -->")
.sound("gm_xylophone")`}
  punchcard
/>

This is also useful for unpitched sounds:

<!-- MINIREPL_START -->]*2, [~ hh]*4")
.bank("RolandTR909")`}
  punchcard
/>

## Scales

Finding the right notes can be difficult.. Scales are here to help:

<!-- MINIREPL_START -->")
.scale("C:minor").sound("piano")`}
  punchcard
/>

<Box>

Try out different numbers. Any number should sound good!

Try out different scales:

- C:major
- A2:minor
- D:dorian
- G:mixolydian
- A2:minor:pentatonic
- F:major:pentatonic

</Box>

**automate scales**

Just like anything, we can automate the scale with a pattern:

<!-- MINIREPL_START -->, 2 4 <[6,8] [7,9]>")
.scale("<C:major D:mixolydian>/4")
.sound("piano")`}
  punchcard
/>

<Box>

If you have no idea what these scale mean, don't worry.
These are just labels for different sets of notes that go well together.

Take your time and you'll find scales you like!

</Box>

## Repeat & Elongate

**Elongate with @**

<!-- Interactive example available in web version -->

<Box>

Not using `@` is like using `@1`. In the above example, c is 3 units long and eb is 1 unit long.

Try changing that number!

</Box>

**Elongate within sub-sequences**

<!-- MINIREPL_START -->*2")
.scale("<C2:mixolydian F2:mixolydian>/4")
.sound("gm_acoustic_bass")`}
  punchcard
/>

<Box>

This groove is called a `shuffle`.
Each beat has two notes, where the first is twice as long as the second.
This is also sometimes called triplet swing. You'll often find it in blues and jazz.

</Box>

**Replicate**

<!-- MINIREPL_START -->]").sound("piano")`}
  punchcard
/>

<Box>

Try switching between `!`, `*` and `@`

What's the difference?

</Box>

## Recap

Let's recap what we've learned in this chapter:

| Concept   | Syntax | Example                                                  |
| --------- | ------ | -------------------------------------------------------- |
| Slow down | \/     | <!-- Interactive example available in web version --> |
| Alternate | \<\>   | <!-- MINIREPL_START -->")`} /> |
| Elongate  | @      | <!-- Interactive example available in web version -->       |
| Replicate | !      | <!-- Interactive example available in web version -->       |

New functions:

| Name  | Description                   | Example                                                                           |
| ----- | ----------------------------- | --------------------------------------------------------------------------------- |
| note  | set pitch as number or letter | <!-- Interactive example available in web version -->               |
| scale | interpret `n` as scale degree | <!-- Interactive example available in web version --> |
| $:    | play patterns in parallel     | <!-- Interactive example available in web version -->             |

## Examples

**Classy Bassline**

<!-- MINIREPL_START -->")
.sound("gm_synth_bass_1")
.lpf(800) // <-- we'll learn about this soon`}
/>

**Classy Melody**

<!-- MINIREPL_START -->*4\`).scale("C4:minor")
.sound("gm_synth_strings_1")`}
/>

**Classy Drums**

<!-- MINIREPL_START -->]*2, [~ hh]*4")
.bank("RolandTR909")`}
/>

**If there just was a way to play all the above at the same time.......**

<Box>

You can use `$:` 😙

</Box>

## Playing multiple patterns

If you want to play multiple patterns at the same time, make sure to write `$:` before each:

<!-- MINIREPL_START -->")
  .sound("gm_synth_bass_1").lpf(800)
  
$: n(\`<
  [~ 0] 2 [0 2] [~ 2]
  [~ 0] 1 [0 1] [~ 1]
  [~ 0] 3 [0 3] [~ 3]
  [~ 0] 2 [0 2] [~ 2]
  >*4\`).scale("C4:minor")
  .sound("gm_synth_strings_1")
  
$: sound("bd*4, [~ <sd cp>]*2, [~ hh]*4")
.bank("RolandTR909")`}
/>

<Box>

Try changing `$` to `_$` to mute a part!

</Box>

This is starting to sound like actual music! We have sounds, we have notes, now the last piece of the puzzle is missing: [effects](/workshop/first-effects)

