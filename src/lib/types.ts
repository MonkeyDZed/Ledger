export type Supplier = {
  id: string;
  name: string;
  wilaya: string;
  phone: string;
  nif: string;
  bank_info: string;
  solde_initial: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type Piece = {
  id: string;
  supplier_id: string;
  date: string;
  type: 'BL' | 'FACTURE' | 'VERSEMENT';
  total_piece: number;
  montant_paye: number;
  reste: number;
  description: string;
  payment_method?: 'espece' | 'cheque' | 'virement' | 'traite';
  created_at: string;
  updated_at: string;
};
