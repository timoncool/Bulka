/*
clockbridge.mjs
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/index.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// thanks freya https://youtu.be/LSNQuFEDOyQ?si=ukZI2IGgWV_NDZzP&t=2979
export function expDecay(a, b, decay, dt) {
  return b + (a - b) * Math.exp(-decay * dt);
}

// translates between audio and performance clock
export class ClockBridge {
  p; // smoothed clock offset
  lastTime;
  audioContext;
  constructor(audioContext) {
    this.audioContext = audioContext;
  }
  // delta between audio and performance time in ms
  getOffset() {
    const { contextTime, performanceTime } = this.audioContext.getOutputTimestamp();
    if (!contextTime || !performanceTime) {
      return;
    }
    const offset = performanceTime - contextTime * 1000; // clock offset in ms
    const dt = performanceTime - (this.lastTime ?? performanceTime); // delta time since last hap
    const decay = 1 / 10000; // how fast offset changes have an effect
    this.p = expDecay(this.p ?? offset, offset, decay, dt); // smooth clock offset
    this.lastTime = performanceTime;
    return this.p;
  }
  getPerformanceTime(audioContextTime) {
    const offset = this.getOffset();
    return audioContextTime * 1000 + offset; // this is now correct in performance time (ms)
  }
  getAudioContextTime(performanceTime) {
    const offset = this.getOffset();
    return (performanceTime - offset) / 1000; // this is now correct in audio context time (seconds)
  }
}
