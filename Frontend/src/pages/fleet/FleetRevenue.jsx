import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, HelpCircle, ArrowDownRight, 
  ArrowUpRight, AlertCircle, Calendar, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { Card, Button, Input } from '../../components/ui';
import { fleetService } from '../../services/fleetService';

export default function FleetRevenue() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Withdrawal state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fleetService.getWallet();
      if (res.success) {
        setWallet(res.data);
      }
    } catch (err) {
      setError('Failed to fetch wallet information.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }
    if (parseFloat(withdrawAmount) > wallet.balance) {
      setWithdrawError('Insufficient funds.');
      return;
    }

    setWithdrawing(true);
    setWithdrawError('');
    setWithdrawSuccess(false);

    try {
      const res = await fleetService.withdrawEarnings(parseFloat(withdrawAmount));
      if (res.success) {
        setWithdrawSuccess(true);
        setWithdrawAmount('');
        await fetchWalletDetails();
        setTimeout(() => {
          setWithdrawModalOpen(false);
          setWithdrawSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setWithdrawError(err?.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading revenue portal...</div>;
  if (error) return <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl">{error}</div>;

  const balance = wallet?.balance || 0;
  const pendingBalance = wallet?.pending_balance || 0;
  
  // Sum of all credits = total earned
  const totalEarned = wallet?.transactions
    ?.filter(t => t.type === 'CREDIT' && t.status === 'COMPLETED')
    ?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Revenue & Splits</h2>
          <p className="text-xs text-slate-400 font-bold mt-1">Track your wallet balance, payout distributions, and platform cuts.</p>
        </div>
        <Button 
          onClick={() => setWithdrawModalOpen(true)}
          disabled={balance <= 0}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          Request Bank Payout
        </Button>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Available Wallet Balance */}
        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
              <h3 className="text-3xl font-black mt-1">R {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">Cleared funds, ready for direct bank payout</p>
        </div>

        {/* Pending Payout */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Payouts</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">R {pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <TrendingUp className="h-5 w-5 text-slate-500" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">Processing or awaiting bank settlement</p>
        </div>

        {/* Total Lifetime Net Earnings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Payouts</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">R {totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">Sum of all successfully settled trip net earnings</p>
        </div>

      </div>

      {/* Pricing / Commissions Cuts Explanation */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-amber-600" /> How is my net payout calculated?
        </h4>
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          When the customer makes a payment, LoadAfrica automatically settles the transaction using a split algorithm. For example, on a trip costing **R1,000**:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[
            { title: "1. PLATFORM COMMISSION (10%)", value: "R 100", desc: "Kept by the LoadAfrica system for operation, VAT compliance, and payment gateway costs." },
            { title: "2. BROKER COMMISSION (5%)", value: "R 50", desc: "Earned by the broker who reviewed, geocoded, prepared your quote, and resolved disputes." },
            { title: "3. YOUR NET PAYOUT (85%)", value: "R 850", desc: "Transferred directly into your fleet owner wallet balance as soon as the driver uploads a POD." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-amber-200/60 p-4 rounded-2xl text-left space-y-1 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 tracking-wider">{item.title}</p>
              <p className={`text-lg font-black ${idx === 2 ? 'text-emerald-600' : 'text-slate-800'}`}>{item.value}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Transaction History</h4>
        </div>

        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            No transactions found yet. Complete a trip or request a payout to populate transactions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Net Amount</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {wallet.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500 tracking-wider">
                      {tx.id}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tx.type === 'CREDIT' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 uppercase text-[9px]">
                          <ArrowUpRight className="h-3 w-3" /> Payout
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-100 uppercase text-[9px]">
                          <ArrowDownRight className="h-3 w-3" /> Withdrawal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {tx.description}
                    </td>
                    <td className={`px-6 py-4 font-bold ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'} R {parseFloat(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Withdrawal Dialog */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div>
              <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Request Payout</h4>
              <p className="text-xs text-slate-400 font-bold mt-1">Cleared funds will be settled into your verified bank account.</p>
            </div>

            {withdrawError && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p>{withdrawError}</p>
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                <p>Withdrawal requested successfully!</p>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Amount (ZAR)</label>
                <Input 
                  type="number"
                  min="1"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g., 500"
                  required
                />
                <p className="text-[9px] text-slate-400 font-semibold mt-1">Available balance: R {balance.toFixed(2)}</p>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <Button 
                  variant="outline" 
                  onClick={() => setWithdrawModalOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={withdrawing || withdrawSuccess}
                  className="bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  {withdrawing ? 'Processing...' : 'Confirm Payout'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
