import { getBaseURL, getCommonSampleInfo } from './util.mjs';
import { registerSound, registerWaveTable, soundMap } from './index.mjs';
import { getAudioContext } from './audioContext.mjs';
import {
  getADSRValues,
  getParamADSR,
  getPitchEnvelope,
  getVibratoOscillator,
  onceEnded,
  releaseAudioNode,
} from './helpers.mjs';
import { logger } from './logger.mjs';

const bufferCache = {}; // string: Promise<ArrayBuffer>
const loadCache = {}; // string: Promise<ArrayBuffer>

export const getCachedBuffer = (url) => bufferCache[url];

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

/**
 * Returns the duration, in seconds, of the given sample.
 * Has optional param `n` (for instance, the `2` in `s("casio:2")`)
 *
 * Note: `must` be called with await, otherwise you'll get a pending Promise object.
 *
 * @name getDuration,getDur
 * @tag samples
 * @param {string} sampleName
 * @param {number} (optional) n
 *
 * @example
 * // Set a patterns cycle length to exactly the length of the sample
 * samples('github:tidalcycles/dirt-samples')
 * let k = await getDuration('sax')
 * s("sax").cps(1/k)
 */
export const getDuration = (s, n = 0) => {
  return getSampleBufferSource({ s, n }, soundMap.get(s)[s].data.samples).then((x) => x.bufferDuration);
};

export const getDur = getDuration;

export function getSampleInfo(hapValue, bank) {
  const { speed = 1.0 } = hapValue;
  const { transpose, url, index, midi, label } = getCommonSampleInfo(hapValue, bank);
  let playbackRate = Math.abs(speed) * Math.pow(2, transpose / 12);
  return { transpose, url, index, midi, label, playbackRate };
}

// takes hapValue and returns buffer + playbackRate.
export const getSampleBuffer = async (hapValue, bank, resolveUrl) => {
  let { url: sampleUrl, label, playbackRate } = getSampleInfo(hapValue, bank);
  if (resolveUrl) {
    sampleUrl = await resolveUrl(sampleUrl);
  }
  const ac = getAudioContext();
  const buffer = await loadBuffer(sampleUrl, ac, label);

  if (hapValue.unit === 'c') {
    playbackRate = playbackRate * buffer.duration;
  }
  return { buffer, playbackRate };
};

// creates playback ready AudioBufferSourceNode from hapValue
export const getSampleBufferSource = async (hapValue, bank, resolveUrl) => {
  let { buffer, playbackRate } = await getSampleBuffer(hapValue, bank, resolveUrl);
  if (hapValue.speed < 0) {
    // should this be cached?
    buffer = reverseBuffer(buffer);
  }
  const ac = getAudioContext();
  const bufferSource = ac.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.playbackRate.value = playbackRate;

  const { loopBegin = 0, loopEnd = 1, begin = 0, end = 1 } = hapValue;
  const bufferDuration = bufferSource.buffer.duration;

  // The computation of the offset into the sound is performed using the sound buffer's natural duration,
  // rather than the playback duration, so that even if the sound is playing at twice its normal speed,
  // the midway point through a 10-second audio buffer is still 5.
  const offset = begin * bufferDuration;

  const loop = hapValue.loop;
  if (loop) {
    bufferSource.loop = true;
    bufferSource.loopStart = loopBegin * bufferDuration;
    bufferSource.loopEnd = loopEnd * bufferDuration;
  }
  const playbackDuration = bufferDuration / bufferSource.playbackRate.value;
  const sliceDuration = (end - begin) * playbackDuration;
  return { bufferSource, offset, bufferDuration, playbackDuration, sliceDuration };
};

export const loadBuffer = (url, ac, s, n = 0) => {
  const label = s ? `sound "${s}:${n}"` : 'sample';
  url = url.replace('#', '%23');
  if (!loadCache[url]) {
    logger(`[sampler] load ${label}..`, 'load-sample', { url });
    const timestamp = Date.now();
    loadCache[url] = fetch(url)
      .then((res) => res.arrayBuffer())
      .then(async (res) => {
        const took = Date.now() - timestamp;
        const size = humanFileSize(res.byteLength);
        // const downSpeed = humanFileSize(res.byteLength / took);
        logger(`[sampler] load ${label}... done! loaded ${size} in ${took}ms`, 'loaded-sample', { url });
        const decoded = await ac.decodeAudioData(res);
        bufferCache[url] = decoded;
        return decoded;
      });
  }
  return loadCache[url];
};

