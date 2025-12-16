
// This function is safe for client components as it does not import server-only modules
export function formatCurrencyWithLocale(amount: number | null | undefined, lang: 'fr' | 'ar') {
    const currencySymbol = lang === 'ar' ? 'دج' : 'DZD';
    const formatter = new Intl.NumberFormat(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    // Handle potential NaN or undefined values gracefully
    const numAmount = (amount === null || amount === undefined || isNaN(amount)) ? 0 : amount;
    return `${formatter.format(numAmount)} ${currencySymbol}`;
}


export function formatDate(dateString: string, lang: 'fr' | 'ar') {
  return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
