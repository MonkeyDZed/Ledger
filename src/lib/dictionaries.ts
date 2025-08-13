import 'server-only'
import type { Locale } from '@/i18n.config'

const dictionaries = {
  fr: () => import('@/dictionaries/fr.json').then(module => module.default),
  ar: () => import('@/dictionaries/ar.json').then(module => module.default),
}

export const getDictionary = async (locale: Locale) => {
    const loader = dictionaries[locale] || dictionaries.fr;
    return loader();
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
