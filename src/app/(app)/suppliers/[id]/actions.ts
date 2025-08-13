
'use server';

import { z } from 'zod';
import { addPiece as addPieceToDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { Piece } from '@/lib/types';

const pieceFormSchema = z.object({
  date: z.date({ required_error: 'La date est requise.' }),
  type: z.enum(['BL', 'FACTURE'], { required_error: 'Le type est requis.' }),
  total_piece: z.coerce.number().min(0, { message: 'Le total doit être positif.' }),
  montant_paye: z.coerce.number().min(0, { message: 'Le montant payé doit être positif.' }),
  description: z.string().optional(),
  supplier_id: z.string()
}).refine(data => data.montant_paye <= data.total_piece, {
    message: "Le montant payé ne peut pas dépasser le total de la pièce.",
    path: ["montant_paye"],
});

// We need to omit supplier_id from the type passed to the database function
type PieceFormValues = Omit<z.infer<typeof pieceFormSchema>, 'supplier_id'> & { supplier_id: string };


export async function addPiece(data: PieceFormValues) : Promise<{success: boolean, message?: string}> {
    const validation = pieceFormSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        const pieceData = {
            ...validation.data,
            description: validation.data.description || '',
        };
        await addPieceToDb(pieceData as Omit<Piece, 'id' | 'created_at' | 'updated_at' | 'reste'>);
        revalidatePath(`/suppliers/${validation.data.supplier_id}`);
        revalidatePath('/dashboard');
        return { success: true };
    } catch(e) {
        const error = e as Error;
        console.error(error);
        return { success: false, message: error.message || "Une erreur est survenue lors de l'ajout de la pièce." };
    }
}
