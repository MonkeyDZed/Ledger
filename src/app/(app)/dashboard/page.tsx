

import { getSuppliers, getPieces } from '@/lib/db';
import type { Supplier } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { FinancialOverviewChart } from '../components/financial-overview-chart';


const StatCardIcon = ({ className, children }: { className?: string, children: React.ReactNode }) => (
    <div className={`p-3 rounded-lg ${className}`}>
        {children}
    </div>
);

const QuickActionButton = ({ className, icon, label }: { className?: string, icon: React.ReactNode, label: string }) => (
    <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-primary transition-all">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${className}`}>
            {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
);

const UsersIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
);
const FileInvoiceIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
);
const MoneyBillWaveIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l3 3a1 1 0 001.414-1.414L10.414 13H15a1 1 0 001-1v-2a1 1 0 00-1-1h-.586l1.293-1.293a1 1 0 00-1.414-1.414l-7-7z"></path></svg>
);
const UserPlusIcon = () => (
     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z"></path></svg>
);
const FileInvoiceDollarIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.414 4.586a2 2 0 112.828 2.828L13.03 10.687a1 1 0 01-1.414 0L9.414 8.586a2 2 0 112.828-2.828L13.414 4.586zM1 12a1 1 0 011-1h16a1 1 0 110 2H2a1 1 0 01-1-1z"></path><path d="M4 2a1 1 0 011 1v1h10V3a1 1 0 112 0v1a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h1V3a1 1 0 011-1z"></path></svg>
);
const FileExportIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"></path></svg>
);
const EyeIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C3.732 4.943 7.523 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-7.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>
);
const PdfIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 0h12a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V2a2 2 0 012-2zm2 9a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" fillRule="evenodd"></path></svg>
);
const CsvIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 1v2h12V4H4zm0 4v2h12V8H4zm0 4v2h12v-2H4z"></path></svg>
);


