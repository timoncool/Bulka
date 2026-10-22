//! Tauri-оболочка Bulka (десктоп: Windows, Linux, macOS). Сама ничего тяжёлого не делает: поднимает автономный
//! Astro Node-сервер (`website/dist/server/entry.mjs`) на 127.0.0.1:<порт> и открывает окно.
//! Сервер сам раздаёт SPA и API (`/api/chat`, `/api/models`, `/mcp`) на одном origin.
//!
//! Node поднимаем через ШТАТНЫЙ shell-плагин Tauri (`app.shell().command(...)`), а НЕ raw
//! std::process::Command — тогда Tauri сам трекает дочерний процесс и убивает его при выходе
//! приложения (kill children on App drop), без осиротевших node. Спавн — в `setup()`
//! (только там доступен AppHandle), окно создаётся после готовности сервера.
//!
//! Ресурсы (`app/`: dist, node, node_modules) лежат в каталоге ресурсов бандла: на Windows это папка exe,
//! в AppImage/.deb — `/usr/lib/<app>`, в macOS — `Contents/Resources`. Данные (записи, лог сервера) — рядом с exe
//! на Windows (портатив: ключи и localStorage WebView2 там же), на Linux и macOS — в каталоге данных приложения.

#[cfg(windows)]
mod webview2;

use std::io::{Read, Write};
use std::net::{Ipv4Addr, SocketAddrV4, TcpListener, TcpStream};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use tauri::{Manager, RunEvent, WebviewUrl, WebviewWindowBuilder, WindowEvent};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

/// Хендл дочернего Node-процесса (управляется shell-плагином). Нужен, чтобы принудительно
/// убить его ПЕРЕД установкой апдейта (при апдейте приложение не закрывается до рестарта,
/// поэтому авто-очистка Tauri на выходе тут не срабатывает вовремя).
struct ServerProc(Mutex<Option<CommandChild>>);

/// Порт сервера, чтобы на выходе дождаться отправки статистики из окна.
struct ServerPort(u16);

/// Страница релизов (обновление вручную: портатив Windows, .deb).
const RELEASES_URL: &str = "https://github.com/timoncool/Bulka/releases/latest";
const WEBVIEW2_URL: &str = "https://developer.microsoft.com/microsoft-edge/webview2/";

/// Сколько окно отправляет статистику при закрытии, как у студий (`POST /v1/hub/flush`, до 8 с).
const FLUSH_WAIT_MS: u64 = 8000;

/// Node выходит, когда закрылся его stdin: оболочку убили сигналом (выход из сеанса, kill), и Tauri не успел
/// погасить дочерний процесс.
const EXIT_WITH_SHELL: &str = "data:text/javascript,process.stdin.on('end',()=>process.exit(0)).resume()";

/// Окно отправляет накопленную статистику и отвечает серверу; без хаба отвечает сразу. JSON — потому что POST
/// без него Astro (checkOrigin) считает отправкой формы с чужого сайта и отвечает 403.
const FLUSH_SCRIPT: &str = "(window.__bulkaHub ? window.__bulkaHub.flush(8000) : Promise.resolve())\
    .finally(() => fetch('/api/desktop/flush', { method: 'POST', headers: { 'content-type': 'application/json' } }));";

/// Каталог exe (портативная / установленная раскладка Windows). Дев: каталог target-бинаря.
fn exe_dir() -> PathBuf {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."))
}

/// Каталог с ресурсами приложения (`dist/` + `node/`): `<ресурсы бандла>/app`. Дев (запуск из исходников): `website/`.
fn resolve_app_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if let Ok(dir) = std::env::var("BULKA_DESKTOP_APP_DIR") {
        return Ok(PathBuf::from(dir));
    }
    let entry = |dir: &PathBuf| dir.join("dist").join("server").join("entry.mjs").is_file();
    let bundled = app.path().resource_dir().map_err(|e| format!("каталог ресурсов: {e}"))?.join("app");
    if entry(&bundled) {
        return Ok(bundled);
    }
    // Дев: exe в …/desktop/src-tauri/target/<profile>/. Поднимаемся до репо и берём website/.
    let mut d = exe_dir();
    for _ in 0..8 {
        let website = d.join("website");
        if entry(&website) {
            return Ok(website);
        }
        match d.parent() {
            Some(p) => d = p.to_path_buf(),
            None => break,
        }
    }
    Err(format!("нет собранного сервера: {}", bundled.join("dist/server/entry.mjs").display()))
}

