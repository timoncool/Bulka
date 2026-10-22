import { code2hash, evalScope, hash2code, logger } from '@strudel/core';
import { settingPatterns } from '../settings.mjs';
import { setVersionDefaults } from '@strudel/webaudio';
import { getMetadata } from '../metadata_parser';
import { isTauri } from '../tauri.mjs';
import './Repl.css';
import { createClient } from '@supabase/supabase-js';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { $featuredPatterns /* , loadDBPatterns */ } from '@src/user_pattern_utils.mjs';
import { nanoid } from 'nanoid';
import { t } from '../i18n/index.mjs';
import { href } from '../i18n/lang.mjs';
import { recordDone, recordFailed } from '../hub/bulkaHub.mjs';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

let dbLoaded;
/* if (typeof window !== 'undefined') {
  dbLoaded = loadDBPatterns();
} */

// Хранит хеш с которого был загружен трек (для перезаписи при шеринге)
let originHash = null;

export function getOriginHash() {
  return originHash;
}

export function setOriginHash(hash) {
  originHash = hash;
}

export function clearOriginHash() {
  originHash = null;
}

export async function initCode() {
  // load code from url hash (either short hash from database or decode long hash)
  try {
    const initialUrl = window.location.href;
    const hash = initialUrl.split('?')[1]?.split('#')?.[0]?.split('&')[0];
    const codeParam = window.location.href.split('#')[1] || '';
    if (codeParam) {
      // looking like https://strudel.cc/#ImMzIGUzIg%3D%3D (hash length depends on code length)
      // Для long URL нет originHash - это новый код
      originHash = null;
      return hash2code(codeParam);
    } else if (hash) {
      // looking like https://strudel.cc/?J01s5i1J0200 (fixed hash length)
      return supabase
        .from('code_v1')
        .select('code')
        .eq('hash', hash)
        .then(({ data, error }) => {
          if (error) {
            console.warn('failed to load hash', error);
          }
          if (data.length) {
            // Сохраняем originHash для возможности перезаписи при шеринге
            originHash = hash;
            return data[0].code;
          }
        });
    }
  } catch (err) {
    console.warn('failed to decode', err);
  }
}

export const parseJSON = (json) => {
  json = json != null && json.length ? json : '{}';
  try {
    return JSON.parse(json);
  } catch {
    return '{}';
  }
};

export async function getRandomTune() {
  await dbLoaded;
  const featuredTunes = Object.entries($featuredPatterns.get());
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const [_, data] = randomItem(featuredTunes);
  return data;
}

export function loadModules() {
  let modules = [
    import('@strudel/core'),
    import('@strudel/draw'),
    import('@strudel/tonal'),
    import('@strudel/mini'),
    import('@strudel/xen'),
    import('@strudel/edo'),
    import('@strudel/webaudio'),
    import('@strudel/codemirror'),
    import('@strudel/hydra'),
    import('@strudel/serial'),
    import('@strudel/soundfonts'),
    import('@strudel/csound'),
    import('@strudel/tidal'),
    import('@strudel/gamepad'),
    import('@strudel/motion'),
    import('@strudel/mqtt'),
    import('@strudel/mondo'),
    import('./bulka-record.mjs'), // Bulka: метод паттерна `.record()` — запись партии/секции из кода
  ];
  if (isTauri()) {
    modules = modules.concat([
      import('@strudel/desktopbridge/loggerbridge.mjs'),
      import('@strudel/desktopbridge/midibridge.mjs'),
      import('@strudel/desktopbridge/oscbridge.mjs'),
    ]);
  } else {
    modules = modules.concat([import('@strudel/midi'), import('@strudel/osc')]);
  }

  return evalScope(settingPatterns, ...modules);
}
// confirm dialog is a promise in webkit and a boolean in other browsers... normalize it to be a promise everywhere
export function confirmDialog(msg) {
  const confirmed = confirm(msg);
  if (confirmed instanceof Promise) {
    return confirmed;
  }
  return new Promise((resolve) => {
    resolve(confirmed);
  });
}

let lastShared;
let lastShareHash;

// Helper to copy text to clipboard
async function copyToClipboard(text) {
  try {
    if (isTauri()) {
      await writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }
    return true;
  } catch (e) {
    console.warn('Failed to copy to clipboard:', e);
    return false;
  }
}

// Validate code before sharing
function isValidCode(code) {
  if (!code || typeof code !== 'string') return false;

  const trimmed = code.trim();

  // Too short
  if (trimmed.length < 10) return false;

  // Contains only comments or loading placeholders
  const withoutComments = trimmed
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
  if (withoutComments.length < 5) return false;

  // Specific bad patterns
  const badPatterns = ['// LOADING', '//LOADING', 'LOADING'];
  if (badPatterns.some((p) => trimmed.toUpperCase().includes(p))) return false;

  return true;
}

