/*
audioContext.mjs - Audio Context manager

Sets up a common and accessible audio context for all superdough operations

Copyright (C) 2025 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/audiocontext.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { clearNodePool } from './nodePools.mjs';
import { ClockBridge } from './clockbridge.mjs';

let audioContext, clockBridge;

export const setDefaultAudioContext = () => {
  return setAudioContext(new AudioContext());
};

export const setAudioContext = (context) => {
  // Existing nodes in the node pool contain references to the previous AudioContext,
  // so all the nodes in the pool must be cleared when we set a new AudioContext.
  clearNodePool();
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }
  audioContext = context;
  clockBridge = new ClockBridge(audioContext);
  return audioContext;
};

export const getAudioContext = () => {
  if (!audioContext) {
    return setDefaultAudioContext();
  }

  return audioContext;
};

export function getClockBridge() {
  if (!clockBridge) {
    getAudioContext(); // creates clockBridge
  }
  return clockBridge;
}

export function getAudioContextCurrentTime() {
  return getAudioContext().currentTime;
}
