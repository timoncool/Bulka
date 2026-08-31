/*
edo.test.mjs - tests of edo.mjs
Copyright (C) 2025 Rob McKinnon and Strudel contributors - see <https://github.com/tidalcycles/strudel/blob/main/packages/tonal/test/tonal.test.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import '../edo.mjs';
import { n } from '@strudel/core';
import { describe, it, expect } from 'vitest';

describe('edoScale', () => {
  it('Should run tonal functions ', () => {
    // base note A3 = 220Hz
    let baseNote = 'A3';
    let root = 220;
    let freq = 220;
    let pattern = n('0').edoScale([baseNote, 'LLsLLLs', 2, 1]);
    let cycle = pattern.firstCycleValues[0];
    expect(cycle.freq).toEqual(freq);
    expect(cycle.edo).toEqual(12);
    expect(cycle.degree).toEqual(1);
    expect(parseFloat(cycle.root).toFixed(0)).toEqual(root.toFixed(0));

    // base note A4 = 440Hz
    baseNote = 'A4';
    root = 440;
    freq = 880;
    pattern = n('7').edoScale([baseNote, 'LLsLLLs', 2, 1]);
    cycle = pattern.firstCycleValues[0];
    expect(cycle.freq).toEqual(freq);
    expect(cycle.edo).toEqual(12);
    expect(cycle.degree).toEqual(1);
    expect(parseFloat(cycle.root).toFixed(0)).toEqual(root.toFixed(0));
  });
});
