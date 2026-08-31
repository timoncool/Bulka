// coarse, crush, and shape processors adapted from dktr0's webdirt: https://github.com/dktr0/WebDirt/blob/5ce3d698362c54d6e1b68acc47eb2955ac62c793/dist/AudioWorklets.js
// LICENSE GNU General Public License v3.0 see https://github.com/dktr0/WebDirt/blob/main/LICENSE
// TOFIX: THIS FILE DOES NOT SUPPORT IMPORTS ON DEPOLYMENT

import OLAProcessor from './ola-processor';
import FFT from './fft.js';
import { getDistortionAlgorithm } from './helpers.mjs';
import * as ugens from '@kabelsalat/lib/src/ugens.js';

const UGENS = new Map(Object.entries(ugens));

const blockSize = 128;
const PI = Math.PI;
const TWO_PI = 2 * PI;
const INVSR = 1 / sampleRate;

const timeToCoeff = (t) => 1 - Math.exp(-INVSR / t);
const dbToLin = (db) => Math.pow(10, db / 20);

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const mod = (n, m) => ((n % m) + m) % m;
const lerp = (a, b, n) => n * (b - a) + a;
const pv = (arr, n) => arr[n] ?? arr[0];
const frac = (x) => x - Math.floor(x);

// Fast integer ops for non-negative values
const ffloor = (x) => x | 0;
const fround = (x) => ffloor(x + 0.5);
const fceil = (x) => ffloor(x + 1);
const ffrac = (x) => x - ffloor(x);

const fast_tanh = (x) => {
  const x2 = x ** 2;
  return (x * (27.0 + x2)) / (27.0 + 9.0 * x2);
};

// Optimized per-voice detuner which precomputes constants
const getDetuner = (unison, detune) => {
  if (unison < 2) {
    return (_voiceIdx) => 0;
  }
  const scale = detune / (unison - 1);
  const center = detune * 0.5;
  return (voiceIdx) => voiceIdx * scale - center;
};

const applySemitoneDetuneToFrequency = (frequency, detune) => {
  return frequency * Math.pow(2, detune / 12);
};

// Smooth waveshape near discontinuities to remove frequencies above Nyquist and prevent aliasing
// referenced from https://www.kvraudio.com/forum/viewtopic.php?t=375517
function polyBlep(phase, dt) {
  dt = Math.min(dt, 1 - dt);
  const invdt = 1 / dt;
  // Start of cycle
  if (phase < dt) {
    phase *= invdt;
    return 2 * phase - phase ** 2 - 1;
  }
  // End of cycle
  else if (phase > 1 - dt) {
    phase = (phase - 1) * invdt;
    return phase ** 2 + 2 * phase + 1;
  }
  // 0 otherwise
  else {
    return 0;
  }
}
// The order is important for dough integration
const waveshapes = {
  tri(phase, skew = 0.5) {
    const x = 1 - skew;
    if (phase >= skew) {
      return 1 / x - phase / x;
    }
    return phase / skew;
  },
  sine(phase) {
    return Math.sin(TWO_PI * phase) * 0.5 + 0.5;
  },
  ramp(phase) {
    return phase;
  },
  saw(phase) {
    return 1 - phase;
  },

  square(phase, skew = 0.5) {
    if (phase >= skew) {
      return 0;
    }
    return 1;
  },
  custom(phase, values = [0, 1]) {
    const numParts = values.length - 1;
    const currPart = Math.floor(phase * numParts);

    const partLength = 1 / numParts;
    const startVal = clamp(values[currPart], 0, 1);
    const endVal = clamp(values[currPart + 1], 0, 1);
    const y2 = endVal;
    const y1 = startVal;
    const x1 = 0;
    const x2 = partLength;
    const slope = (y2 - y1) / (x2 - x1);
    return slope * (phase - partLength * currPart) + startVal;
  },
  sawblep(phase, dt) {
    const v = 2 * phase - 1;
    return v - polyBlep(phase, dt);
  },
};

const waveShapeNames = Object.keys(waveshapes);
class LFOProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'begin', defaultValue: 0 },
      { name: 'time', defaultValue: 0 },
      { name: 'end', defaultValue: 0 },
      { name: 'frequency', defaultValue: 0.5 },
      { name: 'skew', defaultValue: 0.5 },
      { name: 'depth', defaultValue: 1 },
      { name: 'phaseoffset', defaultValue: 0 },
      { name: 'shape', defaultValue: 0 },
      { name: 'curve', defaultValue: 1 },
      { name: 'dcoffset', defaultValue: 0 },
      { name: 'min', defaultValue: -1e9 },
      { name: 'max', defaultValue: 1e9 },
    ];
  }

  constructor() {
    super();
    this.phase;
  }

  incrementPhase(dt) {
    this.phase += dt;
    if (this.phase > 1.0) {
      this.phase = this.phase - 1;
    }
  }

  process(_inputs, outputs, parameters) {
    const begin = parameters['begin'][0];
    const end = parameters['end'][0];
    if (currentTime >= end) {
      return false;
    }
    if (currentTime <= begin) {
      return true;
    }

    const output = outputs[0];
    const frequency = parameters['frequency'][0];

    const time = parameters['time'][0];
    const depth = parameters['depth'][0];
    const skew = parameters['skew'][0];
    const phaseoffset = parameters['phaseoffset'][0];

    const curve = parameters['curve'][0];

    const dcoffset = parameters['dcoffset'][0];

    const min = parameters['min'][0];
    const max = parameters['max'][0];
    const shape = waveShapeNames[parameters['shape'][0]];

    const blockSize = output[0].length ?? 0;

    if (this.phase == null) {
      this.phase = ffrac(time * frequency + phaseoffset);
    }
    const dt = frequency * INVSR;
    for (let n = 0; n < blockSize; n++) {
      for (let i = 0; i < output.length; i++) {
        let modval = (waveshapes[shape](this.phase, skew) + dcoffset) * depth;
        modval = Math.pow(modval, curve);
        output[i][n] = clamp(modval, min, max);
      }
      this.incrementPhase(dt);
    }

    return true;
  }
}
registerProcessor('lfo-processor', LFOProcessor);

class CoarseProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'coarse', defaultValue: 1 }];
  }

  constructor() {
    super();
    this.started = false;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const hasInput = !(input[0] === undefined);
    if (this.started && !hasInput) {
      return false;
    }
    this.started = hasInput;

    let coarse = parameters.coarse[0] ?? 0;
    coarse = Math.max(1, coarse);
    for (let n = 0; n < blockSize; n++) {
      for (let i = 0; i < input.length; i++) {
        output[i][n] = n % coarse < 1 ? input[i][n] : output[i][n - 1];
      }
    }
    return true;
  }
}
registerProcessor('coarse-processor', CoarseProcessor);

class CrushProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'crush', defaultValue: 0 }];
  }

  constructor() {
    super();
    this.started = false;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const hasInput = !(input[0] === undefined);
    if (this.started && !hasInput) {
      return false;
    }
    this.started = hasInput;

    let crush = parameters.crush[0] ?? 8;
    crush = Math.max(1, crush);

    for (let n = 0; n < blockSize; n++) {
      for (let i = 0; i < input.length; i++) {
        const x = Math.pow(2, crush - 1);
        output[i][n] = Math.round(input[i][n] * x) / x;
      }
    }
    return true;
  }
}
registerProcessor('crush-processor', CrushProcessor);

class ShapeProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'shape', defaultValue: 0 },
      { name: 'postgain', defaultValue: 1 },
    ];
  }

  constructor() {
    super();
    this.started = false;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const hasInput = !(input[0] === undefined);
    if (this.started && !hasInput) {
      return false;
    }
    this.started = hasInput;

    let shape = parameters.shape[0];
    shape = shape < 1 ? shape : 1.0 - 4e-10;
    shape = (2.0 * shape) / (1.0 - shape);
    const postgain = Math.max(0.001, Math.min(1, parameters.postgain[0]));

    for (let n = 0; n < blockSize; n++) {
      for (let i = 0; i < input.length; i++) {
        output[i][n] = (((1 + shape) * input[i][n]) / (1 + shape * Math.abs(input[i][n]))) * postgain;
      }
    }
    return true;
  }
}
registerProcessor('shape-processor', ShapeProcessor);

class TwoPoleFilter {
  s0 = 0;
  s1 = 0;
  update(s, cutoff, resonance = 0) {
    // Out of bound values can produce NaNs
    resonance = clamp(resonance, 0, 1);
    cutoff = clamp(cutoff, 0, sampleRate / 2 - 1);
    const c = clamp(2 * Math.sin(cutoff * PI * INVSR), 0, 1.14);
    const r = Math.pow(0.5, 8 * resonance + 1);
    const mrc = 1 - r * c;
    this.s0 = mrc * this.s0 - c * this.s1 + c * s; // bpf
    this.s1 = mrc * this.s1 + c * this.s0; // lpf
    return this.s1; // return lpf by default
  }
}

class DJFProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'value', defaultValue: 0.5 }];
  }

  constructor() {
    super();
    this.filters = [new TwoPoleFilter(), new TwoPoleFilter()];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const hasInput = !(input[0] === undefined);
    this.started = hasInput;

    const value = clamp(parameters.value[0], 0, 1);
    let filterType = 'none';
    let cutoff;
    let v = 1;
    if (value > 0.51) {
      filterType = 'hipass';
      v = (value - 0.5) * 2;
    } else if (value < 0.49) {
      filterType = 'lopass';
      v = value * 2;
    }
    cutoff = Math.pow(v * 11, 4);

    for (let i = 0; i < input.length; i++) {
      for (let n = 0; n < blockSize; n++) {
        if (filterType == 'none') {
          output[i][n] = input[i][n];
        } else {
          this.filters[i].update(input[i][n], cutoff, 0.1);
          if (filterType === 'lopass') {
            output[i][n] = this.filters[i].s1;
          } else if (filterType === 'hipass') {
            output[i][n] = input[i][n] - this.filters[i].s1;
          } else {
            output[i][n] = input[i][n];
          }
        }
      }
    }
    return true;
  }
}
registerProcessor('djf-processor', DJFProcessor);

//adapted from https://github.com/TheBouteillacBear/webaudioworklet-wasm?tab=MIT-1-ov-file
class LadderProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'frequency', defaultValue: 500 },
      { name: 'q', defaultValue: 1 },
      { name: 'drive', defaultValue: 0.69 },
    ];
  }

  constructor() {
    super();
    this.started = false;
    this.p0 = [0, 0];
    this.p1 = [0, 0];
    this.p2 = [0, 0];
    this.p3 = [0, 0];
    this.p32 = [0, 0];
    this.p33 = [0, 0];
    this.p34 = [0, 0];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const hasInput = !(input[0] === undefined);
    if (this.started && !hasInput) {
      return false;
    }

    this.started = hasInput;

    const resonance = parameters.q[0];
    const drive = clamp(Math.exp(parameters.drive[0]), 0.1, 2000);

    let cutoff = parameters.frequency[0];
    cutoff = cutoff * TWO_PI * INVSR;
    cutoff = cutoff > 1 ? 1 : cutoff;

    const k = Math.min(8, resonance * 0.13);
    //               drive makeup  * resonance volume loss makeup
    let makeupgain = (1 / drive) * Math.min(1.75, 1 + k);

    for (let n = 0; n < blockSize; n++) {
      for (let i = 0; i < input.length; i++) {
        const out = this.p3[i] * 0.360891 + this.p32[i] * 0.41729 + this.p33[i] * 0.177896 + this.p34[i] * 0.0439725;

        this.p34[i] = this.p33[i];
        this.p33[i] = this.p32[i];
        this.p32[i] = this.p3[i];

        this.p0[i] += (fast_tanh(input[i][n] * drive - k * out) - fast_tanh(this.p0[i])) * cutoff;
        this.p1[i] += (fast_tanh(this.p0[i]) - fast_tanh(this.p1[i])) * cutoff;
        this.p2[i] += (fast_tanh(this.p1[i]) - fast_tanh(this.p2[i])) * cutoff;
        this.p3[i] += (fast_tanh(this.p2[i]) - fast_tanh(this.p3[i])) * cutoff;

        output[i][n] = out * makeupgain;
      }
    }
    return true;
  }
}
registerProcessor('ladder-processor', LadderProcessor);

class DistortProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'distort', defaultValue: 0 },
      { name: 'postgain', defaultValue: 1 },
    ];
  }

  constructor({ processorOptions }) {
    super();
    this.started = false;
    this.algorithm = getDistortionAlgorithm(processorOptions.algorithm);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const hasInput = !(input[0] === undefined);
    if (this.started && !hasInput) {
      return false;
    }
    this.started = hasInput;
    for (let n = 0; n < blockSize; n++) {
      const postgain = clamp(pv(parameters.postgain, n), 0.001, 1);
      const shape = Math.expm1(pv(parameters.distort, n));
      for (let ch = 0; ch < input.length; ch++) {
        const x = input[ch][n];
        output[ch][n] = postgain * this.algorithm(x, shape);
      }
    }
    return true;
  }
}
registerProcessor('distort-processor', DistortProcessor);

// SUPERSAW
class SuperSawOscillatorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === 'initialize') {
        this.initialize(payload);
      }
    };
    this.initialize();
  }
  initialize(_options) {
    this.phase = [];
  }
  static get parameterDescriptors() {
    return [
      {
        name: 'begin',
        defaultValue: -1,
        max: Number.POSITIVE_INFINITY,
        min: -1,
      },

      {
        name: 'end',
        defaultValue: -1,
        max: Number.POSITIVE_INFINITY,
        min: -1,
      },

      {
        name: 'frequency',
        defaultValue: 440,
        min: Number.EPSILON,
      },

      {
        name: 'panspread',
        defaultValue: 0.4,
        min: 0,
        max: 1,
      },
      {
        name: 'freqspread',
        defaultValue: 0.2,
        min: 0,
      },
      {
        name: 'detune',
        defaultValue: 0,
        min: 0,
      },

      {
        name: 'voices',
        defaultValue: 5,
        min: 1,
        automationRate: 'k-rate',
      },
    ];
  }
  process(_input, outputs, params) {
    const begin = params.begin[0];
    const end = params.end[0];
    const beginDefined = begin >= 0;
    const endDefined = end >= 0;
    // We give a 0.5s grace period (for node pooling) before termination
    const shouldTerminate = endDefined && currentTime >= end + 0.5;
    const ended = endDefined && currentTime >= end;
    const notStarted = currentTime <= begin;
    if (shouldTerminate) {
      return false;
    } else if (ended || notStarted || !beginDefined) {
      return true;
    }
    const output = outputs[0];
    const voices = params.voices[0]; // k-rate
    for (let i = 0; i < output[0].length; i++) {
      const detune = pv(params.detune, i);
      const freqspread = pv(params.freqspread, i);
      const panspread = pv(params.panspread, i) * 0.5 + 0.5;
      let gainL = Math.sqrt(1 - panspread);
      let gainR = Math.sqrt(panspread);
      let freq = pv(params.frequency, i);
      // Main detuning
      freq = applySemitoneDetuneToFrequency(freq, detune / 100);
      const detuner = getDetuner(voices, freqspread);
      for (let n = 0; n < voices; n++) {
        // Individual voice detuning
        const freqVoice = applySemitoneDetuneToFrequency(freq, detuner(n));
        // We must wrap this here because it is passed into sawblep below which
        // has domain [0, 1]
        const dt = frac(freqVoice * INVSR);
        this.phase[n] = this.phase[n] ?? Math.random();
        const v = waveshapes.sawblep(this.phase[n], dt);

        output[0][i] += v * gainL;
        output[1][i] += v * gainR;

        let pn = this.phase[n] + dt;
        if (pn >= 1.0) pn -= 1.0;
        this.phase[n] = pn;
        // invert right and left gain
        const tmp = gainL;
        gainL = gainR;
        gainR = tmp;
      }
    }
    return true;
  }
}

registerProcessor('supersaw-oscillator', SuperSawOscillatorProcessor);

// Phase Vocoder sourced from https://github.com/olvb/phaze/tree/master?tab=readme-ov-file
const BUFFERED_BLOCK_SIZE = 2048;

const hannCache = new Map();
function genHannWindow(length) {
  if (!hannCache.has(length)) {
    const win = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      win[i] = 0.5 * (1 - Math.cos((TWO_PI * i) / length));
    }
    hannCache.set(length, win);
  }
  return hannCache.get(length);
}

