/*
superdough.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/superdough.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import './feedbackdelay.mjs';
import './reverb.mjs';
import './vowel.mjs';
import { nanFallback, _mod, cycleToSeconds, pickAndRename } from './util.mjs';
import workletsUrl from './worklets.mjs?audioworklet';
import { createFilter, gainNode, getCompressor, getDistortion, getLfo, getWorklet, effectSend } from './helpers.mjs';
import { map } from 'nanostores';
import { logger } from './logger.mjs';
import { loadBuffer } from './sampler.mjs';
import { getAudioContext } from './audioContext.mjs';
import { SuperdoughAudioController } from './superdoughoutput.mjs';

export const DEFAULT_MAX_POLYPHONY = 128;
const DEFAULT_AUDIO_DEVICE_NAME = 'System Standard';

let maxPolyphony = DEFAULT_MAX_POLYPHONY;

export function setMaxPolyphony(polyphony) {
  maxPolyphony = parseInt(polyphony) ?? DEFAULT_MAX_POLYPHONY;
}

let multiChannelOrbits = false;
export function setMultiChannelOrbits(bool) {
  multiChannelOrbits = bool == true;
}

export const soundMap = map();

export function registerSound(key, onTrigger, data = {}) {
  key = key.toLowerCase().replace(/\s+/g, '_');
  soundMap.setKey(key, { onTrigger, data });
}

let gainCurveFunc = (val) => val;

export function applyGainCurve(val) {
  return gainCurveFunc(val);
}

export function setGainCurve(newGainCurveFunc) {
  gainCurveFunc = newGainCurveFunc;
}

function aliasBankMap(aliasMap) {
  // Make all bank keys lower case for case insensitivity
  for (const key in aliasMap) {
    aliasMap[key.toLowerCase()] = aliasMap[key];
  }

  // Look through every sound...
  const soundDictionary = soundMap.get();
  for (const key in soundDictionary) {
    // Check if the sound is part of a bank...
    const [bank, suffix] = key.split('_');
    if (!suffix) continue;

    // Check if the bank is aliased...
    const aliasValue = aliasMap[bank];
    if (aliasValue) {
      if (typeof aliasValue === 'string') {
        // Alias a single alias
        soundDictionary[`${aliasValue}_${suffix}`.toLowerCase()] = soundDictionary[key];
      } else if (Array.isArray(aliasValue)) {
        // Alias multiple aliases
        for (const alias of aliasValue) {
          soundDictionary[`${alias}_${suffix}`.toLowerCase()] = soundDictionary[key];
        }
      }
    }
  }

  // Update the sound map!
  // We need to destructure here to trigger the update
  soundMap.set({ ...soundDictionary });
}

async function aliasBankPath(path) {
  const response = await fetch(path);
  const aliasMap = await response.json();
  aliasBankMap(aliasMap);
}

/**
 * Регистрирует alias для банка звуков.
 * Опционально принимает один аргумент - объект с alias банков.
 * Опционально принимает один аргумент - строку с путем к JSON файлу, содержащему alias банков.
 * @param {string} bank - Банк для создания alias
 * @param {string} alias - Alias, который будет использоваться для банка
 */
export async function aliasBank(...args) {
  switch (args.length) {
    case 1:
      if (typeof args[0] === 'string') {
        return aliasBankPath(args[0]);
      } else {
        return aliasBankMap(args[0]);
      }
    case 2:
      return aliasBankMap({ [args[0]]: args[1] });
    default:
      throw new Error('aliasMap expects 1 or 2 arguments, received ' + args.length);
  }
}

/**
 * Регистрирует alias для звука.
 * @param {string} original - Оригинальное имя звука
 * @param {string} alias - Alias, который будет использоваться для звука
 */
export function soundAlias(original, alias) {
  if (getSound(original) == null) {
    logger('soundAlias: original sound not found');
    return;
  }
  soundMap.setKey(alias, getSound(original));
}

export function getSound(s) {
  if (typeof s !== 'string') {
    console.warn(`getSound: expected string got "${s}". fall back to triangle`);
    return soundMap.get().triangle; // is this good?
  }
  return soundMap.get()[s.toLowerCase()];
}

