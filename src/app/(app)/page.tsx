// This file is no longer needed and can be deleted.
// The root page now redirects to the default locale,
// and the main dashboard is at /app/[lang]/(app)/dashboard
import { redirect } from 'next/navigation';
import { i18n } from '@/i18n.config';

export default function AppPage() {
  redirect(`/${i18n.defaultLocale}/dashboard`);
}
