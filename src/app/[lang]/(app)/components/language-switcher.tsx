'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Locale } from '@/i18n.config'

export function LanguageSwitcher({ lang }: { lang: Locale }) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLang: Locale) => {
    if (!pathname) return
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
    router.push(newPath)
  }

  return (
    <div className="flex gap-1">
      <Button variant={lang === 'fr' ? 'secondary' : 'ghost'} size="sm" onClick={() => switchLanguage('fr')}>
        Fr
      </Button>
       <Button variant={lang === 'ar' ? 'secondary' : 'ghost'} size="sm" onClick={() => switchLanguage('ar')}>
        Ar
      </Button>
    </div>
  )
}
