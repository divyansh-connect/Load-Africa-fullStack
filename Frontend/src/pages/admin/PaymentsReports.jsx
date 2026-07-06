import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Download, TrendingUp, Calendar, 
  Search, FileText, CheckCircle2, ChevronRight, Check
} from 'lucide-react';
import { getMockData } from '../../data/mockData';

export default function PaymentsReports() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setPayments(getMockData('payments') || []);
  }, []);

  const handleExportPDF = () => {
    setLoadingReport(true);
    setTimeout(() => {
      setLoadingReport(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }, 1500);
  };

  const filteredPayments = payments.filter(p => 
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payments & Financial Reports</h2>
          <p className="text-xs text-slate-400">Review logistics escrow releases, commission collections, and request download receipts.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={loadingReport}
          className="inline-flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          {loadingReport ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : downloaded ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              Manifest PDF Downloaded
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Financial Statement
            </>
          )}
        </button>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Escrow Volume</span>
            <p className="text-3xl font-extrabold text-slate-800">R{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><DollarSign className="h-6 w-6" /></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Broker Commission (5%)</span>
            <p className="text-3xl font-extrabold text-slate-800">R{Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 0.05).toLocaleString()}</p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl"><TrendingUp className="h-6 w-6" /></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Transactions</span>
            <p className="text-3xl font-extrabold text-slate-800">{payments.length} audits</p>
          </div>
          <div className="bg-rose-50 text-rose-500 p-3 rounded-2xl"><CreditCard className="h-6 w-6" /></div>
        </div>
      </div>

      {/* Transactions list table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-850">Billing Audit Log</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search TX, Shipper, Transporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase bg-slate-50/50">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Shipper (From)</th>
                <th className="py-4 px-6">Driver (To)</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
              {filteredPayments.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/30">
                  <td className="py-4 px-6 font-mono text-slate-800">{tx.id}</td>
                  <td className="py-4 px-6 text-slate-850 font-bold">{tx.customerName}</td>
                  <td className="py-4 px-6 text-slate-850 font-bold">{tx.driverName}</td>
                  <td className="py-4 px-6 text-slate-800 font-bold">R{tx.amount}</td>
                  <td className="py-4 px-6 font-mono text-slate-400">{tx.method}</td>
                  <td className="py-4 px-6">
                    {tx.status === 'completed' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] uppercase">Settled</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[9px] uppercase animate-pulse">Escrow Lock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
