/*
signal.mjs - continuous patterns
Copyright (C) 2024 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/signal.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Hap } from './hap.mjs';
import { Pattern, fastcat, pure, register, reify, silence, stack, sequenceP } from './pattern.mjs';
import { _mod } from './util.mjs';
import Fraction from './fraction.mjs';

import { id, keyAlias, getCurrentKeyboardState } from './util.mjs';

export function steady(value) {
  // A continuous value
  return new Pattern((state) => [new Hap(undefined, state.span, value)]);
}

export const signal = (func) => {
  const query = (state) => [new Hap(undefined, state.span, func(state.span.begin, state.controls))];
  return new Pattern(query);
};

/**
 *  A sawtooth signal between 0 and 1.
 *
 * @return {Pattern}
 * @tags generators
 * @example
 * note("<c3 [eb3,g3] g2 [g3,bb3]>*8")
 * .clip(saw.slow(2))
 * @example
 * n(saw.range(0,8).segment(8))
 * .scale('C major')
 *
 */
export const saw = signal((t) => _mod(t, 1));

/**
 *  A sawtooth signal between -1 and 1 (like `saw`, but bipolar).
 *
 * @return {Pattern}
 * @tags generators
 */
export const saw2 = saw.toBipolar();

/**
 *  A sawtooth signal between 1 and 0 (like `saw`, but flipped).
 *
 * @return {Pattern}
 * @tags generators
 * @example
 * note("<c3 [eb3,g3] g2 [g3,bb3]>*8")
 * .clip(isaw.slow(2))
 * @example
 * n(isaw.range(0,8).segment(8))
 * .scale('C major')
 *
 */
export const isaw = signal((t) => 1 - _mod(t, 1));

/**
 *  A sawtooth signal between 1 and -1 (like `saw2`, but flipped).
 *
 * @return {Pattern}
 * @tags generators
 */
export const isaw2 = isaw.toBipolar();

/**
 *  A sine signal between -1 and 1 (like `sine`, but bipolar).
 *
 * @return {Pattern}
 * @tags generators
 */
export const sine2 = signal((t) => Math.sin(Math.PI * 2 * t));

/**
 *  A sine signal between 0 and 1.
 * @return {Pattern}
 * @tags generators
 * @example
 * n(sine.segment(16).range(0,15))
 * .scale("C:minor")
 *
 */
export const sine = sine2.fromBipolar();

/**
 *  A cosine signal between 0 and 1.
 *
 * @return {Pattern}
 * @tags generators
 * @example
 * n(stack(sine,cosine).segment(16).range(0,15))
 * .scale("C:minor")
 *
 */
export const cosine = sine._early(Fraction(1).div(4));

/**
 *  A cosine signal between -1 and 1 (like `cosine`, but bipolar).
 *
 * @return {Pattern}
 * @tags generators
 */
export const cosine2 = sine2._early(Fraction(1).div(4));

/**
 *  A square signal between 0 and 1.
 * @return {Pattern}
 * @tags generators
 * @example
 * n(square.segment(4).range(0,7)).scale("C:minor")
 *
 */
export const square = signal((t) => Math.floor(_mod((t * 2), 2)));

/**
 *  A square signal between -1 and 1 (like `square`, but bipolar).
 *
 * @return {Pattern}
 * @tags generators
 */
export const square2 = square.toBipolar();

/**
 *  A triangle signal between 0 and 1.
 *
 * @return {Pattern}
 * @tags generators
 * @example
 * n(tri.segment(8).range(0,7)).scale("C:minor")
 *
 */
export const tri = fastcat(saw, isaw);

/**
 *  A triangle signal between -1 and 1 (like `tri`, but bipolar).
 *
 * @return {Pattern}
 * @tags generators
 */
export const tri2 = fastcat(saw2, isaw2);

/**
 *  An inverted triangle signal between 1 and 0 (like `tri`, but flipped).
 *
 * @return {Pattern}
 * @tags generators
 * @example
 * n(itri.segment(8).range(0,7)).scale("C:minor")
 *
 */
export const itri = fastcat(isaw, saw);

/**
 *  An inverted triangle signal between -1 and 1 (like `itri`, but bipolar).
 *
 * @return {Pattern}
 * @tags generators
 */
