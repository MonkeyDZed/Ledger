
import { getSuppliers, getPieces } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import { DashboardClientPage } from './components/dashboard-client-page';
import { addPiece, updatePiece } from '../suppliers/[id]/actions';
import { addSupplier, updateSupplier } from '../suppliers/actions';
import { Piece } from '@/lib/types';

// This is a Server Component, responsible for fetching data.
export default async function DashboardPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const suppliers = await getSuppliers();
  const pieces = await getPieces();
  const dictionary = await getDictionary(lang);

  const supplierDataWithCalculations = suppliers.map((supplier) => {
    const supplierPieces = pieces.filter((p: Piece) => p.supplier_id === supplier.id);
    const totalInvoiced = supplierPieces.reduce((sum, p) => p.type !== 'VERSEMENT' ? sum + p.total_piece : sum, 0);
    const totalPaid = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const balanceFromPieces = totalInvoiced - totalPaid;
    const totalDebt = supplier.solde_initial + balanceFromPieces;

    const mostRecentPiece = supplierPieces.length > 0
      ? supplierPieces.reduce((latest, current) => new Date(latest.date) > new Date(current.date) ? latest : current)
      : null;

    return {
      ...supplier,
      totalDebt,
      totalFromPieces: totalInvoiced,
      mostRecentPieceDate: mostRecentPiece ? mostRecentPiece.date : '1970-01-01T00:00:00.000Z'
    };
  });
  
  const recentSuppliers = [...supplierDataWithCalculations]
        .sort((a, b) => b.mostRecentPieceDate.localeCompare(a.mostRecentPieceDate))
        .slice(0, 10);

  const dashboardDict = {
    suppliers: dictionary.dashboard.suppliers,
    pieces: dictionary.dashboard.pieces,
    totalDebts: dictionary.dashboard.totalDebts,
    lastSync: dictionary.dashboard.lastSync,
    upToDate: dictionary.dashboard.upToDate,
    quickActions: dictionary.dashboard.quickActions,
    addSupplier: dictionary.dashboard.addSupplier,
    newPiece: dictionary.dashboard.newPiece,
    newPayment: dictionary.dashboard.newPayment,
    recentSuppliers: dictionary.dashboard.recentSuppliers,
    seeAll: dictionary.dashboard.seeAll,
    supplierName: dictionary.dashboard.supplierName,
    wilaya: dictionary.dashboard.wilaya,
    totalInvoiced: dictionary.dashboard.totalInvoiced,
    remaining: dictionary.dashboard.remaining,
    action: dictionary.dashboard.action,
    nif: dictionary.dashboard.nif,
    financialOverview: dictionary.dashboard.financialOverview,
    paid: dictionary.dashboard.paid,
    toPay: dictionary.dashboard.toPay,
    exportPdf: dictionary.dashboard.exportPdf,
    exportCsv: dictionary.dashboard.exportCsv,
    currency: dictionary.dashboard.currency,
  };

  // The Server Component passes data to the Client Component as props.
  return <DashboardClientPage 
    suppliers={suppliers} 
    pieces={pieces}
    recentSuppliers={recentSuppliers}
    dictionary={dashboardDict} 
    formDictionary={dictionary.suppliersPage.form}
    pieceFormDictionary={dictionary.supplierDetailPage.form}
    lang={lang}
    addPieceAction={addPiece}
    updatePieceAction={updatePiece}
    addSupplierAction={addSupplier}
    updateSupplierAction={updateSupplier}
  />;
}
