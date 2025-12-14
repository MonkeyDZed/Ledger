
import React from 'react';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';
import { ClientPage } from './client-page';
import { clearDatabaseAction } from './actions';

// This is a Server Component, responsible for fetching data.
export default async function SettingsPage({ params }: { params: { lang: Locale } }) {
    const dictionary = await getDictionary(params.lang);
  
    // The Server Component passes data to the Client Component as props.
    return (
        <ClientPage
            dictionary={dictionary.settingsPage || {}}
            clearDatabaseAction={clearDatabaseAction}
        />
    );
}
