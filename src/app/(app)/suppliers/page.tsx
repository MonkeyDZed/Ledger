import { suppliers, pieces } from '@/lib/data';
import { ClientPage } from './components/client-page';

export default function SuppliersPage() {
  const suppliersWithDebt = suppliers.map(supplier => {
    const supplierPieces = pieces.filter(p => p.supplier_id === supplier.id);
    const balanceFromPieces = supplierPieces.reduce((sum, p) => sum + p.reste, 0);
    const totalDebt = supplier.solde_initial + balanceFromPieces;
    return { ...supplier, totalDebt };
  });

  return <ClientPage suppliers={suppliersWithDebt} />;
}
