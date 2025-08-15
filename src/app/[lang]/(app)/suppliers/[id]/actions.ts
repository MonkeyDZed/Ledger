
'use server';

import { z } from 'zod';
import { addPiece as addPieceToDb, updatePieceInDb, deletePieceFromDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getPieceFormSchema } from '@/lib/schemas';
import { getDictionary } from '@/lib/dictionaries';
import { i18n } from '@/i18n.config';


export async function addPiece(data: z.infer<ReturnType<typeof getPieceFormSchema>['addPieceSchema']>) : Promise<{success: boolean, message?: string}> {
    const dictionary = await getDictionary(i18n.defaultLocale);
    const { addPieceSchema } = getPieceFormSchema(dictionary.schemas);
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

export async function updatePiece(id: string, supplier_id: string, data: z.infer<ReturnType<typeof getPieceFormSchema>['formSchema']>): Promise<{success: boolean, message?: string}> {
    const dictionary = await getDictionary(i18n.defaultLocale);
    const { formSchema } = getPieceFormSchema(dictionary.schemas);
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
