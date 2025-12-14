
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, ArrowLeft, FileEdit, HandCoins, Info } from 'lucide-react';
import { DataTable } from './data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PieceForm } from '../../../components/piece-form';
import type { Supplier, Piece } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown, Banknote as BanknoteIcon, Hand, FileText as FileTextIcon, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SupplierForm, type SupplierFormRef } from '../../../components/supplier-form';
import { cn } from '@/lib/utils';
import { formatCurrencyWithLocale, formatDate } from '@/lib/formatters';
import type { addPiece, updatePiece, deletePiece } from '../actions';
import type { updateSupplier, addSupplier } from '../../actions';


const StatCard = ({ title, value, icon, cardClassName, titleClassName, valueClassName, iconWrapperClassName }: { title: string, value: string | React.ReactNode, icon: React.ReactNode, cardClassName?: string, titleClassName?: string, valueClassName?: string, iconWrapperClassName?: string }) => (
    <Card className={cn("p-4", cardClassName)}>
        <CardHeader className="flex flex-row items-center justify-between py-0 px-0 pb-2">
            <CardTitle className={`text-xs font-medium ${titleClassName}`}>{title}</CardTitle>
            <div className={iconWrapperClassName}>{icon}</div>
        </CardHeader>
        <CardContent className="p-0">
            <div className={`text-xl font-bold font-mono ${valueClassName}`}>{value}</div>
        </CardContent>
    </Card>
);

const BadgeCentIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v8a1 1 0 102 0V7z" clipRule="evenodd"></path><path d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V11a1 1 0 11-2 0V7.414L5.707 9.707a1 1 0 01-1.414-1.414l4-4z"></path></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

const PaymentMethodIcon = ({ method }: { method?: Piece['payment_method'] }) => {
    if (!method) return null;
    const props = { className: "w-4 h-4 text-muted-foreground me-2" };
    switch (method) {
        case 'espece': return <Hand {...props} />;
        case 'cheque': return <FileTextIcon {...props} />;
        case 'virement': return <Landmark {...props} />;
        case 'traite': return <BanknoteIcon {...props} />;
        default: return null;
    }
}


interface ClientPageProps {
  supplier: Supplier;
  pieces: Piece[];
  dictionary: any;
  supplierFormDictionary: any;
  addPieceAction: typeof addPiece;
  updatePieceAction: typeof updatePiece;
  deletePieceAction: typeof deletePiece;
  updateSupplierAction: typeof updateSupplier;
}

