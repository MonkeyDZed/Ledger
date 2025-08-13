
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Piece } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Dictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';

type PieceWithSupplierName = Piece & { supplierName: string };

export const columns = (dict: Dictionary['piecesPage']['table'], lang: Locale): ColumnDef<PieceWithSupplierName>[] => [
  {
    accessorKey: 'supplierName',
     header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        {dict.supplier}
        <ArrowUpDown className="ml-2 h-4 w-4" />
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
        <ArrowUpDown className="ml-2 h-4 w-4" />
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
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'total_piece',
    header: () => <div className="text-right">{dict.total}</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total_piece'));
      return <div className="text-right font-mono">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: 'montant_paye',
    header: () => <div className="text-right">{dict.paid}</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('montant_paye'));
      return <div className="text-right font-mono text-green-600">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: 'reste',
    header: () => <div className="text-right">{dict.remaining}</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('reste'));
      return <div className="text-right font-mono text-destructive">{formatCurrency(amount)}</div>;
    },
  },
  {
    id: 'actions',
    cell: () => {
      return (
        <div className="text-right">
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
