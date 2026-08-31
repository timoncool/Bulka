/*
controls.mjs - Registers audio controls for pattern manipulation and effects.
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/controls.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { logger } from './logger.mjs';
import { Pattern, pure, register, reify } from './pattern.mjs';

export function createParam(names) {
  let isMulti = Array.isArray(names);
  names = !isMulti ? [names] : names;
  const name = names[0];

  // todo: make this less confusing
  const withVal = (xs) => {
    let bag;
    // check if we have an object with an unnamed control (.value)
    if (typeof xs === 'object' && xs.value !== undefined) {
      bag = { ...xs }; // grab props that are already there
      xs = xs.value; // grab the unnamed control for this one
      delete bag.value;
    }
    if (isMulti && Array.isArray(xs)) {
      const result = bag || {};
      xs.forEach((x, i) => {
        if (i < names.length) {
          result[names[i]] = x;
        }
      });
      return result;
    } else if (bag) {
      bag[name] = xs;
      return bag;
    } else {
      return { [name]: xs };
    }
  };

  // todo: make this less confusing
  const func = function (value, pat) {
    if (!pat) {
      return reify(value).withValue(withVal);
    }
    if (typeof value === 'undefined') {
      return pat.fmap(withVal);
    }
    return pat.set(reify(value).withValue(withVal));
  };
  Pattern.prototype[name] = function (value) {
    return func(value, this);
  };
  return func;
}

// maps control alias names to the "main" control name
const controlAlias = new Map();

export function isControlName(name) {
  return controlAlias.has(name);
}

export function registerControl(names, ...aliases) {
  const name = Array.isArray(names) ? names[0] : names;
  let bag = {};
  bag[name] = createParam(names);
  controlAlias.set(name, name);
  aliases.forEach((alias) => {
    bag[alias] = bag[name];
    controlAlias.set(alias, name);
    Pattern.prototype[alias] = Pattern.prototype[name];
  });
  return bag;
}

export function registerMultiControl(names, maxControls, ...aliases) {
  names = Array.isArray(names) ? names : [names];
  let bag = {};
  for (let i = 1; i <= maxControls; i++) {
    let theseAliases = [...aliases];
    let theseNames = [...names];
    if (i === 1) {
      // adds e.g. fm1 as an alias for fm
      const aliases1 = theseAliases.map((a) => `${a}1`);
      const names1 = theseNames.map((n) => `${n}1`);
      theseAliases = theseAliases.concat(aliases1).concat(names1);
    } else {
      theseAliases = theseAliases.map((a) => `${a}${i}`);
      theseNames = theseNames.map((n) => `${n}${i}`);
    }
    const subBag = registerControl(theseNames, ...theseAliases);
    bag = { ...bag, ...subBag };
  }
  return bag;
}

/**
 * Select a sound / sample by name. When using mininotation, you can also optionally supply 'n' and 'gain' parameters
 * separated by ':'.
 *
 * @name s
 * @tags superdough, samples
 * @param {string | Pattern} sound The sound / pattern of sounds to pick
 * @synonyms sound
 * @example
 * s("bd hh")
 * @example
 * s("bd:0 bd:1 bd:0:0.3 bd:1:1.4")
 *
 */
export const { s, sound } = registerControl(['s', 'n', 'gain'], 'sound');

/**
 * Position in the wavetable of the wavetable oscillator
 *
 * @name wt
 * @tags wavetable, superdough
 * @param {number | Pattern} position Position in the wavetable from 0 to 1
 * @synonyms wavetablePosition
 * @example
 * s("squelch").bank("wt_digital").seg(8).note("F1").wt("0 0.25 0.5 0.75 1")
 */
export const { wt, wavetablePosition } = registerControl('wt', 'wavetablePosition');

/**
 * Amount of envelope applied wavetable oscillator's position envelope
 *
 * @name wtenv
 * @tags wavetable, envelope, superdough
 * @param {number | Pattern} amount between 0 and 1
 */
export const { wtenv } = registerControl('wtenv');
/**
 * Attack time of the wavetable oscillator's position envelope
 *
 * @name wtattack
 * @tags wavetable, envelope, superdough
 * @synonyms wtatt
 * @param {number | Pattern} time attack time in seconds
 */
export const { wtattack, wtatt } = registerControl('wtattack', 'wtatt');

/**
 * Decay time of the wavetable oscillator's position envelope
 *
 * @name wtdecay
 * @tags wavetable, envelope, superdough
 * @synonyms wtdec
 * @param {number | Pattern} time decay time in seconds
 */
export const { wtdecay, wtdec } = registerControl('wtdecay', 'wtdec');

/**
 * Sustain time of the wavetable oscillator's position envelope
 *
 * @name wtsustain
 * @tags wavetable, envelope, superdough
 * @synonyms wtsus
 * @param {number | Pattern} gain sustain level (0 to 1)
 */
export const { wtsustain, wtsus } = registerControl('wtsustain', 'wtsus');

/**
 * Release time of the wavetable oscillator's position envelope
 *
 * @name wtrelease
 * @tags wavetable, envelope, superdough
 * @synonyms wtrel
 * @param {number | Pattern} time release time in seconds
 */
export const { wtrelease, wtrel } = registerControl('wtrelease', 'wtrel');

/**
 * Rate of the LFO for the wavetable oscillator's position
 *
 * @name wtrate
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} rate rate in hertz
 */
export const { wtrate } = registerControl('wtrate');
/**
 * cycle synced rate of the LFO for the wavetable oscillator's position
 *
 * @name wtsync
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} rate rate in cycles
 */
export const { wtsync } = registerControl('wtsync');

/**
 * Depth of the LFO for the wavetable oscillator's position
 *
 * @name wtdepth
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} depth depth of modulation
 */
export const { wtdepth } = registerControl('wtdepth');

/**
 * Shape of the LFO for the wavetable oscillator's position
 *
 * @name wtshape
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} shape Shape of the lfo (0, 1, 2, ..)
 */
export const { wtshape } = registerControl('wtshape');

/**
 * DC offset of the LFO for the wavetable oscillator's position
 *
 * @name wtdc
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} dcoffset dc offset. set to 0 for unipolar
 */
export const { wtdc } = registerControl('wtdc');

/**
 * Skew of the LFO for the wavetable oscillator's position
 *
 * @name wtskew
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} skew How much to bend the LFO shape
 */
export const { wtskew } = registerControl('wtskew');

/**
 * Amount of warp (alteration of the waveform) to apply to the wavetable oscillator
 *
 * @name warp
 * @tags wavetable, superdough
 * @param {number | Pattern} amount Warp of the wavetable from 0 to 1
 * @synonyms wavetableWarp
 * @example
 * s("basique").bank("wt_digital").seg(8).note("F1").warp("0 0.25 0.5 0.75 1")
 *   .warpmode("spin")
 */
export const { warp, wavetableWarp } = registerControl('warp', 'wavetableWarp');

/**
 * Attack time of the wavetable oscillator's warp envelope
 *
 * @name warpattack
 * @tags wavetable, envelope, superdough
 * @synonyms warpatt
 * @param {number | Pattern} time attack time in seconds
 */
export const { warpattack, warpatt } = registerControl('warpattack', 'warpatt');

/**
 * Decay time of the wavetable oscillator's warp envelope
 *
 * @name warpdecay
 * @tags wavetable, envelope, superdough
 * @synonyms warpdec
 * @param {number | Pattern} time decay time in seconds
 */
export const { warpdecay, warpdec } = registerControl('warpdecay', 'warpdec');

/**
 * Sustain time of the wavetable oscillator's warp envelope
 *
 * @name warpsustain
 * @tags wavetable, envelope, superdough
 * @synonyms warpsus
 * @param {number | Pattern} gain sustain level (0 to 1)
 */
export const { warpsustain, warpsus } = registerControl('warpsustain', 'warpsus');

/**
 * Release time of the wavetable oscillator's warp envelope
 *
 * @name warprelease
 * @tags wavetable, envelope, superdough
 * @synonyms warprel
 * @param {number | Pattern} time release time in seconds
 */
export const { warprelease, warprel } = registerControl('warprelease', 'warprel');

/**
 * Rate of the LFO for the wavetable oscillator's warp
 *
 * @name warprate
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} rate rate in hertz
 */
export const { warprate } = registerControl('warprate');

/**
 * Depth of the LFO for the wavetable oscillator's warp
 *
 * @name warpdepth
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} depth depth of modulation
 */
export const { warpdepth } = registerControl('warpdepth');

/**
 * Shape of the LFO for the wavetable oscillator's warp
 *
 * @name warpshape
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} shape Shape of the lfo (0, 1, 2, ..)
 */
export const { warpshape } = registerControl('warpshape');

/**
 * DC offset of the LFO for the wavetable oscillator's warp
 *
 * @name warpdc
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} dcoffset dc offset. set to 0 for unipolar
 */
export const { warpdc } = registerControl('warpdc');

/**
 * Skew of the LFO for the wavetable oscillator's warp
 *
 * @name warpskew
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} skew How much to bend the LFO shape
 */
export const { warpskew } = registerControl('warpskew');

/**
 * Type of warp (alteration of the waveform) to apply to the wavetable oscillator.
 *
 * The current options are: none, asym, bendp, bendm, bendmp, sync, quant, fold, pwm, orbit,
 * spin, chaos, primes, binary, brownian, reciprocal, wormhole, logistic, sigmoid, fractal, flip
 *
 * @name warpmode
 * @tags wavetable, superdough
 * @param {number | string | Pattern} mode Warp mode
 * @synonyms wavetableWarpMode
 * @example
 * s("morgana").bank("wt_digital").seg(8).note("F1").warp("0 0.25 0.5 0.75 1")
 *   .warpmode("<asym bendp spin logistic sync wormhole brownian>*2")
 *
 */
export const { warpmode, wavetableWarpMode } = registerControl('warpmode', 'wavetableWarpMode');

/**
 * Amount of randomness of the initial phase of the wavetable oscillator.
 *
 * @name wtphaserand
 * @tags wavetable, superdough
 * @param {number | Pattern} amount Randomness of the initial phase. Between 0 (not random) and 1 (fully random)
 * @synonyms wavetablePhaseRand
 * @example
 * s("basique").bank("wt_digital").seg(16).wtphaserand("<0 1>")
 *
 */
export const { wtphaserand, wavetablePhaseRand } = registerControl('wtphaserand', 'wavetablePhaseRand');

/**
 * Amount of envelope applied wavetable oscillator's position envelope
 *
 * @name warpenv
 * @tags wavetable, envelope, superdough
 * @param {number | Pattern} amount between 0 and 1
 */
export const { warpenv } = registerControl('warpenv');

/**
 * cycle synced rate of the LFO for the wavetable warp position
 *
 * @name warpsync
 * @tags wavetable, lfo, superdough
 * @param {number | Pattern} rate rate in cycles
 */
export const { warpsync } = registerControl('warpsync');

/**
 * Define a custom webaudio node to use as a sound source.
 *
 * @name source
 * @tags external_io, superdough
 * @synonyms src
 * @param {function} getSource
 * @synonyms src
 *
 */
export const { source, src } = registerControl('source', 'src');
/**
 * Selects the given index:
 *  - for samples, it picks the sample by index, with wrap around
 *  - for scales, it picks the scale degree
 *  - for voicings, it picks the voice index
 *
 * @name n
 * @tags superdough, samples, tonal
 * @param {number | Pattern} value sample index starting from 0
 * @example
 * s("bd sd [~ bd] sd,hh*6").n("<0 1>")
 */
// also see https://codeberg.org/uzu/strudel/pulls/63
export const { n } = registerControl('n');

/**
 * Selects the given degree. Currently used in `xen` and `tune`:
 *
 * @name i
 * @tags tonal
 * @param {number | Pattern} value
 * @example
 * i("0 1 2 3 4 5 6 7").xen("<5edo 10edo 15edo hexany15>")
 */
export const { i } = registerControl('i');

/**
 * Plays the given note name or midi number. A note name consists of
 *
 * - a letter (a-g or A-G)
 * - optional accidentals (b or #)
 * - optional (possibly negative) octave number (0-9). Defaults to 3
 *
 * Examples of valid note names: `c`, `bb`, `Bb`, `f#`, `c3`, `A4`, `Eb2`, `c#5`
 *
 * You can also use midi numbers instead of note names, where 69 is mapped to A4 440Hz in 12EDO.
 *
 * @name note
 * @tags tonal
 * @example
 * note("c a f e")
 * @example
 * note("c4 a4 f4 e4")
 * @example
 * note("60 69 65 64")
 * @example
 * note("fbb1 a#0 cbbb-1 e##-2").sound("saw")
 */
export const { note } = registerControl(['note', 'n']);

/**
 * A pattern of numbers that speed up (or slow down) samples while they play. Currently only supported by osc / superdirt.
 *
 * @name accelerate
 * @tags samples, superdirt
 * @param {number | Pattern} amount acceleration.
 * @superdirtOnly
 * @example
 * s("sax").accelerate("<0 1 2 4 8 16>").slow(2).osc()
 *
 */
export const { accelerate } = registerControl('accelerate');
/**
 * Sets the velocity from 0 to 1. Is multiplied together with gain.
 *
 * @name velocity
 * @tags amplitude, superdough, supradough
 * @synonyms vel
 * @example
 * s("hh*8")
 * .gain(".4!2 1 .4!2 1 .4 1")
 * .velocity(".4 1")
 */
export const { velocity, vel } = registerControl('velocity', 'vel');
/**
 * Controls the gain by an exponential amount.
 *
 * @name gain
 * @tags amplitude, superdough, supradough
 * @param {number | Pattern} amount gain.
 * @example
 * s("hh*8").gain(".4!2 1 .4!2 1 .4 1").fast(2)
 *
 */
export const { gain } = registerControl('gain');
/**
 * Gain applied after all effects have been processed.
 *
 * @name postgain
 * @tags amplitude, superdough, supradough
 * @example
 * s("bd sd [~ bd] sd,hh*8")
 * .compressor("-20:20:10:.002:.02").postgain(1.5)
 *
 */
