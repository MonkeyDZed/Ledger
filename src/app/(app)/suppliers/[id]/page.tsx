import { suppliers, pieces } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ClientPage } from './components/client-page';

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supplier = suppliers.find((s) => s.id === params.id);
  
  if (!supplier) {
    notFound();
  }

  const supplierPieces = pieces.filter((p) => p.supplier_id === supplier.id);

  return <ClientPage supplier={supplier} pieces={supplierPieces} />;
}
