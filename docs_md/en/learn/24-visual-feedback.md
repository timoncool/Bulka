---
title: Visual Feedback
layout: ../../layouts/MainLayout.astro
---

# Visual Feedback

There are several function that add visual feedback to your patterns.

## Mini Notation Highlighting

When you write mini notation with "double quotes" or \`backticks\`, the active parts of the mini notation will be highlighted:

<!-- MINIREPL_START -->*8")
.scale("<A1 D2>/4:minor:pentatonic")
.s("supersaw").lpf(300).lpenv("<4 3 2>\*4")`}
/>

You can change the color as well, even pattern it:

<!-- MINIREPL_START -->*8")
.scale("<A1 D2>/4:minor:pentatonic")
.s("supersaw").lpf(300).lpenv("<4 3 2>*4")
.color("cyan magenta")`}
/>

## Global vs Inline Visuals

The following functions all come with in 2 variants.

**Without prefix**: renders the visual to the background of the page:

<!-- Interactive example available in web version -->

**With `_` prefix**: renders the visual inside the code. Allows for multiple visuals

<!-- Interactive example available in web version -->

Here we see the 2 variants for `punchcard`. The same goes for all others below.
To improve readability the following demos will all use the inline variant.

## Punchcard / Pianoroll

These 2 functions render a pianoroll style visual.
The only difference between the 2 is that `pianoroll` will render the pattern directly,
while `punchcard` will also take the transformations into account that occur afterwards:

<!-- Interactive example available in web version -->

Here, the `color` is still visible in the visual, even if it is applied after `_punchcard`.
On the contrary, the color is not visible when using `_pianoroll`:

<!-- Interactive example available in web version -->

<Box>

`punchcard` is less resource intensive because it uses the same data as used for the mini notation highlighting.

</Box>

The visual can be customized by passing options. Those options are the same for both functions.

What follows is the API doc of all the options you can pass:

<!-- API documentation available in web version -->

## Spiral

<!-- API documentation available in web version -->

## Scope

<!-- API documentation available in web version -->

## Pitchwheel

<!-- API documentation available in web version -->

## Spectrum

<!-- API documentation available in web version -->

## markcss

<!-- API documentation available in web version -->

