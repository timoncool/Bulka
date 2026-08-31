/*
superdough.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/superdough.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import './feedbackdelay.mjs';
import './reverb.mjs';
import './vowel.mjs';
import { clamp, nanFallback, _mod, cycleToSeconds, pickAndRename } from './util.mjs';
import workletsUrl from './worklets.mjs?audioworklet';
import { getNodeFromPool, isPoolable, releaseNodeToPool } from './nodePools.mjs';
import {
  createFilter,
  effectSend,
  gainNode,
  getCompressor,
  getDistortion,
  getFrequencyFromValue,
  getLfo,
  getWorklet,
  releaseAudioNode,
  webAudioTimeout,
} from './helpers.mjs';
import { map } from 'nanostores';
import { logger } from './logger.mjs';
import { connectLFO, connectEnvelope, connectBusModulator } from './modulators.mjs';
import { getSampleBufferSource, loadBuffer } from './sampler.mjs';
import { getAudioContext } from './audioContext.mjs';
import { SuperdoughAudioController } from './superdoughoutput.mjs';
import { resetSeenKeys } from './wavetable.mjs';

export const DEFAULT_MAX_POLYPHONY = 128;
const DEFAULT_AUDIO_DEVICE_NAME = 'System Standard';

export let maxPolyphony = DEFAULT_MAX_POLYPHONY;

/**
 * Set the max polyphony. If notes are ringing out via `release` then they will
 * start to die out in first-in-first-out order once the max polyphony has been hit
 *
 * @name setMaxPolyphony
 * @tags superdough
 * @param {number} Max polyphony. Defaults to 128
 * @example
 * setMaxPolyphony(4)
 * n(irand(24).seg(8)).scale("C#3:minor").room(1).release(4).gain(0.5)
 *
 */
export function setMaxPolyphony(polyphony) {
  maxPolyphony = parseInt(polyphony) ?? DEFAULT_MAX_POLYPHONY;
}

export let multiChannelOrbits = false;
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

/**
 * Apply a function to all gains provided in patterns. Can be used to rescale gain to be
 * quadratic, exponential, etc. rather than linear
 *
 * @name setGainCurve
 * @tags amplitude, superdough
 * @param {Function} function to apply to all gain values
 * @example
 * setGainCurve((x) => x * x) // quadratic gain
 * s("bd*4").gain(0.5) // equivalent to 0.25 gain normally
 *
 */
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
 * Register an alias for a bank of sounds.
 * Optionally accepts a single argument map of bank aliases.
 * Optionally accepts a single argument string of a path to a JSON file containing bank aliases.
 * @param {string} bank - The bank to alias
 * @param {string} alias - The alias to use for the bank
 *
 * @tags samples
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
 * Register an alias for a sound.
 * @tags samples
 * @param {string} original - The original sound name
 * @param {string} alias - The alias to use for the sound
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
  busgain: 1,
  byteBeatExpression: '0',
  delayfeedback: 0.5,
  delaysync: 3 / 16,
  orbit: 1,
  i: 1,
  velocity: 1,
  fft: 8,
  tremolodepth: 1,
  tremolophase: 0,
  release: 0.01,
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
export function loadWorklets() {
  if (!workletsLoading) {
    const audioCtx = getAudioContext();
    const allWorkletURLs = externalWorklets.concat([workletsUrl]);
    workletsLoading = Promise.all(allWorkletURLs.map((workletURL) => audioCtx.audioWorklet.addModule(workletURL))).then(
      () => (workletsLoading = undefined),
    );
  }

  return workletsLoading;
}

