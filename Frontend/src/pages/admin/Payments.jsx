import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, 
  Search, Filter, RefreshCcw, FileText, CheckCircle, Clock, XCircle 
} from 'lucide-react';
import api from '../../services/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformEarnings: 0,
    pendingPayouts: 0,
    paidInvoicesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Invoices'); // Invoices, Payments, Wallet Transfers
  const [approvingId, setApprovingId] = useState(null);
  
  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments');
      if (res.data?.success) {
        setPayments(res.data.data.payments || []);
        setInvoices(res.data.data.invoices || []);
        setTransactions(res.data.data.walletTransactions || []);
        setStats({
          totalRevenue: res.data.data.stats.totalRevenue,
          platformEarnings: res.data.data.stats.platformEarnings,
          pendingPayouts: res.data.data.stats.pendingWithdrawals,
          paidInvoicesCount: res.data.data.stats.paidInvoicesCount
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (txnId) => {
    try {
      setApprovingId(txnId);
      const res = await api.post('/finance/withdraw/approve', { transactionId: txnId });
      if (res.data?.success) {
        alert('Withdrawal request approved successfully! Funds released.');
        await fetchFinancials();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve withdrawal');
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: `R${Number(stats.totalRevenue).toFixed(2)}`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Platform Earnings', value: `R${Number(stats.platformEarnings).toFixed(2)}`, icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Pending Withdrawals', value: `R${Number(stats.pendingPayouts).toFixed(2)}`, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Paid Invoices', value: stats.paidInvoicesCount, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 text-left">
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
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex border-b border-slate-200 px-2 pt-2 gap-2 overflow-x-auto">
          {['Invoices', 'Payments', 'Wallet Transfers'].map(tab => (
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
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-500 font-bold">
              <RefreshCcw className="h-5 w-5 animate-spin text-amber-500" />
              Loading records...
            </div>
          ) : (
            <div>
              {activeTab === 'Invoices' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-55 border-b border-slate-100 text-slate-400 font-bold uppercase">
                        <th className="pb-3 px-4">Invoice No</th>
                        <th className="pb-3 px-4">Customer</th>
                        <th className="pb-3 px-4">Cargo Description</th>
                        <th className="pb-3 px-4">Platform Fee</th>
                        <th className="pb-3 px-4">Net Payout</th>
                        <th className="pb-3 px-4">Grand Total</th>
                        <th className="pb-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {invoices.length === 0 && (
                        <tr><td colSpan="7" className="py-8 text-center text-slate-400">No invoices generated yet.</td></tr>
                      )}
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoice_no}</td>
                          <td className="py-3 px-4">{inv.customer?.company_name || inv.customer?.user?.first_name || 'Customer'}</td>
                          <td className="py-3 px-4 truncate max-w-[120px]">{inv.booking?.cargo_name || 'General Cargo'}</td>
                          <td className="py-3 px-4">R{Number(inv.platform_commission).toFixed(2)}</td>
                          <td className="py-3 px-4">R{Number(inv.payout_amount).toFixed(2)}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">R{Number(inv.total_amount).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'Payments' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-55 border-b border-slate-100 text-slate-400 font-bold uppercase">
                        <th className="pb-3 px-4">Transaction ID</th>
                        <th className="pb-3 px-4">Payment Method</th>
                        <th className="pb-3 px-4">Grand Total</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {payments.length === 0 && (
                        <tr><td colSpan="5" className="py-8 text-center text-slate-400">No payment logs yet.</td></tr>
                      )}
                      {payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{pay.transaction_id}</td>
                          <td className="py-3 px-4 uppercase">{pay.payment_method}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">R{Number(pay.amount).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                              {pay.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono">{new Date(pay.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'Wallet Transfers' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-55 border-b border-slate-100 text-slate-400 font-bold uppercase">
                        <th className="pb-3 px-4">Transporter User</th>
                        <th className="pb-3 px-4">Ledger Action</th>
                        <th className="pb-3 px-4">Amount</th>
                        <th className="pb-3 px-4">Type</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 px-4">Date</th>
                        <th className="pb-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {transactions.length === 0 && (
                        <tr><td colSpan="7" className="py-8 text-center text-slate-400">No ledger transactions yet.</td></tr>
                      )}
                      {transactions.map(txn => {
                        const email = txn.wallet?.user?.email || 'System';
                        const isPendingDebit = txn.type === 'DEBIT' && txn.status === 'PENDING';
                        
                        return (
                          <tr key={txn.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{txn.wallet?.user?.first_name} {txn.wallet?.user?.last_name || ''}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{email}</span>
                            </td>
                            <td className="py-3 px-4 truncate max-w-[150px]">{txn.description}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">R{Number(txn.amount).toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${txn.type === 'CREDIT' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                                {txn.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${txn.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {txn.status || 'COMPLETED'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono">{new Date(txn.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-right">
                              {isPendingDebit && (
                                <button
                                  onClick={() => handleApproveWithdrawal(txn.id)}
                                  disabled={approvingId === txn.id}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                                >
                                  {approvingId === txn.id ? 'Approving...' : 'Approve Release'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
