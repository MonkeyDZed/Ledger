
'use server';

import { z } from 'zod';
import { addSupplier as addSupplierToDb, deleteSupplier as deleteSupplierFromDb, updateSupplier as updateSupplierInDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { Supplier } from '@/lib/types';
import { supplierFormSchema } from '@/lib/schemas';

type SupplierFormValues = z.infer<typeof supplierFormSchema>;


export async function addSupplier(data: SupplierFormValues) : Promise<{success: boolean, message?: string}> {
    const validation = supplierFormSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        await addSupplierToDb(validation.data as Omit<Supplier, 'id' | 'created_at' | 'updated_at'>);
        revalidatePath('/(.)');
        return { success: true };
    } catch(e) {
        console.error(e);
        return { success: false, message: "Une erreur est survenue lors de l'ajout du fournisseur." };
    }
}

export async function updateSupplier(id: string, data: SupplierFormValues): Promise<{success: boolean, message?: string}> {
    const validation = supplierFormSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        // Exclude fields that should not be updated directly
        const { ...updateData } = validation.data;
        
        await updateSupplierInDb(id, updateData);
        revalidatePath('/(.)');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Une erreur est survenue lors de la mise à jour du fournisseur." };
    }
}

export async function deleteSupplier(id: string): Promise<{success: boolean, message?: string}> {
    try {
        await deleteSupplierFromDb(id);
        revalidatePath('/(.)');
        return { success: true };
    } catch(e) {
        console.error(e);
        return { success: false, message: "Une erreur est survenue lors de la suppression du fournisseur." };
    }
}
