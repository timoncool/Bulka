// Bulka once defaulted to OpenAI and stores every default on the first load, so `openai` without a key was never a
// choice and leaves the chat without a working AI. Such a profile moves to the free provider once; the version flag
// keeps a later own choice of OpenAI from being moved again.
export const AI_PROVIDER_MIGRATION = '1';

/**
 * @param {{ get(): Record<string, string>, setKey(key: string, value: string): void }} settings the settings store
 * @param {{ getItem(key: string): string | null, setItem(key: string, value: string): void }} storage localStorage
 * @param {string} flagKey where the migration version is kept
 */
export function migrateUnsetAiProvider(settings, storage, flagKey) {
  if (storage.getItem(flagKey) === AI_PROVIDER_MIGRATION) return;
  const { aiProvider, openaiApiKey } = settings.get();
  if (aiProvider === 'openai' && !String(openaiApiKey ?? '').trim()) {
    settings.setKey('aiProvider', 'free');
    settings.setKey('aiModel', '');
  }
  storage.setItem(flagKey, AI_PROVIDER_MIGRATION);
}
