'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, FileDown, ArrowLeft, Banknote, FileText, BadgeCent } from 'lucide-react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PieceForm } from './piece-form';
import type { Supplier, Piece } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ClientPageProps {
  supplier: Supplier;
  pieces: Piece[];
}

export function ClientPage({ supplier, pieces }: ClientPageProps) {
  const [isNewPieceOpen, setIsNewPieceOpen] = useState(false);

  const totalFromPieces = pieces.reduce((sum, p) => sum + p.total_piece, 0);
  const paidFromPieces = pieces.reduce((sum, p) => sum + p.montant_paye, 0);
  const balanceFromPieces = totalFromPieces - paidFromPieces;
  const totalDebt = supplier.solde_initial + balanceFromPieces;

  return (
    <>
      <PageHeader
        title={supplier.name}
        description={`Situation détaillée pour ${supplier.name}`}
      >
        <Button variant="outline" asChild>
          <Link href="/suppliers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        <Button onClick={() => setIsNewPieceOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle Pièce
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Solde Initial</CardTitle>
                <BadgeCent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold font-mono">{formatCurrency(supplier.solde_initial)} DZD</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Total Facturé</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold font-mono">{formatCurrency(totalFromPieces)} DZD</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Total Payé</CardTitle>
                 <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold font-mono">{formatCurrency(paidFromPieces)} DZD</p>
            </CardContent>
        </Card>
        <Card className="bg-primary/5">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-primary">Créance Totale</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={`text-2xl font-bold font-mono ${totalDebt > 0 ? 'text-destructive' : 'text-green-600'}`}>{formatCurrency(totalDebt)} DZD</p>
                <CardDescription>Solde initial + solde des pièces</CardDescription>
            </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle>Informations du Fournisseur</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div><strong>Wilaya:</strong> {supplier.wilaya}</div>
            <div><strong>Téléphone:</strong> {supplier.phone}</div>
            <div><strong>NIF:</strong> <span className="font-mono">{supplier.nif}</span></div>
            <div><strong>Banque:</strong> <span className="font-mono">{supplier.bank_info}</span></div>
            <div className="md:col-span-2"><strong>Notes:</strong> {supplier.notes || 'N/A'}</div>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={pieces} />

      <Dialog open={isNewPieceOpen} onOpenChange={setIsNewPieceOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle pièce</DialogTitle>
            <DialogDescription>
              Saisissez les détails de la facture ou du bon de livraison.
            </DialogDescription>
          </DialogHeader>
          <PieceForm supplierId={supplier.id} onClose={() => setIsNewPieceOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