class PhaseVocoderProcessor extends OLAProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'pitchFactor',
        defaultValue: 1.0,
      },
    ];
  }

  constructor(options) {
    options.processorOptions = {
      blockSize: BUFFERED_BLOCK_SIZE,
    };
    super(options);
    this.timeCursor = 0;
    this.fftSize = this.blockSize;
    this.invfftSize = 1 / this.fftSize;
    this.hannWindow = genHannWindow(this.fftSize);
    // prepare FFT and pre-allocate buffers
    this.fft = new FFT(this.fftSize);
    this.freqComplexBuffer = this.fft.createComplexArray();
    this.freqComplexBufferShifted = this.fft.createComplexArray();
    this.timeComplexBuffer = this.fft.createComplexArray();
    this.magnitudes = new Float32Array(this.fftSize / 2 + 1);
    this.peakIndexes = new Int32Array(this.magnitudes.length);
    this.nbPeaks = 0;
  }

  processOLA(inputs, outputs, parameters) {
    // no automation, take last value
    let pitchFactor = parameters.pitchFactor[parameters.pitchFactor.length - 1];
    if (pitchFactor < 0) {
      pitchFactor = pitchFactor * 0.25;
    }
    pitchFactor = Math.max(0, pitchFactor + 1);
    for (let i = 0; i < this.nbInputs; i++) {
      for (let j = 0; j < inputs[i].length; j++) {
        const input = inputs[i][j];
        const output = outputs[i][j];
        this.applyHannWindow(input);
        this.fft.realTransform(this.freqComplexBuffer, input);
        this.computeMagnitudes();
        this.findPeaks();
        this.shiftPeaks(pitchFactor);
        this.fft.completeSpectrum(this.freqComplexBufferShifted);
        this.fft.inverseTransform(this.timeComplexBuffer, this.freqComplexBufferShifted);
        this.fft.fromComplexArray(this.timeComplexBuffer, output);
        this.applyHannWindow(output);
      }
    }
    this.timeCursor += this.hopSize;
  }

  /** Apply Hann window in-place
   * @tags internals
   */
  applyHannWindow(input) {
    for (let i = 0; i < this.blockSize; i++) {
      input[i] *= this.hannWindow[i] * 1.62;
    }
  }

  /** Compute squared magnitudes for peak finding
   * @tags internals
   **/
  computeMagnitudes() {
    let i = 0,
      j = 0;
    while (i < this.magnitudes.length) {
      const real = this.freqComplexBuffer[j];
      const imag = this.freqComplexBuffer[j + 1];
      // no need to sqrt for peak finding
      this.magnitudes[i] = real ** 2 + imag ** 2;
      i += 1;
      j += 2;
    }
  }

  /** Find peaks in spectrum magnitudes
   * @tags internals
   **/
  findPeaks() {
    this.nbPeaks = 0;
    let i = 2;
    const end = this.magnitudes.length - 2;
    while (i < end) {
      const mag = this.magnitudes[i];
      if (this.magnitudes[i - 1] >= mag || this.magnitudes[i - 2] >= mag) {
        i++;
        continue;
      }
      if (this.magnitudes[i + 1] >= mag || this.magnitudes[i + 2] >= mag) {
        i++;
        continue;
      }
      this.peakIndexes[this.nbPeaks] = i;
      this.nbPeaks++;
      i += 2;
    }
  }

  /** Shift peaks and regions of influence by pitchFactor into new specturm
   * @tags internals
   */
  shiftPeaks(pitchFactor) {
    // zero-fill new spectrum
    this.freqComplexBufferShifted.fill(0);
    for (let i = 0; i < this.nbPeaks; i++) {
      const peakIndex = this.peakIndexes[i];
      const peakIndexShifted = fround(peakIndex * pitchFactor);
      if (peakIndexShifted > this.magnitudes.length) {
        break;
      }
      // find region of influence
      let startIndex = 0;
      let endIndex = this.fftSize;
      if (i > 0) {
        startIndex = peakIndex - fround((peakIndex - this.peakIndexes[i - 1]) / 2);
      }
      if (i < this.nbPeaks - 1) {
        endIndex = peakIndex + fceil((this.peakIndexes[i + 1] - peakIndex) / 2);
      }
      // shift whole region of influence around peak to shifted peak
      const startOffset = startIndex - peakIndex;
      const endOffset = endIndex - peakIndex;
      const omegaDelta = TWO_PI * this.invfftSize * (peakIndexShifted - peakIndex);
      const phaseShiftReal = Math.cos(omegaDelta * this.timeCursor);
      const phaseShiftImag = Math.sin(omegaDelta * this.timeCursor);
      for (let j = startOffset; j < endOffset; j++) {
        const binIndex = peakIndex + j;
        const binIndexShifted = peakIndexShifted + j;
        if (binIndexShifted >= this.magnitudes.length) {
          break;
        }
        // apply phase correction
        const indexReal = 2 * binIndex;
        const indexImag = indexReal + 1;
        const valueReal = this.freqComplexBuffer[indexReal];
        const valueImag = this.freqComplexBuffer[indexImag];

        const valueShiftedReal = valueReal * phaseShiftReal - valueImag * phaseShiftImag;
        const valueShiftedImag = valueReal * phaseShiftImag + valueImag * phaseShiftReal;

        const indexShiftedReal = 2 * binIndexShifted;
        const indexShiftedImag = indexShiftedReal + 1;
        this.freqComplexBufferShifted[indexShiftedReal] += valueShiftedReal;
        this.freqComplexBufferShifted[indexShiftedImag] += valueShiftedImag;
      }
    }
  }
}

registerProcessor('phase-vocoder-processor', PhaseVocoderProcessor);

// Adapted from https://www.musicdsp.org/en/latest/Effects/221-band-limited-pwm-generator.html
class PulseOscillatorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phi = -PI; // phase
    this.Y0 = 0; // feedback memories
    this.Y1 = 0;
    this.PW = PI; // pulse width
    this.B = 2.3; // feedback coefficient
    this.dphif = 0; // filtered phase increment
    this.envf = 0; // filtered envelope
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'begin',
        defaultValue: 0,
        max: Number.POSITIVE_INFINITY,
        min: 0,
      },

      {
        name: 'end',
        defaultValue: 0,
        max: Number.POSITIVE_INFINITY,
        min: 0,
      },

      {
        name: 'frequency',
        defaultValue: 440,
        min: Number.EPSILON,
      },
      {
        name: 'detune',
        defaultValue: 0,
        min: Number.NEGATIVE_INFINITY,
        max: Number.POSITIVE_INFINITY,
      },
      {
        name: 'pulsewidth',
        defaultValue: 1,
        min: 0,
        max: Number.POSITIVE_INFINITY,
      },
    ];
  }

  process(inputs, outputs, params) {
    if (this.disconnected) {
      return false;
    }
    if (currentTime <= params.begin[0]) {
      return true;
    }
    if (currentTime >= params.end[0]) {
      return false;
    }
    const output = outputs[0];
    let env = 1,
      dphi;

    for (let i = 0; i < (output[0].length ?? 0); i++) {
      const pw = (1 - clamp(pv(params.pulsewidth, i), -0.99, 0.99)) * PI;
      const detune = pv(params.detune, i);
      const freq = applySemitoneDetuneToFrequency(pv(params.frequency, i), detune / 100);

      dphi = freq * TWO_PI * INVSR; // phase increment
      this.dphif += 0.1 * (dphi - this.dphif);

      env *= 0.9998; // exponential decay envelope
      this.envf += 0.1 * (env - this.envf);

      // Feedback coefficient control
      this.B = 2.3 * (1 - 0.0001 * freq); // feedback limitation
      if (this.B < 0) this.B = 0;

      // Waveform generation (half-Tomisawa oscillators)
      this.phi += this.dphif; // phase increment
      if (this.phi >= PI) this.phi -= TWO_PI; // phase wrapping

      // First half-Tomisawa generator
      let out0 = Math.cos(this.phi + this.B * this.Y0); // self-phase modulation
      this.Y0 = 0.5 * (out0 + this.Y0); // anti-hunting filter

      // Second half-Tomisawa generator (with phase offset for pulse width)
      let out1 = Math.cos(this.phi + this.B * this.Y1 + pw);
      this.Y1 = 0.5 * (out1 + this.Y1); // anti-hunting filter

      for (let o = 0; o < output.length; o++) {
        // Combination of both oscillators with envelope applied
        output[o][i] = 0.15 * (out0 - out1) * this.envf;
      }
    }

    return true; // keep the audio processing going
  }
}