export const itri2 = fastcat(isaw2, saw2);

/**
 *  A signal representing the cycle time.
 *
 * @return {Pattern}
 * @tags generators
 */
export const time = signal(id);

/**
 *  The mouse's x position value ranges from 0 to 1.
 * @name mousex
 * @return {Pattern}
 * @tags external_io
 * @example
 * n(mousex.segment(4).range(0,7)).scale("C:minor")
 *
 */

/**
 *  The mouse's y position value ranges from 0 to 1.
 * @name mousey
 * @return {Pattern}
 * @tags external_io
 * @example
 * n(mousey.segment(4).range(0,7)).scale("C:minor")
 *
 */
let _mouseY = 0,
  _mouseX = 0;
if (typeof window !== 'undefined') {
  //document.onmousemove = (e) => {
  document.addEventListener('mousemove', (e) => {
    _mouseY = e.clientY / document.body.clientHeight;
    _mouseX = e.clientX / document.body.clientWidth;
  });
}

export const mousey = signal(() => _mouseY);
export const mouseY = signal(() => _mouseY);
export const mousex = signal(() => _mouseX);
export const mouseX = signal(() => _mouseX);

// Random number generators

// Produce "Avalanche effect" where flipping a single bit of x
// results in all output bits flipping with probability 0.5
// See e.g. https://github.com/aappleby/smhasher/blob/0ff96f7835817a27d0487325b6c16033e2992eb5/src/MurmurHash3.cpp#L68-L77
const _murmurHashFinalizer = (x) => {
  x |= 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return x >>> 0; // unsigned
};

// Convert t to a 32 bit integer, preserving temporal resolution down to 1/2^29
const _tToT = (t) => {
  return Math.floor(t * 536870912);
};

// Used to decorrelate nearby T, i, and seed prior to hashing
const _decorrelate = (T, i = 0, seed = 0) => {
  const lowBits = (T >>> 0) >>> 0;
  const highBits = Math.floor(T / 4294967296) >>> 0; // 2^32
  let key = lowBits ^ Math.imul(highBits ^ 0x85ebca6b, 0xc2b2ae35);
  key ^= Math.imul(i ^ 0x7f4a7c15, 0x9e3779b9);
  key ^= Math.imul(seed ^ 0x165667b1, 0x27d4eb2d);
  return key >>> 0;
};

const randAt = (T, i = 0, seed = 0) => {
  return _murmurHashFinalizer(_decorrelate(T, i, seed)) / 4294967296; // 2^32
};

// n samples at time t
const timeToRands = (t, n, seed = 0) => {
  const T = _tToT(t);
  if (n === 1) {
    return randAt(T, 0, seed);
  }
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = randAt(T, i, seed);
  return out;
};

// Old random signals. Currently the default, but can also be chosen via
// `useRNG('legacy')`

// stretch 300 cycles over the range of [0,2**29 == 536870912) then apply the xorshift algorithm
const __xorwise = (x) => {
  const a = (x << 13) ^ x;
  const b = (a >> 17) ^ a;
  return (b << 5) ^ b;
};
const __frac = (x) => x - Math.trunc(x);
const __timeToIntSeed = (x) => __xorwise(Math.trunc(__frac(x / 300) * 536870912));
const __intSeedToRand = (x) => (x % 536870912) / 536870912;
const __timeToRandsPrime = (seed, n) => {
  if (n === 1) {
    return Math.abs(__intSeedToRand(seed));
  }
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(__intSeedToRand(seed));
    seed = __xorwise(seed);
  }
  return result;
};
const __timeToRands = (t, n) => __timeToRandsPrime(__timeToIntSeed(t), n);

// End old random

let RNG_MODE = 'legacy';
export const getRandsAtTime = (t, n = 1, seed = 0) => {
  return RNG_MODE === 'legacy' ? __timeToRands(t + seed, n) : timeToRands(t, n, seed);
};

