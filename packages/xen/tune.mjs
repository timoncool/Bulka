/*
tune.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/xen/tune.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Tune from './tunejs.js';
import { register } from '@strudel/core';

/**
 * Assumes pattern contains numerical scale degrees on the `i` control (see examples below). Accepts a scale name or list of frequencies (see all available names at the link on the reference). Returns a new pattern with all values mapped to a frequency ratio. Similar to `xen`.
 * @name tune
 * @returns Pattern
 * @memberof Pattern
 * @param {(string | number[] )} scale
 * @example
 * i("0 1 2 3 4 5").tune("hexany15").mul("220").freq()
 * @example
 * // You can set your root to be a
 * // particular note with getFreq:
 * i("4 8 9 10 - - 5 7 9 11 - -").tune("tranh3")
 *   .mul(getFreq('c3'))
 *   .freq().clip(.5).room(1)
 * @example
 * // You can also give tune a list of
 * // frequencies to use as the scale:
 * i("0 1 2 3 4").tune([
 *   261.6255653006,
 *   302.72962012827,
 *   350.29154279212,
 *   405.32593044476,
 *   469.00678383895,
 *   523.2511306012
 * ]).mul(220).freq();
 *
 * @tags tonal
 */

// Tune.scale seems to be in ratio format
export const tune = register('tune', (scale, pat) => {
  const tune = new Tune();
  if (!tune.isValidScale(scale)) {
    throw new Error('not a valid tune.js scale name: "' + scale + '". See http://abbernie.github.io/tune/scales.html');
  }
  tune.loadScale(scale);
  // if the tonic is a frequency, why are we putting in "1"
  tune.tonicize(1);
  return pat.withHap((hap) => {
    if (typeof hap.value !== 'object') {
      throw new Error(`Expected hap to have control 'i' set, but received ${hap.value.i}, try wrapping input in i()`);
    }
    // const { i, ...otherValues } = hap.value;
    // hap.value = { ...otherValues, freq: tune.note(i)}
    // return hap
    return hap.withValue(() => tune.note(hap.value.i));
  });
});
