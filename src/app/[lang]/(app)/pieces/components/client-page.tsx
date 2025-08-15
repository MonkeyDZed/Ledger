
'use client';

import { PageHeader } from '@/components/page-header';
import { DataTable } from './data-table';
import type { Piece } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deletePiece } from '../../suppliers/[id]/actions';
import { PieceForm } from '../../components/piece-form';
import { formatCurrencyWithLocale, formatDate } from '@/lib/formatters';


type PieceWithSupplierName = Piece & { supplierName: string; };

interface ClientPageProps {
  pieces: PieceWithSupplierName[];
  dictionary: any;
  pieceFormDictionary: any;
  schemaDictionary: any;
  lang: 'fr' | 'ar';
}

const StatCard = ({ title, value }: { title: string, value: string }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
        </CardContent>
    </Card>
);

export function ClientPage({ pieces, dictionary, pieceFormDictionary, schemaDictionary, lang }: ClientPageProps) {
    const { toast } = useToast();
    const [dialogState, setDialogState] = useState<{
        type: 'edit' | 'delete' | null;
        data?: PieceWithSupplierName;
    }>({ type: null });

    const openDialog = (type: 'edit' | 'delete', data: PieceWithSupplierName) => {
        setDialogState({ type, data });
    };
    const closeDialogs = () => setDialogState({ type: null });

    const handleDelete = async () => {
        if (dialogState.type !== 'delete' || !dialogState.data) return;

        const result = await deletePiece(dialogState.data.id, dialogState.data.supplier_id);
        if (result.success) {
            toast({
                title: pieceFormDictionary.form.toast.deleteSuccess.title,
                description: pieceFormDictionary.form.toast.deleteSuccess.description,
            });
        } else {
            toast({
                title: pieceFormDictionary.form.toast.error.title,
                description: result.message || pieceFormDictionary.form.toast.error.description,
                variant: "destructive",
            });
        }
        closeDialogs();
    };

    const totals = useMemo(() => {
        const totalBilled = pieces.reduce((sum, p) => sum + p.total_piece, 0);
        const totalPaid = pieces.reduce((sum, p) => sum + p.montant_paye, 0);
        const totalRemaining = pieces.reduce((sum, p) => sum + p.reste, 0);
        return { totalBilled, totalPaid, totalRemaining };
    }, [pieces]);

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
          cell: ({ row }) => formatDate(row.original.date, lang),
          filterFn: (row: Row<PieceWithSupplierName>, columnId: string, value: any) => {
             const date = new Date(row.getValue(columnId));
             const { from, to } = value;
             if (!from) return true;
             if (!to) return date >= from;
             return date >= from && date <= to;
          },
        },
        {
          accessorKey: 'type',
          header: dict.type,
          cell: ({ row }) => {
              const type = row.getValue('type') as string;
              return <Badge variant={type === 'FACTURE' ? 'secondary' : 'outline'}>{type}</Badge>
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
            return <div className="text-end font-mono">{formatCurrencyWithLocale(amount, lang, dictionary)}</div>;
          },
        },
        {
          accessorKey: 'montant_paye',
          header: () => <div className="text-end">{dict.paid}</div>,
          cell: ({ row }) => {
            const amount = parseFloat(row.getValue('montant_paye'));
            return <div className="text-end font-mono text-green-600">{formatCurrencyWithLocale(amount, lang, dictionary)}</div>;
          },
        },
        {
          accessorKey: 'reste',
          header: () => <div className="text-end">{dict.remaining}</div>,
          cell: ({ row }) => {
            const amount = parseFloat(row.getValue('reste'));
            return <div className="text-end font-mono text-destructive">{formatCurrencyWithLocale(amount, lang, dictionary)}</div>;
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
      />

        <div className="grid gap-6 md:grid-cols-3 mb-8">
            <StatCard title={dictionary.totalBilled} value={`${formatCurrencyWithLocale(totals.totalBilled, lang, dictionary)}`} />
            <StatCard title={dictionary.totalPaid} value={`${formatCurrencyWithLocale(totals.totalPaid, lang, dictionary)}`} />
            <Card className="bg-amber-50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">{dictionary.totalRemaining}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-amber-900 font-mono">{formatCurrencyWithLocale(totals.totalRemaining, lang, dictionary)}</p>
                </CardContent>
            </Card>
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
            schemaDictionary={schemaDictionary}
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
    </>
  );
}