export function reverseBuffer(buffer) {
  const ac = getAudioContext();
  const reversed = ac.createBuffer(buffer.numberOfChannels, buffer.length, ac.sampleRate);
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    reversed.copyToChannel(buffer.getChannelData(channel).slice().reverse(), channel, channel);
  }
  return reversed;
}

export const getLoadedBuffer = (url) => {
  return bufferCache[url];
};

function resolveSpecialPaths(base) {
  if (base.startsWith('bubo:')) {
    const [_, repo] = base.split(':');
    base = `github:Bubobubobubobubo/dough-${repo}`;
  }
  return base;
}

function githubPath(base, subpath = '') {
  if (!base.startsWith('github:')) {
    throw new Error('expected "github:" at the start of pseudoUrl');
  }
  let path = base.slice('github:'.length);
  path = path.endsWith('/') ? path.slice(0, -1) : path;

  let components = path.split('/');
  let user = components[0];
  let repo = components.length >= 2 ? components[1] : 'samples';
  let branch = components.length >= 3 ? components[2] : 'main';
  let other = components.slice(3);
  other.push(subpath ? subpath : '');
  other = other.join('/');

  return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${other}`;
}

export const processSampleMap = (sampleMap, fn, baseUrl = sampleMap._base || '') => {
  return Object.entries(sampleMap).forEach(([key, value]) => {
    if (typeof value === 'string') {
      value = [value];
    }
    if (typeof value !== 'object') {
      throw new Error('wrong sample map format for ' + key);
    }
    baseUrl = value._base || baseUrl;
    baseUrl = resolveSpecialPaths(baseUrl);
    if (baseUrl.startsWith('github:')) {
      baseUrl = githubPath(baseUrl, '');
    }
    const fullUrl = (v) => baseUrl + v;
    if (Array.isArray(value)) {
      //return [key, value.map(replaceUrl)];
      value = value.map(fullUrl);
    } else {
      // must be object
      value = Object.fromEntries(
        Object.entries(value).map(([note, samples]) => {
          return [note, (typeof samples === 'string' ? [samples] : samples).map(fullUrl)];
        }),
      );
    }
    fn(key, value);
  });
};

// allows adding a custom url prefix handler
// for example, it is used by the desktop app to load samples starting with '~/music'
let resourcePrefixHandlers = {};
export function registerSamplesPrefix(prefix, resolve) {
  resourcePrefixHandlers[prefix] = resolve;
}
// finds a prefix handler for the given url (if any)
function getSamplesPrefixHandler(url) {
  const handler = Object.entries(resourcePrefixHandlers).find(([key]) => url.startsWith(key));
  if (handler) {
    return handler[1];
  }
  return;
}

export async function fetchSampleMap(url) {
  // check if custom prefix handler
  const handler = getSamplesPrefixHandler(url);
  if (handler) {
    return handler(url);
  }
  url = resolveSpecialPaths(url);
  if (url.startsWith('github:')) {
    url = githubPath(url, 'strudel.json');
  }
  if (url.startsWith('local:')) {
    url = `http://localhost:5432`;
  }
  if (url.startsWith('shabda:')) {
    let [_, path] = url.split('shabda:');
    url = `https://shabda.ndre.gr/${path}.json?strudel=1`;
  }
  if (url.startsWith('shabda/speech')) {
    let [_, path] = url.split('shabda/speech');
    path = path.startsWith('/') ? path.substring(1) : path;
    let [params, words] = path.split(':');
    let gender = 'f';
    let language = 'en-GB';
    if (params) {
      [language, gender] = params.split('/');
    }
    url = `https://shabda.ndre.gr/speech/${words}.json?gender=${gender}&language=${language}&strudel=1'`;
  }
  if (typeof fetch !== 'function') {
    // not a browser
    return;
  }
  const base = getBaseURL(url);
  if (typeof fetch === 'undefined') {
    // skip fetch when in node / testing
    return;
  }
  const json = await fetch(url)
    .then((res) => res.json())
    .catch((error) => {
      console.error(error);
      throw new Error(`error loading "${url}"`);
    });
  return [json, json._base || base];
}

