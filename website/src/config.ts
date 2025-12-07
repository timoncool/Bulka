export const SITE = {
  title: 'Bulka',
  description: 'Bulka — платформа для лайв-кодинга музыки в браузере.',
  defaultLanguage: 'en',
};

export const OPEN_GRAPH = {
  image: {
    src: 'https://strudel.cc/icon.png',
    alt: 'Bulka Logo',
  },
};

// This is the type of the frontmatter you put in the docs markdown files.
export type Frontmatter = {
  title: string;
  description: string;
  layout: string;
  image?: { src: string; alt: string };
  dir?: 'ltr' | 'rtl';
  ogLocale?: string;
  lang?: string;
};

export const KNOWN_LANGUAGES = {
  English: 'en',
  German: 'de',
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

export const GITHUB_EDIT_URL = `https://codeberg.org/uzu/strudel/src/branch/main/website`;

export const COMMUNITY_INVITE_URL = `https://discord.com/invite/HGEdXmRkzT`;

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
  indexName: 'strudel-tidalcycles',
  appId: 'SAZ71S8CLS',
  apiKey: 'd5044f9d21b80e7721e5b0067a8730b1',
};

export type SidebarLang = Record<string, { text: string; link: string }[]>;
export type Sidebar = Record<(typeof KNOWN_LANGUAGE_CODES)[number], SidebarLang>;
export const SIDEBAR: Sidebar = {
  de: {
    Workshop: [
      { text: 'Intro', link: 'de/workshop/getting-started' },
      { text: 'Erste Sounds', link: 'de/workshop/first-sounds' },
      { text: 'Erste Töne', link: 'de/workshop/first-notes' },
      { text: 'Erste Effekte', link: 'de/workshop/first-effects' },
      { text: 'Pattern Effekte', link: 'de/workshop/pattern-effects' },
      { text: 'Rückblick', link: 'de/workshop/recap' },
      { text: 'Mehr Seiten auf Englisch', link: 'workshop/getting-started' },
    ],
  },
  en: {
    'Презентация': [
      { text: 'Что такое Bulka?', link: 'workshop/getting-started' },
      { text: 'Витрина', link: 'intro/showcase' },
      { text: 'Блог', link: 'blog' },
      /* { text: 'Community Bakery', link: 'bakery' }, */
    ],
    'Воркшоп': [
      // { text: 'Начало работы', link: 'workshop/getting-started' },
      { text: 'Первые звуки', link: 'workshop/first-sounds' },
      { text: 'Первые ноты', link: 'workshop/first-notes' },
      { text: 'Первые эффекты', link: 'workshop/first-effects' },
      { text: 'Эффекты паттернов', link: 'workshop/pattern-effects' },
      { text: 'Итоги', link: 'workshop/recap' },
      { text: 'Воркшоп на немецком', link: 'de/workshop/getting-started' },
    ],
    'Создание звука': [
      { text: 'Samples', link: 'learn/samples' },
      { text: 'Синтезаторы', link: 'learn/synths' },
      { text: 'Аудио эффекты', link: 'learn/effects' },
      { text: 'MIDI и OSC', link: 'learn/input-output' },
    ],
    'Ещё': [
      { text: 'Рецепты', link: 'recipes/recipes' },
      { text: 'Mini-Notation', link: 'learn/mini-notation' },
      { text: 'Визуальная обратная связь', link: 'learn/visual-feedback' },
      { text: 'Оффлайн', link: 'learn/pwa' },
      { text: 'Patterns', link: 'technical-manual/patterns' },
      { text: 'Mondo Notation', link: 'learn/mondo-notation' },
      { text: 'Метаданные музыки', link: 'learn/metadata' },
      { text: 'CSound', link: 'learn/csound' },
      { text: 'Hydra', link: 'learn/hydra' },
      { text: 'Устройства ввода', link: 'learn/input-devices' },
      { text: 'Движение устройства', link: 'learn/devicemotion' },
      { text: 'Продвинутые интеграции', link: 'learn/advanced-integrations' },
      { text: 'Сообщество и ресурсы', link: 'learn/community' },
    ],
    'Функции паттернов': [
      { text: 'Введение', link: 'functions/intro' },
      { text: 'Создание Patterns', link: 'learn/factories' },
      { text: 'Модификаторы времени', link: 'learn/time-modifiers' },
      { text: 'Параметры управления', link: 'functions/value-modifiers' },
      { text: 'Сигналы', link: 'learn/signals' },
      { text: 'Случайные модификаторы', link: 'learn/random-modifiers' },
      { text: 'Условные модификаторы', link: 'learn/conditional-modifiers' },
      { text: 'Накопление', link: 'learn/accumulation' },
      { text: 'Тональные функции', link: 'learn/tonal' },
      { text: 'Пошаговые функции', link: 'learn/stepwise' },
    ],
    'Понимание': [
      { text: 'Синтаксис кода', link: 'learn/code' },
      { text: 'Pitch', link: 'understand/pitch' },
      { text: 'Ксеногармонические функции', link: 'learn/xen' },
      { text: 'Cycles', link: 'understand/cycles' },
      { text: 'Voicings', link: 'understand/voicings' },
      { text: 'Выравнивание паттернов', link: 'technical-manual/alignment' },
      { text: 'Bulka vs Tidal', link: 'learn/strudel-vs-tidal' },
    ],
    'Разработка': [
      { text: 'Bulka в вашем проекте', link: 'technical-manual/project-start' },
      { text: 'Пакеты', link: 'technical-manual/packages' },
      { text: 'REPL', link: 'technical-manual/repl' },
      { text: 'Звуки', link: 'technical-manual/sounds' },
      { text: 'Документация', link: 'technical-manual/docs' },
      { text: 'Тестирование', link: 'technical-manual/testing' },
      // { text: 'Internals', link: 'technical-manual/internals' },
    ],
  },
};
