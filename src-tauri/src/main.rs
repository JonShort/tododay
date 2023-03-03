#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod handle_todo;

use chrono::offset::Local;
use std::{fs, io, io::Write, path::PathBuf};

fn get_save_location(app_handle: &tauri::AppHandle, save_file: tauri::State<String>) -> PathBuf {
    let mut save_location = app_handle.path_resolver().app_data_dir().unwrap();
    save_location.push(save_file.inner());

    save_location
}

#[tauri::command]
fn get_todos(app_handle: tauri::AppHandle, save_file: tauri::State<String>) -> String {
    let save_location = get_save_location(&app_handle, save_file);

    // happypath - file exists
    if let Ok(s) = fs::read_to_string(&save_location) {
        return s;
    }

    // check for older todo files
    let app_data_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let mut dir_entries = fs::read_dir(app_data_dir)
        .unwrap()
        .map(|res| res.map(|e| e.path()))
        .collect::<Result<Vec<_>, io::Error>>()
        .unwrap();

    dir_entries.sort();

    // get any carryover todos, or otherwise an empty object
    let existing_todos = match dir_entries.pop() {
        Some(p) => {
            // filter content
            match handle_todo::filter_todo_content(&fs::read_to_string(p).unwrap()) {
                Ok(t) => t,
                Err(_) => String::from("{}"),
            }
        }
        None => String::from("{}"),
    };

    // create our new todo file
    let mut file = match fs::File::create(&save_location) {
        Ok(f) => f,
        Err(_) => {
            // for now ignore the error and start with empty todos
            return String::from("{}");
        }
    };

    // write everything we have to current file
    if file.write_all(existing_todos.as_bytes()).is_ok() {}

    existing_todos
}

#[tauri::command]
fn sync(app_handle: tauri::AppHandle, save_file: tauri::State<String>, content: String) -> bool {
    let save_location = get_save_location(&app_handle, save_file);

    // The file should exist, but this is an easy way to clear it
    let mut file = match fs::File::create(save_location) {
        Ok(f) => f,
        Err(_) => {
            return false;
        }
    };

    file.write_all(content.as_bytes()).is_ok()
}

fn main() {
    let save_file = format!("{}.json", Local::now().date_naive());

    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app.path_resolver().app_data_dir().unwrap();

            if app_data_dir.exists() {
                return Ok(());
            }

            fs::create_dir(app_data_dir)?;

            Ok(())
        })
        .manage(save_file)
        .invoke_handler(tauri::generate_handler![get_todos, sync])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
