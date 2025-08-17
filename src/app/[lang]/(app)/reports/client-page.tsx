
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, FileText, TrendingUp, DollarSign, Users, Download, Eye, AlertCircle } from 'lucide-react';
import type { Supplier, Piece } from '@/lib/types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrencyWithLocale } from '@/lib/formatters';

interface ReportsClientPageProps {
    suppliers: Supplier[];
    pieces: Piece[];
    dictionary: any;
    lang: 'fr' | 'ar';
}


export const ReportsClientPage = ({ suppliers, pieces, dictionary, lang }: ReportsClientPageProps) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [selectedReport, setSelectedReport] = useState('creances');
  const [dateRange, setDateRange] = useState('6m');

  // --- Data Processing ---
  const supplierDataWithCalculations = useMemo(() => suppliers.map(supplier => {
    const supplierPieces = pieces.filter(p => p.supplier_id === supplier.id);
    const totalInvoiced = supplierPieces.reduce((sum, p) => p.type !== 'VERSEMENT' ? sum + p.total_piece : sum, 0);
    const totalPaid = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const totalDebt = supplier.solde_initial + totalInvoiced - totalPaid;
    return { ...supplier, totalFacture: totalInvoiced, totalPaye: totalPaid, creanceTotale: totalDebt };
  }), [suppliers, pieces]);

  const transactionData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, i) => subMonths(now, 5 - i));
    const monthlyData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const monthPieces = pieces.filter(p => {
            const pieceDate = new Date(p.date);
            return pieceDate >= monthStart && pieceDate <= monthEnd;
        });

        const entrees = monthPieces.filter(p => p.type !== 'VERSEMENT').reduce((sum, p) => sum + p.total_piece, 0);
        const sorties = monthPieces.reduce((sum, p) => sum + p.montant_paye, 0);
        
        return {
            date: format(month, 'yyyy-MM'),
            entrees,
            sorties
        };
    });
    return monthlyData;
  }, [pieces]);

  const paymentMethodData = useMemo(() => {
    const paymentMethods = pieces
        .filter(p => p.type === 'VERSEMENT' && p.payment_method)
        .reduce((acc, p) => {
            if (p.payment_method) {
                acc[p.payment_method] = (acc[p.payment_method] || 0) + p.montant_paye;
            }
            return acc;
        }, {} as Record<string, number>);

    const totalPayments = Object.values(paymentMethods).reduce((sum, amount) => sum + amount, 0);
    if(totalPayments === 0) return [];
    
    return Object.entries(paymentMethods).map(([name, amount]) => ({
        name: dictionary.paymentMethods[name] || name,
        value: parseFloat(((amount / totalPayments) * 100).toFixed(2)),
        amount,
        color: {cheque: '#3b82f6', virement: '#10b981', espece: '#f59e0b', traite: '#ef4444'}[name] || '#6b7280'
    }));
  }, [pieces, dictionary]);
  
  const recentTransactions = useMemo(() => {
    return pieces
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(p => ({
            ...p,
            supplierName: suppliers.find(s => s.id === p.supplier_id)?.name || 'N/A'
        }));
  }, [pieces, suppliers]);


  const totalCreances = supplierDataWithCalculations.reduce((sum, s) => sum + s.creanceTotale, 0);
  const totalSuppliers = suppliers.length;
  const avgCreance = totalSuppliers > 0 ? totalCreances / totalSuppliers : 0;
  const totalTransactionsThisMonth = pieces.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).length;

  const reportTypes = [
    { id: 'creances', title: dictionary.reportTypes.creances.title, icon: DollarSign, desc: dictionary.reportTypes.creances.desc },
    { id: 'transactions', title: dictionary.reportTypes.transactions.title, icon: TrendingUp, desc: dictionary.reportTypes.transactions.desc },
    { id: 'paiements', title: dictionary.reportTypes.paiements.title, icon: FileText, desc: dictionary.reportTypes.paiements.desc }
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{dictionary.creancesReport.title}</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <Download className="h-4 w-4" />
            {dictionary.exportPdf}
          </button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplierDataWithCalculations}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{fontSize: 12}} angle={-45} textAnchor="end" height={100} interval={0} />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000}K`} />
              <Tooltip 
                formatter={(value) => [isClient ? formatCurrencyWithLocale(value as number, lang) : '...', dictionary.creancesReport.tooltipCreance]}
                labelFormatter={(label) => `${dictionary.creancesReport.tooltipSupplier}: ${label}`}
                contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="creanceTotale" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{dictionary.creancesReport.detailTitle}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{dictionary.creancesReport.table.supplier}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{dictionary.creancesReport.table.wilaya}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{dictionary.creancesReport.table.initialBalance}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{dictionary.creancesReport.table.totalInvoiced}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{dictionary.creancesReport.table.totalPaid}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{dictionary.creancesReport.table.totalDebt}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplierDataWithCalculations.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.wilaya}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isClient ? formatCurrencyWithLocale(supplier.solde_initial, lang) : '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isClient ? formatCurrencyWithLocale(supplier.totalFacture, lang) : '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                    {isClient ? formatCurrencyWithLocale(supplier.totalPaye, lang) : '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                    <span className={supplier.creanceTotale > 0 ? 'text-red-600' : 'text-green-600'}>
                      {isClient ? formatCurrencyWithLocale(supplier.creanceTotale, lang) : '...'}
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{dictionary.transactionsReport.period}</span>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="6m">{dictionary.transactionsReport.last6Months}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{dictionary.transactionsReport.title}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactionData}>
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
                formatter={(value, name) => [isClient ? formatCurrencyWithLocale(value as number, lang) : '...', name === 'entrees' ? dictionary.transactionsReport.inflow : dictionary.transactionsReport.outflow]}
                contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="entrees" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorEntrees)" />
              <Area type="monotone" dataKey="sorties" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSorties)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{dictionary.transactionsReport.recentTitle}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${transaction.type === 'VERSEMENT' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{transaction.supplierName}</p>
                  <p className="text-xs text-gray-500">{isClient ? new Date(transaction.date).toLocaleDateString(lang) : '...'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.type === 'FACTURE' ? 'bg-red-100 text-red-800' :
                  transaction.type === 'BL' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {dictionary.pieceTypes[transaction.type.toLowerCase()]}
                </span>
                <p className={`text-sm font-semibold mt-1 ${transaction.type === 'VERSEMENT' ? 'text-green-600' : 'text-red-600'}`}>
                  {isClient ? formatCurrencyWithLocale(transaction.type === 'VERSEMENT' ? transaction.montant_paye : transaction.total_piece, lang) : '...'}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{dictionary.paymentsReport.title}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMethodData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({name, value}) => `${name} (${value}%)`}>
                  {paymentMethodData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, dictionary.paymentsReport.percentage]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{dictionary.paymentsReport.detailTitle}</h3>
          <div className="space-y-4">
            {paymentMethodData.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: method.color}}></div>
                  <span className="font-medium text-gray-900">{method.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{isClient ? formatCurrencyWithLocale(method.amount, lang) : '...'}</p>
                  <p className="text-sm text-gray-500">{method.value}% {dictionary.paymentsReport.ofTotal}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">{dictionary.paymentsReport.totalPayments}</span>
              <span className="font-bold text-lg text-green-600">
                {isClient ? formatCurrencyWithLocale(paymentMethodData.reduce((sum, method) => sum + method.amount, 0), lang) : '...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    switch(selectedReport) {
      case 'creances': return <CreancesReport />;
      case 'transactions': return <TransactionsReport />;
      case 'paiements': return <PaymentsReport />;
      default: return <CreancesReport />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{dictionary.title}</h1>
          <p className="text-gray-600">{dictionary.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title={dictionary.stats.totalDebts} value={isClient ? formatCurrencyWithLocale(totalCreances, lang) : <span className="text-gray-300">...</span>} icon={AlertCircle} color="red" subtitle={dictionary.stats.totalDebtsSubtitle} />
          <StatCard title={dictionary.stats.activeSuppliers} value={totalSuppliers.toString()} icon={Users} color="blue" subtitle={dictionary.stats.activeSuppliersSubtitle}/>
          <StatCard title={dictionary.stats.avgDebt} value={isClient ? formatCurrencyWithLocale(avgCreance, lang) : <span className="text-gray-300">...</span>} icon={TrendingUp} color="yellow" subtitle={dictionary.stats.avgDebtSubtitle} />
          <StatCard title={dictionary.stats.transactionsThisMonth} value={isClient ? totalTransactionsThisMonth.toString() : '...'} icon={FileText} color="green" subtitle={dictionary.stats.transactionsThisMonthSubtitle} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-8">
          <div className="flex space-x-1">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button key={type.id} onClick={() => setSelectedReport(type.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors flex-1 text-center ${selectedReport === type.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">{reportTypes.find(r => r.id === selectedReport)?.title}</h3>
              <p className="text-blue-700 text-sm">{reportTypes.find(r => r.id === selectedReport)?.desc}</p>
            </div>
          </div>
        </div>

        {renderReport()}
      </div>
    </div>
  );
};

    