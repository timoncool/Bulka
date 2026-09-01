// GUI-подсистема в релизе (без чёрного окна консоли); дочерний node.exe спавним с CREATE_NO_WINDOW.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    bulka_desktop_lib::run();
}
