import { clamp } from './util.mjs';
import { registerSound, soundMap } from './superdough.mjs';
import { getAudioContext } from './audioContext.mjs';
import {
  applyFM,
  gainNode,
  getADSRValues,
  getFrequencyFromValue,
  getLfo,
  getParamADSR,
  getPitchEnvelope,
  getVibratoOscillator,
  getWorklet,
  noises,
  releaseAudioNode,
  webAudioTimeout,
} from './helpers.mjs';
import { logger } from './logger.mjs';
import { getNoiseMix, getNoiseOscillator } from './noise.mjs';

const waveforms = ['triangle', 'square', 'sawtooth', 'sine', 'user'];
const waveformAliases = [
  ['tri', 'triangle'],
  ['sqr', 'square'],
  ['saw', 'sawtooth'],
  ['sin', 'sine'],
];

function makeSaturationCurve(amount, n_samples) {
  const k = typeof amount === 'number' ? amount : 50;
  const curve = new Float32Array(n_samples);

  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = Math.tanh(x * k);
  }
  return curve;
}

export function registerSynthSounds() {
  [...waveforms].forEach((s) => {
    registerSound(
      s,
      (t, value, onended) => {
        const [attack, decay, sustain, release] = getADSRValues(
          [value.attack, value.decay, value.sustain, value.release],
          'linear',
          [0.001, 0.05, 0.6, 0.01],
        );

        // turn down
        const g = gainNode(0.3);

        let sound = getOscillator(s, t, value, () => {
          g.disconnect();
          onended();
        });

        let { node: o, stop, triggerRelease } = sound;

        const { duration } = value;

        const envGain = gainNode(1);
        let node = o.connect(g).connect(envGain);
        const holdEnd = t + duration;
        getParamADSR(node.gain, attack, decay, sustain, release, 0, 1, t, holdEnd, 'linear');
        const envEnd = holdEnd + release + 0.01;
        triggerRelease?.(envEnd);
        stop(envEnd);
        return {
          node,
          stop: (endTime) => {
            stop(endTime);
          },
        };
      },
      { type: 'synth', prebake: true, pack: 'Synths' },
    );
  });

  registerSound(
    'sbd',
    (t, value, onended) => {
      const { duration, decay = 0.5, pdecay = 0.5, penv = 36, clip } = value;
      const ctx = getAudioContext();
      const attackhold = 0.02;
      const noiselvl = 1.2;
      const noisedecay = 0.025;
      const mixGain = 1;

      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = getFrequencyFromValue(value, 29);
      o.detune.setValueAtTime(penv * 100, 0);
      o.detune.setValueAtTime(penv * 100, t);
      o.detune.exponentialRampToValueAtTime(0.001, t + pdecay);
      const g = gainNode(1);
      g.gain.setValueAtTime(1, t + attackhold);
      g.gain.exponentialRampToValueAtTime(0.001, t + attackhold + decay);
      o.start(t);

      const noise = getNoiseOscillator('brown', t, 2);
      const noiseGain = gainNode(1);
      noiseGain.gain.setValueAtTime(noiselvl, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + noisedecay);

      const sat = new WaveShaperNode(ctx);
      // tri to sine diode shaper emulation
      sat.curve = makeSaturationCurve(2, ctx.sampleRate);

      const mix = gainNode(mixGain);

      o.onended = () => {
        o.disconnect();
        g.disconnect();
        sat.disconnect();
        noise.node.disconnect();
        noiseGain.disconnect();
        mix.disconnect();
        onended();
      };

      const node = o.connect(sat).connect(g).connect(mix);
      noise.node.connect(noiseGain).connect(mix);

      const holdEnd = t + decay;
      let end = holdEnd + 0.01;
      if (clip != null) {
        end = Math.min(t + clip * duration, end);
      }

      // prevent clicking
      mix.gain.setValueAtTime(mixGain, end - 0.01);
      mix.gain.linearRampToValueAtTime(0, end);

      o.stop(end);
      noise.stop(end);

      return {
        node,
        stop: (endTime) => {
          o.stop(endTime);
        },
      };
    },
    { type: 'synth', prebake: true, pack: 'Synths' },
  );

  registerSound(
    'supersaw',
    (begin, value, onended) => {
      const ac = getAudioContext();
      let { duration, n, unison = 5, spread = 0.6, detune } = value;
      detune = detune ?? n ?? 0.18;
      const frequency = getFrequencyFromValue(value);

      const [attack, decay, sustain, release] = getADSRValues(
        [value.attack, value.decay, value.sustain, value.release],
        'linear',
        [0.001, 0.05, 0.6, 0.01],
      );

      const holdend = begin + duration;
      const end = holdend + release + 0.01;
      const voices = clamp(unison, 1, 100);
      let panspread = voices > 1 ? clamp(spread, 0, 1) : 0;
      let o = getWorklet(
        ac,
        'supersaw-oscillator',
        {
          frequency,
          begin,
          end,
          freqspread: detune,
          voices,
          panspread,
        },
        {
          outputChannelCount: [2],
        },
      );

      const gainAdjustment = 1 / Math.sqrt(voices);
      getPitchEnvelope(o.parameters.get('detune'), value, begin, holdend);
      const vibratoOscillator = getVibratoOscillator(o.parameters.get('detune'), value, begin);
      const fm = applyFM(o.parameters.get('frequency'), value, begin);
      let envGain = gainNode(1);
      envGain = o.connect(envGain);

      getParamADSR(envGain.gain, attack, decay, sustain, release, 0, 0.3 * gainAdjustment, begin, holdend, 'linear');

      let timeoutNode = webAudioTimeout(
        ac,
        () => {
          releaseAudioNode(o);
          onended();
          fm?.stop();
          vibratoOscillator?.stop();
        },
        begin,
        end,
      );

      return {
        node: envGain,
        stop: (time) => {
          timeoutNode.stop(time);
        },
      };
    },
    { prebake: true, type: 'synth' },
  );

  registerSound(
    'bytebeat',
    (begin, value, onended) => {
      const defaultBeats = [
        '(t%255 >= t/255%255)*255',
        '(t*(t*8%60 <= 300)|(-t)*(t*4%512 < 256))+t/400',
        't',
        't*(t >> 10^t)',
        't&128',
        't&t>>8',
        '((t%255+t%128+t%64+t%32+t%16+t%127.8+t%64.8+t%32.8+t%16.8)/3)',
        '((t%64+t%63.8+t%64.15+t%64.35+t%63.5)/1.25)',
        '(t&(t>>7)-t)',
        '(sin(t*PI/128)*127+127)',
        '((t^t/2+t+64*(sin((t*PI/64)+(t*PI/32768))+64))%128*2)',
        '((t^t/2+t+64*(cos >> 0))%127.85*2)',
        '((t^t/2+t+64)%128*2)',
        '(((t * .25)^(t * .25)/100+(t * .25))%128)*2',
        '((t^t/2+t+64)%7 * 24)',
      ];
      const { n = 0 } = value;
      const frequency = getFrequencyFromValue(value);
      const { byteBeatExpression = defaultBeats[n % defaultBeats.length], byteBeatStartTime } = value;

      const ac = getAudioContext();

      let { duration } = value;
      const [attack, decay, sustain, release] = getADSRValues(
        [value.attack, value.decay, value.sustain, value.release],
        'linear',
        [0.001, 0.05, 0.6, 0.01],
      );
      const holdend = begin + duration;
      const end = holdend + release + 0.01;

      let o = getWorklet(
        ac,
        'byte-beat-processor',
        {
          frequency,
          begin,
          end,
        },
        {
          outputChannelCount: [2],
        },
      );

      o.port.postMessage({ codeText: byteBeatExpression, byteBeatStartTime, frequency });

      let envGain = gainNode(1);
      envGain = o.connect(envGain);

      getParamADSR(envGain.gain, attack, decay, sustain, release, 0, 1, begin, holdend, 'linear');

      let timeoutNode = webAudioTimeout(
        ac,
        () => {
          releaseAudioNode(o);
          onended();
        },
        begin,
        end,
      );

      return {
        node: envGain,
        stop: (time) => {
          timeoutNode.stop(time);
        },
      };
    },
    { prebake: true, type: 'synth' },
  );

  registerSound(
    'pulse',
    (begin, value, onended) => {
      const ac = getAudioContext();
      let { pwrate, pwsweep } = value;
      if (pwsweep == null) {
        if (pwrate != null) {
          pwsweep = 0.3;
        } else {
          pwsweep = 0;
        }
      }

      if (pwrate == null && pwsweep != null) {
        pwrate = 1;
      }

      let { duration, pw: pulsewidth = 0.5 } = value;
      const frequency = getFrequencyFromValue(value);

      const [attack, decay, sustain, release] = getADSRValues(
        [value.attack, value.decay, value.sustain, value.release],
        'linear',
        [0.001, 0.05, 0.6, 0.01],
      );
      const holdend = begin + duration;
      const end = holdend + release + 0.01;
      let o = getWorklet(
        ac,
        'pulse-oscillator',
        {
          frequency,
          begin,
          end,
          pulsewidth,
        },
        {
          outputChannelCount: [2],
        },
      );

      getPitchEnvelope(o.parameters.get('detune'), value, begin, holdend);
      const vibratoOscillator = getVibratoOscillator(o.parameters.get('detune'), value, begin);
      const fm = applyFM(o.parameters.get('frequency'), value, begin);
      let envGain = gainNode(1);
      envGain = o.connect(envGain);

      getParamADSR(envGain.gain, attack, decay, sustain, release, 0, 1, begin, holdend, 'linear');
      let lfo;
      if (pwsweep != 0) {
        lfo = getLfo(ac, begin, end, { frequency: pwrate, depth: pwsweep });
        lfo.connect(o.parameters.get('pulsewidth'));
      }
      let timeoutNode = webAudioTimeout(
        ac,
        () => {
          releaseAudioNode(o);
          releaseAudioNode(lfo);
          onended();
          fm?.stop();
          vibratoOscillator?.stop();
        },
        begin,
        end,
      );

      return {
        node: envGain,
        stop: (time) => {
          timeoutNode.stop(time);
        },
      };
    },
    { prebake: true, type: 'synth' },
  );

  [...noises].forEach((s) => {
    registerSound(
      s,
      (t, value, onended) => {
        const [attack, decay, sustain, release] = getADSRValues(
          [value.attack, value.decay, value.sustain, value.release],
          'linear',
          [0.001, 0.05, 0.6, 0.01],
        );

        let sound;

        let { density } = value;
        sound = getNoiseOscillator(s, t, density);

        let { node: o, stop, triggerRelease } = sound;

        // turn down
        const g = gainNode(0.3);

        const { duration } = value;

        o.onended = () => {
          o.disconnect();
          g.disconnect();
          onended();
        };

        const envGain = gainNode(1);
        let node = o.connect(g).connect(envGain);
        const holdEnd = t + duration;
        getParamADSR(node.gain, attack, decay, sustain, release, 0, 1, t, holdEnd, 'linear');
        const envEnd = holdEnd + release + 0.01;
        triggerRelease?.(envEnd);
        stop(envEnd);
        return {
          node,
          stop: (endTime) => {
            stop(endTime);
          },
        };
      },
      { type: 'synth', prebake: true, pack: 'Synths' },
    );
  });
  waveformAliases.forEach(([alias, actual]) => soundMap.set({ ...soundMap.get(), [alias]: soundMap.get()[actual] }));
}

