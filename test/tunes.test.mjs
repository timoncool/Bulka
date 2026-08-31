import { queryCode, testCycles } from './runtime.mjs';
import * as tunes from '../website/src/repl/tunes.mjs';
import { describe, it } from 'vitest';

const tuneKeys = Object.keys(tunes);

// Node 24 tightened Number→string rounding; clamp decimals so snapshots stay stable across engines.
const roundFloatStrings = (input, precision = 12) => {
  // if matches a decimal number ex: 12.34, -0.5, 0.123, 99.0, 1.932093850293
  const regex = /-?\d+\.\d+/g;
  return input.replace(regex, (match) => {
    // converts the literal to a number, performs round to nearest (ties to even)
    // at the requested precision, and returns the rounded decimal string
    const rounded = Number(match).toFixed(precision);
    // trims trailing zeros (and a dangling dot) after rounding, so the displayed string looks tidy
    return rounded.replace(/\.?0+$/, '').replace(/\.$/, '');
  });
};

describe('renders tunes', () => {
  tuneKeys.forEach((key) => {
    it(`tune: ${key}`, async ({ expect }) => {
      const haps = await queryCode(tunes[key], testCycles[key] || 1);
      const normalized = haps.map((hap) => roundFloatStrings(hap));
      expect(normalized).toMatchSnapshot();
    });
  });
});
