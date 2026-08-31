/*
pick.mjs - methods that use one pattern to pick events from other patterns.
Copyright (C) 2024 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/signal.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Pattern, reify, silence, register } from './pattern.mjs';

import { _mod, clamp, objectMap } from './util.mjs';

const _pick = function (lookup, pat, modulo = true) {
  const array = Array.isArray(lookup);
  const len = Object.keys(lookup).length;

  lookup = objectMap(lookup, reify);

  if (len === 0) {
    return silence;
  }
  return pat.fmap((i) => {
    let key = i;
    if (array) {
      key = modulo ? Math.round(key) % len : clamp(Math.round(key), 0, lookup.length - 1);
    }
    return lookup[key];
  });
};

/** * Выбирает patterns (или простые значения) либо из списка (по индексу), либо из таблицы поиска (по имени).
 * Похож на `inhabit`, но сохраняет структуру исходных patterns.
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 * @example
 * note("<0 1 2!2 3>".pick(["g a", "e f", "f g f g" , "g c d"]))
 * @example
 * sound("<0 1 [2,0]>".pick(["bd sd", "cp cp", "hh hh"]))
 * @example
 * sound("<0!2 [0,1] 1>".pick(["bd(3,8)", "sd sd"]))
 * @example
 * s("<a!2 [a,b] b>".pick({a: "bd(3,8)", b: "sd sd"}))
 */

export const pick = function (lookup, pat) {
  // backward compatibility - the args used to be flipped
  if (Array.isArray(pat)) {
    [pat, lookup] = [lookup, pat];
  }
  return __pick(lookup, pat);
};

const __pick = register('pick', function (lookup, pat) {
  return _pick(lookup, pat, false).innerJoin();
});

/** * То же самое, что `pick`, но если вы выбираете число больше размера списка,
 * оно зацикливается, вместо того чтобы остановиться на максимальном значении.
 * Например, если вы выбираете пятый pattern из списка из трех, вы получите
 * второй.
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 */

export const pickmod = register('pickmod', function (lookup, pat) {
  return _pick(lookup, pat, true).innerJoin();
});

/** * pickF позволяет использовать pattern чисел для выбора функции, которую нужно применить к другому pattern.
 * @param {Pattern} pat
 * @param {Pattern} lookup pattern индексов
 * @param {function[]} funcs массив функций, из которых нужно выбирать
 * @returns {Pattern}
 * @example
 * s("bd [rim hh]").pickF("<0 1 2>", [rev,jux(rev),fast(2)])
 * @example
 * note("<c2 d2>(3,8)").s("square")
 *     .pickF("<0 2> 1", [jux(rev),fast(2),x=>x.lpf(800)])
 */
export const pickF = register('pickF', function (lookup, funcs, pat) {
  return pat.apply(pick(lookup, funcs));
});

/** * То же самое, что `pickF`, но если вы выбираете число больше размера списка функций,
 * оно зацикливается, вместо того чтобы остановиться на максимальном значении.
 * @param {Pattern} pat
 * @param {Pattern} lookup pattern индексов
 * @param {function[]} funcs массив функций, из которых нужно выбирать
 * @returns {Pattern}
 */
export const pickmodF = register('pickmodF', function (lookup, funcs, pat) {
  return pat.apply(pickmod(lookup, funcs));
});

/** * Похож на `pick`, но применяет outerJoin вместо innerJoin.
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 */
export const pickOut = register('pickOut', function (lookup, pat) {
  return _pick(lookup, pat, false).outerJoin();
});

/** * То же самое, что `pickOut`, но если вы выбираете число больше размера списка,
 * оно зацикливается, вместо того чтобы остановиться на максимальном значении.
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 */
export const pickmodOut = register('pickmodOut', function (lookup, pat) {
  return _pick(lookup, pat, true).outerJoin();
});

/** * Похож на `pick`, но выбранный pattern перезапускается, когда активируется его индекс.
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 */
export const pickRestart = register('pickRestart', function (lookup, pat) {
  return _pick(lookup, pat, false).restartJoin();
});

/** * То же самое, что `pickRestart`, но если вы выбираете число больше размера списка,
   * оно зацикливается, вместо того чтобы остановиться на максимальном значении.
   * @param {Pattern} pat
   * @param {*} xs
   * @returns {Pattern}
   * @example
   * "<a@2 b@2 c@2 d@2>".pickRestart({
        a: n("0 1 2 0"),
        b: n("2 3 4 ~"),
        c: n("[4 5] [4 3] 2 0"),
        d: n("0 -3 0 ~")
      }).scale("C:major").s("piano")
   */
export const pickmodRestart = register('pickmodRestart', function (lookup, pat) {
  return _pick(lookup, pat, true).restartJoin();
});

/** * Похож на `pick`, но выбранный pattern сбрасывается, когда активируется его индекс.
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 */
export const pickReset = register('pickReset', function (lookup, pat) {
  return _pick(lookup, pat, false).resetJoin();
});

/** * То же самое, что `pickReset`, но если вы выбираете число больше размера списка,
 * оно зацикливается, вместо того чтобы остановиться на максимальном значении.
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 */
export const pickmodReset = register('pickmodReset', function (lookup, pat) {
  return _pick(lookup, pat, true).resetJoin();
});

/** Выбирает patterns (или простые значения) либо из списка (по индексу), либо из таблицы поиска (по имени).
   * Похож на `pick`, но cycle сжимаются в целевой ('обитаемый') pattern.
   * @name inhabit
   * @synonyms pickSqueeze
   * @param {Pattern} pat
   * @param {*} xs
   * @returns {Pattern}
   * @example
   * "<a b [a,b]>".inhabit({a: s("bd(3,8)"),
                            b: s("cp sd")
                           })
   * @example
   * s("a@2 [a b] a".inhabit({a: "bd(3,8)", b: "sd sd"})).slow(4)
   */
export const { inhabit, pickSqueeze } = register(['inhabit', 'pickSqueeze'], function (lookup, pat) {
  return _pick(lookup, pat, false).squeezeJoin();
});

/** * То же самое, что `inhabit`, но если вы выбираете число больше размера списка,
 * оно зацикливается, вместо того чтобы остановиться на максимальном значении.
 * Например, если вы выбираете пятый pattern из списка из трех, вы получите
 * второй.
 * @name inhabitmod
 * @synonyms pickmodSqueeze
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 */

export const { inhabitmod, pickmodSqueeze } = register(['inhabitmod', 'pickmodSqueeze'], function (lookup, pat) {
  return _pick(lookup, pat, true).squeezeJoin();
});

/**
 * Выбирает из списка значений (или patterns значений) по индексу, используя заданный
 * pattern целых чисел. Выбранный pattern будет сжат, чтобы соответствовать длительности выбирающего события
 * @param {Pattern} pat
 * @param {*} xs
 * @returns {Pattern}
 * @example
 * note(squeeze("<0@2 [1!2] 2>", ["g a", "f g f g" , "g a c d"]))
 */

export const squeeze = (pat, xs) => {
  xs = xs.map(reify);
  if (xs.length == 0) {
    return silence;
  }
  return pat
    .fmap((i) => {
      const key = _mod(Math.round(i), xs.length);
      return xs[key];
    })
    .squeezeJoin();
};
