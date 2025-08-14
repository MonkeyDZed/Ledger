
import { getSuppliers, getPieces } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import { DashboardClientPage } from './components/dashboard-client-page';
import { formatCurrency } from '@/lib/formatters';

export default async function DashboardPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const suppliers = await getSuppliers();
  const pieces = await getPieces();

  return <DashboardClientPage 
    suppliers={suppliers} 
    pieces={pieces} 
    dictionary={dict.dashboard} 
    formDictionary={dict.suppliersPage.form}
    pieceFormDictionary={dict.supplierDetailPage.form}
    lang={lang} 
  />;
}
