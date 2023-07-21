#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod sql;

#[tauri::command]
async fn get_todos(db: tauri::State<'_, sql::DB>) -> Result<String, ()> {
    Ok(db.get_todos().await.unwrap_or(String::from("{}")))
}

#[tauri::command]
async fn get_ordering(db: tauri::State<'_, sql::DB>) -> Result<String, ()> {
    Ok(db.get_ordering().await.unwrap_or(String::from("[]")))
}

#[tauri::command]
async fn add_todo(db: tauri::State<'_, sql::DB>, id: String, content: String) -> Result<bool, ()> {
    Ok(db.add_todo(&id, &content).await.is_ok())
}

#[tauri::command]
async fn complete_todo(db: tauri::State<'_, sql::DB>, id: String) -> Result<bool, ()> {
    Ok(db.complete_todo(&id).await.is_ok())
}

#[tauri::command]
async fn uncomplete_todo(db: tauri::State<'_, sql::DB>, id: String) -> Result<bool, ()> {
    Ok(db.uncomplete_todo(&id).await.is_ok())
}

#[tauri::command]
async fn remove_todo(db: tauri::State<'_, sql::DB>, id: String) -> Result<bool, ()> {
    Ok(db.remove_todo(&id).await.is_ok())
}

#[tauri::command]
async fn unremove_todo(db: tauri::State<'_, sql::DB>, id: String) -> Result<bool, ()> {
    Ok(db.unremove_todo(&id).await.is_ok())
}

#[tauri::command]
async fn set_ordering(db: tauri::State<'_, sql::DB>, order: String) -> Result<bool, ()> {
    Ok(db.set_ordering(&order).await.is_ok())
}

fn main() {
    tauri::async_runtime::block_on(async {
        let db = sql::DB::new().await.unwrap();
        db.run_migrations().await.unwrap();
        db.setup_todays_todos().await.unwrap();

        tauri::Builder::default()
            .manage(db)
            .invoke_handler(tauri::generate_handler![
                add_todo,
                complete_todo,
                get_ordering,
                get_todos,
                remove_todo,
                set_ordering,
                uncomplete_todo,
                unremove_todo,
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}