registerProcessor('pulse-oscillator', PulseOscillatorProcessor);

/**  BYTE BEATS
 * @tags internals
 */
const chyx = {
  /*bit*/ bitC: function (x, y, z) {
    return x & y ? z : 0;
  },
  /*bit reverse*/ br: function (x, size = 8) {
    if (size > 32) {
      throw new Error('br() Size cannot be greater than 32');
    }
    let result = 0;
    for (let idx = 0; idx < size; idx++) {
      result |= chyx.bitC(x, 1 << idx, 1 << (size - (idx + 1)));
    }
    return result;
  },
  /*sin that loops every 128 "steps", instead of every pi steps*/ sinf: function (x) {
    return Math.sin((x * PI) / 128);
  },
  /*cos that loops every 128 "steps", instead of every pi steps*/ cosf: function (x) {
    return Math.cos((x * PI) / 128);
  },
  /*tan that loops every 128 "steps", instead of every pi steps*/ tanf: function (x) {
    return Math.tan((x * PI) / 128);
  },
  /*converts t into a string composed of its bits; regexes that*/ regG: function (t, X) {
    return X.test(t.toString(2));
  },
};

// Create shortened Math functions
let mathParams, byteBeatHelperFuncs;
function getByteBeatFunc(codetext) {
  if (mathParams == null) {
    mathParams = Object.getOwnPropertyNames(Math);
    byteBeatHelperFuncs = mathParams.map((k) => Math[k]);
    const chyxNames = Object.getOwnPropertyNames(chyx);
    const chyxFuncs = chyxNames.map((k) => chyx[k]);
    mathParams.push('int', 'window', ...chyxNames);
    byteBeatHelperFuncs.push(Math.floor, globalThis, ...chyxFuncs);
  }
  return new Function(...mathParams, 't', `return 0,\n${codetext || 0};`).bind(globalThis, ...byteBeatHelperFuncs);
}

class ByteBeatProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (event) => {
      let { codeText } = event.data;
      const { byteBeatStartTime } = event.data;
      if (byteBeatStartTime != null) {
        this.t = 0;
        this.initialOffset = Math.floor(byteBeatStartTime);
      }

      //Optimization pulled from dollchan.net: https://github.com/Chasyxx/EnBeat_NEW, it seemed important
      //Optimize code like eval(unescape(escape`XXXX`.replace(/u(..)/g,"$1%")))
      codeText = codeText
        .trim()
        .replace(
          /^eval\(unescape\(escape(?:`|\('|\("|\(`)(.*?)(?:`|'\)|"\)|`\)).replace\(\/u\(\.\.\)\/g,["'`]\$1%["'`]\)\)\)$/,
          (match, m1) => unescape(escape(m1).replace(/u(..)/g, '$1%')),
        );

      this.func = getByteBeatFunc(codeText);
    };
    this.initialOffset = 0;
    this.t = null;
    this.func = null;
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'begin',
        defaultValue: 0,
        max: Number.POSITIVE_INFINITY,
        min: 0,
      },
      {
        name: 'frequency',
        defaultValue: 440,
        min: Number.EPSILON,
      },
      {
        name: 'detune',
        defaultValue: 0,
        min: Number.NEGATIVE_INFINITY,
        max: Number.POSITIVE_INFINITY,
      },
      {
        name: 'end',
        defaultValue: 0,
        max: Number.POSITIVE_INFINITY,
        min: 0,
      },
    ];
  }

  process(inputs, outputs, params) {
    if (this.disconnected) {
      return false;
    }
    if (currentTime <= params.begin[0]) {
      return true;
    }
    if (currentTime >= params.end[0]) {
      return false;
    }
    if (this.t == null) {
      this.t = params.begin[0] * sampleRate;
    }
    const output = outputs[0];
    const scale = 256 * INVSR;
    for (let i = 0; i < output[0].length; i++) {
      const detune = pv(params.detune, i);
      const freq = applySemitoneDetuneToFrequency(pv(params.frequency, i), detune / 100);
      const local_t = scale * freq * this.t + this.initialOffset;
      const funcValue = this.func(local_t);
      const signal = (funcValue & 255) / 127.5 - 1;
      //prevent speaker blowout via clipping if threshold exceeds
      const out = clamp(signal * 0.2, -0.4, 0.4);
      for (let c = 0; c < output.length; c++) {
        output[c][i] = out;
      }
      this.t++;
    }

    return true; // keep the audio processing going
  }
}

registerProcessor('byte-beat-processor', ByteBeatProcessor);

class EnvelopeProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'begin', defaultValue: 0 },
      { name: 'end', defaultValue: 0 },
      { name: 'attack', defaultValue: 0.005, minValue: 0 },
      { name: 'decay', defaultValue: 0.14, minValue: 0 },
      { name: 'sustain', defaultValue: 0, minValue: 0, maxValue: 1 },
      { name: 'release', defaultValue: 0.1, minValue: 0 },
      { name: 'attackCurve', defaultValue: 0, minValue: -1, maxValue: 1 },
      { name: 'decayCurve', defaultValue: 0, minValue: -1, maxValue: 1 },
      { name: 'releaseCurve', defaultValue: 0, minValue: -1, maxValue: 1 },
      { name: 'depth', defaultValue: 1 },
      { name: 'min', defaultValue: -1e9 },
      { name: 'max', defaultValue: 1e9 },
      { name: 'retrigger', defaultValue: 1, minValue: 0, maxValue: 1 },
    ];
  }

  constructor() {
    super();
    this.val = 0;
    this.segIdx = 0;
    this.state = 0;
    this.beginTime = 0;
    this.endTime = 0;
    this.attackStart = 0;
  }

  _warp(phase, curvature, strength = 8) {
    if (phase === 0 || phase === 1) return phase; // fast exit
    if (curvature > 0) {
      // snappier
      const exp = 1 + strength * curvature;
      return 1 - Math.pow(1 - phase, exp);
    } else {
      // more calm
      const exp = 1 - strength * curvature;
      return Math.pow(phase, exp);
    }
  }

  _advance(start, target, time, curvature) {
    if (time === 0 || start === target) {
      this.val = target;
    } else {
      // We compute our progress through this section of the envelope in time
      // as a `phase` value, which is warped by the curvature, and then used
      // to compute the value of the envelope at that time
      const phase = Math.min(1, (currentTime - this.beginTime) / time);
      const phaseWarped = this._warp(phase, curvature);
      this.val = start + (target - start) * phaseWarped;
    }
  }

  process(_inputs, outputs, params) {
    const begin = params['begin'][0];
    const end = params['end'][0];
    if (currentTime >= end) {
      return false;
    }
    if (currentTime <= begin) {
      return true;
    }
    const out = outputs[0][0];
    const retrigger = pv(params.retrigger, 0) >= 0.5; // convert to bool
    if (begin !== this.beginTime && (this.state === 0 || retrigger)) {
      // triggered
      this.beginTime = begin;
      this.state = 1;
      this.endTime = pv(params.end, 0);
      this.attackStart = this.val;
    }
    const susTime = this.endTime - this.beginTime;
    for (let i = 0; i < out.length; i++) {
      const attack = pv(params.attack, i);
      const decay = pv(params.decay, i);
      const sustain = pv(params.sustain, i);
      const release = pv(params.release, i);
      const aCurve = pv(params.attackCurve, i);
      const dCurve = pv(params.decayCurve, i);
      const rCurve = pv(params.releaseCurve, i);
      const depth = pv(params.depth, i);
      const min = pv(params.min, i);
      const max = pv(params.max, i);
      const states = [
        { time: Number.POSITIVE_INFINITY, start: 0, target: 0 }, // idle
        { time: attack, start: this.attackStart, target: 1, curve: aCurve },
        { time: attack + decay, start: 1, target: sustain, curve: dCurve },
        { time: susTime, start: sustain, target: sustain },
        { time: susTime + release, start: sustain, target: 0, curve: rCurve },
      ];
      let { time, start, target, curve } = states[this.state];
      this._advance(start, target, time, curve);
      while (currentTime - this.beginTime >= time) {
        this.state = (this.state + 1) % states.length;
        time = states[this.state].time;
      }
      out[i] = clamp(this.val * depth, min, max);
    }
    return true;
  }
}

registerProcessor('envelope-processor', EnvelopeProcessor);

