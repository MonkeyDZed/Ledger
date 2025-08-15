
'use server';

import { addSupplier as addSupplierToDb, deleteSupplier as deleteSupplierFromDb, updateSupplier as updateSupplierInDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { i18n } from '@/i18n.config';

type SupplierFormValues = {
    name: string;
    wilaya?: string;
    phone?: string;
    nif?: string;
    bank_info?: string;
    solde_initial: number;
    notes?: string;
};

export async function addSupplier(data: SupplierFormValues) : Promise<{success: boolean, message?: string}> {
    const { getDictionary } = await import('@/lib/dictionaries');
    const lang = i18n.defaultLocale;
    const dictionary = await getDictionary(lang);
    const supplierDictionary = dictionary.schemas.supplier;
    
    const AddSupplierSchema = z.object({
        name: z.string().min(2, { message: supplierDictionary.nameMin }),
        wilaya: z.string().optional(),
        phone: z.string().optional(),
        nif: z.string().optional(),
        bank_info: z.string().optional(),
        solde_initial: z.coerce.number().default(0),
        notes: z.string().optional(),
    });

    const validation = AddSupplierSchema.safeParse(data);
    
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

export async function updateSupplier(id: string, data: SupplierFormValues): Promise<{success: boolean, message?: string}> {
    const { getDictionary } = await import('@/lib/dictionaries');
    const lang = i18n.defaultLocale;
    const dictionary = await getDictionary(lang);
    const supplierDictionary = dictionary.schemas.supplier;

    const UpdateSupplierSchema = z.object({
        name: z.string().min(2, { message: supplierDictionary.nameMin }),
        wilaya: z.string().optional(),
        phone: z.string().optional(),
        nif: z.string().optional(),
        bank_info: z.string().optional(),
        solde_initial: z.coerce.number().default(0),
        notes: z.string().optional(),
    });

    const validation = UpdateSupplierSchema.safeParse(data);

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
