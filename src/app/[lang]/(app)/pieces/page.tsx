
import { getPieces, getSuppliers } from '@/lib/db';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';

export default async function PiecesPage({ params: { lang } }: { params: { lang: 'fr' | 'ar' }}) {
  const pieces = await getPieces();
  const suppliers = await getSuppliers();
  const dictionary = await getDictionary(lang);

  const piecesWithSupplier = pieces.map(piece => {
    const supplier = suppliers.find(s => s.id === piece.supplier_id);
    return { 
        ...piece, 
        supplierName: supplier?.name || 'N/A',
    };
  });

  return <ClientPage 
    pieces={piecesWithSupplier} 
    dictionary={dictionary.piecesPage} 
    pieceFormDictionary={dictionary.supplierDetailPage}
    lang={lang} 
  />;
}
