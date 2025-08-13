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

const navLinks = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/suppliers', label: 'Fournisseurs' },
  { href: '/pieces', label: 'Pièces' },
  { href: '/reports', label: 'Rapports' },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path) && path !== '/dashboard';
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
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
                              href={link.href}
                              className={cn(
                                'px-1 pt-1 text-sm font-medium',
                                isActive(link.href)
                                  ? 'text-primary border-b-2 border-primary'
                                  : 'text-gray-500 hover:text-gray-700'
                              )}
                            >
                              {link.label}
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
                        <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Paramètres</DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href="/">
                          <DropdownMenuItem>Déconnexion</DropdownMenuItem>
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
