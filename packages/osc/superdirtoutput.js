/* import { tauriOscOutput } from '../desktopbridge/oscbridge.mjs';
import { isTauri } from '../desktopbridge/utils.mjs'; */
import { oscOutput } from './osc.mjs';

const output = /* isTauri() ? tauriOscOutput : */ oscOutput;

export const superdirtOutput = (hap, targetTime, cps) => output(hap, targetTime, cps);
