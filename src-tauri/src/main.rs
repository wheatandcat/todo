#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
    let context = tauri::generate_context!();
    let about = CustomMenuItem::new("about".to_string(), "todoについて");
    let update = CustomMenuItem::new("update".to_string(), "アップデートを確認");
    let quit = CustomMenuItem::new("quit".to_string(), "todoを閉じる");
    let export = CustomMenuItem::new("export".to_string(), "エクスポート");
    let import = CustomMenuItem::new("import".to_string(), "インポート");
    let mainmenu = Submenu::new(
        "todo",
        tauri::Menu::os_default(&context.package_info().name)
            .add_item(about)
            .add_item(update)
            .add_native_item(MenuItem::Separator)
            .add_item(quit),
    );
    let submenu = Submenu::new("ファイル", Menu::new().add_item(export).add_item(import));

    let menu = Menu::new().add_submenu(mainmenu).add_submenu(submenu);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "about" => {
                let window = event.window();
                window.emit("about", "about".to_string()).unwrap();
            }
            "export" => {
                let window = event.window();
                window.emit("export", "export".to_string()).unwrap();
            }
            "quit" => {
                std::process::exit(0);
            }
            "close" => {
                event.window().close().unwrap();
            }
            _ => {}
        })
        .run(context)
        .expect("error while running tauri application");
}