/**
 * Sets which random number generator to use. Historically Strudel would
 * use `useRNG('legacy')`, which remains the default. To use a new more statistically
 * precise RNG, try `useRNG('precise')`.
 *
 * @name useRNG
 * @tags generators, math
 * @param {string} mod - Mode. One of 'legacy', 'precise'
 * @example
 * useRNG('legacy')
 * // Repeats every 300 cycles
 * $: n(irand(50)).seg(16).scale("C:minor").ribbon(88, 32)
 * $: n(irand(50)).seg(16).scale("C:minor").ribbon(388, 32)
 */
export const useRNG = (mode = 'legacy') => (RNG_MODE = mode);

/**
 * A discrete pattern of numbers from 0 to n-1
 * @tags generators
 * @example
 * n(run(4)).scale("C4:pentatonic")
 * // n("0 1 2 3").scale("C4:pentatonic")
 */
export const run = (n) => saw.range(0, n).round().segment(n);

/**
 * Creates a binary pattern from a number.
 *
 * @name binary
 * @tags generators
 * @param {number} n - input number to convert to binary
 * @example
 * "hh".s().struct(binary(5))
 * // "hh".s().struct("1 0 1")
 */
export const binary = (n) => {
  const nBits = reify(n).log2().floor().add(1);
  return binaryN(n, nBits);
};

/**
 * Creates a binary pattern from a number, padded to n bits long.
 *
 * @name binaryN
 * @tags generators
 * @param {number} n - input number to convert to binary
 * @param {number} nBits - pattern length, defaults to 16
 * @example
 * "hh".s().struct(binaryN(55532, 16))
 * // "hh".s().struct("1 1 0 1 1 0 0 0 1 1 1 0 1 1 0 0")
 */
export const binaryN = (n, nBits = 16) => {
  nBits = reify(nBits);
  // Shift and mask, putting msb on the right-side
  const bitPos = run(nBits).mul(-1).add(nBits.sub(1));
  return reify(n).segment(nBits).brshift(bitPos).band(pure(1));
};

/**
 * Creates a binary list pattern from a number.
 *
 * @name binaryL
 * @tags generators
 * @param {number} n - input number to convert to binary
 * s("saw").seg(8)
 *   .partials(binaryL(irand(4096).add(1)))
 */
export const binaryL = (n) => {
  const nBits = reify(n).log2().floor().add(1);
  return binaryNL(n, nBits);
};

/**
 * Creates a binary list pattern from a number, padded to n bits long.
 *
 * @name binaryNL
 * @tags generators
 * @param {number} n - input number to convert to binary
 * @param {number} nBits - pattern length, defaults to 16
 */
export const binaryNL = (n, nBits = 16) => {
  return reify(n)
    .withValue((v) => (bits) => {
      const bList = [];
      for (let i = bits - 1; i >= 0; i--) {
        bList.push((v >> i) & 1);
      }
      return bList;
    })
    .appLeft(reify(nBits));
};

/**
 * Creates a list of random numbers of the given length
 *
 * @name randL
 * @tags generators
 * @param {number} n Number of random numbers to sample
 * @example
 * s("saw").seg(16).n(irand(12)).scale("F1:minor")
 *   .partials(randL(8))
 */
export const randL = (n) => {
  return signal((t) => (nVal) => getRandsAtTime(t, nVal).map(Math.abs)).appLeft(reify(n));
};

export const randrun = (n) => {
  return signal((t, controls) => {
    // Without adding 0.5, the first cycle is always 0,1,2,3,...
    let rands = getRandsAtTime(t.floor().add(0.5), n, controls.randSeed);
    // Support n = 1
    if (!Array.isArray(rands)) rands = [rands];
    const nums = rands
      .map((n, i) => [n, i])
      .sort((a, b) => (a[0] > b[0]) - (a[0] < b[0]))
      .map((x) => x[1]);
    const i = _mod(t.cyclePos().mul(n).floor(), n);
    return nums[i];
  })._segment(n);
};

const _rearrangeWith = (ipat, n, pat) => {
  const pats = [...Array(n).keys()].map((i) => pat.zoom(Fraction(i).div(n), Fraction(i + 1).div(n)));
  return ipat.fmap((i) => pats[i].repeatCycles(n)._fast(n)).innerJoin();
};

