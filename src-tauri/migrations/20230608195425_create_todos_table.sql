CREATE TABLE todos(
  todo_id TEXT NOT NULL,
  is_complete INTEGER NOT NULL,
  content TEXT NOT NULL,
  modify_date TEXT NOT NULL,
  create_date TEXT NOT NULL,
  PRIMARY KEY(todo_id),
  FOREIGN KEY(create_date) REFERENCES dates(iso_date),
  FOREIGN KEY(modify_date) REFERENCES dates(iso_date)
);
