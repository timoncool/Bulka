import { join } from 'node:path';

// Каталог данных десктопа: туда сервер кладёт записи (recordings/). Задаёт Rust-оболочка (BULKA_APP_DIR).
export function appDataDir(): string {
  const dir = process.env.BULKA_APP_DIR;
  if (!dir) throw new Error('BULKA_APP_DIR не задан: сохранение файлов работает только в десктопе Bulka');
  return dir;
}

export function recordingsDir(): string {
  return join(appDataDir(), 'recordings');
}
