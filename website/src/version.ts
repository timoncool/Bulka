/**
 * Git commit info - injected at build time via Vite define
 * @see astro.config.mjs
 */

declare const __GIT_COMMIT__: string;

export const GIT_COMMIT = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'dev';

// For display in header
export const VERSION_FULL = GIT_COMMIT;

// Log to console on import
if (typeof window !== 'undefined') {
  console.log(
    `%c🍞 Bulka %c${GIT_COMMIT}`,
    'font-weight: bold; font-size: 14px; color: #D4A574;',
    'font-size: 12px; color: #888;'
  );
}