export default async function DashboardPage() {
  const suppliers = await getSuppliers();
  const pieces = await getPieces();

  const supplierDebts = await Promise.all(suppliers.map(async (supplier) => {
    const supplierPieces = pieces.filter((p) => p.supplier_id === supplier.id);
    const totalFromPieces = supplierPieces.reduce((sum, p) => sum + p.total_piece, 0);
    const paidFromPieces = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const balanceFromPieces = totalFromPieces - paidFromPieces;
    const totalDebt = supplier.solde_initial + balanceFromPieces;
    return { ...supplier, totalDebt, totalFromPieces };
  }));

  const grandTotalDebt = supplierDebts.reduce((sum, s) => sum + s.totalDebt, 0);
  const totalPieces = pieces.length;
  const totalSuppliers = suppliers.length;

  const totalPaid = pieces.reduce((sum, p) => sum + p.montant_paye, 0);
  const totalToPay = pieces.reduce((sum,p) => sum + p.reste, 0);
  const grandTotal = totalPaid + totalToPay;

  const recentSuppliers = [...supplierDebts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);

  return (
    <div className="space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardContent className="flex items-center p-6">
                    <StatCardIcon className="bg-blue-100 text-primary"><UsersIcon /></StatCardIcon>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Fournisseurs</p>
                        <p className="text-2xl font-semibold text-gray-900">{totalSuppliers}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center p-6">
                    <StatCardIcon className="bg-green-100 text-secondary"><FileInvoiceIcon /></StatCardIcon>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pièces</p>
                        <p className="text-2xl font-semibold text-gray-900">{totalPieces}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center p-6">
                    <StatCardIcon className="bg-amber-100 text-amber-500"><MoneyBillWaveIcon /></StatCardIcon>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Créances totales</p>
                        <p className="text-2xl font-semibold text-gray-900">{formatCurrency(grandTotalDebt)} DA</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardContent className="flex items-center p-6">
                    <StatCardIcon className="bg-rose-100 text-rose-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 0V3a1 1 0 112 0v2.101a7.002 7.002 0 01-11.898 0V3a1 1 0 01-1-1zM10 18a7.002 7.002 0 006.323-3.676l-1.226-1.226A4.985 4.985 0 0110 14.95a4.985 4.985 0 01-5.1-3.852l-1.226 1.226A7.002 7.002 0 0010 18z" clipRule="evenodd"></path></svg>
                    </StatCardIcon>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Dernière synchro</p>
                        <p className="text-2xl font-semibold text-gray-900">À jour</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
                {/* Quick Actions */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Actions Rapides</h2>
                            <Link href="#" className="text-sm text-primary font-medium">Voir tout</Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <QuickActionButton className="bg-blue-100 text-primary" icon={<UserPlusIcon />} label="Ajout Fournisseur" />
                            <QuickActionButton className="bg-green-100 text-secondary" icon={<FileInvoiceDollarIcon />} label="Nouvelle Pièce" />
                            <QuickActionButton className="bg-amber-100 text-amber-500" icon={<FileExportIcon />} label="Exporter" />
                        </div>
                    </CardContent>
                </Card>
                
                {/* Recent Suppliers */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Fournisseurs Récents</h2>
                            <Link href="/suppliers" className="text-sm text-primary font-medium">Voir tout</Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Wilaya</TableHead>
                                        <TableHead>Total Facturé</TableHead>
                                        <TableHead>Reste</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentSuppliers.map((supplier) => (
                                      <TableRow key={supplier.id}>
                                          <TableCell>
                                              <div className="flex items-center">
                                                  <div className="flex-shrink-0 h-10 w-10">
                                                      <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-blue-100 text-blue-800 font-medium">{supplier.name.charAt(0)}</AvatarFallback>
                                                      </Avatar>
                                                  </div>
                                                  <div className="ml-4">
                                                      <Link href={`/suppliers/${supplier.id}`} className="text-sm font-medium text-gray-900 hover:text-primary">{supplier.name}</Link>
                                                      <div className="text-sm text-gray-500">NIF: {supplier.nif}</div>
                                                  </div>
                                              </div>
                                          </TableCell>
                                          <TableCell className="text-sm text-gray-500">{supplier.wilaya}</TableCell>
                                          <TableCell className="text-sm font-medium text-gray-900">{formatCurrency(supplier.totalFromPieces)} DA</TableCell>
                                          <TableCell>
                                            <Badge variant={supplier.totalDebt > 0 ? "destructive" : "default"} className={`${supplier.totalDebt > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                              {formatCurrency(supplier.totalDebt)} DA
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                              <Button variant="ghost" size="icon" className="text-primary hover:text-blue-700" asChild>
                                                <Link href={`/suppliers/${supplier.id}`}><EyeIcon /></Link>
                                              </Button>
                                          </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
                {/* Financial Overview */}
                <Card className="mb-8">
                     <CardHeader>
                        <h2 className="text-lg font-semibold text-gray-900">Vue Financière</h2>
                    </CardHeader>
                    <CardContent>
                        <FinancialOverviewChart data={{ paid: totalPaid, toPay: totalToPay }} />

                        <div className="space-y-4 mt-6">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 flex items-center"><span className="w-2 h-2 rounded-full bg-chart-2 mr-2"></span>Payé</span>
                                    <span className="text-sm font-medium text-gray-900">{formatCurrency(totalPaid)} DA</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-chart-2 h-2 rounded-full" style={{ width: `${((totalPaid/grandTotal) || 0) * 100}%` }}></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 flex items-center"><span className="w-2 h-2 rounded-full bg-chart-4 mr-2"></span>Reste à payer</span>
                                    <span className="text-sm font-medium text-gray-900">{formatCurrency(totalToPay)} DA</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-chart-4 h-2 rounded-full" style={{ width: `${((totalToPay/grandTotal) || 0) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <Button className="w-full btn-primary text-white">
                                <PdfIcon /> Exporter PDF
                            </Button>
                            <Button variant="secondary" className="w-full mt-3 btn-secondary text-white">
                                <CsvIcon /> Exporter CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
