
import { getSuppliers, getPieces } from '@/lib/db';
import { ClientPage } from './components/client-page';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import { addSupplier, updateSupplier, deleteSupplier } from './actions';
import type { Piece } from '@/lib/types';

export default async function SuppliersPage({ params }: { params: { lang: Locale }}) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  
  let suppliers = [];
  let pieces: Piece[] = [];
  
  try {
    // Tentative de récupérer les fournisseurs et les pièces
    suppliers = await getSuppliers();
    pieces = await getPieces();
    
  } catch (error) {
    // Si la récupération échoue, loggez l'erreur pour le débogage et utilisez des tableaux vides
    console.error("Erreur lors de la récupération des fournisseurs/pièces:", error);
    // Les tableaux restent vides, ce qui est l'état sécurisé
  }

  const suppliersWithDebt = suppliers.map(supplier => {
    const supplierPieces = pieces.filter((p: Piece) => p.supplier_id === supplier.id);
    const totalInvoiced = supplierPieces.reduce((sum, p) => p.type !== 'VERSEMENT' ? sum + p.total_piece : sum, 0);
    const totalPaid = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const balanceFromPieces = totalInvoiced - totalPaid;
    const totalDebt = supplier.solde_initial + balanceFromPieces;
    return { ...supplier, totalDebt, totalInvoiced, totalPaid };
  });

  return (
    <ClientPage 
      suppliers={suppliersWithDebt}
      dictionary={dictionary.suppliersPage} 
      addSupplierAction={addSupplier}
      updateSupplierAction={updateSupplier}
      deleteSupplierAction={deleteSupplier}
    />
  );
}
