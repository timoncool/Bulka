/*
edoscale.mjs - EdoScale defines equal division of the octave (EDO) scale in Ls notation
             - Port of pitfalls/lib/Scale.lua - see <https://github.com/robmckinnon/pitfalls/blob/main/lib/Scale.lua>
Copyright (C) 2025 Rob McKinnon and Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/edo/edoscale.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const M = 2;
const L = 1;
const S = 0;
const LABELS = ['s', 'L', 'M'];

export class EdoScale {
  constructor(large, small, sequence, medium) {
    this.stepbackup = [L, L, S, L, L, L, S, L, L, L, S, L, L, L, S, L];
    this.large = large;
    this.medium = medium || large;
    this.small = small;
    this.divisions = [];
    this.edivisions = null;
    this.sequence = null;
    this.tonic = 1;
    this.mode = 1;
    this.max_steps = 12;
    this.min_steps = 3;
    this.setSequence(sequence);
  }

  hasMedium() {
    return this.step.some((_, i) => this.step[this.offset(i)] === M);
  }

  stepSize(i) {
    return LABELS[this.step[this.offset(i)]];
  }

  sequence() {
    return this.step.map((_, i) => this.stepSize(i)).join('');
  }

  stepValue(i) {
    const step = this.step[this.offset(i)];
    return step === L ? this.large : step === M ? this.medium : this.small;
  }

  offset(i) {
    if (this.mode === 1) {
      return i;
    } else {
      const offset = (this.mode - 1 + i) % this.length;
      return offset === 0 ? this.length : offset;
    }
  }

  static setMaxSteps(max) {
    this.max_steps = max;
  }

  static setMinSteps(min) {
    this.min_steps = min;
  }

  setSequence(sequence) {
    if (this.sequence !== sequence) {
      this.sequence = sequence;
      this.length = sequence.length;
      this.step = [];
      for (let i = 0; i < sequence.length; i++) {
        const char = sequence[i];
        this.step[i] = char === 'L' ? L : char === 'M' ? M : S;
      }
      this.updateEdo();
    } else {
      return false;
    }
  }

  setLarge(l) {
    if (this.large !== l) {
      this.large = l;
      this.updateEdo();
    } else {
      return false;
    }
  }

  setMedium(m) {
    if (this.medium !== m) {
      this.medium = m;
      this.updateEdo();
    } else {
      return false;
    }
  }

  setSmall(s) {
    if (this.small !== s) {
      this.small = s;
      this.updateEdo();
    } else {
      return false;
    }
  }

  setMode(mode) {
    this.mode = mode;
  }

  setTonic(tonic) {
    this.tonic = tonic;
  }

  changeMode(d) {
    const orig = this.mode;
    this.mode = Math.max(1, Math.min(this.mode + d, this.length));
    return orig !== this.mode;
  }

  changeTonic(d) {
    const orig = this.tonic;
    this.tonic = Math.max(1, Math.min(this.tonic + d, this.edivisions));
    return orig !== this.tonic;
  }

  updateEdo() {
    const orig = this.edivisions;
    this.edivisions = this.step.reduce((sum, _, i) => {
      this.divisions[i] = sum;
      return sum + this.stepValue(i);
    }, 0);
    // console.log(this.divisions);
    const changed = orig !== this.edivisions;
    if (changed) {
      this.tonic = Math.max(1, Math.min(this.tonic, this.edivisions));
    }
    return changed;
  }

  changeStep(d, i) {
    const index = this.offset(i);
    const orig = this.step[index];
    this.step[index] = Math.max(S, Math.min(this.step[index] + d, M));
    this.stepbackup[index] = this.step[index];
    const changed = orig !== this.step[index];
    if (changed) {
      this.updateEdo();
    }
    return changed;
  }

  changeLarge(d) {
    const orig = this.large;
    this.setLarge(Math.max(this.small + 1, Math.min(this.large + d, this.large + 1)));
    const changed = this.large !== orig;
    if (changed) {
      if (this.large <= this.medium) {
        this.setMedium(Math.max(this.small + 1, Math.min(this.large - 1, this.large)));
      }
      this.updateEdo();
    }
    return changed;
  }

  changeMedium(d) {
    const orig = this.medium;
    this.setMedium(Math.max(this.small + 1, Math.min(this.medium + d, this.large - 1)));
    const changed = this.medium !== orig;
    if (changed) {
      this.updateEdo();
    }
    return changed;
  }

  changeSmall(d) {
    const orig = this.small;
    const value = this.small + d;

    if (this.hasMedium()) {
      this.setSmall(Math.max(1, Math.min(value, this.medium - 1)));
    } else {
      this.setSmall(Math.max(1, Math.min(value, this.large - 1)));
    }

    const changed = this.small !== orig;
    if (changed) {
      if (this.small >= this.medium) {
        this.setMedium(Math.max(this.small + 1, Math.min(this.large)));
      }
      this.updateEdo();
    }
    return changed;
  }

  changeLength(d) {
    const orig = this.length;
    if (d === 1) {
      this.length = Math.min(this.length + 1, this.max_steps);
    } else if (d === -1) {
      this.length = Math.max(this.length - 1, this.min_steps);
    }

    const changed = this.length !== orig;
    if (changed) {
      this.mode = 1;
      if (d === 1) {
        this.step[this.length] = this.stepbackup[this.length] || L;
      } else if (d === -1 && this.length >= this.min_steps) {
        this.step.pop();
      }
      this.updateEdo();
    }
    return changed;
  }
}