/**
 * Slices a pattern into the given number of parts, then plays those parts in random order.
 * Each part will be played exactly once per cycle.
 * @name shuffle
 * @tags temporal
 * @example
 * note("c d e f").sound("piano").shuffle(4)
 * @example
 * seq("c d e f".shuffle(4), "g").note().sound("piano")
 */
export const shuffle = register('shuffle', (n, pat) => {
  return _rearrangeWith(randrun(n), n, pat);
});

/**
 * Slices a pattern into the given number of parts, then plays those parts at random. Similar to `shuffle`,
 * but parts might be played more than once, or not at all, per cycle.
 * @name scramble
 * @tags temporal
 * @example
 * note("c d e f").sound("piano").scramble(4)
 * @example
 * seq("c d e f".scramble(4), "g").note().sound("piano")
 */
export const scramble = register('scramble', (n, pat) => {
  return _rearrangeWith(_irand(n)._segment(n), n, pat);
});

/**
 * Modify a pattern by applying a function to the `randomSeed` control if present
 *
 * @tags math
 * @param {Function} func Function from seed (or undefined) to seed (or undefined)
 * @param {Pattern} pat Pattern to update
 * @returns Pattern
 */
export const withSeed = (func, pat) => {
  return new Pattern((state) => {
    let { randSeed, ...controls } = state.controls;
    randSeed = func(randSeed);
    return pat.query(state.setControls({ ...controls, randSeed }));
  }, pat._steps);
};

/**
 * Change the seed for random signals. Normally, random signals depend on time,
 * so two patterns at the same time will have the same random values. Specifying
 * a new seed changes the signal output by `rand`. This also affects other functions
 * that use randomness, like `shuffle` and `sometimes`.
 *
 * @name seed
 * @tags math
 * @param {number} n A new seed. Can be any number.
 * @example
 * $: s("hh*4").degrade();
 * $: s("bd*4").degrade().seed(1); // Will degrade different events from the hi-hat
 */
export const seed = register('seed', (n, pat) => {
  return withSeed(() => n, pat);
});

/**
 * A continuous pattern of random numbers, between 0 and 1.
 *
 * @name rand
 * @tags generators
 * @example
 * // randomly change the cutoff
 * s("bd*4,hh*8").cutoff(rand.range(500,8000))
 *
 */
export const rand = signal((t, controls) => getRandsAtTime(t, 1, controls.randSeed));
/**
 * A continuous pattern of random numbers, between -1 and 1
 * @tags generators
 */
export const rand2 = rand.toBipolar();

export const _brandBy = (p) => rand.fmap((x) => x < p);

/**
 * A continuous pattern of 0 or 1 (binary random), with a probability for the value being 1
 *
 * @name brandBy
 * @tags generators
 * @param {number} probability - a number between 0 and 1
 * @example
 * s("hh*10").pan(brandBy(0.2))
 */
export const brandBy = (pPat) => reify(pPat).fmap(_brandBy).innerJoin();

/**
 * A continuous pattern of 0 or 1 (binary random)
 *
 * @name brand
 * @tags generators
 * @example
 * s("hh*10").pan(brand)
 */
export const brand = _brandBy(0.5);

export const _irand = (i) => rand.fmap((x) => Math.trunc(x * i));

/**
 * A continuous pattern of random integers, between 0 and n-1.
 *
 * @name irand
 * @tags generators
 * @param {number} n max value (exclusive)
 * @example
 * // randomly select scale notes from 0 - 7 (= C to C)
 * n(irand(8)).struct("x x*2 x x*3").scale("C:minor")
 *
 */
export const irand = (ipat) => reify(ipat).fmap(_irand).innerJoin();

export const __chooseWith = (pat, xs) => {
  xs = xs.map(reify);
  if (xs.length == 0) {
    return silence;
  }

  return pat.range(0, xs.length).fmap((i) => {
    const key = Math.min(Math.max(Math.floor(i), 0), xs.length - 1);
    return xs[key];
  });
};
/**
 * Choose from the list of values (or patterns of values) using the given
 * pattern of numbers, which should be in the range of 0..1
 * @tags temporal
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 * @example
 * note("c2 g2!2 d2 f1").s(chooseWith(sine.fast(2), ["sawtooth", "triangle", "bd:6"]))
 */
export const chooseWith = (pat, xs) => {
  return __chooseWith(pat, xs).outerJoin();
};

