import { afterEach } from 'vitest';
import { useRNG } from './packages/core/signal.mjs';
import { setDefaultJoin } from './packages/core/pattern.mjs';

afterEach(() => {
  // Avoid bleed between tests
  useRNG('legacy');
  setDefaultJoin('in');
});
