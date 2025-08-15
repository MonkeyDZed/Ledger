
'use server';

import { z } from 'zod';
import { addPiece as addPieceToDb, updatePieceInDb, deletePieceFromDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getDictionary } from '@/lib/dictionaries';
import { Locale, i18n } from '@/i18n.config';


// This function returns a Zod schema configured with dictionary messages.
// It is defined directly within the server action file to ensure no client-side code can import it.
const getPieceFormSchema = async (lang: Locale = i18n.defaultLocale) => {
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

type PieceFormValues = z.infer<Awaited<ReturnType<typeof getPieceFormSchema>>>;

const getAddPieceSchema = async (lang: Locale = i18n.defaultLocale) => {
    const pieceSchema = await getPieceFormSchema(lang);
    return pieceSchema.extend({
        supplier_id: z.string(),
    });
};

type AddPieceValues = z.infer<Awaited<ReturnType<typeof getAddPieceSchema>>>;

export async function addPiece(data: AddPieceValues) : Promise<{success: boolean, message?: string}> {
    const addPieceSchema = await getAddPieceSchema(); // Uses default locale
    const validation = addPieceSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        const { supplier_id, ...pieceData } = validation.data;
        await addPieceToDb({ 
            ...pieceData,
            supplier_id: supplier_id,
        });
        
        revalidatePath('/');
        revalidatePath('/[lang]/dashboard', 'page');
        revalidatePath('/[lang]/suppliers', 'page');
        revalidatePath('/[lang]/pieces', 'page');
        revalidatePath('/[lang]/suppliers/[id]', 'page');

        return { success: true };
    } catch(e) {
        const error = e as Error;
        console.error(error);
        return { success: false, message: error.message || "Une erreur est survenue lors de l'ajout de la pièce." };
    }
}

export async function updatePiece(id: string, supplier_id: string, data: PieceFormValues): Promise<{success: boolean, message?: string}> {
    const formSchema = await getPieceFormSchema(); // Uses default locale
    const validation = formSchema.safeParse(data);

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