/**
 * As with {chooseWith}, but the structure comes from the chosen values, rather
 * than the pattern you're using to choose with.
 * @tags temporal
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 */
export const chooseInWith = (pat, xs) => {
  return __chooseWith(pat, xs).innerJoin();
};

/**
 * Chooses randomly from the given list of elements.
 * @tags temporal
 * @param  {...any} xs values / patterns to choose from.
 * @returns {Pattern} - a continuous pattern.
 * @example
 * note("c2 g2!2 d2 f1").s(choose("sine", "triangle", "bd:6"))
 */
export const choose = (...xs) => chooseWith(rand, xs);

// todo: doc
export const chooseIn = (...xs) => chooseInWith(rand, xs);
export const chooseOut = choose;

/**
 * Chooses from the given list of values (or patterns of values), according
 * to the pattern that the method is called on. The pattern should be in
 * the range 0 .. 1.
 * @tags temporal
 * @param  {...any} xs
 * @returns {Pattern}
 */
Pattern.prototype.choose = function (...xs) {
  return chooseWith(this, xs);
};

/**
 * As with choose, but the pattern that this method is called on should be
 * in the range -1 .. 1
 * @tags temporal
 * @param  {...any} xs
 * @returns {Pattern}
 */
Pattern.prototype.choose2 = function (...xs) {
  return chooseWith(this.fromBipolar(), xs);
};

/**
 * Picks one of the elements at random each cycle.
 * @tags temporal
 * @synonyms randcat
 * @returns {Pattern}
 * @example
 * chooseCycles("bd", "hh", "sd").s().fast(8)
 * @example
 * s("bd | hh | sd").fast(8)
 */
export const chooseCycles = (...xs) => chooseInWith(rand.segment(1), xs);

export const randcat = chooseCycles;

const _wchooseWith = function (pat, ...pairs) {
  // A list of patterns of values
  const values = pairs.map((pair) => reify(pair[0]));

  // A list of weight patterns
  const weights = [];

  let total = pure(0);
  for (const pair of pairs) {
    // 'add' accepts either values or patterns of values here, so no need
    // to explicitly reify
    total = total.add(pair[1]);
    // accumulate our list of weight patterns
    weights.push(total);
  }
  // a pattern of lists of weights
  const weightspat = sequenceP(weights);

  // Takes a number from 0-1, returns a pattern of patterns of values
  const match = function (r) {
    const findpat = total.mul(r);
    return weightspat.fmap((weights) => (find) => values[weights.findIndex((x) => x > find, weights)]).appLeft(findpat);
  };
  // This returns a pattern of patterns.. The innerJoin is in wchooseCycles
  return pat.bind(match);
};

const wchooseWith = (...args) => _wchooseWith(...args).outerJoin();

/**
 * Chooses randomly from the given list of elements by giving a probability to each element
 * @tags temporal
 * @param {...any} pairs arrays of value and weight
 * @returns {Pattern} - a continuous pattern.
 * @example
 * note("c2 g2!2 d2 f1").s(wchoose(["sine",10], ["triangle",1], ["bd:6",1]))
 */
export const wchoose = (...pairs) => wchooseWith(rand, ...pairs);

/**
 * Picks one of the elements at random each cycle by giving a probability to each element
 * @tags temporal
 * @synonyms wrandcat
 * @returns {Pattern}
 * @example
 * wchooseCycles(["bd",10], ["hh",1], ["sd",1]).s().fast(8)
 * @example
 * wchooseCycles(["c c c",5], ["a a a",3], ["f f f",1]).fast(4).note()
 * @example
 * // The probability can itself be a pattern
 * wchooseCycles(["bd(3,8)","<5 0>"], ["hh hh hh",3]).fast(4).s()
 */
export const wchooseCycles = (...pairs) => _wchooseWith(rand.segment(1), ...pairs).innerJoin();

export const wrandcat = wchooseCycles;

function _perlin(t, seed = 0) {
  let ta = Math.floor(t);
  let tb = ta + 1;
  const smootherStep = (x) => 6.0 * x ** 5 - 15.0 * x ** 4 + 10.0 * x ** 3;
  const interp = (x) => (a) => (b) => a + smootherStep(x) * (b - a);
  const ra = getRandsAtTime(ta, 1, seed);
  const rb = getRandsAtTime(tb, 1, seed);
  const v = interp(t - ta)(ra)(rb);
  return v;
}