export const WarpMode = Object.freeze({
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

function hash32(u) {
  u = u + 0x7ed55d16 + (u << 12);
  u = u ^ 0xc761c23c ^ (u >>> 19);
  u = u + 0x165667b1 + (u << 5);
  u = (u + 0xd3a2646c) ^ (u << 9);
  u = u + 0xfd7046c5 + (u << 3);
  u = u ^ 0xb55a4f09 ^ (u >>> 16);
  return u >>> 0;
}
const hash01 = (i) => (hash32(i) >>> 8) / 0x01000000;

function bitReverse(i, n) {
  let r = 0;
  for (let b = 0; b < n; b++) {
    r = (r << 1) | (i & 1);
    i >>>= 1;
  }
  return r;
}

function noise(x) {
  const i = Math.floor(x),
    f = x - i;
  const a = hash01(i),
    b = hash01(i + 1);
  return a + (b - a) * f;
}

function brownian(x, oct = 4) {
  let amp = 0.5,
    sum = 0,
    norm = 0,
    freq = 1;
  for (let o = 0; o < oct; o++) {
    sum += amp * noise(x * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return (sum / norm) * 2 - 1;
}

const tablesCache = {};
class WavetableOscillatorProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'begin', defaultValue: -1, min: -1, max: Number.POSITIVE_INFINITY },
      { name: 'end', defaultValue: -1, min: -1, max: Number.POSITIVE_INFINITY },
      { name: 'frequency', defaultValue: 440, min: Number.EPSILON },
      { name: 'detune', defaultValue: 0 },
      { name: 'freqspread', defaultValue: 0.18, min: 0 },
      { name: 'position', defaultValue: 0, min: 0, max: 1 },
      { name: 'warp', defaultValue: 0, min: 0, max: 1 },
      { name: 'warpMode', defaultValue: 0 },
      { name: 'voices', defaultValue: 1, min: 1, automationRate: 'k-rate' },
      { name: 'panspread', defaultValue: 0.7, min: 0, max: 1 },
      { name: 'phaserand', defaultValue: 0, min: 0, max: 1 },
    ];
  }

  constructor(options) {
    super(options);
    this.port.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === 'initialize') {
        this.initialize(payload);
      }
    };
    this.initialize();
  }
  initialize(options) {
    this.table = null;
    this.frameLen = null;
    this.numFrames = null;
    this.phase = [];
    if (options?.key) {
      const key = options.key;
      this.frameLen = options.frameLen;
      if (!tablesCache[key]) {
        tablesCache[key] = options.frames;
      }
      this.table = tablesCache[key];
      this.numFrames = this.table.length;
    }
  }

  _mirror(x) {
    return 1 - Math.abs(2 * x - 1);
  }

  _toBits(amt, min = 2, max = 12) {
    const b = max + (min - max) * amt;
    return { b, n: fround(Math.pow(2, b)) };
  }

  _warpPhase(phase, amt, mode) {
    switch (mode) {
      case WarpMode.NONE: {
        return phase;
      }
      case WarpMode.ASYM: {
        const a = 0.01 + 0.99 * amt;
        return phase < a ? (0.5 * phase) / a : 0.5 + (0.5 * (phase - a)) / (1 - a);
      }
      case WarpMode.MIRROR: {
        // Asym, then mirror
        return this._mirror(this._warpPhase(phase, amt, WarpMode.ASYM));
      }
      case WarpMode.BENDP: {
        return Math.pow(phase, 1 + 3 * amt);
      }
      case WarpMode.BENDM: {
        return Math.pow(phase, 1 / (1 + 3 * amt));
      }
      case WarpMode.BENDMP: {
        return amt < 0.5 ? this._warpPhase(phase, 1 - 2 * amt, 3) : this._warpPhase(phase, 2 * amt - 1, 2);
      }
      case WarpMode.SYNC: {
        const syncRatio = Math.pow(16, amt ** 2);
        return (phase * syncRatio) % 1;
      }
      case WarpMode.QUANT: {
        const { n } = this._toBits(amt);
        return ffloor(phase * n) / n;
      }
      case WarpMode.FOLD: {
        const K = 7;
        const k = 1 + Math.max(1, fround(K * amt));
        return Math.abs(ffrac(k * phase) - 0.5) * 2;
      }
      case WarpMode.PWM: {
        const w = clamp(0.5 + 0.49 * (2 * amt - 1), 0, 1);
        if (phase < w) return (phase / w) * 0.5;
        return 0.5 + ((phase - w) / (1 - w)) * 0.5;
      }
      case WarpMode.ORBIT: {
        const depth = 0.5 * amt;
        const n = 3;
        return frac(phase + depth * Math.sin(TWO_PI * n * phase));
      }
      case WarpMode.SPIN: {
        const depth = 0.5 * amt;
        const { n } = this._toBits(amt, 1, 6);
        return frac(phase + depth * Math.sin(TWO_PI * n * phase));
      }
      case WarpMode.CHAOS: {
        const r = 3.7 + 0.3 * amt;
        const logistic = r * phase * (1 - phase);
        return clamp((1 - amt) * phase + amt * logistic, 0, 1);
      }
      case WarpMode.PRIMES: {
        const isPrime = (n) => {
          if (n < 2) return false;
          if (n % 2 === 0) return n === 2;
          for (let d = 3; d ** 2 <= n; d += 2) if (n % d === 0) return false;
          return true;
        };
        let { n } = this._toBits(amt, 3);
        while (!isPrime(n)) n++;
        return ffloor(phase * n) / n;
      }
      case WarpMode.BINARY: {
        let { b } = this._toBits(amt, 3);
        b = fround(b);
        const n = 1 << b;
        const idx = ffloor(phase * n);
        const ridx = bitReverse(idx, b);
        return ridx / n;
      }
      case WarpMode.BROWNIAN: {
        const disp = 0.25 * amt * brownian(64 * phase, 4);
        return frac(phase + disp);
      }
      case WarpMode.RECIPROCAL: {
        const g = 2 + 4 * amt;
        const num = phase * g;
        const den = phase + (1 - phase) * g;
        const y = den > 1e-12 ? num / den : 0;
        return clamp(y, 0, 1);
      }
      case WarpMode.WORMHOLE: {
        const gap = clamp(0.8 * amt, 0, 1);
        const a = 0.5 * (1 - gap);
        const b = 0.5 * (1 + gap);
        if (phase < a) return (phase / a) * 0.5;
        if (phase > b) return 0.5 * (1 + (phase - b) / (1 - b));
        return 0.5;
      }
      case WarpMode.LOGISTIC: {
        let x = phase;
        const r = 3.6 + 0.4 * amt;
        const iters = 1 + fround(2 * amt);
        for (let i = 0; i < iters; i++) x = r * x * (1 - x);
        return clamp(x, 0, 1);
      }
      case WarpMode.SIGMOID: {
        const k = 1 + 10 * amt;
        const x = phase - 0.5;
        const y = 1 / (1 + Math.exp(-k * x));
        const y0 = 1 / (1 + Math.exp(0.5 * k));
        const y1 = 1 / (1 + Math.exp(-0.5 * k));
        return (y - y0) / (y1 - y0);
      }
      case WarpMode.FRACTAL: {
        const d = 0.5 * Math.sin(TWO_PI * phase) * amt;
        return frac(phase + d);
      }
      case WarpMode.FLIP: {
        return phase;
      }
      default:
        return phase;
    }
  }

  _sampleFrame(frame, phase) {
    const len = frame.length;
    const pos = phase * len;
    let i = pos | 0;
    if (i >= len) i = 0; // fast wrap
    const frac = pos - i;
    const a = frame[i];
    let i1 = i + 1;
    if (i1 >= len) i1 = 0;
    const b = frame[i1];
    return a + (b - a) * frac;
  }

  process(_inputs, outputs, parameters) {
    const begin = parameters.begin[0];
    const end = parameters.end[0];
    const beginDefined = begin >= 0;
    const endDefined = end >= 0;
    // We give a 0.5s grace period (for node pooling) before termination
    const shouldTerminate = endDefined && currentTime >= end + 0.5;
    const ended = endDefined && currentTime >= end;
    const notStarted = currentTime <= begin;
    if (shouldTerminate) {
      return false;
    } else if (ended || notStarted || !beginDefined) {
      return true;
    }
    const outL = outputs[0][0];
    const outR = outputs[0][1] || outputs[0][0];
    if (!this.table) {
      outL.fill(0);
      if (outR !== outL) outR.set(outL);
      return true;
    }
    const voices = parameters.voices[0]; // k-rate
    for (let i = 0; i < outL.length; i++) {
      const detune = pv(parameters.detune, i);
      const freqspread = pv(parameters.freqspread, i);
      const tablePos = clamp(pv(parameters.position, i), 0, 1);
      const idx = tablePos * (this.numFrames - 1);
      const fIdx = idx | 0;
      const interpT = idx - fIdx;
      const warpAmount = clamp(pv(parameters.warp, i), 0, 1);
      const warpMode = pv(parameters.warpMode, i);
      const phaseRand = clamp(pv(parameters.phaserand, i), 0, 1);
      const panspread = voices > 1 ? clamp(pv(parameters.panspread, i), 0, 1) : 0;
      const gain1 = Math.sqrt(0.5 - 0.5 * panspread);
      const gain2 = Math.sqrt(0.5 + 0.5 * panspread);
      let f = pv(parameters.frequency, i);
      f = applySemitoneDetuneToFrequency(f, detune / 100); // overall detune
      const normalizer = 1 / Math.sqrt(voices);
      const detuner = getDetuner(voices, freqspread);
      for (let n = 0; n < voices; n++) {
        const isOdd = (n & 1) == 1;
        let gainL = gain1;
        let gainR = gain2;
        // invert right and left gain
        if (isOdd) {
          gainL = gain2;
          gainR = gain1;
        }
        const fVoice = applySemitoneDetuneToFrequency(f, detuner(n)); // voice detune
        const dPhase = fVoice * INVSR;

        // warp phase then sample
        this.phase[n] = this.phase[n] ?? Math.random() * phaseRand;
        const ph = this._warpPhase(this.phase[n], warpAmount, warpMode);
        const s0 = this._sampleFrame(this.table[fIdx], ph);
        const s1 = this._sampleFrame(this.table[Math.min(this.numFrames - 1, fIdx + 1)], ph);
        let s = lerp(s0, s1, interpT);
        if (warpMode === WarpMode.FLIP && this.phase[n] < warpAmount) {
          s = -s;
        }
        outL[i] += s * gainL * normalizer;
        outR[i] += s * gainR * normalizer;
        this.phase[n] = frac(this.phase[n] + dPhase);
      }
    }
    return true;
  }
}

