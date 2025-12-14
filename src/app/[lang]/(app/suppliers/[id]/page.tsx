
import { getSupplierById, getPiecesBySupplierId } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import { addPiece, updatePiece, deletePiece } from './actions';
import { updateSupplier } from '../actions';

export default async function SupplierDetailPage({ params }: { params: { id: string, lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  const supplier = await getSupplierById(params.id);
  
  if (!supplier) {
    notFound();
  }

  const piecesData = await getPiecesBySupplierId(supplier.id);
  // Sort pieces by date descending on the server
  const supplierPieces = piecesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


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
