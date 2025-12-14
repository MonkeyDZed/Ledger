
'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import type { Supplier, Piece } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { FinancialOverviewChart } from '../../components/financial-overview-chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SupplierForm, type SupplierFormRef } from '../../components/supplier-form';
import { Sparkles, Users, FileText, CircleDollarSign, RefreshCw, UserPlus, FilePlus, HandCoins } from 'lucide-react';
import { NewPieceDialog } from './new-piece-dialog';
import { NewVersementDialog } from './new-versement-dialog';
import { formatCurrencyWithLocale } from '@/lib/formatters';
import type { addPiece, updatePiece } from '../../suppliers/[id]/actions';
import type { addSupplier, updateSupplier } from '../../suppliers/actions';

const QuickActionButton = ({ className, icon, label, onClick }: { className?: string, icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-primary transition-all text-center w-full active:scale-[0.98]">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${className}`}>
            {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
);

const EyeIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C3.732 4.943 7.523 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-7.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>
);
const PdfIcon = () => (
    <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 0h12a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V2a2 2 0 012-2zm2 9a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" fillRule="evenodd"></path></svg>
);
const CsvIcon = () => (
    <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1-1H3a1 1 0 01-1-1V3zm2 1v2h12V4H4zm0 4v2h12V8H4zm0 4v2h12v-2H4z"></path></svg>
);

interface DashboardClientPageProps {
  suppliers: Supplier[];
  pieces: Piece[];
  recentSuppliers: any[];
  dictionary: any;
  formDictionary: any;
  pieceFormDictionary: any;
  lang: 'fr' | 'ar';
  addPieceAction: typeof addPiece;
  updatePieceAction: typeof updatePiece;
  addSupplierAction: typeof addSupplier;
  updateSupplierAction: typeof updateSupplier;
}

export function DashboardClientPage({ suppliers, pieces, recentSuppliers, dictionary, formDictionary, pieceFormDictionary, lang, addPieceAction, updatePieceAction, addSupplierAction, updateSupplierAction }: DashboardClientPageProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isNewPieceOpen, setIsNewPieceOpen] = useState(false);
  const [isNewVersementOpen, setIsNewVersementOpen] = useState(false);
  const supplierFormRef = useRef<SupplierFormRef>(null);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAutoFill = () => {
    supplierFormRef.current?.autoFill();
  }

  const totalInitialBalance = suppliers.reduce((sum, s) => sum + s.solde_initial, 0);
  const totalInvoiced = pieces.reduce((sum, p) => p.type !== 'VERSEMENT' ? sum + p.total_piece : sum, 0);
  const totalPaid = pieces.reduce((sum, p) => sum + p.montant_paye, 0);
  const grandTotalDebt = totalInitialBalance + totalInvoiced - totalPaid;
  
  const totalPieces = pieces.filter(p => p.type !== 'VERSEMENT').length;
  const totalSuppliers = suppliers.length;

  const totalToPay = grandTotalDebt < 0 ? 0 : grandTotalDebt; 
  
  const grandTotal = totalPaid + totalToPay;


  return (
    <>
    <div className="space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href={`/${lang}/suppliers`} className="block active:scale-[0.98] transition-transform">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">{dictionary.suppliers}</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSuppliers}</div>
                    </CardContent>
                </Card>
            </Link>
            <Link href={`/${lang}/pieces`} className="block active:scale-[0.98] transition-transform">
                <Card>
                     <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">{dictionary.pieces}</CardTitle>
                        <FileText className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPieces}</div>
                    </CardContent>
                </Card>
            </Link>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-amber-600">{dictionary.totalDebts}</CardTitle>
                    <CircleDollarSign className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold font-mono" suppressHydrationWarning>{formatCurrencyWithLocale(grandTotalDebt, lang)}</div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">{dictionary.lastSync}</CardTitle>
                    <RefreshCw className="w-4 h-4 text-slate-500"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{dictionary.upToDate}</div>
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
                            <CardTitle>{dictionary.quickActions}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <QuickActionButton onClick={() => setIsNewSupplierOpen(true)} className="bg-blue-100 text-primary" icon={<UserPlus />} label={dictionary.addSupplier} />
                            <QuickActionButton onClick={() => setIsNewPieceOpen(true)} className="bg-green-100 text-green-600" icon={<FilePlus />} label={dictionary.newPiece} />
                            <QuickActionButton onClick={() => setIsNewVersementOpen(true)} className="bg-amber-100 text-amber-600" icon={<HandCoins />} label={dictionary.newPayment} />
                        </div>
                    </CardContent>
                </Card>
                
                {/* Recent Suppliers */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>{dictionary.recentSuppliers}</CardTitle>
                            <Link href={`/${lang}/suppliers`} className="text-sm text-primary font-medium">{dictionary.seeAll}</Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-y-auto relative h-[17rem]">
                            <Table>
                                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                                    <TableRow>
                                        <TableHead>{dictionary.supplierName}</TableHead>
                                        <TableHead>{dictionary.wilaya}</TableHead>
                                        <TableHead>{dictionary.totalInvoiced}</TableHead>
                                        <TableHead>{dictionary.remaining}</TableHead>
                                        <TableHead>{dictionary.action}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentSuppliers.map((supplier) => (
                                      <TableRow key={supplier.id} className="cursor-pointer">
                                          <TableCell>
                                              <div className="flex items-center">
                                                  <div className="flex-shrink-0 h-10 w-10">
                                                      <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-blue-100 text-blue-800 font-medium">{supplier.name.charAt(0)}</AvatarFallback>
                                                      </Avatar>
                                                  </div>
                                                  <div className="ms-4">
                                                      <Link href={`/${lang}/suppliers/${supplier.id}`} className="text-sm font-medium text-gray-900 hover:text-primary">{supplier.name}</Link>
                                                      <div className="text-sm text-gray-500">{dictionary.nif}: {supplier.nif}</div>
                                                  </div>
                                              </div>
                                          </TableCell>
                                          <TableCell className="text-sm text-gray-500">{supplier.wilaya}</TableCell>
                                          <TableCell className="text-sm font-medium text-gray-900 font-mono" suppressHydrationWarning>
                                            {formatCurrencyWithLocale(supplier.totalFromPieces, lang)}
                                          </TableCell>
                                          <TableCell suppressHydrationWarning>
                                            <Badge variant={supplier.totalDebt > 0 ? "destructive" : "default"} className={`${supplier.totalDebt > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'} font-mono`}>
                                              {formatCurrencyWithLocale(supplier.totalDebt, lang)}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                              <Button variant="ghost" size="icon" className="text-primary hover:text-blue-700" asChild>
                                                <Link href={`/${lang}/suppliers/${supplier.id}`}><EyeIcon /></Link>
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
                        <CardTitle>{dictionary.financialOverview}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FinancialOverviewChart 
                          data={{ paid: totalPaid, toPay: totalToPay }} 
                          paidLabel={dictionary.paid}
                          toPayLabel={dictionary.toPay}
                          currencyLabel={dictionary.currency}
                        />

                        <div className="space-y-4 mt-6">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 flex items-center"><span className="w-2 h-2 rounded-full bg-chart-2 me-2"></span>{dictionary.paid}</span>
                                    <span className="text-sm font-medium text-gray-900 font-mono" suppressHydrationWarning>{formatCurrencyWithLocale(totalPaid, lang)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-chart-2 h-2 rounded-full" style={{ width: `${((totalPaid/grandTotal) || 0) * 100}%` }}></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 flex items-center"><span className="w-2 h-2 rounded-full bg-chart-4 me-2"></span>{dictionary.toPay}</span>
                                    <span className="text-sm font-medium text-gray-900 font-mono" suppressHydrationWarning>{formatCurrencyWithLocale(totalToPay, lang)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-chart-4 h-2 rounded-full" style={{ width: `${((totalToPay/grandTotal) || 0) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <Button className="w-full btn-primary text-white">
                                <PdfIcon /> {dictionary.exportPdf}
                            </Button>
                            <Button variant="secondary" className="w-full mt-3 btn-secondary text-white">
                                <CsvIcon /> {dictionary.exportCsv}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
    
    {isMounted && (
      <>
        <Dialog open={isNewSupplierOpen} onOpenChange={setIsNewSupplierOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <div className="flex justify-between items-center">
                  <DialogTitle>{formDictionary.addTitle}</DialogTitle>
                  <Button variant="outline" size="sm" onClick={handleAutoFill} className="gap-2">
                      <Sparkles className="h-4 w-4" /> {formDictionary.autoFill}
                  </Button>
              </div>
              <CardDescription>
                {formDictionary.addDescription}
              </CardDescription>
            </DialogHeader>
            <SupplierForm 
              ref={supplierFormRef} 
              onClose={() => setIsNewSupplierOpen(false)} 
              dictionary={formDictionary} 
              addSupplierAction={addSupplierAction}
              updateSupplierAction={updateSupplierAction}
             />
          </DialogContent>
        </Dialog>

        <NewPieceDialog
          isOpen={isNewPieceOpen}
          onOpenChange={setIsNewPieceOpen}
          suppliers={suppliers}
          pieces={pieces}
          dictionary={dictionary}
          pieceFormDictionary={pieceFormDictionary}
          addPieceAction={addPieceAction}
          updatePieceAction={updatePieceAction}
        />
        <NewVersementDialog
          isOpen={isNewVersementOpen}
          onOpenChange={setIsNewVersementOpen}
          suppliers={suppliers}
          pieces={pieces}
          dictionary={dictionary}
          pieceFormDictionary={pieceFormDictionary}
          addPieceAction={addPieceAction}
          updatePieceAction={updatePieceAction}
         />
      </>
    )}
    </>
  );
}

    