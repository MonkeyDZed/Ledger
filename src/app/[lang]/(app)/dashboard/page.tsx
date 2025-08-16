
'use client';

import { getSuppliers, getPieces } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import { DashboardClientPage } from './components/dashboard-client-page';
import { addPiece, updatePiece } from '../suppliers/[id]/actions';
import { addSupplier, updateSupplier } from '../suppliers/actions';
import { useEffect, useState } from 'react';
import type { Supplier, Piece, Dictionary } from '@/lib/types';


export default function DashboardPage({ params: { lang } }: { params: { lang: Locale } }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [dictionary, setDictionary] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const serverSuppliers = await getSuppliers();
      const serverPieces = await getPieces();
      const serverDict = await getDictionary(lang);
      
      setSuppliers(serverSuppliers);
      setPieces(serverPieces);
      setDictionary(serverDict);
    }
    fetchData();
  }, [lang]);

  if (!dictionary) {
    return <div>Chargement...</div>;
  }

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

  return <DashboardClientPage 
    suppliers={suppliers} 
    pieces={pieces} 
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
