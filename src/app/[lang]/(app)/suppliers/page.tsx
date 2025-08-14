
import { getSuppliers, getPieces } from '@/lib/db';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';

export default async function SuppliersPage({ params: { lang } }: { params: { lang: Locale }}) {
  const dictionary = await getDictionary(lang);
  const suppliers = await getSuppliers();
  const pieces = await getPieces();
  
  const suppliersWithDebt = suppliers.map(supplier => {
    const supplierPieces = pieces.filter(p => p.supplier_id === supplier.id);
    const totalInvoiced = supplierPieces.reduce((sum, p) => sum + p.total_piece, 0);
    const totalPaid = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const balanceFromPieces = totalInvoiced - totalPaid;
    const totalDebt = supplier.solde_initial + balanceFromPieces;
    return { ...supplier, totalDebt, totalInvoiced, totalPaid };
  });

  return <ClientPage suppliers={suppliersWithDebt} dictionary={dictionary.suppliersPage} schemaDictionary={dictionary.schemas} />;
}
