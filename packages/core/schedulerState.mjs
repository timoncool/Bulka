/*
schedulerState.mjs - Module to pipe out various parameters from the scheduler for global consumption
Copyright (C) 2026 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/schedulerState.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

let time;
let cpsFunc;
let pattern;
let triggerFunc;
let isStarted;
export function getTime() {
  if (!time) {
    throw new Error('no time set! use setTime to define a time source');
  }
  return time();
}

export function setTime(func) {
  time = func;
}

export function setCpsFunc(func) {
  cpsFunc = func;
}

export function getCps() {
  return cpsFunc?.();
}

export function setPattern(pat) {
  pattern = pat;
}

export function getPattern() {
  return pattern;
}

export function setTriggerFunc(func) {
  triggerFunc = func;
}

export function getTriggerFunc() {
  return triggerFunc;
}

export function setIsStarted(val) {
  isStarted = !!val;
}

export function getIsStarted() {
  return isStarted;
}