const PI2 = 2 * Math.PI;
export function waveformN(partials, phases, type) {
  const isList = typeof partials === 'object';
  partials = isList ? partials : new Float32Array(partials).fill(1);
  const len = partials.length;
  const real = new Float32Array(len + 1);
  const imag = new Float32Array(len + 1);
  const ac = getAudioContext();
  const osc = ac.createOscillator();

  const terms = {
    sawtooth: (n) => [0, -1 / n],
    square: (n) => [0, n % 2 === 0 ? 0 : 1 / n],
    triangle: (n) => [n % 2 === 0 ? 0 : 1 / (n * n), 0],
    user: (_n) => [0, 1],
  };

  if (!terms[type]) {
    throw new Error(`unknown wave type ${type}`);
  }

  for (let n = 0; n < len; n++) {
    const mag = partials[n];
    const [r, i] = terms[type](n + 1); // we skip n === 0 as this is dc offset
    const phase = phases?.[n] ?? 0;
    // Scale by `partials`
    let R = r * mag;
    let I = i * mag;
    // Apply rotation by the phase
    if (phase !== 0) {
      const c = Math.cos(PI2 * phase);
      const s = Math.sin(PI2 * phase);
      R = c * R - s * I;
      I = s * R + c * I;
    }
    real[n + 1] = R;
    imag[n + 1] = I;
  }

  const wave = ac.createPeriodicWave(real, imag);
  osc.setPeriodicWave(wave);
  return osc;
}

