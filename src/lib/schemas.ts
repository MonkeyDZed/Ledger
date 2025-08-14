
import { z } from 'zod';

export const supplierFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  wilaya: z.string().optional(),
  phone: z.string().optional(),
  nif: z.string().optional(),
  bank_info: z.string().optional(),
  solde_initial: z.coerce.number().default(0),
  notes: z.string().optional(),
});


const basePieceSchema = z.object({
  date: z.date({ required_error: 'La date est requise.' }),
  type: z.enum(['BL', 'FACTURE'], { required_error: 'Le type est requis.' }),
  total_piece: z.coerce.number().min(0, { message: 'Le total doit être positif.' }),
  montant_paye: z.coerce.number().min(0, { message: 'Le montant payé doit être positif.' }),
  description: z.string().optional(),
});

// Schema for the form, without supplier_id
export const pieceFormSchema = basePieceSchema.refine(data => data.montant_paye <= data.total_piece, {
    message: "Le montant payé ne peut pas dépasser le total de la pièce.",
    path: ["montant_paye"],
});

// Schema for adding a new piece to the DB, which requires supplier_id
export const addPieceSchema = basePieceSchema.extend({
    supplier_id: z.string(),
}).refine(data => data.montant_paye <= data.total_piece, {
    message: "Le montant payé ne peut pas dépasser le total de la pièce.",
    path: ["montant_paye"],
});
