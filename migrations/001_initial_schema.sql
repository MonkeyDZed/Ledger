-- Migration 001: Initial schema
-- Creates suppliers and pieces tables

CREATE TABLE IF NOT EXISTS suppliers (
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

CREATE TABLE IF NOT EXISTS pieces (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  numero_piece TEXT,
  total_piece REAL NOT NULL,
  montant_paye REAL NOT NULL,
  reste REAL NOT NULL,
  description TEXT,
  payment_method TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
