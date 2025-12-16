
'use client';

import { useState, useMemo } from 'react';
import type { Supplier, Piece } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieceForm } from '../../components/piece-form';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { formatCurrencyWithLocale } from '@/lib/formatters';
import { useParams } from 'next/navigation';
import type { addPiece, updatePiece } from '../../suppliers/[id]/actions';


interface NewPieceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  suppliers: Supplier[];
  pieces: Piece[];
  dictionary: any;
  pieceFormDictionary: any;
  addPieceAction: typeof addPiece;
  updatePieceAction: typeof updatePiece;
}

export function NewPieceDialog({ isOpen, onOpenChange, suppliers, pieces, dictionary, pieceFormDictionary, addPieceAction, updatePieceAction }: NewPieceDialogProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const params = useParams();
  const lang = params.lang as 'fr' | 'ar';

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        setSelectedSupplierId(null);
    }, 300);
  };
  
  const selectedSupplierDebt = useMemo(() => {
    if (!selectedSupplierId) return 0;
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return 0;

    const supplierPieces = pieces.filter(p => p.supplier_id === selectedSupplierId);
    const totalInvoiced = supplierPieces.reduce((sum, p) => p.type !== 'VERSEMENT' ? sum + p.total_piece : sum, 0);
    const totalPaid = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const balanceFromPieces = totalInvoiced - totalPaid;
    
    return supplier.solde_initial + balanceFromPieces;
  }, [selectedSupplierId, suppliers, pieces]);
  
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]" onInteractOutside={(e) => {
        if (e.target instanceof HTMLElement && e.target.closest('[data-radix-collection-item]')) {
            e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>{dictionary.newPiece}</DialogTitle>
           <DialogDescription>
            {selectedSupplierId ? pieceFormDictionary.addDescription : (lang === 'fr' ? "Choisissez d'abord un fournisseur." : "اختر موردًا أولاً.")}
          </DialogDescription>
        </DialogHeader>
        
        {!selectedSupplierId ? (
            <div className="pt-4 space-y-4">
                <Select onValueChange={setSelectedSupplierId}>
                    <SelectTrigger>
                        <SelectValue placeholder={lang === 'fr' ? "Sélectionnez un fournisseur" : "اختر موردًا"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[280px]">
                        {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        ) : (
          <div>
            <Card 
              className="mb-4 bg-gray-50 border-dashed cursor-pointer"
              onDoubleClick={() => setSelectedSupplierId(null)}
              title={lang === 'fr' ? "Double-cliquez pour changer de fournisseur" : "انقر نقرًا مزدوجًا لتغيير المورد"}
            >
                <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800">{selectedSupplier?.name}</p>
                            <CardDescription>{lang === 'fr' ? "Créance actuelle avant cette pièce" : "الدين الحالي قبل هذا المستند"}</CardDescription>
                        </div>
                        <p className={`text-lg font-bold font-mono ${selectedSupplierDebt > 0 ? 'text-destructive' : 'text-green-600'}`}>
                           {formatCurrencyWithLocale(selectedSupplierDebt, lang)}
                        </p>
                    </div>
                </CardContent>
            </Card>
            <PieceForm
              supplierId={selectedSupplierId}
              onClose={handleClose}
              dictionary={pieceFormDictionary}
              formType="PIECE"
              addPieceAction={addPieceAction}
              updatePieceAction={updatePieceAction}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

