
import { getPieces, getSuppliers } from '@/lib/db';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { addPiece, updatePiece, deletePiece } from '../suppliers/[id]/actions';
import { Supplier } from '@/lib/types';
import type { Locale } from '@/i18n.config';

export default async function PiecesPage({ params }: { params: Promise<{ lang: Locale }>}) {
  const { lang } = await params;
  const pieces = await getPieces();
  const suppliers: Supplier[] = await getSuppliers();
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
