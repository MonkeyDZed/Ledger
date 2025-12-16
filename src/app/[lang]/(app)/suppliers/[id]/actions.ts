
'use server';

import { z } from 'zod';
import { addPieceToDb, updatePieceInDb, deletePieceFromDb, executeTransaction } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';

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
    supplier_id: z.string().min(1, "Le fournisseur est obligatoire."),
    lang: z.custom<Locale>(),
});

type PieceFormValues = Omit<z.infer<typeof PieceSchema>, 'supplier_id' | 'lang'>;

export async function addPiece(data: z.infer<typeof PieceSchema>) : Promise<{success: boolean, message?: string}> {
    const validation = PieceSchema.safeParse(data);
    if (!validation.success) {
        console.error("Validation Zod côté serveur échouée :", validation.error.flatten().fieldErrors);
        return { success: false, message: 'Invalid data provided.' };
    }
    
    try {
        const { type, total_piece = 0, montant_paye = 0, lang } = validation.data;
        const dictionary = await getDictionary(lang);
        const surplusDescription = dictionary.supplierDetailPage.form.surplusDescription || 'Excédent de paiement';


        // Si le paiement est supérieur au total de la pièce (uniquement pour Facture/BL)
        if (type !== 'VERSEMENT' && montant_paye > total_piece) {
            const surplus = montant_paye - total_piece;

            // Données pour la pièce principale (Facture/BL)
            const mainPieceData = {
                ...validation.data,
                date: validation.data.date.toISOString(),
                total_piece: total_piece,
                montant_paye: total_piece, // La pièce est soldée
            };

            // Données pour le versement excédentaire
            const surplusVersementData = {
                supplier_id: validation.data.supplier_id,
                date: validation.data.date.toISOString(),
                type: 'VERSEMENT' as const,
                numero_piece: '',
                total_piece: 0,
                montant_paye: surplus,
                description: surplusDescription,
                payment_method: validation.data.payment_method,
            };

            // Exécuter les deux insertions dans une transaction
            await executeTransaction(async (db) => {
                await addPieceToDb(mainPieceData, db);
                await addPieceToDb(surplusVersementData, db);
            });

        } else {
            // Logique normale pour un paiement simple ou un versement
             await addPieceToDb({
                ...validation.data,
                date: validation.data.date.toISOString(),
                total_piece: validation.data.type === 'VERSEMENT' ? 0 : (validation.data.total_piece ?? 0),
            });
        }
        
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
    const validation = PieceSchema.omit({ supplier_id: true, lang: true }).safeParse(data);
    if (!validation.success) {
        return { success: false, message: 'Invalid data provided.' };
    }
    try {
        await updatePieceInDb(id, {
            ...validation.data,
            date: validation.data.date.toISOString()
        });

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
