import { KNOWN_LANGUAGES, KNOWN_LANGUAGE_CODES } from './config';
import { langFromPath } from './i18n/lang.mjs';
export { KNOWN_LANGUAGES, KNOWN_LANGUAGE_CODES };

export function getLanguageFromURL(pathname: string) {
  return langFromPath(pathname) as (typeof KNOWN_LANGUAGE_CODES)[number];
}
