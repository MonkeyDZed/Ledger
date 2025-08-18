
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { Calendar, FileText, TrendingUp, DollarSign, Users, Download, Eye, AlertCircle } from 'lucide-react';
import type { Supplier, Piece } from '@/lib/types';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, getWeek, startOfWeek } from 'date-fns';
import { formatCurrencyWithLocale } from '@/lib/formatters';

interface ReportsClientPageProps {
    suppliers: Supplier[];
    pieces: Piece[];
    dictionary: any;
    lang: 'fr' | 'ar';
}

type SupplierDataWithCalculations = Supplier & {
    totalFacture: number;
    totalPaye: number;
    creanceTotale: number;
};


const CustomTooltip = ({ active, payload, label, formatter, labelFormatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2.5 shadow-sm">
                <div className="grid grid-cols-1 gap-1.5">
                    {labelFormatter && <p className="font-medium">{labelFormatter(label)}</p>}
                    {payload.map((entry: any, index: number) => (
                         <div key={`item-${index}`} className="flex items-center gap-2">
                             <div className="h-2 w-2 flex-shrink-0 rounded-[2px]" style={{backgroundColor: entry.fill || entry.stroke}}></div>
                             <p className="text-sm text-muted-foreground">
                                {formatter(entry.value, entry.name, entry.payload)}
                             </p>
                         </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};


export const ReportsClientPage = ({ suppliers, pieces, dictionary, lang }: ReportsClientPageProps) => {
  const [isClient, setIsClient] = useState(false);
  const [now] = useState(() => new Date());

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [selectedReport, setSelectedReport] = useState('creances');
  const [dateRange, setDateRange] = useState('6m');

  // --- Data Processing ---
  const supplierDataWithCalculations: SupplierDataWithCalculations[] = useMemo(() => suppliers.map(supplier => {
    const supplierPieces = pieces.filter(p => p.supplier_id === supplier.id);
    const totalInvoiced = supplierPieces.reduce((sum, p) => p.type !== 'VERSEMENT' ? sum + p.total_piece : sum, 0);
    const totalPaid = supplierPieces.reduce((sum, p) => sum + p.montant_paye, 0);
    const totalDebt = supplier.solde_initial + totalInvoiced - totalPaid;
    return { ...supplier, totalFacture: totalInvoiced, totalPaye: totalPaid, creanceTotale: totalDebt };
  }), [suppliers, pieces]);

  const transactionData = useMemo(() => {
    let startDate: Date;
    let keyGenerator: (date: Date) => string;

    switch(dateRange) {
        case '1m':
            startDate = startOfMonth(now);
            keyGenerator = (d) => format(d, 'yyyy-MM-dd');
            break;
        case '3m':
            startDate = startOfMonth(subMonths(now, 2));
            keyGenerator = (d) => format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            break;
        case '1y':
            startDate = startOfYear(now);
            keyGenerator = (d) => format(d, 'yyyy-MM');
            break;
        case '6m':
        default:
            startDate = startOfMonth(subMonths(now, 5));
            keyGenerator = (d) => format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            break;
    }

    const filteredPieces = pieces.filter(p => new Date(p.date) >= startDate && new Date(p.date) <= now);
    
    const dataByPeriod: { [key: string]: { entrees: number; sorties: number } } = {};

    filteredPieces.forEach(p => {
        const pieceDate = new Date(p.date);
        const key = keyGenerator(pieceDate);

        if (!dataByPeriod[key]) {
            dataByPeriod[key] = { entrees: 0, sorties: 0 };
        }
        if (p.type !== 'VERSEMENT') {
            dataByPeriod[key].entrees += p.total_piece;
        } else {
             dataByPeriod[key].sorties += p.montant_paye;
        }
    });

    return Object.entries(dataByPeriod)
        .map(([date, values]) => {
            let label = date;
            if (dateRange === '1m') {
                label = format(new Date(date), 'dd');
            } else if (dateRange === '3m' || dateRange === '6m') {
                const week = getWeek(new Date(date));
                label = `S${week}`;
            } else if (dateRange === '1y') {
                 label = format(new Date(date), 'MMM');
            }
            return { date, label, ...values }
        })
        .sort((a, b) => a.date.localeCompare(b.date));

  }, [pieces, dateRange, now]);


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
  const totalTransactionsThisMonth = pieces.filter(p => {
      const pieceDate = new Date(p.date);
      return pieceDate.getMonth() === now.getMonth() && pieceDate.getFullYear() === now.getFullYear();
  }).length;


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

  const CreancesReport = ({ data }: { data: SupplierDataWithCalculations[] }) => {
    const totals = {
        soldeInitial: data.reduce((sum, s) => sum + s.solde_initial, 0),
        totalFacture: data.reduce((sum, s) => sum + s.totalFacture, 0),
        totalPaye: data.reduce((sum, s) => sum + s.totalPaye, 0),
        creanceTotale: data.reduce((sum, s) => sum + s.creanceTotale, 0),
    };
    
    return (
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
            <BarChart data={data}>
              <defs>
                 <linearGradient id="creanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{fontSize: 12}} angle={-45} textAnchor="end" height={100} interval={0} />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000}K`} />
              <Tooltip 
                cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}
                content={<CustomTooltip 
                    formatter={(value: any) => `${dictionary.creancesReport.tooltipCreance}: ${isClient ? formatCurrencyWithLocale(value, lang) : '...'}`}
                    labelFormatter={(label: any) => `${dictionary.creancesReport.tooltipSupplier}: ${label}`}
                />}
              />
              <Bar dataKey="creanceTotale" fill="url(#creanceGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{dictionary.creancesReport.detailTitle}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
              {data.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{supplier.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{supplier.wilaya}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                    {isClient ? formatCurrencyWithLocale(supplier.solde_initial, lang) : '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                    {isClient ? formatCurrencyWithLocale(supplier.totalFacture, lang) : '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-mono">
                    {isClient ? formatCurrencyWithLocale(supplier.totalPaye, lang) : '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold font-mono">
                    <span className={supplier.creanceTotale > 0 ? 'text-red-600' : 'text-green-600'}>
                      {isClient ? formatCurrencyWithLocale(supplier.creanceTotale, lang) : '...'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                    <td colSpan={2} className="px-6 py-3 text-right font-bold text-gray-700 uppercase">{dictionary.creancesReport.table.totals}</td>
                    <td className="px-6 py-3 text-right font-bold font-mono text-gray-800">
                         {isClient ? formatCurrencyWithLocale(totals.soldeInitial, lang) : '...'}
                    </td>
                    <td className="px-6 py-3 text-right font-bold font-mono text-gray-800">
                        {isClient ? formatCurrencyWithLocale(totals.totalFacture, lang) : '...'}
                    </td>
                    <td className="px-6 py-3 text-right font-bold font-mono text-green-700">
                        {isClient ? formatCurrencyWithLocale(totals.totalPaye, lang) : '...'}
                    </td>
                     <td className="px-6 py-3 text-right font-bold font-mono">
                        <span className={totals.creanceTotale > 0 ? 'text-red-700' : 'text-green-700'}>
                            {isClient ? formatCurrencyWithLocale(totals.creanceTotale, lang) : '...'}
                        </span>
                    </td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )};

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
            <option value="1m">{dictionary.transactionsReport.thisMonth}</option>
            <option value="3m">{dictionary.transactionsReport.last3Months}</option>
            <option value="6m">{dictionary.transactionsReport.last6Months}</option>
            <option value="1y">{dictionary.transactionsReport.thisYear}</option>
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
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSorties" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{fontSize: 12}} />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000}K`} />
              <Tooltip 
                cursor={{stroke: '#cbd5e1', strokeDasharray: '3 3'}}
                content={<CustomTooltip 
                    formatter={(value: any, name: any) => `${name === 'entrees' ? dictionary.transactionsReport.inflow : dictionary.transactionsReport.outflow}: ${isClient ? formatCurrencyWithLocale(value, lang) : '...'}`}
                    labelFormatter={(label: any) => {
                         if (dateRange === '1y') return `Mois: ${label}`;
                         if (dateRange === '1m') return `Jour: ${label}`;
                         return `Semaine: ${label}`;
                    }}
                />}
              />
              <Legend verticalAlign="top" height={40} />
              <Area type="monotone" dataKey="entrees" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorEntrees)" name={dictionary.transactionsReport.inflow} />
              <Area type="monotone" dataKey="sorties" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSorties)" name={dictionary.transactionsReport.outflow} />
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
                  {isClient ? <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString(lang)}</p> : <p className="text-xs text-gray-500">...</p>}
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
                <Tooltip formatter={(value, name, props) => {
                    const formattedAmount = isClient ? formatCurrencyWithLocale(props.payload.amount, lang, 0) : '...';
                    return [`${value}% (${formattedAmount})`, name];
                }} />
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
      case 'creances': return <CreancesReport data={supplierDataWithCalculations}/>;
      case 'transactions': return <TransactionsReport />;
      case 'paiements': return <PaymentsReport />;
      default: return <CreancesReport data={supplierDataWithCalculations}/>;
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