function _berlin(t, seed = 0) {
  const prevRidgeStartIndex = Math.floor(t);
  const nextRidgeStartIndex = prevRidgeStartIndex + 1;

  const prevRidgeBottomPoint = getRandsAtTime(prevRidgeStartIndex, 1, seed);
  const height = getRandsAtTime(nextRidgeStartIndex, 1, seed);
  const nextRidgeTopPoint = prevRidgeBottomPoint + height;

  const currentPercent = (t - prevRidgeStartIndex) / (nextRidgeStartIndex - prevRidgeStartIndex);
  const interp = (a, b, t) => {
    return a + t * (b - a);
  };
  return interp(prevRidgeBottomPoint, nextRidgeTopPoint, currentPercent) / 2;
}

/**
 * Generates a continuous pattern of [perlin noise](https://en.wikipedia.org/wiki/Perlin_noise), in the range 0..1.
 *
 * @tags generators
 * @name perlin
 * @example
 * // randomly change the cutoff
 * s("bd*4,hh*8").cutoff(perlin.range(500,8000))
 *
 */
export const perlin = signal((t, controls) => _perlin(t, controls.randSeed));

/**
 * Generates a continuous pattern of [berlin noise](conceived by Jame Coyne and Jade Rowland as a joke but turned out to be surprisingly cool and useful,
 * like perlin noise but with sawtooth waves), in the range 0..1.
 *
 * @tags generators
 * @name berlin
 * @example
 * // ascending arpeggios
 * n("0!16".add(berlin.fast(4).mul(14))).scale("d:minor")
 *
 */
export const berlin = signal((t, controls) => _berlin(t, controls.randSeed));

export const degradeByWith = register(
  'degradeByWith',
  (withPat, x, pat) => pat.fmap((a) => (_) => a).appLeft(withPat.filterValues((v) => v > x)),
  true,
  true,
);

/**
 * Randomly removes events from the pattern by a given amount.
 * 0 = 0% chance of removal
 * 1 = 100% chance of removal
 *
 * @tags temporal
 * @name degradeBy
 * @memberof Pattern
 * @param {number} amount - a number between 0 and 1
 * @returns Pattern
 * @example
 * s("hh*8").degradeBy(0.2)
 * @example
 * s("[hh?0.2]*8")
 * @example
 * //beat generator
 * s("bd").segment(16).degradeBy(.5).ribbon(16,1)
 */
export const degradeBy = register(
  'degradeBy',
  function (x, pat) {
    return pat._degradeByWith(rand, x);
  },
  true,
  true,
);

/**
 *
 * Randomly removes 50% of events from the pattern. Shorthand for `.degradeBy(0.5)`
 *
 * @tags temporal
 * @name degrade
 * @memberof Pattern
 * @returns Pattern
 * @example
 * s("hh*8").degrade()
 * @example
 * s("[hh?]*8")
 */
export const degrade = register('degrade', (pat) => pat._degradeBy(0.5), true, true);

/**
 * Inverse of `degradeBy`: Randomly removes events from the pattern by a given amount.
 * 0 = 100% chance of removal
 * 1 = 0% chance of removal
 * Events that would be removed by degradeBy are let through by undegradeBy and vice versa (see second example).
 *
 * @tags temporal
 * @name undegradeBy
 * @memberof Pattern
 * @param {number} amount - a number between 0 and 1
 * @returns Pattern
 * @example
 * s("hh*8").undegradeBy(0.2)
 * @example
 * s("hh*10").layer(
 *   x => x.degradeBy(0.2).pan(0),
 *   x => x.undegradeBy(0.8).pan(1)
 * )
 */
export const undegradeBy = register(
  'undegradeBy',
  function (x, pat) {
    return pat._degradeByWith(
      rand.fmap((r) => 1 - r),
      x,
    );
  },
  true,
  true,
);