// expects one of waveforms as s
export function getOscillator(s, t, value, onended) {
  const { duration, noise = 0 } = value;
  const partials = value.partials ?? value.n;
  let o;
  if (s === 'user' && !partials) {
    logger(
      `[superdough] Synth 'user' was selected, but partials not specified. Defaulting to triangle. Use pat.partials to setup custom waveform`,
    );
    s = 'triangle';
  }
  s = s === 'user' && !partials ? 'triangle' : s;
  // If no partials are given, use stock waveforms
  if (!partials || partials?.length === 0 || s === 'sine') {
    o = getAudioContext().createOscillator();
    o.type = s || 'triangle';
  }
  // generate custom waveform if partials are given
  else {
    o = waveformN(partials, value.phases, s);
  }
  // set frequency
  o.frequency.value = getFrequencyFromValue(value);

  let vibratoOscillator = getVibratoOscillator(o.detune, value, t);

  // pitch envelope
  getPitchEnvelope(o.detune, value, t, t + duration);
  const fmModulator = applyFM(o.frequency, value, t);

  let noiseMix;
  if (noise) {
    noiseMix = getNoiseMix(o, noise, t);
  }

  o.onended = () => {
    noiseMix || o.disconnect();
    noiseMix?.node.disconnect();
    onended();
  };
  o.start(t);

  return {
    node: noiseMix?.node || o,
    stop: (time) => {
      fmModulator.stop(time);
      vibratoOscillator?.stop(time);
      noiseMix?.stop(time);
      o.stop(time);
    },
    triggerRelease: (time) => {
      // envGain?.stop(time);
    },
  };
}
