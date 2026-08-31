/*
intervals.mjs - defines Intervals for equal division of the octave (EDO) scale
              - Port of pitfalls/lib/Intervals.lua - see <https://github.com/robmckinnon/pitfalls/blob/main/lib/Intervals.lua>
Copyright (C) 2025 Rob McKinnon and Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/edo/intervals.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import ratiointervals from './ratios.mjs';

function ratio(division, edivisions) {
  return division === 0 ? 1 : Math.pow(2, division / edivisions);
}

export class Intervals {
  constructor(scale) {
    this.scale = scale;
    this.intLabels = [];
    this.intNoms = [];
    this.intRatios = [];
    this.uniqLabels = [];
    this.intErrors = [];
    this.ratios = [];

    const BLANK = '';
    let division = 0;
    const labToErr = {};
    const labToInd = {};

    this.ratios[0] = 1;

    for (let i = 0; i < scale.length; i++) {
      division += scale.stepValue(i);
      this.ratios[i + 1] = ratio(division, scale.edivisions);

      if (i < scale.length) {
        const nearest = ratiointervals.nearestInterval(this.ratios[i + 1]);
        const closeness = nearest[0];
        const ratio = nearest[1];
        const intLabel = ratiointervals.key(ratio);
        this.intLabels[i + 1] = intLabel;
        this.intErrors[i + 1] = closeness;
        this.intNoms[i + 1] = ratio ? ratiointervals.nom(ratio) : 0;
        this.intRatios[i + 1] = ratio ? `${ratiointervals.nom(ratio)}/${ratiointervals.denom(ratio)}` : '';
        this.uniqLabels[i + 1] = BLANK;

        if (intLabel && intLabel !== 'P1' && intLabel !== 'P8') {
          if (!labToErr[intLabel]) {
            this.uniqLabels[i + 1] = intLabel;
            labToInd[intLabel] = i + 1;
            labToErr[intLabel] = closeness;
          } else if (closeness < labToErr[intLabel]) {
            this.uniqLabels[labToInd[intLabel]] = BLANK;
            this.uniqLabels[i + 1] = intLabel;
            labToInd[intLabel] = i + 1;
            labToErr[intLabel] = closeness;
          }
        }
      }
    }
  }

  ratio(i) {
    return this.ratios[i];
  }

  intervalLabel(i) {
    return this.intLabels[i];
  }

  intervalNominator(i) {
    return this.intNoms[i];
  }

  intervalRatio(i) {
    return this.intRatios[i];
  }

  uniqIntervalLabel(i) {
    return this.uniqLabels[i];
  }

  intervalError(i) {
    return this.intErrors[i];
  }

  nearestDegreeTo(r, threshold) {
    let min = 1;
    let degree = null;

    for (const [i, v] of Object.entries(this.ratios)) {
      const diff = Math.abs((r - v) / r);
      if (diff < min) {
        min = diff;
        degree = parseInt(i, 10);
      }
    }

    if (threshold == null) {
      return degree;
    } else {
      return min < threshold ? degree : 1;
    }
  }
}
