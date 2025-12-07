/*
tonal.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/tonal/tonal.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Note, Interval, Scale } from '@tonaljs/tonal';
import {
  _mod,
  errorLogger,
  getAccidentalsOffset,
  isNote,
  logger,
  noteToMidi,
  register,
  removeUndefineds,
} from '@strudel/core';
import { stepInNamedScale, nearestNumberIndex } from './tonleiter.mjs';

const octavesInterval = (octaves) => (octaves <= 0 ? -1 : 1) + octaves * 7 + 'P';

function getScale(scaleName) {
  scaleName = scaleName.replaceAll(':', ' ');
  const scale = Scale.get(scaleName);
  const { tonic, empty } = scale;
  if ((empty && isNote(scaleName)) || (empty && !tonic)) {
    throw new Error(
      `Scale name ${scaleName} is incomplete. Make sure to use ":" instead of spaces, example: .scale("C:major")`,
    );
  } else if (empty) {
    throw new Error(`Invalid scale name "${scaleName}"`);
  }
  return scale;
}

function scaleStep(step, scale) {
  step = Math.ceil(step);
  let { intervals, tonic } = getScale(scale);
  tonic = tonic || 'C';
  const { pc, oct = 3 } = Note.get(tonic);
  const octaveOffset = Math.floor(step / intervals.length);
  const scaleStep = _mod(step, intervals.length);
  const interval = Interval.add(intervals[scaleStep], octavesInterval(octaveOffset));
  return Note.transpose(pc + oct, interval);
}

// transpose note inside scale by offset steps
// function scaleOffset(scale: string, offset: number, note: string) {
function scaleOffset(scale, offset, note) {
  let { notes } = getScale(scale);
  notes = notes.map((note) => Note.get(note).pc); // use only pc!
  offset = Number(offset);
  if (isNaN(offset)) {
    throw new Error(`scale offset "${offset}" not a number`);
  }
  const { pc: fromPc, oct = 3 } = Note.get(note);
  const noteIndex = notes.indexOf(fromPc);
  if (noteIndex === -1) {
    throw new Error(`note "${note}" is not in scale "${scale}"`);
  }
  let i = noteIndex,
    o = oct,
    n = fromPc;
  const direction = Math.sign(offset);
  // TODO: find way to do this smarter
  while (Math.abs(i - noteIndex) < Math.abs(offset)) {
    i += direction;
    const index = _mod(i, notes.length);
    if (direction < 0 && n[0] === 'C') {
      o += direction;
    }
    n = notes[index];
    if (direction > 0 && n[0] === 'C') {
      o += direction;
    }
  }
  return n + o;
}

// Pattern.prototype._transpose = function (intervalOrSemitones: string | number) {
/**
 * Изменяет высоту каждого значения на заданную величину. Ожидает числа или строки note в качестве значений.
 * Величина может быть задана как количество полутонов или как строка в краткой нотации интервалов.
 * Если вас не волнует энгармоническая правильность, просто используйте числа. В противном случае передайте интервал в
 * форме: ST, где S - номер ступени, а T - тип интервала:
 *
 * - M = мажорный
 * - m = минорный
 * - P = чистый
 * - A = увеличенный
 * - d = уменьшенный
 *
 * Примеры интервалов:
 *
 * - 1P = прима
 * - 3M = большая терция
 * - 3m = малая терция
 * - 4P = чистая кварта
 * - 4A = увеличенная кварта
 * - 5P = чистая квинта
 * - 5d = уменьшенная квинта
 *
 * @param {string | number} amount Количество полутонов или строка интервала.
 * @returns Pattern
 * @memberof Pattern
 * @name transpose
 * @synonyms trans
 * @example
 * "c2 c3".fast(2).transpose("<0 -2 5 3>".slow(2)).note()
 * @example
 * "c2 c3".fast(2).transpose("<1P -2M 4P 3m>".slow(2)).note()
 */

