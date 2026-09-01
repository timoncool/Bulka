//! Tauri-оболочка Bulka (десктоп). Сама ничего тяжёлого не делает: поднимает автономный
//! Astro Node-сервер (`website/dist/server/entry.mjs`) на 127.0.0.1:<свободный порт> дочерним
//! процессом `node.exe` и открывает окно на этот URL. Сервер сам раздаёт SPA и API (`/api/chat`,
//! `/api/models`) на одном origin — фронт работает с относительными путями без правок.
//!
//! Паттерн портативности и авто-обновления взят из эталона dub-studio (desktop/src-tauri/src/lib.rs):
//! app_root_dir = каталог рядом с exe; WEBVIEW2_USER_DATA_FOLDER (там же localStorage — т.е. ключи
//! и настройки пользователя) держим рядом с exe. Удалил папку — удалил приложение.
//!
//! Отличие от dub-studio: их сервер — Rust-крейт в этом же процессе; наш агент на Node, поэтому
//! поднимаем node.exe как дочерний процесс и УБИВАЕМ его при выходе (RunEvent::Exit).

use std::fs::File;
use std::net::{Ipv4Addr, SocketAddrV4, TcpListener, TcpStream};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use tauri::{Manager, RunEvent, WebviewUrl, WebviewWindowBuilder};

/// Хендл дочернего Node-процесса, чтобы убить его при выходе приложения.
struct ServerProc(Mutex<Option<Child>>);

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
fn node_exe(app_dir: &PathBuf) -> PathBuf {
    let bundled = app_dir.join("node").join("node.exe");
    if bundled.is_file() {
        return bundled;
    }
    PathBuf::from("node")
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
/// или дефолт 4188. Если занят (второй экземпляр/чужой процесс) — берём свободный (MCP-конфиг тогда
/// укажет на первый экземпляр — это ок, обычно приложение одно).
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

/// Поднять автономный Astro Node-сервер дочерним процессом. Лог сервера — рядом с exe.
fn spawn_server(app_dir: &PathBuf, port: u16) -> std::io::Result<Child> {
    let node = node_exe(app_dir);
    let entry = app_dir.join("dist").join("server").join("entry.mjs");
    let log_path = app_root_dir().join("bulka-server.log");

    let mut cmd = Command::new(node);
    cmd.arg(&entry)
        .env("HOST", "127.0.0.1")
        .env("PORT", port.to_string())
        // Куда сохранять записи/экспорт (сервер кладёт файлы в <app_dir>/recordings и открывает папку).
        .env("BULKA_APP_DIR", app_root_dir())
        .current_dir(app_dir);

    if let Ok(log) = File::create(&log_path) {
        if let Ok(log2) = log.try_clone() {
            cmd.stdout(Stdio::from(log)).stderr(Stdio::from(log2));
        }
    }

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    cmd.spawn()
}

/// Проверка обновления на GitHub-релизе и (по согласию юзера) установка через setup.exe.
/// Установленная сборка — авто-скачивание+установка+перезапуск; портатив — открыть страницу релиза.
/// Тихо выходит при отсутствии апдейта/сети.
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
        // ВАЖНО: убиваем дочерний node.exe ДО запуска установщика. NSIS гасит только
        // сам bulka-desktop.exe, но не знает про наш дочерний Node-сервер — а тот держит
        // `node/node.exe`, `dist` и лог. Пока он жив, установщик не может перезаписать файлы
        // и спотыкается на «файл занят» (юзеру приходится убивать node вручную и жать «Повтор»).
        if let Some(state) = app.try_state::<ServerProc>() {
            if let Ok(mut guard) = state.0.lock() {
                if let Some(mut c) = guard.take() {
                    let _ = c.kill();
                    let _ = c.wait(); // дождаться завершения, чтобы ОС отпустила файловые хендлы
                }
            }
        }
        // небольшая пауза — дать Windows фактически освободить хендлы перед перезаписью
        std::thread::sleep(Duration::from_millis(500));

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

    let app_dir = resolve_app_dir();
    let port = desktop_port();
    let child = spawn_server(&app_dir, port).ok();

    if !wait_until_ready(port, Duration::from_secs(40)) {
        eprintln!("Node-сервер Bulka не поднялся на 127.0.0.1:{port} за 40с");
    }

    let url = format!("http://127.0.0.1:{port}/");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(ServerProc(Mutex::new(child)))
        .setup(move |app| {
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
            // Закрыли приложение -> убиваем дочерний Node-сервер.
            if let RunEvent::Exit = event {
                if let Some(state) = app.try_state::<ServerProc>() {
                    if let Ok(mut guard) = state.0.lock() {
                        if let Some(mut c) = guard.take() {
                            let _ = c.kill();
                        }
                    }
                }
            }
        });
}