export function ClientPage({ supplier, pieces: initialPieces, dictionary, supplierFormDictionary, addPieceAction, updatePieceAction, deletePieceAction, updateSupplierAction }: ClientPageProps) {
  const { toast } = useToast();
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const supplierFormRef = useRef<SupplierFormRef>(null);
  const [dialogState, setDialogState] = useState<{
    type: 'new-piece' | 'new-versement' | 'edit' | 'delete' | null;
    data?: Piece;
  }>({ type: null });

  const params = useParams();
  const lang = params.lang as 'fr' | 'ar';
  
  const openDialog = (type: 'new-piece' | 'new-versement' | 'edit' | 'delete', data?: Piece) => {
    setDialogState({ type, data });
  };
  const closeDialogs = () => setDialogState({ type: null });
  
  const handleDelete = async () => {
    if (dialogState.type !== 'delete' || !dialogState.data) return;
    
    const result = await deletePieceAction(dialogState.data.id, supplier.id);
    if(result.success) {
        toast({
            title: dictionary.form.toast.deleteSuccess.title,
            description: dictionary.form.toast.deleteSuccess.description
        });
    } else {
        toast({
            title: dictionary.form.toast.error.title,
            description: result.message || dictionary.form.toast.error.description,
            variant: "destructive",
        });
    }
    closeDialogs();
  };
  
  const columns = useMemo((): ColumnDef<Piece>[] => {
    const dict = dictionary.piecesTable;
    return [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            {dict.date}
            <ArrowUpDown className="ms-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span suppressHydrationWarning>{formatDate(row.original.date, lang)}</span>,
      },
      {
        accessorKey: 'numero_piece',
        header: dict.numeroPiece,
        cell: ({ row }) => {
            return <span className="font-mono">{row.original.numero_piece}</span>
        }
      },
      {
        accessorKey: 'type',
        header: dict.type,
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            let variant: 'secondary' | 'outline' | 'default' = 'outline';
            if (type === 'FACTURE') variant = 'default';
            if (type === 'VERSEMENT') variant = 'secondary';

            return <Badge variant={variant} className={cn({'bg-emerald-500 text-white': type === 'VERSEMENT'}, {'bg-blue-500 text-white': type === 'FACTURE'})}>{dict[type.toLowerCase()]}</Badge>
        }
      },
      {
        accessorKey: 'description',
        header: dict.description,
        cell: ({ row }) => {
            return <div className="flex items-center">
                <PaymentMethodIcon method={row.original.payment_method} />
                <span>{row.original.description}</span>
            </div>
        }
      },
      {
        accessorKey: 'total_piece',
        header: () => <div className="text-end">{dict.total}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('total_piece'));
          if (row.original.type === 'VERSEMENT') return <div className="text-end text-muted-foreground">-</div>;
          return <div className="text-end font-mono" suppressHydrationWarning>{formatCurrencyWithLocale(amount, lang)}</div>;
        },
      },
      {
        accessorKey: 'montant_paye',
        header: () => <div className="text-end">{dict.paid}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('montant_paye'));
          return <div className="text-end font-mono text-green-600" suppressHydrationWarning>{formatCurrencyWithLocale(amount, lang)}</div>;
        },
      },
      {
        accessorKey: 'reste',
        header: () => <div className="text-end">{dict.remaining}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('reste'));
          if (row.original.type === 'VERSEMENT') return <div className="text-end text-muted-foreground">-</div>;
          return <div className="text-end font-mono text-destructive" suppressHydrationWarning>{formatCurrencyWithLocale(amount, lang)}</div>;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const piece = row.original;
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
                  <DropdownMenuItem onClick={() => openDialog('edit', piece)}>{dict.edit}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDialog('delete', piece)} className="text-destructive focus:bg-destructive/10">{dict.delete}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];
  }, [lang, dictionary, addPieceAction, updatePieceAction, deletePieceAction]);


  const totalFromPieces = initialPieces.reduce((sum, p) => sum + p.total_piece, 0);
  const paidFromPieces = initialPieces.reduce((sum, p) => sum + p.montant_paye, 0);
  const balanceFromPieces = totalFromPieces - paidFromPieces;
  const totalDebt = supplier.solde_initial + balanceFromPieces;

  return (
    <>
      <PageHeader
        title={supplier.name}
        description={`${dictionary.header.description} ${supplier.name}`}
      >
        <Button variant="outline" asChild>
          <Link href={`/${lang}/suppliers`}>
            <ArrowLeft className="me-2 h-4 w-4" />
            {dictionary.header.backButton}
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsInfoOpen(true)}>
            <Info className="me-2 h-4 w-4" />
            {dictionary.header.detailsButton}
        </Button>
         <Button variant="secondary" onClick={() => openDialog('new-versement')}>
          <HandCoins className="me-2 h-4 w-4" />
          {dictionary.header.newPaymentButton}
        </Button>
        <Button onClick={() => openDialog('new-piece')}>
          <PlusCircle className="me-2 h-4 w-4" />
          {dictionary.header.newPieceButton}
        </Button>
      </PageHeader>
      
       <div className="grid gap-2 md:grid-cols-4 mb-4">
        <StatCard 
            title={dictionary.stats.initialBalance} 
            value={<span suppressHydrationWarning>{formatCurrencyWithLocale(supplier.solde_initial, lang)}</span>}
            icon={<BadgeCentIcon />}
            cardClassName="bg-slate-100 border-slate-200"
            titleClassName="text-slate-600"
            valueClassName="text-slate-900"
            iconWrapperClassName="text-slate-500"
        />
        <StatCard 
            title={dictionary.stats.totalInvoiced} 
            value={<span suppressHydrationWarning>{formatCurrencyWithLocale(totalFromPieces, lang)}</span>}
            icon={<FileTextIcon />}
            cardClassName="bg-blue-50 border-blue-200"
            titleClassName="text-blue-800"
            valueClassName="text-blue-900"
            iconWrapperClassName="text-blue-700"
        />
        <StatCard 
            title={dictionary.stats.totalPaid} 
            value={<span suppressHydrationWarning>{formatCurrencyWithLocale(paidFromPieces, lang)}</span>}
            icon={<BanknoteIcon />}
            cardClassName="bg-green-50 border-green-200"
            titleClassName="text-green-800"
            valueClassName="text-green-900"
            iconWrapperClassName="text-green-700"
        />
        <StatCard 
            title={dictionary.stats.totalDebt} 
            value={<span suppressHydrationWarning>{formatCurrencyWithLocale(totalDebt, lang)}</span>}
            icon={<AlertCircleIcon />}
            cardClassName="bg-rose-50 border-rose-200"
            titleClassName="text-rose-800"
            valueClassName={cn("text-rose-900", { "text-green-900": totalDebt <= 0 })}
            iconWrapperClassName="text-rose-700"
        />
      </div>

      <DataTable 
        columns={columns}
        data={initialPieces} 
        dictionary={dictionary.piecesTable} 
      />
      
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
             <DialogTitle>{dictionary.info.title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-4">
              <div><strong>{dictionary.info.wilaya}:</strong> {supplier.wilaya || 'N/A'}</div>
              <div><strong>{dictionary.info.phone}:</strong> {supplier.phone || 'N/A'}</div>
              <div><strong>{dictionary.info.nif}:</strong> <span className="font-mono">{supplier.nif || 'N/A'}</span></div>
              <div><strong>{dictionary.info.bank}:</strong> <span className="font-mono">{supplier.bank_info || 'N/A'}</span></div>
              <div className="md:col-span-2"><strong>{dictionary.info.notes}:</strong> {supplier.notes || 'N/A'}</div>
          </div>
           <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => { setIsInfoOpen(false); setIsEditSupplierOpen(true); }}>
                <FileEdit className="me-2 h-4 w-4" />
                {dictionary.info.editButton}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
       <Dialog open={['new-piece', 'new-versement', 'edit'].includes(dialogState.type || '')} onOpenChange={closeDialogs}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{
                dialogState.type === 'edit' ? dictionary.form.editTitle 
                : dialogState.type === 'new-versement' ? dictionary.form.addPaymentTitle
                : dictionary.form.addTitle
            }</DialogTitle>
            <DialogDescription>
              {
                dialogState.type === 'edit' ? dictionary.form.editDescription 
                : dialogState.type === 'new-versement' ? dictionary.form.addPaymentDescription
                : dictionary.form.addDescription
              }
            </DialogDescription>
          </DialogHeader>
          <PieceForm 
            supplierId={supplier.id} 
            pieceToEdit={dialogState.data}
            onClose={closeDialogs} 
            dictionary={dictionary.form}
            formType={dialogState.type === 'new-versement' ? 'VERSEMENT' : dialogState.data?.type === 'VERSEMENT' ? 'VERSEMENT' : 'PIECE'}
            addPieceAction={addPieceAction}
            updatePieceAction={updatePieceAction}
          />
        </DialogContent>
      </Dialog>
      
       <Dialog open={isEditSupplierOpen} onOpenChange={setIsEditSupplierOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{supplierFormDictionary.editTitle}</DialogTitle>
            <DialogDescription>
              {supplierFormDictionary.editDescription}
            </DialogDescription>
          </DialogHeader>
          <SupplierForm 
            ref={supplierFormRef} 
            onClose={() => setIsEditSupplierOpen(false)} 
            dictionary={supplierFormDictionary}
            supplierToEdit={supplier}
            addSupplierAction={() => { throw new Error("addSupplier not available here"); }}
            updateSupplierAction={updateSupplierAction}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={dialogState.type === 'delete'} onOpenChange={closeDialogs}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{dictionary.deleteDialog.title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {dictionary.deleteDialog.description}
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

    