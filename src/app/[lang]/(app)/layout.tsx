
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
import { motion } from 'framer-motion';
import { useState } from 'react';

const navLinks = [
  { href: '/dashboard', label: 'Tableau de bord', labelAr: 'لوحة التحكم' },
  { href: '/suppliers', label: 'Fournisseurs', labelAr: 'الموردون' },
  { href: '/pieces', label: 'Pièces', labelAr: 'المستندات' },
  { href: '/reports', label: 'Rapports', labelAr: 'التقارير' },
];

export default function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale }
}) {
  const pathname = usePathname();
  const [hoveredPath, setHoveredPath] = useState(pathname);

  const isActive = (path: string) => {
    const fullPath = `/${params.lang}${path}`;
    // Exact match for dashboard
    if (path === '/dashboard') return pathname === fullPath;
    // Starts with for others to handle sub-pages like /suppliers/[id]
    return pathname.startsWith(fullPath);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50" dir={params.lang === 'ar' ? 'rtl' : 'ltr'}>
       <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
                <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Logo />
                    </div>
                    <nav 
                      className="hidden md:ms-6 md:flex md:space-x-1 rtl:space-x-reverse relative"
                      onMouseLeave={() => setHoveredPath(pathname)}
                    >
                        {navLinks.map((link) => {
                           const fullPath = `/${params.lang}${link.href}`;
                           return (
                            <Link
                              key={link.href}
                              href={fullPath}
                              className={cn(
                                'relative rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out active:scale-95',
                                isActive(link.href)
                                  ? 'text-primary-foreground'
                                  : 'text-gray-500 hover:text-gray-900'
                              )}
                              onMouseOver={() => setHoveredPath(fullPath)}
                            >
                              {isActive(link.href) && (
                                <motion.div
                                  className="absolute inset-0 bg-primary rounded-md z-[-1]"
                                  layoutId="active-nav-link"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 350,
                                    damping: 30,
                                  }}
                                />
                              )}
                              <span>{params.lang === 'ar' ? link.labelAr : link.label}</span>
                            </Link>
                           )
                        })}
                    </nav>
                </div>
                <div className="flex items-center">
                     <Button variant="ghost" size="icon" className="bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full h-8 w-8">
                       <Search className="h-4 w-4"/>
                    </Button>
                     <Button variant="ghost" size="icon" className="ms-3 bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full h-8 w-8">
                       <Bell className="h-4 w-4"/>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <div className="ms-3 relative">
                            <button className="flex text-sm rounded-full focus:outline-none">
                                <Image className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" width={32} height={32} />
                            </button>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{params.lang === 'ar' ? 'حسابي' : 'Mon Compte'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{params.lang === 'ar' ? 'الإعدادات' : 'Paramètres'}</DropdownMenuItem>
                        <DropdownMenuItem>{params.lang === 'ar' ? 'الدعم' : 'Support'}</DropdownMenuItem>
                        <LanguageSwitcherMenu params={params} />
                        <DropdownMenuSeparator />
                        <Link href={`/${params.lang}`}>
                          <DropdownMenuItem>{params.lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</DropdownMenuItem>
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