export const { postgain } = registerControl('postgain');
/**
 * Like `gain`, but linear.
 *
 * @name amp
 * @tags amplitude, superdirt
 * @param {number | Pattern} amount gain.
 * @superdirtOnly
 * @example
 * s("bd*8").amp(".1*2 .5 .1*2 .5 .1 .5").osc()
 *
 */
export const { amp } = registerControl('amp');

/**
 * Sets the Frequency Modulation Harmonicity Ratio.
 * Controls the timbre of the sound.
 * Whole numbers and simple ratios sound more natural,
 * while decimal numbers and complex ratios sound metallic.
 *
 * A number may be added afterwards to control the harmonicity of
 * any of the 8 individual FMs (e.g. `fmh2`)
 *
 * @name fmh
 * @tags fm, superdough, supradough
 * @param {number | Pattern} harmonicity
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmh("<1 2 1.5 1.61>")
 * ._scope()
 *
 */
export const { fmh, fmh1, fmh2, fmh3, fmh4, fmh5, fmh6, fmh7, fmh8 } = registerMultiControl(['fmh', 'fmi'], 8, 'fmh');

/**
 * Sets the Frequency Modulation of the synth.
 * Controls the modulation index, which defines the brightness of the sound.
 *
 * A number may be added afterwards to control the modulation index of
 * any of the 8 individual FMs (e.g. `fm3`). Also, FMs may be routed into
 * each other with matrix commands like `fm13`, which would send `fm1` back into
 * `fm3`
 *
 * @name fmi
 * @tags fm, superdough, supradough
 * @param {number | Pattern} brightness modulation index
 * @synonyms fm
 * @example
 * note("c e g b g e")
 * .fm("<0 1 2 8 32>")
 * ._scope()
 * @example
 * s("sine").note("F1").seg(8)
 *  .fm(4).fm2(rand.mul(4)).fm3(saw.mul(8).slow(8))
 *  .fmh(1.06).fmh2(10).fmh3(0.1)
 *
 */
export const { fmi, fmi1, fmi2, fmi3, fmi4, fmi5, fmi6, fmi7, fmi8, fm, fm1, fm2, fm3, fm4, fm5, fm6, fm7, fm8 } =
  registerMultiControl(['fmi', 'fmh'], 8, 'fm');

// fm envelope
/**
 * Ramp type of fm envelope. Exp might be a bit broken..
 *
 * A number may be added afterwards to control the envelope of
 * any of the 8 individual FMs (e.g. `fmenv4`)
 *
 * @name fmenv
 * @tags fm, envelope, superdough, supradough
 * @param {number | Pattern} type lin | exp
 * @synonyms fme
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmdecay(.2)
 * .fmsustain(0)
 * .fmenv("<exp lin>")
 * ._scope()
 *
 */
export const { fmenv, fmenv1, fmenv2, fmenv3, fmenv4, fmenv5, fmenv6, fmenv7, fmenv8, fme } = registerMultiControl(
  'fmenv',
  8,
  'fme',
);

/**
 * Attack time for the FM envelope: time it takes to reach maximum modulation
 *
 * A number may be added afterwards to control the attack of the envelope of
 * any of the 8 individual FMs (e.g. `fmatt5`)
 *
 * @name fmattack
 * @tags fm, envelope, superdough, supradough
 * @synonyms fmatt
 * @param {number | Pattern} time attack time
 * @synonyms fmatt
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmattack("<0 .05 .1 .2>")
 * ._scope()
 *
 */
export const {
  fmattack,
  fmattack1,
  fmattack2,
  fmattack3,
  fmattack4,
  fmattack5,
  fmattack6,
  fmattack7,
  fmattack8,
  fmatt,
  fmatt1,
  fmatt2,
  fmatt3,
  fmatt4,
  fmatt5,
  fmatt6,
  fmatt7,
  fmatt8,
} = registerMultiControl('fmattack', 8, 'fmatt');

/**
 * Waveform of the fm modulator
 *
 * A number may be added afterwards to control the waveform
 * any of the 8 individual FMs (e.g. `fmwave6`)
 *
 * @name fmwave
 * @tags fm, superdough, supradough
 * @param {number | Pattern} wave waveform
 * @example
 * n("0 1 2 3".fast(4)).scale("d:minor").s("sine").fmwave("<sine square sawtooth crackle>").fm(4).fmh(2.01)
 * @example
 * n("0 1 2 3".fast(4)).chord("<Dm Am F G>").voicing().s("sawtooth").fmwave("brown").fm(.6)
 *
 */
export const { fmwave, fmwave1, fmwave2, fmwave3, fmwave4, fmwave5, fmwave6, fmwave7, fmwave8 } = registerMultiControl(
  'fmwave',
  8,
);

/**
 * Decay time for the FM envelope: seconds until the sustain level is reached after the attack phase.
 *
 * A number may be added afterwards to control the decay of the envelope of
 * any of the 8 individual FMs (e.g. `fmdec6`)
 *
 * @name fmdecay
 * @tags fm, envelope, superdough, supradough
 * @synonyms fmdec
 * @param {number | Pattern} time decay time
 * @synonyms fmdec
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmdecay("<.01 .05 .1 .2>")
 * .fmsustain(.4)
 * ._scope()
 *
 */
export const {
  fmdecay,
  fmdecay1,
  fmdecay2,
  fmdecay3,
  fmdecay4,
  fmdecay5,
  fmdecay6,
  fmdecay7,
  fmdecay8,
  fmdec,
  fmdec1,
  fmdec2,
  fmdec3,
  fmdec4,
  fmdec5,
  fmdec6,
  fmdec7,
  fmdec8,
} = registerMultiControl('fmdecay', 8, 'fmdec');

/**
 * Sustain level for the FM envelope: how much modulation is applied after the decay phase
 *
 * A number may be added afterwards to control the sustain of the envelope of
 * any of the 8 individual FMs (e.g. `fmsus7`)
 *
 * @name fmsustain
 * @tags fm, envelope, superdough, supradough
 * @synonyms fmsus
 * @param {number | Pattern} level sustain level
 * @synonyms fmsus
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmdecay(.1)
 * .fmsustain("<1 .75 .5 0>")
 * ._scope()
 *
 */
export const {
  fmsustain,
  fmsustain1,
  fmsustain2,
  fmsustain3,
  fmsustain4,
  fmsustain5,
  fmsustain6,
  fmsustain7,
  fmsustain8,
  fmsus,
  fmsus1,
  fmsus2,
  fmsus3,
  fmsus4,
  fmsus5,
  fmsus6,
  fmsus7,
  fmsus8,
} = registerMultiControl('fmsustain', 8, 'fmsus');

/**
 * Release time for the FM envelope: how much modulation is applied after the note is released
 *
 * A number may be added afterwards to control the release of the envelope of
 * any of the 8 individual FMs (e.g. `fmrel8`)
 *
 * @name fmrelease
 * @tags fm, envelope, superdough, supradough
 * @synonyms fmrel
 * @param {number | Pattern} time release time
 *
 */
export const {
  fmrelease,
  fmrelease1,
  fmrelease2,
  fmrelease3,
  fmrelease4,
  fmrelease5,
  fmrelease6,
  fmrelease7,
  fmrelease8,
  fmrel,
  fmrel1,
  fmrel2,
  fmrel3,
  fmrel4,
  fmrel5,
  fmrel6,
  fmrel7,
  fmrel8,
} = registerMultiControl('fmrelease', 8, 'fmrel');

// FM Matrix
// Note: we do not declare top-level exports here since it would add
// ~162 more explicit exports. This is likely fine as the most common use-case would be to at least
// declare one other FM prior to utilizing the matrix functionality, but if we ever decide we need it,
// TODO to add it explicitly / go with the globalThis approach
for (let i = 0; i <= 8; i++) {
  for (let j = 0; j <= 8; j++) {
    registerControl(`fmi${i}${j}`, `fm${i}${j}`);
  }
}

/**
 * Select the sound bank to use. To be used together with `s`. The bank name (+ "_") will be prepended to the value of `s`.
 *
 * @name bank
 * @tags samples, superdough
 * @param {string | Pattern} bank the name of the bank
 * @example
 * s("bd sd [~ bd] sd").bank('RolandTR909') // = s("RolandTR909_bd RolandTR909_sd")
 *
 */
export const { bank } = registerControl('bank');

/**
 * mix control for the chorus effect
 *
 * @name chorus
 * @tags pitch
 * @param {string | Pattern} chorus mix amount between 0 and 1
 * @example
 * note("d d a# a").s("sawtooth").chorus(.5)
 *
 */
export const { chorus } = registerControl('chorus');

// analyser node send amount 0 - 1 (used by scope)
export const { analyze } = registerControl('analyze');
// fftSize of analyser
export const { fft } = registerControl('fft');

/**
 * Amplitude envelope attack time: Specifies how long it takes for the sound to reach its peak value, relative to the onset.
 *
 * @name attack
 * @tags amplitude, envelope, superdough, supradough
 * @param {number | Pattern} attack time in seconds.
 * @synonyms att
 * @example
 * note("c3 e3 f3 g3").attack("<0 .1 .5>")
 *
 */
export const { attack, att } = registerControl('attack', 'att');

/**
 * Amplitude envelope decay time: the time it takes after the attack time to reach the sustain level.
 * Note that the decay is only audible if the sustain value is lower than 1.
 *
 * @name decay
 * @tags amplitude, envelope, superdough, supradough
 * @param {number | Pattern} time decay time in seconds
 * @synonyms dec
 * @example
 * note("c3 e3 f3 g3").decay("<.1 .2 .3 .4>").sustain(0)
 *
 */
export const { decay, dec } = registerControl('decay', 'dec');
/**
 * Amplitude envelope sustain level: The level which is reached after attack / decay, being sustained until the offset.
 *
 * @name sustain
 * @tags amplitude, envelope, superdough, supradough
 * @param {number | Pattern} gain sustain level between 0 and 1
 * @synonyms sus
 * @example
 * note("c3 e3 f3 g3").decay(.2).sustain("<0 .1 .4 .6 1>")
 *
 */
export const { sustain, sus } = registerControl('sustain', 'sus');
/**
 * Amplitude envelope release time: The time it takes after the offset to go from sustain level to zero.
 *
 * @name release
 * @tags amplitude, envelope, superdough, supradough
 * @param {number | Pattern} time release time in seconds
 * @synonyms rel
 * @example
 * note("c3 e3 g3 c4").release("<0 .1 .4 .6 1>/2")
 *
 */
export const { release, rel } = registerControl('release', 'rel');
export const { hold } = registerControl('hold');
// TODO: in tidal, it seems to be normalized
/**
 * Sets the center frequency of the **b**and-**p**ass **f**ilter. When using mininotation, you
 * can also optionally supply the 'bpq' parameter separated by ':'.
 *
 * @name bpf
 * @tags filter, superdough, supradough
 * @param {number | Pattern} frequency center frequency
 * @synonyms bandf, bp
 * @example
 * s("bd sd [~ bd] sd,hh*6").bpf("<1000 2000 4000 8000>")
 *
 */
export const { bandf, bpf, bp } = registerControl(['bandf', 'bandq', 'bpenv'], 'bpf', 'bp');
// TODO: in tidal, it seems to be normalized
/**
 * Sets the **b**and-**p**ass **q**-factor (resonance).
 *
 * @name bpq
 * @tags filter, superdough, supradough
 * @param {number | Pattern} q q factor
 * @synonyms bandq
 * @example
 * s("bd sd [~ bd] sd").bpf(500).bpq("<0 1 2 3>")
 *
 */
// currently an alias of 'bandq' https://codeberg.org/uzu/strudel/issues/496
// ['bpq'],
export const { bandq, bpq } = registerControl('bandq', 'bpq');
/**
 * A pattern of numbers from 0 to 1. Skips the beginning of each sample, e.g. `0.25` to cut off the first quarter from each sample.
 *
 * @name begin
 * @tags samples
 * @param {number | Pattern} amount between 0 and 1, where 1 is the length of the sample
 * @example
 * samples({ rave: 'rave/AREUREADY.wav' }, 'github:tidalcycles/dirt-samples')
 * s("rave").begin("<0 .25 .5 .75>").fast(2)
 *
 */
export const { begin } = registerControl('begin');
/**
 * The same as .begin, but cuts off the end off each sample.
 *
 * @memberof Pattern
 * @name end
 * @tags samples
 * @param {number | Pattern} length 1 = whole sample, .5 = half sample, .25 = quarter sample etc..
 * @example
 * s("bd*2,oh*4").end("<.1 .2 .5 1>").fast(2)
 *
 */
export const { end } = registerControl('end');
/**
 * Loops the sample.
 * Note that the tempo of the loop is not synced with the cycle tempo.
 * To change the loop region, use loopBegin / loopEnd.
 *
 * @name loop
 * @tags samples
 * @param {number | Pattern} on If 1, the sample is looped
 * @example
 * s("casio").loop(1)
 *
 */
export const { loop } = registerControl('loop');
/**
 * Begin to loop at a specific point in the sample (inbetween `begin` and `end`).
 * Note that the loop point must be inbetween `begin` and `end`, and before `loopEnd`!
 * Note: Samples starting with wt_ will automatically loop! (wt = wavetable)
 *
 * @name loopBegin
 * @tags samples
 * @param {number | Pattern} time between 0 and 1, where 1 is the length of the sample
 * @synonyms loopb
 * @example
 * s("space").loop(1)
 * .loopBegin("<0 .125 .25>")._scope()
 */
export const { loopBegin, loopb } = registerControl('loopBegin', 'loopb');
/**
 *
 * End the looping section at a specific point in the sample (inbetween `begin` and `end`).
 * Note that the loop point must be inbetween `begin` and `end`, and after `loopBegin`!
 *
 * @name loopEnd
 * @tags samples
 * @param {number | Pattern} time between 0 and 1, where 1 is the length of the sample
 * @synonyms loope
 * @example
 * s("space").loop(1)
 * .loopEnd("<1 .75 .5 .25>")._scope()
 */
