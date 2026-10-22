//! The portable build installs nothing, so a computer without the WebView2 Runtime gets it at the first start, the way
//! the NSIS installer of Tauri does in its `downloadBootstrapper` mode: tauri-bundler 2.12 (tauri-cli-v2.12.2),
//! `crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi`, `Section WebView2`.

use std::io::Write;
use std::path::Path;
use std::process::Command;
use std::time::Duration;

const CLIENT_KEY: &str = r"Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}";
const BOOTSTRAPPER_URL: &str = "https://go.microsoft.com/fwlink/p/?LinkId=2124703";

/// The Runtime version from the `pv` value: per-machine first, then per-user. Microsoft documents an empty value and
/// 0.0.0.0 as "not installed".
pub fn installed_version() -> Option<String> {
    let machine =
        windows_registry::LOCAL_MACHINE.open(format!(r"SOFTWARE\WOW6432Node\{CLIENT_KEY}"));
    let user = windows_registry::CURRENT_USER.open(format!(r"SOFTWARE\{CLIENT_KEY}"));
    [machine, user]
        .into_iter()
        .filter_map(|key| key.ok()?.get_string("pv").ok())
        .find(|pv| !pv.is_empty() && pv != "0.0.0.0")
}

/// Downloads the Evergreen bootstrapper to %TEMP% and runs it with `/silent /install`. Started without elevation it
/// installs the Runtime for this user. Returns the installed version.
pub fn install(log: &mut impl Write) -> Result<String, String> {
    let setup = std::env::temp_dir().join("MicrosoftEdgeWebview2Setup.exe");
    match std::fs::remove_file(&setup) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
        Err(e) => return Err(format!("{}: {e}", setup.display())),
    }
    let _ = writeln!(log, "[..] качаю {BOOTSTRAPPER_URL} -> {}", setup.display());
    download(BOOTSTRAPPER_URL, &setup)?;
    let _ = writeln!(log, "[..] {} /silent /install", setup.display());
    let status = Command::new(&setup)
        .args(["/silent", "/install"])
        .status()
        .map_err(|e| format!("установщик WebView2 не запустился: {e}"))?;
    let _ = writeln!(log, "[..] установщик WebView2 завершился: {status}");
    if !status.success() {
        return Err(format!(
            "установщик WebView2 завершился с ошибкой ({status})"
        ));
    }
    let version = installed_version()
        .ok_or("установщик WebView2 отработал, но среды WebView2 в реестре нет")?;
    let _ = writeln!(log, "[OK] WebView2 {version}");
    Ok(version)
}

fn download(url: &str, to: &Path) -> Result<(), String> {
    if rustls::crypto::CryptoProvider::get_default().is_none() {
        let _ = rustls::crypto::ring::default_provider().install_default();
    }
    let bytes = tauri::async_runtime::block_on(async {
        let client = reqwest::Client::builder()
            .connect_timeout(Duration::from_secs(20))
            .timeout(Duration::from_secs(300))
            .build()?;
        client
            .get(url)
            .send()
            .await?
            .error_for_status()?
            .bytes()
            .await
    })
    .map_err(|e| format!("не скачался установщик WebView2 ({url}): {e}"))?;
    std::fs::write(to, &bytes).map_err(|e| format!("{}: {e}", to.display()))
}

#[cfg(test)]
mod tests {
    /// The real bootstrapper of Microsoft, on this computer: `cargo test --release webview2 -- --ignored --nocapture`.
    /// With the Runtime already here it finishes without changing anything.
    #[test]
    #[ignore]
    fn bootstrapper_installs_and_the_runtime_is_found() {
        let mut log = std::io::stdout();
        let version = super::install(&mut log).expect("WebView2 bootstrapper");
        assert_eq!(Some(version), super::installed_version());
    }

    #[test]
    fn this_computer_has_a_runtime_version() {
        let version = super::installed_version().expect("WebView2 is part of this Windows");
        assert!(version.split('.').count() == 4, "{version}");
    }
}
