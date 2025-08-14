import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Locale } from "@/i18n.config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, lang: Locale) {
  return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
