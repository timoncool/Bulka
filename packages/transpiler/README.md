# @strudel/transpiler

This package contains a JS code transpiler with a plugin system that can be used to transform the code.

A plugin can be registered via a `registerTranspilerPlugin` call :

```js
registerTranspilerPlugin({
  walk: (context) => ({
    enter: function(node, parent, prop, index) {},
    leave: function(node, parent, prop, index) {}
  })
})
```

where the enter/leave functions (both optional) follow the `estree-walker` walk API.

4 plugins are currently hosted inside `@strudel/transpiler`

- mini: add locations of mini notation strings (double quoted or backticked) for highlighting
- widgets: add handling of sliders & draw widgets
- sample: make it possible to call a sample without await
- kabelsalat: transform the code to handle the `K(..)` kabelsalat notation

it also

- adds return statement to the last expression
- handles label capturing for block-based eval

## Install

```sh
npm i @strudel/transpiler
```

## Use

```js
import { transpiler } from '@strudel/core';
import { evaluate } from '@strudel/core';

transpiler('note("c3 [e3,g3]")', { wrapAsync: false, addReturn: false, simpleLocs: true });
/* mini('c3 [e3,g3]').withMiniLocation(7,17) */

evaluate(note('c3 [e3,g3]'), transpiler); // returns pattern of above code
```
