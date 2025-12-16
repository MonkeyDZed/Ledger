-- Version 1: Schéma initial de la base de données

-- Crée la table des fournisseurs si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    wilaya TEXT,
    phone TEXT,
    nif TEXT,
    bank_info TEXT,
    solde_initial REAL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Crée la table des pièces si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS pieces (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('BL', 'FACTURE', 'VERSEMENT')),
    total_piece REAL DEFAULT 0,
    montant_paye REAL DEFAULT 0,
    reste REAL DEFAULT 0,
    description TEXT,
    payment_method TEXT CHECK(payment_method IS NULL OR payment_method IN ('espece', 'cheque', 'virement', 'traite')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);
