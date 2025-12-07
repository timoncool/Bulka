/*
osc.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/osc/osc.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { logger, parseNumeral, register, isNote, noteToMidi, ClockCollator } from '@strudel/core';

let connection; // Promise<OSC>
function connect() {
  if (!connection) {
    // make sure this runs only once
    connection = new Promise((resolve, reject) => {
      const ws = new WebSocket('ws://localhost:8080');
      ws.addEventListener('open', (event) => {
        logger(`[osc] websocket connected`);
        resolve(ws);
      });
      ws.addEventListener('close', (event) => {
        logger(`[osc] websocket closed`);
        connection = undefined; // allows new connection afterwards
        console.log('[osc] disconnected');
        reject('OSC connection closed');
      });
      ws.addEventListener('error', (err) => reject(err));
    }).catch((err) => {
      connection = undefined;
      throw new Error('Could not connect to OSC server. Is it running?');
    });
  }
  return connection;
}

export function parseControlsFromHap(hap, cps) {
  hap.ensureObjectValue();
  const cycle = hap.wholeOrPart().begin.valueOf();
  const delta = hap.duration.valueOf() / cps;
  const controls = Object.assign({}, { cps, cycle, delta }, hap.value);
  // make sure n and note are numbers
  controls.n && (controls.n = parseNumeral(controls.n));
  if (typeof controls.note !== 'undefined') {
    if (isNote(controls.note)) {
      controls.midinote = noteToMidi(controls.note, controls.octave || 3);
    } else {
      controls.note = parseNumeral(controls.note);
    }
  }
  controls.bank && (controls.s = controls.bank + controls.s);
  controls.roomsize && (controls.size = parseNumeral(controls.roomsize));
  // speed adjustment for CPS is handled on the DSP side in superdirt and pattern side in Strudel,
  // so we need to undo the adjustment before sending the message to superdirt.
  controls.unit === 'c' && controls.speed != null && (controls.speed = controls.speed / cps);
  const channels = controls.channels;
  channels != undefined && (controls.channels = JSON.stringify(channels));
  return controls;
}

const collator = new ClockCollator({});

export async function oscTrigger(hap, currentTime, cps = 1, targetTime) {
  const ws = await connect();
  const controls = parseControlsFromHap(hap, cps);
  const keyvals = Object.entries(controls).flat();
  const ts = collator.calculateTimestamp(currentTime, targetTime) * 1000;
  const msg = { address: '/dirt/play', args: keyvals, timestamp: ts };

  if ('oschost' in hap.value) {
    msg['host'] = hap.value['oschost'];
  }
  if ('oscport' in hap.value) {
    msg['port'] = hap.value['oscport'];
  }
  ws.send(JSON.stringify(msg));
}

/**
 *
 * Отправляет каждый hap как OSC сообщение, которое может быть принято SuperCollider или любым другим программным обеспечением с поддержкой OSC.
 * Для дополнительной информации читайте [MIDI & OSC в документации](https://strudel.cc/learn/input-output/)
 *
 * @name osc
 * @memberof Pattern
 * @returns Pattern
 */
export const osc = register('osc', (pat) => pat.onTrigger(oscTrigger));
