
import type {Metadata} from 'next';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Inter as FontSans } from 'next/font/google';
import { Locale } from '@/i18n.config';

export const metadata: Metadata = {
  title: 'Ledger',
  description: 'Gérez vos fournisseurs et créances en toute simplicité.',
};

const fontSans = FontSans({ 
  subsets: ['latin'], 
  variable: '--font-sans' 
});

export function generateStaticParams() {
  return [{ lang: 'fr' }, { lang: 'ar' }]
}

export default function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale }
}>) {
  const lang = params.lang;
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={cn("min-h-screen bg-gray-50 font-sans antialiased", fontSans.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
