
'use server';

import { z } from 'zod';
import { addPieceToDb, updatePieceInDb, deletePieceFromDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// This is a server-action-safe schema. It will not be imported by any client components.
const PieceSchema = z.object({
    date: z.date(),
    type: z.enum(['BL', 'FACTURE', 'VERSEMENT']),
    numero_piece: z.string().optional(),
    total_piece: z.coerce.number().optional(),
    montant_paye: z.coerce.number(),
    description: z.string().optional(),
    payment_method: z.union([
        z.enum(['espece', 'cheque', 'virement', 'traite']),
        z.literal('').transform(() => undefined),
        z.null().transform(() => undefined),
    ]).optional(),
    supplier_id: z.string().min(1, "Le fournisseur est obligatoire."), // Supplier ID is now mandatory
});

type PieceFormValues = Omit<z.infer<typeof PieceSchema>, 'supplier_id'>;

export async function addPiece(data: z.infer<typeof PieceSchema>) : Promise<{success: boolean, message?: string}> {
    const validation = PieceSchema.safeParse(data);
    if (!validation.success) {
        // This should not happen if client-side validation is working
        console.error("Validation Zod côté serveur échouée :", validation.error.flatten().fieldErrors);
        return { success: false, message: 'Invalid data provided.' };
    }
    try {
        // Ensure total_piece is 0 if it's not provided (especially for 'VERSEMENT')
        const dataForDb = {
            ...validation.data,
            total_piece: validation.data.type === 'VERSEMENT' ? 0 : (validation.data.total_piece ?? 0),
            montant_paye: validation.data.montant_paye ?? 0,
            description: validation.data.description ?? '',
            payment_method: validation.data.payment_method ?? null,
            numero_piece: validation.data.numero_piece ?? '',
        };

        await addPieceToDb(dataForDb);
        
        revalidatePath('/');
        revalidatePath('/[lang]/dashboard', 'page');
        revalidatePath('/[lang]/suppliers', 'page');
        revalidatePath('/[lang]/pieces', 'page');
        revalidatePath('/[lang]/suppliers/[id]', 'page');

        return { success: true };
    } catch(e) {
        const error = e as Error;
        console.error("Erreur serveur lors de l'ajout d'une pièce :", error);
        return { success: false, message: "Une erreur est survenue lors de l'ajout de la pièce." };
    }
}

export async function updatePiece(id: string, supplier_id: string, data: PieceFormValues): Promise<{success: boolean, message?: string}> {
    const validation = PieceSchema.omit({ supplier_id: true }).safeParse(data);
    if (!validation.success) {
        return { success: false, message: 'Invalid data provided.' };
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
