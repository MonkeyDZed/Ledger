
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteSupplier } from '../actions';
import { useToast } from '@/hooks/use-toast';


type SupplierWithDebt = Supplier & { totalDebt: number };

interface ClientPageProps {
  suppliers: SupplierWithDebt[];
}

export function ClientPage({ suppliers }: ClientPageProps) {
  const [dialogState, setDialogState] = useState<{
    type: 'new' | 'edit' | 'delete' | null;
    data?: SupplierWithDebt;
  }>({ type: null });

  const { toast } = useToast();
  const supplierFormRef = useRef<SupplierFormRef>(null);

  const handleAutoFill = () => {
    supplierFormRef.current?.autoFill();
  };

  const openDialog = (type: 'new' | 'edit' | 'delete', data?: SupplierWithDebt) => {
    setDialogState({ type, data });
  };

  const closeDialogs = () => {
    setDialogState({ type: null });
  };
  
  const handleDelete = async () => {
    if (dialogState.type !== 'delete' || !dialogState.data) return;
    
    const result = await deleteSupplier(dialogState.data.id);
    if(result.success) {
        toast({
            title: "Fournisseur supprimé",
            description: `Le fournisseur ${dialogState.data.name} a été supprimé avec succès.`,
        });
    } else {
        toast({
            title: "Erreur",
            description: result.message || "Une erreur est survenue.",
            variant: "destructive",
        });
    }
    closeDialogs();
  };

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
        <Button onClick={() => openDialog('new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau Fournisseur
        </Button>
      </PageHeader>
      
      <DataTable columns={columns({ onEdit: (s) => openDialog('edit', s), onDelete: (s) => openDialog('delete', s) })} data={suppliers} />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogState.type === 'new' || dialogState.type === 'edit'} onOpenChange={closeDialogs}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <div className="flex justify-between items-center">
                <DialogTitle>{dialogState.type === 'edit' ? 'Modifier le fournisseur' : 'Ajouter un nouveau fournisseur'}</DialogTitle>
                {dialogState.type === 'new' && (
                    <Button variant="outline" size="sm" onClick={handleAutoFill} className="gap-2">
                        <Sparkles className="h-4 w-4" /> Remplissage auto
                    </Button>
                )}
            </div>
            <DialogDescription>
              {dialogState.type === 'edit' ? 'Mettez à jour les informations du fournisseur.' : 'Remplissez les informations ci-dessous pour créer un nouveau fournisseur.'}
            </DialogDescription>
          </DialogHeader>
          <SupplierForm 
            ref={supplierFormRef} 
            onClose={closeDialogs} 
            supplierToEdit={dialogState.data}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={dialogState.type === 'delete'} onOpenChange={closeDialogs}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Elle supprimera définitivement le fournisseur <strong>{dialogState.data?.name}</strong> et toutes les pièces associées de nos serveurs.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={closeDialogs}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
