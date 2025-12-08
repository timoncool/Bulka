---
title: Strudel Packages
layout: ../../layouts/MainLayout.astro
---

# Strudel Packages

The [strudel repo](https://codeberg.org/uzu/strudel) is organized as a monorepo, containing multiple npm packages.
The purpose of the multiple packages is to

- organize the codebase into more modular, encapsulated pieces
- be able to opt out of certain functionalities
- keep the dependencies of the core packages small

## Overview

[See the latest published packages on npm](https://www.npmjs.com/search?q=%40strudel).
Here is an overview of all the packages:

### Umbrella Packages

These packages give you a batteries-included point of getting started, and most likely the thing you'd want to use in your project:

- [repl](https://codeberg.org/uzu/strudel/src/branch/main/packages/repl): The Strudel REPL as a web component.
- [web](https://codeberg.org/uzu/strudel/src/branch/main/packages/web): Strudel library for the browser, without UI.

To find out more about these two, read [Using Strudel in Your Project](/technical-manual/project-start)

### Essential Packages

These package are the most essential. You might want to use all of those if you're using strudel in your project:

- [core](https://codeberg.org/uzu/strudel/src/branch/main/packages/core#strudelcore): tidal pattern engine with core primitives
- [mini](https://codeberg.org/uzu/strudel/src/branch/main/packages/mini#strudelmini): mini notation parser + core bindings
- [transpiler](https://codeberg.org/uzu/strudel/src/branch/main/packages/transpiler#strudeltranspiler): user code transpiler. syntax sugar + highlighting

### Language Extensions

These packages extend the pattern language by specific functions

- [tonal](https://codeberg.org/uzu/strudel/src/branch/main/packages/tonal): tonal functions for scales and chords
- [xen](https://codeberg.org/uzu/strudel/src/branch/main/packages/xen): microtonal / xenharmonic functions

### Outputs

These packages provide bindings for different ways to output strudel patterns:

- [webaudio](https://codeberg.org/uzu/strudel/src/branch/main/packages/webaudio#strudelwebaudio): the default webaudio output
- [osc](https://codeberg.org/uzu/strudel/src/branch/main/packages/osc#strudelosc): bindings to communicate via OSC
- [midi](https://codeberg.org/uzu/strudel/src/branch/main/packages/midi#strudelmidi): webmidi bindings
- [csound](https://codeberg.org/uzu/strudel/src/branch/main/packages/csound#strudelcsound): csound bindings
- [soundfonts](https://codeberg.org/uzu/strudel/src/branch/main/packages/serial#strudelsoundfonts): Soundfont support
- [serial](https://codeberg.org/uzu/strudel/src/branch/main/packages/serial#strudelserial): webserial bindings

### Others

- [embed](https://codeberg.org/uzu/strudel/src/branch/main/packages/embed#strudelembed): embeddable REPL web component

### No Longer Maintained

- [react](https://www.npmjs.com/package/@strudel.cycles/react): react hooks and components for strudel
- [eval](https://www.npmjs.com/package/@strudel.cycles/eval): old code transpiler
- [tone](https://www.npmjs.com/package/@strudel.cycles/tone): bindings for Tone.js instruments and effects
- [webdirt](https://www.npmjs.com/package/@strudel.cycles/webdirt): webdirt bindings, replaced by webaudio package
- any `@strudel.cycles/*` packages have been renamed to `@strudel/*` since version 0.10.0.

## Tools

- [pnpm](https://pnpm.io/) for package management, workspaces and publishing
- [lerna](https://lerna.js.org/) for bumping versions
- see CONTRIBUTING.md for more info
