---
title: Stepwise patterning
layout: ../../layouts/MainLayout.astro
---

# Stepwise patterning (experimental)

This is a developing area of strudel, and behaviour might change or be renamed in future versions. Feedback and ideas are welcome!

## Introduction

Usually in strudel, the only reference point for most pattern transformations is the _cycle_. Now it is possible to also work with _steps_, via a growing range of functions.

For example usually when you `fastcat` two patterns together, the cycles will be squashed into half a cycle each:


```javascript
fastcat("bd hh hh", "bd hh hh cp hh").sound()
```


With the new stepwise `stepcat` function, the steps of the two patterns will be evenly distributed across the cycle:


```javascript
stepcat("bd hh hh", "bd hh hh cp hh").sound()
```


By default, steps are counted according to the 'top level' in mini-notation. For example `"a [b c] d e"` has five events in it per cycle, but is counted as four steps, where `[b c]` is counted as a single step.

However, you can mark a different metrical level to count steps relative to, using a `^` at the start of a sub-pattern. If we do this to the subpattern in our example: `"a [^b c] d e"`, then the pattern is now counted as having _eight_ steps. This is because 'b' and 'c' are each counted as single steps, and the events in the pattern are twice as long, and so counted as two steps each.

## Pacing the steps

Some stepwise functions don't appear to do very much on their own, for example these two examples of the `expand` function sound exactly the same despite being expanded by different amounts:


```javascript
"c a f e".expand(2).note().sound("folkharp")
```



```javascript
"c a f e".expand(4).note().sound("folkharp")
```


The number of steps per cycle is being changed behind the scenes, but on its own, that doesn't do anything. You will hear a difference however, once you use another stepwise function with it, for example `stepcat`:


```javascript
stepcat("c a f e".expand(2), "g d").note()
  .sound("folkharp")
```



```javascript
stepcat("c a f e".expand(4), "g d").note()
  .sound("folkharp")
```


You should be able to hear that `expand` increases the duration of the steps of the first subpattern, proportionally to the second one.

You can also change the speed of a pattern to match a given number of steps per cycle, with the `pace` function:


```javascript
stepcat("c a f e".expand(2), "g d").note()
  .sound("folkharp")
  .pace(8)
```



```javascript
stepcat("c a f e".expand(4), "g d").note()
  .sound("folkharp")
  .pace(8)
```


The first example has ten steps, and the second example has 18 steps, but are then both played a rate of 8 steps per cycle.

The argument to `expand` can also be patterned, and will be treated in a stepwise fashion. This means that the patterns from the changing values in the argument will be `stepcat`ted together:


```javascript
note("c a f e").sound("folkharp").expand("3 2 1 1 2 3")
```


This results in a dense pattern, because the different expanded versions are squashed into a single cycle. `pace` is again handy here for slowing down the pattern to a particular number of steps per cycle:


```javascript
note("c a f e").sound("folkharp").expand("3 2 1 1 2 3").pace(8)
```


Earlier versions of many of these functions had `s_` prefixes, and the `pace` function was previously known as `steps`. These still exist as aliases, but may have changed behaviour and will soon be removed. Please update your patterns!

## Stepwise functions

### pace

<!-- API documentation available in web version -->

### stepcat

<!-- API documentation available in web version -->

### stepalt

<!-- API documentation available in web version -->

### expand

<!-- API documentation available in web version -->

### contract

<!-- API documentation available in web version -->

### extend

<!-- API documentation available in web version -->

### take

<!-- API documentation available in web version -->

### drop

<!-- API documentation available in web version -->

### polymeter

<!-- API documentation available in web version -->

### shrink

<!-- API documentation available in web version -->

### grow

<!-- API documentation available in web version -->

### tour

<!-- API documentation available in web version -->

### zip

<!-- API documentation available in web version -->

