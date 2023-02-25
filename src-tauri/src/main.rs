#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager};

#[derive(Clone, serde::Serialize)]
struct RefreshPayload {}

#[derive(serde::Deserialize, Debug)]
struct Todo {
  val: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn add_todo(todo: &str) -> String {
    format!("Added your todo: {}", todo)
}

#[tauri::command]
fn get_todos() -> String {
    // get todos from file
    String::from("")
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            app.listen_global("ADD_TODO", |event| {
                let new_todo: Todo = serde_json::from_str(&event.payload().unwrap()).unwrap();

                // add the todo to file
                println!("{:?}", new_todo.val);
            });

            // emit the `event-name` event to all webview windows on the frontend
            app.emit_all("REFRESH_TODOS", RefreshPayload { }).unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![add_todo, get_todos])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
