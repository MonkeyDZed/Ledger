
'use server';

import { z } from 'zod';
import { addPiece as addPieceToDb, updatePieceInDb, deletePieceFromDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { Piece } from '@/lib/types';
import { Locale } from '@/i18n.config';

const pieceFormSchema = z.object({
  date: z.date({ required_error: 'La date est requise.' }),
  type: z.enum(['BL', 'FACTURE'], { required_error: 'Le type est requis.' }),
  total_piece: z.coerce.number().min(0, { message: 'Le total doit être positif.' }),
  montant_paye: z.coerce.number().min(0, { message: 'Le montant payé doit être positif.' }),
  description: z.string().optional(),
}).refine(data => data.montant_paye <= data.total_piece, {
    message: "Le montant payé ne peut pas dépasser le total de la pièce.",
    path: ["montant_paye"],
});

const addPieceSchema = pieceFormSchema.extend({
    supplier_id: z.string(),
});


export async function addPiece(data: z.infer<typeof addPieceSchema>, lang: Locale) : Promise<{success: boolean, message?: string}> {
    const validation = addPieceSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        const { supplier_id, ...pieceData } = validation.data;
        await addPieceToDb({ 
            ...pieceData,
            supplier_id: supplier_id,
            description: pieceData.description || '',
        });
        revalidatePath(`/${lang}/suppliers/${data.supplier_id}`);
        revalidatePath(`/${lang}/dashboard`);
        revalidatePath(`/${lang}/pieces`);
        return { success: true };
    } catch(e) {
        const error = e as Error;
        console.error(error);
        return { success: false, message: error.message || "Une erreur est survenue lors de l'ajout de la pièce." };
    }
}

export async function updatePiece(id: string, supplier_id: string, data: z.infer<typeof pieceFormSchema>, lang: Locale): Promise<{success: boolean, message?: string}> {
    const validation = pieceFormSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const pieceData = {
            ...validation.data,
            date: validation.data.date.toISOString(),
            description: validation.data.description || '',
        };
        await updatePieceInDb(id, pieceData);
        revalidatePath(`/${lang}/suppliers/${supplier_id}`);
        revalidatePath(`/${lang}/dashboard`);
        revalidatePath(`/${lang}/pieces`);
        return { success: true };
    } catch (e) {
        const error = e as Error;
        console.error(e);
        return { success: false, message: error.message || "Une erreur est survenue lors de la mise à jour de la pièce." };
    }
}

export async function deletePiece(id: string, supplier_id: string, lang: Locale): Promise<{success: boolean, message?: string}> {
    try {
        await deletePieceFromDb(id);
        revalidatePath(`/${lang}/suppliers/${supplier_id}`);
        revalidatePath(`/${lang}/dashboard`);
        revalidatePath(`/${lang}/pieces`);
        return { success: true };
    } catch (e) {
        const error = e as Error;
        console.error(e);
        return { success: false, message: error.message || "Une erreur est survenue lors de la suppression de la pièce." };
    }
}

