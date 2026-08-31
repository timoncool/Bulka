# @strudel/edo

This package adds EDO scale functions to strudel Patterns.

## Install

```sh
npm i @strudel/edo --save
```

## Example

```js
import { n } from '@strudel/core';
import '@strudel/edo';

// E.g. edoScale for Gorgo-6 scale, 16 EDO, LLsLLLs
// base note C3, large step size 3, small step size 1:
// C3:LLsLLL:3:1
const [baseNote, sequence, largeStep, smallStep] = ['C3', 'LLsLLL', 3, 1]
const pattern = n("0 2 4 6 4 2").edoScale([baseNote, sequence, largeStep, smallStep]);

const events = pattern.firstCycle().map((e) => e.show());
console.log(events);
```

yields:
```
[
    "[ 0/1 → 1/1 |
      {
        \"degree\":1,
        \"degreeIndexes\":[0,3,6,7,10,13],
        \"intLabels\":[null,\"S2\",\"d4\",\"N4\",\"s6\",\"s7\",\"P8\"],
        \"root\":\"130.8128\",
        \"freq\":130.813,
        \"edo\":16
      }
    ]"
]
```
