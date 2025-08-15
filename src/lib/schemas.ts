
'use server';

import { z } from 'zod';
import { getDictionary } from '@/lib/dictionaries';
import { Locale, i18n } from '@/i18n.config';

// Schemas for server-side validation with localized error messages

export const getSupplierFormSchema = async (lang: Locale = i18n.defaultLocale) => {
    const dictionary = await getDictionary(lang);
    const supplierDictionary = dictionary.schemas.supplier;
    return z.object({
        name: z.string().min(2, { message: supplierDictionary.nameMin }),
        wilaya: z.string().optional(),
        phone: z.string().optional(),
        nif: z.string().optional(),
        bank_info: z.string().optional(),
        solde_initial: z.coerce.number().default(0),
        notes: z.string().optional(),
    });
};

export type SupplierFormValues = z.infer<Awaited<ReturnType<typeof getSupplierFormSchema>>>;

export const getPieceFormSchema = async (lang: Locale = i18n.defaultLocale) => {
    const dictionary = await getDictionary(lang);
    const pieceDictionary = dictionary.schemas.piece;
    return z.object({
        date: z.date({ required_error: pieceDictionary.dateRequired }),
        type: z.enum(['BL', 'FACTURE', 'VERSEMENT'], { required_error: pieceDictionary.typeRequired }),
        total_piece: z.coerce.number().min(0, { message: pieceDictionary.totalPositive }),
        montant_paye: z.coerce.number().min(0, { message: pieceDictionary.paidPositive }),
        description: z.string().optional(),
        payment_method: z.enum(['espece', 'cheque', 'virement', 'traite']).optional(),
    }).refine((data) => {
        if (data.type === 'VERSEMENT') return true;
        return data.montant_paye <= data.total_piece;
    }, {
        message: pieceDictionary.paidExceedsTotal,
        path: ["montant_paye"],
    });
};

export type PieceFormValues = z.infer<Awaited<ReturnType<typeof getPieceFormSchema>>>;


export const getAddPieceSchema = async (lang: Locale = i18n.defaultLocale) => {
    const pieceSchema = await getPieceFormSchema(lang);
    return pieceSchema.extend({
        supplier_id: z.string(),
    });
};
