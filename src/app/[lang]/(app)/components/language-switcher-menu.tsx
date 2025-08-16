
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu'
import { Check } from 'lucide-react'

type Locale = 'fr' | 'ar';

interface LanguageSwitcherProps {
    params: { lang: Locale };
    dictionary: {
        language: string;
    };
}

export function LanguageSwitcherMenu({ params, dictionary }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLang: Locale) => {
    if (!pathname) return
    const newPath = pathname.replace(`/${params.lang}`, `/${newLang}`)
    router.push(newPath)
  }

  return (
    <DropdownMenuSub>
        <DropdownMenuSubTrigger>
            <span>{dictionary.language}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => switchLanguage('fr')}>
                Français {params.lang === 'fr' && <Check className="ms-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchLanguage('ar')}>
                العربية {params.lang === 'ar' && <Check className="ms-auto h-4 w-4" />}
            </DropdownMenuItem>
        </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
