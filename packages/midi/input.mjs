/*
input.mjs - MIDI input wrapper
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/midi/midi.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { WebMidi } from 'webmidi';
import { logger, ref } from '@strudel/core';
import { getDevice } from './util.mjs';

/**
 * MIDI input device wrapper that manages connection and reconnection, tracks
 * persisted CC states, etc. These instances are long-lived and are maintained as singletons
 * (keyed globally by input string/number).
 */
export class MidiInput {
  /**
   *
   * @param {string | number} input MIDI device name or index defaulting to 0
   */
  constructor(input) {
    this.input = input;
    this.stateKey = typeof input === 'string' ? input : undefined; // Saved state is not tracked for numeric index inputs

    this._refs = {};
    this._refsByChan = {};

    this._loadAllStates();

    this.initialDevice = this._startDeviceListener();
  }

  /**
   * Implementation for the cc() factory function tied to this specific input.
   * @param {number} cc MIDI CC number
   * @param {number | undefined} chan MIDI channel (1-16) or undefined for all channels
   */
  createCC(cc, chan) {
    const lookupMap = chan === undefined ? this._refs : this._refsByChan[chan];
    if (!(cc in lookupMap)) {
      const initialState = this._loadState(chan);
      lookupMap[cc] = initialState[cc] || 0;
    }

    return ref(() => lookupMap[cc]);
  }

  _startDeviceListener() {
    const initialDevice = getDevice(this.input, WebMidi.inputs);

    // Background connection loop
    (async () => {
      const midiListener = this._onMidiMessage.bind(this);
      let device = initialDevice;

      while (true) {
        if (!device) {
          device = await this._waitForDevice();
        }

        // Wait a bit for device to be ready to receive last state
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
          // Still continue if sending did not work
          this._sendAllStates(device);
        } catch (err) {
          console.error('midiin: failed to send last state on connect:', device.name, err);
        }

        // Listen for incoming MIDI messages and for disconnection
        device.addListener('midimessage', midiListener);

        await this._waitForDeviceDisconnect(device);

        device.removeListener('midimessage', midiListener);
        device = null; // Clear var to trigger wait for connection
      }
    })();

    return initialDevice;
  }

  // Returns a promise that resolves when the specified device is connected
  _waitForDevice() {
    return new Promise((resolve) => {
      const connListener = () => {
        const device = getDevice(this.input, WebMidi.inputs);
        if (device) {
          logger(`[midi] device reconnected: ${device.name}`);

          WebMidi.removeListener('connected', connListener);
          resolve(device);
        }
      };

      WebMidi.addListener('connected', connListener);
    });
  }

  // Returns a promise that resolves when the specified device is disconnected
  _waitForDeviceDisconnect(device) {
    return new Promise((resolve) => {
      const disconnListener = (e) => {
        if (e.port.name === device.name) {
          logger(`[midi] device disconnected: ${device.name}`);

          WebMidi.removeListener('disconnected', disconnListener);
          resolve();
        }
      };

      WebMidi.addListener('disconnected', disconnListener);
    });
  }

  _onMidiMessage(e) {
    const ccNum = e.dataBytes[0];
    const v = e.dataBytes[1];
    const chan = e.message.channel;
    const scaled = v / 127;

    this._refs[ccNum] = scaled;
    this._refsByChan[chan] ??= {};
    this._refsByChan[chan][ccNum] = scaled;

    this._saveState(undefined, ccNum, scaled);
    this._saveState(chan, ccNum, scaled);
  }

  _loadAllStates() {
    Object.assign(this._refs, this._loadState(undefined));

    for (let chan = 1; chan <= 16; chan++) {
      this._refsByChan[chan] ??= {};
      Object.assign(this._refsByChan[chan], this._loadState(chan));
    }
  }

  _loadState(chan) {
    if (!this.stateKey) {
      return {};
    }

    const initialDataRaw = localStorage.getItem(
      `strudel-midin-${this.stateKey}-chan${chan !== undefined ? chan : 'all'}`,
    );
    if (!initialDataRaw) {
      return {};
    }

    try {
      return JSON.parse(initialDataRaw);
    } catch (err) {
      console.warn(
        `Failed to parse MIDI state from localStorage for input "${this.stateKey}" and channel "${chan}"`,
        initialDataRaw,
        err,
      );
      return {};
    }
  }

  _saveState(chan, cc, value) {
    if (!this.stateKey) {
      return;
    }

    const state = this._loadState(chan);
    state[cc] = value;
    localStorage.setItem(
      `strudel-midin-${this.stateKey}-chan${chan !== undefined ? chan : 'all'}`,
      JSON.stringify(state),
    );
  }

  // Send CC values back to device to restore encoders and motorized sliders
  _sendAllStates(device) {
    const output = WebMidi.outputs.find((o) => o.name === device.name);
    if (!output) {
      return;
    }

    for (const [chan, refs] of Object.entries(this._refsByChan)) {
      const channel = Number(chan);
      for (const [cc, value] of Object.entries(refs)) {
        const ccn = Number(cc);
        const scaled = Math.round(value * 127);
        output.sendControlChange(ccn, scaled, channel);
      }
    }
  }
}