/// Куда приложение пишет свои данные: рядом с exe на Windows (портатив), каталог данных приложения на Linux/macOS
/// (AppImage и .app доступны только для чтения).
fn data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = if cfg!(windows) {
        exe_dir()
    } else {
        app.path().app_data_dir().map_err(|e| format!("каталог данных: {e}"))?
    };
    std::fs::create_dir_all(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
    Ok(dir)
}

/// Бандлёный node (`<app>/node/node.exe` или `<app>/node/node`). Системный `node` из PATH берётся только в
/// отладочной сборке (запуск из исходников); в релизе его отсутствие — ошибка с путём.
fn node_exe(app_dir: &PathBuf) -> Result<String, String> {
    let name = if cfg!(windows) { "node.exe" } else { "node" };
    let bundled = app_dir.join("node").join(name);
    if bundled.is_file() {
        return Ok(bundled.to_string_lossy().into_owned());
    }
    if cfg!(debug_assertions) {
        return Ok("node".to_string());
    }
    Err(format!("нет встроенного node: {}", bundled.display()))
}

/// Можно ли обновиться на месте: установленный NSIS на Windows, AppImage на Linux, .app на macOS.
/// Портатив Windows и .deb обновляются вручную со страницы релизов.
fn updates_in_place() -> bool {
    if cfg!(windows) {
        let d = exe_dir();
        d.join("uninstall.exe").is_file() || d.join("Uninstall Bulka.exe").is_file()
    } else if cfg!(target_os = "linux") {
        std::env::var_os("APPIMAGE").is_some()
    } else {
        true
    }
}

/// Занять свободный TCP-порт на 127.0.0.1 (ядро выдаёт порт 0 -> читаем реальный, отпускаем).
fn pick_free_port() -> std::io::Result<u16> {
    let listener = TcpListener::bind(SocketAddrV4::new(Ipv4Addr::LOCALHOST, 0))?;
    Ok(listener.local_addr()?.port())
}

/// Порт десктопа: фиксированный (для стабильного URL MCP в конфиге Claude Desktop), env BULKA_PORT
/// или дефолт 4188. Если занят — берём свободный.
fn desktop_port() -> u16 {
    let fixed: u16 = std::env::var("BULKA_PORT").ok().and_then(|s| s.parse().ok()).unwrap_or(4188);
    if TcpListener::bind(SocketAddrV4::new(Ipv4Addr::LOCALHOST, fixed)).is_ok() {
        fixed
    } else {
        pick_free_port().unwrap_or(fixed)
    }
}

/// Дождаться, пока сервер начнёт принимать соединения (или таймаут).
fn wait_until_ready(port: u16, timeout: Duration) -> bool {
    let addr = SocketAddrV4::new(Ipv4Addr::LOCALHOST, port);
    let start = Instant::now();
    while start.elapsed() < timeout {
        if TcpStream::connect_timeout(&addr.into(), Duration::from_millis(200)).is_ok() {
            return true;
        }
        std::thread::sleep(Duration::from_millis(120));
    }
    false
}

/// Поднять Node-сервер через shell-плагин Tauri. Tauri сам убьёт его при выходе приложения;
/// вывод сервера сливаем в `<данные>/bulka-server.log`.
fn spawn_server(app: &tauri::AppHandle, app_dir: &PathBuf, data: &PathBuf, port: u16) -> Result<CommandChild, String> {
    let entry = app_dir.join("dist").join("server").join("entry.mjs").to_string_lossy().into_owned();
    let log_path = data.join("bulka-server.log");
    let mut log = std::fs::File::create(&log_path).map_err(|e| format!("{}: {e}", log_path.display()))?;

    let cmd = app
        .shell()
        .command(node_exe(app_dir)?)
        .args(["--import", EXIT_WITH_SHELL, &entry])
        .env("HOST", "127.0.0.1")
        .env("PORT", port.to_string())
        .env("BULKA_DESKTOP", "1")
        // Куда сохранять записи/экспорт (сервер кладёт файлы в <данные>/recordings и открывает папку).
        .env("BULKA_APP_DIR", data.to_string_lossy().into_owned())
        // номер компьютера, общий со студиями: статистика считает одного человека один раз
        .env("BULKA_MACHINE", studio_hub_client::machine::system_id().unwrap_or_default())
        .current_dir(app_dir.clone());

    let (mut rx, child) = cmd.spawn().map_err(|e| format!("node не запустился: {e}"))?;

    // Сливаем stdout/stderr сервера в лог-файл (и не даём буферу канала переполниться).
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            let line = match event {
                CommandEvent::Stdout(b) | CommandEvent::Stderr(b) => b,
                CommandEvent::Terminated(status) => format!("[server exited: {:?}]\n", status.code).into_bytes(),
                _ => continue,
            };
            if let Err(e) = log.write_all(&line) {
                eprintln!("bulka-server.log: {e}");
            }
        }
    });

    Ok(child)
}

