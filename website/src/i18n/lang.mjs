// Языки сайта: русский — на корне (bulka.app/…), английский — под /en/ (bulka.app/en/…).
export const LANGS = ['ru', 'en'];
export const DEFAULT_LANG = 'ru';

export function langFromPath(pathname = '/') {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'ru';
}

export function currentLang() {
  return typeof window === 'undefined' ? DEFAULT_LANG : langFromPath(window.location.pathname);
}

/** Путь страницы на другом языке: /learn/x/ <-> /en/learn/x/. */
export function pathInLang(pathname, lang) {
  const bare = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return lang === 'en' ? (bare === '/' ? '/en/' : `/en${bare}`) : bare;
}

/** Внутренняя ссылка на текущем языке: href('/learn/samples/') -> '/en/learn/samples/' на английском. */
export function href(path, lang = currentLang()) {
  return pathInLang(path, lang);
}
