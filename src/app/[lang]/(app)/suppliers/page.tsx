
import { getSuppliers, getPieces } from '@/lib/db';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import { addSupplier, updateSupplier, deleteSupplier } from './actions';
import React from 'react';

export default function SuppliersPage({ params: paramsProp }: { params: { lang: Locale }}) {
  const { lang } = React.use(paramsProp);
  const dictionary = React.use(getDictionary(lang));
  const suppliers = React.use(getSuppliers());
  const pieces = React.use(getPieces());
  
  const suppliersWithDebt = suppliers.map(supplier => {
    const supplierPieces = pieces.filter(p => p.supplier_id === supplier.id);
    // Corrected: Only sum total_piece for non-payment transactions (FACTURE, BL)
    const totalInvoiced = supplierPieces.reduce((sum, p) => p.type !== 'VERSEMENT' ? sum + p.total_piece : sum, 0);
    const totalPaid = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const balanceFromPieces = totalInvoiced - totalPaid;
    const totalDebt = supplier.solde_initial + balanceFromPieces;
    return { ...supplier, totalDebt, totalInvoiced, totalPaid };
  });

  return <ClientPage 
    suppliers={suppliersWithDebt} 
    dictionary={dictionary.suppliersPage} 
    addSupplierAction={addSupplier}
    updateSupplierAction={updateSupplier}
    deleteSupplierAction={deleteSupplier}
    />;
}
