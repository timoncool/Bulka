---
title: Mondo Notation
layout: ../../layouts/MainLayout.astro
---

# Mondo Notation

"Mondo Notation" is a new kind of notation that is similar to [Mini Notation](/learn/mini-notation/), but with enough abilities to make it work as a standalone pattern language.
Here's an example:

<!-- MINIREPL_START --> <8 16>) # *2 
  # s "sine" # add (note [0 <12 24>]*2)
  # dec(sine # range .2 2) 
  # room .5
  # lpf (sine/3 # range 120 400)
  # lpenv (rand # range .5 4)
  # lpq (perlin # range 5 12 # * 2)
  # dist 1 # fm 4 # fmh 5.01 # fmdecay <.1 .2>
  # postgain .6 # delay .1 # clip 5

$ s [bd bd bd bd] # bank tr909 # clip .5

# ply <1 [1 [2 4]]>

$ s oh\*4 # press # bank tr909 # speed.8

# dec (<.02 .05>\*2 # add (saw/8 # range 0 1))

`}
/>

## Mondo in the REPL

For now, you can only use mondo in the repl like this:

<!-- Interactive example available in web version -->

The rest of this site will only use the mondo notation itself.
In the future, the REPL might get a way to use mondo notation directly.

## Calling Functions

Compared to Mini Notation, the most notable feature of Mondo Notation is the ability to call functions using round brackets:

<!-- Interactive example available in web version -->

The first element inside the brackets is the function name. In JS, this would look like:

<!-- Interactive example available in web version -->

The outermost parens are not needed, so we can drop them:

<!-- Interactive example available in web version -->

## Mini Notation Features

Besides function calling with round parens, Mondo Notation has a lot in common with Mini Notation:

### Brackets

- `[]` for 1-cycle sequences
- `<>` for multi-cycle sequences
- `{}` for stepped sequences (more on that later)

### Infix Operators

- \* => [fast](/learn/time-modifiers/#fast)
- / => [slow](/learn/time-modifiers/#slow)
- ! => [extend](/learn/stepwise/#extend)
- @ => [expand](/learn/stepwise/#expand)
- % => [pace](/learn/stepwise/#pace)
- ? => [degradeBy](/learn/random-modifiers/#degradeby) (currently requires right operand)
- : => tail (creates a list)
- .. => range (between numbers)
- , => [stack](/learn/factories/#stack)
- | => [chooseIn](/learn/random-modifiers/#choose)

### Example

<!-- MINIREPL_START -->`}
/>

## Chaining Functions

Similar to how "." works in javascript (JS), we can chain functions calls with the "#" operator:

<!-- MINIREPL_START -->*4 
 # scale C4:minor 
 # jux rev 
 # dec .2
 # delay .5`}
/>

Here's the same written in JS:

<!-- MINIREPL_START -->*4")
 .scale("C4:minor")
 .jux(rev)
 .dec(.2)
 .delay(.5)`}
/>

### Chaining Functions Locally

A function can be applied to a single element by wrapping it in round parens:

<!-- Interactive example available in web version -->

in this case, `delay .6` will only be applied to `cp`. compare this with the JS version:

<!-- Interactive example available in web version -->

here we can see how much we can save when there's no boundary between mini notation and function calls!

### Chaining Infix Operators

Infix operators exist as regular functions, so they can be chained as well:

<!-- Interactive example available in web version -->

In this case, the \*2 will be applied to the whole pattern.

### Lambda Functions

Some functions in strudel expect a function as input, for example:

<!-- MINIREPL_START -->x.dec(.1))`} />

in mondo, the `x=>x.` can be shortened to:

<!-- Interactive example available in web version -->

chaining works as expected:

<!-- Interactive example available in web version -->

## Strings

You can use "double quotes" and 'single quotes' to get a string:

<!-- Interactive example available in web version -->

## Multiple Patterns

The `$` sign can be used to separate multiple patterns:

<!-- MINIREPL_START --> # voicing
  # struct[x ~ ~ x ~ x ~ ~] # delay .5`}
/>

The `$` sign is an alias for `,` so it will create a stack behind the scenes.

## variables

using the `def` keyword, you can define variables:

<!-- Interactive example available in web version -->