let kabel;
async function initKabelsalat() {
  const { SalatRepl } = await import('@kabelsalat/web');
  logger('[kabelsalat] ready');
  kabel = new SalatRepl({ localScope: true });
  return kabel;
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
  resetSeenKeys();
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
  if ((!audioCtx) instanceof OfflineAudioContext) {
    await audioCtx.resume();
  }
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
  await initKabelsalat();
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

export function setSuperdoughAudioController(newController) {
  controller = newController;
  return controller;
}

export function connectToDestination(input, channels) {
  const controller = getSuperdoughAudioController();
  controller.output.connectToDestination(input, channels);
}

function getPhaser(begin, end, frequency = 1, depth = 0.5, centerFrequency = 1000, sweep = 2000) {
  const ac = getAudioContext();
  const lfo = getLfo(ac, { frequency, depth: sweep * 2, begin, end });

  //filters
  const numStages = 1; //num of filters in series
  let fOffset = 282; //for backward compat in #1800
  const filterChain = [];
  for (let i = 0; i < numStages; i++) {
    const filter = getNodeFromPool('filter', () => ac.createBiquadFilter());
    filter.type = 'notch';
    filter.gain.value = 1;
    filter.frequency.value = centerFrequency + fOffset;
    filter.Q.value = 2 - Math.min(Math.max(depth * 2, 0), 1.9);

    lfo.connect(filter.detune);
    fOffset += 282;
    filterChain.push(filter);
  }
  return { filterChain, lfo };
}

function getFilterType(ftype) {
  ftype = ftype ?? 0;
  const filterTypes = ['12db', 'ladder', '24db'];
  return typeof ftype === 'number' ? filterTypes[Math.floor(_mod(ftype, filterTypes.length))] : ftype;
}

export let analysers = {},
  analysersData = {};

export function getAnalyserById(id, fftSize = 1024, smoothingTimeConstant = 0.5) {
  if (!analysers[id] || analysers[id].context != getAudioContext()) {
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

class Chain {
  constructor() {
    this.audioNodes = [];
    this.tails = [];
  }
  connect(...nodes) {
    nodes.forEach((node) => {
      this.tails.forEach((tail) => {
        tail.connect(node);
      });
    });
    this.tails = nodes;
    this.audioNodes.push(...nodes);
    return this;
  }
  connectOne(idx, node) {
    this.tails[idx].connect(node);
    this.tails[idx] = node;
    this.audioNodes.push(node);
    return this;
  }
  releaseNodes() {
    this.audioNodes.forEach((n) => (isPoolable(n) ? releaseNodeToPool(n) : releaseAudioNode(n)));
    this.audioNodes = [];
    this.tails = [];
  }
}

const compileKabel = (code) => {
  if (!kabel) {
    throw new Error('kabelsalat not loaded');
  }
  const node = kabel.evaluate(code);
  return node.compile({ log: false });
};

export const superdough = async (value, t, hapDuration, cps = 0.5, cycle = 0.5) => {
  // mapping from main FX and numbered FX chains to nodes
  const nodes = { main: {} };
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
    s = getDefaultValue('s'),
    bank,
    source,
    postgain = getDefaultValue('postgain'),
    duckorbit,
    duckonset,
    duckattack,
    duckdepth,
    djf,
    release = getDefaultValue('release'),
    dry,
    delay = getDefaultValue('delay'),
    delayfeedback = getDefaultValue('delayfeedback'),
    delaysync = getDefaultValue('delaysync'),
    delaytime,
    orbit = getDefaultValue('orbit'),
    bus,
    busgain = getDefaultValue('busgain'),
    room,
    roomfade,
    roomlp,
    roomdim,
    roomsize,
    ir,
    irspeed,
    irbegin,
    i = getDefaultValue('i'),
    analyze, // analyser wet
    fft = getDefaultValue('fft'), // fftSize 0 - 10
    FX = [],
    FXrelease,
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

  postgain = applyGainCurve(postgain);
  delay = applyGainCurve(delay);
  busgain = applyGainCurve(busgain);

  const end = t + hapDuration;
  const fullRelease = Math.max(release, FXrelease ?? 0);
  const endWithRelease = end + fullRelease;
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

  if (['-', '~', '_'].includes(s)) {
    return;
  }
  if (bank && s) {
    s = `${bank}_${s}`;
    value.s = s;
  }

  const chain = new Chain(); // connection manager which tracks audio nodes for releasing

  // get source AudioNode
  let sourceNode;
  if (source) {
    sourceNode = source(t, value, hapDuration, cps);
    nodes.main['source'] = [sourceNode];
  } else if (getSound(s)) {
    const { onTrigger } = getSound(s);

    const onEnded = () =>
      webAudioTimeout(
        ac,
        () => {
          chain.releaseNodes();
          activeSoundSources.delete(chainID);
        },
        0,
        endWithRelease,
      );

    const soundHandle = await onTrigger(t, value, onEnded, cps);

    if (soundHandle) {
      sourceNode = soundHandle.node;
      activeSoundSources.set(chainID, new WeakRef(soundHandle)); // allow GC
      nodes.main = { ...nodes.main, ...soundHandle.nodes };
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

  chain.connect(sourceNode);

  FX = [...FX, value]; // run through the FX chain and then run through all FX outside of it as well
  for (let [idx, fx] of Object.entries(FX)) {
    const key = idx == FX.length - 1 ? 'main' : idx;
    nodes[key] ??= {};
    const fxNodes = nodes[key];
    let {
      gain = getDefaultValue('gain'),
      velocity = getDefaultValue('velocity'),
      shapevol = getDefaultValue('shapevol'),
      distorttype = getDefaultValue('distorttype'),
      distortvol = getDefaultValue('distortvol'),
      tremolodepth = getDefaultValue('tremolodepth'),
      phaserdepth = getDefaultValue('phaserdepth'),
      delay = getDefaultValue('delay'),
      delayfeedback = getDefaultValue('delayfeedback'),
      delaysync = getDefaultValue('delaysync'),
      delaytime,
      i = getDefaultValue('i'),
    } = fx;
    gain = applyGainCurve(nanFallback(gain, 1));
    shapevol = applyGainCurve(shapevol);
    distortvol = applyGainCurve(distortvol);
    velocity = applyGainCurve(velocity);
    tremolodepth = applyGainCurve(tremolodepth);
    gain *= velocity; // velocity currently only multiplies with gain. it might do other things in the future
    delaytime = delaytime ?? cycleToSeconds(delaysync, cps);

    // Kabelsalat
    if (fx.workletSrc !== undefined) {
      const workletNode = getWorklet(ac, 'generic-processor', {}, { outputChannelCount: [2] });
      chain.connect(workletNode);
      const workletSrc = fx.workletSrc
        .replace(/\bpat\[(\d+)\]/g, (_, i) => fx.workletInputs[i])
        .replaceAll('sFreq', getFrequencyFromValue(value))
        .replaceAll('sGate', `cc('strudel-gate-${chainID}')`);
      /* global compileKabel */
      const { src, ugens, registers } = compileKabel(workletSrc);
      workletNode.port.postMessage({ src, schema: { ugens, registers }, start: t, gateEnd: end, end: endWithRelease });
    }

    if (fx.stretch !== undefined) {
      const phaseVocoder = getWorklet(ac, 'phase-vocoder-processor', { pitchFactor: fx.stretch });
      chain.connect(phaseVocoder);
      fxNodes['stretch'] = [phaseVocoder];
    }

    if (fx.transient !== undefined) {
      const transProcessor = getWorklet(
        ac,
        'transient-processor',
        {},
        {
          processorOptions: {
            attack: fx.transient,
            sustain: fx.transsustain,
            begin: t,
            end: endWithRelease,
          },
        },
      );
      chain.connect(transProcessor);
      fxNodes['transient'] = transProcessor;
    }

    // gain stage
    const initialGain = gainNode(gain);
    fxNodes['gain'] = [initialGain];
    chain.connect(initialGain);

    // filter
    const ftype = getFilterType(value.ftype);

    const filt = (params) => createFilter(ac, t, end, params, cps, cycle);
    if (fx.cutoff !== undefined) {
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
      const lpParams = pickAndRename(fx, lpMap);
      lpParams.type = 'lowpass';
      const { filter: lpf1, lfo: lfo1 } = filt(lpParams);
      fxNodes['lpf'] = [lpf1];
      fxNodes['lpf_lfo'] = [lfo1];
      chain.connect(lpf1);
      lfo1 && chain.audioNodes.push(lfo1);
      if (ftype === '24db') {
        const { filter: lpf2, lfo: lfo2 } = filt(lpParams);
        fxNodes['lpf'].push(lpf2);
        fxNodes['lpf_lfo'].push(lfo2);
        chain.connect(lpf2);
        lfo2 && chain.audioNodes.push(lfo2);
      }
    }

    if (fx.hcutoff !== undefined) {
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
      const hpParams = pickAndRename(fx, hpMap);
      hpParams.type = 'highpass';
      const { filter: hpf1, lfo: lfo1 } = filt(hpParams);
      fxNodes['hpf'] = [hpf1];
      fxNodes['hpf_lfo'] = [lfo1];
      lfo1 && chain.audioNodes.push(lfo1);
      chain.connect(hpf1);
      if (ftype === '24db') {
        const { filter: hpf2, lfo: lfo2 } = filt(hpParams);
        fxNodes['hpf'].push(hpf2);
        fxNodes['hpf_lfo'].push(lfo2);
        chain.connect(hpf2);
        lfo2 && chain.audioNodes.push(lfo2);
      }
    }

    if (fx.bandf !== undefined) {
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
      const bpParams = pickAndRename(fx, bpMap);
      bpParams.type = 'bandpass';
      const { filter: bpf1, lfo: lfo1 } = filt(bpParams);
      fxNodes['bpf'] = [bpf1];
      fxNodes['bpf_lfo'] = [lfo1];
      chain.connect(bpf1);
      lfo1 && chain.audioNodes.push(lfo1);
      if (ftype === '24db') {
        const { filter: bpf2, lfo: lfo2 } = filt(bpParams);
        fxNodes['bpf'].push(bpf2);
        fxNodes['bpf_lfo'].push(lfo2);
        chain.connect(bpf2);
        lfo2 && chain.audioNodes.push(lfo2);
      }
    }

    if (fx.vowel !== undefined) {
      const vowelNode = ac.createVowelFilter(fx.vowel);
      fxNodes['vowel'] = vowelNode.filters;
      chain.connect(vowelNode);
    }

    // effects
    if (fx.coarse !== undefined) {
      const coarseNode = getWorklet(ac, 'coarse-processor', { coarse: fx.coarse });
      fxNodes['coarse'] = [coarseNode];
      chain.connect(coarseNode);
    }
    if (fx.crush !== undefined) {
      const crushNode = getWorklet(ac, 'crush-processor', { crush: fx.crush });
      fxNodes['crush'] = [crushNode];
      chain.connect(crushNode);
    }
    if (fx.shape !== undefined) {
      const shapeNode = getWorklet(ac, 'shape-processor', { shape: fx.shape, postgain: shapevol });
      fxNodes['shape'] = [shapeNode];
      chain.connect(shapeNode);
    }
    if (fx.distort !== undefined) {
      const distortNode = getDistortion(fx.distort, distortvol, distorttype);
      fxNodes['distort'] = [distortNode];
      chain.connect(distortNode);
    }

    let tremolo = fx.tremolo;
    if (fx.tremolosync != null) {
      tremolo = cps * fx.tremolosync;
    }

    if (tremolo !== undefined) {
      // Allow clipping of modulator for more dynamic possiblities, and to prevent speaker overload
      // EX:  a triangle waveform will clip like this /-\ when the depth is above 1
      const gain = Math.max(1 - tremolodepth, 0);
      const amGain = new GainNode(ac, { gain });

      const time = cycle / cps;
      const lfo = getLfo(ac, {
        skew: fx.tremoloskew ?? (fx.tremoloshape != null ? 0.5 : 1),
        frequency: tremolo,
        depth: tremolodepth,
        time,
        dcoffset: 0,
        shape: fx.tremoloshape,
        phaseoffset: fx.tremolophase,
        min: 0,
        max: 1,
        curve: 1.5,
        begin: t,
        end: endWithRelease,
      });
      fxNodes['tremolo'] = [lfo];
      fxNodes['tremolo_gain'] = [amGain];
      lfo.connect(amGain.gain);
      chain.audioNodes.push(lfo);
      chain.connect(amGain);
    }

    if (fx.compressor !== undefined) {
      const compressorNode = getCompressor(
        ac,
        fx.compressor,
        fx.compressorRatio,
        fx.compressorKnee,
        fx.compressorAttack,
        fx.compressorRelease,
      );
      fxNodes['compressor'] = [compressorNode];
      chain.connect(compressorNode);
    }

    // panning
    if (fx.pan !== undefined) {
      const panner = ac.createStereoPanner();
      fxNodes['pan'] = [panner];
      panner.pan.value = 2 * fx.pan - 1;
      chain.connect(panner);
    }
    // phaser
    if (fx.phaserrate !== undefined && phaserdepth > 0) {
      const { filterChain, lfo } = getPhaser(
        t,
        endWithRelease,
        fx.phaserrate,
        phaserdepth,
        fx.phasercenter,
        fx.phasersweep,
      );
      fxNodes['phaser'] = [...filterChain];
      fxNodes['phaser_lfo'] = [lfo];
      filterChain.forEach((f) => chain.connect(f));
      chain.audioNodes.push(lfo);
    }
    // delay
    if (key !== 'main' && delay > 0 && delaytime > 0 && delayfeedback > 0) {
      const dry = gainNode(1);
      delayfeedback = clamp(delayfeedback, 0, 0.98);
      const delayNode = ac.createFeedbackDelay(1, delaytime, delayfeedback);
      const wetDelay = gainNode(delay);
      const dryDelay = gainNode(fx.dry ?? 1);
      const sum = new GainNode(ac, { gain: 1, channelCount: 2, channelCountMode: 'explicit' });
      chain
        .connect(dry)
        .connect(dryDelay, delayNode)
        .connectOne(1, wetDelay) // connect delayNode -> wetDelay
        .connect(sum);
      chain.audioNodes.push(delayNode.feedbackGain, delayNode.delayGain);
      fxNodes['delay'] = [delayNode];
      fxNodes['delay_mix'] = [wetDelay];
    }
    // reverb
    if (key !== 'main' && fx.room > 0) {
      let roomIR;
      if (fx.ir !== undefined) {
        let url;
        let sample = getSound(fx.ir);
        if (Array.isArray(sample)) {
          url = sample.data.samples[fx.i % sample.data.samples.length];
        } else if (typeof sample === 'object') {
          url = Object.values(sample.data.samples).flat()[i % Object.values(sample.data.samples).length];
        }
        roomIR = await loadBuffer(url, ac, fx.ir, 0);
      }
      const dry = gainNode(1);
      const reverbNode = ac.createReverb(
        fx.roomsize,
        fx.roomfade,
        fx.roomlp,
        fx.roomdim,
        roomIR,
        fx.irspeed,
        fx.irbegin,
      );
      const wetReverb = gainNode(fx.room);
      const dryReverb = gainNode(fx.dry ?? 1);
      const sum = new GainNode(ac, { gain: 1, channelCount: 2, channelCountMode: 'explicit' });
      chain
        .connect(dry)
        .connect(dryReverb, reverbNode)
        .connectOne(1, wetReverb) // connect reverbNode -> wetReverb
        .connect(sum);
      fxNodes['room'] = [reverbNode];
      fxNodes['room_mix'] = [wetReverb];
    }
  }

  if (FXrelease !== undefined && FXrelease > release) {
    const releaseNode = gainNode(1);
    releaseNode.gain.setValueAtTime(1, end + release);
    releaseNode.gain.linearRampToValueAtTime(0, endWithRelease);
    chain.connect(releaseNode);
  }

  // last gain
  const post = new GainNode(ac, { gain: postgain });
  nodes.main['post'] = [post];
  chain.connect(post);

  // delay
  if (delay > 0 && delaytime > 0 && delayfeedback > 0) {
    const delayNode = orbitBus.getDelay(delaytime, delayfeedback, t);
    nodes.main['delay'] = [delayNode];
    const delaySend = orbitBus.sendDelay(post, delay);
    nodes.main['delay_mix'] = [delaySend];
    chain.audioNodes.push(delaySend);
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
    const roomNode = orbitBus.getReverb(roomsize, roomfade, roomlp, roomdim, roomIR, irspeed, irbegin);
    nodes.main['room'] = [roomNode];
    const reverbSend = orbitBus.sendReverb(post, room);
    nodes.main['room_mix'] = [reverbSend];
    chain.audioNodes.push(reverbSend);
  }
  if (bus != null) {
    const busNode = audioController.getBus(bus);
    const busSend = effectSend(post, busNode, busgain);
    chain.audioNodes.push(busSend);
  }

  if (djf != null) {
    const djfNode = orbitBus.getDjf(djf, t);
    nodes.main['djf'] = [djfNode];
  }

  // analyser
  if (analyze && !(ac instanceof OfflineAudioContext)) {
    const analyserNode = getAnalyserById(analyze, 2 ** (fft + 5));
    const analyserSend = effectSend(post, analyserNode, 1);
    chain.audioNodes.push(analyserSend);
  }
  if (dry != null) {
    dry = applyGainCurve(dry);
    const dryGain = new GainNode(ac, { gain: dry });
    chain.connect(dryGain);
    orbitBus.connectToOutput(dryGain);
  } else {
    orbitBus.connectToOutput(post);
  }

  // finally, now that `nodes` is populated, set up modulators
  FX.forEach((fx, idx) => {
    const key = idx === FX.length - 1 ? 'main' : idx;
    if (fx.lfo) {
      for (const id of fx.lfo.__ids) {
        const params = fx.lfo[id];
        params.fxi ??= key;
        const lfo = connectLFO(
          id,
          {
            ...params,
            cps,
            cycle,
            begin: t,
            end: endWithRelease,
          },
          nodes,
        );
        lfo && chain.audioNodes.push(lfo);
      }
    }
    if (fx.env) {
      for (const id of fx.env.__ids) {
        const params = fx.env[id];
        params.fxi ??= key;
        const env = connectEnvelope(
          id,
          {
            ...params,
            begin: t,
            end: endWithRelease,
          },
          nodes,
        );
        env && chain.audioNodes.push(env);
      }
    }
    if (fx.bmod) {
      for (const id of fx.bmod.__ids) {
        const params = fx.bmod[id];
        params.fxi ??= key;
        const { toCleanup } = connectBusModulator({ ...params, begin: t, end: endWithRelease }, nodes, controller);
        chain.audioNodes.push(...toCleanup);
      }
    }
  });
};

export const superdoughTrigger = (t, hap, ct, cps) => {
  superdough(hap, t - ct, hap.duration / cps, cps);
};
