/**
 * App version info - injected at build time via Vite define
 * @see astro.config.mjs
 */

declare const __APP_VERSION__: string;
declare const __GIT_COMMIT__: string;
declare const __BUILD_TIME__: string;

export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
export const GIT_COMMIT = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'dev';
export const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();

// Short version string for display
export const VERSION_STRING = `v${APP_VERSION}`;
export const VERSION_FULL = `v${APP_VERSION} (${GIT_COMMIT})`;

// Log version to console on import
if (typeof window !== 'undefined') {
  console.log(
    `%c🍞 Bulka %c${VERSION_FULL}`,
    'font-weight: bold; font-size: 14px; color: #D4A574;',
    'font-size: 12px; color: #888;'
  );
}
