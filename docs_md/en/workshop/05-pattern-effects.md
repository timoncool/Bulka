---
title: Pattern Effects
layout: ../../layouts/MainLayout.astro
---

# Pattern Effects

Up until now, most of the functions we've seen are what other music programs are typically capable of: sequencing sounds, playing notes, controlling effects.

In this chapter, we are going to look at functions that are more unique to tidal.

**reverse patterns with rev**

<!-- Interactive example available in web version -->

**play pattern left and modify it right with jux**

<!-- Interactive example available in web version -->

This is the same as:

<!-- Interactive example available in web version -->

Let's visualize what happens here:

<!-- Interactive example available in web version -->

<Box>

Try commenting out one of the two by adding `//` before a line

</Box>

**multiple tempos**

<!-- Interactive example available in web version -->

This is like doing

<!-- Interactive example available in web version -->

<Box>

Try commenting out one or more by adding `//` before a line

</Box>

**add**

<!-- MINIREPL_START -->>"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)`}
  punchcard
/>

<Box>

If you add a number to a note, the note will be treated as if it was a number

</Box>

We can add as often as we like:

<!-- MINIREPL_START -->>").add("0,7"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)`}
  punchcard
/>

**add with scale**

<!-- MINIREPL_START --> [~ <4 1>]".add("<0 [0,2,4]>"))
.scale("C5:minor").release(.5)
.sound("gm_xylophone").room(.5)`}
  punchcard
/>

**time to stack**

<!-- MINIREPL_START --> [~ <4 1>]".add("<0 [0,2,4]>"))
  .scale("C5:minor")
  .sound("gm_xylophone")
  .room(.4).delay(.125)
$: note("c2 [eb3,g3]".add("<0 <1 -1>>"))
  .adsr("[.1 0]:.2:[1 0]")
  .sound("gm_acoustic_bass")
  .room(.5)
$: n("0 1 [2 3] 2").sound("jazz").jux(rev)`}
/>

**ply**

<!-- Interactive example available in web version -->

this is like writing:

<!-- Interactive example available in web version -->

<Box>

Try patterning the `ply` function, for example using `"<1 2 1 3>"`

</Box>

**off**

<!-- MINIREPL_START -->] <2 3> [~ 1]"
  .off(1/16, x=>x.add(4))
  //.off(1/8, x=>x.add(7))
).scale("<C5:minor Db5:mixolydian>/2")
.s("triangle").room(.5).dec(.1)`}
  punchcard
/>

<Box>

In the notation `.off(1/16, x=>x.add(4))`, says:

- take the original pattern named as `x`
- modify `x` with `.add(4)`, and
- play it offset to the original pattern by `1/16` of a cycle.

</Box>

off is also useful for modifying other sounds, and can even be nested:

<!-- MINIREPL_START -->x.speed(1.5).gain(.25)
  .off(3/16, y=>y.vowel("<a e i o>*8")))`}
/>

| name | description                    | example                                                                                     |
| ---- | ------------------------------ | ------------------------------------------------------------------------------------------- |
| rev  | reverse                        | <!-- Interactive example available in web version -->            |
| jux  | split left/right, modify right | <!-- Interactive example available in web version -->         |
| add  | add numbers / notes            | <!-- MINIREPL_START -->")).scale("C:minor")`} /> |
| ply  | speed up each event n times    | <!-- MINIREPL_START -->")`} />                    |
| off  | copy, shift time & modify      | <!-- MINIREPL_START -->x.speed(2))`} />    |

