
import React from 'react';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';
import { ClientPage } from './client-page';
import { clearDatabaseAction } from './actions';

// This is a Server Component, responsible for fetching data.
export default async function SettingsPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
  
    // The Server Component passes data to the Client Component as props.
    return (
        <ClientPage
            dictionary={dictionary.settingsPage || {}}
            clearDatabaseAction={clearDatabaseAction}
        />
    );
}
