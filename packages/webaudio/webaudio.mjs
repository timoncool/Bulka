/*
webaudio.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/webaudio/webaudio.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import * as strudel from '@strudel/core';
import {
  superdough,
  getAudioContext,
  setLogger,
  doughTrigger,
  registerWorklet,
  setAudioContext,
  initAudio,
  setSuperdoughAudioController,
  resetGlobalEffects,
  errorLogger,
} from 'superdough';
import './supradough.mjs';
import { workletUrl } from 'supradough';
import { SuperdoughAudioController } from 'superdough/superdoughoutput.mjs';
registerWorklet(workletUrl);

const { Pattern, logger, repl } = strudel;

setLogger(logger);

const hap2value = (hap) => {
  hap.ensureObjectValue();
  return hap.value;
};

// uses more precise, absolute t if available, see https://github.com/tidalcycles/strudel/pull/1004
// TODO: refactor output callbacks to eliminate deadline
export const webaudioOutput = (hap, _deadline, hapDuration, cps, t) => {
  return superdough(hap2value(hap), t, hapDuration, cps, hap.whole?.begin.valueOf());
};

export async function renderPatternAudio(
  pattern,
  cps,
  begin,
  end,
  sampleRate,
  maxPolyphony,
  multiChannelOrbits,
  downloadName = undefined,
) {
  let audioContext = getAudioContext();
  await audioContext.close();
  audioContext = new OfflineAudioContext(2, ((end - begin) / cps) * sampleRate, sampleRate);
  setAudioContext(audioContext);
  setSuperdoughAudioController(new SuperdoughAudioController(audioContext));
  await initAudio({
    maxPolyphony,
    multiChannelOrbits,
  });

  return renderPatternAudioInChunks(audioContext, pattern, cps, begin, end, 1)
    .then((renderedBuffer) => {
      const wavBuffer = audioBufferToWav(renderedBuffer);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      downloadName = downloadName ? `${downloadName}.wav` : `${new Date().toISOString()}.wav`;
      a.download = `${downloadName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .finally(async () => {
      setAudioContext(null);
      setSuperdoughAudioController(null);
      resetGlobalEffects();
    });
}

async function renderPatternAudioInChunks(audioContext, pattern, cps, begin, end, chunkSizeInCycles) {
  let currentCycle = begin;
  let renderPromise = null;

  logger('[webaudio] start rendering');

  while (currentCycle <= end) {
    const chunkStart = currentCycle;
    const chunkEnd = Math.min(currentCycle + chunkSizeInCycles, end);

    logger(`[webaudio] preloading cycles ${chunkStart} - ${chunkEnd}`);

    // Calling superdough(...) in ascending onset time order is important
    // for controls that depend on the audio graph state like `cut`
    let haps = pattern
      .queryArc(chunkStart, chunkEnd, { _cps: cps })
      .sort((a, b) => a.whole.begin.valueOf() - b.whole.begin.valueOf());

    for (const hap of haps) {
      if (hap.hasOnset()) {
        try {
          await superdough(
            hap2value(hap),
            (hap.whole.begin.valueOf() - begin) / cps,
            hap.duration / cps,
            cps,
            (hap.whole?.begin.valueOf() - begin) / cps,
          );
        } catch (err) {
          errorLogger(err, 'webaudio');
        }
      }
    }

    logger(`[webaudio] rendering cycles ${chunkStart} - ${chunkEnd}`);

    currentCycle += chunkSizeInCycles;

    // According to the MDN docs, suspends should be scheduled while
    // the audioContext is not currently running for better precision.
    // So we schedule the suspend first, and await after resuming.
    var suspendPromise;
    if (currentCycle < end) {
      // Make sure to suspend one cycle before the next currentCycle
      // so the next haps can be scheduled on time.
      suspendPromise = audioContext.suspend((currentCycle - begin - 1) / cps);
    }

    if (renderPromise === null) {
      renderPromise = audioContext.startRendering();
    } else {
      await audioContext.resume();
    }

    if (currentCycle < end) {
      await suspendPromise;
    }
  }

  logger('[webaudio] finish rendering');

  return renderPromise;
}

export function webaudioRepl(options = {}) {
  const audioContext = options.audioContext ?? getAudioContext();
  setAudioContext(audioContext);
  options = {
    getTime: () => audioContext.currentTime,
    defaultOutput: webaudioOutput,
    ...options,
  };
  return repl(options);
}

Pattern.prototype.dough = function () {
  return this.onTrigger(doughTrigger, 1);
};

function audioBufferToWav(buffer, opt) {
  opt = opt || {};

  var numChannels = buffer.numberOfChannels;
  var sampleRate = buffer.sampleRate;
  var format = opt.float32 ? 3 : 1;
  var bitDepth = format === 3 ? 32 : 16;

  var result;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }

  return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
}

function encodeWAV(samples, format, sampleRate, numChannels, bitDepth) {
  var bytesPerSample = bitDepth / 8;
  var blockAlign = numChannels * bytesPerSample;

  var buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * bytesPerSample, true);
  if (format === 1) {
    // Raw PCM
    floatTo16BitPCM(view, 44, samples);
  } else {
    writeFloat32(view, 44, samples);
  }

  return buffer;
}

function interleave(inputL, inputR) {
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0;
  var inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeFloat32(output, offset, input) {
  for (var i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function floatTo16BitPCM(output, offset, input) {
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view, offset, string) {
  for (var i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
