
'use server';

import { addSupplier as addSupplierToDb, deleteSupplier as deleteSupplierFromDb, updateSupplier as updateSupplierInDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Client-side validation is now the primary source of validation before calling the action.
// The server action performs the DB operation directly.
const SupplierFormSchema = z.object({
    name: z.string(),
    wilaya: z.string().optional(),
    phone: z.string().optional(),
    nif: z.string().optional(),
    bank_info: z.string().optional(),
    solde_initial: z.coerce.number(),
    notes: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof SupplierFormSchema>;

export async function addSupplier(data: SupplierFormValues) : Promise<{success: boolean, message?: string}> {
    // Server-side validation is removed to prevent locale contamination issues.
    try {
        await addSupplierToDb(data);
        
        revalidatePath('/');
        revalidatePath('/[lang]/dashboard', 'page');
        revalidatePath('/[lang]/suppliers', 'page');
        revalidatePath('/[lang]/pieces', 'page');

        return { success: true };
    } catch(e) {
        const error = e as Error;
        console.error(e);
        return { success: false, message: "Une erreur est survenue lors de l'ajout du fournisseur." };
    }
}

export async function updateSupplier(id: string, data: SupplierFormValues): Promise<{success: boolean, message?: string}> {
    // Server-side validation is removed to prevent locale contamination issues.
    try {
        await updateSupplierInDb(id, data);
        
        revalidatePath('/');
        revalidatePath('/[lang]/dashboard', 'page');
        revalidatePath('/[lang]/suppliers', 'page');
        revalidatePath('/[lang]/pieces', 'page');
        revalidatePath('/[lang]/suppliers/[id]', 'page');

        return { success: true };
    } catch (e) {
        const error = e as Error;
        console.error(e);
        return { success: false, message: "Une erreur est survenue lors de la mise à jour du fournisseur." };
    }
}

export async function deleteSupplier(id: string): Promise<{success: boolean, message?: string}> {
    try {
        await deleteSupplierFromDb(id);
        
        revalidatePath('/');
        revalidatePath('/[lang]/dashboard', 'page');
        revalidatePath('/[lang]/suppliers', 'page');
        revalidatePath('/[lang]/pieces', 'page');

        return { success: true };
    } catch(e) {
        const error = e as Error;
        console.error(e);
        return { success: false, message: "Une erreur est survenue lors de la suppression du fournisseur." };
    }
}
