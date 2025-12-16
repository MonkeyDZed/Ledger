
import React from 'react';
import { getSuppliers, getPieces } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';
import { ReportsClientPage } from './client-page';

// This is a Server Component, responsible for fetching data.
export default async function ReportsPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const suppliers = await getSuppliers();
    const pieces = await getPieces();
    const dictionary = await getDictionary(lang);

    // The Server Component passes data to the Client Component as props.
    return (
        <ReportsClientPage
            suppliers={suppliers}
            pieces={pieces}
            dictionary={dictionary.reportsPage || {}}
            lang={lang}
        />
    );
}
