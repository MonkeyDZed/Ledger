import { suppliers, pieces } from '@/lib/data';
import type { Supplier } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDown, Users, Banknote, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { DebtDistributionChart } from './components/debt-distribution-chart';

export default function DashboardPage() {
  const supplierDebts = suppliers.map((supplier) => {
    const supplierPieces = pieces.filter((p) => p.supplier_id === supplier.id);
    const totalFromPieces = supplierPieces.reduce((sum, p) => sum + p.total_piece, 0);
    const paidFromPieces = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const balanceFromPieces = totalFromPieces - paidFromPieces;
    const totalDebt = supplier.solde_initial + balanceFromPieces;
    return { ...supplier, totalDebt };
  });

  const grandTotalDebt = supplierDebts.reduce((sum, s) => sum + s.totalDebt, 0);
  const totalSuppliers = suppliers.length;
  const suppliersInCredit = supplierDebts.filter(s => s.totalDebt < 0).length;

  const chartData = supplierDebts
    .filter(s => s.totalDebt > 0)
    .sort((a,b) => b.totalDebt - a.totalDebt)
    .slice(0, 5)
    .map(s => ({
        name: s.name,
        debt: s.totalDebt
    }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Situation globale de vos créances fournisseurs."
      >
        <Button>
          <FileDown className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créance Totale</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(grandTotalDebt)} DZD</div>
            <p className="text-xs text-muted-foreground">Solde global de tous les fournisseurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Fournisseurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">Total des fournisseurs enregistrés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs en Crédit</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliersInCredit}</div>
            <p className="text-xs text-muted-foreground">Fournisseurs avec un solde négatif</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
            <CardHeader>
            <CardTitle>Situation par Fournisseur</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Wilaya</TableHead>
                    <TableHead className="text-right">Créance Totale (DZD)</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {supplierDebts.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-muted/50">
                    <TableCell>
                        <Link href={`/suppliers/${supplier.id}`} className="font-medium text-primary hover:underline">
                        {supplier.name}
                        </Link>
                    </TableCell>
                    <TableCell>{supplier.wilaya}</TableCell>
                    <TableCell className={`text-right font-mono ${supplier.totalDebt > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {formatCurrency(supplier.totalDebt)}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>

         <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center gap-2 space-y-0">
               <TrendingUp className="h-5 w-5 text-accent" />
               <CardTitle className="text-lg">Top 5 Créances</CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <DebtDistributionChart data={chartData} />
                ) : (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                        Aucune créance à afficher.
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