export const getAudioDevices = async () => {
  await navigator.mediaDevices.getUserMedia({ audio: true });
  let mediaDevices = await navigator.mediaDevices.enumerateDevices();
  mediaDevices = mediaDevices.filter((device) => device.kind === 'audiooutput' && device.deviceId !== 'default');
  const devicesMap = new Map();
  devicesMap.set(DEFAULT_AUDIO_DEVICE_NAME, '');
  mediaDevices.forEach((device) => {
    devicesMap.set(device.label, device.deviceId);
  });
  return devicesMap;
};

let defaultDefaultValues = {
  s: 'triangle',
  gain: 0.8,
  postgain: 1,
  density: '.03',
  channels: [1, 2],
  phaserdepth: 0.75,
  shapevol: 1,
  distortvol: 1,
  distorttype: 0,
  delay: 0,
  byteBeatExpression: '0',
  delayfeedback: 0.5,
  delaysync: 3 / 16,
  orbit: 1,
  i: 1,
  velocity: 1,
  fft: 8,
};

const defaultDefaultDefaultValues = Object.freeze({ ...defaultDefaultValues });

export function setDefault(control, value) {
  // const main = getControlName(control); // we cant do this because superdough is independent of strudel/core
  defaultDefaultValues[control] = value;
}

export function resetDefaults() {
  defaultDefaultValues = { ...defaultDefaultDefaultValues };
}

let defaultControls = new Map(Object.entries(defaultDefaultValues));

export function setDefaultValue(key, value) {
  defaultControls.set(key, value);
}
export function getDefaultValue(key) {
  return defaultControls.get(key);
}
export function setDefaultValues(defaultsobj) {
  Object.keys(defaultsobj).forEach((key) => {
    setDefaultValue(key, defaultsobj[key]);
  });
}
export function resetDefaultValues() {
  defaultControls = new Map(Object.entries(defaultDefaultValues));
}
export function setVersionDefaults(version) {
  resetDefaultValues();
  if (version === '1.0') {
    setDefaultValue('fanchor', 0.5);
  }
}

export const resetLoadedSounds = () => soundMap.set({});

let externalWorklets = [];
export function registerWorklet(url) {
  externalWorklets.push(url);
}

let workletsLoading;
function loadWorklets() {
  if (!workletsLoading) {
    const audioCtx = getAudioContext();
    const allWorkletURLs = externalWorklets.concat([workletsUrl]);
    workletsLoading = Promise.all(allWorkletURLs.map((workletURL) => audioCtx.audioWorklet.addModule(workletURL)));
  }

  return workletsLoading;
}

// this function should be called on first user interaction (to avoid console warning)
export async function initAudio(options = {}) {
  const {
    disableWorklets = false,
    maxPolyphony,
    audioDeviceName = DEFAULT_AUDIO_DEVICE_NAME,
    multiChannelOrbits = false,
  } = options;

  setMaxPolyphony(maxPolyphony);
  setMultiChannelOrbits(multiChannelOrbits);
  if (typeof window === 'undefined') {
    return;
  }

  const audioCtx = getAudioContext();

  if (audioDeviceName != null && audioDeviceName != DEFAULT_AUDIO_DEVICE_NAME) {
    try {
      const devices = await getAudioDevices();
      const id = devices.get(audioDeviceName);
      const isValidID = (id ?? '').length > 0;
      if (audioCtx.sinkId !== id && isValidID) {
        await audioCtx.setSinkId(id);
      }
      logger(
        `[superdough] Audio Device set to ${audioDeviceName}, it might take a few seconds before audio plays on all output channels`,
      );
    } catch {
      logger('[superdough] failed to set audio interface', 'warning');
    }
  }

  await audioCtx.resume();
  if (disableWorklets) {
    logger('[superdough]: AudioWorklets disabled with disableWorklets');
    return;
  }
  try {
    await loadWorklets();
    logger('[superdough] AudioWorklets loaded');
  } catch (err) {
    console.warn('could not load AudioWorklet effects', err);
  }
  logger('[superdough] ready');
}
let audioReady;
export async function initAudioOnFirstClick(options) {
  if (!audioReady) {
    audioReady = new Promise((resolve) => {
      document.addEventListener('mousedown', async function listener() {
        document.removeEventListener('mousedown', listener);
        await initAudio(options);
        resolve();
      });
    });
  }
  return audioReady;
}