/// Проверка обновления на GitHub-релизе и (по согласию юзера) установка на месте или страница релизов.
fn spawn_update_check(app: tauri::AppHandle) {
    use tauri_plugin_updater::UpdaterExt;
    let in_place = updates_in_place();
    tauri::async_runtime::spawn(async move {
        let update = match app.updater().map_err(|e| e.to_string()) {
            Ok(updater) => updater.check().await.map_err(|e| e.to_string()),
            Err(e) => Err(e),
        };
        let update = match update {
            Ok(Some(u)) => u,
            Ok(None) => return,
            // Нет сети — не повод мешать работе диалогом; причина видна в логе запуска.
            Err(e) => {
                eprintln!("Проверка обновлений не удалась: {e}");
                return;
            }
        };
        let ver = update.version.clone();

        if !in_place {
            let open = app
                .dialog()
                .message(format!("Доступна новая версия {ver}. Открыть страницу загрузки?"))
                .title("Обновление Bulka")
                .kind(MessageDialogKind::Info)
                .buttons(MessageDialogButtons::OkCancelCustom("Открыть".into(), "Позже".into()))
                .blocking_show();
            if open {
                use tauri_plugin_opener::OpenerExt;
                if let Err(e) = app.opener().open_url(RELEASES_URL, None::<&str>) {
                    eprintln!("Страница релизов не открылась: {e}");
                }
            }
            return;
        }

        let yes = app
            .dialog()
            .message(format!("Доступна новая версия {ver}. Обновить сейчас? Приложение перезапустится."))
            .title("Обновление Bulka")
            .kind(MessageDialogKind::Info)
            .buttons(MessageDialogButtons::OkCancelCustom("Обновить".into(), "Позже".into()))
            .blocking_show();
        if !yes {
            return;
        }
        // Убиваем дочерний node ДО установщика: при апдейте приложение не закрывается
        // (перезапустится само), поэтому авто-очистка Tauri на выходе не срабатывает — а живой
        // node держит `node/` и `dist`, и установщик спотыкается на «файл занят».
        kill_server(&app);
        std::thread::sleep(Duration::from_millis(500)); // дать ОС отпустить файловые хендлы

        match update.download_and_install(|_, _| {}, || {}).await {
            Ok(_) => app.restart(),
            Err(e) => {
                app.dialog()
                    .message(format!("Не удалось обновить: {e}"))
                    .title("Обновление Bulka")
                    .kind(MessageDialogKind::Error)
                    .blocking_show();
            }
        }
    });
}

fn kill_server(app: &tauri::AppHandle) {
    if let Some(state) = app.try_state::<ServerProc>() {
        if let Ok(mut guard) = state.0.lock() {
            if let Some(c) = guard.take() {
                if let Err(e) = c.kill() {
                    eprintln!("node не остановился: {e}");
                }
            }
        }
    }
}

/// Ждём, пока окно отправит статистику: сервер отвечает на GET, когда окно сообщило об этом (или по таймауту).
fn wait_for_flush(port: u16) {
    let addr = SocketAddrV4::new(Ipv4Addr::LOCALHOST, port);
    let result = TcpStream::connect_timeout(&addr.into(), Duration::from_millis(500)).and_then(|mut stream| {
        stream.set_read_timeout(Some(Duration::from_millis(FLUSH_WAIT_MS + 2000)))?;
        write!(stream, "GET /api/desktop/flush?wait={FLUSH_WAIT_MS} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n")?;
        let mut answer = Vec::new();
        stream.read_to_end(&mut answer).map(|_| ())
    });
    if let Err(e) = result {
        eprintln!("Статистика при закрытии не дождалась ответа: {e}");
    }
}

/// Нет WebView2 Runtime (портатив на чистой Windows 10) — ставим его, как установщик NSIS. Ход — в `webview2-install.log`.
#[cfg(windows)]
fn ensure_webview2(app: &tauri::AppHandle) -> Result<(), String> {
    if webview2::installed_version().is_some() {
        return Ok(());
    }
    let log_path = data_dir(app)?.join("webview2-install.log");
    let mut log = std::fs::File::create(&log_path).map_err(|e| format!("{}: {e}", log_path.display()))?;
    webview2::install(&mut log).map(|_| ()).map_err(|e| {
        let _ = writeln!(log, "[ERROR] {e}");
        e
    })
}

