/*
transpiler.test.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/transpiler/test/transpiler.test.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { describe, it, expect } from 'vitest';
import { transpiler } from '../index.mjs';

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
  it('handles mini strings in K(...)', () => {
    expect(transpiler('K("bd sd")', simple).output).toEqual("worklet('pat[0]', m('bd sd', 2));");
  });
  it('treats K(...) as kabelsalat', () => {
    expect(transpiler('K(1+2)', simple).output).toEqual("worklet('1 + 2');");
  });
  it('automatically calls functions in K(...)', () => {
    expect(transpiler('K(() => { return 1 + 2 })', simple).output).toEqual(
      "worklet('(() => {\\n    return 1 + 2\\n})()');",
    );
  });
  it('handles strudel S(...) inside kabelsalat K(...)', () => {
    expect(transpiler('K(S("bd".fast(4)))', simple).output).toEqual("worklet('pat[0]', m('bd', 4).fast(4));");
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
  it('allows disabling mini', () => {
    const code = `/* mini-off */
      const randPrefix = Math.random() > 0.5 ? "b" : "s";
      const drumPat = \`\${randPrefix}d\`;
      // mini-on
      s(drumPat).lpf("5000 10000") // make sure mini still runs;
    `;
    const { output, miniLocations } = transpiler(code, { ...simple, emitMiniLocations: true });
    expect(output).not.toContain("m('b'");
    expect(output).not.toContain("m('s'");
    const cutoffIdx = code.indexOf('5000 10000');
    expect(miniLocations).toHaveLength(2);
    expect(miniLocations[0][0]).toEqual(cutoffIdx);
  });
});
