
import React from 'react';
import { getSuppliers, getPieces } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';
import { ReportsClientPage } from './client-page';
import type { Supplier, Piece } from '@/lib/types';

// This is a Server Component, responsible for fetching data.
export default function ReportsPage({ params: paramsProp }: { params: { lang: Locale } }) {
    const params = React.use(paramsProp);
    const suppliers = React.use(getSuppliers());
    const pieces = React.use(getPieces());
    const dictionary = React.use(getDictionary(params.lang));
  
    // The Server Component passes data to the Client Component as props.
    return (
        <ReportsClientPage 
            suppliers={suppliers} 
            pieces={pieces} 
            dictionary={dictionary.reportsPage || {}} 
            lang={params.lang}
        />
    );
}
