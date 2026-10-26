import { describe, expect, it } from 'vitest';
import { AI_PROVIDER_MIGRATION, migrateUnsetAiProvider } from '../website/src/aiProviderMigration.mjs';

function settingsStore(values) {
  const state = { ...values };
  return { get: () => state, setKey: (k, v) => (state[k] = v), state };
}

function memoryStorage(entries = {}) {
  const data = new Map(Object.entries(entries));
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), data };
}

const FLAG = 'strudel-settings-aiProviderMigration';

describe('the AI provider nobody chose moves to the free one once', () => {
  it('openai without a key becomes free, and the flag is written', () => {
    const settings = settingsStore({ aiProvider: 'openai', openaiApiKey: '  ', aiModel: 'gpt-4o' });
    const storage = memoryStorage();
    migrateUnsetAiProvider(settings, storage, FLAG);
    expect(settings.state.aiProvider).toBe('free');
    expect(settings.state.aiModel).toBe('');
    expect(storage.getItem(FLAG)).toBe(AI_PROVIDER_MIGRATION);
  });

  it('openai with a key stays openai', () => {
    const settings = settingsStore({ aiProvider: 'openai', openaiApiKey: 'sk-test', aiModel: 'gpt-4o' });
    const storage = memoryStorage();
    migrateUnsetAiProvider(settings, storage, FLAG);
    expect(settings.state).toEqual({ aiProvider: 'openai', openaiApiKey: 'sk-test', aiModel: 'gpt-4o' });
    expect(storage.getItem(FLAG)).toBe(AI_PROVIDER_MIGRATION);
  });

  it('with the flag already written nothing changes, even openai without a key', () => {
    const settings = settingsStore({ aiProvider: 'openai', openaiApiKey: '', aiModel: '' });
    const storage = memoryStorage({ [FLAG]: AI_PROVIDER_MIGRATION });
    migrateUnsetAiProvider(settings, storage, FLAG);
    expect(settings.state.aiProvider).toBe('openai');
  });

  it('other providers are left alone', () => {
    const settings = settingsStore({ aiProvider: 'gemini', openaiApiKey: '', aiModel: 'gemini-x' });
    migrateUnsetAiProvider(settings, memoryStorage(), FLAG);
    expect(settings.state.aiProvider).toBe('gemini');
  });
});
