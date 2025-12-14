
import { getSuppliers, getPieces } from '@/lib/db';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import { addSupplier, updateSupplier, deleteSupplier } from './actions';

export default async function SuppliersPage({ params }: { params: { lang: Locale }}) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  const suppliers = await getSuppliers();
  const pieces = await getPieces();
  
  return <ClientPage 
    suppliers={suppliers}
    pieces={pieces}
    dictionary={dictionary.suppliersPage} 
    addSupplierAction={addSupplier}
    updateSupplierAction={updateSupplier}
    deleteSupplierAction={deleteSupplier}
    />;
}
