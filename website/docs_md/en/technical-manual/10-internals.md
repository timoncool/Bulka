---
title: Internals
layout: ../../layouts/MainLayout.astro
---

# Internal Functions

These functions are more low level, probably not needed by the live coder.

# Haskell-style functor, applicative and monadic operations

## withValue

<JsDoc name="Pattern#withValue" h={0} />

## appWhole

<JsDoc name="Pattern#appWhole" h={0} />

## appBoth

<JsDoc name="Pattern#appBoth" h={0} />

## appLeft

<JsDoc name="Pattern#appLeft" h={0} />

## appRight

<JsDoc name="Pattern#appRight" h={0} />

## bindWhole

<JsDoc name="Pattern#bindWhole" h={0} />

## bind

<JsDoc name="Pattern#bind" h={0} />

## join

<JsDoc name="Pattern#join" h={0} />

## outerBind

<JsDoc name="Pattern#outerBind" h={0} />

## outerJoin

<JsDoc name="Pattern#outerJoin" h={0} />

## innerBind

<JsDoc name="Pattern#innerBind" h={0} />

## innerJoin

<JsDoc name="Pattern#innerJoin" h={0} />

## resetJoin

<JsDoc name="Pattern#resetJoin" h={0} />

## restartJoin

<JsDoc name="Pattern#restartJoin" h={0} />

## squeezeJoin

<JsDoc name="Pattern#squeezeJoin" h={0} />

## squeezeBind

<JsDoc name="Pattern#squeezeBind" h={0} />

# Utility methods mainly for internal use

## queryArc

<JsDoc name="Pattern#queryArc" h={0} />

## splitQueries

<JsDoc name="Pattern#splitQueries" h={0} />

## withQuerySpan

<JsDoc name="Pattern#withQuerySpan" h={0} />

## withQuerySpanMaybe

<JsDoc name="Pattern#withQuerySpanMaybe" h={0} />

## withQueryTime

<JsDoc name="Pattern#withQueryTime" h={0} />

## withHapSpan

<JsDoc name="Pattern#withHapSpan" h={0} />

## withHapTime

<JsDoc name="Pattern#withHapTime" h={0} />

## withHaps

<JsDoc name="Pattern#withHaps" h={0} />

## withHap

<JsDoc name="Pattern#withHap" h={0} />

## setContext

<JsDoc name="Pattern#setContext" h={0} />

## withContext

<JsDoc name="Pattern#setContext" h={0} />

## stripContext

<JsDoc name="Pattern#stripContext" h={0} />

## withLoc

<JsDoc name="Pattern#withLoc" h={0} />

## filterHaps

<JsDoc name="Pattern#filterHaps" h={0} />

## filterValues

<JsDoc name="Pattern#filterValues" h={0} />

## removeUndefineds

<JsDoc name="Pattern#filterValues" h={0} />

## onsetsOnly

<JsDoc name="Pattern#onsetsOnly" h={0} />

## discreteOnly

<JsDoc name="Pattern#discreteOnly" h={0} />

## defragmentHaps

<JsDoc name="Pattern#defragmentHaps" h={0} />

## firstCycle

<JsDoc name="Pattern#firstCycle" h={0} />

## firstCycleValues

<JsDoc name="Pattern#firstCycleValues" h={0} />

## showFirstCycle

<JsDoc name="Pattern#showFirstCycle" h={0} />

## sortHapsByPart

<JsDoc name="Pattern#sortHapsByPart" h={0} />

## asNumber

<JsDoc name="Pattern#sortHapsByPart" h={0} />

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

<JsDoc name="Pattern#onTrigger" h={0} />

## log

<JsDoc name="Pattern#log" h={0} />

## logValues

<JsDoc name="Pattern#logValues" h={0} />

## drawLine

<JsDoc name="Pattern#drawLine" h={0} />

## collect

# Functions

## groupHapsBy

<JsDoc name="groupHapsBy" h={0} />

## pure

<JsDoc name="pure" h={0} />

## reify

<JsDoc name="reify" h={0} />

## slowcatPrime

<JsDoc name="slowcatPrime" h={0} />

## isPattern

<JsDoc name="isPattern" h={0} />

## register

<JsDoc name="register" h={0} />

## toBipolar

<JsDoc name="toBipolar" h={0} />

## fromBipolar

<JsDoc name="fromBipolar" h={0} />

## compressSpan

<JsDoc name="compressSpan" h={0} />

## focus

<JsDoc name="focus" h={0} />

## focusSpan

## \_composeOp

# Composers

```
set keep keepif add sub mul div mod pow band bor bxor blshift brshift lt gt lte gte eq eqt ne net and or func
```

```
In Out Mix Squeeze SqueezeOut Trig Trigzero
```
