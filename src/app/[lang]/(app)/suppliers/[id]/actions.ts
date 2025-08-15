
'use server';

import { z } from 'zod';
import { addPieceToDb, updatePieceInDb, deletePieceFromDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { i18n } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionaries';

type PieceFormValues = {
    date: Date;
    type: 'BL' | 'FACTURE' | 'VERSEMENT';
    total_piece?: number;
    montant_paye: number;
    description?: string;
    payment_method?: 'espece' | 'cheque' | 'virement' | 'traite';
};

export async function addPiece(data: PieceFormValues & { supplier_id: string }) : Promise<{success: boolean, message?: string}> {
    const lang = i18n.defaultLocale;
    const dictionary = await getDictionary(lang);
    const pieceDictionary = dictionary.schemas.piece;
    
    const AddPieceSchema = z.object({
        date: z.date({ required_error: pieceDictionary.dateRequired }),
        type: z.enum(['BL', 'FACTURE', 'VERSEMENT'], { required_error: pieceDictionary.typeRequired }),
        total_piece: z.coerce.number().min(0, { message: pieceDictionary.totalPositive }).optional().or(z.literal(0)),
        montant_paye: z.coerce.number().min(0, { message: pieceDictionary.paidPositive }),
        description: z.string().optional(),
        supplier_id: z.string(),
        payment_method: z.enum(['espece', 'cheque', 'virement', 'traite']).optional(),
    }).refine((data) => {
        if (data.type === 'VERSEMENT') return true;
        return data.montant_paye <= (data.total_piece ?? 0);
    }, {
        message: pieceDictionary.paidExceedsTotal,
        path: ["montant_paye"],
    });
    
    const validation = AddPieceSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        await addPieceToDb(validation.data);
        
        revalidatePath('/');
        revalidatePath('/[lang]/dashboard', 'page');
        revalidatePath('/[lang]/suppliers', 'page');
        revalidatePath('/[lang]/pieces', 'page');
        revalidatePath('/[lang]/suppliers/[id]', 'page');

        return { success: true };
    } catch(e) {
        const error = e as Error;
        console.error(error);
        return { success: false, message: "Une erreur est survenue lors de l'ajout de la pièce." };
    }
}

export async function updatePiece(id: string, supplier_id: string, data: PieceFormValues): Promise<{success: boolean, message?: string}> {
    const lang = i18n.defaultLocale;
    const dictionary = await getDictionary(lang);
    const pieceDictionary = dictionary.schemas.piece;

    const UpdatePieceSchema = z.object({
        date: z.date({ required_error: pieceDictionary.dateRequired }),
        type: z.enum(['BL', 'FACTURE', 'VERSEMENT'], { required_error: pieceDictionary.typeRequired }),
        total_piece: z.coerce.number().min(0, { message: pieceDictionary.totalPositive }).optional().or(z.literal(0)),
        montant_paye: z.coerce.number().min(0, { message: pieceDictionary.paidPositive }),
        description: z.string().optional(),
        payment_method: z.enum(['espece', 'cheque', 'virement', 'traite']).optional(),
    }).refine((data) => {
        if (data.type === 'VERSEMENT') return true;
        return data.montant_paye <= (data.total_piece ?? 0);
    }, {
        message: pieceDictionary.paidExceedsTotal,
        path: ["montant_paye"],
    });
    
    const validation = UpdatePieceSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        await updatePieceInDb(id, validation.data);
        
        revalidatePath('/');
        revalidatePath('/[lang]/dashboard', 'page');
        revalidatePath('/[lang]/suppliers', 'page');
        revalidatePath('/[lang]/pieces', 'page');
        revalidatePath('/[lang]/suppliers/[id]', 'page');

        return { success: true };
    } catch (e) {
        const error = e as Error;
        console.error(e);
        return { success: false, message: error.message || "Une erreur est survenue lors de la mise à jour de la pièce." };
    }
}

export async function deletePiece(id: string, supplier_id: string): Promise<{success: boolean, message?: string}> {
    try {
        await deletePieceFromDb(id);
        
        revalidatePath('/');
        revalidatePath('/[lang]/dashboard', 'page');
        revalidatePath('/[lang]/suppliers', 'page');
        revalidatePath('/[lang]/pieces', 'page');
        revalidatePath('/[lang]/suppliers/[id]', 'page');
        
        return { success: true };
    } catch (e) {
        const error = e as Error;
        console.error(e);
        return { success: false, message: error.message || "Une erreur est survenue lors de la suppression de la pièce." };
    }
}
