import { Pattern, noteToMidi, valueToMidi } from '@strudel/core';
import { aliasBank, registerSynthSounds, registerZZFXSounds, samples } from '@strudel/webaudio';
import { registerSamplesFromDB } from './idbutils.mjs';
import './piano.mjs';
import './files.mjs';
import { settingsMap } from '@src/settings.mjs';
import { evaluate } from '@strudel/transpiler';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
const baseCDN = 'https://strudel.b-cdn.net';

export async function prebake() {
  // https://archive.org/details/SalamanderGrandPianoV3
  // License: CC-by http://creativecommons.org/licenses/by/3.0/ Author: Alexander Holm
  await Promise.all([
    registerSynthSounds(),
    registerZZFXSounds(),
    registerSamplesFromDB(),
    //registerSoundfonts(),
    // need dynamic import here, because importing @strudel/soundfonts fails on server:
    // => getting "window is not defined", as soon as "@strudel/soundfonts" is imported statically
    // seems to be a problem with soundfont2
    import('@strudel/soundfonts').then(({ registerSoundfonts }) => registerSoundfonts()),
    samples(`${baseCDN}/piano.json`, `${baseCDN}/piano/`, { prebake: true, pack: 'piano' }),
    // https://github.com/sgossner/VCSL/
    // https://api.github.com/repositories/126427031/contents/
    // LICENSE: CC0 general-purpose
    samples(`${baseCDN}/vcsl.json`, `${baseCDN}/VCSL/`, { prebake: true, pack: 'vcsl' }),
    samples(`${baseCDN}/tidal-drum-machines.json`, `${baseCDN}/tidal-drum-machines/machines/`, {
      prebake: true,
      tag: 'drum-machines',
      pack: 'tidal-drum-machines',
    }),
    samples(`${baseCDN}/uzu-drumkit.json`, `${baseCDN}/uzu-drumkit/`, {
      prebake: true,
      tag: 'drum-machines',
      pack: 'uzu-drumkit',
    }),
    samples(`${baseCDN}/uzu-wavetables.json`, `${baseCDN}/uzu-wavetables/`, {
      prebake: true,
      pack: 'uzu-wavetables',
    }),
    samples(`${baseCDN}/mridangam.json`, `${baseCDN}/mrid/`, { prebake: true, tag: 'drum-machines', pack: 'mridangam' }),
    // Все Dirt-Samples через JSON (200+ банков, 2000+ семплов)
    samples(`${baseCDN}/Dirt-Samples/strudel.json`, `${baseCDN}/Dirt-Samples/`, {
      prebake: true,
      pack: 'Dirt-Samples',
    }),
    // Локальные паки семплов
    samples(`${baseNoTrailing}/samples/dough-amen/strudel.json`, `${baseNoTrailing}/samples/dough-amen/`, {
      prebake: true,
      pack: 'dough-amen',
    }),
    samples(`${baseNoTrailing}/samples/dough-waveforms/strudel.json`, `${baseNoTrailing}/samples/dough-waveforms/`, {
      prebake: true,
      pack: 'dough-waveforms',
    }),
    samples(`${baseNoTrailing}/samples/samples-flbass/strudel.json`, `${baseNoTrailing}/samples/samples-flbass/`, {
      prebake: true,
      pack: 'samples-flbass',
    }),
    samples(`${baseNoTrailing}/samples/sounds-repetition/strudel.json`, `${baseNoTrailing}/samples/sounds-repetition/`, {
      prebake: true,
      pack: 'sounds-repetition',
    }),
    samples(`${baseNoTrailing}/samples/clean-breaks/strudel.json`, `${baseNoTrailing}/samples/clean-breaks/`, {
      prebake: true,
      pack: 'clean-breaks',
    }),
    samples(`${baseNoTrailing}/samples/felixroos/strudel.json`, `${baseNoTrailing}/samples/felixroos/`, {
      prebake: true,
      pack: 'felixroos',
    }),
  ]);

  aliasBank(`${baseCDN}/tidal-drum-machines-alias.json`);
}

const maxPan = noteToMidi('C8');
const panwidth = (pan, width) => pan * width + (1 - width) / 2;

Pattern.prototype.piano = function () {
  return this.fmap((v) => ({ ...v, clip: v.clip ?? 1 })) // set clip if not already set..
    .s('piano')
    .release(0.1)
    .fmap((value) => {
      const midi = valueToMidi(value);
      // pan by pitch
      const pan = panwidth(Math.min(Math.round(midi) / maxPan, 1), 0.5);
      return { ...value, pan: (value.pan || 1) * pan };
    });
};
