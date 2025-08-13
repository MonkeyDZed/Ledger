
'use client';

import { PageHeader } from '@/components/page-header';
import { DataTable } from './data-table';
import { columns } from './columns';
import type { Piece, Supplier } from '@/lib/types';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PieceWithSupplierName = Piece & { supplierName: string };

interface ClientPageProps {
  pieces: PieceWithSupplierName[];
}

const StatCard = ({ title, value }: { title: string, value: string }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold font-mono text-gray-900">{value}</p>
        </CardContent>
    </Card>
);

export function ClientPage({ pieces }: ClientPageProps) {
    const totals = useMemo(() => {
        const totalBilled = pieces.reduce((sum, p) => sum + p.total_piece, 0);
        const totalPaid = pieces.reduce((sum, p) => sum + p.montant_paye, 0);
        const totalRemaining = pieces.reduce((sum, p) => sum + p.reste, 0);
        return { totalBilled, totalPaid, totalRemaining };
    }, [pieces]);

  return (
    <>
      <PageHeader
        title="Pièces"
        description="Consultez et gérez toutes les pièces enregistrées."
      />

        <div className="grid gap-6 md:grid-cols-3 mb-8">
            <StatCard title="Total Facturé" value={`${formatCurrency(totals.totalBilled)} DZD`} />
            <StatCard title="Total Payé" value={`${formatCurrency(totals.totalPaid)} DZD`} />
            <Card className="bg-amber-50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">Total Restant</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold font-mono text-amber-900">{formatCurrency(totals.totalRemaining)} DZD</p>
                </CardContent>
            </Card>
        </div>

      <DataTable columns={columns} data={pieces} />
    </>
  );
}
