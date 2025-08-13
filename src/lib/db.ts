
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { suppliers, pieces } from './data';
import type { Supplier, Piece } from './types';
import { randomUUID } from 'crypto';


async function openDb() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });
  await db.exec('PRAGMA foreign_keys = ON;'); // Ensure foreign key constraints are enforced
  await db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
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
    CREATE TABLE IF NOT EXISTS pieces (
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
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE CASCADE
    );
  `);
  return db;
}

async function initializeData() {
    const db = await openDb();

    const supplierCountResult = await db.get('SELECT COUNT(*) as count FROM suppliers');
    const supplierCount = supplierCountResult?.count ?? 0;

    if (supplierCount === 0) {
        console.log('Seeding suppliers...');
        const stmt = await db.prepare('INSERT INTO suppliers (id, name, wilaya, phone, nif, bank_info, solde_initial, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const supplier of suppliers) {
            await stmt.run(supplier.id, supplier.name, supplier.wilaya, supplier.phone, supplier.nif, supplier.bank_info, supplier.solde_initial, supplier.notes, supplier.created_at, supplier.updated_at);
        }
        await stmt.finalize();
    }

    const pieceCountResult = await db.get('SELECT COUNT(*) as count FROM pieces');
    const pieceCount = pieceCountResult?.count ?? 0;

    if (pieceCount === 0) {
        console.log('Seeding pieces...');
        const stmt = await db.prepare('INSERT INTO pieces (id, supplier_id, date, type, total_piece, montant_paye, reste, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const piece of pieces) {
            await stmt.run(piece.id, piece.supplier_id, piece.date, piece.type, piece.total_piece, piece.montant_paye, piece.reste, piece.description, piece.created_at, piece.updated_at);
        }
        await stmt.finalize();
    }
}

// Initialize on startup
initializeData().catch(console.error);


export async function getSuppliers(): Promise<Supplier[]> {
    const db = await openDb();
    return db.all('SELECT * FROM suppliers ORDER BY created_at DESC');
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
    const db = await openDb();
    return db.get('SELECT * FROM suppliers WHERE id = ?', id);
}

export async function addSupplier(data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const db = await openDb();
    const now = new Date().toISOString();
    const newSupplier: Supplier = {
        id: randomUUID(),
        ...data,
        created_at: now,
        updated_at: now,
    };
    await db.run(
        'INSERT INTO suppliers (id, name, wilaya, phone, nif, bank_info, solde_initial, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        newSupplier.id,
        newSupplier.name,
        newSupplier.wilaya,
        newSupplier.phone,
        newSupplier.nif,
        newSupplier.bank_info,
        newSupplier.solde_initial,
        newSupplier.notes,
        newSupplier.created_at,
        newSupplier.updated_at
    );
    return newSupplier;
}

export async function updateSupplier(id: string, data: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const db = await openDb();
    const now = new Date().toISOString();
    const fields = Object.keys(data).map(field => `${field} = ?`).join(', ');
    const values = Object.values(data);
    
    await db.run(
        `UPDATE suppliers SET ${fields}, updated_at = ? WHERE id = ?`,
        ...values,
        now,
        id
    );
}

export async function deleteSupplier(id: string): Promise<void> {
    const db = await openDb();
    // Foreign key ON DELETE CASCADE will handle deleting pieces
    await db.run('DELETE FROM suppliers WHERE id = ?', id);
}


export async function getPieces(): Promise<Piece[]> {
    const db = await openDb();
    return db.all('SELECT * FROM pieces');
}

export async function getPiecesBySupplierId(supplierId: string): Promise<Piece[]> {
    const db = await openDb();
    return db.all('SELECT * FROM pieces WHERE supplier_id = ? ORDER BY date DESC', supplierId);
}

export async function addPiece(data: Omit<Piece, 'id' | 'created_at' | 'updated_at' | 'reste'>): Promise<Piece> {
    const db = await openDb();
    const now = new Date().toISOString();
    const reste = data.total_piece - data.montant_paye;
    const newPiece: Piece = {
        id: randomUUID(),
        ...data,
        reste,
        created_at: now,
        updated_at: now,
    };
    await db.run(
        'INSERT INTO pieces (id, supplier_id, date, type, total_piece, montant_paye, reste, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        newPiece.id,
        newPiece.supplier_id,
        newPiece.date.toISOString(),
        newPiece.type,
        newPiece.total_piece,
        newPiece.montant_paye,
        newPiece.reste,
        newPiece.description,
        newPiece.created_at,
        newPiece.updated_at
    );
    return newPiece;
}

export async function updatePiece(id: string, data: Partial<Omit<Piece, 'id' | 'created_at' | 'updated_at' | 'supplier_id' | 'reste'>>): Promise<void> {
    const db = await openDb();
    const now = new Date().toISOString();

    const currentPiece = await db.get('SELECT * FROM pieces WHERE id = ?', id);
    if (!currentPiece) {
        throw new Error("Piece not found");
    }

    const updatedData = { ...currentPiece, ...data };
    const reste = updatedData.total_piece - updatedData.montant_paye;

    const fields = Object.keys(data).map(field => `${field} = ?`).join(', ');
    const values = Object.values(data);

    await db.run(
        `UPDATE pieces SET ${fields}, reste = ?, updated_at = ? WHERE id = ?`,
        ...values,
        reste,
        now,
        id
    );
}

export async function deletePiece(id: string): Promise<void> {
    const db = await openDb();
    await db.run('DELETE FROM pieces WHERE id = ?', id);
}
