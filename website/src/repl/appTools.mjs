// Тулы MCP для всего, что пользователь делает в окне Bulka помимо редактора и звука (их держит
// общий с чат-агентом реестр в agentToolsClient.mjs): паттерны, шеринг, громкость, экспорт,
// настройки, панель, сэмплы, провайдер ИИ. Исполняются в окне через мост mcpBridge.mjs.
// Ключи API и галочка статистики сюда сознательно не входят: секреты агенту не отдаём, согласие
// на статистику даёт только человек.

import { themes } from '@strudel/codemirror';
import { getAudioDevices, samples, setMaxPolyphony, setMultiChannelOrbits } from '@strudel/webaudio';
import {
  aiProviders,
  setActiveFooter,
  setAiModel,
  setAiProvider,
  setIsPanelOpened,
  setMasterVolumeSettings,
  settingsMap,
  storePrebakeScript,
} from '../settings.mjs';
import {
  getViewingPatternData,
  loadFeaturedPatterns,
  loadPublicPatterns,
  patternFilterName,
  toggleLike,
  updateTrackPublicity,
  userPattern,
} from '../user_pattern_utils.mjs';
import { getMetadata } from '../metadata_parser.js';
import { shareCode, supabase } from './util.mjs';
import { PANEL_TABS } from '../lib/appToolSchemas.mjs';
import { AUDIO_LOCKED_MESSAGE, isAudioUnlocked } from './audioUnlock.mjs';
import { href } from '../i18n/lang.mjs';

export { APP_TOOL_NAMES } from '../lib/appToolSchemas.mjs';

const BOOL_SETTINGS = [
  'isBracketMatchingEnabled',
  'isBracketClosingEnabled',
  'isLineNumbersDisplayed',
  'isActiveLineHighlighted',
  'isAutoCompletionEnabled',
  'isTooltipEnabled',
  'isFlashEnabled',
  'isSyncEnabled',
  'isLineWrappingEnabled',
  'isPatternHighlightingEnabled',
  'isTabIndentationEnabled',
  'isMultiCursorEnabled',
  'isZen',
  'isPanelPinned',
  'isPanelOpen',
  'isButtonRowHidden',
  'isCSSAnimationDisabled',
  'includePrebakeScriptInShare',
  'patternAutoStart',
];
const CHOICE_SETTINGS = {
  theme: () => Object.keys(themes),
  keybindings: () => ['codemirror', 'vim', 'emacs', 'vscode'],
  panelPosition: () => ['bottom', 'right'],
  togglePanelTrigger: () => ['click', 'hover'],
  fontFamily: () => [
    'monospace',
    'Courier',
    'CutiePi',
    'JetBrains',
    'Hack',
    'FiraCode',
    'FiraCode-SemiBold',
    'teletext',
    'tic80',
    'mode7',
    'BigBlueTerminal',
    'x3270',
    'Monocraft',
    'PressStart',
    'we-come-in-peace',
    'galactico',
  ],
  audioEngineTarget: () => ['webaudio', 'osc'],
};
const NUMBER_SETTINGS = { fontSize: [8, 72], maxPolyphony: [1, 1024] };
// Эти настройки движок читает при старте — окно перезагружается, как и при смене руками.
const RELOAD_SETTINGS = ['audioEngineTarget', 'audioDeviceName'];
const READABLE_SETTINGS = [
  ...BOOL_SETTINGS,
  ...Object.keys(CHOICE_SETTINGS),
  ...Object.keys(NUMBER_SETTINGS),
  'audioDeviceName',
  'multiChannelOrbits',
  'masterVolume',
  'activeFooter',
  'aiProvider',
  'aiModel',
  'localBaseUrl',
];

function patternTitle(code) {
  const meta = getMetadata(code || '');
  return meta.title || (code || '').split('\n')[0].slice(0, 60);
}

function requireConfirm(args, what) {
  if (args.confirm !== true) throw new Error(`${what}: нужен confirm: true`);
}

function parseSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('settings — объект { ключ: значение }');
  const out = {};
  for (const [key, value] of Object.entries(input)) {
    if (BOOL_SETTINGS.includes(key) || key === 'multiChannelOrbits') {
      if (typeof value !== 'boolean') throw new Error(`${key}: ждём true или false`);
    } else if (CHOICE_SETTINGS[key]) {
      const allowed = CHOICE_SETTINGS[key]();
      if (!allowed.includes(value)) throw new Error(`${key}: одно из ${allowed.join(', ')}`);
    } else if (NUMBER_SETTINGS[key]) {
      const [min, max] = NUMBER_SETTINGS[key];
      if (typeof value !== 'number' || value < min || value > max) throw new Error(`${key}: число от ${min} до ${max}`);
    } else if (key === 'audioDeviceName' || key === 'localBaseUrl') {
      if (typeof value !== 'string') throw new Error(`${key}: строка`);
    } else {
      throw new Error(`настройку «${key}» так не поменять; доступные: ${READABLE_SETTINGS.join(', ')}`);
    }
    out[key] = value;
  }
  return out;
}

