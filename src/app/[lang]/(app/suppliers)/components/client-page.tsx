'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown, Sparkles } from 'lucide-react';
import { DataTable } from './data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SupplierForm, type SupplierFormRef } from '../../components/supplier-form';
import type { Supplier, Piece } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyWithLocale } from '@/lib/formatters';
import type { addSupplier, updateSupplier, deleteSupplier } from '../actions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PageHeader } from '@/components/page-header';
import { cn } from '@/lib/utils';
import { ChevronsUpDown } from 'lucide-react';


type SupplierWithDebt = Supplier & { totalDebt: number; totalInvoiced: number; totalPaid: number };

interface ClientPageProps {
  suppliers: Supplier[];
  pieces: Piece[];
  dictionary: any;
  deleteSupplierAction: typeof deleteSupplier;
  addSupplierAction: typeof addSupplier;
  updateSupplierAction: typeof updateSupplier;
}


const BalanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 2v20"/><path d="m6 10 3-3 3 3"/><path d="m18 14-3 3-3-3"/></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

const StatCard = ({ title, value, icon, cardClassName, titleClassName, valueClassName, iconWrapperClassName }: { title: string, value: string | React.ReactNode, icon: React.ReactNode, cardClassName?: string, titleClassName?: string, valueClassName?: string, iconWrapperClassName?: string }) => (
  <Card className={cn("p-4", cardClassName)}>
    <CardHeader className="flex flex-row items-center justify-between py-0 px-0 pb-2">
      <CardTitle className={`text-xs font-medium ${titleClassName}`}>{title}</CardTitle>
      <div className={iconWrapperClassName}>{icon}</div>
    </CardHeader>
    <CardContent className="p-0">
      <div className={`text-xl font-bold font-mono ${valueClassName}`} suppressHydrationWarning>{value}</div>
    </CardContent>
  </Card>
);

