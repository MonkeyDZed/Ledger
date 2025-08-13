
'use client';
import { redirect } from 'next/navigation'
// This is a catch-all component to redirect from old non-localized routes
export default function AppLayout() {
    redirect('/fr/dashboard')
}
