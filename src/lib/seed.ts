
import type { Database } from 'sqlite';
import { randomUUID } from 'crypto';
import type { Supplier, Piece } from './types';

const WILAYAS = ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane"];
const SUPPLIER_NAMES = ["Global Tech", "Innovate SARL", "BuildPro", "Solutions IT", "Fournitures Express", "Alpha Distribution", "Oran Import", "Est Services", "Sahara Logistique", "Méditerranée Trade"];
const NAME_SUFFIXES = ["& Fils", "Group", "Services", "Distribution", "Company", "et Associés"];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generatePhoneNumber = () => `0${[5,6,7][Math.floor(Math.random()*3)]}${Math.floor(Math.random() * 89) + 10}-${Math.floor(Math.random() * 89) + 10}-${Math.floor(Math.random() * 89) + 10}-${Math.floor(Math.random() * 89) + 10}`;
const generateNIF = () => Math.floor(Math.random() * 1e15).toString().padStart(15, '0');
const generateBankInfo = () => `CPA-${Math.floor(Math.random() * 1e18).toString().padStart(20, '0')}`;

const generateSuppliers = (count: number): Supplier[] => {
  const suppliers: Supplier[] = [];
  for (let i = 0; i < count; i++) {
    const now = new Date().toISOString();
    suppliers.push({
      id: randomUUID(),
      name: `${getRandom(SUPPLIER_NAMES)} ${getRandom(NAME_SUFFIXES)}`,
      wilaya: getRandom(WILAYAS),
      phone: generatePhoneNumber(),
      nif: generateNIF(),
      bank_info: generateBankInfo(),
      solde_initial: Math.random() > 0.7 ? Math.floor(Math.random() * 200000) - 50000 : 0,
      notes: 'Fournisseur généré automatiquement.',
      created_at: now,
      updated_at: now,
    });
  }
  return suppliers;
};

const generatePieces = (suppliers: Supplier[], piecesPerSupplier: number): Piece[] => {
    const pieces: Piece[] = [];
    for (const supplier of suppliers) {
        for (let i = 0; i < piecesPerSupplier; i++) {
            const now = new Date();
            const date = new Date(now.getTime() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString();
            const type = Math.random() > 0.2 ? (Math.random() > 0.5 ? 'FACTURE' : 'BL') : 'VERSEMENT';
            
            let total_piece = 0;
            let montant_paye = 0;

            if (type !== 'VERSEMENT') {
                total_piece = Math.floor(Math.random() * 25000) + 5000;
                montant_paye = Math.random() > 0.4 ? total_piece : Math.floor(Math.random() * total_piece);
            } else {
                montant_paye = Math.floor(Math.random() * 15000) + 2000;
            }

            pieces.push({
                id: randomUUID(),
                supplier_id: supplier.id,
                date,
                type,
                total_piece,
                montant_paye,
                reste: total_piece - montant_paye,
                description: `Pièce de test ${i + 1}`,
                payment_method: type === 'VERSEMENT' ? getRandom(['espece', 'cheque', 'virement']) : undefined,
                created_at: date,
                updated_at: date,
            });
        }
    }
    return pieces;
};

export const seedDatabase = async (db: Database) => {
    const suppliers = generateSuppliers(50);
    const pieces = generatePieces(suppliers, 5);

    await db.exec('BEGIN TRANSACTION;');
    try {
        for (const supplier of suppliers) {
             await db.run(
                'INSERT INTO suppliers (id, name, wilaya, phone, nif, bank_info, solde_initial, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                supplier.id, supplier.name, supplier.wilaya, supplier.phone, supplier.nif, supplier.bank_info, supplier.solde_initial, supplier.notes, supplier.created_at, supplier.updated_at
            );
        }
        for (const piece of pieces) {
             await db.run(
                'INSERT INTO pieces (id, supplier_id, date, type, total_piece, montant_paye, reste, description, payment_method, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                piece.id, piece.supplier_id, piece.date, piece.type, piece.total_piece, piece.montant_paye, piece.reste, piece.description, piece.payment_method, piece.created_at, piece.updated_at
            );
        }
        await db.exec('COMMIT;');
    } catch (e) {
        await db.exec('ROLLBACK;');
        console.error("Failed to seed database:", e);
    }
};
