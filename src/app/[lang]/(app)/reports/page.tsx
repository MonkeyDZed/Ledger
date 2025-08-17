
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart } from 'recharts';
import { Calendar, FileText, TrendingUp, DollarSign, Users, Download, Eye, AlertCircle } from 'lucide-react';

// Données simulées pour démonstration
const mockSuppliers = [
  { id: 1, name: "SARL Matériaux Nord", wilaya: "Alger", soldeInitial: 150000, totalFacture: 850000, totalPaye: 700000, creanceTotale: 300000 },
  { id: 2, name: "Entreprise Bâtiment Est", wilaya: "Constantine", soldeInitial: 75000, totalFacture: 520000, totalPaye: 480000, creanceTotale: 115000 },
  { id: 3, name: "Fournitures Industrielles", wilaya: "Oran", soldeInitial: 200000, totalFacture: 1200000, totalPaye: 1100000, creanceTotale: 300000 },
  { id: 4, name: "Transport & Logistique", wilaya: "Tlemcen", soldeInitial: 50000, totalFacture: 300000, totalPaye: 320000, creanceTotale: 30000 },
  { id: 5, name: "Équipements Modernes", wilaya: "Alger", soldeInitial: 100000, totalFacture: 650000, totalPaye: 550000, creanceTotale: 200000 }
];

const mockTransactions = [
  { date: '2025-01', entrees: 450000, sorties: 380000 },
  { date: '2025-02', entrees: 520000, sorties: 420000 },
  { date: '2025-03', entrees: 380000, sorties: 450000 },
  { date: '2025-04', entrees: 620000, sorties: 580000 },
  { date: '2025-05', entrees: 480000, sorties: 520000 },
  { date: '2025-06', entrees: 550000, sorties: 480000 }
];

const mockPaymentMethods = [
  { name: 'Chèque', value: 45, amount: 2250000, color: '#3b82f6' },
  { name: 'Virement', value: 30, amount: 1500000, color: '#10b981' },
  { name: 'Espèce', value: 15, amount: 750000, color: '#f59e0b' },
  { name: 'Traite', value: 10, amount: 500000, color: '#ef4444' }
];

const mockRecentTransactions = [
  { date: '2025-08-15', supplier: 'SARL Matériaux Nord', type: 'FACTURE', amount: 125000 },
  { date: '2025-08-14', supplier: 'Entreprise Bâtiment Est', type: 'VERSEMENT', amount: -80000 },
  { date: '2025-08-13', supplier: 'Fournitures Industrielles', type: 'BL', amount: 95000 },
  { date: '2025-08-12', supplier: 'Transport & Logistique', type: 'VERSEMENT', amount: -60000 },
  { date: '2025-08-11', supplier: 'Équipements Modernes', type: 'FACTURE', amount: 150000 }
];