function typedSetting(key, value) {
  if (BOOL_SETTINGS.includes(key) || key === 'multiChannelOrbits') return value === true || value === 'true';
  if (NUMBER_SETTINGS[key] || key === 'masterVolume') return Number(value);
  return value;
}

function afterReply(fn) {
  setTimeout(fn, 300);
}

/**
 * ctx: { editor, started, handleUpdate(patternData, reset), handleExport(begin, end, sampleRate, maxPolyphony, orbits, name) }
 */
export async function execAppTool(ctx, name, args = {}) {
  const { editor } = ctx;
  const settings = settingsMap.get();
  switch (name) {
    case 'undo':
      return editor.undo() ? 'Отменено.' : 'Отменять нечего.';
    case 'redo':
      return editor.redo() ? 'Повторено.' : 'Повторять нечего.';
    case 'getPlaybackState': {
      const viewing = getViewingPatternData();
      return JSON.stringify({
        playing: !!ctx.started,
        pattern: viewing?.id
          ? { id: viewing.id, collection: viewing.collection, title: patternTitle(viewing.code) }
          : null,
        volume: Number(settings.masterVolume),
        panelOpen: settings.isPanelOpen === true || settings.isPanelOpen === 'true',
        panelTab: settings.activeFooter,
      });
    }
    case 'getVolume':
      return String(Number(settings.masterVolume));
    case 'setVolume': {
      const v = Number(args.volume);
      if (!Number.isFinite(v) || v < 0 || v > 1) throw new Error('volume — число от 0 до 1');
      setMasterVolumeSettings(v);
      return `Громкость ${Math.round(v * 100)}%.`;
    }
    case 'newTrack':
      afterReply(() => (window.location.href = href('/?new')));
      return 'Окно открывает новый трек и перезагружается; через пару секунд оно снова на связи.';
    case 'shareCode': {
      const code = editor.code || '';
      const result = await shareCode(code, args.public !== false);
      if (!result.success) throw new Error(`не удалось поделиться: ${result.error}`);
      return JSON.stringify({ url: result.shareUrl, hash: result.hash, existing: !!result.isExisting });
    }
    case 'setSharePublic': {
      const res = await updateTrackPublicity(String(args.hash), args.public === true);
      if (!res?.success) throw new Error(`не удалось изменить видимость: ${res?.error || 'нет такого трека'}`);
      return args.public ? 'Трек в публичной ленте.' : 'Трек скрыт из ленты, доступен по ссылке.';
    }
    case 'listPatterns': {
      const viewing = getViewingPatternData();
      const all = userPattern.getAll();
      const list = Object.entries(all).map(([id, p]) => ({
        id,
        title: patternTitle(p.code),
        updated: p.updated_at || p.created_at || null,
        open: viewing?.id === id,
      }));
      return JSON.stringify(list);
    }
    case 'openPattern': {
      const data = userPattern.getPatternData(String(args.id));
      if (!data) throw new Error(`нет паттерна ${args.id}`);
      await ctx.handleUpdate({ ...data, collection: userPattern.collection }, args.play === true);
      return `Открыт «${patternTitle(data.code)}».`;
    }
    case 'newPattern': {
      const { data } = userPattern.createAndAddToDB();
      await ctx.handleUpdate(data);
      return `Создан паттерн ${data.id}.`;
    }
    case 'duplicatePattern': {
      const viewing = getViewingPatternData();
      if (!viewing?.code) throw new Error('нет открытого паттерна');
      const { data } = userPattern.duplicate(viewing);
      await ctx.handleUpdate(data);
      return `Копия открыта: ${data.id}.`;
    }
    case 'deletePattern': {
      requireConfirm(args, 'удаление паттерна');
      if (!userPattern.exists(String(args.id))) throw new Error(`нет паттерна ${args.id}`);
      const { data } = userPattern.delete(String(args.id));
      await ctx.handleUpdate({ ...data, collection: userPattern.collection });
      return `Паттерн ${args.id} удалён.`;
    }
    case 'clearPatterns': {
      requireConfirm(args, 'удаление всех паттернов');
      const { data } = await userPattern.clearAll({ confirmed: true });
      await ctx.handleUpdate({ ...data, collection: userPattern.collection });
      return 'Все свои паттерны удалены.';
    }
    case 'exportPatterns':
      return JSON.stringify(userPattern.getAll());
    case 'importPatterns': {
      let parsed;
      try {
        parsed = JSON.parse(String(args.json));
      } catch (e) {
        throw new Error(`json не разобран: ${e.message}`);
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        throw new Error('ждём объект { id: { code } }');
      let n = 0;
      for (const [id, p] of Object.entries(parsed)) {
        if (typeof p?.code !== 'string') throw new Error(`у «${id}» нет поля code`);
        userPattern.update(id, { ...p, id, collection: userPattern.collection });
        n++;
      }
      return `Загружено паттернов: ${n}.`;
    }
    case 'listPublicPatterns': {
      const page = Number.isInteger(args.page) && args.page >= 0 ? args.page : 0;
      const { data, error } = args.featured ? await loadFeaturedPatterns(page) : await loadPublicPatterns(page);
      if (error) throw new Error(`лента не загрузилась: ${error.message}`);
      return JSON.stringify(
        (data || []).map((p) => ({
          id: p.id,
          hash: p.hash,
          title: patternTitle(p.code),
          likes: p.like_count || 0,
          created: p.created_at,
        })),
      );
    }
    case 'openPublicPattern': {
      const { data, error } = await supabase.from('code_v1').select().eq('id', Number(args.id)).maybeSingle();
      if (error) throw new Error(`трек ${args.id} не загрузился: ${error.message}`);
      if (!data) throw new Error(`трека ${args.id} нет в ленте`);
      const collection = data.featured ? patternFilterName.featured : patternFilterName.public;
      await ctx.handleUpdate({ ...data, collection }, args.play === true);
      return `Открыт «${patternTitle(data.code)}».`;
    }
    case 'likePattern': {
      const liked = await toggleLike(String(args.hash));
      if (liked === null) throw new Error('слишком часто: подожди и повтори');
      return liked ? 'Лайк поставлен.' : 'Лайк снят.';
    }
    case 'exportWav': {
      const begin = Number(args.startCycle);
      const end = Number(args.endCycle);
      if (!Number.isFinite(begin) || !Number.isFinite(end) || begin < 0 || end <= begin) {
        throw new Error('нужны startCycle >= 0 и endCycle > startCycle');
      }
      const sampleRate = args.sampleRate === undefined ? 48000 : Number(args.sampleRate);
      if (!Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 192000) {
        throw new Error('sampleRate — целое от 8000 до 192000');
      }
      // the export evaluates the code first, and evaluation waits for the first click in the window
      if (!isAudioUnlocked()) throw new Error(AUDIO_LOCKED_MESSAGE);
      await ctx.handleExport(
        begin,
        end,
        sampleRate,
        Number(settings.maxPolyphony),
        settings.multiChannelOrbits === true || settings.multiChannelOrbits === 'true',
        args.name ? String(args.name) : undefined,
      );
      return `WAV отрендерен: циклы ${begin}–${end}, ${sampleRate} Гц.`;
    }
    case 'loadSamples': {
      const source = String(args.source || '');
      if (!source) throw new Error('source пустой');
      await samples(source);
      return `Пак подключён: ${source}.`;
    }
    case 'getPrebakeScript':
      return settings.prebakeScript || '(пусто)';
    case 'setPrebakeScript':
      storePrebakeScript(String(args.code ?? ''));
      return 'Prebake-скрипт сохранён; применится при следующем запуске.';
    case 'listAudioDevices': {
      const devices = await getAudioDevices();
      return JSON.stringify([...devices.keys()]);
    }
    case 'getSettings':
      return JSON.stringify(Object.fromEntries(READABLE_SETTINGS.map((k) => [k, typedSetting(k, settings[k])])));
    case 'setSettings': {
      const changes = parseSettings(args.settings);
      for (const [key, value] of Object.entries(changes)) {
        settingsMap.setKey(key, value);
        if (key === 'maxPolyphony') setMaxPolyphony(value);
        if (key === 'multiChannelOrbits') setMultiChannelOrbits(value);
      }
      const reload = Object.keys(changes).some((k) => RELOAD_SETTINGS.includes(k));
      if (reload) afterReply(() => window.location.reload());
      return `Изменено: ${Object.keys(changes).join(', ')}.${reload ? ' Окно перезагружается, чтобы применить аудио.' : ''}`;
    }
    case 'getAiProviders':
      return JSON.stringify({
        providers: Object.values(aiProviders),
        current: settings.aiProvider,
        model: settings.aiModel,
      });
    case 'setAiProvider': {
      const provider = String(args.provider);
      if (!Object.values(aiProviders).includes(provider)) {
        throw new Error(`провайдер: одно из ${Object.values(aiProviders).join(', ')}`);
      }
      setAiProvider(provider);
      if (args.model) setAiModel(String(args.model));
      return `Провайдер ${provider}${args.model ? `, модель ${args.model}` : ''}.`;
    }
    case 'openPanel': {
      const tab = String(args.tab);
      if (tab === 'close') {
        setIsPanelOpened(false);
        return 'Панель закрыта.';
      }
      if (!PANEL_TABS.includes(tab)) throw new Error(`вкладка: одна из ${PANEL_TABS.join(', ')} или close`);
      setActiveFooter(tab);
      setIsPanelOpened(true);
      return `Открыта вкладка ${tab}.`;
    }
    default:
      throw new Error(`Неизвестный инструмент окна: ${name}`);
  }
}
