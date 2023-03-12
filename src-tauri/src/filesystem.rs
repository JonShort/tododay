use chrono::Local;
use std::{error, fmt, fs, io, io::Write, path};
use tauri::App;

use crate::handle_todo;

#[derive(Debug, Default, PartialEq)]
pub struct DB {
    save_file: path::PathBuf,
    save_dir: path::PathBuf,
}

impl DB {
    pub fn new(app: &App) -> Result<Self, DbError> {
        let save_dir = match app.path_resolver().app_data_dir() {
            Some(d) => d,
            None => return Err(DbError),
        };

        // Tauri doesn't create the $APPDATA directory automatically,
        // so here we create it if it doesn't already exist
        if !save_dir.exists() && fs::create_dir(&save_dir).is_err() {
            return Err(DbError);
        }

        let mut save_file = save_dir.clone();
        save_file.push(format!("{}.json", Local::now().date_naive()));

        Ok(Self {
            save_file,
            save_dir,
        })
    }

    pub fn save(&self, content: &str) -> Result<(), DbError> {
        // create our new todo file
        let mut f = fs::File::create(&self.save_file)?;
        f.write_all(content.as_bytes())?;

        Ok(())
    }

    pub fn get(&self) -> Result<String, DbError> {
        // happypath - file exists
        if let Ok(s) = fs::read_to_string(&self.save_file) {
            return Ok(s);
        }

        // check for older todo files
        let mut dir_entries = fs::read_dir(&self.save_dir)?
            .map(|res| res.map(|e| e.path()))
            .collect::<Result<Vec<_>, io::Error>>()?;

        dir_entries.sort();

        // get any carryover todos, or otherwise an empty object
        let prior_todos = match dir_entries.pop() {
            Some(p) => {
                // filter content
                match handle_todo::filter_todo_content(&fs::read_to_string(p)?) {
                    Ok(t) => t,
                    Err(_) => return Err(DbError),
                }
            }
            None => return Ok(String::from("{}")),
        };

        self.save(&prior_todos)?;

        Ok(prior_todos)
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DbError;

impl fmt::Display for DbError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "unable to connect to save location")
    }
}

impl error::Error for DbError {}

impl From<io::Error> for DbError {
    fn from(_: io::Error) -> Self {
        DbError
    }
}