export const { loopEnd, loope } = registerControl('loopEnd', 'loope');
/**
 * Bit crusher effect.
 *
 * @name crush
 * @tags superdough, supradough
 * @param {number | Pattern} depth between 1 (for drastic reduction in bit-depth) to 16 (for barely no reduction).
 * @example
 * s("<bd sd>,hh*3").fast(2).crush("<16 8 7 6 5 4 3 2>")
 *
 */
// ['clhatdecay'],
export const { crush } = registerControl('crush');
/**
 * Fake-resampling for lowering the sample rate. Caution: This effect seems to only work in chromium based browsers
 *
 * @name coarse
 * @tags superdough, supradough
 * @param {number | Pattern} factor 1 for original 2 for half, 3 for a third and so on.
 * @example
 * s("bd sd [~ bd] sd,hh*8").coarse("<1 4 8 16 32>")
 *
 */
export const { coarse } = registerControl('coarse');

/**
 * Modulate the amplitude of a sound with a continuous waveform
 *
 * @name tremolo
 * @tags amplitude, lfo, superdough
 * @synonyms trem
 * @param {number | Pattern} speed modulation speed in HZ
 * @example
 * note("d d d# d".fast(4)).s("supersaw").tremolo("<3 2 100> ").tremoloskew("<.5>")
 *
 */
export const { tremolo, trem } = registerControl(['tremolo', 'tremolodepth', 'tremoloskew', 'tremolophase'], 'trem');

/**
 * Modulate the amplitude of a sound with a continuous waveform
 *
 * @name tremolosync
 * @tags amplitude, lfo, superdough
 * @synonyms tremsync
 * @param {number | Pattern} cycles modulation speed in cycles
 * @example
 * note("d d d# d".fast(4)).s("supersaw").tremolosync("4").tremoloskew("<1 .5 0>")
 *
 */
export const { tremolosync } = registerControl(
  ['tremolosync', 'tremolodepth', 'tremoloskew', 'tremolophase'],
  'tremsync',
);

/**
 * Depth of amplitude modulation
 *
 * @name tremolodepth
 * @tags amplitude, lfo, superdough
 * @synonyms tremdepth
 * @param {number | Pattern} depth
 * @example
 * note("a1 a1 a#1 a1".fast(4)).s("pulse").tremsync(4).tremolodepth("<1 2 .7>")
 *
 */
export const { tremolodepth } = registerControl('tremolodepth', 'tremdepth');
/**
 * Alter the shape of the modulation waveform
 *
 * @name tremoloskew
 * @tags amplitude, lfo, superdough
 * @synonyms tremskew
 * @param {number | Pattern} amount between 0 & 1, the shape of the waveform
 * @example
 * note("{f a c e}%16").s("sawtooth").tremsync(4).tremoloskew("<.5 0 1>")
 *
 */
export const { tremoloskew } = registerControl('tremoloskew', 'tremskew');

/**
 * Alter the phase of the modulation waveform
 *
 * @name tremolophase
 * @tags amplitude, lfo, superdough
 * @synonyms tremphase
 * @param {number | Pattern} offset the offset in cycles of the modulation
 * @example
 * note("{f a c e}%16").s("sawtooth").tremsync(4).tremolophase("<0 .25 .66>")
 *
 */
export const { tremolophase } = registerControl('tremolophase', 'tremphase');

/**
 * Shape of amplitude modulation
 *
 * @name tremoloshape
 * @tags amplitude, lfo, superdough
 * @synonyms tremshape
 * @param {number | Pattern} shape tri | square | sine | saw | ramp
 * @example
 * note("{f g c d}%16").tremsync(4).tremoloshape("<sine tri square>").s("sawtooth")
 *
 */
export const { tremoloshape } = registerControl('tremoloshape', 'tremshape');
/**
 * Filter overdrive for supported filter types
 *
 * @name drive
 * @tags filter, superdough
 * @param {number | Pattern} amount
 * @example
 * note("{f g g c d a a#}%16".sub(17)).s("supersaw").lpenv(8).lpf(150).lpq(.8).ftype('ladder').drive("<.5 4>")
 *
 */
export const { drive } = registerControl('drive');

/**
 * Modulate the amplitude of an orbit to create a "sidechain" like effect.
 *
 * Can be applied to multiple orbits with the ':' mininotation, e.g. `duckorbit("2:3")`
 *
 * @name duckorbit
 * @tags amplitude, orbit, superdough
 * @synonyms duck
 * @param {number | Pattern} orbit target orbit
 * @example
 * $: n(run(16)).scale("c:minor:pentatonic").s("sawtooth").delay(.7).orbit(2)
 * $: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit(2).duckattack(0.2).duckdepth(1)
 * @example
 * $: n(run(16)).scale("c:minor:pentatonic").s("sawtooth").delay(.7).orbit(2)
 * $: s("hh*16").orbit(3)
 * $: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit("2:3").duckattack(0.2).duckdepth(1)
 *
 */
export const { duck } = registerControl('duckorbit', 'duck');

/**
 * The amount of ducking applied to target orbit
 *
 * Can vary across orbits with the ':' mininotation, e.g. `duckdepth("0.3:0.1")`.
 * Note: this requires first applying the effect to multiple orbits with e.g. `duckorbit("2:3")`.
 *
 * @name duckdepth
 * @tags amplitude, orbit, superdough
 * @param {number | Pattern} depth depth of modulation from 0 to 1
 * @example
 * stack( n(run(8)).scale("c:minor").s("sawtooth").delay(.7).orbit(2), s("bd:4!4").beat("0,4,8,11,14",16).duckorbit(2).duckattack(0.2).duckdepth("<1 .9 .6 0>"))
 * @example
 * $: n(run(16)).scale("c:minor:pentatonic").s("sawtooth").delay(.7).orbit(2)
 * $: s("hh*16").orbit(3)
 * $: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit("2:3").duckattack(0.2).duckdepth("1:0.5")
 *
 */
export const { duckdepth } = registerControl('duckdepth');

/**
 * The time required for the ducked signal(s) to reach their lowest volume.
 * Can be used to prevent clicking or for creative rhythmic effects.
 *
 * Can vary across orbits with the ':' mininotation, e.g. `duckonset("0:0.003")`.
 * Note: this requires first applying the effect to multiple orbits with e.g. `duckorbit("2:3")`.
 *
 * @name duckonset
 * @tags amplitude, envelope, orbit, superdough
 * @synonyms duckons
 *
 * @param {number | Pattern} time The onset time in seconds
 * @example
 * // Clicks
 * sound: freq("63.2388").s("sine").orbit(2).gain(4)
 * duckerWithClick: s("bd*4").duckorbit(2).duckattack(0.3).duckonset(0).postgain(0)
 * @example
 * // No clicks
 * sound: freq("63.2388").s("sine").orbit(2).gain(4)
 * duckerWithoutClick: s("bd*4").duckorbit(2).duckattack(0.3).duckonset(0.01).postgain(0)
 * @example
 * // Rhythmic
 * noise: s("pink").distort("2:1").orbit(4) // used rhythmically with 0.3 onset below
 * hhat: s("hh*16").orbit(7)
 * ducker: s("bd*4").bank("tr909").duckorbit("4:7").duckonset("0.3:0.003").duckattack(0.25)
 *
 */
export const { duckonset } = registerControl('duckonset', 'duckons');

/**
 * The time required for the ducked signal(s) to return to their normal volume.
 *
 * Can vary across orbits with the ':' mininotation, e.g. `duckonset("0:0.003")`.
 * Note: this requires first applying the effect to multiple orbits with e.g. `duckorbit("2:3")`.
 *
 * @name duckattack
 * @tags amplitude, envelope, orbit, superdough
 * @synonyms duckatt, datt
 *
 * @param {number | Pattern} time The attack time in seconds
 * @example
 * sound: n(run(8)).scale("c:minor").s("sawtooth").delay(.7).orbit(2)
 * ducker: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit(2).duckattack("<0.2 0 0.4>").duckdepth(1)
 * @example
 * moreduck: n(run(8)).scale("c:minor").s("sawtooth").delay(.7).orbit(2)
 * lessduck: s("hh*16").orbit(5)
 * ducker: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit("2:5").duckattack("0.4:0.1")
 *
 */
export const { duckattack } = registerControl('duckattack', 'duckatt', 'datt');

/**
 * Create byte beats with custom expressions
 *
 * @name byteBeatExpression
 * @synonyms bbexpr, bb
 * @tags superdough
 *
 * @param {number | Pattern} byteBeatExpression bitwise expression for creating bytebeat
 * @example
 * s("bytebeat").bbexpr('t*(t>>15^t>>66)')
 *
 */
export const { byteBeatExpression, bbexpr } = registerControl('byteBeatExpression', 'bbexpr', 'bb');

/**
 * Create byte beats with custom expressions
 *
 * @name byteBeatStartTime
 * @synonyms bbst
 * @tags superdough
 *
 * @param {number | Pattern} byteBeatStartTime in samples (t)
 * @example
 * note("c3!8".add("{0 0 12 0 7 5 3}%8")).s("bytebeat:5").bbst("<3 1>".mul(10000))._scope()
 *
 */
export const { byteBeatStartTime, bbst } = registerControl('byteBeatStartTime', 'bbst');

/**
 * Allows you to set the output channels on the interface
 *
 * @name channels
 * @tags external_io, superdough
 * @synonyms ch
 *
 * @param {number | Pattern} channels pattern the output channels
 * @example
 * note("e a d b g").channels("3:4")
 *
 */
export const { channels, ch } = registerControl('channels', 'ch');

/**
 * Controls the pulsewidth of the pulse oscillator
 *
 * @name pw
 * @tags superdough
 * @param {number | Pattern} pulsewidth
 * @example
 * note("{f a c e}%16").s("pulse").pw(".8:1:.2")
 * @example
 * n(run(8)).scale("D:pentatonic").s("pulse").pw("0 .75 .5 1")
 */
export const { pw } = registerControl(['pw', 'pwrate', 'pwsweep']);

/**
 * Controls the lfo rate for the pulsewidth of the pulse oscillator
 *
 * @name pwrate
 * @synonyms pwr
 * @tags superdough, lfo
 * @param {number | Pattern} rate
 * @example
 * n(run(8)).scale("D:pentatonic").s("pulse").pw("0.5").pwrate("<5 .1 25>").pwsweep("<0.3 .8>")

 *
 */
export const { pwrate } = registerControl('pwrate', 'pwr');

/**
 * Controls the lfo sweep for the pulsewidth of the pulse oscillator
 *
 * @name pwsweep
 * @synonyms pws
 * @tags superdough, lfo
 * @param {number | Pattern} sweep
 * @example
 * n(run(8)).scale("D:pentatonic").s("pulse").pw("0.5").pwrate("<5 .1 25>").pwsweep("<0.3 .8>")
 *
 */
export const { pwsweep } = registerControl('pwsweep', 'pws');

/**
 * Phaser audio effect that approximates popular guitar pedals.
 *
 * @name phaser
 * @tags superdough
 * @synonyms ph
 * @param {number | Pattern} speed speed of modulation
 * @example
 * n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
 * .phaser("<1 2 4 8>")
 *
 */
export const { phaserrate, ph, phaser } = registerControl(
  ['phaserrate', 'phaserdepth', 'phasercenter', 'phasersweep'],
  'ph',
  'phaser',
);

/**
 * The frequency sweep range of the lfo for the phaser effect. Defaults to 2000
 *
 * @name phasersweep
 * @tags superdough, lfo
 * @synonyms phs
 * @param {number | Pattern} phasersweep most useful values are between 0 and 4000
 * @example
 * n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
 * .phaser(2).phasersweep("<800 2000 4000>")
 *
 */
export const { phasersweep, phs } = registerControl('phasersweep', 'phs');

/**
 * The center frequency of the phaser in HZ. Defaults to 1000
 *
 * @name phasercenter
 * @tags superdough
 * @synonyms phc
 * @param {number | Pattern} centerfrequency in HZ
 * @example
 * n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
 * .phaser(2).phasercenter("<800 2000 4000>")
 *
 */

export const { phasercenter, phc } = registerControl('phasercenter', 'phc');

/**
 * The amount the signal is affected by the phaser effect. Defaults to 0.75
 *
 * @name phaserdepth
 * @tags superdough, superdirt
 * @synonyms phd, phasdp
 * @param {number | Pattern} depth number between 0 and 1
 * @example
 * n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
 * .phaser(2).phaserdepth("<0 .5 .75 1>")
 *
 */
// also a superdirt control
export const { phaserdepth, phd, phasdp } = registerControl('phaserdepth', 'phd', 'phasdp');

/**
 * Choose the channel the pattern is sent to
 *
 * @name channel
 * @tags superdough
 * @param {number | Pattern} channel channel number
 *
 */
export const { channel } = registerControl('channel');
/**
 * In the style of classic drum-machines, `cut` will stop a playing sample as soon as another samples with in same cutgroup is to be played. An example would be an open hi-hat followed by a closed one, essentially muting the open.
 *
 * @name cut
 * @tags superdough
 * @param {number | Pattern} group cut group number
 * @example
 * s("[oh hh]*4").cut(1)
 *
 */
export const { cut } = registerControl('cut');
/**
 * Applies the cutoff frequency of the **l**ow-**p**ass **f**ilter.
 *
 * When using mininotation, you can also optionally add the 'lpq' parameter, separated by ':'.
 *
 * @name lpf
 * @tags filter, superdough, supradough
 * @param {number | Pattern} frequency audible between 0 and 20000
 * @synonyms cutoff, ctf, lp
 * @example
 * s("bd sd [~ bd] sd,hh*6").lpf("<4000 2000 1000 500 200 100>")
 * @example
 * s("bd*16").lpf("1000:0 1000:10 1000:20 1000:30")
 *
 */
export const { cutoff, ctf, lpf, lp } = registerControl(['cutoff', 'resonance', 'lpenv'], 'ctf', 'lpf', 'lp');

