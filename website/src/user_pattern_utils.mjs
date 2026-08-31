import { atom } from 'nanostores';
import { useStore } from '@nanostores/react';
import { logger } from '@strudel/core';
import { nanoid } from 'nanoid';
import { settingsMap } from './settings.mjs';
import { confirmDialog, parseJSON, supabase } from './repl/util.mjs';

export let $publicPatterns = atom([]);
export let $featuredPatterns = atom([]);

const patternQueryLimit = 20;
export const patternFilterName = {
  public: 'latest',
  featured: 'featured',
  user: 'user',
  // stock: 'stock examples',
};

const sessionAtom = (name, initial = undefined) => {
  const storage = typeof sessionStorage !== 'undefined' ? sessionStorage : {};
  const store = atom(typeof storage[name] !== 'undefined' ? storage[name] : initial);
  store.listen((newValue) => {
    if (typeof newValue === 'undefined') {
      delete storage[name];
    } else {
      storage[name] = newValue;
    }
  });
  return store;
};

export let $viewingPatternData = sessionAtom('viewingPatternData', {
  id: '',
  code: '',
  collection: patternFilterName.user,
  created_at: Date.now(),
});

export const getViewingPatternData = () => {
  return parseJSON($viewingPatternData.get());
};
export const useViewingPatternData = () => {
  return useStore($viewingPatternData);
};

export const setViewingPatternData = (data) => {
  $viewingPatternData.set(JSON.stringify(data));
};

function parsePageNum(page) {
  return isNaN(page) ? 0 : page;
}
export function loadPublicPatterns(page) {
  page = parsePageNum(page);
  const offset = page * patternQueryLimit;
  return supabase
    .from('code_v1')
    .select()
    .eq('public', true)
    .range(offset, offset + patternQueryLimit)
    .order('id', { ascending: false });
}

export function loadFeaturedPatterns(page = 0) {
  page = parsePageNum(page);
  const offset = page * patternQueryLimit;
  return supabase
    .from('code_v1')
    .select()
    .eq('featured', true)
    .range(offset, offset + patternQueryLimit)
    .order('id', { ascending: false });
}

export async function loadAndSetPublicPatterns(page) {
  const p = await loadPublicPatterns(page);
  const data = p?.data;
  const pats = {};
  data?.forEach((data, key) => (pats[data.id ?? key] = data));
  $publicPatterns.set(pats);
}
export async function loadAndSetFeaturedPatterns(page) {
  const p = await loadFeaturedPatterns(page);
  const data = p?.data;
  const pats = {};
  data?.forEach((data, key) => (pats[data.id ?? key] = data));
  $featuredPatterns.set(pats);
}

export async function loadDBPatterns() {
  try {
    await loadAndSetPublicPatterns();
    await loadAndSetFeaturedPatterns();
  } catch (err) {
    console.error('error loading patterns', err);
  }
}

// reason: https://codeberg.org/uzu/strudel/issues/857
const $activePattern = sessionAtom('activePattern', '');

export function setActivePattern(key) {
  $activePattern.set(key);
}
export function getActivePattern() {
  return $activePattern.get();
}
export function useActivePattern() {
  return useStore($activePattern);
}

export const setLatestCode = (code) => settingsMap.setKey('latestCode', code);

