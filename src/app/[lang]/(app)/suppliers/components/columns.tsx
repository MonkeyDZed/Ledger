
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Supplier } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Dictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';

type SupplierWithDebt = Supplier & { 
  totalDebt: number;
  totalInvoiced: number;
  totalPaid: number;
};

type ColumnsProps = {
  onEdit: (supplier: SupplierWithDebt) => void;
  onDelete: (supplier: SupplierWithDebt) => void;
  dict: Dictionary['suppliersPage']['table'];
  lang: Locale;
}

export const columns = ({ onEdit, onDelete, dict, lang }: ColumnsProps): ColumnDef<SupplierWithDebt>[] => {
    
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
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
    header: () => <div className="text-right">{dict.totalInvoiced}</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalInvoiced'));
      return <div className="text-right font-mono">{formatCurrency(amount)} DZD</div>;
    },
  },
  {
    accessorKey: 'totalPaid',
    header: () => <div className="text-right">{dict.totalPaid}</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalPaid'));
      return <div className="text-right font-mono text-green-600">{formatCurrency(amount)} DZD</div>;
    },
  },
  {
    accessorKey: 'totalDebt',
    header: ({ column }) => {
       return (
        <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {dict.totalDebt}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalDebt'));
      return <div className="text-right font-mono">
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(supplier.id)}>
                {dict.copyId}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href={`/${lang}/suppliers/${supplier.id}`}>
                <DropdownMenuItem>{dict.viewDetails}</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => onEdit(supplier)}>{dict.edit}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(supplier)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">{dict.delete}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
}
