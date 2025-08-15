
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import type { Supplier, Piece } from './types';
import { randomUUID } from 'crypto';

let dbInstance: Awaited<ReturnType<typeof open>> | null = null;

async function initializeDb() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON;');

  const tablesExist = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='suppliers'");
  
  if (!tablesExist) {
    console.log('Database not found, initializing...');
    await db.exec(`
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
    `);
    await db.exec(`
        CREATE TABLE pieces (
            id TEXT PRIMARY KEY,
            supplier_id TEXT NOT NULL,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            total_piece REAL NOT NULL,
            montant_paye REAL NOT NULL,
            reste REAL NOT NULL,
            description TEXT,
            payment_method TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE CASCADE
        );
    `);
     console.log('--- Database initialized successfully. ---');
  } else {
    console.log('Database found. Checking for migrations...');
    // Migration for payment_method column if it doesn't exist
    const piecesCols = await db.all("PRAGMA table_info(pieces);");
    if (!piecesCols.some(col => col.name === 'payment_method')) {
        console.log('Adding payment_method column to pieces table.');
        await db.exec('ALTER TABLE pieces ADD COLUMN payment_method TEXT');
    }
  }

  return db;
}


async function getDb() {
    if (!dbInstance) {
        dbInstance = await initializeDb();
    }
    return dbInstance;
}


export async function getSuppliers(): Promise<Supplier[]> {
    const db = await getDb();
    return db.all('SELECT * FROM suppliers ORDER BY created_at DESC');
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
    const db = await getDb();
    return db.get('SELECT * FROM suppliers WHERE id = ?', id);
}

type NewSupplierData = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;

export async function addSupplier(data: NewSupplierData): Promise<Supplier> {
    const db = await getDb();
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

export async function updateSupplier(id: string, data: Partial<NewSupplierData>): Promise<void> {
    const db = await getDb();
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
    const db = await getDb();
    await db.run('DELETE FROM suppliers WHERE id = ?', id);
}


export async function getPieces(): Promise<Piece[]> {
    const db = await getDb();
    return db.all('SELECT * FROM pieces');
}

export async function getPiecesBySupplierId(supplierId: string): Promise<Piece[]> {
    const db = await getDb();
    return db.all('SELECT * FROM pieces WHERE supplier_id = ? ORDER BY date DESC', supplierId);
}

type NewPieceData = Omit<Piece, 'id' | 'created_at' | 'updated_at' | 'reste'>;
export async function addPieceToDb(data: NewPieceData): Promise<Piece> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const total_piece = data.type === 'VERSEMENT' ? 0 : data.total_piece;
    const reste = total_piece - data.montant_paye;

    const newPiece: Piece = {
        id: randomUUID(),
        ...data,
        date: typeof data.date === 'string' ? data.date : new Date(data.date).toISOString(),
        total_piece,
        reste,
        description: data.description ?? '',
        created_at: now,
        updated_at: now,
    };
    await db.run(
        'INSERT INTO pieces (id, supplier_id, date, type, total_piece, montant_paye, reste, description, payment_method, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        newPiece.id,
        newPiece.supplier_id,
        newPiece.date,
        newPiece.type,
        newPiece.total_piece,
        newPiece.montant_paye,
        newPiece.reste,
        newPiece.description,
        newPiece.payment_method,
        newPiece.created_at,
        newPiece.updated_at
    );
    return newPiece;
}

type UpdatePieceData = Partial<Omit<Piece, 'id' | 'created_at' | 'updated_at' | 'supplier_id' | 'reste'>>;
export async function updatePieceInDb(id: string, data: UpdatePieceData): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();

    const currentPiece = await db.get('SELECT * FROM pieces WHERE id = ?', id);
    if (!currentPiece) {
        throw new Error("Piece not found");
    }

    const mergedData = { ...currentPiece, ...data };
    
    const total_piece = mergedData.type === 'VERSEMENT' ? 0 : (data.total_piece ?? currentPiece.total_piece);
    const montant_paye = data.montant_paye ?? currentPiece.montant_paye;
    const reste = total_piece - montant_paye;

    const updatePayload: Record<string, any> = { ...data };
    if (data.total_piece !== undefined || data.montant_paye !== undefined) {
        updatePayload.reste = reste;
    }
     if (updatePayload.date && updatePayload.date instanceof Date) {
        updatePayload.date = updatePayload.date.toISOString();
    }


    const fieldEntries = Object.entries(updatePayload);

    const setClause = fieldEntries.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldEntries.map(([, value]) => value);

    if (setClause) {
        await db.run(
            `UPDATE pieces SET ${setClause}, updated_at = ? WHERE id = ?`,
            ...values,
            now,
            id
        );
    }
}

export async function deletePieceFromDb(id: string): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM pieces WHERE id = ?', id);
}
