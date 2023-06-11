use chrono::{Local, NaiveDate};
use sqlx::{self, Pool, Sqlite};
use std::collections::HashMap;
use std::str::FromStr;
use std::{error, fmt, fs};
use tauri::api;

use chrono::Datelike;

#[derive(Debug)]
pub struct DB {
    connection_pool: Pool<Sqlite>,
    today_iso_date: NaiveDate,
}

impl DB {
    pub async fn new() -> Result<Self, DbError> {
        let app_data_dir = match api::path::app_data_dir(&Default::default()) {
            Some(d) => d,
            None => return Err(DbError),
        };

        let app_data_dir = app_data_dir.join("com.tododay.dev");

        // Tauri doesn't create the $APPDATA directory automatically,
        // so here we create it if it doesn't already exist
        if !app_data_dir.exists() && fs::create_dir(&app_data_dir).is_err() {
            return Err(DbError);
        }

        let sqlite_db_path = app_data_dir.join("tododay.db");

        let connect_options = sqlx::sqlite::SqliteConnectOptions::from_str(&format!(
            "sqlite://{}",
            sqlite_db_path.display()
        ))?
        .create_if_missing(true);

        let connection_pool = sqlx::sqlite::SqlitePoolOptions::new()
            .acquire_timeout(std::time::Duration::from_secs(2))
            .connect_lazy_with(connect_options);

        let mut save_file = app_data_dir.clone();
        save_file.push(format!("{}.json", Local::now().date_naive()));

        Ok(Self {
            connection_pool,
            today_iso_date: Local::now().date_naive(),
        })
    }

    pub async fn run_migrations(&self) -> Result<(), DbError> {
        let migration_result = sqlx::migrate!("./migrations")
            .run(&self.connection_pool)
            .await;

        match migration_result {
            Ok(_) => Ok(()),
            _ => Err(DbError),
        }
    }

    pub async fn setup_todays_todos(&self) -> Result<(), DbError> {
        let iso = self.today_iso_date.to_string();
        let a = sqlx::query!("SELECT iso_date FROM dates WHERE iso_date = $1", iso)
            .fetch_optional(&self.connection_pool)
            .await?;

        if a.is_some() {
            // day entry exists, assume the day has already been setup
            return Ok(());
        }

        // start transaction here
        let mut tx = self.connection_pool.begin().await?;
        let iso = self.today_iso_date.to_string();
        let day = self.today_iso_date.day();
        let month = self.today_iso_date.month();
        let year = self.today_iso_date.year();

        sqlx::query!(
            "
            INSERT INTO dates (iso_date, day, month, year)
            VALUES ($1, $2, $3, $4)
            ",
            iso,
            day,
            month,
            year
        )
        .execute(&mut tx)
        .await?;

        sqlx::query!(
            "
            UPDATE todos SET modify_date = $1 WHERE is_complete = 0
            ",
            iso
        )
        .execute(&mut tx)
        .await?;

        tx.commit().await?;

        Ok(())
    }

    pub async fn save(&self, id: &str, content: &str) -> Result<(), DbError> {
        let iso = self.today_iso_date.to_string();
        sqlx::query!(
            "
            INSERT INTO todos (todo_id, is_complete, content, modify_date, create_date)
            VALUES ($1, $2, $3, $4, $5)
            ",
            id,
            0,
            content,
            iso,
            iso
        )
        .execute(&self.connection_pool)
        .await?;

        Ok(())
    }

    pub async fn get(&self) -> Result<String, DbError> {
        let iso = self.today_iso_date.to_string();
        let todays_todos = sqlx::query!(
            "SELECT todo_id,content,is_complete FROM todos WHERE modify_date = $1",
            iso
        )
        .fetch_all(&self.connection_pool)
        .await?;

        let mut hashmap: HashMap<String, GetTodo> = HashMap::new();

        for db_todo in todays_todos {
            hashmap.insert(
                db_todo.todo_id,
                GetTodo {
                    content: db_todo.content,
                    isComplete: db_todo.is_complete != 0,
                },
            );
        }

        // For now we'll ignore errors and return an empty object instead
        let json_string = serde_json::to_string(&hashmap).unwrap_or(String::from("{}"));

        Ok(String::from(json_string))
    }
}

#[allow(non_snake_case)]
#[derive(serde::Serialize, Clone, Debug, Eq, PartialEq)]
pub struct GetTodo {
    content: String,
    isComplete: bool,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DbError;

impl fmt::Display for DbError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "unable to connect to save location")
    }
}

impl error::Error for DbError {}

impl From<sqlx::Error> for DbError {
    fn from(_: sqlx::Error) -> Self {
        DbError
    }
}
