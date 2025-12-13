
import { getPieces, getSuppliers } from '@/lib/db';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { addPiece, updatePiece, deletePiece } from '../suppliers/[id]/actions';
import { Supplier } from '@/lib/types';
import React from 'react';
import type { Locale } from '@/i18n.config';

export default function PiecesPage({ params: paramsProp }: { params: { lang: Locale }}) {
  const { lang } = React.use(paramsProp);
  const pieces = React.use(getPieces());
  const suppliers: Supplier[] = React.use(getSuppliers());
  const dictionary = React.use(getDictionary(lang));

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
