import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Calendar, CreditCard, ArrowUpRight, 
  ArrowDownLeft, Clock, CheckCircle2, ChevronRight, Check
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';

export default function EarningsWallet() {
  const [driver, setDriver] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('M-Pesa');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    const drivers = getMockData('drivers') || [];
    setDriver(drivers[0]); // Sipho Zuma

    const payments = getMockData('payments') || [];
    // Sipho's transaction history (driverName Sipho Zuma)
    const kofiTx = payments.filter(p => p.driverName === 'Sipho Zuma');
    setTransactions(kofiTx);
  }, []);

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > driver.walletBalance) {
      alert('Invalid withdrawal amount');
      return;
    }

    const amt = Number(withdrawAmount);
    
    // Deduct driver wallet balance
    const drivers = getMockData('drivers') || [];
    const idx = drivers.findIndex(d => d.id === 'drv-1');
    if (idx > -1) {
      drivers[idx].walletBalance -= amt;
      saveMockData('drivers', drivers);
      setDriver(drivers[idx]);
    }

    // Add record to transactions list
    const payments = getMockData('payments') || [];
    const newTx = {
      id: `tx-${Math.floor(8000 + Math.random() * 2000)}`,
      bookingId: 'withdrawal',
      amount: amt,
      status: 'completed',
      method: withdrawMethod,
      date: new Date().toISOString().split('T')[0],
      customerName: 'Bank / Wallet Payout',
      driverName: 'Sipho Zuma'
    };
    payments.unshift(newTx);
    saveMockData('payments', payments);
    setTransactions(payments.filter(p => p.driverName === 'Sipho Zuma'));

    setWithdrawSuccess(true);
    setWithdrawAmount('');
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawOpen(false);
    }, 1500);
  };

  if (!driver) return null;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Earnings & Wallet</h2>
          <p className="text-xs text-slate-400">Track and request payouts for all finalized transportation contracts.</p>
        </div>
      </div>

      {/* Cards stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Wallet Balance card with action */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wallet Balance</span>
              <p className="text-4xl font-extrabold text-slate-900">R{driver.walletBalance}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <button 
            onClick={() => setWithdrawOpen(true)}
            className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
          >
            Withdraw Payout
          </button>
        </div>

        {/* Life-time Earnings stats */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Life-Time Earnings</span>
            <p className="text-4xl font-extrabold text-slate-900">R{driver.earnings}</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>+12.4% from last month</span>
            </div>
          </div>
          <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Completed trips stats */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trips Completed</span>
            <p className="text-4xl font-extrabold text-slate-900">{driver.trips}</p>
            <span className="block text-xs text-slate-400 mt-2">Average trip rate: R{Math.round(driver.earnings / (driver.trips || 1))}</span>
          </div>
          <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Transaction History log list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="text-lg font-bold text-slate-800">Payment & Payout History</h3>

        <div className="divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No transactions recorded yet.</div>
          ) : (
            transactions.map((tx) => {
              const isWithdrawal = tx.bookingId === 'withdrawal';
              return (
                <div key={tx.id} className="py-4.5 flex items-center justify-between gap-4 first:pt-0">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isWithdrawal ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      {isWithdrawal ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{isWithdrawal ? 'Payout Withdrawal' : 'Escrow Released'}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span className="font-mono">{tx.id}</span>
                        <span>•</span>
                        <span>{tx.method}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-extrabold text-sm ${
                      isWithdrawal ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {isWithdrawal ? '-' : '+'}R{tx.amount}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">{tx.date}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Withdrawal Form Modal */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setWithdrawOpen(false)} />
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-scaleIn">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">Request Withdrawal</span>
              <button 
                onClick={() => setWithdrawOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                Close
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                  <Check className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Withdrawal Dispatched!</h4>
                <p className="text-xs text-slate-400">Funds will arrive in your wallet within 10 minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-5">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">AVAILABLE FOR PAYOUT</span>
                  <p className="text-3xl font-extrabold text-slate-800 mt-1">R{driver.walletBalance}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Withdrawal Amount (R)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={driver.walletBalance}
                    min="1"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Channel</label>
                  <select 
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none text-sm transition-all"
                  >
                    <option value="M-Pesa">Mobile Money (M-Pesa)</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Direct Bank Transfer">First National Bank (FNB) EFT Transfer</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Initiate Bank Transfer
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
