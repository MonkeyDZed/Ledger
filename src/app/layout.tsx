import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Ledger Louhibi',
  description: 'Gérez vos fournisseurs et créances en toute simplicité.',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-gray-50 font-sans antialiased", inter.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
