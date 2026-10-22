export const SITE = {
  title: 'Bulka',
  description: 'Bulka — платформа для лайв-кодинга музыки в браузере.',
  defaultLanguage: 'ru',
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
  Русский: 'ru',
  English: 'en',
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

export const GITHUB_EDIT_URL = `https://github.com/timoncool/Bulka/tree/main/website`;

export const COMMUNITY_INVITE_URL = `https://t.me/bulka_app`;

export type SidebarLang = Record<string, { text: string; link: string }[]>;
export type Sidebar = Record<(typeof KNOWN_LANGUAGE_CODES)[number], SidebarLang>;
export const SIDEBAR: Sidebar = {
  ru: {
    Презентация: [
      { text: 'Что такое Bulka?', link: 'workshop/getting-started' },
      { text: 'Лента', link: 'feed' },
      { text: 'Галерея треков', link: 'intro/gallery' },
      { text: 'Витрина', link: 'intro/showcase' },
      { text: 'Блог', link: 'blog' },
      { text: 'Что нового', link: 'whatsnew' },
    ],
    Воркшоп: [
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
      { text: 'Внешние источники', link: 'hydra/external-sources' },
      { text: 'Трансформации', link: 'hydra/transforms' },
      { text: 'Смешивание (Blending)', link: 'hydra/blending' },
      { text: 'Модуляция', link: 'hydra/modulation' },
      { text: 'Аудио-реактивность', link: 'hydra/audio' },
      { text: 'Feedback эффекты', link: 'hydra/feedback' },
      { text: 'Галерея примеров', link: 'hydra/examples' },
      { text: 'Hydra в Strudel', link: 'learn/hydra' },
    ],
    Ещё: [
      { text: 'Bulka AI Agent', link: 'learn/ai-agent' },
      { text: 'Бесплатный AI (OVHcloud)', link: 'learn/free-ai' },
      { text: 'Десктоп-версия', link: 'learn/desktop' },
      { text: 'MCP — рулить из Claude Desktop', link: 'learn/mcp' },
      { text: 'Локальные модели (LM Studio / Ollama)', link: 'learn/local-models' },
      { text: 'Поддержать проект 🍞', link: 'learn/donate' },
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
      { text: 'Движение (моторы)', link: 'workshop/motors' },
      { text: 'Продвинутые интеграции', link: 'learn/advanced-integrations' },
      { text: 'Частые вопросы (FAQ)', link: 'learn/faq' },
      { text: 'Сообщество и ресурсы', link: 'learn/community' },
    ],
    'Функции паттернов': [
      { text: 'Введение', link: 'functions/intro' },
      { text: 'Создание Patterns', link: 'learn/factories' },
      { text: 'Модификаторы времени', link: 'learn/time-modifiers' },
      { text: 'Параметры управления', link: 'functions/value-modifiers' },
      { text: 'Сигналы', link: 'learn/signals' },
      { text: 'LFO (осцилляторы)', link: 'learn/lfo' },
      { text: 'Случайные модификаторы', link: 'learn/random-modifiers' },
      { text: 'Условные модификаторы', link: 'learn/conditional-modifiers' },
      { text: 'Накопление', link: 'learn/accumulation' },
      { text: 'Тональные функции', link: 'learn/tonal' },
      { text: 'Пошаговые функции', link: 'learn/stepwise' },
    ],
    Понимание: [
      { text: 'Синтаксис кода', link: 'learn/code' },
      { text: 'Pitch', link: 'understand/pitch' },
      { text: 'Ксеногармонические функции', link: 'learn/xen' },
      { text: 'Cycles', link: 'understand/cycles' },
      { text: 'Voicings', link: 'understand/voicings' },
      { text: 'Выравнивание паттернов', link: 'technical-manual/alignment' },
      { text: 'Bulka vs Tidal', link: 'learn/strudel-vs-tidal' },
    ],
    Разработка: [
      { text: 'Bulka в вашем проекте', link: 'technical-manual/project-start' },
      { text: 'Пакеты', link: 'technical-manual/packages' },
      { text: 'REPL', link: 'technical-manual/repl' },
      { text: 'Звуки', link: 'technical-manual/sounds' },
      { text: 'Документация', link: 'technical-manual/docs' },
      { text: 'Тестирование', link: 'technical-manual/testing' },
      // { text: 'Internals', link: 'technical-manual/internals' },
    ],
  },
  en: {
    Presentation: [
      { text: 'What is Bulka?', link: 'en/workshop/getting-started' },
      { text: 'Feed', link: 'en/feed' },
      { text: 'Track Gallery', link: 'en/intro/gallery' },
      { text: 'Showcase', link: 'en/intro/showcase' },
      { text: 'Blog', link: 'en/blog' },
      { text: 'What’s New', link: 'en/whatsnew' },
    ],
    Workshop: [
      // { text: 'Getting Started', link: 'en/workshop/getting-started' },
      { text: 'First Sounds', link: 'en/workshop/first-sounds' },
      { text: 'First Notes', link: 'en/workshop/first-notes' },
      { text: 'First Effects', link: 'en/workshop/first-effects' },
      { text: 'Pattern Effects', link: 'en/workshop/pattern-effects' },
      { text: 'Recap', link: 'en/workshop/recap' },
    ],
    'Making Sound': [
      { text: 'Samples', link: 'en/learn/samples' },
      { text: 'Synths', link: 'en/learn/synths' },
      { text: 'Audio Effects', link: 'en/learn/effects' },
      { text: 'MIDI & OSC', link: 'en/learn/input-output' },
    ],
    'Hydra — Visuals': [
      { text: 'Hydra Introduction', link: 'en/hydra/intro' },
      { text: 'Interactive Tutorial', link: 'en/hydra/tutorial' },
      { text: 'Sources', link: 'en/hydra/sources' },
      { text: 'External Sources', link: 'en/hydra/external-sources' },
      { text: 'Transforms', link: 'en/hydra/transforms' },
      { text: 'Blending', link: 'en/hydra/blending' },
      { text: 'Modulation', link: 'en/hydra/modulation' },
      { text: 'Audio Reactivity', link: 'en/hydra/audio' },
      { text: 'Feedback Effects', link: 'en/hydra/feedback' },
      { text: 'Example Gallery', link: 'en/hydra/examples' },
      { text: 'Hydra in Strudel', link: 'en/learn/hydra' },
    ],
    More: [
      { text: 'Bulka AI Agent', link: 'en/learn/ai-agent' },
      { text: 'Free AI (OVHcloud)', link: 'en/learn/free-ai' },
      { text: 'Desktop App', link: 'en/learn/desktop' },
      { text: 'MCP — drive from Claude Desktop', link: 'en/learn/mcp' },
      { text: 'Local Models (LM Studio / Ollama)', link: 'en/learn/local-models' },
      { text: 'Support the Project 🍞', link: 'en/learn/donate' },
      { text: 'Recipes', link: 'en/recipes/recipes' },
      { text: 'Mini-Notation', link: 'en/learn/mini-notation' },
      { text: 'Visual Feedback', link: 'en/learn/visual-feedback' },
      { text: 'Editor Themes', link: 'en/learn/themes' },
      { text: 'Offline', link: 'en/learn/pwa' },
      { text: 'Patterns', link: 'en/technical-manual/patterns' },
      { text: 'Mondo Notation', link: 'en/learn/mondo-notation' },
      { text: 'Music metadata', link: 'en/learn/metadata' },
      { text: 'CSound', link: 'en/learn/csound' },
      { text: 'Input Devices', link: 'en/learn/input-devices' },
      { text: 'Device Motion', link: 'en/learn/devicemotion' },
      { text: 'Motors', link: 'en/workshop/motors' },
      { text: 'Advanced Integrations', link: 'en/learn/advanced-integrations' },
      { text: 'FAQ', link: 'en/learn/faq' },
      { text: 'Community & Resources', link: 'en/learn/community' },
    ],
    'Pattern Functions': [
      { text: 'Introduction', link: 'en/functions/intro' },
      { text: 'Creating Patterns', link: 'en/learn/factories' },
      { text: 'Time Modifiers', link: 'en/learn/time-modifiers' },
      { text: 'Control Parameters', link: 'en/functions/value-modifiers' },
      { text: 'Signals', link: 'en/learn/signals' },
      { text: 'LFOs', link: 'en/learn/lfo' },
      { text: 'Random Modifiers', link: 'en/learn/random-modifiers' },
      { text: 'Conditional Modifiers', link: 'en/learn/conditional-modifiers' },
      { text: 'Accumulation', link: 'en/learn/accumulation' },
      { text: 'Tonal Functions', link: 'en/learn/tonal' },
      { text: 'Stepwise Functions', link: 'en/learn/stepwise' },
    ],
    Understand: [
      { text: 'Coding syntax', link: 'en/learn/code' },
      { text: 'Pitch', link: 'en/understand/pitch' },
      { text: 'Xenharmonic Functions', link: 'en/learn/xen' },
      { text: 'Cycles', link: 'en/understand/cycles' },
      { text: 'Voicings', link: 'en/understand/voicings' },
      { text: 'Pattern Alignment', link: 'en/technical-manual/alignment' },
      { text: 'Bulka vs Tidal', link: 'en/learn/strudel-vs-tidal' },
    ],
    Development: [
      { text: 'Bulka in your Project', link: 'en/technical-manual/project-start' },
      { text: 'Packages', link: 'en/technical-manual/packages' },
      { text: 'REPL', link: 'en/technical-manual/repl' },
      { text: 'Sounds', link: 'en/technical-manual/sounds' },
      { text: 'Docs', link: 'en/technical-manual/docs' },
      { text: 'Testing', link: 'en/technical-manual/testing' },
      // { text: 'Internals', link: 'en/technical-manual/internals' },
    ],
  },
};
