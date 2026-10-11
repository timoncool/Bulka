// Десктоп-мост. В Tauri/WebView2 blob/data-«скачивания» через <a download> не сохраняются
// (баг wry — запись WAV, экспорт и т.п. молча теряются). Перехватываем такие клики и сохраняем
// файл через наш Node-сервер (/api/save-file): он кладёт файл в папку приложения и открывает её,
// чтобы пользователь сразу увидел результат. Активно ТОЛЬКО когда сайт раздаётся локально
// (десктоп: 127.0.0.1 / localhost); на bulka.app — обычное скачивание браузера, ничего не трогаем.

let installed = false;

export function installDesktopDownloadBridge() {
  if (installed || typeof window === 'undefined' || typeof document === 'undefined') return;
  const host = location.hostname;
  if (host !== '127.0.0.1' && host !== 'localhost') return;
  installed = true;

  const origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    try {
      const href = this.getAttribute('href') || this.href || '';
      const name = this.getAttribute('download');
      if (name && (href.startsWith('blob:') || href.startsWith('data:'))) {
        saveViaServer(href, name);
        return; // нативный клик в Tauri всё равно инертен — не зовём его
      }
    } catch (e) {
      console.error('[desktop bridge] click hook error', e);
    }
    return origClick.call(this);
  };
}

async function saveViaServer(href, filename) {
  try {
    const blob = await (await fetch(href)).blob();
    const dataUrl = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(blob); // корректно кодирует и большие файлы
    });
    const dataBase64 = String(dataUrl).split(',')[1] || '';
    // Название трека (из // @title) — чтобы записи легли в recordings/<трек>/.
    const subfolder = (typeof window !== 'undefined' && window.__bulkaTrackTitle) || '';
    const r = await fetch('/api/save-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, dataBase64, subfolder }),
    });
    const j = await r.json();
    toast(j.ok ? `💾 Сохранено в папку приложения: ${shorten(j.path)}` : `Ошибка сохранения: ${j.error || ''}`);
  } catch (e) {
    console.error('[desktop bridge] save failed', e);
    toast('Не удалось сохранить файл');
  }
}

function shorten(p) {
  if (!p) return '';
  const parts = String(p).split(/[\\/]/);
  return parts.slice(-2).join('\\');
}

function toast(msg) {
  try {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText =
      'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:99999;' +
      'background:#222;color:#fff;padding:10px 16px;border-radius:8px;font:14px sans-serif;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.4);opacity:0;transition:opacity .2s';
    document.body.appendChild(el);
    requestAnimationFrame(() => (el.style.opacity = '1'));
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3500);
  } catch {
    /* ignore */
  }
}
