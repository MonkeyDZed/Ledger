'use server';

import { z } from 'zod';
import { addSupplier as addSupplierToDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { Supplier } from '@/lib/types';

const supplierFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  wilaya: z.string().optional(),
  phone: z.string().optional(),
  nif: z.string().optional(),
  bank_info: z.string().optional(),
  solde_initial: z.coerce.number().default(0),
  notes: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;


export async function addSupplier(data: SupplierFormValues) : Promise<{success: boolean, message?: string}> {
    const validation = supplierFormSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        await addSupplierToDb(validation.data as Omit<Supplier, 'id' | 'created_at' | 'updated_at'>);
        revalidatePath('/suppliers');
        revalidatePath('/dashboard');
        return { success: true };
    } catch(e) {
        console.error(e);
        return { success: false, message: "Une erreur est survenue lors de l'ajout du fournisseur." };
    }
}
