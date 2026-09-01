// Bulka-специфичная запись прямо из кода: метод паттерна `.record(name?)`.
// Идея пользователя: «поставил маркер вокруг партии — дошло до неё, записалось как звучит».
// Пишем МАСТЕР-выход (то, что слышно) ПОКА играет помеченный паттерн:
//  - как только паттерн начинает триггерить хапы → старт записи;
//  - когда триггеры прекратились (секция доиграла) → стоп + сохранение WAV.
// В arrange() секции идут по очереди, поэтому `.record()` на секции пишет ИМЕННО её звучание.
// Это НЕ изоляция инструмента — записывается мастер в момент, когда партия активна (как она звучит).
//
// Регистрируется в evalScope (website/src/repl/util.mjs) — Bulka-фича, не трогает пакеты движка.

import { register } from '@strudel/core';
import { startRecording, stopRecording } from '@strudel/webaudio';

let _recording = false;
let _stopTimer = null;
let _fallbackName;

/**
 * `.record(name?)` — записать мастер, пока играет этот паттерн.
 * name — имя файла (без расширения). Если не задано — берётся из `// @title`.
 * Примеры:
 *   arrange([8, verse.record("куплет")], [8, chorus.record("припев")])  // каждая секция в свой файл
 *   stack(bd, hh, bass).record()   // весь микс, пока играет
 */
export const record = register('record', (name, pat) => {
  return pat.onTrigger((hap, deadline, duration, cps) => {
    if (!_recording) {
      _recording = true;
      try { startRecording(); } catch (e) { /* нет аудио-контекста — игнор */ }
    }
    // Каждый хап продлевает «дедлайн остановки»: длина хапа + запас полцикла.
    // Когда хапы прекращаются (партия доиграла) — таймер срабатывает и останавливает запись.
    clearTimeout(_stopTimer);
    const marginSec = 0.5 / (cps || 0.5);
    const ms = Math.max(200, (duration + marginSec) * 1000);
    const fname = typeof name === 'string' && name.length ? name : _fallbackName;
    _stopTimer = setTimeout(() => {
      _recording = false;
      try { stopRecording(fname); } catch (e) { /* игнор */ }
    }, ms);
  }, false);
});

// Имя по умолчанию (из // @title) прокидывает REPL перед вычислением кода.
export function setRecordFallbackName(name) {
  _fallbackName = name && String(name).length ? String(name) : undefined;
}
