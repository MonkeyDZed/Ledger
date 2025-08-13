
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
import type { Dictionary } from '@/lib/dictionaries';

interface ClientPageProps {
  suppliers: (Supplier & { totalDebt: number })[];
  dictionary: Dictionary['suppliersPage'];
}

export function ClientPage({ suppliers, dictionary }: ClientPageProps) {
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const supplierFormRef = useRef<SupplierFormRef>(null);

  const handleAutoFill = () => {
    supplierFormRef.current?.autoFill();
  }

  return (
    <>
      <PageHeader
        title={dictionary.title}
        description={dictionary.description}
      >
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          {dictionary.export}
        </Button>
        <Button onClick={() => setIsNewSupplierOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {dictionary.newSupplier}
        </Button>
      </PageHeader>
      
      <DataTable columns={columns(dictionary.table)} data={suppliers} dictionary={dictionary.table}/>

      <Dialog open={isNewSupplierOpen} onOpenChange={setIsNewSupplierOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <div className="flex justify-between items-center">
                <DialogTitle>{dictionary.form.addTitle}</DialogTitle>
                <Button variant="outline" size="sm" onClick={handleAutoFill} className="gap-2">
                    <Sparkles className="h-4 w-4" /> {dictionary.form.autoFill}
                </Button>
            </div>
            <DialogDescription>
              {dictionary.form.addDescription}
            </DialogDescription>
          </DialogHeader>
          <SupplierForm ref={supplierFormRef} onClose={() => setIsNewSupplierOpen(false)} dictionary={dictionary.form} />
        </DialogContent>
      </Dialog>
    </>
  );
}
