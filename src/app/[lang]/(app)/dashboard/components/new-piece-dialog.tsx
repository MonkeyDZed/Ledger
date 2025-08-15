
'use client';

import { useState, useMemo } from 'react';
import type { Supplier, Piece } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieceForm } from '../../components/piece-form';
import { Card, CardContent, CardDescription } from '@/components/ui/card';

// Internal formatter to avoid importing from a module with server-side dependencies
function formatCurrencySimple(amount: number) {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface NewPieceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  suppliers: Supplier[];
  pieces: Piece[];
  dictionary: any;
  pieceFormDictionary: any;
  schemaDictionary: any;
  lang: 'fr' | 'ar';
}

export function NewPieceDialog({ isOpen, onOpenChange, suppliers, pieces, dictionary, pieceFormDictionary, schemaDictionary, lang }: NewPieceDialogProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

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
    const balanceFromPieces = supplierPieces.reduce((sum, p) => sum + p.reste, 0);
    return supplier.solde_initial + balanceFromPieces;
  }, [selectedSupplierId, suppliers, pieces]);
  
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]" onInteractOutside={(e) => {
        if (e.target instanceof HTMLElement && e.target.closest('[data-radix-collection-item]')) {
            e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>{dictionary.newPiece}</DialogTitle>
           <DialogDescription>
            {selectedSupplierId ? pieceFormDictionary.addDescription : "Choisissez d'abord un fournisseur."}
          </DialogDescription>
        </DialogHeader>
        
        {!selectedSupplierId ? (
            <div className="pt-4 space-y-4">
                <Select onValueChange={setSelectedSupplierId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un fournisseur" />
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
              title="Double-cliquez pour changer de fournisseur"
            >
                <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800">{selectedSupplier?.name}</p>
                            <CardDescription>Créance actuelle avant cette pièce</CardDescription>
                        </div>
                        <p className={`text-lg font-bold font-mono ${selectedSupplierDebt > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {formatCurrencySimple(selectedSupplierDebt)} {dictionary.currency}
                        </p>
                    </div>
                </CardContent>
            </Card>
            <PieceForm 
              supplierId={selectedSupplierId} 
              onClose={handleClose} 
              dictionary={pieceFormDictionary}
              schemaDictionary={schemaDictionary}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
