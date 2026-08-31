/*
tonal.test.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/tonal/test/tonal.test.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// import { strict as assert } from 'assert';

import '../tonal.mjs'; // need to import this to add prototypes
import { pure, n, seq, note, noteToMidi } from '@strudel/core';
import { describe, it, expect } from 'vitest';
import { mini } from '../../mini/mini.mjs';

describe('tonal', () => {
  describe('scaleTranspose', () => {
    it('transposes notes by scale degrees', () => {
      expect(pure('c3').scale('C major').scaleTranspose(1).firstCycleValues).toEqual(['D3']);
    });
  });
  describe('scale', () => {
    it('converts plain values', () => {
      expect(
        seq(0, 1, 2)
          .scale('C major')
          .note()
          .firstCycleValues.map((h) => h.note),
      ).toEqual(['C3', 'D3', 'E3']);
    });
    it('converts n values', () => {
      expect(
        n(seq(0, 1, 2))
          .scale('C major')
          .firstCycleValues.map((h) => h.note),
      ).toEqual(['C3', 'D3', 'E3']);
    });
    it('converts n values (mini notation)', () => {
      expect(
        n(seq(0, 1, 2))
          .scale('C:major')
          .firstCycleValues.map((h) => h.note),
      ).toEqual(['C3', 'D3', 'E3']);
    });
    it('converts n values (no tonic)', () => {
      expect(
        n(seq(0, 1, 2))
          .scale('major')
          .firstCycleValues.map((h) => h.note),
      ).toEqual(['C3', 'D3', 'E3']);
    });
    it('converts n values (explicit mini notation)', () => {
      expect(
        n(seq(0, 1, 2))
          .scale(mini('C:major'))
          .firstCycleValues.map((h) => h.note),
      ).toEqual(['C3', 'D3', 'E3']);
    });
    it('converts decorated n values', () => {
      expect(
        n(seq('0b', '1#', '-2', '3##', '4bb'))
          .scale('C major')
          .firstCycleValues.map((h) => h.note),
      ).toEqual(['B2', 'Eb3', 'A2', 'G3', 'F3']);
    });
    it('snaps notes (upwards) to scale', () => {
      const inputNotes = ['Cb', 'Eb', 'G', 'A#', 'Bb'];
      const expectedNotes = ['B2', 'E3', 'G3', 'B3', 'B3'];

      expect(
        note(seq(inputNotes))
          .scale('C major')
          .firstCycleValues.map((h) => h.note),
      ).toEqual(expectedNotes);
    });
    it('snaps notes to the correct octave', () => {
      const inputNotes = ['Cb0', 'Eb4', 'G1', 'A#19', 'Bb8'];
      const expectedNotes = ['B#-1', 'D#4', 'G#1', 'A#19', 'A#8'];

      expect(
        note(seq(inputNotes))
          .scale('A# minor') // A#, B#, C#, D#, E#, F#, G#
          .firstCycleValues.map((h) => h.note),
      ).toEqual(expectedNotes);
    });
    it('handles scale names provided with colons', () => {
      const inputNotes = ['Cb', 'E', 'G', 'A#', 'Bb'];
      const expectedNotes = ['A#2', 'D#3', 'G#3', 'A#3', 'A#3'];

      expect(
        note(seq(inputNotes))
          .scale('F#:pentatonic') // F#, G#, A#, C#, and D#
          .firstCycleValues.map((h) => h.note),
      ).toEqual(expectedNotes);
    });
  });
  describe('transpose', () => {
    it('transposes note numbers with interval numbers', () => {
      expect(
        note(seq(40, 40, 40))
          .transpose(0, 1, 2)
          .firstCycleValues.map((h) => h.note),
      ).toEqual([40, 41, 42]);
      expect(seq(40, 40, 40).transpose(0, 1, 2).firstCycleValues).toEqual([40, 41, 42]);
    });
    it('transposes note numbers with interval strings', () => {
      expect(
        note(seq(40, 40, 40))
          .transpose('1P', '2M', '3m')
          .firstCycleValues.map((h) => h.note),
      ).toEqual([40, 42, 43]);
      expect(seq(40, 40, 40).transpose('1P', '2M', '3m').firstCycleValues).toEqual([40, 42, 43]);
    });
    it('transposes note strings with interval numbers', () => {
      expect(
        note(seq('c', 'c', 'c'))
          .transpose(0, 1, 2)
          .firstCycleValues.map((h) => h.note),
      ).toEqual(['C', 'Db', 'D']);
      expect(seq('c', 'c', 'c').transpose(0, 1, 2).firstCycleValues).toEqual(['C', 'Db', 'D']);
    });
    it('transposes note strings with interval strings', () => {
      expect(
        note(seq('c', 'c', 'c'))
          .transpose('1P', '2M', '3m')
          .firstCycleValues.map((h) => h.note),
      ).toEqual(['C', 'D', 'Eb']);
      expect(seq('c', 'c', 'c').transpose('1P', '2M', '3m').firstCycleValues).toEqual(['C', 'D', 'Eb']);
    });
  });
});