/**
 * Sets the lowpass filter envelope modulation depth.
 * @name lpenv
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} modulation depth of the lowpass filter envelope between 0 and _n_
 * @synonyms lpe
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .lpf(300)
 * .lpa(.5)
 * .lpenv("<4 2 1 0 -1 -2 -4>/4")
 */
export const { lpenv, lpe } = registerControl('lpenv', 'lpe');
/**
 * Sets the highpass filter envelope modulation depth.
 * @name hpenv
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} modulation depth of the highpass filter envelope between 0 and _n_
 * @synonyms hpe
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .hpf(500)
 * .hpa(.5)
 * .hpenv("<4 2 1 0 -1 -2 -4>/4")
 */
export const { hpenv, hpe } = registerControl('hpenv', 'hpe');
/**
 * Sets the bandpass filter envelope modulation depth.
 * @name bpenv
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} modulation depth of the bandpass filter envelope between 0 and _n_
 * @synonyms bpe
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .bpf(500)
 * .bpa(.5)
 * .bpenv("<4 2 1 0 -1 -2 -4>/4")
 */
export const { bpenv, bpe } = registerControl('bpenv', 'bpe');
/**
 * Sets the attack duration for the lowpass filter envelope.
 * @name lpattack
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} attack time of the filter envelope
 * @synonyms lpa
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .lpf(300)
 * .lpa("<.5 .25 .1 .01>/4")
 * .lpenv(4)
 */
export const { lpattack, lpa } = registerControl('lpattack', 'lpa');
/**
 * Sets the attack duration for the highpass filter envelope.
 * @name hpattack
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} attack time of the highpass filter envelope
 * @synonyms hpa
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .hpf(500)
 * .hpa("<.5 .25 .1 .01>/4")
 * .hpenv(4)
 */
export const { hpattack, hpa } = registerControl('hpattack', 'hpa');
/**
 * Sets the attack duration for the bandpass filter envelope.
 * @name bpattack
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} attack time of the bandpass filter envelope
 * @synonyms bpa
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .bpf(500)
 * .bpa("<.5 .25 .1 .01>/4")
 * .bpenv(4)
 */
export const { bpattack, bpa } = registerControl('bpattack', 'bpa');
/**
 * Sets the decay duration for the lowpass filter envelope.
 * @name lpdecay
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} decay time of the filter envelope
 * @synonyms lpd
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .lpf(300)
 * .lpd("<.5 .25 .1 0>/4")
 * .lpenv(4)
 */
export const { lpdecay, lpd } = registerControl('lpdecay', 'lpd');
/**
 * Sets the decay duration for the highpass filter envelope.
 * @name hpdecay
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} decay time of the highpass filter envelope
 * @synonyms hpd
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .hpf(500)
 * .hpd("<.5 .25 .1 0>/4")
 * .hps(0.2)
 * .hpenv(4)
 */
export const { hpdecay, hpd } = registerControl('hpdecay', 'hpd');
/**
 * Sets the decay duration for the bandpass filter envelope.
 * @name bpdecay
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} decay time of the bandpass filter envelope
 * @synonyms bpd
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .bpf(500)
 * .bpd("<.5 .25 .1 0>/4")
 * .bps(0.2)
 * .bpenv(4)
 */
export const { bpdecay, bpd } = registerControl('bpdecay', 'bpd');
/**
 * Sets the sustain amplitude for the lowpass filter envelope.
 * @name lpsustain
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} sustain amplitude of the lowpass filter envelope
 * @synonyms lps
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .lpf(300)
 * .lpd(.5)
 * .lps("<0 .25 .5 1>/4")
 * .lpenv(4)
 */
export const { lpsustain, lps } = registerControl('lpsustain', 'lps');
/**
 * Sets the sustain amplitude for the highpass filter envelope.
 * @name hpsustain
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} sustain amplitude of the highpass filter envelope
 * @synonyms hps
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .hpf(500)
 * .hpd(.5)
 * .hps("<0 .25 .5 1>/4")
 * .hpenv(4)
 */
export const { hpsustain, hps } = registerControl('hpsustain', 'hps');
/**
 * Sets the sustain amplitude for the bandpass filter envelope.
 * @name bpsustain
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} sustain amplitude of the bandpass filter envelope
 * @synonyms bps
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .bpf(500)
 * .bpd(.5)
 * .bps("<0 .25 .5 1>/4")
 * .bpenv(4)
 */
export const { bpsustain, bps } = registerControl('bpsustain', 'bps');
/**
 * Sets the release time for the lowpass filter envelope.
 * @name lprelease
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} release time of the filter envelope
 * @synonyms lpr
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .clip(.5)
 * .lpf(300)
 * .lpenv(4)
 * .lpr("<.5 .25 .1 0>/4")
 * .release(.5)
 */
export const { lprelease, lpr } = registerControl('lprelease', 'lpr');
/**
 * Sets the release time for the highpass filter envelope.
 * @name hprelease
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} release time of the highpass filter envelope
 * @synonyms hpr
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .clip(.5)
 * .hpf(500)
 * .hpenv(4)
 * .hpr("<.5 .25 .1 0>/4")
 * .release(.5)
 */
export const { hprelease, hpr } = registerControl('hprelease', 'hpr');
/**
 * Sets the release time for the bandpass filter envelope.
 * @name bprelease
 * @tags filter, envelope, superdough, supradough
 * @param {number | Pattern} release time of the bandpass filter envelope
 * @synonyms bpr
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .clip(.5)
 * .bpf(500)
 * .bpenv(4)
 * .bpr("<.5 .25 .1 0>/4")
 * .release(.5)
 */
export const { bprelease, bpr } = registerControl('bprelease', 'bpr');
/**
 * Sets the filter type. The ladder filter is more aggressive. More types might be added in the future.
 * @name ftype
 * @tags filter, superdough
 * @param {number | Pattern} type 12db (0), ladder (1), or 24db (2)
 * @example
 * note("{f g g c d a a#}%8").s("sawtooth").lpenv(4).lpf(500).ftype("<0 1 2>").lpq(1)
 * @example
 * note("c f g g a c d4").fast(2)
 * .sound('sawtooth')
 * .lpf(200).fanchor(0)
 * .lpenv(3).lpq(1)
 * .ftype("<ladder 12db 24db>")
 */
export const { ftype } = registerControl('ftype');

/**
 * controls the center of the filter envelope. 0 is unipolar positive, .5 is bipolar, 1 is unipolar negative
 * @name fanchor
 * @tags filter, envelope, superdough
 * @param {number | Pattern} center 0 to 1
 * @example
 * note("{f g g c d a a#}%8").s("sawtooth").lpf("{1000}%2")
 * .lpenv(8).fanchor("<0 .5 1>")
 */
export const { fanchor } = registerControl('fanchor');
/**
 * Applies the cutoff frequency of the **h**igh-**p**ass **f**ilter.
 *
 * When using mininotation, you can also optionally add the 'hpq' parameter, separated by ':'.
 *
 * @name hpf
 * @tags filter, superdough, supradough
 * @param {number | Pattern} frequency audible between 0 and 20000
 * @synonyms hp, hcutoff
 * @example
 * s("bd sd [~ bd] sd,hh*8").hpf("<4000 2000 1000 500 200 100>")
 * @example
 * s("bd sd [~ bd] sd,hh*8").hpf("<2000 2000:25>")
 *
 */
// currently an alias of 'hcutoff' https://codeberg.org/uzu/strudel/issues/496
// ['hpf'],

/**
 * Rate of the LFO for the lowpass filter
 *
 * @name lprate
 * @tags filter, lfo, superdough
 * @param {number | Pattern} rate rate in hertz
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lprate("<4 8 2 1>")
 */
export const { lprate } = registerControl('lprate');

/**
 * Cycle-synced rate of the LFO for the lowpass filter
 *
 * @name lpsync
 * @tags filter, lfo, superdough
 * @param {number | Pattern} rate rate in cycles
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lpsync("<4 8 2 1>")
 */
export const { lpsync } = registerControl('lpsync');

/**
 * Depth of the LFO for the lowpass filter
 *
 * @name lpdepth
 * @tags filter, lfo, superdough
 * @param {number | Pattern} depth depth of modulation
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lpdepth("<1 .5 1.8 0>")
 */

export const { lpdepth } = registerControl('lpdepth');
/**
 * Depth of the LFO for the lowpass filter, in HZ
 *
 * @name lpdepthfrequency
 * @tags filter, lfo, superdough
 * @synonyms lpdepthfreq
 * @param {number | Pattern} depth depth of modulation
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lpdepthfrequency("<200 500 100 0>")
 */

export const { lpdepthfrequency, lpdepthfreq } = registerControl('lpdepthfrequency', 'lpdepthfreq');

/**
 * Shape of the LFO for the lowpass filter
 *
 * @name lpshape
 * @tags filter, lfo, superdough
 * @param {number | Pattern} shape Shape of the lfo (0, 1, 2, ..)
 */
export const { lpshape } = registerControl('lpshape');

/**
 * DC offset of the LFO for the lowpass filter
 *
 * @name lpdc
 * @tags filter, lfo, superdough
 * @param {number | Pattern} dcoffset dc offset. set to 0 for unipolar
 */
export const { lpdc } = registerControl('lpdc');

/**
 * Skew of the LFO for the lowpass filter
 *
 * @name lpskew
 * @tags filter, lfo, superdough
 * @param {number | Pattern} skew How much to bend the LFO shape
 */
export const { lpskew } = registerControl('lpskew');

/**
 * Rate of the LFO for the bandpass filter
 *
 * @name bprate
 * @tags filter, lfo, superdough
 * @param {number | Pattern} rate rate in hertz
 */
export const { bprate } = registerControl('bprate');

/**
 * Cycle-synced rate of the LFO for the bandpass filter
 *
 * @name bpsync
 * @tags filter, lfo, superdough
 * @param {number | Pattern} rate rate in cycles
 */
export const { bpsync } = registerControl('bpsync');

/**
 * Depth of the LFO for the bandpass filter
 *
 * @name bpdepth
 * @tags filter, lfo, superdough
 * @param {number | Pattern} depth depth of modulation
 */
export const { bpdepth } = registerControl('bpdepth');

/**
 * Depth of the LFO for the bandpass filter, in HZ
 *
 * @name bpdepthfrequency
 * @tags filter, lfo, superdough
 * @synonyms bpdepthfreq
 * @param {number | Pattern} depth depth of modulation
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).bpdepthfrequency("<200 500 100 0>")
 */

export const { bpdepthfrequency, bpdepthfreq } = registerControl('bpdepthfrequency', 'bpdepthfreq');

/**
 * Shape of the LFO for the bandpass filter
 *
 * @name bpshape
 * @tags filter, lfo, superdough
 * @param {number | Pattern} shape Shape of the lfo (0, 1, 2, ..)
 */
export const { bpshape } = registerControl('bpshape');

/**
 * DC offset of the LFO for the bandpass filter
 *
 * @name bpdc
 * @tags filter, lfo, superdough
 * @param {number | Pattern} dcoffset dc offset. set to 0 for unipolar
 */
export const { bpdc } = registerControl('bpdc');

/**
 * Skew of the LFO for the bandpass filter
 *
 * @name bpskew
 * @tags filter, lfo, superdough
 * @param {number | Pattern} skew How much to bend the LFO shape
 */
export const { bpskew } = registerControl('bpskew');

/**
 * Rate of the LFO for the highpass filter
 *
 * @name hprate
 * @tags filter, lfo, superdough
 * @param {number | Pattern} rate rate in hertz
 */
export const { hprate } = registerControl('hprate');

/**
 * Cycle-synced rate of the LFO for the highpass filter
 *
 * @name hpsync
 * @tags filter, lfo, superdough
 * @param {number | Pattern} rate rate in cycles
 */
export const { hpsync } = registerControl('hpsync');

/**
 * Depth of the LFO for the highpass filter
 *
 * @name hpdepth
 * @tags filter, lfo, superdough
 * @param {number | Pattern} depth depth of modulation
 */
export const { hpdepth } = registerControl('hpdepth');

/**
 * Depth of the LFO for the hipass filter, in hz
 *
 * @name hpdepthfrequency
 * @tags filter, lfo, superdough
 * @synonyms hpdepthfreq
 * @param {number | Pattern} depth depth of modulation
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).hpdepthfrequency("<200 500 100 0>")
 */

export const { hpdepthfrequency, hpdepthfreq } = registerControl('hpdepthfrequency', 'hpdepthfreq');

/**
 * Shape of the LFO for the highpass filter
 *
 * @name hpshape
 * @tags filter, lfo, superdough
 * @param {number | Pattern} shape Shape of the lfo (0, 1, 2, ..)
 */
export const { hpshape } = registerControl('hpshape');

/**
 * DC offset of the LFO for the highpass filter
 *
 * @name hpdc
 * @tags filter, lfo, superdough
 * @param {number | Pattern} dcoffset dc offset. set to 0 for unipolar
 */
export const { hpdc } = registerControl('hpdc');

/**
 * Skew of the LFO for the highpass filter
 *
 * @name hpskew
 * @tags filter, lfo, superdough
 * @param {number | Pattern} skew How much to bend the LFO shape
 */
export const { hpskew } = registerControl('hpskew');

/**
 * Applies a vibrato to the frequency of the oscillator.
 *
 * @name vib
 * @tags pitch, lfo, superdough, supradough
 * @synonyms vibrato, v
 * @param {number | Pattern} frequency of the vibrato in hertz
 * @example
 * note("a e")
 * .vib("<.5 1 2 4 8 16>")
 * ._scope()
 * @example
 * // change the modulation depth with ":"
 * note("a e")
 * .vib("<.5 1 2 4 8 16>:12")
 * ._scope()
 */
export const { vib, vibrato, v } = registerControl(['vib', 'vibmod'], 'vibrato', 'v');
/**
 * Adds pink noise to the mix
 *
 * @name noise
 * @tags generators, superdough, supradough
 * @param {number | Pattern} wet wet amount
 * @example
 * sound("<white pink brown>/2")
 */
