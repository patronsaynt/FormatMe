// FormatMe — Tauri backend. The Rust side stays thin: it exposes native
// file read/write so the frontend can save exports to a user-chosen path.

use tauri::menu::{Menu, MenuItemBuilder, SubmenuBuilder};
use tauri::Manager;

/// Wipes every FormatMe-owned localStorage key, then reloads the webview so the
/// app boots as a first-run user (onboarding shows again).
const CLEAR_USER_DATA_JS: &str = r#"
(function () {
  try {
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('formatme:') === 0) keys.push(k);
    }
    keys.forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) { /* ignore */ }
  window.location.reload();
})();
"#;

#[tauri::command]
fn write_file_bytes(path: String, contents: Vec<u8>) -> Result<(), String> {
    std::fs::write(&path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_file_text(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_file_bytes(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Append a "Debug" submenu to the standard macOS app menu bar.
            let clear_user_data =
                MenuItemBuilder::with_id("clear_user_data", "Clear User Data").build(app)?;
            let debug_menu = SubmenuBuilder::new(app, "Debug")
                .item(&clear_user_data)
                .build()?;

            let menu = Menu::default(app.handle())?;
            menu.append(&debug_menu)?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            if event.id().as_ref() == "clear_user_data" {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.eval(CLEAR_USER_DATA_JS);
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            write_file_bytes,
            read_file_text,
            read_file_bytes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
