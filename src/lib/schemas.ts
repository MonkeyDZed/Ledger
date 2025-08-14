
import { z } from 'zod';
import type { Dictionary } from './dictionaries';

type SchemaDictionary = Dictionary['schemas'];

export const getSupplierFormSchema = (dictionary: SchemaDictionary) => {
    return z.object({
        name: z.string().min(2, { message: dictionary.supplier.nameMin }),
        wilaya: z.string().optional(),
        phone: z.string().optional(),
        nif: z.string().optional(),
        bank_info: z.string().optional(),
        solde_initial: z.coerce.number().default(0),
        notes: z.string().optional(),
    });
}

export const getPieceFormSchema = (dictionary: SchemaDictionary) => {
    const baseSchema = z.object({
        date: z.date({ required_error: dictionary.piece.dateRequired }),
        type: z.enum(['BL', 'FACTURE'], { required_error: dictionary.piece.typeRequired }),
        total_piece: z.coerce.number().min(0, { message: dictionary.piece.totalPositive }),
        montant_paye: z.coerce.number().min(0, { message: dictionary.piece.paidPositive }),
        description: z.string().optional(),
    });

    const formSchema = baseSchema.refine(data => data.montant_paye <= data.total_piece, {
        message: dictionary.piece.paidExceedsTotal,
        path: ["montant_paye"],
    });

    return {
        baseSchema,
        formSchema,
        addPieceSchema: formSchema.extend({
             supplier_id: z.string(),
        })
    };
};
