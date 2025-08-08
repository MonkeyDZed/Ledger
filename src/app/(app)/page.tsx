import { suppliers, pieces } from '@/lib/data';
import type { Supplier } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Users, FileText, Banknote, FileDown, PlusCircle, Eye } from 'lucide-react';
import { FinancialOverviewChart } from './components/financial-overview-chart';

export default function DashboardPage() {
  const supplierDebts = suppliers.map((supplier) => {
    const supplierPieces = pieces.filter((p) => p.supplier_id === supplier.id);
    const totalFromPieces = supplierPieces.reduce((sum, p) => sum + p.total_piece, 0);
    const paidFromPieces = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const balanceFromPieces = totalFromPieces - paidFromPieces;
    const totalDebt = supplier.solde_initial + balanceFromPieces;
    return { ...supplier, totalDebt, totalFromPieces };
  });

  const grandTotalDebt = supplierDebts.reduce((sum, s) => sum + s.totalDebt, 0);
  const totalPieces = pieces.length;
  const totalSuppliers = suppliers.length;

  const totalPaid = pieces.reduce((sum, p) => sum + p.montant_paye, 0);
  const totalToPay = pieces.reduce((sum,p) => sum + p.reste, 0);

  const recentSuppliers = [...supplierDebts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);

  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-8 space-y-8">
        {/* Header Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSuppliers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pièces</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPieces}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Créance Totale</CardTitle>
              <Banknote className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(grandTotalDebt)}</div>
              <p className="text-xs text-muted-foreground">DZD</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" size="lg" className="flex-col h-auto py-4">
              <PlusCircle className="h-8 w-8 mb-2 text-primary" />
              <span>Ajout Fournisseur</span>
            </Button>
            <Button variant="outline" size="lg" className="flex-col h-auto py-4">
              <PlusCircle className="h-8 w-8 mb-2 text-accent" />
              <span>Nouvelle Pièce</span>
            </Button>
            <Button variant="outline" size="lg" className="flex-col h-auto py-4">
              <FileDown className="h-8 w-8 mb-2 text-muted-foreground" />
              <span>Exporter</span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Suppliers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fournisseurs Récents</CardTitle>
            <Link href="/suppliers" className="text-sm font-medium text-primary hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Wilaya</TableHead>
                  <TableHead className="text-right">Total Facturé</TableHead>
                  <TableHead className="text-right">Reste</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                           <AvatarFallback className="bg-primary/10 text-primary">{supplier.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/suppliers/${supplier.id}`} className="font-medium text-foreground hover:underline">
                            {supplier.name}
                          </Link>
                          <div className="text-xs text-muted-foreground font-mono">{supplier.nif}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{supplier.wilaya}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(supplier.totalFromPieces)}</TableCell>
                    <TableCell className="text-right font-mono">
                       <Badge variant={supplier.totalDebt > 0 ? "destructive" : "secondary"} className="font-semibold">
                         {formatCurrency(supplier.totalDebt)}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <Button variant="ghost" size="icon" asChild>
                         <Link href={`/suppliers/${supplier.id}`}>
                           <Eye className="h-5 w-5" />
                         </Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-4 space-y-8">
        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Vue Financière</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <FinancialOverviewChart data={{ paid: totalPaid, toPay: totalToPay }} />
             <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Payé</span>
                    <span className="font-medium">{formatCurrency(totalPaid)} DA</span>
                </div>
                 <div className="flex justify-between">
                    <span>Reste à payer</span>
                    <span className="font-medium">{formatCurrency(totalToPay)} DA</span>
                </div>
             </div>
             <div className="flex flex-col gap-2">
                <Button><FileDown className="mr-2 h-4 w-4" /> Exporter PDF</Button>
                <Button variant="secondary"><FileDown className="mr-2 h-4 w-4" /> Exporter CSV</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
