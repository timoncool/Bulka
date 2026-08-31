/**
 * Tool definitions for the Bulka Music AI Agent
 * These tools allow the AI to interact with the editor and music playback
 */

import { z } from 'zod';

/**
 * Tool schemas for Vercel AI SDK
 * These define the parameters each tool accepts
 */
export const toolSchemas = {
  // Get current code from the editor
  getCurrentCode: {
    description: 'Получить текущий код из редактора. Используй это чтобы увидеть что сейчас написано.',
    parameters: z.object({}),
  },

  // Set code in the editor (replaces all content)
  setEditorCode: {
    description: 'Установить новый код в редактор (заменяет весь существующий код). Используй для создания нового трека или полного переписывания.',
    parameters: z.object({
      code: z.string().describe('Полный код для установки в редактор'),
    }),
  },

  // Insert code at cursor position
  insertCodeAtCursor: {
    description: 'Вставить код в текущую позицию курсора. Используй для добавления небольших фрагментов.',
    parameters: z.object({
      code: z.string().describe('Код для вставки'),
    }),
  },

  // Append code to the end
  appendCode: {
    description: 'Добавить код в конец редактора. Используй для добавления новых элементов к существующему треку.',
    parameters: z.object({
      code: z.string().describe('Код для добавления в конец'),
    }),
  },

  // Play music (evaluate and start)
  playMusic: {
    description: 'Запустить воспроизведение музыки (выполнить код и начать играть). Используй после изменения кода чтобы услышать результат.',
    parameters: z.object({}),
  },

  // Stop music
  stopMusic: {
    description: 'Остановить воспроизведение музыки.',
    parameters: z.object({}),
  },

  // Toggle play/stop
  togglePlayback: {
    description: 'Переключить воспроизведение (если играет - остановить, если остановлено - запустить).',
    parameters: z.object({}),
  },

  // Search documentation (RAG)
  searchDocs: {
    description: 'Поиск по документации Strudel. Используй чтобы найти информацию о функциях, синтаксисе, звуках, эффектах.',
    parameters: z.object({
      query: z.string().describe('Поисковый запрос на русском или английском'),
    }),
  },

  // Get list of available sounds
  getSoundsList: {
    description: 'Получить список доступных звуков и инструментов. Используй чтобы узнать какие звуки можно использовать.',
    parameters: z.object({
      category: z.enum(['drums', 'synths', 'bass', 'effects', 'all']).optional().describe('Категория звуков (drums, synths, bass, effects, all)'),
    }),
  },

  // Get list of drum machines
  getDrumMachines: {
    description: 'Получить список доступных драм-машин (банков звуков). Например RolandTR808, RolandTR909.',
    parameters: z.object({}),
  },

  // Evaluate code without playing
  evaluateCode: {
    description: 'Выполнить код без запуска воспроизведения. Используй для проверки синтаксиса.',
    parameters: z.object({}),
  },
};

/**
 * Sound categories for getSoundsList tool
 */
export const SOUND_CATEGORIES = {
  drums: {
    kicks: ['bd', '808bd', 'bassdm', 'clubkick', 'hardkick', 'reverbkick', 'popkick'],
    snares: ['sd', '808sd', 'sn', 'realclaps'],
    hihats: ['hh', 'hc', 'ho', '808hc', '808oh', 'linnhats'],
    cymbals: ['cc', 'cr', '808cy'],
    toms: ['ht', 'mt', 'lt', '808ht', '808mt', '808lt'],
    percussion: ['cp', 'clak', 'click', 'perc', 'tabla', 'hand', 'co', 'cb', 'rm'],
  },
  synths: {
    oscillators: ['sine', 'sawtooth', 'square', 'triangle'],
    noise: ['white', 'pink', 'brown', 'crackle'],
    pads: ['arp', 'arpy', 'bend', 'blip', 'bleep', 'casio', 'hoover', 'juno', 'moog', 'pluck'],
  },
  bass: ['bass', 'bass0', 'bass1', 'bass2', 'bass3', 'bassfoo', 'jungbass', 'jvbass'],
  effects: ['cosmicg', 'invaders', 'space', 'glitch', 'glitch2', 'hit', 'feelfx', 'noise', 'noise2'],
};

/**
 * List of popular drum machines
 */
export const DRUM_MACHINES = [
  { name: 'RolandTR808', description: 'Легендарная драм-машина Roland TR-808' },
  { name: 'RolandTR909', description: 'Roland TR-909 - классика техно' },
  { name: 'RolandTR707', description: 'Roland TR-707' },
  { name: 'RolandTR606', description: 'Roland TR-606 Drumatix' },
  { name: 'LinnDrum', description: 'Linn LM-2 Drum Machine' },
  { name: 'LinnLM1', description: 'Linn LM-1' },
  { name: 'OberheimDMX', description: 'Oberheim DMX' },
  { name: 'EmuDrumulator', description: 'E-mu Drumulator' },
  { name: 'KorgDDM110', description: 'Korg DDM-110' },
  { name: 'KorgKR55', description: 'Korg KR-55' },
  { name: 'KorgMinipops', description: 'Korg Minipops' },
  { name: 'YamahaRX21', description: 'Yamaha RX21' },
  { name: 'BossDR110', description: 'Boss DR-110' },
  { name: 'BossDR55', description: 'Boss DR-55' },
  { name: 'AlesisHR16', description: 'Alesis HR-16' },
  { name: 'CasioRZ1', description: 'Casio RZ-1' },
];

export type ToolName = keyof typeof toolSchemas;
