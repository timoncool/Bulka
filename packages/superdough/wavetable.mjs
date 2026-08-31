import { getAudioContext, registerSound } from './index.mjs';
import { getBaseURL, getCommonSampleInfo } from './util.mjs';
import {
  applyFM,
  applyParameterModulators,
  getADSRValues,
  getFrequencyFromValue,
  getParamADSR,
  getPitchEnvelope,
  getVibratoOscillator,
  webAudioTimeout,
  releaseAudioNode,
} from './helpers.mjs';
import { getNodeFromPool, releaseNodeToPool } from './nodePools.mjs';
import { logger } from './logger.mjs';

export const Warpmode = Object.freeze({
  NONE: 0,
  ASYM: 1,
  MIRROR: 2,
  BENDP: 3,
  BENDM: 4,
  BENDMP: 5,
  SYNC: 6,
  QUANT: 7,
  FOLD: 8,
  PWM: 9,
  ORBIT: 10,
  SPIN: 11,
  CHAOS: 12,
  PRIMES: 13,
  BINARY: 14,
  BROWNIAN: 15,
  RECIPROCAL: 16,
  WORMHOLE: 17,
  LOGISTIC: 18,
  SIGMOID: 19,
  FRACTAL: 20,
  FLIP: 21,
});

const seenKeys = new Set();

export function resetSeenKeys() {
  seenKeys.clear();
}

async function getPayload(url, label, frameLen = 2048) {
  const key = `${url},${frameLen}`;
  if (!seenKeys.has(key)) {
    const buf = await loadBuffer(url, label);
    const ch0 = buf.getChannelData(0);
    const total = ch0.length;
    const numFrames = Math.max(1, Math.floor(total / frameLen));
    const frames = new Array(numFrames);
    for (let i = 0; i < numFrames; i++) {
      const start = i * frameLen;
      frames[i] = ch0.subarray(start, start + frameLen);
    }
    seenKeys.add(key);
    return { frames, frameLen, numFrames, key };
  }
  return { frameLen, key }; // worklet will use the cached version
}

function humanFileSize(bytes, si) {
  var thresh = si ? 1000 : 1024;
  if (bytes < thresh) return bytes + ' B';
  var units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (bytes >= thresh);
  return bytes.toFixed(1) + ' ' + units[u];
}

// Extract the sample rate of a .wav file
function parseWavSampleRate(arrBuf) {
  const dv = new DataView(arrBuf);
  // Header is "RIFF<chunk size (4 bytes)>WAVE", so 12 bytes
  let p = 12;
  // Look through chunks for the format header
  // (they will always have an 8 byte header (id and size) followed by a payload)
  while (p + 8 <= dv.byteLength) {
    // Parse id
    const id = String.fromCharCode(dv.getUint8(p), dv.getUint8(p + 1), dv.getUint8(p + 2), dv.getUint8(p + 3));
    // Parse chunk size
    const size = dv.getUint32(p + 4, true);
    if (id === 'fmt ') {
      // The format chunk contains the sample rate after
      // 8 bytes of header, 2 bytes of format tag, 2 bytes of num channels
      // (for a total of 12)
      return dv.getUint32(p + 12, true);
    }
    // Advance to next chunk
    p += 8 + size + (size & 1);
  }
  return null;
}

async function decodeAtNativeRate(arr) {
  const sr = parseWavSampleRate(arr) || 44100;
  const tempAC = new OfflineAudioContext(1, 1, sr);
  return await tempAC.decodeAudioData(arr);
}

const loadCache = {};
const loadBuffer = (url, label) => {
  url = url.replace('#', '%23');
  if (!loadCache[url]) {
    logger(`[wavetable] load table ${label}..`, 'load-table', { url });
    const timestamp = Date.now();
    loadCache[url] = fetch(url)
      .then((res) => res.arrayBuffer())
      .then(async (res) => {
        const took = Date.now() - timestamp;
        const size = humanFileSize(res.byteLength);
        logger(`[wavetable] load table ${label}... done! loaded ${size} in ${took}ms`, 'loaded-table', { url });
        const decoded = await decodeAtNativeRate(res);
        return decoded;
      });
  }
  return loadCache[url];
};

function githubPath(base, subpath = '') {
  if (!base.startsWith('github:')) {
    throw new Error('expected "github:" at the start of pseudoUrl');
  }
  let [_, path] = base.split('github:');
  path = path.endsWith('/') ? path.slice(0, -1) : path;
  if (path.split('/').length === 2) {
    // assume main as default branch if none set
    path += '/main';
  }
  return `https://raw.githubusercontent.com/${path}/${subpath}`;
}

const _processTables = (json, baseUrl, frameLen, options = {}) => {
  baseUrl = json._base || baseUrl;
  return Object.entries(json).forEach(([key, tables]) => {
    if (key === '_base') return false;
    if (typeof tables === 'string') {
      tables = [tables];
    }
    if (typeof tables !== 'object') {
      throw new Error('wrong json format for ' + key);
    }
    let resolvedUrl = baseUrl;
    if (resolvedUrl.startsWith('github:')) {
      resolvedUrl = githubPath(resolvedUrl, '');
    }
    tables = tables
      .map((t) => resolvedUrl + t)
      .filter((t) => {
        if (!t.toLowerCase().endsWith('.wav')) {
          logger(`[wavetable] skipping ${t} -- wavetables must be ".wav" format`);
          return false;
        }
        return true;
      });
    if (tables.length) {
      registerWaveTable(key, tables, { baseUrl, frameLen });
    }
  });
};