export const { transpose, trans } = register(['transpose', 'trans'], function transposeFn(intervalOrSemitones, pat) {
  return pat.withHap((hap) => {
    const note = hap.value.note ?? hap.value;
    if (typeof note === 'number') {
      // note is a number, so just add the number semitones of the interval
      let semitones;
      if (typeof intervalOrSemitones === 'number') {
        semitones = intervalOrSemitones;
      } else if (typeof intervalOrSemitones === 'string') {
        semitones = Interval.semitones(intervalOrSemitones) || 0;
      }
      const targetNote = note + semitones;
      if (typeof hap.value === 'object') {
        return hap.withValue(() => ({ ...hap.value, note: targetNote }));
      }
      return hap.withValue(() => targetNote);
    }
    if (typeof note !== 'string' || !isNote(note)) {
      logger(`[tonal] transpose: not a note "${note}"`, 'warning');
      return hap;
    }
    // note is a string, so we might be able to preserve harmonics if interval is a string as well
    const interval = !isNaN(Number(intervalOrSemitones))
      ? Interval.fromSemitones(intervalOrSemitones)
      : String(intervalOrSemitones);
    const targetNote = Note.transpose(note, interval);
    if (typeof hap.value === 'object') {
      return hap.withValue(() => ({ ...hap.value, note: targetNote }));
    }
    return hap.withValue(() => targetNote);
  });
});

// example: transpose(3).late(0.2) will be equivalent to compose(transpose(3), late(0.2))
// e.g. `stack(c3).superimpose(transpose(slowcat(7, 5)))` or
// or even `stack(c3).superimpose(transpose.slowcat(7, 5))` or

/**
 * Транспонирует ноты внутри scale на заданное количество ступеней.
 * Ожидается вызов на Pattern, который уже имеет {@link Pattern#scale}
 *
 * @memberof Pattern
 * @name scaleTranspose
 * @param {offset} offset количество ступеней внутри scale
 * @returns Pattern
 * @synonyms scaleTrans, strans
 * @example
 * "-8 [2,4,6]"
 * .scale('C4 bebop major')
 * .scaleTranspose("<0 -1 -2 -3 -4 -5 -6 -4>")
 * .note()
 */

export const { scaleTranspose, scaleTrans, strans } = register(
  ['scaleTranspose', 'scaleTrans', 'strans'],
  function (offset /* : number | string */, pat) {
    return pat.withHap((hap) => {
      if (!hap.context.scale) {
        throw new Error('can only use scaleTranspose after .scale');
      }
      if (typeof hap.value === 'object')
        return hap.withValue(() => ({
          ...hap.value,
          note: scaleOffset(hap.context.scale, Number(offset), hap.value.note),
        }));
      if (typeof hap.value !== 'string') {
        throw new Error('can only use scaleTranspose with notes');
      }
      return hap.withValue(() => scaleOffset(hap.context.scale, Number(offset), hap.value));
    });
  },
);

