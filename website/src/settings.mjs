import { persistentMap } from '@nanostores/persistent';
import { useStore } from '@nanostores/react';
import { register } from '@strudel/core';
import { isUdels } from './repl/util.mjs';

export const audioEngineTargets = {
  webaudio: 'webaudio',
  osc: 'osc',
};

export const soundFilterType = {
  USER: 'user',
  DRUMS: 'drums',
  SAMPLES: 'samples',
  SYNTHS: 'synths',
  WAVETABLES: 'wavetables',
  ALL: 'all',
};

export const aiProviders = {
  openai: 'openai',
  anthropic: 'anthropic',
  gemini: 'gemini',
  gpt4free: 'gpt4free',
};

export const defaultSettings = {
  activeFooter: 'intro',
  keybindings: 'codemirror',
  // AI Agent settings - separate keys for each provider
  openaiApiKey: '',
  anthropicApiKey: '',
  geminiApiKey: '',
  aiProvider: aiProviders.openai,
  aiModel: '', // Loaded dynamically from provider API
  isBracketMatchingEnabled: true,
  isBracketClosingEnabled: true,
  isLineNumbersDisplayed: true,
  isActiveLineHighlighted: true,
  isAutoCompletionEnabled: false,
  isTooltipEnabled: false,
  isFlashEnabled: true,
  isSyncEnabled: false,
  isLineWrappingEnabled: false,
  isPatternHighlightingEnabled: true,
  isTabIndentationEnabled: false,
  isMultiCursorEnabled: false,
  theme: 'strudelTheme',
  fontFamily: 'monospace',
  fontSize: 18,
  latestCode: '',
  isZen: false,
  soundsFilter: soundFilterType.ALL,
  patternFilter: 'community',
  // panelPosition: window.innerWidth > 1000 ? 'right' : 'bottom', //FIX: does not work on astro
  panelPosition: 'right',
  isPanelPinned: false,
  isPanelOpen: true,
  togglePanelTrigger: 'click', //click | hover
  // Panel sizes (in percentage for react-resizable-panels)
  panelSizeBottom: 35, // % of height for bottom panel
  panelSizeRight: 30, // % of width for right panel
  userPatterns: '{}',
  prebakeScript: '',
  audioEngineTarget: audioEngineTargets.webaudio,
  isButtonRowHidden: false,
  isCSSAnimationDisabled: false,
  maxPolyphony: 128,
  multiChannelOrbits: false,
  includePrebakeScriptInShare: true,
  enabledPacks: 'all', // 'all' или JSON строка с массивом названий паков
  masterVolume: 1, // Master volume (0-1), default 100%
};

let search = null;
if (typeof window !== 'undefined') {
  search = new URLSearchParams(window.location.search);
}
// if running multiple instance in one window, it will use the settings for that instance. else default to normal
const instance = parseInt(search?.get('instance') ?? '0');
const settings_key = `strudel-settings${instance > 0 ? instance : ''}`;

export const settingsMap = persistentMap(settings_key, defaultSettings);

export const parseBoolean = (booleanlike) => ([true, 'true'].includes(booleanlike) ? true : false);

