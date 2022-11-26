#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use tauri::{AboutMetadata, CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
    let context = tauri::generate_context!();
    let about = CustomMenuItem::new("about".to_string(), "About");
    let update = CustomMenuItem::new("update".to_string(), "Check for updates");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let export = CustomMenuItem::new("export".to_string(), "Export");
    let import = CustomMenuItem::new("import".to_string(), "Import");
    let mainmenu = Submenu::new(
        "todo",
        Menu::new()
            .add_native_item(MenuItem::About(
                "todo".to_string(),
                AboutMetadata::default(),
            ))
            .add_native_item(MenuItem::Services)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Services)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit)
            .add_native_item(MenuItem::Separator)
            .add_item(about)
            .add_item(update)
            .add_native_item(MenuItem::Separator)
            .add_item(quit),
    );
    let filemenu = Submenu::new("File", Menu::new().add_item(export).add_item(import));
    let editmenu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );
    let screenmenu = Submenu::new(
        "Window",
        Menu::new()
            .add_native_item(MenuItem::EnterFullScreen)
            .add_native_item(MenuItem::Minimize)
            .add_native_item(MenuItem::Zoom)
            .add_native_item(MenuItem::CloseWindow),
    );

    let menu = Menu::new()
        .add_submenu(mainmenu)
        .add_submenu(filemenu)
        .add_submenu(editmenu)
        .add_submenu(screenmenu);

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
            "import" => {
                let window = event.window();
                window.emit("import", "import".to_string()).unwrap();
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
