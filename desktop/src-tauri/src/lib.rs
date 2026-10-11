//! Tauri-оболочка Bulka (десктоп). Сама ничего тяжёлого не делает: поднимает автономный
//! Astro Node-сервер (`website/dist/server/entry.mjs`) на 127.0.0.1:<порт> и открывает окно.
//! Сервер сам раздаёт SPA и API (`/api/chat`, `/api/models`, `/mcp`) на одном origin.
//!
//! Node поднимаем через ШТАТНЫЙ shell-плагин Tauri (`app.shell().command(...)`), а НЕ raw
//! std::process::Command — тогда Tauri сам трекает дочерний процесс и убивает его при выходе
//! приложения (kill children on App drop), без осиротевших node.exe. Спавн — в `setup()`
//! (только там доступен AppHandle), окно создаётся после готовности сервера.
//!
//! Портативность/апдейт — как в эталоне dub-studio: app_root_dir = каталог рядом с exe;
//! WEBVIEW2_USER_DATA_FOLDER (localStorage → ключи/настройки) держим рядом с exe.

use std::io::Write;
use std::net::{Ipv4Addr, SocketAddrV4, TcpListener, TcpStream};
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use tauri::{Manager, RunEvent, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

/// Хендл дочернего Node-процесса (управляется shell-плагином). Нужен, чтобы принудительно
/// убить его ПЕРЕД установкой апдейта (при апдейте приложение не закрывается до рестарта,
/// поэтому авто-очистка Tauri на выходе тут не срабатывает вовремя).
struct ServerProc(Mutex<Option<CommandChild>>);

/// Страница релизов (фолбэк-обновление для портативной сборки).
const RELEASES_URL: &str = "https://github.com/timoncool/Bulka/releases/latest";

/// Каталог рядом с exe (портативная / установленная раскладка). Дев: каталог target-бинаря.
fn app_root_dir() -> PathBuf {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."))
}

/// Каталог с ресурсами приложения (`dist/` + `node/node.exe`).
/// Портатив/установка: `<exe>/app`. Дев (запуск из source): корневой `website/`.
fn resolve_app_dir() -> PathBuf {
    if let Ok(r) = std::env::var("BULKA_DESKTOP_APP_DIR") {
        return PathBuf::from(r);
    }
    let exe_dir = app_root_dir();
    if exe_dir
        .join("app")
        .join("dist")
        .join("server")
        .join("entry.mjs")
        .is_file()
    {
        return exe_dir.join("app");
    }
    // Дев: exe в …/desktop/src-tauri/target/<profile>/. Поднимаемся до репо и берём website/.
    let mut d = exe_dir.as_path();
    for _ in 0..8 {
        let website = d.join("website");
        if website.join("dist").join("server").join("entry.mjs").is_file() {
            return website;
        }
        match d.parent() {
            Some(p) => d = p,
            None => break,
        }
    }
    exe_dir.join("app")
}

/// Путь к node.exe: бандлёный (`<app>/node/node.exe`), иначе системный `node` из PATH (дев).
fn node_exe(app_dir: &PathBuf) -> String {
    let bundled = app_dir.join("node").join("node.exe");
    if bundled.is_file() {
        return bundled.to_string_lossy().into_owned();
    }
    "node".to_string()
}

/// Установленная (NSIS) сборка? У неё рядом лежит деинсталлятор. Иначе — портатив (просто папка).
fn is_installed() -> bool {
    let d = app_root_dir();
    d.join("uninstall.exe").is_file() || d.join("Uninstall Bulka.exe").is_file()
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

/// Поднять Node-сервер через shell-плагин Tauri. Возвращает хендл дочернего процесса.
/// Tauri сам убьёт его при выходе приложения; вывод сервера сливаем в `<exe>/bulka-server.log`.
fn spawn_server(app: &tauri::AppHandle, app_dir: &PathBuf, port: u16) -> Option<CommandChild> {
    let node = node_exe(app_dir);
    let entry = app_dir
        .join("dist")
        .join("server")
        .join("entry.mjs")
        .to_string_lossy()
        .into_owned();
    let log_path = app_root_dir().join("bulka-server.log");

    let cmd = app
        .shell()
        .command(node)
        .args([entry])
        .env("HOST", "127.0.0.1")
        .env("PORT", port.to_string())
        // Куда сохранять записи/экспорт (сервер кладёт файлы в <app_dir>/recordings и открывает папку).
        .env("BULKA_APP_DIR", app_root_dir().to_string_lossy().into_owned())
        .current_dir(app_dir.clone());

    let (mut rx, child) = match cmd.spawn() {
        Ok(v) => v,
        Err(e) => {
            eprintln!("Не удалось запустить node-сервер: {e}");
            return None;
        }
    };

    // Сливаем stdout/stderr сервера в лог-файл (и не даём буферу канала переполниться).
    tauri::async_runtime::spawn(async move {
        let mut log = std::fs::File::create(&log_path).ok();
        while let Some(event) = rx.recv().await {
            let line = match event {
                CommandEvent::Stdout(b) | CommandEvent::Stderr(b) => b,
                _ => continue,
            };
            if let Some(f) = log.as_mut() {
                let _ = f.write_all(&line);
            }
        }
    });

    Some(child)
}

/// Проверка обновления на GitHub-релизе и (по согласию юзера) установка через setup.exe.
fn spawn_update_check(app: tauri::AppHandle) {
    use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
    use tauri_plugin_updater::UpdaterExt;
    let installed = is_installed();
    tauri::async_runtime::spawn(async move {
        let updater = match app.updater() {
            Ok(u) => u,
            Err(_) => return,
        };
        let update = match updater.check().await {
            Ok(Some(u)) => u,
            _ => return, // нет апдейта или ошибка сети -> тихо
        };
        let ver = update.version.clone();

        if !installed {
            let open = app
                .dialog()
                .message(format!("Доступна новая версия {ver}. Открыть страницу загрузки?"))
                .title("Обновление Bulka")
                .kind(MessageDialogKind::Info)
                .buttons(MessageDialogButtons::OkCancelCustom("Открыть".into(), "Позже".into()))
                .blocking_show();
            if open {
                use tauri_plugin_opener::OpenerExt;
                let _ = app.opener().open_url(RELEASES_URL, None::<&str>);
            }
            return;
        }

        let yes = app
            .dialog()
            .message(format!(
                "Доступна новая версия {ver}. Обновить сейчас? Приложение перезапустится."
            ))
            .title("Обновление Bulka")
            .kind(MessageDialogKind::Info)
            .buttons(MessageDialogButtons::OkCancelCustom("Обновить".into(), "Позже".into()))
            .blocking_show();
        if !yes {
            return;
        }
        // Убиваем дочерний node.exe ДО установщика: при апдейте приложение не закрывается
        // (перезапустится сами), поэтому авто-очистка Tauri на выходе не срабатывает — а живой
        // node держит `node/node.exe`/`dist`, и NSIS спотыкается на «файл занят».
        if let Some(state) = app.try_state::<ServerProc>() {
            if let Ok(mut guard) = state.0.lock() {
                if let Some(c) = guard.take() {
                    let _ = c.kill();
                }
            }
        }
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

pub fn run() {
    // Портатив: состояние WebView2 (localStorage -> ключи/настройки) держим рядом с exe.
    if std::env::var_os("WEBVIEW2_USER_DATA_FOLDER").is_none() {
        std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", app_root_dir().join("webview-data"));
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(ServerProc(Mutex::new(None)))
        .setup(move |app| {
            let handle = app.handle().clone();
            let app_dir = resolve_app_dir();
            let port = desktop_port();

            // Поднимаем node-сервер (Tauri трекает дочерний процесс и убьёт его на выходе).
            let child = spawn_server(&handle, &app_dir, port);
            if let Some(state) = app.try_state::<ServerProc>() {
                if let Ok(mut g) = state.0.lock() {
                    *g = child;
                }
            }
            if !wait_until_ready(port, Duration::from_secs(40)) {
                eprintln!("Node-сервер Bulka не поднялся на 127.0.0.1:{port} за 40с");
            }

            let url = format!("http://127.0.0.1:{port}/");
            let icon = app.default_window_icon().cloned();
            let win = WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::External(url.parse().expect("валидный URL")),
            )
            .title("Bulka")
            .inner_size(1500.0, 1000.0)
            .min_inner_size(1100.0, 700.0)
            .resizable(true)
            .disable_drag_drop_handler()
            .build()?;
            if let Some(ic) = icon {
                let _ = win.set_icon(ic);
            }

            spawn_update_check(app.handle().clone());
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("ошибка запуска Tauri")
        .run(|app, event| {
            // Штатно Tauri сам убивает дочерний процесс на выходе; дублируем на всякий случай.
            if let RunEvent::Exit = event {
                if let Some(state) = app.try_state::<ServerProc>() {
                    if let Ok(mut guard) = state.0.lock() {
                        if let Some(c) = guard.take() {
                            let _ = c.kill();
                        }
                    }
                }
            }
        });
}