// New shareCode that returns data for ShareDialog
// Публичный адрес ссылки: в десктопе окно открыто на 127.0.0.1, а ссылка должна вести на сайт.
function siteUrl(path) {
  const { hostname, origin } = window.location;
  const isLocal = hostname === '127.0.0.1' || hostname === 'localhost';
  return isLocal ? new URL(path, import.meta.env.SITE).href : origin + path;
}

const shareBase = () => siteUrl(window.location.pathname);

/** Ссылка на трек в редакторе на языке страницы — для ленты и других мест вне редактора. */
export const trackLink = (hash) => siteUrl(href('/')) + '?' + hash;

export async function shareCode(codeToShare, isPublic = true) {
  const result = await createShareLink(codeToShare, isPublic);
  if (result.success) recordDone('share');
  else recordFailed('share', result.error);
  return result;
}

async function createShareLink(codeToShare, isPublic) {
  try {
    // Validate code first
    if (!isValidCode(codeToShare)) {
      logger(t('share.tooShort'), 'error');
      return { success: false, error: 'Invalid code' };
    }

    // Check if already shared this exact code (local cache)
    if (lastShared === codeToShare && lastShareHash) {
      const shareUrl = shareBase() + '?' + lastShareHash;
      await copyToClipboard(shareUrl);
      logger(t('share.copied'), 'highlight');
      return {
        success: true,
        shareUrl,
        hash: lastShareHash,
        isExisting: true,
      };
    }

    let shortLinkError = t('share.unknownError');
    // Try to create short URL via Supabase
    try {
      // Если есть originHash - обновляем существующую запись (перезапись трека)
      if (originHash) {
        const { error: updateError } = await supabase
          .from('code_v1')
          .update({ code: codeToShare, public: isPublic })
          .eq('hash', originHash);

        if (!updateError) {
          const shareUrl = shareBase() + '?' + originHash;
          lastShared = codeToShare;
          lastShareHash = originHash;

          await copyToClipboard(shareUrl);
          logger(t('share.updated'), 'highlight');
          return {
            success: true,
            shareUrl,
            hash: originHash,
            isExisting: true,
            wasUpdated: true,
          };
        }
        // Если UPDATE не сработал - продолжаем стандартную логику
        console.warn('Failed to update existing track, creating new:', updateError);
      }

      // Проверяем, есть ли уже такой код в БД (защита от дубликатов)
      const { data: existing } = await supabase
        .from('code_v1')
        .select('hash')
        .eq('code', codeToShare)
        .limit(1)
        .single();

      if (existing?.hash) {
        // Code already exists, return existing link
        const shareUrl = shareBase() + '?' + existing.hash;
        lastShared = codeToShare;
        lastShareHash = existing.hash;

        await copyToClipboard(shareUrl);
        logger(t('share.copied'), 'highlight');
        return {
          success: true,
          shareUrl,
          hash: existing.hash,
          isExisting: true,
        };
      }

      // Create new entry
      const hash = nanoid(12);
      const { error } = await supabase.from('code_v1').insert([
        {
          code: codeToShare,
          hash,
          public: isPublic,
        },
      ]);

      if (!error) {
        const shareUrl = shareBase() + '?' + hash;
        lastShared = codeToShare;
        lastShareHash = hash;
        // Устанавливаем originHash для возможных будущих обновлений
        originHash = hash;

        await copyToClipboard(shareUrl);
        logger(t('share.copied'), 'highlight');
        return {
          success: true,
          shareUrl,
          hash,
          isExisting: false,
        };
      }
      shortLinkError = error.message;
    } catch (e) {
      shortLinkError = e.message;
    }
    logger(t('share.longLink', { reason: shortLinkError }), 'warning');

    // Fallback to long URL (base64 encoded code in hash)
    const longHash = '#' + code2hash(codeToShare);
    const shareUrl = shareBase() + longHash;

    await copyToClipboard(shareUrl);
    logger(t('share.copied'), 'highlight');
    return {
      success: true,
      shareUrl,
      hash: null,
      isExisting: false,
    };
  } catch (e) {
    console.error(e);
    logger(t('share.failed'), 'error');
    return { success: false, error: e.message };
  }
}

export const isIframe = () => window.location !== window.parent.location;
function isCrossOriginFrame() {
  try {
    return !window.top.location.hostname;
  } catch (e) {
    return true;
  }
}

export const isUdels = () => {
  if (isCrossOriginFrame()) {
    return false;
  }
  return window.top?.location?.pathname.includes('udels');
};

export function setVersionDefaultsFrom(code) {
  try {
    const metadata = getMetadata(code);
    setVersionDefaults(metadata.version);
  } catch (err) {
    console.error('Error parsing metadata..');
    console.error(err);
  }
}
