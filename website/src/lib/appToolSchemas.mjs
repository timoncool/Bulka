// Схемы MCP-тулов окна Bulka (чистые данные: их читает и сервер /mcp, и окно). Исполнитель — repl/appTools.mjs.

export const PANEL_TABS = [
  'intro',
  'chat',
  'patterns',
  'sounds',
  'reference',
  'console',
  'export',
  'settings',
  'support',
];

const obj = (properties, required = []) => ({ type: 'object', properties, required });
const str = (description) => ({ type: 'string', description });
const num = (description) => ({ type: 'number', description });
const bool = (description) => ({ type: 'boolean', description });

export const APP_TOOLS = [
  {
    name: 'undo',
    description: 'Отменить последнюю правку в редакторе (как кнопка «отменить», Ctrl+Z).',
    inputSchema: obj({}),
  },
  { name: 'redo', description: 'Повторить отменённую правку (Ctrl+Shift+Z).', inputSchema: obj({}) },
  {
    name: 'getPlaybackState',
    description: 'Состояние окна: играет ли музыка, открыт ли паттерн, текущая громкость, открытая вкладка панели.',
    inputSchema: obj({}),
  },
  { name: 'getVolume', description: 'Текущая общая громкость (0–1; 0 = звук выключен).', inputSchema: obj({}) },
  {
    name: 'setVolume',
    description: 'Общая громкость, как ползунок в шапке: 0 — выключить звук, 1 — 100%.',
    inputSchema: obj({ volume: num('Громкость от 0 до 1') }, ['volume']),
  },
  {
    name: 'newTrack',
    description: 'Начать новый трек (кнопка «новый»): пустой редактор, чат очищается. Окно перезагрузится.',
    inputSchema: obj({}),
  },
  {
    name: 'shareCode',
    description:
      'Поделиться текущим кодом (кнопка «поделиться»): сохраняет трек в облако Bulka и возвращает ссылку bulka.app/?<hash>.',
    inputSchema: obj({ public: bool('Показывать трек в публичной ленте (по умолчанию true)') }),
  },
  {
    name: 'setSharePublic',
    description: 'Сделать уже расшаренный трек публичным или скрыть его из ленты.',
    inputSchema: obj({ hash: str('hash трека из ссылки'), public: bool('true — в ленте, false — только по ссылке') }, [
      'hash',
      'public',
    ]),
  },
  {
    name: 'listPatterns',
    description:
      'Список своих паттернов (вкладка «паттерны»): id, название из // @title, дата правки, открыт ли сейчас.',
    inputSchema: obj({}),
  },
  {
    name: 'openPattern',
    description: 'Открыть свой паттерн по id в редакторе.',
    inputSchema: obj({ id: str('id паттерна из listPatterns'), play: bool('Сразу запустить') }, ['id']),
  },
  { name: 'newPattern', description: 'Создать новый пустой паттерн и открыть его.', inputSchema: obj({}) },
  { name: 'duplicatePattern', description: 'Дублировать открытый паттерн и открыть копию.', inputSchema: obj({}) },
  {
    name: 'deletePattern',
    description: 'Удалить свой паттерн по id (без возврата). Требует confirm: true.',
    inputSchema: obj({ id: str('id паттерна'), confirm: bool('true — подтверждаю удаление') }, ['id', 'confirm']),
  },
  {
    name: 'clearPatterns',
    description: 'Удалить ВСЕ свои паттерны (кнопка «очистить»). Требует confirm: true.',
    inputSchema: obj({ confirm: bool('true — подтверждаю удаление всех паттернов') }, ['confirm']),
  },
  {
    name: 'exportPatterns',
    description: 'Выгрузить все свои паттерны в JSON (как кнопка «экспорт»). Возвращает JSON-текст.',
    inputSchema: obj({}),
  },
  {
    name: 'importPatterns',
    description: 'Загрузить паттерны из JSON, полученного exportPatterns (как кнопка «импорт»).',
    inputSchema: obj({ json: str('JSON-объект { id: { code, ... } }') }, ['json']),
  },
  {
    name: 'listPublicPatterns',
    description: 'Публичная лента треков: новые или избранные, постранично.',
    inputSchema: obj({ featured: bool('true — избранные, false — новые'), page: num('Страница с 0') }),
  },
  {
    name: 'openPublicPattern',
    description: 'Открыть трек из ленты по id (из listPublicPatterns).',
    inputSchema: obj({ id: num('id трека'), play: bool('Сразу запустить') }, ['id']),
  },
  {
    name: 'likePattern',
    description: 'Поставить или снять лайк треку из ленты по hash.',
    inputSchema: obj({ hash: str('hash трека') }, ['hash']),
  },
  {
    name: 'exportWav',
    description:
      'Экспорт WAV без реального времени (вкладка «экспорт»): рендерит циклы с startCycle по endCycle. В десктопе файл ложится в папку recordings.',
    inputSchema: obj(
      {
        startCycle: num('С какого цикла (с 0)'),
        endCycle: num('До какого цикла'),
        sampleRate: num('Частота дискретизации, по умолчанию 48000'),
        name: str('Имя файла без расширения'),
      },
      ['startCycle', 'endCycle'],
    ),
  },
  {
    name: 'loadSamples',
    description:
      "Подключить пак сэмплов, как samples(...) в коде: 'github:user/repo' (в корне strudel.json) или URL на strudel.json.",
    inputSchema: obj({ source: str("Например 'github:tidalcycles/dirt-samples'") }, ['source']),
  },
  {
    name: 'getPrebakeScript',
    description: 'Текущий prebake-скрипт (выполняется перед каждым запуском).',
    inputSchema: obj({}),
  },
  {
    name: 'setPrebakeScript',
    description: 'Заменить prebake-скрипт (настройки → Prebake-скрипт).',
    inputSchema: obj({ code: str('Код prebake-скрипта') }, ['code']),
  },
  {
    name: 'listAudioDevices',
    description: 'Аудиовыходы для настройки audioDeviceName. Как и в окне, браузер может спросить доступ к микрофону.',
    inputSchema: obj({}),
  },
  {
    name: 'getSettings',
    description: 'Настройки окна: редактор, тема, шрифт, клавиши, панель, аудио, провайдер ИИ (без ключей API).',
    inputSchema: obj({}),
  },
  {
    name: 'setSettings',
    description:
      'Изменить настройки, как во вкладке «настройки». Принимает объект { ключ: значение }; ключи — из getSettings. Ключи API так не меняются.',
    inputSchema: obj({ settings: { type: 'object', description: 'Например { "theme": "dracula", "fontSize": 20 }' } }, [
      'settings',
    ]),
  },
  {
    name: 'getAiProviders',
    description: 'Провайдеры ИИ чата Bulka и выбранный сейчас (провайдер и модель).',
    inputSchema: obj({}),
  },
  {
    name: 'setAiProvider',
    description: 'Выбрать провайдера ИИ для чата Bulka и модель. Ключ провайдера задаёт только пользователь.',
    inputSchema: obj({ provider: str('Провайдер из getAiProviders'), model: str('id модели (необязательно)') }, [
      'provider',
    ]),
  },
  {
    name: 'openPanel',
    description: `Открыть вкладку панели: ${PANEL_TABS.join(', ')}; или закрыть панель (tab: "close").`,
    inputSchema: obj({ tab: str('Имя вкладки или close') }, ['tab']),
  },
];

export const APP_TOOL_NAMES = new Set(APP_TOOLS.map((t) => t.name));