export function ClientPage({ suppliers, pieces, dictionary, deleteSupplierAction, addSupplierAction, updateSupplierAction }: ClientPageProps) {
  const [dialogState, setDialogState] = useState<{ type: 'new' | 'edit' | 'delete' | null; data?: SupplierWithDebt }>({ type: null });
  const [isMounted, setIsMounted] = useState(false);
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);

  const { toast } = useToast();
  const supplierFormRef = useRef<SupplierFormRef>(null);
  const params = useParams();
  const lang = params.lang as 'fr' | 'ar';

  useEffect(() => setIsMounted(true), []);

  const { suppliersWithDebt, totals } = useMemo(() => {
    const calculatedSuppliers = suppliers.map(supplier => {
        const supplierPieces = pieces.filter(p => p.supplier_id === supplier.id);
        const totalInvoiced = supplierPieces.reduce((sum, p) => p.type !== 'VERSEMENT' ? sum + p.total_piece : sum, 0);
        const totalPaid = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
        const balanceFromPieces = totalInvoiced - totalPaid;
        const totalDebt = supplier.solde_initial + balanceFromPieces;
        return { ...supplier, totalDebt, totalInvoiced, totalPaid };
    });

    const calculatedTotals = {
      totalInitialBalance: calculatedSuppliers.reduce((sum, s) => sum + s.solde_initial, 0),
      totalInvoiced: calculatedSuppliers.reduce((sum, s) => sum + s.totalInvoiced, 0),
      totalPaid: calculatedSuppliers.reduce((sum, s) => sum + s.totalPaid, 0),
      totalDebt: calculatedSuppliers.reduce((sum, s) => sum + s.totalDebt, 0),
    };

    return { suppliersWithDebt: calculatedSuppliers, totals: calculatedTotals };
  }, [suppliers, pieces]);

  const openDialog = (type: 'new' | 'edit' | 'delete', data?: SupplierWithDebt) => setDialogState({ type, data });
  const closeDialogs = () => setDialogState({ type: null });

  const handleDelete = async () => {
    if (dialogState.type !== 'delete' || !dialogState.data) return;
    const result = await deleteSupplierAction(dialogState.data.id);
    if (result.success) {
      toast({ title: dictionary.form.toast.deleteSuccess.title, description: `${dictionary.form.toast.deleteSuccess.description} ${dialogState.data.name}` });
    } else {
      toast({ title: dictionary.form.toast.error.title, description: result.message || dictionary.form.toast.error.description, variant: "destructive" });
    }
    closeDialogs();
  };

  const handleAutoFill = () => supplierFormRef.current?.autoFill();

  const columns = useMemo((): ColumnDef<SupplierWithDebt>[] => {
    const dict = dictionary.table;
    return [
      { accessorKey: 'name', header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>{dict.name}<ArrowUpDown className="ms-2 h-4 w-4"/></Button>, cell: ({ row }) => <Link href={`/${lang}/suppliers/${row.original.id}`} className="font-medium text-primary hover:underline">{row.getValue('name')}</Link> },
      { accessorKey: 'solde_initial', header: ({ column }) => <div className="text-end"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>{dict.initialBalance}<ArrowUpDown className="ms-2 h-4 w-4"/></Button></div>, cell: ({ row }) => <div className="text-end font-mono" suppressHydrationWarning>{formatCurrencyWithLocale(parseFloat(row.getValue('solde_initial')), lang)}</div> },
      { accessorKey: 'totalInvoiced', header: () => <div className="text-end font-mono">{dict.totalInvoiced}</div>, cell: ({ row }) => <div className="text-end font-mono" suppressHydrationWarning>{formatCurrencyWithLocale(parseFloat(row.getValue('totalInvoiced')), lang)}</div> },
      { accessorKey: 'totalPaid', header: () => <div className="text-end font-mono">{dict.totalPaid}</div>, cell: ({ row }) => <div className="text-end font-mono text-green-600" suppressHydrationWarning>{formatCurrencyWithLocale(parseFloat(row.getValue('totalPaid')), lang)}</div> },
      { accessorKey: 'totalDebt', header: ({ column }) => <div className="text-end"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>{dict.totalDebt}<ArrowUpDown className="ms-2 h-4 w-4"/></Button></div>, cell: ({ row }) => { const amount = parseFloat(row.getValue('totalDebt')); return <div className="text-end font-mono"><Badge variant={amount>0?"destructive":"default"} className={amount>0?'bg-amber-100 text-amber-800':'bg-green-100 text-green-800'} suppressHydrationWarning>{formatCurrencyWithLocale(amount, lang)}</Badge></div>; } },
      { id: 'actions', cell: ({ row }) => { const supplier=row.original; return <div className="text-end"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">{dictionary.table.openMenu}</span><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>{dictionary.table.actions}</DropdownMenuLabel><DropdownMenuItem onClick={()=>navigator.clipboard.writeText(supplier.id)}>{dictionary.table.copyId}</DropdownMenuItem><DropdownMenuSeparator/><Link href={`/${lang}/suppliers/${supplier.id}`}><DropdownMenuItem>{dictionary.table.viewDetails}</DropdownMenuItem></Link><DropdownMenuItem onClick={()=>openDialog('edit',supplier)}>{dictionary.table.edit}</DropdownMenuItem><DropdownMenuItem onClick={()=>openDialog('delete',supplier)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">{dictionary.table.delete}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>; } }
    ];
  }, [lang, dictionary, suppliersWithDebt]);

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline"><FileDown className="me-2 h-4 w-4"/>{dictionary.export}</Button>
      <Button onClick={()=>openDialog('new')}><PlusCircle className="me-2 h-4 w-4"/>{dictionary.newSupplier}</Button>
    </div>
  );

  const headerContent = isMounted ? (
    <Collapsible open={isHeaderOpen} onOpenChange={setIsHeaderOpen} className="mb-4 space-y-2">
      <CollapsibleTrigger asChild>
        <div className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 -m-2 hover:bg-slate-100/80 transition-colors">
          <ChevronsUpDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isHeaderOpen ? '-rotate-180' : ''}`} />
          <div className="flex flex-1 items-baseline justify-between">
            <div className="flex items-baseline gap-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{dictionary.title}</h1>
              {!isHeaderOpen && <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground font-mono"><span>{suppliers.length} {dictionary.title.toLowerCase()}</span><span className="h-4 border-l"></span><span suppressHydrationWarning>Créance: <span className="font-bold text-gray-700">{formatCurrencyWithLocale(totals.totalDebt, lang)}</span></span></div>}
            </div>
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>{headerActions}</div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        <p className="text-muted-foreground px-8 md:px-11">{dictionary.description}</p>
        <div className="grid gap-2 md:grid-cols-4 mt-4 px-8 md:px-11">
          <StatCard title={dictionary.table.initialBalance} value={formatCurrencyWithLocale(totals.totalInitialBalance, lang)} icon={<BalanceIcon />} cardClassName="bg-slate-100 border-slate-200" titleClassName="text-slate-600" valueClassName="text-slate-900" iconWrapperClassName="text-slate-500"/>
          <StatCard title={dictionary.table.totalInvoiced} value={formatCurrencyWithLocale(totals.totalInvoiced, lang)} icon={<ReceiptIcon />} cardClassName="bg-blue-50 border-blue-200" titleClassName="text-blue-800" valueClassName="text-blue-900" iconWrapperClassName="text-blue-700"/>
          <StatCard title={dictionary.table.totalPaid} value={formatCurrencyWithLocale(totals.totalPaid, lang)} icon={<CreditCardIcon />} cardClassName="bg-green-50 border-green-200" titleClassName="text-green-800" valueClassName="text-green-900" iconWrapperClassName="text-green-700"/>
          <StatCard title={dictionary.table.totalDebt} value={formatCurrencyWithLocale(totals.totalDebt, lang)} icon={<AlertCircleIcon />} cardClassName="bg-rose-50 border-rose-200" titleClassName="text-rose-800" valueClassName="text-rose-900" iconWrapperClassName="text-rose-700"/>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ) : (
    <div className="mb-4">
      <PageHeader title={dictionary.title}>{headerActions}</PageHeader>
    </div>
  );

  return (
    <>
      {headerContent}
      <DataTable columns={columns} data={suppliersWithDebt} dictionary={dictionary.table}/>

      <Dialog open={dialogState.type==='new'||dialogState.type==='edit'} onOpenChange={closeDialogs}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>{dialogState.type==='edit'?dictionary.form.editTitle:dictionary.form.addTitle}</DialogTitle>
              {(dialogState.type==='new'||dialogState.type==='edit')&&<Button variant="outline" size="sm" onClick={handleAutoFill} className="gap-2"><Sparkles className="h-4 w-4"/> {dictionary.form.autoFill}</Button>}
            </div>
            <DialogDescription>{dialogState.type==='edit'?dictionary.form.editDescription:dictionary.form.addDescription}</DialogDescription>
          </DialogHeader>
          <SupplierForm ref={supplierFormRef} onClose={closeDialogs} dictionary={dictionary.form} supplierToEdit={dialogState.data} addSupplierAction={addSupplierAction} updateSupplierAction={updateSupplierAction}/>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialogState.type==='delete'} onOpenChange={closeDialogs}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{dictionary.deleteDialog.description1} <strong>{dialogState.data?.name}</strong>. {dictionary.deleteDialog.description2}</AlertDialogDescription>
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