export const defaultCode = '';
export const userPattern = {
  collection: patternFilterName.user,
  getAll() {
    const patterns = parseJSON(settingsMap.get().userPatterns);
    return patterns ?? {};
  },
  getPatternData(id) {
    const userPatterns = this.getAll();
    return userPatterns[id];
  },
  exists(id) {
    return this.getPatternData(id) != null;
  },
  isValidID(id) {
    return id != null && id.length > 0;
  },

  create() {
    const newID = createPatternID();
    const code = defaultCode;
    const data = { code, created_at: Date.now(), id: newID, collection: this.collection };
    return { id: newID, data };
  },
  createAndAddToDB() {
    const newPattern = this.create();
    return this.update(newPattern.id, newPattern.data);
  },

  update(id, data) {
    const userPatterns = this.getAll();
    data = { ...data, id, collection: this.collection };
    setUserPatterns({ ...userPatterns, [id]: data });
    return { id, data };
  },
  duplicate(data) {
    const newPattern = this.create();
    return this.update(newPattern.id, { ...newPattern.data, code: data.code });
  },
  clearAll() {
    confirmDialog(`This will delete all your patterns. Are you really sure?`).then((r) => {
      if (r == false) {
        return;
      }
      const viewingPatternData = getViewingPatternData();
      setUserPatterns({});

      if (viewingPatternData.collection !== this.collection) {
        return { id: viewingPatternData.id, data: viewingPatternData };
      }
      setActivePattern(null);
      return this.create();
    });
  },
  delete(id) {
    const userPatterns = this.getAll();
    delete userPatterns[id];
    if (getActivePattern() === id) {
      setActivePattern(null);
    }
    setUserPatterns(userPatterns);
    const viewingPatternData = getViewingPatternData();
    const viewingID = viewingPatternData?.id;
    if (viewingID === id) {
      return { id: null, data: { code: defaultCode } };
    }
    return { id: viewingID, data: userPatterns[viewingID] };
  },
};

function setUserPatterns(obj) {
  return settingsMap.setKey('userPatterns', JSON.stringify(obj));
}

export const createPatternID = () => {
  return nanoid(12);
};

export async function importPatterns(fileList) {
  const files = Array.from(fileList);
  await Promise.all(
    files.map(async (file, i) => {
      const content = await file.text();
      if (file.type === 'application/json') {
        const userPatterns = userPattern.getAll();
        setUserPatterns({ ...userPatterns, ...parseJSON(content) });
      } else if (['text/x-markdown', 'text/plain'].includes(file.type)) {
        const id = file.name.replace(/\.[^/.]+$/, '');
        userPattern.update(id, { code: content });
      }
    }),
  );
  logger(`import done!`);
}

export async function exportPatterns() {
  const userPatterns = userPattern.getAll();
  const blob = new Blob([JSON.stringify(userPatterns)], { type: 'application/json' });
  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  downloadLink.download = `strudel_patterns_${date}.json`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// ============ LIKES SYSTEM WITH BOT PROTECTION ============

const LIKED_TRACKS_KEY = 'bulka-liked-tracks';
const LIKE_COOLDOWN_KEY = 'bulka-like-cooldown';
const LIKE_RATE_LIMIT_KEY = 'bulka-like-rate';

// Rate limiting settings
const LIKE_COOLDOWN_MS = 2000; // 2 seconds between likes on same track
const GLOBAL_RATE_LIMIT = 10; // Max 10 likes per minute
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

// Get liked tracks from localStorage
export function getLikedTracks() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LIKED_TRACKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save liked tracks to localStorage
function setLikedTracks(tracks) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LIKED_TRACKS_KEY, JSON.stringify(tracks));
}

// Check if a track is liked
export function isTrackLiked(hash) {
  return getLikedTracks().includes(hash);
}

// Get cooldown data for a specific track
function getCooldown(hash) {
  if (typeof window === 'undefined') return 0;
  try {
    const cooldowns = JSON.parse(localStorage.getItem(LIKE_COOLDOWN_KEY) || '{}');
    return cooldowns[hash] || 0;
  } catch {
    return 0;
  }
}

// Set cooldown for a track
function setCooldown(hash) {
  if (typeof window === 'undefined') return;
  try {
    const cooldowns = JSON.parse(localStorage.getItem(LIKE_COOLDOWN_KEY) || '{}');
    cooldowns[hash] = Date.now();
    localStorage.setItem(LIKE_COOLDOWN_KEY, JSON.stringify(cooldowns));
  } catch {
    // ignore
  }
}

