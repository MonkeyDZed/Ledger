
import { redirect } from 'next/navigation';

// This is the root page, it redirects to the default locale.
// The actual login page is at /app/[lang]/page.tsx
export default function RootPage() {
  redirect('/fr');
}
