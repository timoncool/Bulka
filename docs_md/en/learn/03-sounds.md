---
title: Sounds
layout: ../../layouts/MainLayout.astro
---

# Sounds

We can play sounds with `s`, in two different ways:

- `s` can trigger audio samples, where a sound file is loaded in the background and played back:
  <!-- Interactive example available in web version -->
- `s` can trigger audio synthesisers, which are synthesised in real-time using code also running in the background:
  <!-- Interactive example available in web version -->

You can learn more about both of these approaches in the pages [Synths](/learn/synths) and [Samples](/learn/samples).

# Combining notes and sounds

In both of the above cases, we are no longer directly controlling the `note`/`freq` of the sound heard via `s`, as we were in the [Notes](/workshop/first-notes/) page.

So how can we both control the sound and the pitch? We can _combine_ `note`/`freq` with `s` to change the sound of our pitches:

<!-- Interactive example available in web version -->

<!-- Interactive example available in web version -->

<!-- Interactive example available in web version -->

The last example will actually sound the same with or without `s`, because `triangle` is the default value for `s`.

What about combining different notes with different sounds at the same time?

<!-- Interactive example available in web version -->

Hmm, something interesting is going on there, related to there being five notes and three sounds.

Let's now take a step back and think about the Strudel [Code](/learn/code/) we've been hearing so far.

