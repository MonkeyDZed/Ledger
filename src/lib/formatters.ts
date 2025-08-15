
import type { Dictionary } from "./dictionaries";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string, lang: 'fr' | 'ar') {
  return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// This function is safe for client components as it does not import server-only modules
export function formatCurrencyWithLocale(amount: number, lang: 'fr' | 'ar', dictionary: { currency: string }) {
    const formatter = new Intl.NumberFormat(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    // Handle potential NaN or undefined values gracefully
    if (isNaN(amount) || amount === null) {
      amount = 0;
    }
    return `${formatter.format(amount)} ${dictionary.currency}`;
}

    