'use client'

import { usePathname, useRouter } from 'next/navigation'
import { DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu'
import { Check } from 'lucide-react'
import { Locale } from '@/i18n.config'

export function LanguageSwitcherMenu({ lang }: { lang: Locale }) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLang: Locale) => {
    if (!pathname) return
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
    router.push(newPath)
  }

  return (
    <DropdownMenuSub>
        <DropdownMenuSubTrigger>
            <span>{lang === 'fr' ? 'Langue' : 'اللغة'}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => switchLanguage('fr')}>
                Français {lang === 'fr' && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchLanguage('ar')}>
                العربية {lang === 'ar' && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
        </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