/**
 * Inverse of `degrade`: Randomly removes 50% of events from the pattern. Shorthand for `.undegradeBy(0.5)`
 * Events that would be removed by degrade are let through by undegrade and vice versa (see second example).
 *
 * @tags temporal
 * @name undegrade
 * @memberof Pattern
 * @returns Pattern
 * @example
 * s("hh*8").undegrade()
 * @example
 * s("hh*10").layer(
 *   x => x.degrade().pan(0),
 *   x => x.undegrade().pan(1)
 * )
 */
export const undegrade = register('undegrade', (pat) => pat._undegradeBy(0.5), true, true);

/**
 *
 * Randomly applies the given function by the given probability.
 * Similar to `someCyclesBy`
 *
 * @tags temporal
 * @name sometimesBy
 * @memberof Pattern
 * @param {number | Pattern} probability - a number between 0 and 1
 * @param {function} function - the transformation to apply
 * @returns Pattern
 * @example
 * s("hh*8").sometimesBy(.4, x=>x.speed("0.5"))
 */

export const sometimesBy = register('sometimesBy', function (patx, func, pat) {
  return reify(patx)
    .fmap((x) => stack(pat._degradeBy(x), func(pat._undegradeBy(1 - x))))
    .innerJoin();
});

/**
 *
 * Applies the given function with a 50% chance
 *
 * @tags temporal
 * @name sometimes
 * @memberof Pattern
 * @param {function} function - the transformation to apply
 * @returns Pattern
 * @example
 * s("hh*8").sometimes(x=>x.speed("0.5"))
 */
export const sometimes = register('sometimes', function (func, pat) {
  return pat._sometimesBy(0.5, func);
});

/**
 *
 * Randomly applies the given function by the given probability on a cycle by cycle basis.
 * Similar to `sometimesBy`
 *
 * @name someCyclesBy
 * @memberof Pattern
 * @param {number | Pattern} probability - a number between 0 and 1
 * @param {function} function - the transformation to apply
 * @returns Pattern
 * @tags temporal
 * @example
 * s("bd,hh*8").someCyclesBy(.3, x=>x.speed("0.5"))
 */

export const someCyclesBy = register('someCyclesBy', function (patx, func, pat) {
  return reify(patx)
    .fmap((x) =>
      stack(
        pat._degradeByWith(rand._segment(1), x),
        func(pat._degradeByWith(rand.fmap((r) => 1 - r)._segment(1), 1 - x)),
      ),
    )
    .innerJoin();
});

/**
 *
 * Shorthand for `.someCyclesBy(0.5, fn)`
 *
 * @name someCycles
 * @memberof Pattern
 * @returns Pattern
 * @tags temporal
 * @example
 * s("bd,hh*8").someCycles(x=>x.speed("0.5"))
 */
export const someCycles = register('someCycles', function (func, pat) {
  return pat._someCyclesBy(0.5, func);
});

/**
 *
 * Shorthand for `.sometimesBy(0.75, fn)`
 *
 * @name often
 * @memberof Pattern
 * @returns Pattern
 * @tags temporal
 * @example
 * s("hh*8").often(x=>x.speed("0.5"))
 */
export const often = register('often', function (func, pat) {
  return pat.sometimesBy(0.75, func);
});

/**
 *
 * Shorthand for `.sometimesBy(0.25, fn)`
 *
 * @name rarely
 * @memberof Pattern
 * @returns Pattern
 * @tags temporal
 * @example
 * s("hh*8").rarely(x=>x.speed("0.5"))
 */
export const rarely = register('rarely', function (func, pat) {
  return pat.sometimesBy(0.25, func);
});

/**
 *
 * Shorthand for `.sometimesBy(0.1, fn)`
 *
 * @tags temporal
 * @name almostNever
 * @memberof Pattern
 * @returns Pattern
 * @example
 * s("hh*8").almostNever(x=>x.speed("0.5"))
 */
export const almostNever = register('almostNever', function (func, pat) {
  return pat.sometimesBy(0.1, func);
});

/**
 *
 * Shorthand for `.sometimesBy(0.9, fn)`
 *
 * @tags temporal
 * @name almostAlways
 * @memberof Pattern
 * @returns Pattern
 * @example
 * s("hh*8").almostAlways(x=>x.speed("0.5"))
 */
