import { Pattern, ClockCollator } from '@strudel/core';
import { parseControlsFromHap } from '@strudel/osc/osc.mjs';
import { Invoke } from './utils.mjs';
import { getAudioContext } from '@strudel/webaudio/index.mjs';

const collator = new ClockCollator({});

export async function tauriOscOutput(hap, targetTime, cps = 1) {
  const controls = parseControlsFromHap(hap, cps);
  const params = [];
  const currentTime = getAudioContext().currentTime;
  const timestamp = collator.calculateTimestamp(currentTime, targetTime);

  Object.keys(controls).forEach((key) => {
    const val = controls[key];
    const value = typeof val === 'number' ? val.toString() : val;

    if (value == null) {
      return;
    }
    params.push({
      name: key,
      value,
      valueisnumber: typeof val === 'number',
    });
  });

  if (params.length === 0) {
    return;
  }
  const message = { target: '/dirt/play', timestamp, params };
  setTimeout(() => {
    Invoke('sendosc', { messagesfromjs: [message] });
  });
}
Pattern.prototype.osc = function () {
  return this.onSchedule(tauriOscOutput);
};
