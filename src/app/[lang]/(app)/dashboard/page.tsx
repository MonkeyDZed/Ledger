
import { getSuppliers, getPieces } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import { DashboardClientPage } from './components/dashboard-client-page';
import { addPiece, updatePiece } from '../suppliers/[id]/actions';
import { addSupplier, updateSupplier } from '../suppliers/actions';

export default async function DashboardPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const suppliers = await getSuppliers();
  const pieces = await getPieces();

  // IMPORTANT: Do not pass the whole dictionary object to client components.
  // Extract only the necessary strings to avoid server-only module leakage.
  const dashboardDict = {
    suppliers: dict.dashboard.suppliers,
    pieces: dict.dashboard.pieces,
    totalDebts: dict.dashboard.totalDebts,
    lastSync: dict.dashboard.lastSync,
    upToDate: dict.dashboard.upToDate,
    quickActions: dict.dashboard.quickActions,
    addSupplier: dict.dashboard.addSupplier,
    newPiece: dict.dashboard.newPiece,
    newPayment: dict.dashboard.newPayment,
    recentSuppliers: dict.dashboard.recentSuppliers,
    seeAll: dict.dashboard.seeAll,
    supplierName: dict.dashboard.supplierName,
    wilaya: dict.dashboard.wilaya,
    totalInvoiced: dict.dashboard.totalInvoiced,
    remaining: dict.dashboard.remaining,
    action: dict.dashboard.action,
    nif: dict.dashboard.nif,
    financialOverview: dict.dashboard.financialOverview,
    paid: dict.dashboard.paid,
    toPay: dict.dashboard.toPay,
    exportPdf: dict.dashboard.exportPdf,
    exportCsv: dict.dashboard.exportCsv,
    currency: dict.dashboard.currency,
  };

  return <DashboardClientPage 
    suppliers={suppliers} 
    pieces={pieces} 
    dictionary={dashboardDict} 
    formDictionary={dict.suppliersPage.form}
    pieceFormDictionary={dict.supplierDetailPage.form}
    lang={lang}
    addPieceAction={addPiece}
    updatePieceAction={updatePiece}
    addSupplierAction={addSupplier}
    updateSupplierAction={updateSupplier}
  />;
}
