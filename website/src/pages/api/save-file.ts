import type { APIRoute } from 'astro';
import { writeFile, mkdir, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join } from 'node:path';
import { recordingsDir } from '../../lib/appDir';
import { hostEnv } from '../../lib/hostProcess.mjs';

export const prerender = false;

// Десктоп: blob-загрузки через <a download> в Tauri/WebView2 инертны (баг wry).
// В десктопе клиент перехватывает «скачивание» и шлёт файл сюда — сохраняем НА ДИСК в
// папку приложения (`<рядом с exe>/recordings`, задаётся env BULKA_APP_DIR из Rust-оболочки),
// затем ОТКРЫВАЕМ эту папку с выделением файла, чтобы пользователь сразу увидел результат.
export const POST: APIRoute = async ({ request }) => {
  try {
    const { filename, dataBase64, subfolder } = await request.json();
    if (!dataBase64) return json({ ok: false, error: 'нет данных' }, 400);

    const safe = safeName(String(filename || `bulka_${Date.now()}.bin`), 150);
    if (!safe) return json({ ok: false, error: 'недопустимое имя файла' }, 400);
    const baseDir = recordingsDir();
    // Записи группируем в папку с названием трека: recordings/<трек>/файл.wav (по просьбе — так
    // несколько партий одного трека лежат вместе). subfolder санитайзим, пустой — прямо в recordings.
    const safeSub = safeName(String(subfolder || ''), 100);
    if (String(subfolder || '').trim() && !safeSub) return json({ ok: false, error: 'недопустимое имя папки' }, 400);
    const dir = safeSub ? join(baseDir, safeSub) : baseDir;
    await mkdir(dir, { recursive: true });
    const path = await freePath(dir, safe);
    await writeFile(path, Buffer.from(dataBase64, 'base64'));

    revealInFolder(path, dir);
    return json({ ok: true, path });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, 500);
  }
};

// Открыть проводник/файловый менеджер на сохранённом файле (Windows/mac/Linux). Файл уже сохранён, поэтому
// неудача только пишется в лог; ошибку запуска (нет xdg-open) spawn отдаёт событием, без обработчика она роняет сервер.
function revealInFolder(filePath: string, dir: string) {
  const [cmd, args] =
    process.platform === 'win32'
      ? ['explorer.exe', ['/select,', filePath]]
      : process.platform === 'darwin'
        ? ['open', ['-R', filePath]]
        : ['xdg-open', [dir]];
  const child = spawn(cmd, args, { detached: true, stdio: 'ignore', env: hostEnv(cmd) });
  child.on('error', (e) => console.error(`[save-file] ${cmd} не открыл папку ${dir}:`, e.message));
  child.unref();
}

// Несколько записей одного трека не затирают друг друга: «трек.wav», «трек (2).wav», …
async function freePath(dir: string, name: string): Promise<string> {
  const ext = extname(name);
  const stem = name.slice(0, name.length - ext.length);
  for (let n = 1; ; n++) {
    const candidate = join(dir, n === 1 ? name : `${stem} (${n})${ext}`);
    try {
      await access(candidate);
    } catch (e: any) {
      if (e.code === 'ENOENT') return candidate;
      throw e;
    }
  }
}

// One path segment inside recordings: no separators, and no "." or ".." that would leave the folder.
function safeName(name: string, max: number): string {
  const out = name
    .replace(/[<>:"/\\|?*]/g, '_')
    .slice(0, max)
    .trim();
  return /^\.*$/.test(out) ? '' : out;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
