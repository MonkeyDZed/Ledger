
'use client';

import { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { DateRange } from 'react-day-picker';
import { subDays, startOfMonth, endOfMonth, isEqual } from 'date-fns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Piece } from '@/lib/types';

type DataTableDictionary = {
    filterPlaceholder: string;
    typeAll: string;
    typeInvoice: string;
    typeBl: string;
    typeVersement: string;
    noResults: string;
    previous: string;
    next: string;
    dateFilter: {
        title: string;
        all: string;
        today: string;
        yesterday: string;
        thisMonth: string;
        custom: string;
        apply: string;
    }
    [key: string]: any;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  dictionary: DataTableDictionary;
}

const defaultDateRange: DateRange = { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };

export function DataTable<TData extends { type: Piece['type'] }, TValue>({
  columns,
  data,
  dictionary,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: 'date', value: defaultDateRange }
  ]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  useEffect(() => {
    const dateFilter = columnFilters.find(f => f.id === 'date');
    if (!dateFilter) {
        setDateRange(undefined);
    }
  }, [columnFilters]);


  const applyDateFilter = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range) {
        table.getColumn('date')?.setFilterValue(range);
    } else {
        table.getColumn('date')?.setFilterValue(undefined);
    }
  }

  const isChecked = (range?: { from: Date, to: Date }) => {
    if (!dateRange || !range) return !dateRange && !range;
    return isEqual(dateRange.from!, range.from) && isEqual(dateRange.to!, range.to);
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Input
          placeholder={dictionary.filterPlaceholder}
          value={(table.getColumn('supplierName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('supplierName')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
            value={(table.getColumn('type')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) => {
                if (value === 'all') {
                    table.getColumn('type')?.setFilterValue(undefined);
                } else {
                    table.getColumn('type')?.setFilterValue(value);
                }
            }}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={dictionary.typeAll} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{dictionary.typeAll || 'Toutes'}</SelectItem>
                <SelectItem value="FACTURE">{dictionary.typeInvoice || 'Facture'}</SelectItem>
                <SelectItem value="BL">{dictionary.typeBl || 'BL'}</SelectItem>
                <SelectItem value="VERSEMENT">{dictionary.typeVersement || 'Versement'}</SelectItem>
            </SelectContent>
        </Select>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ms-auto gap-2">
                    <Filter className="h-4 w-4" />
                    {dictionary.dateFilter.title}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem checked={!dateRange} onSelect={() => applyDateFilter(undefined)}>{dictionary.dateFilter.all}</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={isChecked({ from: new Date(new Date().setHours(0,0,0,0)), to: new Date(new Date().setHours(23,59,59,999)) })} onSelect={() => applyDateFilter({ from: new Date(new Date().setHours(0,0,0,0)), to: new Date(new Date().setHours(23,59,59,999)) })}>{dictionary.dateFilter.today}</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={isChecked({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) })} onSelect={() => applyDateFilter({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) })}>{dictionary.dateFilter.yesterday}</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={isChecked({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })} onSelect={() => applyDateFilter({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}>{dictionary.dateFilter.thisMonth}</DropdownMenuCheckboxItem>
                 <DropdownMenuSeparator />
                <Popover>
                    <PopoverTrigger asChild>
                         <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full hover:bg-accent">
                            {dictionary.dateFilter.custom}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={applyDateFilter}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </DropdownMenuContent>
        </DropdownMenu>

      </CardContent>
      <div className="border-t">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn({ "bg-emerald-50 hover:bg-emerald-100": row.original.type === 'VERSEMENT' })}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {dictionary.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {dictionary.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {dictionary.next}
        </Button>
      </div>
    </Card>
  );
}
