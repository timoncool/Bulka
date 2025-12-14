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

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  'https://giqrbepsnxmugtusqnce.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcXJiZXBzbnhtdWd0dXNxbmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjkyODksImV4cCI6MjA4MDkwNTI4OX0.U4KEbP0CeEQT-QDU2hO2q8cUer-kZ9cXvNN22AqjXRA',
);

let dbLoaded;
/* if (typeof window !== 'undefined') {
  dbLoaded = loadDBPatterns();
} */

export async function initCode() {
  // load code from url hash (either short hash from database or decode long hash)
  try {
    const initialUrl = window.location.href;
    const hash = initialUrl.split('?')[1]?.split('#')?.[0]?.split('&')[0];
    const codeParam = window.location.href.split('#')[1] || '';
    if (codeParam) {
      // looking like https://strudel.cc/#ImMzIGUzIg%3D%3D (hash length depends on code length)
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
            //console.log('load hash from database', hash);
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

//RIP due to SPAM
// let lastShared;
// export async function shareCode(codeToShare) {
//   // const codeToShare = activeCode || code;
//   if (lastShared === codeToShare) {
//     logger(`Link already generated!`, 'error');
//     return;
//   }

//   confirmDialog(
//     'Do you want your pattern to be public? If no, press cancel and you will get just a private link.',
//   ).then(async (isPublic) => {
//     const hash = nanoid(12);
//     const shareUrl = window.location.origin + window.location.pathname + '?' + hash;
//     const { error } = await supabase.from('code_v1').insert([{ code: codeToShare, hash, ['public']: isPublic }]);
//     if (!error) {
//       lastShared = codeToShare;
//       // copy shareUrl to clipboard
//       if (isTauri()) {
//         await writeText(shareUrl);
//       } else {
//         await navigator.clipboard.writeText(shareUrl);
//       }
//       const message = `Link copied to clipboard: ${shareUrl}`;
//       alert(message);
//       // alert(message);
//       logger(message, 'highlight');
//     } else {
//       console.log('error', error);
//       const message = `Error: ${error.message}`;
//       // alert(message);
//       logger(message);
//     }
//   });
// }

let lastShared;
let lastShareHash;

// Validate code before sharing
function isValidCode(code) {
  if (!code || typeof code !== 'string') return false;

  const trimmed = code.trim();

  // Too short
  if (trimmed.length < 10) return false;

  // Contains only comments or loading placeholders
  const withoutComments = trimmed.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (withoutComments.length < 5) return false;

  // Specific bad patterns
  const badPatterns = ['// LOADING', '//LOADING', 'LOADING'];
  if (badPatterns.some(p => trimmed.toUpperCase().includes(p))) return false;

  return true;
}

// New shareCode that returns data for ShareDialog
export async function shareCode(codeToShare, isPublic = true) {
  try {
    // Validate code first
    if (!isValidCode(codeToShare)) {
      logger('Код слишком короткий или пустой', 'error');
      return { success: false, error: 'Invalid code' };
    }

    // Check if already shared this exact code (local cache)
    if (lastShared === codeToShare && lastShareHash) {
      const shareUrl = window.location.origin + window.location.pathname + '?' + lastShareHash;
      return {
        success: true,
        shareUrl,
        hash: lastShareHash,
        isExisting: true
      };
    }

    // Try to create short URL via Supabase
    try {
      // First check if this code already exists in DB
      const { data: existing } = await supabase
        .from('code_v1')
        .select('hash')
        .eq('code', codeToShare)
        .limit(1)
        .single();

      if (existing?.hash) {
        // Code already exists, return existing link
        const shareUrl = window.location.origin + window.location.pathname + '?' + existing.hash;
        lastShared = codeToShare;
        lastShareHash = existing.hash;

        logger('Ссылка скопирована!', 'highlight');
        return {
          success: true,
          shareUrl,
          hash: existing.hash,
          isExisting: true
        };
      }

      // Create new entry
      const hash = nanoid(12);
      const { error } = await supabase.from('code_v1').insert([{
        code: codeToShare,
        hash,
        public: isPublic,
      }]);

      if (!error) {
        const shareUrl = window.location.origin + window.location.pathname + '?' + hash;
        lastShared = codeToShare;
        lastShareHash = hash;

        logger('Ссылка скопирована!', 'highlight');
        return {
          success: true,
          shareUrl,
          hash,
          isExisting: false
        };
      }
      console.warn('Supabase error, falling back to long URL:', error);
    } catch (e) {
      console.warn('Short URL failed, using long URL:', e);
    }

    // Fallback to long URL (base64 encoded code in hash)
    const longHash = '#' + code2hash(codeToShare);
    const shareUrl = window.location.origin + window.location.pathname + longHash;

    logger('Ссылка скопирована!', 'highlight');
    return {
      success: true,
      shareUrl,
      hash: null,
      isExisting: false
    };
  } catch (e) {
    console.error(e);
    logger('Ошибка при создании ссылки', 'error');
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
