use std::path::PathBuf;

fn main() {
    // desktop/check-binaries.mjs names the function behind every AVX-512 instruction from this link map:
    // the release binary is stripped.
    if std::env::var("PROFILE").as_deref() == Ok("release") {
        let out = PathBuf::from(std::env::var("OUT_DIR").expect("OUT_DIR"));
        let profile_dir = out
            .ancestors()
            .nth(3)
            .expect("<target>/release from OUT_DIR");
        let map = profile_dir.join("bulka-desktop.map");
        let target = std::env::var("TARGET").expect("TARGET");
        if target.contains("windows-msvc") {
            println!("cargo:rustc-link-arg-bins=/MAP:{}", map.display());
        } else if target.contains("linux") {
            println!("cargo:rustc-link-arg-bins=-Wl,-Map={}", map.display());
        }
    }
    tauri_build::build();
}
