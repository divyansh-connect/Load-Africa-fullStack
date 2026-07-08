import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, 
  Search, Filter, RefreshCcw, FileText, CheckCircle, Clock, XCircle 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import api from '../../services/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Invoices'); // Invoices, Payments, Wallet Transfers, Settlements
  
  const fetchFinancials = async () => {
    setLoading(true);
    try {
      // In a real application, these would be dedicated endpoints
      // For this step, we fetch data via Admin API or direct DB endpoints if available
      // Right now we can just show empty states since the backend endpoints for fetching invoices are pending.
      // But let's build the UI framework and mock data arrays which will be replaced by the real API.
      
      const res = await api.get('/admin/payments'); // Hypothetical endpoint
      if (res.data?.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Finance Center</h2>
          <p className="text-sm font-semibold text-slate-500">Manage invoices, payments, and settlements.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchFinancials}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900">R0.00</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <DollarSign className="h-6 w-6 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Platform Earnings</p>
            <p className="text-2xl font-black text-slate-900">R0.00</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <ArrowUpRight className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Payouts</p>
            <p className="text-2xl font-black text-slate-900">R0.00</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
            <Clock className="h-6 w-6 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Paid Invoices</p>
            <p className="text-2xl font-black text-slate-900">0</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex border-b border-slate-200 px-2 pt-2 gap-2 overflow-x-auto">
          {['Invoices', 'Payments', 'Wallet Transfers', 'Settlements'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'border-amber-500 text-amber-600 bg-amber-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          {loading ? (
            <div className="flex items-center gap-3 text-slate-500">
              <RefreshCcw className="h-5 w-5 animate-spin text-amber-500" />
              <span className="font-bold">Loading records...</span>
            </div>
          ) : (
            <div className="max-w-sm">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-inner">
                {activeTab === 'Invoices' ? <FileText className="h-8 w-8 text-slate-400" /> :
                 activeTab === 'Payments' ? <CreditCard className="h-8 w-8 text-slate-400" /> :
                 <ArrowUpRight className="h-8 w-8 text-slate-400" />}
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">No {activeTab} Found</h3>
              <p className="text-slate-500 text-sm font-medium">
                There are currently no records available in the {activeTab.toLowerCase()} category. Records will appear here once transactions occur.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
