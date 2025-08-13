import { getSupplierById, getPiecesBySupplierId } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ClientPage } from './components/client-page';

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supplier = await getSupplierById(params.id);
  
  if (!supplier) {
    notFound();
  }

  const supplierPieces = await getPiecesBySupplierId(supplier.id);

  return <ClientPage supplier={supplier} pieces={supplierPieces} />;
}
