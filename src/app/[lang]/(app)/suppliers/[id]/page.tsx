import { getSupplierById, getPiecesBySupplierId } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';

export default async function SupplierDetailPage({ params }: { params: { id: string, lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  const supplier = await getSupplierById(params.id);
  
  if (!supplier) {
    notFound();
  }

  const supplierPieces = await getPiecesBySupplierId(supplier.id);

  return <ClientPage supplier={supplier} pieces={supplierPieces} dictionary={dictionary.supplierDetailPage} lang={params.lang} />;
}
