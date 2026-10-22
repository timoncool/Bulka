import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addSubscriber, callBridge, deliverResult } from '../website/src/lib/mcpBus.mjs';

describe('MCP bus', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('waits for the window to connect and delivers the command', async () => {
    const call = callBridge('readCode', {});
    await vi.advanceTimersByTimeAsync(3000);
    const sent = [];
    const unsub = addSubscriber({ send: (cmd) => sent.push(cmd) });
    await vi.advanceTimersByTimeAsync(0);
    expect(sent.map((c) => c.tool)).toEqual(['readCode']);
    deliverResult(sent[0].id, 'code', null);
    await expect(call).resolves.toEqual({ result: 'code', error: null });
    unsub();
  });

  it('answers with an error when no window connects', async () => {
    const call = callBridge('readCode', {});
    await vi.advanceTimersByTimeAsync(8000);
    await expect(call).resolves.toEqual({ error: 'Окно Bulka не подключено. Открой приложение Bulka и повтори.' });
  });
});
