// Anonymous usage statistics of Bulka in Studio Hub: the report format, limits and timing of the studios' Rust
// client (studio-hub-client/src/lib.rs). Nothing is counted or sent until the person has seen the choice and kept it
// on. An "install" is this browser, or this copy of the desktop app (its WebView keeps localStorage beside the exe).

import { scrubReason } from './scrub.mjs';

export const DIRECT_URL = 'https://studio-hub.timoncool.workers.dev';
export const PROXY_URL = 'https://hub.neuro-cartel.com';
const STORE_KEY = 'bulka-studio-hub';
const REPORT_FIRST_MS = 60_000;
const REPORT_EVERY_MS = 6 * 3600_000;
const REPORT_SOON_MS = 120_000;
const REQUEST_TIMEOUT_MS = 10_000;
const REPORT_DAYS = 14;
const MAX_COUNTERS = 40;
const MAX_SETS = 20;
const MAX_COMPONENTS = 64;
const MAX_NAME = 80;
const MAX_FAILURES = 20;
const COUNTER = /^[a-z][a-z0-9_]{0,31}$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/g;

const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

/** Text allowed where the hub wants a short name: letters, digits, spaces and `._+-`, at most 40. */
export function shortName(text) {
  return String(text ?? '')
    .replace(/[^A-Za-z0-9 ._+-]+/g, '-')
    .slice(0, 40)
    .trim();
}

export class StudioHub {
  /**
   * @param {{ app: string, version: string, os: string, backend: string, lang: () => string,
   *   urls: string[], storage: Storage, fetch: typeof fetch, now?: () => number, machine?: string }} config
   *   `machine`: the computer id the desktop shell derives, the same in every program of timoncool's; none on the web.
   */
  constructor(config) {
    this.config = config;
    this.now = config.now ?? (() => Date.now());
    this.state = this.load();
    this.timer = null;
  }

  load() {
    const raw = this.config.storage.getItem(STORE_KEY);
    const state = {
      install: null,
      acknowledged: false,
      telemetry: true,
      days: {},
      lastSource: null,
      ...(raw ? JSON.parse(raw) : {}),
    };
    // days stored before model sets were reported
    for (const day of Object.values(state.days)) day.model_sets ??= [];
    return state;
  }

  save() {
    this.config.storage.setItem(STORE_KEY, JSON.stringify(this.state));
  }

  /** The person has seen the choice and kept it on: only then anything is counted or sent. */
  telemetryOn() {
    return this.state.acknowledged && this.state.telemetry;
  }

  /** The first-run panel showed the checkbox with this value; from now on the choice holds. */
  acknowledge(enabled) {
    this.state.acknowledged = true;
    this.setTelemetry(enabled);
  }

  setTelemetry(enabled) {
    this.state.telemetry = !!enabled;
    if (enabled) {
      this.state.install ??= crypto.randomUUID();
    } else {
      this.state.install = null;
      this.state.days = {};
    }
    this.save();
    this.config.onTelemetry?.(this.telemetryOn());
  }

  day() {
    const key = today(this.now());
    this.state.days[key] ??= { counts: {}, model_sets: [], failures: {}, dirty: false };
    return this.state.days[key];
  }

  /** Adds `n` to a counter of today: `[a-z][a-z0-9_]{0,31}`, at most 40 counters a day. */
  count(name, n = 1) {
    if (!COUNTER.test(name)) throw new Error(`studio hub: counter name ${name} is not [a-z][a-z0-9_]{0,31}`);
    if (!this.telemetryOn()) return;
    const day = this.day();
    if (!(name in day.counts) && Object.keys(day.counts).length >= MAX_COUNTERS) {
      console.warn(`[studio hub] ${MAX_COUNTERS} counters today already, ${name} not counted`);
      return;
    }
    day.counts[name] = (day.counts[name] ?? 0) + n;
    day.dirty = true;
    this.save();
    this.reportSoon();
  }

  /**
   * The model set a piece of work ran on, as studio-hub-client `used_models`: `set` names it (null for none) and
   * `components` lists its parts; names keep any printable text up to 80, the same parts in any order are one set.
   */
  usedModels(set, components, count = 1) {
    if (!this.telemetryOn() || count === 0) return;
    const clean = (name) => {
      const text = String(name).trim().replace(CONTROL, '');
      return text && text.length <= MAX_NAME ? text : null;
    };
    const name = set == null ? null : clean(set);
    const parts = [...new Set(components.map(clean).filter(Boolean))].sort().slice(0, MAX_COMPONENTS);
    if (name === null && parts.length === 0) return;
    const day = this.day();
    const same = (known) => known.set === name && known.components.join('\n') === parts.join('\n');
    const known = day.model_sets.find(same);
    if (known) known.count += count;
    else if (day.model_sets.length < MAX_SETS) day.model_sets.push({ set: name, components: parts, count });
    else return;
    day.dirty = true;
    this.save();
    this.reportSoon();
  }

