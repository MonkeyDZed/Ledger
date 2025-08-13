
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { suppliers, pieces } from './data';
import type { Supplier, Piece } from './types';

async function openDb() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });
  await db.migrate({ force: process.env.NODE_ENV === 'development' });
  return db;
}

async function initializeData() {
    const db = await openDb();

    const supplierCount = await db.get('SELECT COUNT(*) as count FROM suppliers');
    if (supplierCount.count === 0) {
        console.log('Seeding suppliers...');
        const stmt = await db.prepare('INSERT INTO suppliers (id, name, wilaya, phone, nif, bank_info, solde_initial, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const supplier of suppliers) {
            await stmt.run(supplier.id, supplier.name, supplier.wilaya, supplier.phone, supplier.nif, supplier.bank_info, supplier.solde_initial, supplier.notes, supplier.created_at, supplier.updated_at);
        }
        await stmt.finalize();
    }

    const pieceCount = await db.get('SELECT COUNT(*) as count FROM pieces');
    if (pieceCount.count === 0) {
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
    return db.all('SELECT * FROM suppliers');
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
    const db = await openDb();
    return db.get('SELECT * FROM suppliers WHERE id = ?', id);
}

export async function getPieces(): Promise<Piece[]> {
    const db = await openDb();
    return db.all('SELECT * FROM pieces');
}

export async function getPiecesBySupplierId(supplierId: string): Promise<Piece[]> {
    const db = await openDb();
    return db.all('SELECT * FROM pieces WHERE supplier_id = ?', supplierId);
}
