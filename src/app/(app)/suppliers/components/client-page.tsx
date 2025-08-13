
'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, FileDown, Sparkles } from 'lucide-react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SupplierForm, type SupplierFormRef } from './supplier-form';
import type { Supplier } from '@/lib/types';

interface ClientPageProps {
  suppliers: (Supplier & { totalDebt: number })[];
}

export function ClientPage({ suppliers }: ClientPageProps) {
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const supplierFormRef = useRef<SupplierFormRef>(null);

  const handleAutoFill = () => {
    supplierFormRef.current?.autoFill();
  }

  return (
    <>
      <PageHeader
        title="Fournisseurs"
        description="Gérez la liste de vos fournisseurs et de leurs créances."
      >
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Exporter
        </Button>
        <Button onClick={() => setIsNewSupplierOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau Fournisseur
        </Button>
      </PageHeader>
      
      <DataTable columns={columns} data={suppliers} />

      <Dialog open={isNewSupplierOpen} onOpenChange={setIsNewSupplierOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <div className="flex justify-between items-center">
                <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
                <Button variant="outline" size="sm" onClick={handleAutoFill} className="gap-2">
                    <Sparkles className="h-4 w-4" /> Remplissage auto
                </Button>
            </div>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouveau fournisseur.
            </DialogDescription>
          </DialogHeader>
          <SupplierForm ref={supplierFormRef} onClose={() => setIsNewSupplierOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
