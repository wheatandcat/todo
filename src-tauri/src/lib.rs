use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, SubmenuBuilder, MenuId, Submenu },
    tray::TrayIconBuilder,
    AppHandle,
    Wry,
    Error,
};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]

fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let _ = app.set_menu(get_menu(app.handle())?);
            app.on_menu_event(|handle, ev| { run_menu_process(handle, ev.id().as_ref()) });

            

            // メニューの追加
            let hide_i = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&hide_i, &separator, &quit_i])?;
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("quit menu item was clicked");
                        app.exit(0);
                    }
                    "hide" => {
                        println!("hide menu item was clicked");
                        app.hide().unwrap();
                    }
                    _ => {
                        println!("menu item {:?} not handled", event.id);
                    }
                })
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?;
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_menu(handle: &AppHandle) -> Result<Menu<Wry>, Error> {
    let menu = Menu::new(handle)?;
    let _ = menu.append(&get_menu_file(handle)?)?;
    let _ = menu.append(&get_menu_edit(handle)?)?;
    Ok(menu)
}
fn get_menu_file(handle: &AppHandle) -> Result<Submenu<Wry>, Error> {
    SubmenuBuilder::new(handle, "File")
        .items(&[
            &MenuItem::with_id(handle, MenuId::new("id_new"), "New", true, Some("Ctrl+N"))?,
            &MenuItem::with_id(handle, MenuId::new("id_open"), "Open", true, Some("Ctrl+O"))?,
        ])
        .separator()
        .text(MenuId::new("id_quit"), "Quit")
        .build()
}
fn get_menu_edit(handle: &AppHandle) -> Result<Submenu<Wry>, Error> {
    SubmenuBuilder::new(handle, "Edit")
        .cut()
        .copy()
        .paste()
        .separator()
        .item(&MenuItem::with_id(handle,MenuId::new("id_sp"), "Special Edit", true, None::<&str>)?)
        .build()
}
fn run_menu_process(handle: &AppHandle, id: &str) {
    use tauri::Emitter;
    match id {
        "id_new" => { let _ = handle.emit_to("main", "ev-new", "trigger new menu process"); },
        "id_open" => { let _ = handle.emit_to("main", "ev-open", "trigger open menu process"); },
        "id_sp" => { let _ = handle.emit_to("main", "ev-sp", "trigger sp menu process"); },
        "id_quit" => {
            handle.cleanup_before_exit();
            std::process::exit(0);
        },
        _ => {},
    }
}