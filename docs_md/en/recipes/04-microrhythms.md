---
title: Microrhythms
layout: ../../layouts/MainLayout.astro
---

see https://strudel.cc/?zMEo5kowGrFc

# Microrhythms

Inspired by this [Mini-Lecture on Microrhythm Notation](https://www.youtube.com/watch?v=or7B6vI3jOo), let's look at how we can express microrhythms with Strudel.

The timestamps of the first rhythm are `0 1/5 1/2 2/3 1`. We could naively express this with a stack:

<!-- Interactive example available in web version -->

While this works, it has two problems:

- it is not very compact
- the durations are wrong, e.g. the first note takes up the whole cycle

In the video, the duration of a timestamp is calculated by subtracting it from the next timestamp:

- 1/5 - 0 = 1/5 = 6/30
- 1/2 - 1/5 = 3/10 = 9/30
- 2/3 - 1/2 = 1/6 = 5/30
- 1 - 2/3 = 1/3 = 10/30

Using those, we can now express the rhythm much shorter:

<!-- Interactive example available in web version -->

The problems of the first notation are now fixed: it is much shorter and the durations are correct.
Still, this notation involved calculating the durations by hand, which could be automated:

<!-- MINIREPL_START --> {
    const next = i < a.length-1 ? a[i+1] : 1;
    return next - a[i]
  })
  return this.struct(timeCat(...durations.map(d => [d, 1]))).late(timestamps[0])
}
s('hh').micro(0, 1/5, 1/2, 2/3)`}
/>

This notation is even shorter and it allows directly filling in the timestamps!

This is the second example of the video:

<!-- MINIREPL_START --> {
    const next = i < a.length-1 ? a[i+1] : 1;
    return next - a[i]
  })
  return this.struct(timeCat(...durations.map(d => [d, 1]))).late(timestamps[0])
}
s('hh').micro(0, 1/6, 2/5, 2/3, 3/4)`}
/>

with bass: https://strudel.cc/?sTglgJJCPIeY

