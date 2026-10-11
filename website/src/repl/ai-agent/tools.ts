/**
 * Tool definitions for the Bulka Music AI Agent
 * These tools allow the AI to interact with the editor and music playback
 */

// Определения тулов, отправляемых в LLM, — единый источник в TOOLS_OPENAI (website/src/pages/api/chat.ts).
// Здесь оставлены только справочные данные (категории звуков, драм-машины).

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

