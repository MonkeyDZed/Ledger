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
    const balanceFromPieces = supplierPieces.reduce((sum, p) => sum + p.reste, 0);
    const totalDebt = supplier.solde_initial + balanceFromPieces;
    return { ...supplier, totalDebt };
  });

  return <ClientPage suppliers={suppliersWithDebt} dictionary={dictionary.suppliersPage} />;
}