let controller;
export function getSuperdoughAudioController() {
  if (controller == null) {
    controller = new SuperdoughAudioController(getAudioContext());
  }
  return controller;
}
export function connectToDestination(input, channels) {
  const controller = getSuperdoughAudioController();
  controller.output.connectToDestination(input, channels);
}

function getPhaser(time, end, frequency = 1, depth = 0.5, centerFrequency = 1000, sweep = 2000) {
  const ac = getAudioContext();
  const lfo = getLfo(ac, time, end, { frequency, depth: sweep * 2 });

  //filters
  const numStages = 2; //num of filters in series
  let fOffset = 0;
  const filterChain = [];
  for (let i = 0; i < numStages; i++) {
    const filter = ac.createBiquadFilter();
    filter.type = 'notch';
    filter.gain.value = 1;
    filter.frequency.value = centerFrequency + fOffset;
    filter.Q.value = 2 - Math.min(Math.max(depth * 2, 0), 1.9);

    lfo.connect(filter.detune);
    fOffset += 282;
    if (i > 0) {
      filterChain[i - 1].connect(filter);
    }
    filterChain.push(filter);
  }
  return { phaser: filterChain[filterChain.length - 1], lfo };
}

function getFilterType(ftype) {
  ftype = ftype ?? 0;
  const filterTypes = ['12db', 'ladder', '24db'];
  return typeof ftype === 'number' ? filterTypes[Math.floor(_mod(ftype, filterTypes.length))] : ftype;
}

export let analysers = {},
  analysersData = {};

export function getAnalyserById(id, fftSize = 1024, smoothingTimeConstant = 0.5) {
  if (!analysers[id]) {
    // make sure this doesn't happen too often as it piles up garbage
    const analyserNode = getAudioContext().createAnalyser();
    analyserNode.fftSize = fftSize;
    analyserNode.smoothingTimeConstant = smoothingTimeConstant;
    // getDestination().connect(analyserNode);
    analysers[id] = analyserNode;
    analysersData[id] = new Float32Array(analysers[id].frequencyBinCount);
  }
  if (analysers[id].fftSize !== fftSize) {
    analysers[id].fftSize = fftSize;
    analysersData[id] = new Float32Array(analysers[id].frequencyBinCount);
  }
  return analysers[id];
}

export function getAnalyzerData(type = 'time', id = 1) {
  const getter = {
    time: () => analysers[id]?.getFloatTimeDomainData(analysersData[id]),
    frequency: () => analysers[id]?.getFloatFrequencyData(analysersData[id]),
  }[type];
  if (!getter) {
    throw new Error(`getAnalyzerData: ${type} not supported. use one of ${Object.keys(getter).join(', ')}`);
  }
  getter();
  return analysersData[id];
}

export function resetGlobalEffects() {
  controller?.reset();
  analysers = {};
  analysersData = {};
}

let activeSoundSources = new Map();
//music programs/audio gear usually increments inputs/outputs from 1, we need to subtract 1 from the input because the webaudio API channels start at 0

function mapChannelNumbers(channels) {
  return (Array.isArray(channels) ? channels : [channels]).map((ch) => ch - 1);
}