  /** Something failed: counted with its reason, scrubbed here before it is stored. Up to 20 reasons a day. */
  failed(kind, reason) {
    if (!COUNTER.test(kind)) throw new Error(`studio hub: failure kind ${kind} is not [a-z][a-z0-9_]{0,31}`);
    if (!this.telemetryOn()) return;
    const key = `${kind}\t${scrubReason(reason) || 'unknown'}`;
    const day = this.day();
    if (!(key in day.failures) && Object.keys(day.failures).length >= MAX_FAILURES) return;
    day.failures[key] = (day.failures[key] ?? 0) + 1;
    day.dirty = true;
    this.save();
    this.reportSoon();
  }

  /** The report for one day as it would leave now (Settings shows it before anything is sent). */
  reportFor(dayKey) {
    const day = this.state.days[dayKey];
    if (!this.state.install || !day) return null;
    const failures = Object.entries(day.failures).map(([key, count]) => {
      const [kind, reason] = key.split('\t');
      return { kind, reason, count };
    });
    return {
      schema: 1,
      install: this.state.install,
      ...(this.config.machine ? { machine: this.config.machine } : {}),
      app: this.config.app,
      version: this.config.version,
      day: dayKey,
      os: shortName(this.config.os),
      ui_lang: this.config.lang(),
      gpu: { vendor: 'none', vram_gb: '?', backend: this.config.backend },
      counts: day.counts,
      models: [],
      notices: {},
      ...(day.model_sets.length ? { model_sets: day.model_sets } : {}),
      ...(failures.length ? { failures } : {}),
    };
  }

  orderedUrls() {
    const urls = [...this.config.urls];
    const i = urls.indexOf(this.state.lastSource);
    if (i > 0) urls.unshift(...urls.splice(i, 1));
    return urls;
  }

  prune() {
    const oldest = today(this.now() - REPORT_DAYS * 86_400_000);
    for (const key of Object.keys(this.state.days)) if (key < oldest) delete this.state.days[key];
  }

  /** Sends every changed day of the last two weeks; a day that fails to leave stays for the next turn. */
  async sendReports({ keepalive = false } = {}) {
    if (!this.telemetryOn()) return;
    this.prune();
    this.save();
    for (const [dayKey, day] of Object.entries(this.state.days)) {
      if (!day.dirty) continue;
      const report = this.reportFor(dayKey);
      // cleared before sending: something counted while the request is out marks the day again
      day.dirty = false;
      this.save();
      let settled = false;
      for (const url of this.orderedUrls()) {
        try {
          const res = await this.config.fetch(`${url}/v1/report`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(report),
            keepalive,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          });
          if (res.ok) {
            this.state.lastSource = url;
            settled = true;
            break;
          }
          if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            console.warn(`[studio hub] the report of ${dayKey} was refused (${res.status}): ${await res.text()}`);
            settled = true;
            break;
          }
          console.warn(`[studio hub] ${url} answered ${res.status} to the report`);
        } catch (e) {
          console.warn(`[studio hub] ${url}: the report did not leave: ${e.message}`);
        }
      }
      if (!settled) day.dirty = true;
      this.save();
    }
  }

  reportSoon() {
    clearTimeout(this.soon);
    this.soon = setTimeout(() => this.sendReports(), REPORT_SOON_MS);
  }

  /** Reports a minute after start, every six hours, two minutes after work, and when the page is hidden. */
  start(target = globalThis) {
    setTimeout(() => this.sendReports(), REPORT_FIRST_MS);
    this.timer = setInterval(() => this.sendReports(), REPORT_EVERY_MS);
    target.document?.addEventListener('visibilitychange', () => {
      if (target.document.visibilityState === 'hidden') this.sendReports({ keepalive: true });
    });
  }

  /** Sends what is due now, at most `waitMs`: the desktop app calls this before it closes. */
  async flush(waitMs = 8000) {
    await Promise.race([this.sendReports(), new Promise((resolve) => setTimeout(resolve, waitMs))]);
  }
}
