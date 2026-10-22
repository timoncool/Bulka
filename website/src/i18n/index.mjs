import { currentLang } from './lang.mjs';
import ru from './ru.mjs';
import en from './en.mjs';

export * from './lang.mjs';

export const DICTS = { ru, en };

/** Строка интерфейса по ключу; {name} в строке подставляется из vars. Нет ключа — ошибка, не тихая подмена. */
export function t(key, vars, lang = currentLang()) {
  const s = DICTS[lang][key];
  if (s === undefined) throw new Error(`i18n: нет строки «${key}» для языка ${lang}`);
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`)) : s;
}