const formatCurrency = (value: number) => {
  if (typeof value !== 'number') return '0 DZD';
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const ReportsPage = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [selectedReport, setSelectedReport] = useState('creances');
  const [dateRange, setDateRange] = useState('6m');

  const totalCreances = mockSuppliers.reduce((sum, s) => sum + s.creanceTotale, 0);
  const totalSuppliers = mockSuppliers.length;
  const avgCreance = totalSuppliers > 0 ? totalCreances / totalSuppliers : 0;

  const reportTypes = [
    { id: 'creances', title: 'État des Créances', icon: DollarSign, desc: 'Vue d\'ensemble des dettes par fournisseur' },
    { id: 'transactions', title: 'Évolution Financière', icon: TrendingUp, desc: 'Historique des entrées et sorties' },
    { id: 'paiements', title: 'Analyse des Paiements', icon: FileText, desc: 'Répartition par moyens de paiement' }
  ];

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle = '' }: {title: string, value: string | React.ReactNode, icon: React.ElementType, color?: string, subtitle?: string}) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-50 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const CreancesReport = () => (
    <div className="space-y-6">
      {/* Graphique en barres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Créances par Fournisseur</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <Download className="h-4 w-4" />
            Exporter PDF
          </button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockSuppliers}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{fontSize: 12}} angle={-45} textAnchor="end" height={100} interval={0} />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000}K`} />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), 'Créance']}
                labelFormatter={(label) => `Fournisseur: ${label}`}
                contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="creanceTotale" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détail des Créances</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wilaya</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Solde Initial</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Facturé</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payé</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Créance Totale</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.wilaya}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isClient ? formatCurrency(supplier.soldeInitial) : '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isClient ? formatCurrency(supplier.totalFacture) : '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                    {isClient ? formatCurrency(supplier.totalPaye) : '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                    <span className={supplier.creanceTotale > 0 ? 'text-red-600' : 'text-green-600'}>
                      {isClient ? formatCurrency(supplier.creanceTotale) : '...'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const TransactionsReport = () => (
    <div className="space-y-6">
      {/* Contrôles de période */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Période d'analyse:</span>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1m">Ce mois</option>
            <option value="3m">3 derniers mois</option>
            <option value="6m">6 derniers mois</option>
            <option value="1y">Cette année</option>
          </select>
        </div>
      </div>

      {/* Graphique d'évolution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution Entrées vs Sorties</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTransactions}>
              <defs>
                <linearGradient id="colorEntrees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSorties" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000}K`} />
              <Tooltip 
                formatter={(value, name) => [isClient ? formatCurrency(value as number) : '...', name === 'entrees' ? 'Entrées (Factures/BL)' : 'Sorties (Paiements)']}
                contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <AreaChart type="monotone" dataKey="entrees" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorEntrees)" />
              <AreaChart type="monotone" dataKey="sorties" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSorties)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transactions Récentes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {mockRecentTransactions.map((transaction, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  transaction.type === 'VERSEMENT' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{transaction.supplier}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.type === 'FACTURE' ? 'bg-red-100 text-red-800' :
                  transaction.type === 'BL' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {transaction.type}
                </span>
                <p className={`text-sm font-semibold mt-1 ${
                  transaction.amount < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isClient ? formatCurrency(Math.abs(transaction.amount)) : '...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PaymentsReport = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Graphique circulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par Moyen de Paiement</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPaymentMethods}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, value}) => `${name} (${value}%)`}
                >
                  {mockPaymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Détails des moyens de paiement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Détail des Montants</h3>
          <div className="space-y-4">
            {mockPaymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: method.color}}></div>
                  <span className="font-medium text-gray-900">{method.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{isClient ? formatCurrency(method.amount) : '...'}</p>
                  <p className="text-sm text-gray-500">{method.value}% du total</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total des Paiements</span>
              <span className="font-bold text-lg text-green-600">
                {isClient ? formatCurrency(mockPaymentMethods.reduce((sum, method) => sum + method.amount, 0)) : '...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    switch(selectedReport) {
      case 'creances':
        return <CreancesReport />;
      case 'transactions':
        return <TransactionsReport />;
      case 'paiements':
        return <PaymentsReport />;
      default:
        return <CreancesReport />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports Financiers</h1>
          <p className="text-gray-600">Analyse détaillée de vos relations fournisseurs</p>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Créances" 
            value={isClient ? formatCurrency(totalCreances) : <span className="text-gray-300">Chargement...</span>}
            icon={AlertCircle}
            color="red"
            subtitle="Dette totale"
          />
          <StatCard 
            title="Fournisseurs Actifs" 
            value={totalSuppliers.toString()} 
            icon={Users}
            color="blue"
            subtitle="Partenaires enregistrés"
          />
          <StatCard 
            title="Créance Moyenne" 
            value={isClient ? formatCurrency(avgCreance) : <span className="text-gray-300">Chargement...</span>}
            icon={TrendingUp}
            color="yellow"
            subtitle="Par fournisseur"
          />
          <StatCard 
            title="Transactions ce Mois" 
            value="47" 
            icon={FileText}
            color="green"
            subtitle="Factures et paiements"
          />
        </div>

        {/* Navigation des rapports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-8">
          <div className="flex space-x-1">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedReport(type.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors flex-1 text-center ${
                    selectedReport === type.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description du rapport sélectionné */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">
                {reportTypes.find(r => r.id === selectedReport)?.title}
              </h3>
              <p className="text-blue-700 text-sm">
                {reportTypes.find(r => r.id === selectedReport)?.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu du rapport */}
        {renderReport()}
      </div>
    </div>
  );
};

export default ReportsPage;

    