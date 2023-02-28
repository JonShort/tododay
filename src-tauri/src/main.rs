#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[derive(Clone, serde::Serialize)]
struct RefreshPayload {}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn add_todo(todo: &str) -> String {
    format!("Added your todo: {}", todo)
}

#[tauri::command]
fn get_todos() -> String {
    // get todos from file
    String::from("{\"aaaaa\":{\"addedAt\":1677528896913,\"content\":\"Do thing\",\"isComplete\":false},\"bbbbb\":{\"addedAt\":1677528898225,\"content\":\"Do some things\",\"isComplete\":false}}")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_todo, get_todos])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
