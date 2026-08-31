/*
transpiler.test.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/transpiler/test/transpiler.test.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { describe, it, expect } from 'vitest';
import { transpiler } from '../transpiler.mjs';

const simple = { wrapAsync: false, addReturn: false, simpleLocs: true };

describe('transpiler', () => {
  it('wraps double quote string with mini and adds location', () => {
    expect(transpiler('"c3"', simple).output).toEqual("m('c3', 0);");
    expect(transpiler('stack("c3","bd sd")', simple).output).toEqual("stack(m('c3', 6), m('bd sd', 11));");
  });
  it('wraps backtick string with mini and adds location', () => {
    expect(transpiler('`c3`', simple).output).toEqual("m('c3', 0);");
  });
  it('keeps tagged template literal as is', () => {
    expect(transpiler('xxx`c3`', simple).output).toEqual('xxx`c3`;');
  });
  it('supports top level await', () => {
    expect(transpiler("await samples('xxx');", simple).output).toEqual("await samples('xxx');");
  });
  it('adds await to bare samples call', () => {
    expect(transpiler("samples('xxx');", simple).output).toEqual("await samples('xxx');");
  });
  /*   it('parses dynamic imports', () => {
    expect(
      transpiler("const { default: foo } = await import('https://bar.com/foo.js');", {
        wrapAsync: false,
        addReturn: false,
      }),
    ).toEqual("const {default: foo} = await import('https://bar.com/foo.js');");
  }); */
  it('collections locations', () => {
    const { miniLocations } = transpiler(`s("bd", "hh oh")`, { ...simple, emitMiniLocations: true });
    expect(miniLocations).toEqual([
      [3, 5],
      [9, 11],
      [12, 14],
    ]);
  });
  it('does not parse URL strings in Hydra source functions as mini-notation', () => {
    // initImage, initVideo, loadScript should preserve URLs without mini-notation parsing
    expect(transpiler('s0.initImage("https://example.com/image.jpg")', simple).output).toEqual(
      "s0.initImage('https://example.com/image.jpg');",
    );
    expect(transpiler('s0.initVideo("https://example.com/video.mp4")', simple).output).toEqual(
      "s0.initVideo('https://example.com/video.mp4');",
    );
    expect(transpiler('loadScript("https://cdn.example.com/lib.js")', simple).output).toEqual(
      "loadScript('https://cdn.example.com/lib.js');",
    );
    // But regular strings should still be parsed as mini-notation
    expect(transpiler('s("bd sd")', simple).output).toEqual("s(m('bd sd', 2));");
  });
});
