-- Ekzekuto këtë në pgAdmin për të krijuar tabelën
CREATE TABLE IF NOT EXISTS items (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  status      VARCHAR(20) DEFAULT 'active',
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Të dhëna fillestare (opsionale)
INSERT INTO items (title, description, status) VALUES
  ('Task e parë', 'Shembull detyre', 'active'),
  ('Task e dytë', 'Detyrë tjetër shembull', 'completed');
