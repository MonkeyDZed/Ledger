
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteSupplier } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { Locale } from '@/i18n.config';


type SupplierWithDebt = Supplier & { totalDebt: number; totalInvoiced: number; totalPaid: number };

interface ClientPageProps {
  suppliers: SupplierWithDebt[];
  dictionary: Dictionary['suppliersPage'];
}

export function ClientPage({ suppliers, dictionary }: ClientPageProps) {
  const [dialogState, setDialogState] = useState<{
    type: 'new' | 'edit' | 'delete' | null;
    data?: SupplierWithDebt;
  }>({ type: null });

  const { toast } = useToast();
  const supplierFormRef = useRef<SupplierFormRef>(null);
  const params = useParams();
  const lang = params.lang as Locale;


  const handleAutoFill = () => {
    supplierFormRef.current?.autoFill();
  }

  const openDialog = (type: 'new' | 'edit' | 'delete', data?: SupplierWithDebt) => {
    setDialogState({ type, data });
  };

  const closeDialogs = () => {
    setDialogState({ type: null });
  };
  
  const handleDelete = async () => {
    if (dialogState.type !== 'delete' || !dialogState.data) return;
    
    const result = await deleteSupplier(dialogState.data.id, lang);
    if(result.success) {
        toast({
            title: dictionary.toast.deleteSuccess.title,
            description: `${dictionary.toast.deleteSuccess.description} ${dialogState.data.name}`,
        });
    } else {
        toast({
            title: dictionary.toast.error.title,
            description: result.message || dictionary.toast.error.description,
            variant: "destructive",
        });
    }
    closeDialogs();
  };

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
        <Button onClick={() => openDialog('new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {dictionary.newSupplier}
        </Button>
      </PageHeader>
      
      <DataTable columns={columns({ onEdit: (s) => openDialog('edit', s), onDelete: (s) => openDialog('delete', s), dict: dictionary.table, lang })} data={suppliers} dictionary={dictionary.table}/>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogState.type === 'new' || dialogState.type === 'edit'} onOpenChange={closeDialogs}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <div className="flex justify-between items-center">
                <DialogTitle>{dialogState.type === 'edit' ? dictionary.form.editTitle : dictionary.form.addTitle}</DialogTitle>
                {(dialogState.type === 'new' || dialogState.type === 'edit') && (
                    <Button variant="outline" size="sm" onClick={handleAutoFill} className="gap-2">
                        <Sparkles className="h-4 w-4" /> {dictionary.form.autoFill}
                    </Button>
                )}
            </div>
            <DialogDescription>
              {dialogState.type === 'edit' ? dictionary.form.editDescription : dictionary.form.addDescription}
            </DialogDescription>
          </DialogHeader>
          <SupplierForm 
            ref={supplierFormRef} 
            onClose={closeDialogs} 
            dictionary={dictionary.form}
            supplierToEdit={dialogState.data}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={dialogState.type === 'delete'} onOpenChange={closeDialogs}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{dictionary.deleteDialog.title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {dictionary.deleteDialog.description1} <strong>{dialogState.data?.name}</strong>. {dictionary.deleteDialog.description2}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={closeDialogs}>{dictionary.deleteDialog.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{dictionary.deleteDialog.confirm}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
