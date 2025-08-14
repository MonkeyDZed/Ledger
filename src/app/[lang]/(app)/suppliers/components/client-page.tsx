
'use client';

import { useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, FileDown, Sparkles } from 'lucide-react';
import { DataTable } from './data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SupplierForm, type SupplierFormRef } from '../../components/supplier-form';
import type { Supplier } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteSupplier } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Internal formatter to avoid importing from a module with server-side dependencies
function formatCurrencySimple(amount: number) {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}


type SupplierWithDebt = Supplier & { totalDebt: number; totalInvoiced: number; totalPaid: number };
type Locale = 'fr' | 'ar';
// This type is inferred from the parent, no need for direct import
type SuppliersPageDictionary = {
    title: string;
    description: string;
    export: string;
    newSupplier: string;
    table: any;
    form: any;
    deleteDialog: any;
    toast: any;
};

interface ClientPageProps {
  suppliers: SupplierWithDebt[];
  dictionary: SuppliersPageDictionary;
}

const StatCard = ({ title, value, icon, iconBgColor }: { title: string, value: string, icon?: React.ReactNode, iconBgColor?: string }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
            <div className={`p-3 rounded-lg ${iconBgColor || 'bg-gray-100'}`}>
                {icon}
            </div>
        </CardContent>
    </Card>
);

const BalanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-600"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 2v20"/><path d="m6 10 3-3 3 3"/><path d="m18 14-3 3-3-3"/></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-indigo-600"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-600"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-600"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;


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
    
    const result = await deleteSupplier(dialogState.data.id);
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
  
  const totals = useMemo(() => {
      const totalInitialBalance = suppliers.reduce((sum, s) => sum + s.solde_initial, 0);
      const totalInvoiced = suppliers.reduce((sum, s) => sum + s.totalInvoiced, 0);
      const totalPaid = suppliers.reduce((sum, s) => sum + s.totalPaid, 0);
      const totalDebt = suppliers.reduce((sum, s) => sum + s.totalDebt, 0);
      return { totalInitialBalance, totalInvoiced, totalPaid, totalDebt };
  }, [suppliers]);


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
          <div>
            <Link href={`/${lang}/suppliers/${row.original.id}`} className="font-medium text-primary hover:underline">
              {row.getValue('name')}
            </Link>
            <div className="text-gray-900">{row.original.phone}</div>
          </div>
        ),
      },
       {
        accessorKey: 'solde_initial',
        header: ({ column }) => (
            <div className="text-end">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {dict.initialBalance}
                    <ArrowUpDown className="ms-2 h-4 w-4" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('solde_initial'));
            return <div className="text-end font-mono">{formatCurrencySimple(amount)} DZD</div>
        },
      },
      {
        accessorKey: 'totalInvoiced',
        header: () => <div className="text-end font-mono">{dict.totalInvoiced}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('totalInvoiced'));
          return <div className="text-end font-mono">{formatCurrencySimple(amount)} DZD</div>;
        },
      },
      {
        accessorKey: 'totalPaid',
        header: () => <div className="text-end font-mono">{dict.totalPaid}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('totalPaid'));
          return <div className="text-end font-mono text-green-600">{formatCurrencySimple(amount)} DZD</div>;
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
            <Badge variant={amount > 0 ? "destructive" : "default"} className={amount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                {formatCurrencySimple(amount)} DZD
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
  }, [lang, dictionary.table, handleDelete]);

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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title={dictionary.table.initialBalance} value={`${formatCurrencySimple(totals.totalInitialBalance)} DZD`} icon={<BalanceIcon />} iconBgColor='bg-blue-100' />
          <StatCard title={dictionary.table.totalInvoiced} value={`${formatCurrencySimple(totals.totalInvoiced)} DZD`} icon={<ReceiptIcon />} iconBgColor='bg-indigo-100'/>
          <StatCard title={dictionary.table.totalPaid} value={`${formatCurrencySimple(totals.totalPaid)} DZD`} icon={<CreditCardIcon />} iconBgColor='bg-green-100'/>
          <StatCard title={dictionary.table.totalDebt} value={`${formatCurrencySimple(totals.totalDebt)} DZD`} icon={<AlertCircleIcon />} iconBgColor='bg-amber-100'/>
      </div>
      
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

    
