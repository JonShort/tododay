#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod filesystem;
mod handle_todo;

use tauri::Manager;

#[tauri::command]
fn get_todos(db: tauri::State<filesystem::DB>) -> String {
    db.get().unwrap_or(String::from("{}"))
}

#[tauri::command]
fn sync(db: tauri::State<filesystem::DB>, content: String) -> bool {
    db.save(&content).is_ok()
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let db = filesystem::DB::new(app)?;
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_todos, sync])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
