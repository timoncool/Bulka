/*
euclid.mjs - Bjorklund/Euclidean/Diaspora rhythms
Copyright (C) 2023 Rohan Drape and strudel contributors

See <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/euclid.mjs> for authors of this file.

The Bjorklund algorithm implementation is ported from the Haskell Music Theory Haskell module by Rohan Drape -
https://rohandrape.net/?t=hmt

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { timeCat, register, silence, stack, pure, _morph } from './pattern.mjs';
import { rotate, flatten, splitAt, zipWith } from './util.mjs';
import Fraction, { lcm } from './fraction.mjs';

const left = function (n, x) {
  const [ons, offs] = n;
  const [xs, ys] = x;
  const [_xs, __xs] = splitAt(offs, xs);
  return [
    [offs, ons - offs],
    [zipWith((a, b) => a.concat(b), _xs, ys), __xs],
  ];
};

const right = function (n, x) {
  const [ons, offs] = n;
  const [xs, ys] = x;
  const [_ys, __ys] = splitAt(ons, ys);
  const result = [
    [ons, offs - ons],
    [zipWith((a, b) => a.concat(b), xs, _ys), __ys],
  ];
  return result;
};

const _bjorklund = function (n, x) {
  const [ons, offs] = n;
  return Math.min(ons, offs) <= 1 ? [n, x] : _bjorklund(...(ons > offs ? left(n, x) : right(n, x)));
};

export const bjorklund = function (ons, steps) {
  const inverted = ons < 0;
  const absOns = Math.abs(ons);
  const offs = steps - absOns;
  const ones = Array(absOns).fill([1]);
  const zeros = Array(offs).fill([0]);
  const result = _bjorklund([absOns, offs], [ones, zeros]);
  const pattern = flatten(result[1][0]).concat(flatten(result[1][1]));
  return inverted ? pattern.map((x) => 1 - x) : pattern;
};

/**
 * Изменяет структуру pattern для формирования Евклидового ритма.
 * Евклидовы ритмы - это ритмы, полученные с использованием наибольшего общего
 * делителя двух чисел. Они были описаны в 2004 году канадским компьютерным
 * ученым Годфридом Туссеном. Евклидовы ритмы очень полезны для компьютерной/
 * алгоритмической музыки, потому что они могут описать большое количество ритмов
 * с помощью пары чисел.
 *
 * @memberof Pattern
 * @name euclid
 * @param {number} pulses количество ударов/beats
 * @param {number} steps количество шагов для заполнения
 * @returns Pattern
 * @example
 * // Кубинский pattern tresillo.
 * note("c3").euclid(3,8)
 */

/**
 * Как `euclid`, но имеет дополнительный параметр для 'вращения' результирующей последовательности.
 * @memberof Pattern
 * @name euclidRot
 * @param {number} pulses количество ударов/beats
 * @param {number} steps количество шагов для заполнения
 * @param {number} rotation смещение в шагах
 * @returns Pattern
 * @example
 * // Бразильский ритм Самбы
 * note("c3").euclidRot(3,16,14)
 */

/**
 * @example // Персидский ритм XIII века под названием Khafif-e-ramal.
 * note("c3").euclid(2,5)
 * @example // Архетипический pattern Кумбии из Колумбии, а также ритм Калипсо из Тринидада.
 * note("c3").euclid(3,4)
 * @example // Другой персидский ритм XIII века под названием Khafif-e-ramal, а также румынский народный танцевальный ритм.
 * note("c3").euclidRot(3,5,2)
 * @example // Ритм Рученица, используемый в болгарском народном танце.
 * note("c3").euclid(3,7)
 * @example // Кубинский pattern tresillo.
 * note("c3").euclid(3,8)
 * @example // Другой болгарский народный танцевальный ритм Рученица.
 * note("c3").euclid(4,7)
 * @example // Турецкий ритм Аксак.
 * note("c3").euclid(4,9)
 * @example // Метрический pattern, использованный Фрэнком Заппой в его композиции Outside Now.
 * note("c3").euclid(4,11)
 * @example // Дает pattern York-Samai, популярный арабский ритм.
 * note("c3").euclid(5,6)
 * @example // Pattern Nawakhat, еще один популярный арабский ритм.
 * note("c3").euclid(5,7)
 * @example // Кубинский pattern cinquillo.
 * note("c3").euclid(5,8)
 * @example // Популярный арабский ритм под названием Agsag-Samai.
 * note("c3").euclid(5,9)
 * @example // Метрический pattern, использованный Мусоргским в "Картинках с выставки".
 * note("c3").euclid(5,11)
 * @example // Хлопающий pattern Венда из южноафриканской детской песни.
 * note("c3").euclid(5,12)
 * @example // Бразильский ритм Bossa-Nova.
 * note("c3").euclid(5,16)
 * @example // Типичный ритм, исполняемый на Бендире (рамочный барабан).
 * note("c3").euclid(7,8)
 * @example // Распространенный западноафриканский колокольный pattern.
 * note("c3").euclid(7,12)
 * @example // Бразильский ритм Самбы.
 * note("c3").euclidRot(7,16,14)
 * @example // Ритм, используемый в Центральноафриканской Республике.
 * note("c3").euclid(9,16)
 * @example // Ритм пигмеев Ака из Центральной Африки.
 * note("c3").euclidRot(11,24,14)
 * @example // Другой ритм пигмеев Ака из верхнего Санга.
 * note("c3").euclidRot(13,24,5)
 */

