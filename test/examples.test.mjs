import { queryCode } from './runtime.mjs';
import { beforeEach, describe, it } from 'vitest';
import { setDefaultJoin } from '@strudel/core';
import doc from '../doc.json';

const skippedExamples = [
  'absoluteOrientationGamma',
  'absoluteOrientationBeta',
  'absoluteOrientationAlpha',
  'orientationGamma',
  'orientationBeta',
  'orientationAlpha',
  'rotationGamma',
  'rotationBeta',
  'rotationAlpha',
  'gravityZ',
  'gravityY',
  'gravityX',
  'accelerationZ',
  'accelerationY',
  'accelerationX',
  'defaultmidimap',
  'midimaps',
  'clearScope',
  'bmod',
];

describe('runs examples', () => {
  // an example may call setDefaultJoin, which is global and would leak into every later example
  beforeEach(() => setDefaultJoin('in'));
  const { docs } = doc;
  docs.forEach(async (doc) => {
    if (skippedExamples.includes(doc.name)) {
      return;
    }
    doc.examples?.forEach((example, i) => {
      it(`example "${doc.name}" example index ${i}`, async ({ expect }) => {
        const haps = await queryCode(example, 4);
        expect(haps).toMatchSnapshot();
      });
    });
  });
});
