//! The portable build installs nothing, so a computer without the WebView2 Runtime gets it at the first start, the way
//! the NSIS installer of Tauri does in its `downloadBootstrapper` mode: tauri-bundler 2.12 (tauri-cli-v2.12.2),
//! `crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi`, `Section WebView2`.

use std::io::Write;
use std::path::Path;
use std::process::{Command, ExitStatus};
use std::time::Duration;

const CLIENT_KEY: &str = r"Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}";
const BOOTSTRAPPER_URL: &str = "https://go.microsoft.com/fwlink/p/?LinkId=2124703";
const BOOTSTRAPPER_FILE: &str = "MicrosoftEdgeWebview2Setup.exe";
/// installer.nsi: `ExecWait "$6 ${WEBVIEW2INSTALLERARGS} /install"`, the arguments being `/silent`.
const BOOTSTRAPPER_ARGS: [&str; 2] = ["/silent", "/install"];

/// The Runtime version from the `pv` values, per-machine first, then per-user. Microsoft documents a missing key, an
/// empty value and 0.0.0.0 as "not installed".
fn runtime_version(machine_pv: Option<String>, user_pv: Option<String>) -> Option<String> {
    [machine_pv, user_pv]
        .into_iter()
        .flatten()
        .find(|pv| !pv.is_empty() && pv != "0.0.0.0")
}

fn registry_pv(root: &windows_registry::Key, path: &str) -> Option<String> {
    root.open(path).ok()?.get_string("pv").ok()
}

/// The installed WebView2 Runtime, read from the registry like installer.nsi does.
pub fn installed_version() -> Option<String> {
    runtime_version(
        registry_pv(
            windows_registry::LOCAL_MACHINE,
            &format!(r"SOFTWARE\WOW6432Node\{CLIENT_KEY}"),
        ),
        registry_pv(
            windows_registry::CURRENT_USER,
            &format!(r"SOFTWARE\{CLIENT_KEY}"),
        ),
    )
}

/// Downloads the Evergreen bootstrapper into `dir` (%TEMP% at start) and runs it. Started without elevation it
/// installs the Runtime for this user. Returns the installed version.
pub fn install(log: &mut impl Write, dir: &Path) -> Result<String, String> {
    let setup = dir.join(BOOTSTRAPPER_FILE);
    match std::fs::remove_file(&setup) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
        Err(e) => return Err(format!("{}: {e}", setup.display())),
    }
    let _ = writeln!(log, "[..] качаю {BOOTSTRAPPER_URL} -> {}", setup.display());
    download(BOOTSTRAPPER_URL, &setup)?;
    let _ = writeln!(
        log,
        "[..] {} {}",
        setup.display(),
        BOOTSTRAPPER_ARGS.join(" ")
    );
    let status = run_bootstrapper(&setup)?;
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

fn run_bootstrapper(setup: &Path) -> Result<ExitStatus, String> {
    Command::new(setup)
        .args(BOOTSTRAPPER_ARGS)
        .status()
        .map_err(|e| format!("установщик WebView2 не запустился: {e}"))
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
    use super::runtime_version;

    /// Microsoft's real bootstrapper on this computer, run by hand:
    /// `BULKA_WEBVIEW2_TEST_DIR=<folder> cargo test --release --lib webview2 -- --ignored --nocapture`.
    /// With the Runtime already here it must finish with code 0 and leave the registry version as it was.
    #[test]
    #[ignore]
    fn real_bootstrapper_finishes_and_the_runtime_stays() {
        let dir = std::path::PathBuf::from(
            std::env::var("BULKA_WEBVIEW2_TEST_DIR").expect("BULKA_WEBVIEW2_TEST_DIR"),
        );
        std::fs::create_dir_all(&dir).expect("test folder");
        let before = super::installed_version().expect("WebView2 is installed before the test");
        let log_path = dir.join("webview2-install.log");
        let mut log = std::fs::File::create(&log_path).expect("log");
        let after = super::install(&mut log, &dir).expect("bootstrapper");
        assert_eq!(after, before);
        let text = std::fs::read_to_string(&log_path).expect("log");
        assert!(text.contains("[OK] WebView2"), "{text}");
        println!("WebView2 {before} -> {after}\n{text}");
    }

    fn pv(s: &str) -> Option<String> {
        Some(s.to_string())
    }

    #[test]
    fn no_key_anywhere_means_install() {
        assert_eq!(runtime_version(None, None), None);
    }

    #[test]
    fn empty_and_zero_versions_mean_install() {
        assert_eq!(runtime_version(pv(""), None), None);
        assert_eq!(runtime_version(pv("0.0.0.0"), pv("")), None);
        assert_eq!(runtime_version(None, pv("0.0.0.0")), None);
    }

    #[test]
    fn a_version_in_either_place_means_installed() {
        assert_eq!(
            runtime_version(pv("141.0.3537.71"), None),
            pv("141.0.3537.71")
        );
        assert_eq!(
            runtime_version(None, pv("141.0.3537.71")),
            pv("141.0.3537.71")
        );
        assert_eq!(
            runtime_version(pv("0.0.0.0"), pv("141.0.3537.71")),
            pv("141.0.3537.71")
        );
    }

    #[test]
    fn per_machine_comes_first() {
        assert_eq!(
            runtime_version(pv("141.0.1.1"), pv("140.0.1.1")),
            pv("141.0.1.1")
        );
    }
}
