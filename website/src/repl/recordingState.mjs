// Единое состояние записи для ВСЕХ путей: кнопка REC, тулзы агента/MCP (execClientTool),
// метод паттерна `.record()`. Индикатор в интерфейсе (Recorder.jsx) читает этот стор, поэтому
// огонёк + таймер загораются одинаково — и когда пользователь жмёт кнопку, и когда запись
// стартовал программно агент/MCP. Обёртки begin/end — единственная точка старта/стопа записи.

import { atom } from 'nanostores';
import { logger } from '@strudel/core';
import { startRecording as _start, stopRecording as _stop } from '@strudel/webaudio';
import { recordDone, recordFailed } from '../hub/bulkaHub.mjs';

export const $isRecording = atom(false);
export const $recordingElapsed = atom(0); // мс с начала записи (для таймера в UI)

/** Начать запись (идемпотентно). Обновляет стор → UI показывает индикатор. */
export function beginRecording() {
  if ($isRecording.get()) return false;
  $isRecording.set(true);
  $recordingElapsed.set(0);
  try {
    _start((elapsed) => $recordingElapsed.set(elapsed));
  } catch (e) {
    $isRecording.set(false);
    logger(`[record] ${e.message}`, 'error');
    recordFailed('record', e.message);
    throw e;
  }
  return true;
}

/** Остановить запись и сохранить WAV (идемпотентно). Обновляет стор → индикатор гаснет. */
export function endRecording(filename) {
  if (!$isRecording.get()) return false;
  try {
    _stop(filename);
    recordDone('record');
  } catch (e) {
    logger(`[record] ${e.message}`, 'error');
    recordFailed('record', e.message);
    throw e;
  } finally {
    $isRecording.set(false);
    $recordingElapsed.set(0);
  }
  return true;
}
