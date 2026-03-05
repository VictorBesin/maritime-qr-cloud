CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rank VARCHAR(100) NOT NULL,
  access_code VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE vessels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  imo VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE qr_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE clock_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  qr_type_id INT REFERENCES qr_types(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  client_id VARCHAR(255) UNIQUE NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monthly_records (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  month INT NOT NULL,
  year INT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO qr_types (name, description) VALUES
('Bridge', 'Bridge Watchkeeping'),
('Engine', 'Engine Room Watchkeeping'),
('Cargo', 'Port Cargo Operations'),
('General', 'General Maintenance');

INSERT INTO users (name, rank, access_code) VALUES ('Demo Seafarer', 'Chief Officer', '1234');
