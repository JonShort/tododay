CREATE TABLE ordering(
  order_id INTEGER NOT NULL,
  current TEXT NOT NULL,
  PRIMARY KEY(order_id)
);

INSERT INTO ordering (order_id, current) VALUES (1, '[]');