registerProcessor('wavetable-oscillator-processor', WavetableOscillatorProcessor);

class TransientProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  constructor(options) {
    super();
    this.gainCoeff = timeToCoeff(0.2);
    this.avgGain = 1;
    let {
      attackTime = 0.003,
      sustainTime = 0.08,
      attack = 0,
      sustain = 0,
      sensitivity = 0.1,
      mix = 1,
      begin = 0,
      end = 0,
    } = options.processorOptions;
    attackTime = clamp(attackTime, 0.0005, 0.05);
    sustainTime = clamp(sustainTime, 0.01, 0.5);
    this.attackCoeff = timeToCoeff(attackTime);
    this.sustainCoeff = timeToCoeff(sustainTime);
    this.attackAmt = clamp(attack, -1, 1);
    this.sustainAmt = clamp(sustain, -1, 1);
    this.scaling = 0.5 + 5 * clamp(sensitivity, 0, 1);
    this.mix = clamp(mix, 0, 1);
    this.begin = begin;
    this.end = end;
    this.attackEnv = new Float32Array(2); // assume stereo
    this.sustainEnv = new Float32Array(2);
  }

  process(inputs, outputs, _params) {
    const input = inputs[0];
    const output = outputs[0];
    if (currentTime >= this.end) {
      return false;
    }
    if (currentTime <= this.begin) {
      return true;
    }
    const channels = input.length;
    if (channels > this.attackEnv.length) {
      this.attackEnv = new Float32Array(channels);
      this.sustainEnv = new Float32Array(channels);
    }
    let avgGain = this.avgGain;
    for (let ch = 0; ch < channels; ch++) {
      let attEnv = this.attackEnv[ch];
      let susEnv = this.sustainEnv[ch];
      for (let n = 0; n < blockSize; n++) {
        const sample = input[ch][n];
        const x = Math.abs(sample);
        attEnv = lerp(attEnv, x, this.attackCoeff);
        susEnv = lerp(susEnv, x, this.sustainCoeff);
        const peakiness = clamp((this.scaling * (attEnv - susEnv)) / (susEnv + 1e-6), -1.5, 1.5);
        const attScale = peakiness > 0 ? peakiness : 0;
        const susScale = peakiness < 0 ? -peakiness : 0;
        const attackGain = dbToLin(this.attackAmt * attScale * 18);
        const sustainGain = dbToLin(this.sustainAmt * susScale * 36);
        const gain = clamp(attackGain * sustainGain, 0, 8);
        avgGain = lerp(avgGain, gain, this.gainCoeff);
        const makeup = avgGain > 1e-3 ? 1 / avgGain : 1;
        const wet = sample * gain * makeup;
        let y = lerp(sample, wet, this.mix);
        y /= 1 + Math.abs(y); // soft clip
        output[ch][n] = y;
      }
      this.attackEnv[ch] = attEnv;
      this.sustainEnv[ch] = susEnv;
    }
    this.avgGain = avgGain;
    return true;
  }
}

registerProcessor('transient-processor', TransientProcessor);

class GenericProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.playPos = 0;
    const channels = 16;
    this.outputs = new Array(channels).fill(0);
    this.sources = new Array(channels).fill(0);
    this.gateEnded = false;
    this.started = false;
    this.port.onmessage = (event) => {
      let {
        src,
        schema: { ugens, registers },
        start,
        gateEnd,
        end,
      } = event.data;
      this.start = start;
      this.gateEnd = gateEnd;
      this.end = end;
      this.registers = new Array(registers).fill(0);
      this.src = `o.fill(0); // reset outputs\n${src}`;
      this.nodes = [];
      for (let i = 0; i < ugens.length; i++) {
        const ugen = ugens[i];
        const nodeClass = UGENS.get(ugen.type);
        const node = new nodeClass(i, ugen, sampleRate);
        if (node.type === 'cc' && ugen.inputs?.[0]?.includes('strudel-gate')) {
          node.setValue(1);
          this.gateNode = node;
        }
        this.nodes[i] = node;
      }
      this.genSample = new Function(
        'time',
        'nodes',
        'input',
        'r', // registers
        'o', // outputs
        's', // sources
        this.src,
      );
    };
  }
  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    if (currentTime >= this.end) {
      return false;
    } else if (this.genSample === undefined || currentTime < this.start) {
      // pending
      return true;
    }
    this.started = true;
    if (!this.gateEnded && currentTime > this.gateEnd) {
      this.gateNode?.setValue(0);
      this.gateEnded = true;
    }
    const output = outputs[0];
    const outL = output[0];
    const outR = output[1];
    for (let n = 0; n < blockSize; n++) {
      this.genSample(this.playPos, this.nodes, input ? input[n] : 0, this.registers, this.outputs, this.sources);
      const left = this.outputs[0];
      const right = this.outputs[1];
      // Spread to stereo if possible; else mixdown to mono
      if (outR) {
        outL[n] = left;
        outR[n] = right;
      } else {
        outL[n] = 0.5 * (left + right);
      }
      this.playPos += 1 / sampleRate;
    }
    return true;
  }
}
registerProcessor('generic-processor', GenericProcessor);