export const { noise } = registerControl('noise');
/**
 * Sets the vibrato depth in semitones. Only has an effect if `vibrato` | `vib` | `v` is is also set
 *
 * @name vibmod
 * @tags pitch, lfo, superdough, supradough
 * @synonyms vmod
 * @param {number | Pattern} depth of vibrato (in semitones)
 * @example
 * note("a e").vib(4)
 * .vibmod("<.25 .5 1 2 12>")
 * ._scope()
 * @example
 * // change the vibrato frequency with ":"
 * note("a e")
 * .vibmod("<.25 .5 1 2 12>:8")
 * ._scope()
 */
export const { vibmod, vmod } = registerControl(['vibmod', 'vib'], 'vmod');
export const { hcutoff, hpf, hp } = registerControl(['hcutoff', 'hresonance', 'hpenv'], 'hpf', 'hp');
/**
 * Controls the **h**igh-**p**ass **q**-value.
 *
 * @name hpq
 * @tags filter, superdough, supradough
 * @param {number | Pattern} q resonance factor between 0 and 50
 * @synonyms hresonance
 * @example
 * s("bd sd [~ bd] sd,hh*8").hpf(2000).hpq("<0 10 20 30>")
 *
 */
export const { hresonance, hpq } = registerControl('hresonance', 'hpq');
/**
 * Controls the **l**ow-**p**ass **q**-value.
 *
 * @name lpq
 * @tags filter, superdough, supradough
 * @param {number | Pattern} q resonance factor between 0 and 50
 * @synonyms resonance
 * @example
 * s("bd sd [~ bd] sd,hh*8").lpf(2000).lpq("<0 10 20 30>")
 *
 */
// currently an alias of 'resonance' https://codeberg.org/uzu/strudel/issues/496
export const { resonance, lpq } = registerControl('resonance', 'lpq');
/**
 * DJ filter, below 0.5 is low pass filter, above is high pass filter.
 *
 * @name djf
 * @tags filter, superdough
 * @param {number | Pattern} cutoff below 0.5 is low pass filter, above is high pass filter
 * @example
 * n(irand(16).seg(8)).scale("d:phrygian").s("supersaw").djf("<.5 .3 .2 .75>")
 *
 */
export const { djf } = registerControl('djf');
// ['cutoffegint'],
// TODO: does not seem to work
/**
 * Sets the level of the delay signal.
 *
 * When using mininotation, you can also optionally add the 'delaytime' and 'delayfeedback' parameter,
 * separated by ':'.
 *
 *
 * @name delay
 * @tags orbit, superdough, supradough
 * @param {number | Pattern} level between 0 and 1
 * @example
 * s("bd bd").delay("<0 .25 .5 1>")
 * @example
 * s("bd bd").delay("0.65:0.25:0.9 0.65:0.125:0.7")
 *
 */
export const { delay } = registerControl(['delay', 'delaytime', 'delayfeedback']);
/**
 * Sets the level of the signal that is fed back into the delay.
 * Caution: Values >= 1 will result in a signal that gets louder and louder! Don't do it
 *
 * @name delayfeedback
 * @tags orbit, superdough, supradough
 * @param {number | Pattern} feedback between 0 and 1
 * @synonyms delayfb, dfb
 * @example
 * s("bd").delay(.25).delayfeedback("<.25 .5 .75 1>")
 *
 */
export const { delayfeedback, delayfb, dfb } = registerControl('delayfeedback', 'delayfb', 'dfb');

/**
 * Sets the time of the delay effect.
 *
 * @name delayspeed
 * @tags supradough
 * @param {number | Pattern} delayspeed controls the pitch of the delay feedback
 * @synonyms delayt, dt
 * @example
 * note("d d a# a".fast(2)).s("sawtooth").delay(.8).delaytime(1/2).delayspeed("<2 .5 -1 -2>")
 *
 */
export const { delayspeed } = registerControl('delayspeed');

/**
 * Sets the time of the delay effect in seconds.
 *
 * @name delaytime
 * @tags orbit, superdough, supradough
 * @param {number | Pattern} delay in seconds
 * @synonyms delayt, dt
 * @example
 * note("d d a# a".fast(2))
 * .s("sawtooth")
 * .delay(.8)
 * .delaytime(1/2)
 * .delayspeed("<2 .5 -1 -2>")
 */
export const { delaytime, delayt, dt } = registerControl('delaytime', 'delayt', 'dt');

/**
 * Sets the time of the delay effect in cycles.
 *
 * @name delaysync
 * @tags orbit, superdough
 * @param {number | Pattern} cycles delay length in cycles
 * @synonyms delays, ds
 * @example
 * s("bd bd").delay(.25).delaysync("<1 2 3 5>".div(8))
 *
 */
export const { delaysync } = registerControl('delaysync', 'delays', 'ds');

/**
 * Specifies whether delaytime is calculated relative to cps.
 *
 * @name lock
 * @tags superdirt
 * @param {number | Pattern} enable When set to 1, delaytime is a direct multiple of a cycle.
 * @superdirtOnly
 * @example
 * s("sd").delay().lock(1).osc()
 *
 *
 */

export const { lock } = registerControl('lock');
/**
 * Set detune for stacked voices of supported oscillators.
 *
 * @name detune
 * @tags pitch, superdough
 * @param {number | Pattern} amount
 * @synonyms det
 * @example
 * note("d f a a# a d3").fast(2).s("supersaw").detune("<.1 .2 .5 24.1>")
 *
 */
export const { detune, det } = registerControl('detune', 'det');
/**
 * Set number of stacked voices for supported oscillators.
 *
 * @name unison
 * @tags superdough
 * @param {number | Pattern} numvoices
 * @example
 * note("d f a a# a d3").fast(2).s("supersaw").unison("<1 2 7>")
 *
 */
export const { unison } = registerControl('unison');

/**
 * Set the stereo pan spread for supported oscillators
 *
 * @name spread
 * @tags superdough
 * @param {number | Pattern} spread between 0 and 1
 * @example
 * note("d f a a# a d3").fast(2).s("supersaw").spread("<0 .3 1>")
 *
 */
export const { spread } = registerControl('spread');
/**
 * Set dryness of reverb. See `room` and `size` for more information about reverb.
 *
 * @name dry
 * @tags superdirt
 * @param {number | Pattern} dry 0 = wet, 1 = dry
 * @example
 * n("[0,3,7](3,8)").s("superpiano").room(.7).dry("<0 .5 .75 1>").osc()
 * @superdirtOnly
 *
 */
export const { dry } = registerControl('dry');
/**
 * Used when using `begin`/`end` or `chop`/`striate` and friends, to change the fade out time of the 'grain' envelope.
 *
 * @name fadeTime
 * @tags superdirt
 * @synonyms fadeOutTime
 * @param {number | Pattern} time between 0 and 1
 * @example
 * s("oh*4").end(.1).fadeTime("<0 .2 .4 .8>").osc()
 *
 */
export const { fadeTime, fadeOutTime } = registerControl('fadeTime', 'fadeOutTime');
export const { fadeInTime } = registerControl('fadeInTime');
/**
 * Set frequency of sound.
 *
 * @name freq
 * @tags pitch, superdough
 * @param {number | Pattern} frequency in Hz. the audible range is between 20 and 20000 Hz
 * @example
 * freq("220 110 440 110").s("superzow").osc()
 * @example
 * freq("110".mul.out(".5 1.5 .6 [2 3]")).s("superzow").osc()
 *
 */
export const { freq } = registerControl('freq');
// pitch envelope
/**
 * Attack time of pitch envelope.
 *
 * @name pattack
 * @tags pitch, envelope, superdough, supradough
 * @synonyms patt
 * @param {number | Pattern} time time in seconds
 * @example
 * note("c eb g bb").pattack("0 .1 .25 .5").slow(2)
 *
 */
export const { pattack, patt } = registerControl('pattack', 'patt');
/**
 * Decay time of pitch envelope.
 *
 * @name pdecay
 * @tags pitch, envelope, superdough, supradough
 * @synonyms pdec
 * @param {number | Pattern} time time in seconds
 * @example
 * note("<c eb g bb>").pdecay("<0 .1 .25 .5>")
 *
 */
export const { pdecay, pdec } = registerControl('pdecay', 'pdec');
// TODO: how to use psustain?!
export const { psustain, psus } = registerControl('psustain', 'psus');
/**
 * Release time of pitch envelope
 *
 * @name prelease
 * @tags pitch, envelope, superdough, supradough
 * @synonyms prel
 * @param {number | Pattern} time time in seconds
 * @example
 * note("<c eb g bb> ~")
 * .release(.5) // to hear the pitch release
 * .prelease("<0 .1 .25 .5>")
 *
 */
export const { prelease, prel } = registerControl('prelease', 'prel');
/**
 * Amount of pitch envelope. Negative values will flip the envelope.
 * If you don't set other pitch envelope controls, `pattack:.2` will be the default.
 *
 * @name penv
 * @tags pitch, envelope, superdough, supradough
 * @param {number | Pattern} semitones change in semitones
 * @example
 * note("c")
 * .penv("<12 7 1 .5 0 -1 -7 -12>")
 *
 */
export const { penv } = registerControl('penv');
/**
 * Curve of envelope. Defaults to linear. exponential is good for kicks
 *
 * @name pcurve
 * @tags pitch, envelope, superdough
 * @param {number | Pattern} type 0 = linear, 1 = exponential
 * @example
 * note("g1*4")
 * .s("sine").pdec(.5)
 * .penv(32)
 * .pcurve("<0 1>")
 *
 */
export const { pcurve } = registerControl('pcurve');
/**
 * Sets the range anchor of the envelope:
 * - anchor 0: range = [note, note + penv]
 * - anchor 1: range = [note - penv, note]
 * If you don't set an anchor, the value will default to the psustain value.
 *
 * @name panchor
 * @tags pitch, envelope, superdough
 * @param {number | Pattern} anchor anchor offset
 * @example
 * note("c c4").penv(12).panchor("<0 .5 1 .5>")
 *
 */
export const { panchor } = registerControl('panchor');
// TODO: https://tidalcycles.org/docs/configuration/MIDIOSC/control-voltage/#gate
export const { gate, gat } = registerControl('gate', 'gat');
// ['hatgrain'],
// ['lagogo'],
// ['lclap'],
// ['lclaves'],
// ['lclhat'],
// ['lcrash'],
// TODO:
// https://tidalcycles.org/docs/reference/audio_effects/#leslie-1
// https://tidalcycles.org/docs/reference/audio_effects/#leslie
/**
 * Emulation of a Leslie speaker: speakers rotating in a wooden amplified cabinet.
 *
 * @name leslie
 * @tags superdirt
 * @param {number | Pattern} wet between 0 and 1
 * @example
 * n("0,4,7").s("supersquare").leslie("<0 .4 .6 1>").osc()
 * @superdirtOnly
 *
 */
export const { leslie } = registerControl('leslie');
/**
 * Rate of modulation / rotation for leslie effect
 *
 * @name lrate
 * @tags superdirt
 * @param {number | Pattern} rate 6.7 for fast, 0.7 for slow
 * @example
 * n("0,4,7").s("supersquare").leslie(1).lrate("<1 2 4 8>").osc()
 * @superdirtOnly
 *
 */
// TODO: the rate seems to "lag" (in the example, 1 will be fast)
export const { lrate } = registerControl('lrate');
/**
 * Physical size of the cabinet in meters. Be careful, it might be slightly larger than your computer. Affects the Doppler amount (pitch warble)
 *
 * @name lsize
 * @tags superdirt
 * @param {number | Pattern} meters somewhere between 0 and 1
 * @example
 * n("0,4,7").s("supersquare").leslie(1).lrate(2).lsize("<.1 .5 1>").osc()
 * @superdirtOnly
 *
 */
export const { lsize } = registerControl('lsize');
/**
 * Sets the displayed text for an event on the pianoroll
 *
 * @name label
 * @tags visualization
 * @param {string} label text to display
 */
export const { activeLabel } = registerControl('activeLabel');
export const { label } = registerControl(['label', 'activeLabel']);
// ['lfo'],
// ['lfocutoffint'],
// ['lfodelay'],
// ['lfoint'],
// ['lfopitchint'],
// ['lfoshape'],
// ['lfosync'],
// ['lhitom'],
// ['lkick'],
// ['llotom'],
// ['lophat'],
// ['lsnare'],
// TODO: what is this? not found in tidal doc
export const { degree } = registerControl('degree');
// TODO: what is this? not found in tidal doc
export const { mtranspose } = registerControl('mtranspose');
// TODO: what is this? not found in tidal doc
export const { ctranspose } = registerControl('ctranspose');
// TODO: what is this? not found in tidal doc
export const { harmonic } = registerControl('harmonic');
// TODO: what is this? not found in tidal doc
export const { stepsPerOctave } = registerControl('stepsPerOctave');
// TODO: what is this? not found in tidal doc
export const { octaveR } = registerControl('octaveR');
// TODO: why is this needed? what's the difference to late / early? Answer: it's in seconds, and delays the message at
// OSC time (so can't be negative, at least not beyond the latency value)
export const { nudge } = registerControl('nudge');
// TODO: the following doc is just a guess, it's not documented in tidal doc.
/**
 * Sets the default octave of a synth.
 *
 * @name octave
 * @tags superdirt
 * @synonyms oct
 * @param {number | Pattern} octave octave number
 * @example
 * n("0,4,7").scale("F:minor").s('supersaw').octave("<0 1 2 3>")
 */
export const { octave, oct } = registerControl('octave', 'oct');

// ['ophatdecay'],
// TODO: example
/**
 * An `orbit` is a global parameter context for patterns. Patterns with the same orbit will share the same global effects.
 *
 * @name orbit
 * @tags superdough
 * @synonyms o
 * @param {number | Pattern} number
 * @example
 * stack(
 *   s("hh*6").delay(.5).delaytime(.25).orbit(1),
 *   s("~ sd ~ sd").delay(.5).delaytime(.125).orbit(2)
 * )
 */
export const { orbit } = registerControl('orbit', 'o');

