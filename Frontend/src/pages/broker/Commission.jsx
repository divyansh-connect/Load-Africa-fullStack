import React, { useState, useEffect } from 'react';
import { Search, CreditCard, ArrowUpRight, ArrowDownLeft, Calendar, RefreshCcw, Landmark, Clock, ArrowRightLeft, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { brokerService } from '../../services/brokerService';

export default function Commission() {
  const [search, setSearch] = useState('');
  const [wallet, setWallet] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchWalletAndCommissions();
  }, []);

  const fetchWalletAndCommissions = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [walletRes, commissionRes] = await Promise.all([
        brokerService.getWallet(),
        brokerService.getCommissions()
      ]);

      if (walletRes.success) {
        setWallet(walletRes.data);
      }
      if (commissionRes.success) {
        setCommissions(commissionRes.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load wallet information.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (amountNum > Number(wallet?.balance || 0)) {
      alert('Insufficient funds available in your wallet.');
      return;
    }

    try {
      setWithdrawing(true);
      const res = await brokerService.withdrawEarnings(amountNum);
      if (res.success) {
        setWithdrawModalOpen(false);
        setWithdrawAmount('');
        setSuccessMessage('Withdrawal request submitted successfully! Pending admin approval.');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
        fetchWalletAndCommissions();
      } else {
        alert(res.message || 'Withdrawal failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Withdrawal request failed');
    } finally {
      setWithdrawing(false);
    }
  };

  // Calculations
  const availableBalance = Number(wallet?.balance || 0);
  const pendingWithdrawal = Number(wallet?.pending_balance || 0);
  const totalEarned = commissions.reduce((sum, c) => sum + Number(c.amount), 0);

  // Transactions list filtering
  const transactions = wallet?.transactions || [];
  const filteredTransactions = transactions.filter(t => 
    (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Wallet & Commissions</h1>
          <p className="text-sm text-slate-500 font-medium font-sans">Manage your earnings, view commission splits, and request payouts</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={fetchWalletAndCommissions}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Wallet
          </button>
          <button 
            disabled={availableBalance <= 0}
            onClick={() => setWithdrawModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black tracking-wide hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/10"
          >
            <Send className="h-4 w-4" />
            Withdraw Payout
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Wallet Balance Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8" />
          <div>
            <div className="p-2.5 rounded-xl inline-flex mb-3 bg-emerald-50 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Available Balance</p>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">R{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        {/* Pending Payouts Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8" />
          <div>
            <div className="p-2.5 rounded-xl inline-flex mb-3 bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Withdrawal</p>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">R{pendingWithdrawal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        {/* Total Earned Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8" />
          <div>
            <div className="p-2.5 rounded-xl inline-flex mb-3 bg-blue-50 text-blue-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Commission Earned</p>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">R{totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Main transactions and logs section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <ArrowRightLeft className="h-4 w-4 text-slate-500" /> Wallet Transactions
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold font-sans mt-0.5">Showing recent credit and debit operations</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by description or transaction ID..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-700 font-semibold bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-16 text-center text-slate-500 font-medium">
                <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                Loading wallet transactions...
             </div>
          ) : errorMsg ? (
             <div className="p-16 text-center text-red-500 font-bold">{errorMsg}</div>
          ) : filteredTransactions.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-1">
               <ArrowRightLeft className="h-8 w-8 text-slate-350" />
               <span>No transactions found in this wallet.</span>
             </div>
          ) : (
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">TX-{tx.id.split('-')[0].toUpperCase()}</td>
                  <td className="px-6 py-4 text-slate-900">{tx.description || 'System Transaction'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-sans">{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-wider ${
                      tx.type === 'CREDIT' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {tx.type === 'CREDIT' ? 'Commission' : 'Withdrawal'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-bold text-right ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'} R{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                      tx.status === 'COMPLETED' 
                        ? 'bg-green-50 text-green-600 border-green-250'
                        : tx.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-600 border-amber-250'
                        : 'bg-rose-50 text-rose-600 border-rose-250'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md relative overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                <Landmark className="h-4 w-4 text-amber-500" /> Withdraw Funds
              </h3>
              <button 
                onClick={() => setWithdrawModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="p-6 space-y-4 text-left">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs font-sans text-amber-800">
                  <p className="font-bold">Available balance limit: R{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="mt-0.5">Please ensure your bank details are updated in your settings before requesting.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Amount to Withdraw (ZAR) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">R</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="1"
                    max={availableBalance}
                    placeholder="Enter amount (e.g. 500)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {withdrawing ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-emerald-500 text-white px-5 py-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-full shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-wide">Success</p>
              <p className="text-xs font-semibold mt-0.5">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
