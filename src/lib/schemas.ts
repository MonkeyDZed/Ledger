
import { z } from 'zod';

// This file defines schema CREATION functions.
// These functions are designed to be called from server-side code (like Server Actions)
// and require a dictionary object to provide localized error messages.
// They should NOT be imported directly into client components.

export const getSupplierBaseSchema = (dictionary: any) => z.object({
    name: z.string().min(2, { message: dictionary.supplier.nameMin }),
    wilaya: z.string().optional(),
    phone: z.string().optional(),
    nif: z.string().optional(),
    bank_info: z.string().optional(),
    solde_initial: z.coerce.number().default(0),
    notes: z.string().optional(),
});

export const getPieceBaseSchema = (dictionary: any) => {
    const baseSchema = z.object({
        date: z.date({ required_error: dictionary.piece.dateRequired }),
        type: z.enum(['BL', 'FACTURE', 'VERSEMENT'], { required_error: dictionary.piece.typeRequired }),
        total_piece: z.coerce.number().min(0, { message: dictionary.piece.totalPositive }),
        montant_paye: z.coerce.number().min(0, { message: dictionary.piece.paidPositive }),
        description: z.string().optional(),
        payment_method: z.enum(['espece', 'cheque', 'virement', 'traite']).optional(),
    });

    return baseSchema.refine((data) => {
        if (data.type === 'VERSEMENT') return true;
        return data.montant_paye <= data.total_piece;
    }, {
        message: dictionary.piece.paidExceedsTotal,
        path: ["montant_paye"],
    });
};

    