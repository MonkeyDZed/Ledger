'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { LanguageSwitcherMenu } from './components/language-switcher-menu';
import { Locale } from '@/i18n.config';

const navLinks = [
  { href: '/dashboard', label: 'Tableau de bord', labelAr: 'لوحة التحكم' },
  { href: '/suppliers', label: 'Fournisseurs', labelAr: 'الموردون' },
  { href: '/pieces', label: 'Pièces', labelAr: 'المستندات' },
  { href: '/reports', label: 'Rapports', labelAr: 'التقارير' },
];

export default function AppLayout({
  children,
  params: { lang }
}: {
  children: React.ReactNode;
  params: { lang: Locale }
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    const fullPath = `/${lang}${path}`;
    if (fullPath === `/${lang}/dashboard`) return pathname === fullPath;
    // For suppliers, we want to match /suppliers and /suppliers/[id]
    if (path === '/suppliers') return pathname.startsWith(fullPath);
    return pathname.startsWith(fullPath) && path !== '/dashboard';
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
       <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
                <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Logo />
                    </div>
                    <nav className="hidden md:ml-6 md:flex md:space-x-8">
                        {navLinks.map((link) => (
                           <Link
                              key={link.href}
                              href={`/${lang}${link.href}`}
                              className={cn(
                                'px-1 pt-1 text-sm font-medium',
                                isActive(link.href)
                                  ? 'text-primary border-b-2 border-primary'
                                  : 'text-gray-500 hover:text-gray-700'
                              )}
                            >
                              {lang === 'ar' ? link.labelAr : link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center">
                     <Button variant="ghost" size="icon" className="bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full h-8 w-8">
                       <Search className="h-4 w-4"/>
                    </Button>
                     <Button variant="ghost" size="icon" className="ml-3 bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full h-8 w-8">
                       <Bell className="h-4 w-4"/>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <div className="ml-3 relative">
                            <button className="flex text-sm rounded-full focus:outline-none">
                                <Image className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" width={32} height={32} />
                            </button>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{lang === 'ar' ? 'حسابي' : 'Mon Compte'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{lang === 'ar' ? 'الإعدادات' : 'Paramètres'}</DropdownMenuItem>
                        <DropdownMenuItem>{lang === 'ar' ? 'الدعم' : 'Support'}</DropdownMenuItem>
                        <LanguageSwitcherMenu lang={lang} />
                        <DropdownMenuSeparator />
                        <Link href={`/${lang}`}>
                          <DropdownMenuItem>{lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
