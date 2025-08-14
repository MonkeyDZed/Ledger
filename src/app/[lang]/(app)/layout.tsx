
'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
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
import { motion } from 'framer-motion';
import { useState } from 'react';

type Locale = 'fr' | 'ar';

const navLinks = [
  { href: '/dashboard', label: 'Tableau de bord', labelAr: 'لوحة التحكم' },
  { href: '/suppliers', label: 'Fournisseurs', labelAr: 'الموردون' },
  { href: '/pieces', label: 'Pièces', labelAr: 'المستندات' },
  { href: '/reports', label: 'Rapports', labelAr: 'التقارير' },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams() as { lang: Locale };
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
       <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
                <div className="flex-shrink-0">
                   <Logo />
                </div>
                <nav 
                  className="relative hidden h-full md:flex items-center justify-center"
                  onMouseLeave={() => setHoveredPath(pathname)}
                >
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        {navLinks.map((link) => {
                           const fullPath = `/${params.lang}${link.href}`;
                           const isLinkActive = isActive(link.href);
                           const isHovered = hoveredPath === fullPath;

                           return (
                            <Link
                              key={link.href}
                              href={fullPath}
                              className={cn(
                                'relative rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out active:scale-95 z-10',
                                isLinkActive
                                  ? 'text-primary'
                                  : 'text-gray-500 hover:text-primary'
                              )}
                              onMouseOver={() => setHoveredPath(fullPath)}
                            >
                               <span>{params.lang === 'ar' ? link.labelAr : link.label}</span>
                               {isHovered && (
                                <motion.div
                                  className="absolute inset-0 bg-primary/10 rounded-lg"
                                  layoutId="active-nav-link-indicator"
                                  aria-hidden="true"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 350,
                                    damping: 30,
                                  }}
                                />
                               )}
                            </Link>
                           )
                        })}
                    </div>
                </nav>
                <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700">
                       <Bell className="h-4 w-4"/>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <div className="relative ms-2">
                            <button className="flex rounded-full text-sm focus:outline-none">
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
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
