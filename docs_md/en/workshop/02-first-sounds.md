---
title: First Sounds
layout: ../../layouts/MainLayout.astro
---

# First Sounds

This is the first chapter of the Strudel Workshop, nice to have you on board!

## Code Fields

The workshop is full of interactive code fields. Let's learn how to use those. Here is one:

<!-- Interactive example available in web version -->

<Box>

1. ⬆️ click into the text field above ⬆️
2. press `ctrl`+`enter` to play
3. change `casio` to `metal`
4. press `ctrl`+`enter` to update
5. press `ctrl`+`.` to stop

</Box>

Congratulations, you are now live coding!

## Sounds

We have just played a sound with `sound` like this:

<!-- Interactive example available in web version -->

<Box>

`casio` is one of many standard sounds.

Try out a few other sounds:

```
insect wind jazz metal east crow casio space numbers
```

You might hear a little pause while the sound is loading

</Box>

**Change Sample Number with :**

One Sound can contain multiple samples (audio files).

You can select the sample by appending `:` followed by a number to the name:

<!-- Interactive example available in web version -->

<Box>

Try different sound / sample number combinations.

Not adding a number is like doing `:0`

</Box>

Now you know how to use different sounds.
For now we'll stick to this little selection of sounds, but we'll find out how to load your own sounds later.

## Drum Sounds

By default, Strudel comes with a wide selection of drum sounds:

<!-- Interactive example available in web version -->

<Box>

These letter combinations stand for different parts of a drum set:

<img src="/img/drumset.png" />

<a class="text-right text-xs" href="https://de.wikipedia.org/wiki/Schlagzeug#/media/Datei:Drum_set.svg" target="_blank">
  original image by Pbroks13
</a>

- `bd` = **b**ass **d**rum
- `sd` = **s**nare **d**rum
- `rim` = **rim**shot
- `hh` = **h**i**h**at
- `oh` = **o**pen **h**ihat
- `lt` = **l**ow tom
- `mt` = **m**iddle tom
- `ht` = **h**igh tom
- `rd` = **r**i**d**e cymbal
- `cr` = **cr**ash cymbal

Try out different drum sounds!

</Box>

To change the sound character of our drums, we can use `bank` to change the drum machine:

<!-- Interactive example available in web version -->

In this example `RolandTR909` is the name of the drum machine that we're using.
It is a famous drum machine for house and techno beats.

<Box>

Try changing `RolandTR909` to one of

- `AkaiLinn`
- `RhythmAce`
- `RolandTR808`
- `RolandTR707`
- `ViscoSpaceDrum`

There are a lot more, but let's keep it simple for now

🦥 Pro-Tip: Mark a name via double click. Then just copy and paste!

</Box>

## Sequences

In the last example, we already saw that you can play multiple sounds in a sequence by separating them with a space:

<!-- Interactive example available in web version -->

Notice how the currently playing sound is highlighted in the code and also visualized below.

<Box>

Try adding more sounds to the sequence!

</Box>

**The longer the sequence, the faster it runs**

<!-- Interactive example available in web version -->

The content of a sequence will be squished into what's called a cycle. A cycle is 2s long by default.

**One per cycle with `< .. >`**

Here is the same sequence, but this time sourrounded with `< .. >` (angle brackets):

<!-- MINIREPL_START -->")`} punchcard />

This will play only one sound per cycle. With these brackets, the tempo doesn't change when we add or remove elements!

Because this is now very slow, we can speed it up again like this:

<!-- MINIREPL_START -->*8")`} punchcard />

Here, the `*8` means we make the whole thing 8 times faster.

<Box>

Wait a minute, isn't this the same as without `< ... >*8`? Why do we need it then?

That's true, the special thing about this notation is that the tempo won't change when you add or remove elements, try it!

Try also changing the number at the end to change the tempo!

</Box>

**changing the tempo with setcpm**

