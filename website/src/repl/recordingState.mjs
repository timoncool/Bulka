// Единое состояние записи для ВСЕХ путей: кнопка REC, тулзы агента/MCP (execClientTool),
// метод паттерна `.record()`. Индикатор в интерфейсе (Recorder.jsx) читает этот стор, поэтому
// огонёк + таймер загораются одинаково — и когда пользователь жмёт кнопку, и когда запись
// стартовал программно агент/MCP. Обёртки begin/end — единственная точка старта/стопа записи.

import { atom } from 'nanostores';
import { startRecording as _start, stopRecording as _stop } from '@strudel/webaudio';

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
    return false;
  }
  return true;
}

/** Остановить запись и сохранить WAV (идемпотентно). Обновляет стор → индикатор гаснет. */
export function endRecording(filename) {
  if (!$isRecording.get()) return false;
  try {
    _stop(filename);
  } catch (e) {
    /* игнор */
  }
  $isRecording.set(false);
  $recordingElapsed.set(0);
  return true;
}