/**
 * Loads a collection of samples to use with `s`
 * @tags samples
 * @example
 * samples('github:tidalcycles/dirt-samples');
 * s("[bd ~]*2, [~ hh]*2, ~ sd")
 * @example
 * samples({
 *  bd: '808bd/BD0000.WAV',
 *  sd: '808sd/SD0010.WAV'
 *  }, 'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/');
 * s("[bd ~]*2, [~ hh]*2, ~ sd")
 */

export const samples = async (sampleMap, baseUrl = sampleMap._base || '', options = {}) => {
  if (typeof sampleMap === 'string') {
    const [json, base] = await fetchSampleMap(sampleMap);
    return samples(json, baseUrl || base, options);
  }
  const { prebake, tag } = options;

  processSampleMap(
    sampleMap,
    (key, bank) => {
      registerSampleSource(key, bank, { baseUrl, prebake, tag });
    },
    baseUrl,
  );
};

const cutGroups = [];

export async function onTriggerSample(t, value, onended, bank, resolveUrl) {
  let {
    s,
    nudge = 0, // TODO: is this in seconds?
    cut,
    loop,
    clip = undefined, // if set, samples will be cut off when the hap ends
    n = 0,
    speed = 1, // sample playback speed
    duration,
  } = value;

  // load sample
  if (speed === 0) {
    // no playback
    return;
  }
  const ac = getAudioContext();

  // destructure adsr here, because the default should be different for synths and samples
  let [attack, decay, sustain, release] = getADSRValues([value.attack, value.decay, value.sustain, value.release]);

  const { bufferSource, sliceDuration, offset } = await getSampleBufferSource(value, bank, resolveUrl);

  if (!bufferSource) {
    logger(`[sampler] could not load "${s}:${n}"`, 'error');
    return;
  }

  // async stuff above took too long?
  if (ac.currentTime > t) {
    logger(`[sampler] loading sound "${s}:${n}" took too long`, 'highlight');
    // AudioBufferSourceNode will never be used. discard it
    releaseAudioNode(bufferSource);
    return;
  }

  // vibrato
  const vibratoHandle = getVibratoOscillator(bufferSource.detune, value, t);

  const time = t + nudge;
  bufferSource.start(time, offset);

  const envGain = ac.createGain();
  const node = bufferSource.connect(envGain);

  // if none of these controls is set, the duration of the sound will be set to the duration of the sample slice
  if (clip == null && loop == null && value.release == null) {
    duration = sliceDuration;
  }
  let holdEnd = t + duration;

  getParamADSR(node.gain, attack, decay, sustain, release, 0, 1, t, holdEnd, 'linear');

  // pitch envelope
  getPitchEnvelope(bufferSource.detune, value, t, holdEnd);

  const out = ac.createGain(); // we need a separate gain for the cutgroups because firefox...
  node.connect(out);
  onceEnded(bufferSource, function () {
    releaseAudioNode(bufferSource);
    vibratoHandle?.stop();
    releaseAudioNode(node);
    releaseAudioNode(out);
    onended();
  });
  let envEnd = holdEnd + release + 0.01;
  bufferSource.stop(envEnd);
  const stop = (endTime) => {
    bufferSource.stop(endTime);
  };
  const handle = { node: out, nodes: { source: [bufferSource], ...vibratoHandle?.nodes }, stop };

  // cut groups
  if (cut !== undefined) {
    const prev = cutGroups[cut];
    if (prev) {
      prev.node.gain.setValueAtTime(1, time);
      prev.node.gain.linearRampToValueAtTime(0, time + 0.01);
    }
    cutGroups[cut] = handle;
  }

  return handle;
}

function registerSample(key, bank, params) {
  registerSound(key, (t, hapValue, onended) => onTriggerSample(t, hapValue, onended, bank), {
    type: 'sample',
    samples: bank,
    ...params,
  });
}

export function registerSampleSource(key, bank, params) {
  const isWavetable = key.startsWith('wt_');
  if (isWavetable) {
    registerWaveTable(key, bank, params);
  } else {
    registerSample(key, bank, params);
  }
}