<!-- MINIREPL_START -->*8")`}
  punchcard
/>

<Box>

cpm = cycles per minute

By default, the tempo is 30 cycles per minute = 120/4 = 1 cycle every 2 seconds

In western music terms, you could say the above are 8ths notes at 90bpm in 4/4 time.
But don't worry if you don't know these terms, as they are not required to make music with Strudel.

</Box>

**Add a rests in a sequence with '-' or '~'**

<!-- Interactive example available in web version -->

**Sub-Sequences with [brackets]**

<!-- Interactive example available in web version -->

<Box>

Try adding more sounds inside a bracket!

</Box>

Similar to the whole sequence, the content of a sub-sequence will be squished to its own length.

**Multiplication: Speed things up**

<!-- Interactive example available in web version -->

**Multiplication: Speed up subsequences**

<!-- Interactive example available in web version -->

**Multiplication: Speeeeeeeeed things up**

<!-- Interactive example available in web version -->

<Box>

Pitch = really fast rhythm

</Box>

**Sub-Sub-Sequences with [[brackets]]**

<!-- Interactive example available in web version -->

<Box>

You can go as deep as you want!

</Box>

**Play sequences in parallel with comma**

<!-- Interactive example available in web version -->

You can use as many commas as you want:

<!-- Interactive example available in web version -->

Commas can also be used inside sub-sequences:

<!-- Interactive example available in web version -->

<Box>

Notice how the 2 above are the same?

It is quite common that there are many ways to express the same idea.

</Box>

**Multiple Lines with backticks**

<!-- Interactive example available in web version -->

**selecting sample numbers separately**

Instead of selecting sample numbers one by one:

<!-- Interactive example available in web version -->

We can also use the `n` function to make it shorter and more readable:

<!-- Interactive example available in web version -->

## Recap

Now we've learned the basics of the so called Mini-Notation, the rhythm language of Tidal.
This is what we've learned so far:

| Concept           | Syntax   | Example                                                                 |
| ----------------- | -------- | ----------------------------------------------------------------------- |
| Sequence          | space    | <!-- Interactive example available in web version -->               |
| Sample Number     | :x       | <!-- Interactive example available in web version -->       |
| Rests             | - or ~   | <!-- Interactive example available in web version -->       |
| Alternate         | \<\>     | <!-- MINIREPL_START -->")`} />     |
| Sub-Sequences     | \[\]     | <!-- Interactive example available in web version -->   |
| Sub-Sub-Sequences | \[\[\]\] | <!-- Interactive example available in web version --> |
| Speed up          | \*       | <!-- Interactive example available in web version -->              |
| Parallel          | ,        | <!-- Interactive example available in web version -->        |

The Mini-Notation is usually used inside some function. These are the functions we've seen so far:

| Name   | Description                         | Example                                                                           |
| ------ | ----------------------------------- | --------------------------------------------------------------------------------- |
| sound  | plays the sound of the given name   | <!-- Interactive example available in web version -->                     |
| bank   | selects the sound bank              | <!-- Interactive example available in web version --> |
| setcpm | sets the tempo in cycles per minute | <!-- Interactive example available in web version -->         |
| n      | select sample number                | <!-- Interactive example available in web version -->           |

## Examples

**Basic rock beat**

<!-- Interactive example available in web version -->

**Classic house**

<!-- Interactive example available in web version -->

<Box>

Notice that the two patterns are extremely similar.
Certain drum patterns are reused across genres.

</Box>

We Will Rock you

<!-- Interactive example available in web version -->

**Yellow Magic Orchestra - Firecracker**

<!-- Interactive example available in web version -->

**Imitation of a 16 step sequencer**

<!-- Interactive example available in web version -->

**Another one**

<!-- Interactive example available in web version -->

**Not your average drums**

<!-- Interactive example available in web version -->

Now that we know the basics of how to make beats, let's look at how we can play [notes](/workshop/first-notes)