const _euclidRot = function (pulses, steps, rotation) {
  const b = bjorklund(pulses, steps);
  if (rotation) {
    return rotate(b, -rotation);
  }
  return b;
};

export const euclid = register('euclid', function (pulses, steps, pat) {
  return pat.struct(_euclidRot(pulses, steps, 0));
});

export const bjork = register('bjork', function (euc, pat) {
  if (!Array.isArray(euc)) {
    euc = [euc];
  }
  const [pulses, steps = pulses, rot = 0] = euc;
  return pat.struct(_euclidRot(pulses, steps, rot));
});

export const { euclidrot, euclidRot } = register(['euclidrot', 'euclidRot'], function (pulses, steps, rotation, pat) {
  return pat.struct(_euclidRot(pulses, steps, rotation));
});

/**
 * Похож на `euclid`, но каждый импульс удерживается до следующего импульса,
 * поэтому пауз не будет.
 * @name euclidLegato
 * @memberof Pattern
 * @param {number} pulses количество ударов/beats
 * @param {number} steps количество шагов для заполнения
 * @param rotation смещение в шагах
 * @param pat
 * @example
 * note("c3").euclidLegato(3,8)
 */

const _euclidLegato = function (pulses, steps, rotation, pat) {
  if (pulses < 1) {
    return silence;
  }
  const bin_pat = _euclidRot(pulses, steps, 0);
  const gapless = bin_pat
    .join('')
    .split('1')
    .slice(1)
    .map((s) => [s.length + 1, true]);
  return pat.struct(timeCat(...gapless)).late(Fraction(rotation).div(steps));
};

export const euclidLegato = register(['euclidLegato'], function (pulses, steps, pat) {
  return _euclidLegato(pulses, steps, 0, pat);
});

/**
 * Похож на `euclid`, но каждый импульс удерживается до следующего импульса,
 * поэтому пауз не будет, и имеет дополнительный параметр для 'вращения'
 * результирующей последовательности
 * @name euclidLegatoRot
 * @memberof Pattern
 * @param {number} pulses количество ударов/beats
 * @param {number} steps количество шагов для заполнения
 * @param {number} rotation смещение в шагах
 * @example
 * note("c3").euclidLegatoRot(3,5,2)
 */
export const euclidLegatoRot = register(['euclidLegatoRot'], function (pulses, steps, rotation, pat) {
  return _euclidLegato(pulses, steps, rotation, pat);
});

/**
 * Вариант 'euclid' с дополнительным параметром, который морфирует результирующий
 * ритм от 0 (без морфинга) до 1 (полностью 'ровный'). Например,
 * `sound("bd").euclidish(3,8,0)` будет таким же, как
 * `sound("bd").euclid(3,8)`, а `sound("bd").euclidish(3,8,1)` будет таким же,
 * как `sound("bd bd bd")`. `sound("bd").euclidish(3,8,0.5)` будет иметь
 * groove где-то посередине.
 * Вдохновлено работой Малкома Браффа.
 * @name euclidish
 * @synonyms eish
 * @memberof Pattern
 * @param {number} pulses количество ударов
 * @param {number} steps количество шагов для заполнения
 * @param {number} groove существует между крайностями 0 (строго евклидов) и 1 (строго импульсный)
 * @example
 * sound("hh").euclidish(7,12,sine.slow(8))
 * .pan(sine.slow(8))
 */
export const { euclidish, eish } = register(['euclidish', 'eish'], function (pulses, steps, perc, pat) {
  const morphed = _morph(bjorklund(pulses, steps), new Array(pulses).fill(1), perc);
  return pat.struct(morphed).setSteps(steps);
});
