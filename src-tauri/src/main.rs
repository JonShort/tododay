#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[tauri::command]
fn get_todos() -> String {
    // get todos from file
    String::from("{\"aaaaa\":{\"addedAt\":1677528896913,\"content\":\"Do thing\",\"isComplete\":false},\"bbbbb\":{\"addedAt\":1677528898225,\"content\":\"Do some things\",\"isComplete\":false}}")
}

#[tauri::command]
fn sync() -> bool {
    true
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_todos, sync])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