// Converts a step value, which is a number optionally decorated with sharps and flats,
// to a number and an `offset` number of semitones
function _convertStepToNumberAndOffset(step) {
  let asNumber = Number(step);
  let offset = 0;
  if (isNaN(asNumber)) {
    step = String(step);
    // Check to see if the step matches the expected format:
    // - A number (possibly negative)
    // - Some number of sharps or flats
    const match = /^(-?\d+)([#bsf]*)$/.exec(step);

    if (!match) {
      throw new Error(`invalid scale step "${step}", expected number or integer with optional # b suffixes`);
    }
    asNumber = Number(match[1]);
    const accidentals = match[2] || '';
    offset = getAccidentalsOffset(accidentals);
  }
  return [asNumber, offset];
}

let scaleToMidisAndNotes = {};
// Finds the nearest scale note to `note`
function _getNearestScaleNote(scaleName, note, preferHigher = true) {
  let noteMidi = typeof note === 'string' ? noteToMidi(note) : note;
  if (scaleToMidisAndNotes[scaleName] === undefined) {
    const { intervals, tonic } = getScale(scaleName);
    const { pc } = Note.get(tonic);
    const expandedIntervals = intervals.concat('8P'); // add the octave for wrapping
    const sNotes = expandedIntervals.map((interval) => Note.transpose(pc + '0', interval));
    const sMidi = sNotes.map(noteToMidi);
    // Cache
    scaleToMidisAndNotes[scaleName] = [sMidi, sNotes];
  }
  const [scaleMidis, scaleNotes] = scaleToMidisAndNotes[scaleName];
  const rootMidi = scaleMidis[0];
  const octaveDiff = Math.floor((noteMidi - rootMidi) / 12);
  const alignedMidis = scaleMidis.map((m) => m + 12 * octaveDiff);
  const noteIdx = nearestNumberIndex(noteMidi, alignedMidis, preferHigher);
  const noteMatch = scaleNotes[noteIdx];
  return Note.transpose(noteMatch, Interval.fromSemitones(12 * octaveDiff));
}

/**
 * Преобразует числа в ноты в scale (с нулевой индексацией) или квантизует ноты к scale.
 *
 * При описании нот через числа обратите внимание, что отрицательные числа могут использоваться для
 * движения назад по scale, а также диезы или бемоли для получения нот вне scale.
 *
 * Также устанавливает scale для других операций со scale, таких как {@link Pattern#scaleTranspose}.
 *
 * Scale состоит из основной ноты (например, `c4`, `c`, `f#`, `bb4`), за которой следует двоеточие (':'), а затем [тип scale](https://github.com/tonaljs/tonal/blob/main/packages/scale-type/data.ts).
 *
 * Название scale должно быть написано без пробелов (потому что иначе оно будет интерпретировано как многошаговый pattern).
 * Если название вашей scale содержит пробелы, замените их на двоеточия.
 *
 * Основная нота по умолчанию находится в октаве 3, если номер октавы не указан.
 *
 * @name scale
 * @param {string} scale Название scale
 * @returns Pattern
 * @example
 * n("0 2 4 6 4 2").scale("C:major")
 * @example
 * n("[0,7] 4 [2,7] 4")
 * .scale("C:<major minor>/2")
 * .s("piano")
 * @example
 * n(rand.range(0,12).segment(8))
 * .scale("C:ritusen")
 * .s("piano")
 * @example
 * n("<[0,7b] [-4# -4] [-2,7##] 4 [0,7] [-4# -4b] [-2,7###] 4b>*4")
 * .scale("C:<major minor>/2")
 * .s("piano")
 * @example
 * note("C1*16").transpose(irand(36)).scale('Cb2 major').scaleTranspose(3)
 * @example
 * n("[0 0] [1 2] [3 4] [5 6]").scale("C:major:blues")
 */
export const scale = register(
  'scale',
  function (scale, pat) {
    // Supports ':' list syntax in mininotation
    if (Array.isArray(scale)) {
      scale = scale.flat().join(' ');
    }
    return pat.withHaps((haps) => {
      haps = haps.map((hap) => {
        let hVal = hap.value;
        const isObject = typeof hVal === 'object';
        // If hVal is a pure value, place it on `n` so that we interpret it as a scale degree
        hVal = isObject ? hVal : { n: hVal };
        const { note, n, value, ...otherValues } = hVal;
        const noteOrStep = note ?? n ?? value;
        if (noteOrStep === undefined) {
          logger(
            `[tonal] Invalid value format for 'scale'. Value must contain n, note, or value but received keys [${Object.keys(hVal).join(', ')}]`,
            'error',
          );
          return hap; // pass the value through unchanged
        }
        let scaleNote;
        if (isNote(noteOrStep)) {
          // Note case (quantize to scale)
          scaleNote = _getNearestScaleNote(scale, noteOrStep);
          hap.value = { ...otherValues, note: scaleNote };
        } else {
          // Step case (convert to note in scale)
          try {
            const [number, offset] = _convertStepToNumberAndOffset(noteOrStep);
            if (otherValues.anchor) {
              scaleNote = stepInNamedScale(number, scale, otherValues.anchor);
            } else {
              scaleNote = scaleStep(number, scale);
            }
            if (offset != 0) scaleNote = Note.transpose(scaleNote, Interval.fromSemitones(offset));
          } catch (err) {
            errorLogger(err, 'tonal');
            return; // will be removed
          }
        }
        hap.value = isObject ? { ...otherValues, note: scaleNote } : scaleNote;
        // Tag with scale for downsteam scale-aware operations
        return hap.setContext({ ...hap.context, scale });
      });
      return removeUndefineds(haps);
    });
  },
  true,
  true, // preserve step count
);
