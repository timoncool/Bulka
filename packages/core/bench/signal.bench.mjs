import { describe, bench } from 'vitest';

import { calculateSteps, rand, useRNG } from '../index.mjs';

const testingResolution = 128;

const _generateRandomPattern = () => rand.iter(testingResolution).fast(testingResolution).firstCycle();

describe('old random', () => {
  calculateSteps(true);
  bench(
    '+tactus',
    () => {
      useRNG('legacy');
      _generateRandomPattern();
    },
    {
      time: 1000,
      teardown() {
        useRNG('legacy');
      },
    },
  );

  calculateSteps(false);
  bench(
    '-tactus',
    () => {
      useRNG('precise');
      _generateRandomPattern();
    },
    {
      time: 1000,
      teardown() {
        useRNG('legacy');
      },
    },
  );
});

describe('random', () => {
  calculateSteps(true);
  bench('+tactus', _generateRandomPattern, { time: 1000 });

  calculateSteps(false);
  bench('-tactus', _generateRandomPattern, { time: 1000 });
});

calculateSteps(true);
