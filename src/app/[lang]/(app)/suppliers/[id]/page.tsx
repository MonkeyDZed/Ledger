
import { getSupplierById, getPiecesBySupplierId } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import { addPiece, updatePiece, deletePiece } from './actions';
import { updateSupplier } from '../actions';
import React from 'react';

export default function SupplierDetailPage({ params: paramsProp }: { params: { id: string, lang: Locale } }) {
  const params = React.use(paramsProp);
  const dictionary = React.use(getDictionary(params.lang));
  const supplier = React.use(getSupplierById(params.id));
  
  if (!supplier) {
    notFound();
  }

  const supplierPieces = React.use(getPiecesBySupplierId(supplier.id));

  return <ClientPage 
    supplier={supplier} 
    pieces={supplierPieces} 
    dictionary={dictionary.supplierDetailPage} 
    supplierFormDictionary={dictionary.suppliersPage.form}
    addPieceAction={addPiece}
    updatePieceAction={updatePiece}
    deletePieceAction={deletePiece}
    updateSupplierAction={updateSupplier}
  />;
}
