#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod sql;

#[tauri::command]
async fn get_todos(db: tauri::State<'_, sql::DB>) -> Result<String, ()> {
    Ok(db.get().await.unwrap_or(String::from("{}")))
}

#[tauri::command]
async fn sync(db: tauri::State<'_, sql::DB>, id: String, content: String) -> Result<bool, ()> {
    Ok(db.save(&id, &content).await.is_ok())
}

fn main() {
    tauri::async_runtime::block_on(async {
        let db = sql::DB::new().await.unwrap();
        db.run_migrations().await.unwrap();
        db.setup_todays_todos().await.unwrap();

        tauri::Builder::default()
            .manage(db)
            .invoke_handler(tauri::generate_handler![get_todos, sync])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}
