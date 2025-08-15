
'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, ArrowLeft, FileEdit, HandCoins } from 'lucide-react';
import { DataTable } from './data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PieceForm } from '../../../components/piece-form';
import type { Supplier, Piece } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deletePiece } from '../actions';
import { useParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown, Banknote as BanknoteIcon, Hand, FileText as FileTextIcon, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SupplierForm, type SupplierFormRef } from '../../../components/supplier-form';
import { cn } from '@/lib/utils';
import { formatCurrencyWithLocale, formatDate } from '@/lib/formatters';


const StatCard = ({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description?: string }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex justify-between items-center">
                {title}
                <span className="text-gray-400">{icon}</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
            {description && <CardDescription>{description}</CardDescription>}
        </CardContent>
    </Card>
);

const BadgeCentIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v8a1 1 0 102 0V7z" clipRule="evenodd"></path><path d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V11a1 1 0 11-2 0V7.414L5.707 9.707a1 1 0 01-1.414-1.414l4-4z"></path></svg>;

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
}

export function ClientPage({ supplier, pieces, dictionary, supplierFormDictionary }: ClientPageProps) {
  const { toast } = useToast();
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
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
    
    const result = await deletePiece(dialogState.data.id, supplier.id);
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
        cell: ({ row }) => formatDate(row.original.date, lang),
      },
      {
        accessorKey: 'type',
        header: dict.type,
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            let variant: 'secondary' | 'outline' | 'default' = 'outline';
            if (type === 'FACTURE') variant = 'secondary';
            if (type === 'VERSEMENT') variant = 'default';

            return <Badge variant={variant} className={cn({'bg-emerald-500 text-white': type === 'VERSEMENT'})}>{dict[type.toLowerCase()]}</Badge>
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
          return <div className="text-end font-mono">{formatCurrencyWithLocale(amount, lang)}</div>;
        },
      },
      {
        accessorKey: 'montant_paye',
        header: () => <div className="text-end">{dict.paid}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('montant_paye'));
          return <div className="text-end font-mono text-green-600">{formatCurrencyWithLocale(amount, lang)}</div>;
        },
      },
      {
        accessorKey: 'reste',
        header: () => <div className="text-end">{dict.remaining}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('reste'));
          if (row.original.type === 'VERSEMENT') return <div className="text-end text-muted-foreground">-</div>;
          return <div className="text-end font-mono text-destructive">{formatCurrencyWithLocale(amount, lang)}</div>;
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
  }, [lang, dictionary]);


  const totalFromPieces = pieces.reduce((sum, p) => sum + p.total_piece, 0);
  const paidFromPieces = pieces.reduce((sum, p) => sum + p.montant_paye, 0);
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
         <Button variant="secondary" onClick={() => openDialog('new-versement')}>
          <HandCoins className="me-2 h-4 w-4" />
          {dictionary.header.newPaymentButton}
        </Button>
        <Button onClick={() => openDialog('new-piece')}>
          <PlusCircle className="me-2 h-4 w-4" />
          {dictionary.header.newPieceButton}
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title={dictionary.stats.initialBalance} value={`${formatCurrencyWithLocale(supplier.solde_initial, lang)}`} icon={<BadgeCentIcon />} />
        <StatCard title={dictionary.stats.totalInvoiced} value={`${formatCurrencyWithLocale(totalFromPieces, lang)}`} icon={<FileTextIcon />} />
        <StatCard title={dictionary.stats.totalPaid} value={`${formatCurrencyWithLocale(paidFromPieces, lang)}`} icon={<BanknoteIcon />} />
        <Card className="bg-blue-50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary flex justify-between items-center">
                    {dictionary.stats.totalDebt}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className={`text-2xl font-bold font-mono ${totalDebt > 0 ? 'text-rose-600' : 'text-green-600'}`}>{formatCurrencyWithLocale(totalDebt, lang)}</p>
                <CardDescription>{dictionary.stats.debtDescription}</CardDescription>
            </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{dictionary.info.title}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditSupplierOpen(true)}>
                <FileEdit className="me-2 h-4 w-4" />
                {dictionary.info.editButton}
            </Button>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm pt-4">
            <div><strong>{dictionary.info.wilaya}:</strong> {supplier.wilaya}</div>
            <div><strong>{dictionary.info.phone}:</strong> {supplier.phone}</div>
            <div><strong>{dictionary.info.nif}:</strong> <span className="font-mono">{supplier.nif}</span></div>
            <div><strong>{dictionary.info.bank}:</strong> <span className="font-mono">{supplier.bank_info}</span></div>
            <div className="md:col-span-2"><strong>{dictionary.info.notes}:</strong> {supplier.notes || 'N/A'}</div>
        </CardContent>
      </Card>

      <DataTable 
        columns={columns}
        data={pieces} 
        dictionary={dictionary.piecesTable} 
      />
      
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
            formType={dialogState.type === 'new-versement' || (dialogState.data?.type === 'VERSEMENT') ? 'VERSEMENT' : 'PIECE'}
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
