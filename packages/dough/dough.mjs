/*
dough.mjs
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/osc/osc.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { register, noteToMidi } from '@strudel/core';
import { Dough, doughsamples } from 'dough-synth';
import { getAudioContext, ensureMinimalOutput } from '@strudel/webaudio';
import wasm from 'dough-synth/dough.wasm?url';
import workletCode from 'dough-synth/dough.js?raw';

Object.assign(globalThis, { doughsamples });

let D;
/**
 *
 * initializes dough ahead of time. you don't need to use this, but if you do, you can await it, so dough is ready before the pattern starts.
 *
 * @name initDough
 * @tags external_io
 * @memberof Pattern
 * @example
 * await initDough()
 * $: chord("<Dm9 Dm11 Dm7>").offset("<-1 0 1 0>").voicing()
 * .phaser(3).fm(1.4).fmh(1.01)
 * .dough()
 */
export function initDough() {
  if (!D || D.audioContext !== getAudioContext()) {
    D = new Dough({
      wasm,
      workletCode,
      audioContext: getAudioContext(),
    });
  }
  return D.ready;
}

export async function doughTrigger(hap, _currentTime, cps = 1, targetTime) {
  const offset = D.context_offset?.[0];
  if (!offset) {
    return; // not ready
  }
  hap.ensureObjectValue();
  const event = {
    dough: 'play',
    ...hap.value,
    time: targetTime - offset,
    duration: hap.duration / cps,
  };
  if (typeof event.note === 'string') {
    event.note = noteToMidi(event.note);
  }
  D.evaluate(event);
}

/**
 *
 * Uses dough as the audio engine. more info at https://dough.strudel.cc
 *
 * @name dough
 * @tags external_io
 * @memberof Pattern
 * @returns Pattern
 * @example
 * $: chord("<Dm9 Dm11 Dm7>").offset("<-1 0 1 0>").voicing()
 * .phaser(3).fm(1.4).fmh(1.01)
 * .dough()
 */
export const dough = register('dough', (pat) => {
  initDough();
  ensureMinimalOutput();
  return pat.onTrigger(doughTrigger);
});
