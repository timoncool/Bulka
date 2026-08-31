/*
stateful.mjs - File of shame for stateful, impure and otherwise illegal pattern methods
Copyright (C) 2025 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/index.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { register, reify, Pattern } from './pattern.mjs';

let timelines = {};

export const reset_state = function () {
  reset_timelines();
};

export const reset_timelines = function () {
  timelines = {};
};

/***
 * Allows you to switch a pattern between different 'timelines'. This is particularly useful when
 * live coding, for example when you want to cue a pattern up to play from its start.
 *
 * Timelines are specified by number, so that if you had a pattern like
 * `n("<0 1 2 3>").s("num").timeline(1)` playing, then changed the '1'
 * to '2', it would always align '0' to the nearest cycle. You will likely want to trigger
 * an evaluation a little bit before the cycle starts, to avoid missing events.
 *
 * After the first use, a timeline will continue with the same 'offset'. That is, if you change
 * a pattern without changing its timeline number, it will stay on that timeline without resetting.
 *
 * Rather than incrementing a timeline to reset it, it's easier to negate it, e.g. by switching between `-2`
 * and `2`. This is because when you negate a timeline it will always reset.
 *
 * You can also pattern the timeline if you want, to create strange resetting patterns.
 * @param {number | Pattern} timeline The timeline that the pattern should play on.
 * @example
 * n("<0 1 2 3>(3,8)")
 *   .sound("num")
 *   // resets the timeline every two cycles, by negating the timeline.
 *   // in a lot of cases this will be edited by a human live coder
 *   // rather than patterned!
 *   .timeline("<2 -2>".slow(2))
 */

export const timeline = register(
  'timeline',
  function (tpat, pat) {
    tpat = reify(tpat);
    const f = function (state) {
      // Is this called from the scheduler? (rather than from e.g. the visualiser)
      const scheduler = !!state.controls.cyclist;
      const timehaps = tpat.query(state);
      const result = [];
      for (const timehap of timehaps) {
        const tlid = timehap.value;
        let offset;
        if (tlid === 0) {
          offset = 0;
        } else if (tlid in timelines) {
          offset = timelines[tlid];
        } else {
          const timearc = timehap.wholeOrPart();
          if (!scheduler || state.span.begin.lt(timearc.midpoint())) {
            offset = timearc.begin;
          } else {
            // Sync to end of timearc if we first see it over halfway into its
            // timespan. Allows 'cuing up' next timeline when live coding.
            offset = timearc.end;
          }
        }
        if (scheduler) {
          // update state
          timelines[tlid] = offset;
          if (tlid !== 0) {
            delete timelines[-tlid];
          }
        }

        const pathaps = pat
          .late(offset)
          .query(state.setSpan(timehap.part))
          .map((h) => h.setContext(h.combineContext(timehap)));
        result.push(...pathaps);
      }
      return result;
    };
    return new Pattern(f, pat._steps);
  },
  false,
);
