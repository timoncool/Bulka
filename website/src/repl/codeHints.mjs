import { t } from '../i18n/index.mjs';

// TidalCycles words that Strudel does not define.
const TIDAL_KEYS = {
  up: 'hint.tidal.up',
  toScale: 'hint.tidal.toScale',
  euclidOff: 'hint.tidal.euclidOff',
};

// Functions of Switch Angel's prebake script (github.com/switchangel/strudel-scripts) that Strudel does not define;
// his comb, fill, octave and o have namesakes in Strudel and are left out.
const PREBAKE_WORDS = new Set([
  'acid',
  'accent',
  'colorparty',
  'disperse',
  'dly',
  'filtval',
  'flood',
  'fmtime',
  'grab',
  'ifit',
  'mpan',
  'oneshot',
  'pg',
  'rhpf',
  'rlpf',
  'sb',
  'sq',
  'stxt',
  'tgate',
  'trancegate',
  'voc',
  'vstruct',
]);

const MISSING_NAME = [
  /^([\w$]+) is not defined$/,
  /^Can't find variable: ([\w$]+)$/,
  /(?:^|\.)([\w$]+) is not a function\b/,
];

function missingName(error) {
  const message = String(error?.message ?? error ?? '').trim();
  for (const pattern of MISSING_NAME) {
    const match = message.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// The parser reports where it stopped as (line:column), line from 1 and column from 0.
const PARSE_PLACE = /\((\d+):(\d+)\)$/;

/** What to do about the failed code: where a parse error is, or how to write in Strudel what came from elsewhere. */
export function codeHint(error) {
  const place = String(error?.message ?? '').match(PARSE_PLACE);
  if (place) return t('hint.syntax', { line: place[1], column: Number(place[2]) + 1 });
  const name = missingName(error);
  if (!name) return null;
  if (/^d\d{1,2}$/.test(name)) return t('hint.tidal.channel', { name });
  if (name in TIDAL_KEYS) return t(TIDAL_KEYS[name]);
  if (name === 'acidenv') return t('hint.prebake.acidenv');
  if (PREBAKE_WORDS.has(name)) return t('hint.prebake', { name });
  return null;
}

/** The error text with the Strudel way appended, for the agent that has to fix the code. */
export function errorWithHint(error) {
  const message = error?.message || String(error);
  const hint = codeHint(error);
  return hint ? `${message}. ${hint}` : message;
}
