//! Programs of the computer started from the shell (xdg-open). The AppImage's AppRun puts the image's libraries
//! first in LD_LIBRARY_PATH ($APPDIR/usr/lib); a program of the computer loading them fails on systems newer than
//! the image's, so it gets the library path without the image's folders. Outside an AppImage, and off Linux,
//! nothing changes.

use std::ffi::{OsStr, OsString};
use std::path::Path;
use std::process::Command;

#[derive(Debug, PartialEq)]
enum LibraryPath {
    Keep,
    Remove,
    Set(OsString),
}

/// The library path `current` (`:`-separated) for `program` when the shell runs from the AppImage mounted at
/// `appdir`: a program outside the image loses the image's folders, one inside keeps them.
#[cfg_attr(not(target_os = "linux"), allow(dead_code))]
fn library_path_outside(appdir: &Path, program: &Path, current: &OsStr) -> LibraryPath {
    if program.starts_with(appdir) {
        return LibraryPath::Keep;
    }
    let bytes = current.as_encoded_bytes();
    let parts: Vec<&[u8]> = bytes.split(|b| *b == b':').collect();
    // SAFETY: each part is a piece of an OsStr's encoded bytes cut at an ASCII byte.
    let kept: Vec<&[u8]> = parts
        .iter()
        .copied()
        .filter(|part| !Path::new(unsafe { OsStr::from_encoded_bytes_unchecked(part) }).starts_with(appdir))
        .collect();
    if kept.len() == parts.len() {
        LibraryPath::Keep
    } else if kept.iter().all(|part| part.is_empty()) {
        LibraryPath::Remove
    } else {
        let joined = kept.join(&b':');
        // SAFETY: the pieces of an OsStr's encoded bytes joined with an ASCII byte.
        LibraryPath::Set(unsafe { OsStr::from_encoded_bytes_unchecked(&joined) }.to_os_string())
    }
}

#[cfg_attr(not(target_os = "linux"), allow(dead_code))]
pub fn outside_appimage(cmd: &mut Command) -> &mut Command {
    #[cfg(target_os = "linux")]
    if let Some(appdir) = std::env::var_os("APPDIR").filter(|d| !d.is_empty()) {
        let current = match cmd.get_envs().find(|(k, _)| *k == "LD_LIBRARY_PATH") {
            Some((_, Some(v))) => Some(v.to_os_string()),
            Some((_, None)) => None,
            None => std::env::var_os("LD_LIBRARY_PATH"),
        };
        if let Some(current) = current {
            let program = Path::new(cmd.get_program()).to_path_buf();
            match library_path_outside(Path::new(&appdir), &program, &current) {
                LibraryPath::Keep => {}
                LibraryPath::Remove => {
                    cmd.env_remove("LD_LIBRARY_PATH");
                }
                LibraryPath::Set(v) => {
                    cmd.env("LD_LIBRARY_PATH", v);
                }
            }
        }
    }
    cmd
}

/// A command for a program of the computer, which does not load the AppImage's libraries ([`outside_appimage`]).
#[cfg_attr(not(target_os = "linux"), allow(dead_code))]
pub fn host_command(program: impl AsRef<OsStr>) -> Command {
    let mut cmd = Command::new(program);
    outside_appimage(&mut cmd);
    cmd
}

#[cfg(test)]
mod tests {
    use super::*;

    const APPDIR: &str = "/tmp/.mount_BulkaX1";

    fn outside(program: &str, current: &str) -> LibraryPath {
        library_path_outside(Path::new(APPDIR), Path::new(program), OsStr::new(current))
    }

    #[test]
    fn a_program_of_the_computer_loses_the_image_folders() {
        assert_eq!(
            outside("xdg-open", "/tmp/.mount_BulkaX1/usr/lib/:/opt/lib:/tmp/.mount_BulkaX1/usr/lib/x86_64-linux-gnu/"),
            LibraryPath::Set("/opt/lib".into())
        );
    }

    #[test]
    fn only_image_folders_remove_the_variable() {
        assert_eq!(outside("xdg-open", "/tmp/.mount_BulkaX1/usr/lib/:/tmp/.mount_BulkaX1/usr/lib32/"), LibraryPath::Remove);
    }

    #[test]
    fn a_program_inside_the_image_keeps_the_path() {
        assert_eq!(outside("/tmp/.mount_BulkaX1/usr/bin/bulka-desktop", "/tmp/.mount_BulkaX1/usr/lib/"), LibraryPath::Keep);
    }

    #[test]
    fn a_path_without_image_folders_is_kept() {
        assert_eq!(outside("xdg-open", "/opt/lib:/usr/local/lib"), LibraryPath::Keep);
    }

    #[test]
    fn a_folder_that_only_starts_like_the_image_is_kept() {
        assert_eq!(outside("xdg-open", "/tmp/.mount_BulkaX1other/usr/lib"), LibraryPath::Keep);
    }
}