export function registerWaveTable(key, tables, params) {
  registerSound(
    key,
    (t, hapValue, onended, cps) => {
      return onTriggerSynth(t, hapValue, onended, tables, cps, params?.frameLen ?? 2048);
    },
    {
      type: 'wavetable',
      tables,
      ...params,
    },
  );
}

/**
 * Loads a collection of wavetables to use with `s`
 *
 * @name tables
 * @tags wavetable
 */
export const tables = async (url, frameLen, json, options = {}) => {
  if (json !== undefined) return _processTables(json, url, frameLen);
  if (url.startsWith('github:')) {
    url = githubPath(url, 'strudel.json');
  }
  if (url.startsWith('local:')) {
    url = `http://localhost:5432`;
  }
  const base = getBaseURL(url);
  if (typeof fetch !== 'function') {
    // not a browser
    return;
  }
  if (typeof fetch === 'undefined') {
    // skip fetch when in node / testing
    return;
  }
  return fetch(url)
    .then((res) => res.json())
    .then((json) => _processTables(json, base, frameLen, options))
    .catch((error) => {
      console.error(error);
      throw new Error(`error loading "${url}"`);
    });
};

export async function onTriggerSynth(t, value, onended, tables, cps, frameLen) {
  const { s, n = 0, duration, clip } = value;
  const ac = getAudioContext();
  const [attack, decay, sustain, release] = getADSRValues([value.attack, value.decay, value.sustain, value.release]);
  let { warpmode } = value;
  if (typeof warpmode === 'string') {
    warpmode = Warpmode[warpmode.toUpperCase()] ?? Warpmode.NONE;
  }
  const frequency = getFrequencyFromValue(value);
  const { url, label } = getCommonSampleInfo(value, tables);
  const payload = await getPayload(url, label, frameLen);
  let holdEnd = t + duration;
  if (clip !== undefined) {
    holdEnd = Math.min(t + clip * duration, holdEnd);
  }
  const endWithRelease = holdEnd + release;
  const envEnd = endWithRelease + 0.01;
  const params = {
    begin: t,
    end: envEnd,
    frequency,
    freqspread: value.detune,
    position: value.wt,
    warp: value.warp,
    warpMode: warpmode,
    voices: Math.max(value.unison ?? 1, 1),
    panspread: value.spread,
    phaserand: (value.wtphaserand ?? value.unison > 1) ? 1 : 0,
  };
  const factory = () => new AudioWorkletNode(ac, 'wavetable-oscillator-processor', { outputChannelCount: [2] });
  const source = getNodeFromPool('wavetable', factory);
  Object.entries(params).forEach(([key, value]) => {
    const param = source.parameters.get(key);
    const target = value !== undefined ? value : param.defaultValue;
    param.value = target;
  });
  source.port.postMessage({ type: 'initialize', payload });
  if (ac.currentTime > t) {
    logger(`[wavetable] still loading sound "${s}:${n}"`, 'highlight');
    return;
  }
  const posADSRParams = [value.wtattack, value.wtdecay, value.wtsustain, value.wtrelease];
  const warpADSRParams = [value.warpattack, value.warpdecay, value.warpsustain, value.warprelease];
  const wtParams = source.parameters;
  const positionParam = wtParams.get('position');
  const warpParam = wtParams.get('warp');

  let wtrate = value.wtrate;
  if (value.wtsync != null) {
    wtrate = cps * value.wtsync;
  }

  const wtPosModulators = applyParameterModulators(
    ac,
    positionParam,
    t,
    endWithRelease,
    {
      offset: value.wt,
      amount: value.wtenv,
      defaultAmount: 0.5,
      shape: 'linear',
      values: posADSRParams,
      holdEnd,
      defaultValues: [0, 0.5, 0, 0.1],
    },
    {
      frequency: wtrate,
      depth: value.wtdepth,
      defaultDepth: 0.5,
      shape: value.wtshape,
      skew: value.wtskew,
      dcoffset: value.wtdc ?? 0,
    },
  );

  let warprate = value.warprate;
  if (value.warpsync != null) {
    warprate = warprate = cps * value.warpsync;
  }
  const wtWarpModulators = applyParameterModulators(
    ac,
    warpParam,
    t,
    endWithRelease,
    {
      offset: value.warp,
      amount: value.warpenv,
      defaultAmount: 0.5,
      shape: 'linear',
      values: warpADSRParams,
      holdEnd,
      defaultValues: [0, 0.5, 0, 0.1],
    },
    {
      frequency: warprate,
      depth: value.warpdepth,
      defaultDepth: 0.5,
      shape: value.warpshape,
      skew: value.warpskew,
      dcoffset: value.warpdc ?? 0,
    },
  );
  const vibratoHandle = getVibratoOscillator(source.parameters.get('detune'), value, t);
  const fmHandle = applyFM(source.parameters.get('frequency'), value, t);
  const envGain = ac.createGain();
  const node = source.connect(envGain);
  getParamADSR(node.gain, attack, decay, sustain, release, 0, 0.3, t, holdEnd, 'linear');
  getPitchEnvelope(source.parameters.get('detune'), value, t, holdEnd);
  const handle = {
    node,
    nodes: {
      source: [source],
      wt_lfo: [wtPosModulators],
      warp_lfo: [wtWarpModulators],
      ...fmHandle?.nodes,
      ...vibratoHandle?.nodes,
    },
  };
  const timeoutNode = webAudioTimeout(
    ac,
    () => {
      releaseNodeToPool(source);
      vibratoHandle?.stop();
      fmHandle?.stop();
      releaseAudioNode(wtPosModulators);
      releaseAudioNode(wtWarpModulators);
      onended();
    },
    t,
    envEnd,
  );
  handle.stop = (time) => {
    timeoutNode.stop(time);
  };
  return handle;
}
