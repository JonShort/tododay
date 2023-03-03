use serde_json::{Map, Value};

pub fn filter_todo_content(raw: &str) -> Result<String, serde_json::Error> {
    let contents: Value = serde_json::from_str(raw)?;

    if let Value::Object(obj) = contents {
        let filtered: Value = obj
            .into_iter()
            .filter(|(_k, v)| match v.get("isComplete") {
                Some(val_bool) => {
                    if let Some(b) = val_bool.as_bool() {
                        !b
                    } else {
                        false
                    }
                }
                None => false,
            })
            .collect::<Map<_, _>>()
            .into();

        Ok(filtered.to_string())
    } else {
        Ok(String::from("{}"))
    }
}