// Check if cooldown is active for a track
function isCooldownActive(hash) {
  const lastLike = getCooldown(hash);
  return Date.now() - lastLike < LIKE_COOLDOWN_MS;
}

// Rate limiting - track global like count
function getRateLimitData() {
  if (typeof window === 'undefined') return { count: 0, windowStart: 0 };
  try {
    const data = JSON.parse(localStorage.getItem(LIKE_RATE_LIMIT_KEY) || '{}');
    return { count: data.count || 0, windowStart: data.windowStart || 0 };
  } catch {
    return { count: 0, windowStart: 0 };
  }
}

function updateRateLimit() {
  if (typeof window === 'undefined') return false;
  try {
    const now = Date.now();
    let data = getRateLimitData();

    // Reset window if expired
    if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
      data = { count: 1, windowStart: now };
    } else {
      // Check if rate limit exceeded
      if (data.count >= GLOBAL_RATE_LIMIT) {
        return false; // Rate limited
      }
      data.count++;
    }

    localStorage.setItem(LIKE_RATE_LIMIT_KEY, JSON.stringify(data));
    return true;
  } catch {
    return true; // Allow on error
  }
}

// Check if rate limited
export function isRateLimited() {
  const data = getRateLimitData();
  const now = Date.now();

  if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
    return false; // Window expired
  }

  return data.count >= GLOBAL_RATE_LIMIT;
}

// Get remaining cooldown time for a track (in ms)
export function getCooldownRemaining(hash) {
  const lastLike = getCooldown(hash);
  const remaining = LIKE_COOLDOWN_MS - (Date.now() - lastLike);
  return Math.max(0, remaining);
}

// Toggle like on a track with protection
export async function toggleLike(hash) {
  // Check per-track cooldown
  if (isCooldownActive(hash)) {
    console.warn('Like cooldown active for this track');
    return null; // Cooldown active, don't process
  }

  // Check global rate limit
  if (!updateRateLimit()) {
    console.warn('Like rate limit exceeded');
    return null; // Rate limited
  }

  // Set cooldown for this track
  setCooldown(hash);

  const likedTracks = getLikedTracks();
  const wasLiked = likedTracks.includes(hash);

  // Update localStorage
  if (wasLiked) {
    setLikedTracks(likedTracks.filter(h => h !== hash));
  } else {
    setLikedTracks([...likedTracks, hash]);
  }

  // Update database
  try {
    if (wasLiked) {
      // Decrement like_count
      const { data } = await supabase
        .from('code_v1')
        .select('like_count')
        .eq('hash', hash)
        .single();

      const currentCount = data?.like_count || 0;
      await supabase
        .from('code_v1')
        .update({ like_count: Math.max(0, currentCount - 1) })
        .eq('hash', hash);
    } else {
      // Increment like_count
      const { data } = await supabase
        .from('code_v1')
        .select('like_count')
        .eq('hash', hash)
        .single();

      const currentCount = data?.like_count || 0;
      await supabase
        .from('code_v1')
        .update({ like_count: currentCount + 1 })
        .eq('hash', hash);
    }
  } catch (err) {
    console.error('Error updating like count:', err);
  }

  return !wasLiked;
}

// Update track publicity
export async function updateTrackPublicity(hash, isPublic) {
  if (!hash) return { success: false };

  try {
    const { error } = await supabase
      .from('code_v1')
      .update({ public: isPublic })
      .eq('hash', hash);

    if (error) {
      console.error('Failed to update publicity:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    console.error('Failed to update publicity:', e);
    return { success: false, error: e.message };
  }
}

// Load patterns sorted by likes
export function loadPatternsByLikes(page = 0) {
  page = parsePageNum(page);
  const offset = page * patternQueryLimit;
  return supabase
    .from('code_v1')
    .select()
    .eq('public', true)
    .range(offset, offset + patternQueryLimit)
    .order('like_count', { ascending: false, nullsFirst: false });
}
