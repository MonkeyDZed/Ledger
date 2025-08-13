
'use client';

import { useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, FileDown, Sparkles } from 'lucide-react';
import { DataTable } from './data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SupplierForm, type SupplierFormRef } from '../../components/supplier-form';
import type { Supplier } from '@/lib/types';
import type { Dictionary } from '@/lib/dictionaries';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteSupplier } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { Locale } from '@/i18n.config';
import type { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


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

  const columns = useMemo((): ColumnDef<SupplierWithDebt>[] => {
    const dict = dictionary.table;
    return [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {dict.name}
              <ArrowUpDown className="ms-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <Link href={`/${lang}/suppliers/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.getValue('name')}
          </Link>
        ),
      },
      {
        accessorKey: 'phone',
        header: dict.phone,
      },
      {
        accessorKey: 'totalInvoiced',
        header: () => <div className="text-end">{dict.totalInvoiced}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('totalInvoiced'));
          return <div className="text-end font-mono">{formatCurrency(amount)} DZD</div>;
        },
      },
      {
        accessorKey: 'totalPaid',
        header: () => <div className="text-end">{dict.totalPaid}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('totalPaid'));
          return <div className="text-end font-mono text-green-600">{formatCurrency(amount)} DZD</div>;
        },
      },
      {
        accessorKey: 'totalDebt',
        header: ({ column }) => {
           return (
            <div className="text-end">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                  {dict.totalDebt}
                  <ArrowUpDown className="ms-2 h-4 w-4" />
                </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('totalDebt'));
          return <div className="text-end font-mono">
            <Badge variant={amount > 0 ? 'destructive' : 'default'} className={amount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                {formatCurrency(amount)} DZD
            </Badge>
          </div>;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const supplier = row.original;
          return (
            <div className="text-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{dict.openMenu}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{dict.actions}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(supplier.id)}>
                    {dict.copyId}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Link href={`/${lang}/suppliers/${supplier.id}`}>
                    <DropdownMenuItem>{dict.viewDetails}</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => openDialog('edit', supplier)}>{dict.edit}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDialog('delete', supplier)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">{dict.delete}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];
  }, [lang, dictionary.table]);

  return (
    <>
      <PageHeader
        title={dictionary.title}
        description={dictionary.description}
      >
        <Button variant="outline">
          <FileDown className="me-2 h-4 w-4" />
          {dictionary.export}
        </Button>
        <Button onClick={() => openDialog('new')}>
          <PlusCircle className="me-2 h-4 w-4" />
          {dictionary.newSupplier}
        </Button>
      </PageHeader>
      
      <DataTable columns={columns} data={suppliers} dictionary={dictionary.table}/>

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

    