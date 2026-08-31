/*
ratios.mjs - lists whole number ratios for pitch intervals
           - Port of pitfalls/lib/ratios.lua - see <https://github.com/robmckinnon/pitfalls/blob/main/lib/ratios.lua>
Copyright (C) 2025 Rob McKinnon and Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/edo/ratios.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const ratiointervals = {};

// FJS Calculators - https://misotanni.github.io/fjs/en/calc.html
// List of pitch intervals - https://en.wikipedia.org/wiki/List_of_pitch_intervals
// Gallery of just intervals - https://en.xen.wiki/w/Gallery_of_just_intervals
// Two letter codes changed to make different interval labels more unique.
ratiointervals.list = new Map([
  [1, ['P1', 'P1', 'P1', 1, 1]], // unison P1
  [16 / 15, ['m2', 'm2', 'm2_5', 16, 15]], // minor second m2
  [15 / 14, ['A1', 'A1', 'A1^5_7', 15, 14]], // augmented unison
  [13 / 12, ['t2', 'm2', 'm2^13', 13, 12]], // tridecimal neutral second
  [12 / 11, ['N2', 'M2', 'M2_11', 12, 11]], // undecimal neutral second
  [11 / 10, ['n2', 'm2', 'm2^11_5', 11, 10]], // undecimal submajor second
  [10 / 9, ['T2', 'M2', 'M2^5', 10, 9]], // classic (whole) tone
  [9 / 8, ['M2', 'M2', 'M2', 9, 8]], // major second M2
  [8 / 7, ['S2', 'M2', 'M2_7', 8, 7]], // septimal major second
  [7 / 6, ['s3', 'm3', 'm3^7', 7, 6]], // septimal minor third
  [19 / 16, ['o3', 'm3', 'm3^19', 19, 16]], // otonal minor third
  [6 / 5, ['m3', 'm3', 'm3_5', 6, 5]], // minor third m3
  [17 / 14, ['t3', 'm3', 'm3^17_7', 17, 14]], // septendecimal supraminor third
  [11 / 9, ['n3', 'm3', 'm3^11', 11, 9]], // undecimal neutral third
  [5 / 4, ['M3', 'M3', 'M3^5', 5, 4]], // major third M3
  [9 / 7, ['S3', 'M3', 'M3_7', 9, 7]], // septimal major third SM3
  [13 / 10, ['d4', 'd4', 'd4^13_5', 13, 10]], // Barbados third
  [4 / 3, ['P4', 'P4', 'P4', 4, 3]], // perfect fourth P4
  [19 / 14, ['N4', 'P4', 'P4^19_7', 19, 14]], // undevicesimal wide fourth
  [11 / 8, ['n4', 'P4', 'P4^11', 11, 8]], // super-fourth
  [25 / 18, ['a4', 'A4', 'A4^5,5', 25, 18]], // classic augmented fourth
  [7 / 5, ['sT', 'd5', 'd5^7_5', 7, 5]], // lesser septimal tritone
  [45 / 32, ['A4', 'A4', 'A4^5', 45, 32]], // just augmented fourth
  [17 / 12, ['d5', 'd5', 'd5^17', 17, 12]], // larger septendecimal tritone
  [10 / 7, ['ST', 'A4', 'A4^5_7', 10, 7]], // greater septimal tritone
  [13 / 9, ['t5', 'd5', 'd5^13', 13, 9]], // tridecimal diminished fifth
  [3 / 2, ['P5', 'P5', 'P5', 3, 2]], // perfect fifth P5
  [14 / 9, ['s6', 'M6', 'm6^7', 14, 9]], // subminor sixth or septimal sixth
  [25 / 16, ['a5', 'A5', 'A5^5,5', 25, 16]], // classic augmented fifth
  [11 / 7, ['A5', 'P5', 'P5^11_7', 11, 7]], // undecimal minor sixth
  [8 / 5, ['m6', 'm6', 'm6_5', 8, 5]], // minor sixth m6
  [13 / 8, ['N6', 'm6', 'm6^13', 13, 8]], // tridecimal neutral sixth
  [18 / 11, ['n6', 'M6', 'M6_11', 18, 11]], // undecimal neutral sixth
  [5 / 3, ['M6', 'M6', 'M6^5', 5, 3]], // just major sixth M6
  [128 / 75, ['d7', 'd7', 'd7_5,5', 128, 75]], // diminished seventh
  [17 / 10, ['T6', 'd7', 'd7^17_5', 17, 10]], // septendecimal diminished seventh
  [12 / 7, ['S6', 'M6', 'M6_7', 12, 7]], // septimal major sixth
  [7 / 4, ['s7', 'm7', 'm7^7', 7, 4]], // septimal minor seventh
  [16 / 9, ['m7', 'm7', 'm7', 16, 9]], // lesser minor seventh
  [9 / 5, ['g7', 'm7', 'm7_5', 9, 5]], // greater just minor seventh
  [11 / 6, ['n7', 'm7', 'm7^11', 11, 6]], // undecimal neutral seventh
  [13 / 7, ['N7', 'm7', 'm7^13_7', 13, 7]], // tridecimal neutral seventh
  [15 / 8, ['M7', 'M7', 'M7^5', 15, 8]], // major seventh
  [17 / 9, ['T7', 'd8', 'd8^17', 17, 9]], // large septendecimal major seventh
  [19 / 10, ['d8', 'd8', 'd8^19_5', 19, 10]], // large undevicesimal major seventh
  [2, ['P8', 'P8', 'P8', 2, 1]], // octave P8
]);

ratiointervals.key = function (ratio) {
  return ratio == null ? '' : ratiointervals.list.get(ratio)?.[0] || '';
};

ratiointervals.label = function (ratio) {
  return ratio == null ? '' : ratiointervals.list.get(ratio)?.[1] || '';
};

ratiointervals.fjs = function (ratio) {
  return ratio == null ? '' : ratiointervals.list.get(ratio)?.[2] || '';
};

ratiointervals.nom = function (ratio) {
  return ratio == null ? null : ratiointervals.list.get(ratio)?.[3] || null;
};

ratiointervals.denom = function (ratio) {
  return ratio == null ? null : ratiointervals.list.get(ratio)?.[4] || null;
};

ratiointervals.nearestInterval = function (v) {
  let min = 1;
  let match = null;
  for (const [ratio, _labels] of ratiointervals.list) {
    const diff = Math.abs((ratio - v) / ratio);
    if (diff < min) {
      min = diff;
      match = ratio;
    }
  }
  return min < 0.01 ? [min, match] : [null, null];
};

export default ratiointervals;
