---
title: Internals
layout: ../../layouts/MainLayout.astro
---

# Internal Functions

These functions are more low level, probably not needed by the live coder.

# Haskell-style functor, applicative and monadic operations

## withValue

<!-- API documentation available in web version -->

## appWhole

<!-- API documentation available in web version -->

## appBoth

<!-- API documentation available in web version -->

## appLeft

<!-- API documentation available in web version -->

## appRight

<!-- API documentation available in web version -->

## bindWhole

<!-- API documentation available in web version -->

## bind

<!-- API documentation available in web version -->

## join

<!-- API documentation available in web version -->

## outerBind

<!-- API documentation available in web version -->

## outerJoin

<!-- API documentation available in web version -->

## innerBind

<!-- API documentation available in web version -->

## innerJoin

<!-- API documentation available in web version -->

## resetJoin

<!-- API documentation available in web version -->

## restartJoin

<!-- API documentation available in web version -->

## squeezeJoin

<!-- API documentation available in web version -->

## squeezeBind

<!-- API documentation available in web version -->

# Utility methods mainly for internal use

## queryArc

<!-- API documentation available in web version -->

## splitQueries

<!-- API documentation available in web version -->

## withQuerySpan

<!-- API documentation available in web version -->

## withQuerySpanMaybe

<!-- API documentation available in web version -->

## withQueryTime

<!-- API documentation available in web version -->

## withHapSpan

<!-- API documentation available in web version -->

## withHapTime

<!-- API documentation available in web version -->

## withHaps

<!-- API documentation available in web version -->

## withHap

<!-- API documentation available in web version -->

## setContext

<!-- API documentation available in web version -->

## withContext

<!-- API documentation available in web version -->

## stripContext

<!-- API documentation available in web version -->

## withLoc

<!-- API documentation available in web version -->

## filterHaps

<!-- API documentation available in web version -->

## filterValues

<!-- API documentation available in web version -->

## removeUndefineds

<!-- API documentation available in web version -->

## onsetsOnly

<!-- API documentation available in web version -->

## discreteOnly

<!-- API documentation available in web version -->

## defragmentHaps

<!-- API documentation available in web version -->

## firstCycle

<!-- API documentation available in web version -->

## firstCycleValues

<!-- API documentation available in web version -->

## showFirstCycle

<!-- API documentation available in web version -->

## sortHapsByPart

<!-- API documentation available in web version -->

## asNumber

<!-- API documentation available in web version -->

# Operators

- \_opIn
- \_opOut
- \_opMix
- \_opSqueeze
- \_opSqueezeOut
- \_opTrig
- \_opTrigzero

# Other

## onTrigger

<!-- API documentation available in web version -->

## log

<!-- API documentation available in web version -->

## logValues

<!-- API documentation available in web version -->

## drawLine

<!-- API documentation available in web version -->

## collect

# Functions

## groupHapsBy

<!-- API documentation available in web version -->

## pure

<!-- API documentation available in web version -->

## reify

<!-- API documentation available in web version -->

## slowcatPrime

<!-- API documentation available in web version -->

## isPattern

<!-- API documentation available in web version -->

## register

<!-- API documentation available in web version -->

## toBipolar

<!-- API documentation available in web version -->

## fromBipolar

<!-- API documentation available in web version -->

## compressSpan

<!-- API documentation available in web version -->

## focus

<!-- API documentation available in web version -->

## focusSpan

## \_composeOp

# Composers

```
set keep keepif add sub mul div mod pow band bor bxor blshift brshift lt gt lte gte eq eqt ne net and or func
```

```
In Out Mix Squeeze SqueezeOut Trig Trigzero
```

