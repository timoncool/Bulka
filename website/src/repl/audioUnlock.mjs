// superdough включает звук только по первому клику в окне (initAudioOnFirstClick): до него evaluate ждёт.
let unlocked = false;

export function markAudioUnlocked() {
  unlocked = true;
}

export const AUDIO_LOCKED_MESSAGE =
  'Звук ещё не включён: Bulka ждёт первого клика в окне (браузер не даёт звуку стартовать без действия пользователя). Попроси пользователя щёлкнуть в окне Bulka и повтори.';

export function isAudioUnlocked() {
  return unlocked;
}
