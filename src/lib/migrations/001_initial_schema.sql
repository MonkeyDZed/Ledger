-- Version 1: Initial Schema

-- Create the suppliers table to store information about each supplier.
CREATE TABLE suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    wilaya TEXT,
    phone TEXT,
    nif TEXT,
    bank_info TEXT,
    solde_initial REAL NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create the pieces table for all financial transactions related to suppliers.
-- It is linked to the suppliers table via a foreign key.
CREATE TABLE pieces (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL, -- Can be 'FACTURE', 'BL', or 'VERSEMENT'
    total_piece REAL NOT NULL,
    montant_paye REAL NOT NULL,
    reste REAL NOT NULL,
    description TEXT,
    payment_method TEXT, -- Can be 'espece', 'cheque', 'virement', 'traite'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE CASCADE
);
