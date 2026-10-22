/*
cyclist.mjs - event scheduler for a single strudel instance. for multi-instance scheduler, see - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/neocyclist.mjs>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/cyclist.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import createClock from './zyklus.mjs';
import { errorLogger, logger } from './logger.mjs';

export class Cyclist {
  constructor({
    interval,
    onSchedule,
    onTrigger,
    onToggle,
    onError,
    getTime,
    latency = 0.1,
    setInterval,
    clearInterval,
    beforeStart,
  }) {
    if (onTrigger) {
      throw new Error(
        'onTrigger has been dropped. use onSchedule(hap, time, cps) instead, see https://codeberg.org/uzu/strudel/pulls/2138',
      );
    }
    this.started = false;
    this.beforeStart = beforeStart;
    this.cps = 0.5;
    this.checkpoint = {
      // new checkpoints are created when there's a change in cps
      cycles: 0, // number of cycles when cps was changed
      seconds: 0, // clock phase when cps was changed
    };
    this.num_ticks_since_checkpoint = 0;
    this.lastTick = 0; // absolute time when last tick (clock callback) happened
    this.lastBegin = 0; // query begin of last tick
    this.lastEnd = 0; // query end of last tick
    this.getTime = getTime; // get absolute time
    this.onToggle = onToggle;
    this.latency = latency; // fixed trigger time offset
    this.clock = createClock(
      getTime,
      // called slightly before each cycle
      (phase, duration, _, t) => {
        if (this.num_ticks_since_checkpoint === 0) {
          this.checkpoint = {
            cycles: this.lastEnd,
            seconds: phase,
          };
        }
        this.num_ticks_since_checkpoint++;

        try {
          var begin = this.lastEnd;
          this.lastBegin = begin;
          var end = this.checkpoint.cycles + this.num_ticks_since_checkpoint * duration * this.cps;
          this.lastEnd = end;
          this.lastTick = phase;

          if (phase < t) {
            // avoid querying haps that are in the past anyway
            console.log(`skip query: too late`);
            return;
          }

          const tickEndTime = phase + duration;

          var cpsChanged = false;
          do {
            cpsChanged = false;

            // query the pattern for events
            const haps = this.pattern
              .queryArc(begin, end, { _cps: this.cps, cyclist: 'cyclist' })
              .filter((hap) => hap.hasOnset())
              // Sort the haps based on their onset, so cps changes within the
              // tick duration happen in the correct order.
              .sort((a, b) => {
                const aBegin = a.whole.begin;
                const bBegin = b.whole.begin;
                // If haps happen at the same time, trigger the haps that cause
                // cps changes first, so the durations of the simultaneous haps
                // are adjusted accordingly.
                if (aBegin.eq(bBegin)) {
                  if (a.value.cps !== undefined) {
                    return b.value.cps !== undefined ? 0 : -1;
                  }
                  if (b.value.cps !== undefined) {
                    return 1;
                  }
                  return 0;
                }
                return aBegin.sub(bBegin);
              });

            haps.forEach((hap) => {
              const targetTime = (hap.whole.begin - this.checkpoint.cycles) / this.cps + this.checkpoint.seconds;
              if (tickEndTime < targetTime) {
                // If the targetTime exceeds the tickEndTime, this means
                // the cps has slowed down, and the latter haps from the query
                // no longer fall within the window of the current tick.
                // They'll be scheduled during the next tick.
                return;
              }
              onSchedule?.(hap, targetTime + this.latency, hap.value.cps ?? this.cps);
              if (hap.value.cps !== undefined && this.cps != hap.value.cps) {
                cpsChanged = true;
                this.cps = hap.value.cps;
                this.num_ticks_since_checkpoint = 0;
                this.checkpoint = {
                  cycles: hap.whole.begin,
                  seconds: targetTime,
                };
              }
            });

            // If there are any haps in the query that trigger changes to the
            // cps that result in the pattern speeding up, the current cycle end
            // may not capture all the haps that need to be scheduled.
            // If this is the case, we repeat the query + scheduling with a
            // newly calculated end time.
            // This process can repeat multiple times until no additional
            // changes to the cps are triggered.
            // In practice, this doesn't happen more than once during a tick.
            if (cpsChanged) {
              begin = end;
              const remainingSecondsSinceCheckpoint = tickEndTime - this.checkpoint.seconds;
              const remainingCycles = remainingSecondsSinceCheckpoint * this.cps;
              end = this.checkpoint.cycles + remainingCycles;
              this.lastEnd = end;
              if (end < begin) {
                // If the new end is before the old end this means the track
                // slowed down, so we don't need to schedule additional haps.
                // Otherwise, schedule the remaining events.
                break;
              }
            }
          } while (cpsChanged);
        } catch (e) {
          errorLogger(e);
          onError?.(e);
        }
      },
      interval, // duration of each cycle
      0.1,
      0.1,
      setInterval,
      clearInterval,
    );
  }
  now() {
    if (!this.started) {
      return 0;
    }
    const secondsSinceLastTick = this.getTime() - this.lastTick - this.clock.duration;
    return this.lastBegin + secondsSinceLastTick * this.cps; // + this.clock.minLatency;
  }
  setStarted(v) {
    this.started = v;
    this.onToggle?.(v);
  }
  async start() {
    await this.beforeStart?.();
    this.checkpoint = {
      cycles: 0,
      seconds: 0,
    };
    this.num_ticks_since_checkpoint = 0;
    if (!this.pattern) {
      throw new Error('Scheduler: no pattern set! call .setPattern first.');
    }
    logger('[cyclist] start');
    this.clock.start();
    this.setStarted(true);
  }
  pause() {
    logger('[cyclist] pause');
    this.clock.pause();
    this.setStarted(false);
  }
  stop() {
    logger('[cyclist] stop');
    this.clock.stop();
    this.lastEnd = 0;
    this.setStarted(false);
  }
  async setPattern(pat, autostart = false) {
    this.pattern = pat;
    if (autostart && !this.started) {
      await this.start();
    }
  }
  setCps(cps = 0.5) {
    if (this.cps === cps) {
      return;
    }
    this.cps = cps;
    this.num_ticks_since_checkpoint = 0;
  }
  log(begin, end, haps) {
    const onsets = haps.filter((h) => h.hasOnset());
    console.log(`${begin.toFixed(4)} - ${end.toFixed(4)} ${Array(onsets.length).fill('I').join('')}`);
  }
}
