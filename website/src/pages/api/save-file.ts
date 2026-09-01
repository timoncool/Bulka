import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

export const prerender = false;

// Десктоп: blob-загрузки через <a download> в Tauri/WebView2 инертны (баг wry).
// В десктопе клиент перехватывает «скачивание» и шлёт файл сюда — сохраняем НА ДИСК в
// папку приложения (`<рядом с exe>/recordings`, задаётся env BULKA_APP_DIR из Rust-оболочки),
// затем ОТКРЫВАЕМ эту папку с выделением файла, чтобы пользователь сразу увидел результат.
export const POST: APIRoute = async ({ request }) => {
  try {
    const { filename, dataBase64 } = await request.json();
    if (!dataBase64) return json({ ok: false, error: 'нет данных' }, 400);

    const safe = String(filename || `bulka_${Date.now()}.bin`).replace(/[<>:"/\\|?*]/g, '_').slice(0, 150);
    // BULKA_APP_DIR = каталог рядом с exe (портатив/установка). Фолбэк — cwd сервера.
    const baseDir = process.env.BULKA_APP_DIR || process.cwd();
    const dir = join(baseDir, 'recordings');
    await mkdir(dir, { recursive: true });
    const path = join(dir, safe);
    await writeFile(path, Buffer.from(dataBase64, 'base64'));

    revealInFolder(path, dir);
    return json({ ok: true, path });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, 500);
  }
};

// Открыть проводник/файловый менеджер на сохранённом файле (Windows/mac/Linux). Тихо игнорируем ошибки.
function revealInFolder(filePath: string, dir: string) {
  try {
    if (process.platform === 'win32') {
      spawn('explorer.exe', ['/select,', filePath], { detached: true, stdio: 'ignore' }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', ['-R', filePath], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [dir], { detached: true, stdio: 'ignore' }).unref();
    }
  } catch {
    /* не критично */
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
