/*
ratios.test.mjs - tests of ratios.mjs
Copyright (C) 2025 Rob McKinnon and Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/edo/test/ratios.test.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import ratiointervals from '../ratios.mjs';
import { describe, it, expect } from 'vitest';

describe('ratiointervals', () => {
  it('updates edivisions', () => {
    let ratio = 9 / 7;
    expect(ratiointervals.key(ratio)).toEqual('S3');
    expect(ratiointervals.label(ratio)).toEqual('M3');
    expect(ratiointervals.fjs(ratio)).toEqual('M3_7');
    expect(ratiointervals.nom(ratio)).toEqual(9);
    expect(ratiointervals.denom(ratio)).toEqual(7);
  });
});
