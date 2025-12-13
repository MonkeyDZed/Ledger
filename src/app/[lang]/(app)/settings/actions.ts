
'use server';

import { clearDatabase } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function clearDatabaseAction(): Promise<{ success: boolean; message?: string }> {
    try {
        await clearDatabase();
        
        // Revalidate all paths to reflect the changes everywhere
        revalidatePath('/', 'layout');

        return { success: true };
    } catch (e) {
        const error = e as Error;
        console.error("Server error while clearing database:", error);
        return { success: false, message: "Une erreur est survenue lors de la suppression des données." };
    }
}
