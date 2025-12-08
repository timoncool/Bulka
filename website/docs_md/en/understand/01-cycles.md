---
title: Understanding Cycles
layout: ../../layouts/MainLayout.astro
---

# Understanding Cycles

The concept of cycles is very central to be able to understand how Strudel works.
Strudel's mother language, TidalCycles, even has it in its name.

## Cycles and BPM

In most music software, the unit BPM (beats per minute) is used to set the tempo.
Strudel expresses tempo as CPS (cycles per second), with a default of 0.5 CPS:

<!-- Interactive example available in web version -->

Here we can hear the 0.5CPS in action: The kick repeats once every two seconds.
Let's make it 4 kicks:

<!-- Interactive example available in web version -->

Now we have 4 kicks per cycle, but the whole pattern still plays at 0.5CPS.
In terms of BPM, most musicians would tell you this is playing at 120bpm.
What about this one:

<!-- Interactive example available in web version -->

Because the second sound is now a hihat, the tempo feels slower again.
This brings us to an important realization:

<Box>

Tempo is based on perception.
The choice of sounds also has an impact on the tempo feel.
This is why the same CPS can produce different perceived tempos.

</Box>

## Setting CPM

If you're familiar with BPM, you can use the `setcpm` method to set the global tempo in cycles per minute:

<!-- Interactive example available in web version -->

If you want to add more beats per cycle, you might want to divide the cpm:

<!-- Interactive example available in web version -->

Or using 2 beats per cycle:

<!-- Interactive example available in web version -->

You can use the `setcps` method to set the global tempo in cycles per second. `setcpm(x)` is the same as `setcps(x / 60)`.

<Box>

To set a specific bpm, use `setcpm(bpm/bpc)`

- bpm: the target beats per minute
- bpc: the number of perceived beats per cycle

</Box>

## Cycles and Bars

Also in most music software, multiple beats form a bar (or measure).
The so called time signature specifies how many beats are in each bar.
In many types of music, it is common to use 4 beats per bar, also known as 4/4 time.
Many music programs use it as a default.

Strudel does not a have concept of bars or measures, there are only cycles.
How you use them is up to you. Above, we've had this example:

<!-- Interactive example available in web version -->

This could be interpreted as 4/4 time with a tempo of 110bpm.
We could write out multiple bars like this:

<!-- MINIREPL_START -->\`)`}
/>

Instead of writing out each bar separately, we could express this much shorter:

<!-- MINIREPL_START -->>,hh*4")`}
/>

Here we can see that thinking in cycles rather than bars simplifies things a lot!
These types of simplifications work because of the repetitive nature of rhythm.
In computational terms, you could say the former notation has a lot of redundancy.

## Time Signatures

To get a time signature, just change the number of elements per bar. Here is a rhythm with 7 beats:

<!-- Interactive example available in web version -->

or with 5:

<!-- Interactive example available in web version -->

We could also write multiple bars with different time signatures:

<!-- MINIREPL_START -->\`)`}
/>

Here we switch between 3/4 and 4/4, keeping the same tempo.

If we don't specify the length, we get what's called a metric modulation:

<!-- MINIREPL_START -->\`)`}
/>

Now the 3 elements get the same time as the 4 elements, which is why the tempo changes.

