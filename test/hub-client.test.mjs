import { describe, expect, it, vi } from 'vitest';
import { StudioHub } from '../website/src/hub/studioHub.mjs';

// The hub's schema 1 rules (studio-hub/src/server/schemas.ts reportInput), checked field by field.
const UUID4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHORT = /^[A-Za-z0-9 ._+-]{1,40}$/;
const NAME = /^[a-z][a-z0-9_]{0,31}$/;

function memoryStorage() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), data };
}

function hubWith(fetchImpl, storage = memoryStorage(), extra = {}) {
  return new StudioHub({
    ...extra,
    app: 'bulka',
    version: '0.6.0',
    os: 'web Windows Chrome',
    backend: 'web',
    lang: () => 'ru',
    urls: ['https://direct.test', 'https://proxy.test'],
    storage,
    fetch: fetchImpl,
  });
}

const ok = () => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('') });

describe('studio hub client', () => {
  it('counts and sends nothing before the person acknowledged the choice', async () => {
    const fetch = vi.fn(ok);
    const hub = hubWith(fetch);
    hub.count('pattern_play_done');
    hub.failed('pattern_play', 'boom');
    await hub.sendReports();
    expect(fetch).not.toHaveBeenCalled();
    expect(hub.state.install).toBeNull();
    expect(Object.keys(hub.state.days)).toEqual([]);
  });

  it('sends nothing when the box was unchecked', async () => {
    const fetch = vi.fn(ok);
    const hub = hubWith(fetch);
    hub.acknowledge(false);
    hub.count('pattern_play_done');
    await hub.sendReports();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('builds a report the hub accepts and sends each changed day once', async () => {
    const fetch = vi.fn(ok);
    const hub = hubWith(fetch);
    hub.acknowledge(true);
    hub.count('pattern_play_done', 3);
    hub.count('pattern_play_failed');
    hub.failed('pattern_play', 'open C:\\Users\\Ivan\\x.wav: denied');
    hub.usedModel('free gpt-oss-20b');
    hub.usedModel('openrouter anthropic/claude-sonnet:beta');
    await hub.sendReports();
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://direct.test/v1/report');
    const report = JSON.parse(init.body);
    expect(report.schema).toBe(1);
    expect(report.install).toMatch(UUID4);
    expect(report.app).toBe('bulka');
    expect(report.version).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    expect(report.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(report.os).toMatch(SHORT);
    expect(report.ui_lang).toMatch(/^[a-z]{2}$/);
    expect(report.gpu).toEqual({ vendor: 'none', vram_gb: '?', backend: 'web' });
    for (const name of Object.keys(report.counts)) expect(name).toMatch(NAME);
    for (const model of report.models) expect(model).toMatch(SHORT);
    expect(report.failures).toEqual([{ kind: 'pattern_play', reason: 'open <path>: denied', count: 1 }]);
    await hub.sendReports();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the day when the network fails and tries the proxy, then remembers the address that answered', async () => {
    const fetch = vi.fn((url) =>
      url.startsWith('https://direct.test') ? Promise.reject(new TypeError('Failed to fetch')) : ok(),
    );
    const hub = hubWith(fetch);
    hub.acknowledge(true);
    hub.count('record_done');
    await hub.sendReports();
    expect(fetch.mock.calls.map(([u]) => u)).toEqual(['https://direct.test/v1/report', 'https://proxy.test/v1/report']);
    expect(hub.state.lastSource).toBe('https://proxy.test');
    hub.count('record_done');
    await hub.sendReports();
    expect(fetch.mock.calls[2][0]).toBe('https://proxy.test/v1/report');
  });

  it('a report no address takes stays to be sent later', async () => {
    const fetch = vi.fn(() => Promise.reject(new TypeError('offline')));
    const hub = hubWith(fetch);
    hub.acknowledge(true);
    hub.count('export_done');
    await hub.sendReports();
    const [day] = Object.values(hub.state.days);
    expect(day.dirty).toBe(true);
  });

  it('something counted while the report is out is sent next time', async () => {
    let release;
    const fetch = vi.fn(() => new Promise((resolve) => (release = () => resolve({ ok: true, status: 200 }))));
    const hub = hubWith(fetch);
    hub.acknowledge(true);
    hub.count('pattern_play_done');
    const sending = hub.sendReports();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    hub.count('pattern_play_done');
    release();
    await sending;
    const [day] = Object.values(hub.state.days);
    expect(day.dirty).toBe(true);
    expect(day.counts.pattern_play_done).toBe(2);
  });

  it('a refused report is not sent again, a 429 is', async () => {
    const refused = vi.fn(() => Promise.resolve({ ok: false, status: 400, text: () => Promise.resolve('bad') }));
    const hub = hubWith(refused);
    hub.acknowledge(true);
    hub.count('share_done');
    await hub.sendReports();
    expect(Object.values(hub.state.days)[0].dirty).toBe(false);

    const limited = vi.fn(() => Promise.resolve({ ok: false, status: 429, text: () => Promise.resolve('') }));
    const other = hubWith(limited);
    other.acknowledge(true);
    other.count('share_done');
    await other.sendReports();
    expect(Object.values(other.state.days)[0].dirty).toBe(true);
  });

  it('turning statistics off forgets the install id and the collected days', () => {
    const storage = memoryStorage();
    const hub = hubWith(vi.fn(ok), storage);
    hub.acknowledge(true);
    hub.count('agent_reply_done');
    hub.setTelemetry(false);
    expect(hub.state.install).toBeNull();
    expect(hub.state.days).toEqual({});
    const reloaded = hubWith(vi.fn(ok), storage);
    expect(reloaded.telemetryOn()).toBe(false);
    expect(reloaded.state.acknowledged).toBe(true);
  });

  it('refuses counter names the hub would refuse', () => {
    const hub = hubWith(vi.fn(ok));
    hub.acknowledge(true);
    expect(() => hub.count('Bad-Name')).toThrow();
  });
});

describe('computer id', () => {
  it('goes with the report of the desktop app and is absent on the web', async () => {
    const machine = '041bb722-6c3b-4ebe-be3a-7ed023dab1b9';
    const desktop = hubWith(vi.fn(ok), memoryStorage(), { machine });
    desktop.acknowledge(true);
    desktop.count('pattern_play_done');
    const day = new Date().toISOString().slice(0, 10);
    expect(desktop.reportFor(day).machine).toBe(machine);
    const web = hubWith(vi.fn(ok));
    web.acknowledge(true);
    web.count('pattern_play_done');
    expect('machine' in web.reportFor(day)).toBe(false);
  });
});