/**
 * A `bus` is a send which can be used for mixing patterns. It combines with..
 *   s("bus") to play that bus through another pattern (for, say, applying non-linear
 *   effects like distortion to multiple signals)
 *
 *   otherPat.bmod(..) (to modulate another pattern with the bus)
 *
 * @name bus
 * @tags superdirt
 * @param {number | Pattern} number
 */
export const { bus } = registerControl('bus');

/**
 * Postgain multiplier prior to sending the signal to the audio bus.
 *
 * @name busgain
 * @tags superdirt
 * @synonyms bgain
 * @param {number | Pattern} number
 */
export const { busgain, bgain } = registerControl('busgain', 'bgain');

// TODO: what is this? not found in tidal doc Answer: gain is limited to maximum of 2. This allows you to go over that
export const { overgain } = registerControl('overgain');
// TODO: what is this? not found in tidal doc. Similar to above, but limited to 1
export const { overshape } = registerControl('overshape');
/**
 * Sets position in stereo.
 *
 * @name pan
 * @tags superdough, supradough
 * @param {number | Pattern} pan between 0 and 1, from left to right (assuming stereo), once round a circle (assuming multichannel)
 * @example
 * s("[bd hh]*2").pan("<.5 1 .5 0>")
 * @example
 * s("bd rim sd rim bd ~ cp rim").pan(sine.slow(2))
 *
 */
export const { pan } = registerControl('pan');
/**
 * Controls how much multichannel output is fanned out
 *
 * @name panspan
 * @tags superdirt
 * @param {number | Pattern} span between -inf and inf, negative is backwards ordering
 * @example
 * s("[bd hh]*2").pan("<.5 1 .5 0>").panspan("<0 .5 1>").osc()
 *
 */
export const { panspan } = registerControl('panspan');
/**
 * Controls how much multichannel output is spread
 *
 * @name pansplay
 * @tags superdirt
 * @param {number | Pattern} spread between 0 and 1
 * @example
 * s("[bd hh]*2").pan("<.5 1 .5 0>").pansplay("<0 .5 1>").osc()
 *
 */
export const { pansplay } = registerControl('pansplay');
export const { panwidth } = registerControl('panwidth');
export const { panorient } = registerControl('panorient');
// ['pitch1'],
// ['pitch2'],
// ['pitch3'],
// ['portamento'],

// TODO: slide param for certain synths
export const { slide } = registerControl('slide');
// TODO: detune? https://tidalcycles.org/docs/patternlib/tutorials/synthesizers/#supersquare
export const { semitone } = registerControl('semitone');

// TODO: synth param
export const { voice } = registerControl('voice');
// voicings // https://codeberg.org/uzu/strudel/issues/506
/**
 * The chord to voice
 * @name chord
 * @tags tonal
 * @param {string | Pattern} symbols chord symbols to voice e.g., C, Eb, Fm7, G7. The symbols can be defined via addVoicings
 * @example
 * chord("<Am C D F Am E Am E>").voicing()
 **/
export const { chord } = registerControl('chord');
/**
 * Which dictionary to use for the voicings. This falls back to the default dictionary if not provided
 *
 * @name dictionary
 * @tags tonal
 * @param {string} dictionaryName which dictionary (having been defined with `addVoicings`) to use
 * @example
 * addVoicings('house', {
'': ['7 12 16', '0 7 16', '4 7 12'],
'm': ['0 3 7']
})
chord("<Am C D F Am E Am E>")
.dict('house').anchor(66)
.voicing().room(.5)
 **/
export const { dictionary, dict } = registerControl('dictionary', 'dict');
/** The top note to align the voicing to. Defaults to c5
 *
 * @name anchor
 * @tags tonal
 * @param {string | Pattern} anchorNote the note to align the voicing or scale to
 * @example
 * anchor("<c4 g4 c5 g5>").chord("C").voicing()
 * @example
 * n("0 .. 7").anchor("<c4 g4 c5 g5>").scale("<C:major F:minor>")
 **/
export const { anchor } = registerControl('anchor');
/**
 * Sets how the voicing is offset from the anchored position
 *
 * @name offset
 * @tags tonal
 * @param {number | Pattern} shift the amount to shift the voicing up or down
 * @example
 * chord("<Am C D F Am E Am E>").offset("<0 1 2 3 4 5>") // alter the voicing each time
 **/
export const { offset } = registerControl('offset');
/**
 *  How many octaves are voicing steps spread apart, defaults to 1
 *
 *  @name octaves
 *  @tags tonal
 *  @param {number | Pattern} count the number of octaves
 *  @example
 *  chord("<Am C D F Am E Am E>").octaves("<2 4>").voicing()
 **/
export const { octaves } = registerControl('octaves');
/**
 *  How the voicing is aligned to the anchor
 *   - `below`: top note <= anchor
 *   - `duck`: top note <= anchor, anchor excluded
 *   - `above`: bottom note >= anchor
 *   - `root`: bottom note is the lowest root of the chord >= anchor
 *
 *   - `oldabove` : old (buggy) behavior of above, kept for legacy reason
 *   - `oldroot` : old (buggy) behavior of root, kept for legacy reason
 *
 * @name mode
 * @tags tonal
 * @param {string | Pattern} modeName one of {below | above | duck | root | oldabove | oldroot}
 * @example
 * mode("<below above duck root>").chord("C").voicing()
 *
 **/
export const { mode } = registerControl(['mode', 'anchor']);

/**
 * Sets the level of reverb.
 *
 * When using mininotation, you can also optionally add the 'size' parameter, separated by ':'.
 *
 * @name room
 * @tags orbit, superdough
 * @param {number | Pattern} level between 0 and 1
 * @example
 * s("bd sd [~ bd] sd").room("<0 .2 .4 .6 .8 1>")
 * @example
 * s("bd sd [~ bd] sd").room("<0.9:1 0.9:4>")
 *
 */
export const { room } = registerControl(['room', 'size']);
/**
 * Reverb lowpass starting frequency (in hertz).
 * When this property is changed, the reverb will be recaculated, so only change this sparsely..
 *
 * @name roomlp
 * @tags orbit, superdough
 * @synonyms rlp
 * @param {number} frequency between 0 and 20000hz
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(10000)
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(5000)
 */
export const { roomlp, rlp } = registerControl('roomlp', 'rlp');
/**
 * Reverb lowpass frequency at -60dB (in hertz).
 * When this property is changed, the reverb will be recaculated, so only change this sparsely..
 *
 * @name roomdim
 * @tags orbit, superdough
 * @synonyms rdim
 * @param {number} frequency between 0 and 20000hz
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(10000).rdim(8000)
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(5000).rdim(400)
 *
 */
export const { roomdim, rdim } = registerControl('roomdim', 'rdim');
/**
 * Reverb fade time (in seconds).
 * When this property is changed, the reverb will be recaculated, so only change this sparsely..
 *
 * @name roomfade
 * @tags orbit, superdough
 * @synonyms rfade
 * @param {number} seconds for the reverb to fade
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(10000).rfade(0.5)
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(5000).rfade(4)
 *
 */
export const { roomfade, rfade } = registerControl('roomfade', 'rfade');
/**
 * Sets the sample to use as an impulse response for the reverb.
 * @name iresponse
 * @tags orbit, superdough
 * @param {string | Pattern} sample to use as an impulse response
 * @synonyms ir
 * @example
 * s("bd sd [~ bd] sd").room(.8).ir("<shaker_large:0 shaker_large:2>")
 *
 */
export const { ir, iresponse } = registerControl(['ir', 'i'], 'iresponse');

/**
 * Sets speed of the sample for the impulse response.
 * @name irspeed
 * @tags orbit, superdough
 * @param {string | Pattern} speed
 * @example
 * samples('github:switchangel/pad')
 * $: s("brk/2").fit().scrub(irand(16).div(16).seg(8)).ir("swpad:4").room(.2).irspeed("<2 1 .5>/2").irbegin(.5).roomsize(.5)
 *
 */
export const { irspeed } = registerControl('irspeed');

/**
 * Sets the beginning of the IR response sample
 * @name irbegin
 * @tags orbit, superdough
 * @param {string | Pattern} begin between 0 and 1
 * @synonyms ir
 * @example
 * samples('github:switchangel/pad')
 * $: s("brk/2").fit().scrub(irand(16).div(16).seg(8)).ir("swpad:4").room(.65).irspeed("-2").irbegin("<0 .5 .75>/2").roomsize(.6)
 *
 */
export const { irbegin } = registerControl('irbegin');
/**
 * Sets the room size of the reverb, see `room`.
 * When this property is changed, the reverb will be recaculated, so only change this sparsely..
 *
 * @name roomsize
 * @tags orbit, superdough
 * @param {number | Pattern} size between 0 and 10
 * @synonyms rsize, sz, size
 * @example
 * s("bd sd [~ bd] sd").room(.8).rsize(1)
 * @example
 * s("bd sd [~ bd] sd").room(.8).rsize(4)
 *
 */
// TODO: find out why :
// s("bd sd [~ bd] sd").room(.8).roomsize("<0 .2 .4 .6 .8 [1,0]>").osc()
// .. does not work. Is it because room is only one effect?
export const { roomsize, size, sz, rsize } = registerControl('roomsize', 'size', 'sz', 'rsize');
// ['sagogo'],
// ['sclap'],
// ['sclaves'],
// ['scrash'],
/**
 * (Deprecated) Wave shaping distortion. WARNING: can suddenly get unpredictably loud.
 * Please use distort instead, which has a more predictable response curve
 * second option in optional array syntax (ex: ".9:.5") applies a postgain to the output
 *
 *
 * @name shape
 * @tags distortion, superdough
 * @param {number | Pattern} distortion between 0 and 1
 * @example
 * s("bd sd [~ bd] sd,hh*8").shape("<0 .2 .4 .6 .8>")
 *
 */
export const { shape } = registerControl(['shape', 'shapevol']);
/**
 * Wave shaping distortion. CAUTION: it can get loud.
 * Second option in optional array syntax (ex: ".9:.5") applies a postgain to the output. Third option sets the waveshaping type.
 * Most useful values are usually between 0 and 10 (depending on source gain). If you are feeling adventurous, you can turn it up to 11 and beyond ;)
 *
 * @name distort
 * @tags distortion, superdough, supradough
 * @synonyms dist
 * @param {number | Pattern} distortion amount of distortion to apply
 * @param {number | Pattern} volume linear postgain of the distortion
 * @param {number | string | Pattern} type type of distortion to apply
 * @example
 * s("bd sd [~ bd] sd,hh*8").distort("<0 2 3 10:.5>")
 * @example
 * note("d1!8").s("sine").penv(36).pdecay(.12).decay(.23).distort("8:.4")
 * @example
 * s("bd:4*4").bank("tr808").distort("3:0.5:diode")
 *
 */
export const { distort, dist } = registerControl(['distort', 'distortvol', 'distorttype'], 'dist');

/**
 * Postgain for waveshaping distortion.
 *
 * @name distortvol
 * @synonyms distortion, distvol
 * @tags superdough, supradough
 * @param {number | Pattern} volume linear postgain of the distortion
 * @example
 * s("bd*4").bank("tr909").distort(2).distortvol(0.8)
 */
export const { distortvol } = registerControl('distortvol', 'distvol');

/**
 * Type of waveshaping distortion to apply.
 *
 * @name distorttype
 * @tags distortion, superdough, supradough
 * @synonyms disttype
 * @param {number | string | Pattern} type type of distortion to apply
 * @example
 * s("bd*4").bank("tr909").distort(2).distorttype("<0 1 2>")
 *
 * @example
 * s("sine").note("F1*2").release(1)
 *   .penv(24).pdecay(0.05)
 *   .distort(rand.range(1, 8))
 *   .distorttype("<fold chebyshev scurve diode asym sinefold>")
 */
export const { distorttype } = registerControl('distorttype', 'disttype');

/**
 * Dynamics Compressor. The params are `compressor("threshold:ratio:knee:attack:release")`
 * More info [here](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode?retiredLocale=de#instance_properties)
 *
 * @name compressor
 * @tags superdough
 * @example
 * s("bd sd [~ bd] sd,hh*8")
 * .compressor("-20:20:10:.002:.02")
 *
 */
export const { compressor } = registerControl([
  'compressor',
  'compressorRatio',
  'compressorKnee',
  'compressorAttack',
  'compressorRelease',
]);
export const { compressorKnee } = registerControl('compressorKnee');
export const { compressorRatio } = registerControl('compressorRatio');
export const { compressorAttack } = registerControl('compressorAttack');
export const { compressorRelease } = registerControl('compressorRelease');
/**
 * Changes the speed of sample playback, i.e. a cheap way of changing pitch.
 *
 * @name speed
 * @tags pitch, samples
 * @param {number | Pattern} speed -inf to inf, negative numbers play the sample backwards.
 * @example
 * s("bd*6").speed("1 2 4 1 -2 -4")
 * @example
 * speed("1 1.5*2 [2 1.1]").s("piano").clip(1)
 *
 */
export const { speed } = registerControl('speed');

/**
 * Changes the pitch of the sample without changing its speed.
 * The frequencies are multiplied by (factor + 1) for positive numbers
 * and by max(factor / 4 + 1, 0) for negative numbers.
 * So tuning up by octaves can be done with 1, 3, 7, ...
 * and tuning down by octaves with -2, -3, -3.5...
 *
 * @name stretch
 * @tags pitch, samples
 * @param {number | Pattern} factor between `-4` and `inf`. Positive increases pitch, 0 does nothing, negative decreases the pitch.
 * @example
 * s("gm_flute").stretch("<2 1 0 -2>")
 *
 */
export const { stretch } = registerControl('stretch');
/**
 * Used in conjunction with `speed`, accepts values of "r" (rate, default behavior), "c" (cycles), or "s" (seconds). Using `unit "c"` means `speed` will be interpreted in units of cycles, e.g. `speed "1"` means samples will be stretched to fill a cycle. Using `unit "s"` means the playback speed will be adjusted so that the duration is the number of seconds specified by `speed`.
 *
 * @name unit
 * @tags superdirt
 * @param {number | string | Pattern} unit see description above
 * @example
 * speed("1 2 .5 3").s("bd").unit("c").osc()
 * @superdirtOnly
 *
 */

