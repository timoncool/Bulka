import { t } from '../i18n/index.mjs';

// TidalCycles words that Strudel does not define.
const HINT_KEYS = {
  up: 'hint.tidal.up',
  toScale: 'hint.tidal.toScale',
  euclidOff: 'hint.tidal.euclidOff',
};

const UNDEFINED_NAME = [/^([\w$]+) is not defined$/, /^Can't find variable: ([\w$]+)$/];

function undefinedName(error) {
  const message = String(error?.message ?? error ?? '').trim();
  for (const pattern of UNDEFINED_NAME) {
    const match = message.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** How to write in Strudel what the failed code took from TidalCycles, or null when the error is something else. */
export function tidalHint(error) {
  const name = undefinedName(error);
  if (!name) return null;
  if (/^d\d{1,2}$/.test(name)) return t('hint.tidal.channel', { name });
  const key = HINT_KEYS[name];
  return key ? t(key) : null;
}

/** The error text with the Strudel way appended, for the agent that has to fix the code. */
export function errorWithHint(error) {
  const message = error?.message || String(error);
  const hint = tidalHint(error);
  return hint ? `${message}. ${hint}` : message;
}