export function useSettings() {
  const state = useStore(settingsMap);

  const userPatterns = JSON.parse(state.userPatterns);
  Object.keys(userPatterns).forEach((key) => {
    const data = userPatterns[key];
    data.id = data.id ?? key;
    userPatterns[key] = data;
  });

  // Парсим enabledPacks
  let enabledPacks = state.enabledPacks;
  if (enabledPacks !== 'all' && typeof enabledPacks === 'string') {
    try {
      enabledPacks = JSON.parse(enabledPacks);
    } catch (e) {
      enabledPacks = 'all';
    }
  }

  return {
    ...state,
    isZen: parseBoolean(state.isZen),
    isBracketMatchingEnabled: parseBoolean(state.isBracketMatchingEnabled),
    isBracketClosingEnabled: parseBoolean(state.isBracketClosingEnabled),
    isLineNumbersDisplayed: parseBoolean(state.isLineNumbersDisplayed),
    isActiveLineHighlighted: parseBoolean(state.isActiveLineHighlighted),
    isAutoCompletionEnabled: parseBoolean(state.isAutoCompletionEnabled),
    isPatternHighlightingEnabled: parseBoolean(state.isPatternHighlightingEnabled),
    isButtonRowHidden: parseBoolean(state.isButtonRowHidden),
    isCSSAnimationDisabled: parseBoolean(state.isCSSAnimationDisabled),
    isTooltipEnabled: parseBoolean(state.isTooltipEnabled),
    isLineWrappingEnabled: parseBoolean(state.isLineWrappingEnabled),
    isFlashEnabled: parseBoolean(state.isFlashEnabled),
    isSyncEnabled: isUdels() ? true : parseBoolean(state.isSyncEnabled),
    isTabIndentationEnabled: parseBoolean(state.isTabIndentationEnabled),
    isMultiCursorEnabled: parseBoolean(state.isMultiCursorEnabled),
    fontSize: Number(state.fontSize),
    panelPosition: state.activeFooter !== '' && !isUdels() ? state.panelPosition : 'bottom', // <-- keep this 'bottom' where it is!
    isPanelPinned: parseBoolean(state.isPanelPinned),
    isPanelOpen: parseBoolean(state.isPanelOpen),
    userPatterns: userPatterns,
    multiChannelOrbits: parseBoolean(state.multiChannelOrbits),
    includePrebakeScriptInShare: parseBoolean(state.includePrebakeScriptInShare),
    enabledPacks: enabledPacks,
    patternAutoStart: isUdels()
      ? false
      : state.patternAutoStart === undefined
        ? true
        : parseBoolean(state.patternAutoStart),
    masterVolume: Number(state.masterVolume) ?? 1,
    panelSizeBottom: Number(state.panelSizeBottom) || 35,
    panelSizeRight: Number(state.panelSizeRight) || 30,
  };
}

export const setActiveFooter = (tab) => settingsMap.setKey('activeFooter', tab);
export const setPanelPinned = (bool) => settingsMap.setKey('isPanelPinned', bool);
export const setIsPanelOpened = (bool) => settingsMap.setKey('isPanelOpen', bool);

export const storePrebakeScript = (script) => settingsMap.setKey('prebakeScript', script);

export const setIsZen = (active) => settingsMap.setKey('isZen', !!active);

const patternSetting = (key) =>
  register(key, (value, pat) =>
    pat.onTrigger(() => {
      value = Array.isArray(value) ? value.join(' ') : value;
      if (value !== settingsMap.get()[key]) {
        settingsMap.setKey(key, value);
      }
      return pat;
    }, false),
  );

export const theme = patternSetting('theme');
export const fontFamily = patternSetting('fontFamily');
export const fontSize = patternSetting('fontSize');

export const settingPatterns = { theme, fontFamily, fontSize };

// AI Agent settings - separate keys for each provider
export const setOpenaiApiKey = (key) => settingsMap.setKey('openaiApiKey', key);
export const setAnthropicApiKey = (key) => settingsMap.setKey('anthropicApiKey', key);
export const setGeminiApiKey = (key) => settingsMap.setKey('geminiApiKey', key);
export const setAiProvider = (provider) => settingsMap.setKey('aiProvider', provider);
export const setAiModel = (model) => settingsMap.setKey('aiModel', model);

// Helper to get API key for current provider (gpt4free doesn't need a key)
export const getApiKeyForProvider = (provider, settings) => {
  switch (provider) {
    case 'openai': return settings.openaiApiKey;
    case 'anthropic': return settings.anthropicApiKey;
    case 'gemini': return settings.geminiApiKey;
    case 'gpt4free': return null; // GPT4Free is free, no key needed
    default: return '';
  }
};

// Volume settings
export const setMasterVolumeSettings = (volume) => settingsMap.setKey('masterVolume', volume);