export const almostAlways = register('almostAlways', function (func, pat) {
  return pat.sometimesBy(0.9, func);
});

/**
 *
 * Shorthand for `.sometimesBy(0, fn)` (never calls fn)
 *
 * @tags temporal
 * @name never
 * @memberof Pattern
 * @returns Pattern
 * @example
 * s("hh*8").never(x=>x.speed("0.5"))
 */
export const never = register('never', function (_, pat) {
  return pat;
});

/**
 *
 * Shorthand for `.sometimesBy(1, fn)` (always calls fn)
 *
 * @tags temporal
 * @name always
 * @memberof Pattern
 * @returns Pattern
 * @example
 * s("hh*8").always(x=>x.speed("0.5"))
 */
export const always = register('always', function (func, pat) {
  return func(pat);
});

//keyname: string | Array<string>
//keyname reference: https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
export function _keyDown(keyname) {
  if (Array.isArray(keyname) === false) {
    keyname = [keyname];
  }
  const keyState = getCurrentKeyboardState();
  return keyname.every((x) => {
    const keyName = keyAlias.get(x) ?? x;
    return keyState[keyName];
  });
}

/**
 *
 * Do something on a keypress, or array of keypresses
 * [Key name reference](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)
 *
 * @tags external_io
 * @name whenKey
 * @memberof Pattern
 * @returns Pattern
 * @example
 * s("bd(5,8)").whenKey("Control:j", x => x.segment(16).color("red")).whenKey("Control:i", x => x.fast(2).color("blue"))
 */

export const whenKey = register('whenKey', function (input, func, pat) {
  return pat.when(_keyDown(input), func);
});

/**
 *
 * returns true when a key or array of keys is held
 * [Key name reference](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)
 *
 * @tags external_io
 * @name keyDown
 * @memberof Pattern
 * @returns Pattern
 * @example
 * keyDown("Control:j").pick([s("bd(5,8)"), s("cp(3,8)")])
 */

export const keyDown = register('keyDown', function (pat) {
  return pat.fmap(_keyDown);
});

/**
 * A pattern measuring the duration of events,
 * in cycles per event. `cyclesPer` doesn't have structure itself, but takes structure, and therefore
 * event durations, from the pattern that it is combined with.
 * For example `cyclesPer.struct("1 1 [1 1] 1")` would give the same as `"0.25 0.25 [0.125 0.125] 0.25"`.
 * See also its reciprocal, `per`, also known as `perCycle`.
 *
 * @tags temporal
 * @example
 * // Shorter events are lower in pitch
 * sound("saw saw [saw saw] saw")
 *   .note(cyclesPer.range(50, 100))
 * @example
 * sound("bd sd [bd bd] sd*4 [- sd] [bd [bd bd]]")
 *   .note(cyclesPer.add(20))
 */
export const cyclesPer = new Pattern(function (state) {
  return [new Hap(undefined, state.span, state.span.duration)];
});

/**
 * A pattern measuring the 'shortness' of events, or in other words, the duration of pattern events,
 * in events per cycle. `per` doesn't have structure itself, but takes structure, and therefore
 * event durations, from the pattern that it is combined with.
 * For example `per.struct("1 1 [1 1] 1")` would give the same as `"4 4 [8 8] 4"`.
 * See also its reciprocal, `cyclesPer`.
 * @tags temporal
 * @synonyms perCycle
 * @example
 * // Shorter events are more distorted
 * n("0 0*2 0 0*2 0 [0 0 0]@2").sound("bd")
 *  .distort(per.div(2))
 */
export const per = new Pattern(function (state) {
  return [new Hap(undefined, state.span, Fraction(1).div(state.span.duration))];
});

export const perCycle = per;

/**
 * Like `per` but measures the shortness of events according to an exponential curve. In
 * particular, where the event duration halves, the
 * returned value increases by one. `perx.struct("1 1 [1 [1 1]] 1")` would therefore be
 * the same as `"3 3 [4 [5 5]] 3"`.
 * @tags temporal
 */
export const perx = new Pattern(function (state) {
  const n = Fraction(1).div(state.span.duration);
  return [new Hap(undefined, state.span, Math.log(n) / Math.log(2) + 1)];
});
