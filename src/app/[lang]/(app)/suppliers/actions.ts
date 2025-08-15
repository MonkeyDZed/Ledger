
'use server';

import { z } from 'zod';
import { addSupplier as addSupplierToDb, deleteSupplier as deleteSupplierFromDb, updateSupplier as updateSupplierInDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSupplierBaseSchema } from '@/lib/schemas';
import { getDictionary } from '@/lib/dictionaries';
import { Locale, i18n } from '@/i18n.config';

// This function returns a Zod schema configured with dictionary messages.
// It is a 'server-only' function because it depends on `getDictionary`.
const getSupplierFormSchema = async (lang: Locale = i18n.defaultLocale) => {
    const dictionary = await getDictionary(lang);
    return getSupplierBaseSchema(dictionary.schemas);
}

export async function addSupplier(data: z.infer<Awaited<ReturnType<typeof getSupplierFormSchema>>>) : Promise<{success: boolean, message?: string}> {
    const supplierFormSchema = await getSupplierFormSchema(); // Uses default locale
    const validation = supplierFormSchema.safeParse(data);
    
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        await addSupplierToDb(validation.data);
        
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

export async function updateSupplier(id: string, data: z.infer<Awaited<ReturnType<typeof getSupplierFormSchema>>>): Promise<{success: boolean, message?: string}> {
    const supplierFormSchema = await getSupplierFormSchema(); // Uses default locale
    const validation = supplierFormSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        await updateSupplierInDb(id, validation.data);
        
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

    