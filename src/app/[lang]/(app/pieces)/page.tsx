
import { getPieces, getSuppliers } from '@/lib/db';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { addPiece, updatePiece, deletePiece } from '../suppliers/[id]/actions';
import { Supplier } from '@/lib/types';
import type { Locale } from '@/i18n.config';

export default async function PiecesPage({ params }: { params: { lang: Locale }}) {
  const { lang } = params;
  const piecesData = await getPieces();
  const suppliers: Supplier[] = await getSuppliers();
  const dictionary = await getDictionary(lang);

  // Sort pieces by date descending on the server
  const pieces = piecesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const piecesWithSupplier = pieces.map(piece => {
    const supplier = suppliers.find(s => s.id === piece.supplier_id);
    return { 
        ...piece, 
        supplierName: supplier?.name || 'N/A',
    };
  });

  return <ClientPage 
    pieces={piecesWithSupplier} 
    suppliers={suppliers}
    dictionary={dictionary.piecesPage} 
    pieceFormDictionary={dictionary.supplierDetailPage}
    dashboardDictionary={dictionary.dashboard}
    lang={lang} 
    addPieceAction={addPiece}
    updatePieceAction={updatePiece}
    deletePieceAction={deletePiece}
  />;
}