fn fatal(app: &tauri::AppHandle, message: String) {
    app.dialog().message(message).title("Bulka не запустилась").kind(MessageDialogKind::Error).blocking_show();
    app.exit(1);
}

pub fn run() {
    // Портатив Windows: состояние WebView2 (localStorage -> ключи/настройки) держим рядом с exe.
    if cfg!(windows) && std::env::var_os("WEBVIEW2_USER_DATA_FOLDER").is_none() {
        std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", exe_dir().join("webview-data"));
    }

    let flushed = AtomicBool::new(false);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(ServerProc(Mutex::new(None)))
        .setup(move |app| {
            let handle = app.handle().clone();
            #[cfg(windows)]
            if let Err(e) = ensure_webview2(&handle) {
                fatal(
                    &handle,
                    format!(
                        "Для Bulka нужен Microsoft Edge WebView2 Runtime. Поставить его сама Bulka не смогла: {e}. \
                         Установите его со страницы {WEBVIEW2_URL} и запустите Bulka снова."
                    ),
                );
                return Ok(());
            }
            let start = resolve_app_dir(&handle).and_then(|app_dir| data_dir(&handle).map(|data| (app_dir, data)));
            let (app_dir, data) = match start {
                Ok(v) => v,
                Err(e) => {
                    fatal(&handle, e);
                    return Ok(());
                }
            };
            let port = desktop_port();
            app.manage(ServerPort(port));

            match spawn_server(&handle, &app_dir, &data, port) {
                Ok(child) => {
                    if let Some(state) = app.try_state::<ServerProc>() {
                        if let Ok(mut g) = state.0.lock() {
                            *g = Some(child);
                        }
                    }
                }
                Err(e) => {
                    fatal(&handle, e);
                    return Ok(());
                }
            }
            if !wait_until_ready(port, Duration::from_secs(40)) {
                fatal(
                    &handle,
                    format!(
                        "Сервер Bulka не поднялся на 127.0.0.1:{port} за 40 с. Подробности: {}",
                        data.join("bulka-server.log").display()
                    ),
                );
                return Ok(());
            }

            let url = format!("http://127.0.0.1:{port}/");
            let icon = app.default_window_icon().cloned();
            let win = WebviewWindowBuilder::new(app, "main", WebviewUrl::External(url.parse().expect("валидный URL")))
                .title("Bulka")
                .inner_size(1500.0, 1000.0)
                .min_inner_size(1100.0, 700.0)
                .resizable(true)
                .disable_drag_drop_handler()
                // WebView2 оставляет запрос микрофона без ответа и без окна согласия: getUserMedia своей страницы
                // (названия звуковых выходов, запись) висел, и список устройств вывода оставался пустым
                .on_permission_request(move |webview, kind| match kind {
                    tauri::webview::PermissionKind::Microphone
                        if webview.url().is_ok_and(|url| url.host_str() == Some("127.0.0.1") && url.port() == Some(port)) =>
                    {
                        tauri::webview::PermissionResponse::Allow
                    }
                    _ => tauri::webview::PermissionResponse::Default,
                })
                .build()?;
            if let Some(ic) = icon {
                win.set_icon(ic)?;
            }

            spawn_update_check(app.handle().clone());
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("ошибка запуска Tauri")
        .run(move |app, event| match event {
            // Окно закрывают: пока оно живо, оно отправляет статистику (до 8 с), потом выходим сами.
            RunEvent::WindowEvent { label, event: WindowEvent::CloseRequested { api, .. }, .. }
                if label == "main" && !flushed.swap(true, Ordering::SeqCst) =>
            {
                let window = app.get_webview_window("main");
                let port = app.try_state::<ServerPort>().map(|p| p.0);
                if let (Some(window), Some(port)) = (window, port) {
                    api.prevent_close();
                    if let Err(e) = window.eval(FLUSH_SCRIPT) {
                        eprintln!("Окно не приняло отправку статистики: {e}");
                    }
                    let app = app.clone();
                    std::thread::spawn(move || {
                        wait_for_flush(port);
                        app.exit(0);
                    });
                }
            }
            // Штатно Tauri сам убивает дочерний процесс на выходе; дублируем на всякий случай.
            RunEvent::Exit => kill_server(app),
            _ => {}
        });
}
