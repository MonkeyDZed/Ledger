
'use client';

import { PageHeader } from '@/components/page-header';
import { DataTable } from './data-table';
import type { Piece } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColumnDef, Row, FilterFn } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { formatCurrencyWithLocale } from '@/lib/formatters';

type Locale = 'fr' | 'ar';
type PieceWithSupplierName = Piece & { supplierName: string; formattedDate: string; };

interface ClientPageProps {
  pieces: PieceWithSupplierName[];
  dictionary: any; // Changed from PiecesPageDictionary
  lang: Locale;
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

const dateBetweenFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  value: DateRange,
  addMeta: (meta: any) => void
) => {
  const date = new Date(row.getValue(columnId));
  const { from, to } = value;
  if (!from && !to) return true;
  if (from && to) return isWithinInterval(date, { start: startOfDay(from), end: endOfDay(to) });
  return true;
};


export function ClientPage({ pieces, dictionary, lang }: ClientPageProps) {

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
          cell: ({ row }) => row.original.formattedDate,
          filterFn: dateBetweenFilterFn,
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
          cell: () => {
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
                    <DropdownMenuItem>{dict.edit}</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10">{dict.delete}</DropdownMenuItem>
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
    </>
  );
}
