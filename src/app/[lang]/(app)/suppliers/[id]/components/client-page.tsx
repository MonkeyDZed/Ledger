
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { DataTable } from './data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PieceForm } from '../../../components/piece-form';
import type { Supplier, Piece } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deletePiece } from '../actions';
import { useParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Dictionary } from '@/lib/dictionaries';


type Locale = 'fr' | 'ar';


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
const FileTextIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1H6z" clipRule="evenodd"></path></svg>;
const BanknoteIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 4a1 1 0 011 1v1.586l5.293-5.293a1 1 0 111.414 1.414L12.414 7H14a1 1 0 011 1v6a1 1 0 01-1 1h-1.586l5.293 5.293a1 1 0 11-1.414 1.414L10 13.414V15a1 1 0 01-1 1H8a1 1 0 01-1-1v-1.586l-5.293 5.293a1 1 0 11-1.414-1.414L7.586 13H6a1 1 0 01-1-1V6a1 1 0 011-1h1.586L2.293 1.293a1 1 0 111.414-1.414L10 4z"></path></svg>;


interface ClientPageProps {
  supplier: Supplier;
  pieces: Piece[];
  dictionary: Dictionary['supplierDetailPage'];
}

export function ClientPage({ supplier, pieces, dictionary }: ClientPageProps) {
  const { toast } = useToast();
  const [dialogState, setDialogState] = useState<{
    type: 'new' | 'edit' | 'delete' | null;
    data?: Piece;
  }>({ type: null });

  const params = useParams();
  const lang = params.lang as Locale;

  const openDialog = (type: 'new' | 'edit' | 'delete', data?: Piece) => {
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
        cell: ({ row }) => formatDate(row.getValue('date'), lang),
      },
      {
        accessorKey: 'type',
        header: dict.type,
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            return <Badge variant={type === 'FACTURE' ? 'secondary' : 'outline'}>{type}</Badge>
        }
      },
      {
        accessorKey: 'description',
        header: dict.description,
      },
      {
        accessorKey: 'total_piece',
        header: () => <div className="text-end">{dict.total}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('total_piece'));
          return <div className="text-end font-mono">{formatCurrency(amount)}</div>;
        },
      },
      {
        accessorKey: 'montant_paye',
        header: () => <div className="text-end">{dict.paid}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('montant_paye'));
          return <div className="text-end font-mono text-green-600">{formatCurrency(amount)}</div>;
        },
      },
      {
        accessorKey: 'reste',
        header: () => <div className="text-end">{dict.remaining}</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('reste'));
          return <div className="text-end font-mono text-destructive">{formatCurrency(amount)}</div>;
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
  }, [lang, dictionary.piecesTable, handleDelete]);


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
        <Button onClick={() => openDialog('new')}>
          <PlusCircle className="me-2 h-4 w-4" />
          {dictionary.header.newPieceButton}
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title={dictionary.stats.initialBalance} value={`${formatCurrency(supplier.solde_initial)} DZD`} icon={<BadgeCentIcon />} />
        <StatCard title={dictionary.stats.totalInvoiced} value={`${formatCurrency(totalFromPieces)} DZD`} icon={<FileTextIcon />} />
        <StatCard title={dictionary.stats.totalPaid} value={`${formatCurrency(paidFromPieces)} DZD`} icon={<BanknoteIcon />} />
        <Card className="bg-blue-50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary flex justify-between items-center">
                    {dictionary.stats.totalDebt}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className={`text-2xl font-bold font-mono ${totalDebt > 0 ? 'text-rose-600' : 'text-green-600'}`}>{formatCurrency(totalDebt)} DZD</p>
                <CardDescription>{dictionary.stats.debtDescription}</CardDescription>
            </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle>{dictionary.info.title}</CardTitle></CardHeader>
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
      
      <Dialog open={dialogState.type === 'new' || dialogState.type === 'edit'} onOpenChange={closeDialogs}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{dialogState.type === 'edit' ? dictionary.form.editTitle : dictionary.form.addTitle}</DialogTitle>
            <DialogDescription>
              {dialogState.type === 'edit' ? dictionary.form.editDescription : dictionary.form.addDescription}
            </DialogDescription>
          </DialogHeader>
          <PieceForm 
            supplierId={supplier.id} 
            pieceToEdit={dialogState.data}
            onClose={closeDialogs} 
            dictionary={dictionary.form}
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
