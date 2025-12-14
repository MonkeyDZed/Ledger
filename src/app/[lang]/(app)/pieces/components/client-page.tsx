
'use client';

import { PageHeader } from '@/components/page-header';
import { DataTable } from './data-table';
import type { Piece, Supplier } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal, Banknote, Hand, FileText as FileTextIcon, Landmark, Receipt, CreditCard, AlertCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PieceForm } from '../../components/piece-form';
import { formatCurrencyWithLocale, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { addPiece, updatePiece, deletePiece } from '../../suppliers/[id]/actions';
import { NewPieceDialog } from '../../dashboard/components/new-piece-dialog';
import { NewVersementDialog } from '../../dashboard/components/new-versement-dialog';


type PieceWithSupplierName = Piece & { supplierName: string; };

interface ClientPageProps {
  pieces: PieceWithSupplierName[];
  suppliers: Supplier[];
  dictionary: any;
  pieceFormDictionary: any;
  dashboardDictionary: any;
  lang: 'fr' | 'ar';
  addPieceAction: typeof addPiece;
  updatePieceAction: typeof updatePiece;
  deletePieceAction: typeof deletePiece;
}

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


const PaymentMethodIcon = ({ method }: { method?: Piece['payment_method'] }) => {
    if (!method) return null;
    const props = { className: "w-4 h-4 text-muted-foreground me-2" };
    switch (method) {
        case 'espece': return <Hand {...props} />;
        case 'cheque': return <FileTextIcon {...props} />;
        case 'virement': return <Landmark {...props} />;
        case 'traite': return <Banknote {...props} />;
        default: return null;
    }
}


export function ClientPage({ pieces, suppliers, dictionary, pieceFormDictionary, dashboardDictionary, lang, addPieceAction, updatePieceAction, deletePieceAction }: ClientPageProps) {
    const { toast } = useToast();
    const [dialogState, setDialogState] = useState<{
        type: 'edit' | 'delete' | null;
        data?: PieceWithSupplierName;
    }>({ type: null });
    
    const [isNewPieceOpen, setIsNewPieceOpen] = useState(false);
    const [isNewVersementOpen, setIsNewVersementOpen] = useState(false);

    const openDialog = (type: 'edit' | 'delete', data: PieceWithSupplierName) => {
        setDialogState({ type, data });
    };
    const closeDialogs = () => setDialogState({ type: null });

    const handleDelete = async () => {
        if (dialogState.type !== 'delete' || !dialogState.data) return;

        const result = await deletePieceAction(dialogState.data.id, dialogState.data.supplier_id);
        if (result.success) {
            toast({
                title: pieceFormDictionary.toast.deleteSuccess.title,
                description: pieceFormDictionary.toast.deleteSuccess.description,
            });
        } else {
            toast({
                title: pieceFormDictionary.toast.error.title,
                description: result.message || pieceFormDictionary.toast.error.description,
                variant: "destructive",
            });
        }
        closeDialogs();
    };

    const totals = useMemo(() => {
        const totalBilled = pieces.filter(p => p.type !== 'VERSEMENT').reduce((sum, p) => sum + p.total_piece, 0);
        const totalPaid = pieces.reduce((sum, p) => sum + p.montant_paye, 0);
        
        // Correct calculation for total remaining debt across all suppliers
        const totalInitialBalance = suppliers.reduce((sum, s) => sum + s.solde_initial, 0);
        const totalRemaining = (totalInitialBalance + totalBilled) - totalPaid;

        return { totalBilled, totalPaid, totalRemaining };
    }, [pieces, suppliers]);

    const columns = useMemo((): ColumnDef<PieceWithSupplierName>[] => {
      const dict = dictionary.table;
      return [
        {
          accessorKey: 'supplierName',
           header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              {dict.supplier}
              <ArrowUpDown className="ms-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => (
            <Link href={`/${lang}/suppliers/${row.original.supplier_id}`} className="font-medium text-primary hover:underline">
              {row.getValue('supplierName')}
            </Link>
          ),
        },
        {
          accessorKey: 'date',
          header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              {dict.date}
              <ArrowUpDown className="ms-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => <span suppressHydrationWarning>{formatDate(row.original.date, lang)}</span>,
          filterFn: (row: Row<PieceWithSupplierName>, columnId: string, value: any) => {
             const date = new Date(row.getValue(columnId));
             const { from, to } = value;
             if (!from) return true;
             // If to is not provided, check from start of 'from' day
             if (!to) {
                const fromDate = new Date(from);
                fromDate.setHours(0,0,0,0);
                return date >= fromDate;
             }
             const toDate = new Date(to);
             toDate.setHours(23,59,59,999);
             return date >= from && date <= toDate;
          },
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
          },
          filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
          },
        },
        {
          accessorKey: 'total_piece',
          header: () => <div className="text-end">{dict.total}</div>,
          cell: ({ row }) => {
            const amount = parseFloat(row.getValue('total_piece'));
            if(row.original.type === 'VERSEMENT') return <div className="text-end text-muted-foreground">-</div>
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
             if(row.original.type === 'VERSEMENT') return <div className="text-end text-muted-foreground">-</div>
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
    }, [lang, dictionary]);

  return (
    <>
      <PageHeader
        title={dictionary.title}
        description={dictionary.description}
      >
        <Button onClick={() => setIsNewPieceOpen(true)}>
          <PlusCircle className="me-2 h-4 w-4" />
          {dashboardDictionary.newPiece}
        </Button>
      </PageHeader>

        <div className="grid gap-2 md:grid-cols-3 mb-4">
             <StatCard 
                title={dictionary.totalBilled} 
                value={formatCurrencyWithLocale(totals.totalBilled, lang)}
                icon={<Receipt className="h-5 w-5"/>}
                cardClassName="bg-blue-50 border-blue-200"
                titleClassName="text-blue-800"
                valueClassName="text-blue-900"
                iconWrapperClassName="text-blue-700"
             />
             <StatCard 
                title={dictionary.totalPaid} 
                value={formatCurrencyWithLocale(totals.totalPaid, lang)}
                icon={<CreditCard className="h-5 w-5"/>}
                cardClassName="bg-green-50 border-green-200"
                titleClassName="text-green-800"
                valueClassName="text-green-900"
                iconWrapperClassName="text-green-700"
             />
             <StatCard 
                title={dictionary.totalRemaining} 
                value={formatCurrencyWithLocale(totals.totalRemaining, lang)}
                icon={<AlertCircle className="h-5 w-5"/>}
                cardClassName="bg-rose-50 border-rose-200"
                titleClassName="text-rose-800"
                valueClassName="text-rose-900"
                iconWrapperClassName="text-rose-700"
             />
        </div>

      <DataTable columns={columns} data={pieces} dictionary={dictionary.table} />

      {/* Edit/Delete Dialogs */}
      <Dialog open={dialogState.type === 'edit'} onOpenChange={closeDialogs}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{pieceFormDictionary.form.editTitle}</DialogTitle>
            <DialogDescription>
              {pieceFormDictionary.form.editDescription}
            </DialogDescription>
          </DialogHeader>
          <PieceForm 
            supplierId={dialogState.data?.supplier_id || ''} 
            pieceToEdit={dialogState.data}
            onClose={closeDialogs} 
            dictionary={pieceFormDictionary.form}
            formType={dialogState.data?.type === 'VERSEMENT' ? 'VERSEMENT' : 'PIECE'}
            addPieceAction={addPieceAction}
            updatePieceAction={updatePieceAction}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialogState.type === 'delete'} onOpenChange={closeDialogs}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{pieceFormDictionary.deleteDialog.title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {pieceFormDictionary.deleteDialog.description}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={closeDialogs}>{pieceFormDictionary.deleteDialog.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{pieceFormDictionary.deleteDialog.confirm}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <NewPieceDialog
          isOpen={isNewPieceOpen}
          onOpenChange={setIsNewPieceOpen}
          suppliers={suppliers}
          pieces={pieces}
          dictionary={dashboardDictionary}
          pieceFormDictionary={pieceFormDictionary.form}
          addPieceAction={addPieceAction}
          updatePieceAction={updatePieceAction}
        />
        <NewVersementDialog
          isOpen={isNewVersementOpen}
          onOpenChange={setIsNewVersementOpen}
          suppliers={suppliers}
          pieces={pieces}
          dictionary={dashboardDictionary}
          pieceFormDictionary={pieceFormDictionary.form}
          addPieceAction={addPieceAction}
          updatePieceAction={updatePieceAction}
        />
    </>
  );
}

    