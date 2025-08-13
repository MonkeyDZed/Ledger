
import { getPieces, getSuppliers } from '@/lib/db';
import { ClientPage } from './components/client-page';

export default async function PiecesPage() {
  const pieces = await getPieces();
  const suppliers = await getSuppliers();

  const piecesWithSupplier = pieces.map(piece => {
    const supplier = suppliers.find(s => s.id === piece.supplier_id);
    return { ...piece, supplierName: supplier?.name || 'N/A' };
  });

  return <ClientPage pieces={piecesWithSupplier} />;
}