export const { unit } = registerControl('unit');
/**
 * Made by Calum Gunn. Reminiscent of some weird mixture of filter, ring-modulator and pitch-shifter. The SuperCollider manual defines Squiz as:
 *
 * "A simplistic pitch-raising algorithm. It's not meant to sound natural; its sound is reminiscent of some weird mixture of filter, ring-modulator and pitch-shifter, depending on the input. The algorithm works by cutting the signal into fragments (delimited by upwards-going zero-crossings) and squeezing those fragments in the time domain (i.e. simply playing them back faster than they came in), leaving silences inbetween. All the parameters apart from memlen can be modulated."
 *
 * @name squiz
 * @tags superdirt
 * @param {number | Pattern} squiz Try passing multiples of 2 to it - 2, 4, 8 etc.
 * @example
 * squiz("2 4/2 6 [8 16]").s("bd").osc()
 * @superdirtOnly
 *
 */
export const { squiz } = registerControl('squiz');
// TODO: what is this? not found in tidal doc
// ['stutterdepth'],
// TODO: what is this? not found in tidal doc
// ['stuttertime'],
// TODO: what is this? not found in tidal doc
// ['timescale'],
// TODO: what is this? not found in tidal doc
// ['timescalewin'],
// ['tomdecay'],
// ['vcfegint'],
// ['vcoegint'],
// TODO: Use a rest (~) to override the effect <- vowel
/**
 *
 * Formant filter to make things sound like vowels.
 *
 * @name vowel
 * @tags superdough
 * @param {string | Pattern} vowel You can use a e i o u ae aa oe ue y uh un en an on, corresponding to [a] [e] [i] [o] [u] [æ] [ɑ] [ø] [y] [ɯ] [ʌ] [œ̃] [ɛ̃] [ɑ̃] [ɔ̃]. Aliases: aa = å = ɑ, oe = ø = ö, y = ı, ae = æ.
 * @example
 * note("[c2 <eb2 <g2 g1>>]*2").s('sawtooth')
 * .vowel("<a e i <o u>>")
 * @example
 * s("bd sd mt ht bd [~ cp] ht lt").vowel("[a|e|i|o|u]")
 *
 */
export const { vowel } = registerControl('vowel');
/* // TODO: find out how it works
 * Made by Calum Gunn. Divides an audio stream into tiny segments, using the signal's zero-crossings as segment boundaries, and discards a fraction of them. Takes a number between 1 and 100, denoted the percentage of segments to drop. The SuperCollider manual describes the Waveloss effect this way:
 *
 * Divide an audio stream into tiny segments, using the signal's zero-crossings as segment boundaries, and discard a fraction of them (i.e. replace them with silence of the same length). The technique was described by Trevor Wishart in a lecture. Parameters: the filter drops drop out of out of chunks. mode can be 1 to drop chunks in a simple deterministic fashion (e.g. always dropping the first 30 out of a set of 40 segments), or 2 to drop chunks randomly but in an appropriate proportion.)
 *
 * mode: ?
 * waveloss: ?
 *
 * @name waveloss
 */
export const { waveloss } = registerControl('waveloss');
/**
 * crackle noise density
 *
 * @name density
 * @tags superdough
 * @param {number | Pattern} density between 0 and x
 * @example
 * s("crackle*4").density("<0.01 0.04 0.2 0.5>".slow(4))
 *
 */
export const { density } = registerControl('density');
// ['modwheel'],
export const { expression } = registerControl('expression');
export const { sustainpedal } = registerControl('sustainpedal');

export const { fshift } = registerControl('fshift');
export const { fshiftnote } = registerControl('fshiftnote');
export const { fshiftphase } = registerControl('fshiftphase');

export const { triode } = registerControl('triode');
export const { krush } = registerControl('krush');
export const { kcutoff } = registerControl('kcutoff');
export const { octer } = registerControl('octer');
export const { octersub } = registerControl('octersub');
export const { octersubsub } = registerControl('octersubsub');
export const { ring } = registerControl('ring');
export const { ringf } = registerControl('ringf');
export const { ringdf } = registerControl('ringdf');
export const { freeze } = registerControl('freeze');
export const { xsdelay } = registerControl('xsdelay');
export const { tsdelay } = registerControl('tsdelay');
export const { real } = registerControl('real');
export const { imag } = registerControl('imag');
export const { enhance } = registerControl('enhance');
export const { comb } = registerControl('comb');
export const { smear } = registerControl('smear');
export const { scram } = registerControl('scram');
export const { binshift } = registerControl('binshift');
export const { hbrick } = registerControl('hbrick');
export const { lbrick } = registerControl('lbrick');

export const { frameRate } = registerControl('frameRate');
export const { frames } = registerControl('frames');
export const { hours } = registerControl('hours');
export const { minutes } = registerControl('minutes');
export const { seconds } = registerControl('seconds');
export const { songPtr } = registerControl('songPtr');
export const { uid } = registerControl('uid');
export const { val } = registerControl('val');
export const { cps } = registerControl('cps');
/**
 * Multiplies the duration with the given number. Also cuts samples off at the end if they exceed the duration.
 *
 * @name clip
 * @tags superdough
 * @synonyms legato
 * @param {number | Pattern} factor >= 0
 * @example
 * note("c a f e").s("piano").clip("<.5 1 2>")
 *
 */
export const { clip, legato } = registerControl('clip', 'legato');

/**
 * Sets the duration of the event in cycles. Similar to clip / legato, it also cuts samples off at the end if they exceed the duration.
 *
 * @name duration
 * @tags superdough
 * @synonyms dur
 * @param {number | Pattern} seconds >= 0
 * @example
 * note("c a f e").s("piano").dur("<.5 1 2>")
 *
 */
export const { duration, dur } = registerControl('duration', 'dur');

// ZZFX
export const { zrand } = registerControl('zrand');
export const { curve } = registerControl('curve');
// superdirt duplicate
// export const {slide]} = registerControl('slide']);
export const { deltaSlide } = registerControl('deltaSlide');
export const { pitchJump } = registerControl('pitchJump');
export const { pitchJumpTime } = registerControl('pitchJumpTime');
// noise on the frequency or as bubo calls it "frequency fog" :)
export const { znoise } = registerControl('znoise');
export const { zmod } = registerControl('zmod');
// like crush but scaled differently
export const { zcrush } = registerControl('zcrush');
export const { zdelay } = registerControl('zdelay');
export const { zzfx } = registerControl('zzfx');

/**
 * Sets the color of the hap in visualizations like pianoroll or highlighting.
 * @name color
 * @tags visualization
 * @synonyms colour
 * @param {string} color Hexadecimal or CSS color name
 */
export const { color, colour } = registerControl(['color', 'colour']);

// TODO: slice / splice https://www.youtube.com/watch?v=hKhPdO0RKDQ&list=PL2lW1zNIIwj3bDkh-Y3LUGDuRcoUigoDs&index=13

export let createParams = (...names) =>
  names.reduce((acc, name) => Object.assign(acc, { [name]: createParam(name) }), {});

/**
 * ADSR envelope: Combination of Attack, Decay, Sustain, and Release.
 *
 * @name adsr
 * @tags envelope, amplitude
 * @param {number | Pattern} time attack time in seconds
 * @param {number | Pattern} time decay time in seconds
 * @param {number | Pattern} gain sustain level (0 to 1)
 * @param {number | Pattern} time release time in seconds
 * @example
 * note("[c3 bb2 f3 eb3]*2").sound("sawtooth").lpf(600).adsr(".1:.1:.5:.2")
 */
export const adsr = register('adsr', (adsr, pat) => {
  adsr = !Array.isArray(adsr) ? [adsr] : adsr;
  const [attack, decay, sustain, release] = adsr;
  return pat.set({ attack, decay, sustain, release });
});
export const ad = register('ad', (t, pat) => {
  t = !Array.isArray(t) ? [t] : t;
  const [attack, decay = attack] = t;
  return pat.attack(attack).decay(decay);
});
export const ds = register('ds', (t, pat) => {
  t = !Array.isArray(t) ? [t] : t;
  const [decay, sustain = 0] = t;
  return pat.set({ decay, sustain });
});
export const ar = register('ar', (t, pat) => {
  t = !Array.isArray(t) ? [t] : t;
  const [attack, release = attack] = t;
  return pat.set({ attack, release });
});

//MIDI

/**
 * MIDI channel: Sets the MIDI channel for the event.
 *
 * @name midichan
 * @tags external_io, midi
 * @param {number | Pattern} channel MIDI channel number (0-15)
 * @example
 * note("c4").midichan(1).midi()
 */
export const { midichan } = registerControl('midichan');

export const { midimap } = registerControl('midimap');

/**
 * MIDI port: Sets the MIDI port for the event.
 *
 * @name midiport
 * @tags external_io, midi
 * @param {number | Pattern} port MIDI port
 * @example
 * note("c a f e").midiport("<0 1 2 3>").midi()
 */
export const { midiport } = registerControl('midiport');

/**
 * MIDI command: Sends a MIDI command message.
 *
 * @name midicmd
 * @tags external_io, midi
 * @param {number | Pattern} command MIDI command
 * @example
 * midicmd("clock*48,<start stop>/2").midi()
 */
export const { midicmd } = registerControl('midicmd');

/**
 * MIDI control: Sends a MIDI control change message.
 *
 * @name control
 * @tags external_io, midi
 * @param {number | Pattern}  MIDI control number (0-127)
 * @param {number | Pattern}  MIDI controller value (0-127)
 */
export const control = register('control', (args, pat) => {
  if (!Array.isArray(args)) {
    throw new Error('control expects an array of [ccn, ccv]');
  }
  const [_ccn, _ccv] = args;
  return pat.ccn(_ccn).ccv(_ccv);
});

/**
 * MIDI control number: Sends a MIDI control change message.
 *
 * @name ccn
 * @tags external_io, midi
 * @param {number | Pattern}  MIDI control number (0-127)
 */
export const { ccn } = registerControl('ccn');
/**
 * MIDI control value: Sends a MIDI control change message.
 *
 * @name ccv
 * @tags external_io, midi
 * @param {number | Pattern}  MIDI control value (0-127)
 */
export const { ccv } = registerControl('ccv');
export const { ctlNum } = registerControl('ctlNum');
// TODO: ctlVal?

/**
 * MIDI NRPN non-registered parameter number: Sends a MIDI NRPN non-registered parameter number message.
 * @name nrpnn
 * @tags external_io, midi
 * @param {number | Pattern} nrpnn MIDI NRPN non-registered parameter number (0-127)
 * @example
 * note("c4").nrpnn("1:8").nrpv("123").midichan(1).midi()
 */
export const { nrpnn } = registerControl('nrpnn');
/**
 * MIDI NRPN non-registered parameter value: Sends a MIDI NRPN non-registered parameter value message.
 * @name nrpv
 * @tags external_io, midi
 * @param {number | Pattern} nrpv MIDI NRPN non-registered parameter value (0-127)
 * @example
 * note("c4").nrpnn("1:8").nrpv("123").midichan(1).midi()
 */
export const { nrpv } = registerControl('nrpv');

/**
 * MIDI program number: Sends a MIDI program change message.
 *
 * @name progNum
 * @tags external_io
 * @param {number | Pattern} program MIDI program number (0-127)
 * @example
 * note("c4").progNum(10).midichan(1).midi()
 */
export const { progNum } = registerControl('progNum');

/**
 * MIDI sysex: Sends a MIDI sysex message.
 * @name sysex
 * @tags external_io, midi
 * @param {number | Pattern} id Sysex ID
 * @param {number | Pattern} data Sysex data
 * @example
 * note("c4").sysex(["0x77", "0x01:0x02:0x03:0x04"]).midichan(1).midi()
 */
export const sysex = register('sysex', (args, pat) => {
  if (!Array.isArray(args)) {
    throw new Error('sysex expects an array of [id, data]');
  }
  const [id, data] = args;
  return pat.sysexid(id).sysexdata(data);
});
/**
 * MIDI sysex ID: Sends a MIDI sysex identifier message.
 * @name sysexid
 * @tags external_io, midi
 * @param {number | Pattern} id Sysex ID
 * @example
 * note("c4").sysexid("0x77").sysexdata("0x01:0x02:0x03:0x04").midichan(1).midi()
 */
export const { sysexid } = registerControl('sysexid');
/**
 * MIDI sysex data: Sends a MIDI sysex message.
 * @name sysexdata
 * @tags external_io, midi
 * @param {number | Pattern} data Sysex data
 * @example
 * note("c4").sysexid("0x77").sysexdata("0x01:0x02:0x03:0x04").midichan(1).midi()
 */
export const { sysexdata } = registerControl('sysexdata');

/**
 * MIDI pitch bend: Sends a MIDI pitch bend message.
 * @name midibend
 * @tags external_io, midi
 * @param {number | Pattern} midibend MIDI pitch bend (-1 - 1)
 * @example
 * note("c4").midibend(sine.slow(4).range(-0.4,0.4)).midi()
 */
export const { midibend } = registerControl('midibend');
/**
 * MIDI key after touch: Sends a MIDI key after touch message.
 * @name miditouch
 * @tags external_io, midi
 * @param {number | Pattern} miditouch MIDI key after touch (0-1)
 * @example
 * note("c4").miditouch(sine.slow(4).range(0,1)).midi()
 */
export const { miditouch } = registerControl('miditouch');

// TODO: what is this?
export const { polyTouch } = registerControl('polyTouch');

/**
 * The host to send open sound control messages to. Requires running the OSC bridge.
 * @name oschost
 * @tags external_io
 * @param {string | Pattern} oschost e.g. 'localhost'
 * @example
 * note("c4").oschost('127.0.0.1').oscport(57120).osc();
 */
export const { oschost } = registerControl('oschost');

