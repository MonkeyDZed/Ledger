'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Supplier } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type SupplierWithDebt = Supplier & { totalDebt: number };

type ColumnsProps = {
  onEdit: (supplier: SupplierWithDebt) => void;
  onDelete: (supplier: SupplierWithDebt) => void;
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<SupplierWithDebt>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link href={`/suppliers/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.getValue('name')}
      </Link>
    ),
  },
  {
    accessorKey: 'wilaya',
    header: 'Wilaya',
  },
  {
    accessorKey: 'phone',
    header: 'Téléphone',
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
              Créance Totale
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
                <span className="sr-only">Ouvrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(supplier.id)}>
                Copier ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href={`/suppliers/${supplier.id}`}>
                <DropdownMenuItem>Voir la situation</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => onEdit(supplier)}>Modifier</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(supplier)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
