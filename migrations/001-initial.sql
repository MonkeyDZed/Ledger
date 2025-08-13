
-- Up
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  wilaya TEXT,
  phone TEXT,
  nif TEXT,
  bank_info TEXT,
  solde_initial REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE pieces (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  total_piece REAL NOT NULL,
  montant_paye REAL NOT NULL,
  reste REAL NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Down
DROP TABLE pieces;
DROP TABLE suppliers;