/**
 * The port to send open sound control messages to. Requires running the OSC bridge.
 * @name oscport
 * @tags external_io
 * @param {number | Pattern} oscport e.g. 57120
 * @example
 * note("c4").oschost('127.0.0.1').oscport(57120).osc();
 */
export const { oscport } = registerControl('oscport');

export const getControlName = (alias) => {
  if (controlAlias.has(alias)) {
    return controlAlias.get(alias);
  }
  return alias;
};

/**
 * Sets properties in a batch.
 *
 * @name as
 * @tags combiners
 * @param {String | Array} mapping the control names that are set
 * @example
 * "c:.5 a:1 f:.25 e:.8".as("note:clip")
 * @example
 * "{0@2 0.25 0 0.5 .3 .5}%8".as("begin").s("sax_vib").clip(1)
 */
export const as = register('as', (mapping, pat) => {
  mapping = Array.isArray(mapping) ? mapping : [mapping];
  return pat.fmap((v) => {
    v = Array.isArray(v) ? v : [v];
    const entries = [];
    for (let i = 0; i < mapping.length; ++i) {
      if (v[i] !== undefined) {
        entries.push([getControlName(mapping[i]), v[i]]);
      }
    }
    return Object.fromEntries(entries);
  });
});

/**
 * Allows you to scrub an audio file like a tape loop by passing values that represents the position in the audio file
 * in the optional array syntax ex: "0.5:2", the second value controls the speed of playback
 * @name scrub
 * @tags samples
 * @memberof Pattern
 * @returns Pattern
 * @example
 * samples('github:switchangel/pad')
 * s("swpad:0").scrub("{0.1!2 .25@3 0.7!2 <0.8:1.5>}%8")
 * @example
 * samples('github:yaxu/clean-breaks/main');
 * s("amen/4").fit().scrub("{0@3 0@2 4@3}%8".div(16))
 */

export const scrub = register(
  'scrub',
  (beginPat, pat) => {
    return beginPat.outerBind((v) => {
      if (!Array.isArray(v)) {
        v = [v];
      }
      const [beginVal, speedMultiplier = 1] = v;

      return pat.begin(beginVal).mul(speed(speedMultiplier)).clip(1);
    });
  },
  false,
);

const subControlAliases = new Map();
const registerSubControl = (control, subControl, ...aliases) => {
  const aliasMap = subControlAliases.get(control) ?? new Map();
  const allKeys = new Set([subControl, ...aliases]);
  for (const alias of allKeys) {
    aliasMap.set(String(alias).toLowerCase(), subControl);
  }
  subControlAliases.set(control, aliasMap);
};

const registerSubControls = (control, subControlAliases = []) => {
  for (const [subControl, ...aliases] of subControlAliases) {
    registerSubControl(control, subControl, ...aliases);
  }
};

const getMainSubcontrolName = (control, subKey) => {
  const aliasMap = subControlAliases.get(control);
  if (!aliasMap) return subKey;
  return aliasMap.get(String(subKey).toLowerCase()) ?? subKey;
};

registerSubControls('lfo', [
  ['control', 'c'],
  ['subControl', 'sc'],
  ['rate', 'r'],
  ['depth', 'dep', 'dr'],
  ['depthabs', 'da'],
  ['dcoffset', 'dc'],
  ['shape', 'sh'],
  ['skew', 'sk'],
  ['curve', 'cu'],
  ['sync', 's'],
  ['retrig', 'rt'],
  ['fxi'],
]);
registerSubControls('env', [
  ['control', 'c'],
  ['subControl', 'sc'],
  ['attack', 'att', 'a'],
  ['decay', 'dec', 'd'],
  ['sustain', 'sus', 's'],
  ['release', 'rel', 'r'],
  ['depth', 'dep', 'dr'],
  ['depthabs', 'da'],
  ['acurve', 'ac'],
  ['dcurve', 'dc'],
  ['rcurve', 'rc'],
  ['fxi'],
]);
registerSubControls('bmod', [
  ['bus', 'b'],
  ['control', 'c'],
  ['subControl', 'sc'],
  ['depth', 'dep', 'dr'],
  ['depthabs', 'da'],
  ['dc'],
  ['fxi'],
]);

Pattern.prototype.modulate = function (type, config, idPat) {
  config = { control: undefined, ...config };
  const modulatorKeys = ['lfo', 'env', 'bmod'];
  if (!modulatorKeys.includes(type)) {
    logger(`[core] Modulation type ${type} not found. Please use one of 'lfo', 'env', 'bmod'`);
    return this;
  }
  let output = this;
  let defaultValue = undefined;
  // Copy value into a temporary `v` container and attach a single `id` (to be shared across
  // each config entry). At the output we destructure and throw away the id
  output = output.fmap((v) => (id) => ({ v, id })).appLeft(reify(idPat));
  for (const [rawKey, value] of Object.entries(config)) {
    const key = getMainSubcontrolName(type, rawKey);
    const valuePat = reify(value);
    output = output
      .fmap(({ v, id }) => (c) => {
        if (defaultValue === undefined) {
          // default control to the control set just before this in the chain
          // e.g. pat.gain(0.5).lfo({..}) will be a gain-LFO
          let control = getControlName(Object.keys(v).at(-1));
          if (modulatorKeys.includes(control)) {
            control = `${control}_${[...v[control].__ids].at(-1)}`;
          }
          defaultValue = control;
        }
        v[type] ??= { __ids: new Set() };
        const t = v[type];
        id ??= t.__ids.size;
        t[id] ??= { control: defaultValue };
        t.__ids.add(id); // keeps track of insertion order
        if (c === undefined) return { v, id };
        if (key === 'control' || key === 'subControl') {
          t[id][key] = getControlName(c);
        } else {
          t[id][key] = c;
        }
        return { v, id };
      })
      .appLeft(valuePat);
  }
  return output.fmap(({ v }) => v);
};

/**
 * Configures an LFO. Can be called in sequence like pat.lfo(...).lfo(...) to set up multiple LFOs.
 * There are two ways to declare which control will be modulated:
 * 1. Explicitly put `control` in the config (e.g. `lfo({ c: "lpf" })`)
 * 2. If the control parameter is absent, the control _immediately before_ the `lfo` call will be used
 *   (e.g. `s("saw").lpf(500).lfo()` to modulate `lpf`)
 *
 * Modulators can be referred to by `id` so that they can be updated later e.g. inside
 * a `sometimes`. See example below.
 *
 * @name lfo
 * @tags lfo, superdough
 * @param {Object} config LFO configuration.
 * @param {string | Pattern} [config.control] Node to modulate. Aliases: c
 * @param {string | Pattern} [config.subControl] Sub-control name to append to the control key. Aliases: sc
 * @param {number | Pattern} [config.rate] Modulation rate. Aliases: r
 * @param {number | Pattern} [config.sync] Tempo-synced modulation rate. Aliases: s
 * @param {number | Pattern} [config.depth] Relative modulation depth. Aliases: dep, dr
 * @param {number | Pattern} [config.depthabs] Absolute modulation depth. Aliases: da
 * @param {number | Pattern} [config.dcoffset] DC offset / bias for the waveform. Aliases: dc
 * @param {number | Pattern} [config.shape] Shape index. Aliases: sh
 * @param {number | Pattern} [config.skew] Skew amount. Aliases: sk
 * @param {number | Pattern} [config.curve] Exponential curve amount. Aliases: cu
 * @param {number | Pattern} [config.retrig] If > 0.5, the LFO will retrigger on each event. Aliases: rt
 * @param {number | Pattern} [config.fxi] FX index to target
 * @param {string | Pattern} id ID to use for this modulator
 * @returns Pattern
 *
 * @example
 * s("saw").note("F1").lpf(500).lfo()
 *
 * @example
 * s("saw").lfo().lpf(500).lfo({ s: 0.3 })
 *
 * @example
 * s("saw").lpf(500).diode(0.3)
 *   .lfo({ c: "lpf" })
 *
 * @example
 * s("pulse").lpf(500).lfo()
 *   .lfo({ c: "s" })
 *   .diode(0.3)
 *   .sometimes(x => x.lfo({ s: "8" }, 1)) // lfo #1 (0-indexed)
 *
 * @example
 * s("pulse").lpf(500).lfo({ depth: 4 }, 'lpf_mod')
 *   .lfo({ c: "s" })
 *   .diode(0.3)
 *   .sometimes(x => x.lfo({ s: "8" }, 'lpf_mod'))
 */
Pattern.prototype.lfo = function (config, id) {
  return this.modulate('lfo', config, id);
};
export const lfo = (config) => pure({}).lfo(config);

/**
 * Configures an envelope. Can be called in sequence like pat.env(...).env(...) to set up multiple envelopes
 * There are two ways to declare which control will be modulated:
 * 1. Explicitly put `control` in the config (e.g. `env({ c: "lpf" })`)
 * 2. If the control parameter is absent, the control _immediately before_ the `env` call will be used
 *   (e.g. `s("saw").lpf(500).env({ a: 1 })` to modulate `lpf`)
 *
 * Modulators can be referred to by `id` so that they can be updated later e.g. inside
 * a `sometimes`. See example below.
 *
 * @name env
 * @tags envelope, superdough
 * @param {Object} config Envelope configuration.
 * @param {string | Pattern} [config.control] Node to modulate. Aliases: c
 * @param {string | Pattern} [config.subControl] Sub-control name to append to the control key. Aliases: sc
 * @param {number | Pattern} [config.depth] Relative modulation depth. Aliases: dep, dr
 * @param {number | Pattern} [config.depthabs] Absolute modulation depth. Aliases: da
 * @param {number | Pattern} [config.attack] Time to reach depth. Aliases: att, a
 * @param {number | Pattern} [config.decay] Time to reach sustain. Aliases: dec, d
 * @param {number | Pattern} [config.sustain] Sustain depth. Aliases: sus, s
 * @param {number | Pattern} [config.release] Time to return to nominal value. Aliases: rel, r
 * @param {number | Pattern} [config.acurve] Snappiness of attack curve (-1 = relaxed, 1 = snappy). Aliases: ac
 * @param {number | Pattern} [config.dcurve] Snappiness of decay curve (-1 = relaxed, 1 = snappy). Aliases: dc
 * @param {number | Pattern} [config.rcurve] Snappiness of release curve (-1 = relaxed, 1 = snappy). Aliases: rc
 * @param {number | Pattern} [config.fxi] FX index to target
 * @param {string | Pattern} id ID to use for this modulator
 * @returns Pattern
 *
 * @example
 * s("saw").note("F1").lpf(500).env({ a: 1 })
 *
 * @example
 * s("saw").env({ d: 1 }).note("F1")
 *   .lpq(4).lpf(50)
 *   .env({ a: 0.1, d: 1, ac: 0.8, dc: 0.3, depth: 50 })
 *
 * @example
 * s("saw").lpf(500).diode(0.3)
 *   .env({ c: "lpf", a: 0.5, d: 0.5 })
 *
 * @example
 * s("pulse").lpf(500).env({ a: 1 })
 *   .env({ c: "s", a: 1 })
 *   .diode(0.3)
 *   .sometimes(x => x.env({ a: "0.5" }, 1)) // envelope #1 (0-indexed)
 *
 * @example
 * s("pulse").lpf(500).env({ a: 1 }, 'lpf_mod')
 *   .env({ c: "s", a: 1 })
 *   .diode(0.3)
 *   .sometimes(x => x.env({ a: "0.5" }, 'lpf_mod'))
 */
Pattern.prototype.env = function (config, id) {
  return this.modulate('env', config, id);
};
export const env = (config) => pure({}).env(config);

/**
 * Modulates with the output from a given `bus`.
 * Can be called in sequence like pat.bmod(...).bmod(...) to set up multiple modulators
 *
 * Send to an audio bus with `otherPat.bus(..)`.
 *
 * There are two ways to declare which control will be modulated:
 * 1. Explicitly put `control` in the config (e.g. `bmod({ id: 2, c: "lpf" })`)
 * 2. If the control parameter is absent, the control _immediately before_ the `bmod` call will be used
 *   (e.g. `s("saw").lpf(500).bmod({ id: 2 })` to modulate `lpf`)
 *
 * Modulators can be referred to by `id` so that they can be updated later e.g. inside
 * a `sometimes`. See example below.
 *
 * @name bmod
 * @tags superdough
 * @param {Object} config Bus modulation configuration.
 * @param {string | Pattern} [config.bus] Bus to get modulation signal from
 * @param {string | Pattern} [config.control] Node to modulate. Aliases: c
 * @param {string | Pattern} [config.subControl] Sub-control name to append to the control key. Aliases: sc
 * @param {number | Pattern} [config.depth] Relative modulation depth. Aliases: dep, dr
 * @param {number | Pattern} [config.depthabs] Absolute modulation depth. Aliases: da
 * @param {number | Pattern} [config.dc] DC offset prior to application
 * @param {number | Pattern} [config.fxi] FX index to target
 * @param {string | Pattern} id ID to use for this modulator
 * @returns Pattern
 *
 * @example
 * modulator: s("one").seg(64).gain(slider(0, 0, 1)).bus(1).dry(0)
 * carrier: s("saw").bmod({ b: 1 })
 *
 */
Pattern.prototype.bmod = function (config, id) {
  return this.modulate('bmod', config, id);
};
export const bmod = (config) => pure({}).bmod(config);

/**
 * Transient shaper. Gives independent control over the emphasis on transients
 * and sustains
 *
 * @name transient
 * @tags superdough
 * @param {number | Pattern} attack Emphasis on transients; between -1 (deaccentuate) and 1 (accentuate)
 * @param {number | Pattern} sustain Emphasis on the sustains; between -1 (deaccentuate) and 1 (accentuate)
 * @example
 * s("bd").transient("<-1 -0.5 0 0.5 1>")
 * @example
 * s("hh*16").bank("tr909").transient("<-1:1 1:-1>")
 */
export const { transient } = registerControl(['transient', 'transsustain']);

export const { FXrelease, FXrel, FXr, fxr } = registerControl('FXrelease', 'FXrel', 'FXr', 'fxr');
