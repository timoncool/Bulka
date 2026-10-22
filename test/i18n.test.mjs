import { describe, expect, it } from 'vitest';
import ru from '../website/src/i18n/ru.mjs';
import en from '../website/src/i18n/en.mjs';
import { pathInLang, langFromPath } from '../website/src/i18n/lang.mjs';

const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('i18n dictionaries', () => {
  it('ru and en have the same keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(ru).sort());
  });
  it('every string has the same placeholders in both languages', () => {
    for (const key of Object.keys(ru)) expect([key, placeholders(en[key])]).toEqual([key, placeholders(ru[key])]);
  });
  it('no empty strings and no Cyrillic in English', () => {
    // the link to the Russian version names the language in Russian
    const ownLanguageNames = ['header.switchLangTitle'];
    for (const [key, value] of Object.entries(en)) {
      expect([key, value.trim().length > 0]).toEqual([key, true]);
      if (!ownLanguageNames.includes(key)) expect([key, /[Ѐ-ӿ]/.test(value)]).toEqual([key, false]);
    }
  });
});

describe('language paths', () => {
  it('maps pages between languages', () => {
    expect(pathInLang('/', 'en')).toBe('/en/');
    expect(pathInLang('/en/', 'ru')).toBe('/');
    expect(pathInLang('/learn/samples/', 'en')).toBe('/en/learn/samples/');
    expect(pathInLang('/en/learn/samples/', 'ru')).toBe('/learn/samples/');
    expect(pathInLang('/en/learn/samples/', 'en')).toBe('/en/learn/samples/');
    expect(langFromPath('/en')).toBe('en');
    expect(langFromPath('/english-page/')).toBe('ru');
  });
});