export const superdough = async (value, t, hapDuration, cps = 0.5, cycle = 0.5) => {
  // new: t is always expected to be the absolute target onset time
  const ac = getAudioContext();
  const audioController = getSuperdoughAudioController();

  let { stretch } = value;
  if (stretch != null) {
    //account for phase vocoder latency
    const latency = 0.04;
    t = t - latency;
  }
  if (typeof value !== 'object') {
    throw new Error(
      `expected hap.value to be an object, but got "${value}". Hint: append .note() or .s() to the end`,
      'error',
    );
  }

  // duration is passed as value too..
  value.duration = hapDuration;
  // calculate absolute time

  if (t < ac.currentTime) {
    console.warn(
      `[superdough]: cannot schedule sounds in the past (target: ${t.toFixed(2)}, now: ${ac.currentTime.toFixed(2)})`,
    );
    return;
  }
  // destructure
  let {
    tremolo,
    tremolosync,
    tremolodepth = 1,
    tremoloskew,
    tremolophase = 0,
    tremoloshape,
    s = getDefaultValue('s'),
    bank,
    source,
    gain = getDefaultValue('gain'),
    postgain = getDefaultValue('postgain'),
    density = getDefaultValue('density'),
    duckorbit,
    duckonset,
    duckattack,
    duckdepth,
    djf,
    // filters
    fanchor = getDefaultValue('fanchor'),
    release = 0,

    //phaser
    phaserrate,
    phaserdepth = getDefaultValue('phaserdepth'),
    phasersweep,
    phasercenter,
    //
    coarse,

    crush,
    dry,
    shape,
    shapevol = getDefaultValue('shapevol'),
    distort,
    distortvol = getDefaultValue('distortvol'),
    distorttype = getDefaultValue('distorttype'),
    pan,
    vowel,
    delay = getDefaultValue('delay'),
    delayfeedback = getDefaultValue('delayfeedback'),
    delaysync = getDefaultValue('delaysync'),
    delaytime,
    orbit = getDefaultValue('orbit'),
    room,
    roomfade,
    roomlp,
    roomdim,
    roomsize,
    ir,
    irspeed,
    irbegin,
    i = getDefaultValue('i'),
    velocity = getDefaultValue('velocity'),
    analyze, // analyser wet
    fft = getDefaultValue('fft'), // fftSize 0 - 10
    compressor: compressorThreshold,
    compressorRatio,
    compressorKnee,
    compressorAttack,
    compressorRelease,
  } = value;

  delaytime = delaytime ?? cycleToSeconds(delaysync, cps);

  const orbitChannels = mapChannelNumbers(
    multiChannelOrbits && orbit > 0 ? [orbit * 2 - 1, orbit * 2] : getDefaultValue('channels'),
  );

  const channels = value.channels != null ? mapChannelNumbers(value.channels) : orbitChannels;
  const orbitBus = audioController.getOrbit(orbit, channels);
  if (duckorbit != null) {
    audioController.duck(duckorbit, t, duckonset, duckattack, duckdepth);
  }

  gain = applyGainCurve(nanFallback(gain, 1));
  postgain = applyGainCurve(postgain);
  shapevol = applyGainCurve(shapevol);
  distortvol = applyGainCurve(distortvol);
  delay = applyGainCurve(delay);
  velocity = applyGainCurve(velocity);
  tremolodepth = applyGainCurve(tremolodepth);
  gain *= velocity; // velocity currently only multiplies with gain. it might do other things in the future

  const end = t + hapDuration;
  const endWithRelease = end + release;
  const chainID = Math.round(Math.random() * 1000000);

  // oldest audio nodes will be destroyed if maximum polyphony is exceeded
  for (let i = 0; i <= activeSoundSources.size - maxPolyphony; i++) {
    const ch = activeSoundSources.entries().next();
    const source = ch.value[1].deref();
    const chainID = ch.value[0];
    const endTime = t + 0.25;
    source?.node?.gain?.linearRampToValueAtTime(0, endTime);
    source?.stop?.(endTime);
    activeSoundSources.delete(chainID);
  }

  let audioNodes = [];

  if (['-', '~', '_'].includes(s)) {
    return;
  }
  if (bank && s) {
    s = `${bank}_${s}`;
    value.s = s;
  }

  // get source AudioNode
  let sourceNode;
  if (source) {
    sourceNode = source(t, value, hapDuration, cps);
  } else if (getSound(s)) {
    const { onTrigger } = getSound(s);
    const onEnded = () => {
      audioNodes.forEach((n) => n?.disconnect());
      activeSoundSources.delete(chainID);
    };
    const soundHandle = await onTrigger(t, value, onEnded, cps);

    if (soundHandle) {
      sourceNode = soundHandle.node;
      activeSoundSources.set(chainID, new WeakRef(soundHandle)); // allow GC
    }
  } else {
    throw new Error(`sound ${s} not found! Is it loaded?`);
  }
  if (!sourceNode) {
    // if onTrigger does not return anything, we will just silently skip
    // this can be used for things like speed(0) in the sampler
    return;
  }

  if (ac.currentTime > t) {
    logger('[webaudio] skip hap: still loading', ac.currentTime - t);
    return;
  }
  const chain = []; // audio nodes that will be connected to each other sequentially
  chain.push(sourceNode);
  stretch !== undefined && chain.push(getWorklet(ac, 'phase-vocoder-processor', { pitchFactor: stretch }));

  // gain stage
  chain.push(gainNode(gain));

  // filter
  const ftype = getFilterType(value.ftype);

  if (value.cutoff !== undefined) {
    const lpMap = {
      frequency: 'cutoff',
      q: 'resonance',
      attack: 'lpattack',
      decay: 'lpdecay',
      sustain: 'lpsustain',
      release: 'lprelease',
      env: 'lpenv',
      anchor: 'fanchor',
      model: 'ftype',
      drive: 'drive',
      rate: 'lprate',
      sync: 'lpsync',
      depth: 'lpdepth',
      depthfrequency: 'lpdepthfrequency',
      shape: 'lpshape',
      dcoffset: 'lpdc',
      skew: 'lpskew',
    };
    const lpParams = pickAndRename(value, lpMap);
    lpParams.type = 'lowpass';
    const lp = () => createFilter(ac, t, end, lpParams, cps, cycle);
    const { filter: lpf1, lfo: lfo1 } = lp();
    chain.push(lpf1);
    lfo1 && audioNodes.push(lfo1);
    if (ftype === '24db') {
      const { filter: lpf2, lfo: lfo2 } = lp();
      chain.push(lpf2);
      lfo2 && audioNodes.push(lfo2);
    }
  }

  if (value.hcutoff !== undefined) {
    const hpMap = {
      frequency: 'hcutoff',
      q: 'hresonance',
      attack: 'hpattack',
      decay: 'hpdecay',
      sustain: 'hpsustain',
      release: 'hprelease',
      env: 'hpenv',
      anchor: 'fanchor',
      model: 'ftype',
      drive: 'drive',
      rate: 'hprate',
      sync: 'hpsync',
      depth: 'hpdepth',
      depthfrequency: 'hpdepthfrequency',
      shape: 'hpshape',
      dcoffset: 'hpdc',
      skew: 'hpskew',
    };
    const hpParams = pickAndRename(value, hpMap);
    hpParams.type = 'highpass';
    const hp = () => createFilter(ac, t, end, hpParams, cps, cycle);
    const { filter: hpf1, lfo: lfo1 } = hp();
    chain.push(hpf1);
    lfo1 && audioNodes.push(lfo1);
    if (ftype === '24db') {
      const { filter: hpf2, lfo: lfo2 } = hp();
      chain.push(hpf2);
      lfo2 && audioNodes.push(lfo2);
    }
  }

  if (value.bandf !== undefined) {
    const bpMap = {
      frequency: 'bandf',
      q: 'bandq',
      attack: 'bpattack',
      decay: 'bpdecay',
      sustain: 'bpsustain',
      release: 'bprelease',
      env: 'bpenv',
      anchor: 'fanchor',
      model: 'ftype',
      drive: 'drive',
      rate: 'bprate',
      sync: 'bpsync',
      depth: 'bpdepth',
      depthfrequency: 'bpdepthfrequency',
      shape: 'bpshape',
      dcoffset: 'bpdc',
      skew: 'bpskew',
    };
    const bpParams = pickAndRename(value, bpMap);
    bpParams.type = 'bandpass';
    const bp = () => createFilter(ac, t, end, bpParams, cps, cycle);
    const { filter: bpf1, lfo: lfo1 } = bp();
    chain.push(bpf1);
    lfo1 && audioNodes.push(lfo1);
    if (ftype === '24db') {
      const { filter: bpf2, lfo: lfo2 } = bp();
      chain.push(bpf2);
      lfo2 && audioNodes.push(lfo2);
    }
  }

  if (vowel !== undefined) {
    const vowelFilter = ac.createVowelFilter(vowel);
    chain.push(vowelFilter);
  }

  // effects
  coarse !== undefined && chain.push(getWorklet(ac, 'coarse-processor', { coarse }));
  crush !== undefined && chain.push(getWorklet(ac, 'crush-processor', { crush }));
  shape !== undefined && chain.push(getWorklet(ac, 'shape-processor', { shape, postgain: shapevol }));
  distort !== undefined && chain.push(getDistortion(distort, distortvol, distorttype));

  if (tremolosync != null) {
    tremolo = cps * tremolosync;
  }

  if (value.wtPosSynced != null) {
    value.wtPosRate /= cps;
  }

  if (value.wtWarpSynced != null) {
    value.wtWarpRate /= cps;
  }

  if (tremolo !== undefined) {
    // Allow clipping of modulator for more dynamic possiblities, and to prevent speaker overload
    // EX:  a triangle waveform will clip like this /-\ when the depth is above 1
    const gain = Math.max(1 - tremolodepth, 0);
    const amGain = new GainNode(ac, { gain });

    const time = cycle / cps;
    const lfo = getLfo(ac, t, endWithRelease, {
      skew: tremoloskew ?? (tremoloshape != null ? 0.5 : 1),
      frequency: tremolo,
      depth: tremolodepth,
      time,
      dcoffset: 0,
      shape: tremoloshape,
      phaseoffset: tremolophase,
      min: 0,
      max: 1,
      curve: 1.5,
    });
    lfo.connect(amGain.gain);
    audioNodes.push(lfo);
    chain.push(amGain);
  }

  compressorThreshold !== undefined &&
    chain.push(
      getCompressor(ac, compressorThreshold, compressorRatio, compressorKnee, compressorAttack, compressorRelease),
    );

  // panning
  if (pan !== undefined) {
    const panner = ac.createStereoPanner();
    panner.pan.value = 2 * pan - 1;
    chain.push(panner);
  }
  // phaser
  if (phaserrate !== undefined && phaserdepth > 0) {
    const { phaser, lfo } = getPhaser(t, endWithRelease, phaserrate, phaserdepth, phasercenter, phasersweep);
    audioNodes.push(lfo);
    chain.push(phaser);
  }

  // last gain
  const post = new GainNode(ac, { gain: postgain });
  chain.push(post);

  // delay
  if (delay > 0 && delaytime > 0 && delayfeedback > 0) {
    orbitBus.getDelay(delaytime, delayfeedback, t);
    const send = orbitBus.sendDelay(post, delay);
    audioNodes.push(send);
  }
  // reverb
  if (room > 0) {
    let roomIR;
    if (ir !== undefined) {
      let url;
      let sample = getSound(ir);
      if (Array.isArray(sample)) {
        url = sample.data.samples[i % sample.data.samples.length];
      } else if (typeof sample === 'object') {
        url = Object.values(sample.data.samples).flat()[i % Object.values(sample.data.samples).length];
      }
      roomIR = await loadBuffer(url, ac, ir, 0);
    }
    orbitBus.getReverb(roomsize, roomfade, roomlp, roomdim, roomIR, irspeed, irbegin);
    const send = orbitBus.sendReverb(post, room);
    audioNodes.push(send);
  }

  if (djf != null) {
    orbitBus.getDjf(djf, t);
  }

  // analyser
  if (analyze) {
    const analyserNode = getAnalyserById(analyze, 2 ** (fft + 5));
    const analyserSend = effectSend(post, analyserNode, 1);
    audioNodes.push(analyserSend);
  }
  if (dry != null) {
    dry = applyGainCurve(dry);
    const dryGain = new GainNode(ac, { gain: dry });
    chain.push(dryGain);
    orbitBus.connectToOutput(dryGain);
  } else {
    orbitBus.connectToOutput(post);
  }

  // connect chain elements together
  chain.slice(1).reduce((last, current) => last.connect(current), chain[0]);
  audioNodes = audioNodes.concat(chain);
};

export const superdoughTrigger = (t, hap, ct, cps) => {
  superdough(hap, t - ct, hap.duration / cps, cps);
};
