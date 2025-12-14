export const SITE = {
  title: 'Bulka',
  description: 'Bulka — платформа для лайв-кодинга музыки в браузере.',
  defaultLanguage: 'en',
};

export const OPEN_GRAPH = {
  image: {
    src: '/icon.png',
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

export const GITHUB_EDIT_URL = `https://github.com/timoncool/Bulka/tree/main/website`;

export const COMMUNITY_INVITE_URL = `https://t.me/bulka_app`;

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
  indexName: 'strudel-tidalcycles',
  appId: 'SAZ71S8CLS',
  apiKey: 'd5044f9d21b80e7721e5b0067a8730b1',
};

export type SidebarLang = Record<string, { text: string; link: string }[]>;
export type Sidebar = Record<(typeof KNOWN_LANGUAGE_CODES)[number], SidebarLang>;
export const SIDEBAR: Sidebar = {
  de: {},
  en: {
    'Презентация': [
      { text: 'Что такое Bulka?', link: 'workshop/getting-started' },
      { text: 'Лента', link: 'feed' },
      { text: 'Галерея треков', link: 'intro/gallery' },
      { text: 'Витрина', link: 'intro/showcase' },
      { text: 'Блог', link: 'blog' },
    ],
    'Воркшоп': [
      // { text: 'Начало работы', link: 'workshop/getting-started' },
      { text: 'Первые звуки', link: 'workshop/first-sounds' },
      { text: 'Первые ноты', link: 'workshop/first-notes' },
      { text: 'Первые эффекты', link: 'workshop/first-effects' },
      { text: 'Эффекты паттернов', link: 'workshop/pattern-effects' },
      { text: 'Итоги', link: 'workshop/recap' },
    ],
    'Создание звука': [
      { text: 'Samples', link: 'learn/samples' },
      { text: 'Синтезаторы', link: 'learn/synths' },
      { text: 'Аудио эффекты', link: 'learn/effects' },
      { text: 'MIDI и OSC', link: 'learn/input-output' },
    ],
    'Hydra — Визуализации': [
      { text: 'Введение в Hydra', link: 'hydra/intro' },
      { text: 'Интерактивный туториал', link: 'hydra/tutorial' },
      { text: 'Источники (Sources)', link: 'hydra/sources' },
      { text: 'Трансформации', link: 'hydra/transforms' },
      { text: 'Смешивание (Blending)', link: 'hydra/blending' },
      { text: 'Модуляция', link: 'hydra/modulation' },
      { text: 'Аудио-реактивность', link: 'hydra/audio' },
      { text: 'Feedback эффекты', link: 'hydra/feedback' },
      { text: 'Галерея примеров', link: 'hydra/examples' },
      { text: 'Hydra в Strudel', link: 'learn/hydra' },
    ],
    'Ещё': [
      { text: 'Bulka AI Agent', link: 'learn/ai-agent' },
      { text: 'Рецепты', link: 'recipes/recipes' },
      { text: 'Mini-Notation', link: 'learn/mini-notation' },
      { text: 'Визуальная обратная связь', link: 'learn/visual-feedback' },
      { text: 'Темы редактора', link: 'learn/themes' },
      { text: 'Оффлайн', link: 'learn/pwa' },
      { text: 'Patterns', link: 'technical-manual/patterns' },
      { text: 'Mondo Notation', link: 'learn/mondo-notation' },
      { text: 'Метаданные музыки', link: 'learn/metadata' },
      { text: 'CSound', link: 'learn/csound' },
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
