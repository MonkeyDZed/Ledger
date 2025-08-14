
import { getPieces, getSuppliers } from '@/lib/db';
import { ClientPage } from './components/client-page';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionaries';
import { formatDate } from '@/lib/formatters';

export default async function PiecesPage({ params: { lang } }: { params: { lang: Locale }}) {
  const pieces = await getPieces();
  const suppliers = await getSuppliers();
  const dictionary = await getDictionary(lang);

  const piecesWithSupplier = pieces.map(piece => {
    const supplier = suppliers.find(s => s.id === piece.supplier_id);
    return { 
        ...piece, 
        supplierName: supplier?.name || 'N/A',
        formattedDate: formatDate(piece.date, lang)
    };
  });

  return <ClientPage pieces={piecesWithSupplier} dictionary={dictionary.piecesPage} lang={lang} />;
}
