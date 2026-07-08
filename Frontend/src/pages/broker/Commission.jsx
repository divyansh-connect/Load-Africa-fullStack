import React, { useState, useEffect } from 'react';
import { Search, Filter, CreditCard, ArrowUpRight, Calendar, RefreshCcw } from 'lucide-react';
import { brokerService } from '../../services/brokerService';

export default function Commission() {
  const [search, setSearch] = useState('');
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const res = await brokerService.getCommissions();
      if (res.success) {
        setCommissions(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingPayout = commissions.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + Number(c.amount), 0);
  
  // Calculate this month
  const thisMonth = commissions.filter(c => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, c) => sum + Number(c.amount), 0);

  const filteredCommissions = commissions.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) || 
    c.reference_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Commission</h1>
          <p className="text-sm text-slate-500 font-medium">Track your earned commissions from assigned bookings</p>
        </div>
        <button 
          onClick={fetchCommissions}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="p-3 rounded-xl inline-flex mb-4 bg-green-50">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Earned</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">R{totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="p-3 rounded-xl inline-flex mb-4 bg-amber-50">
            <Calendar className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">This Month</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">R{thisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="p-3 rounded-xl inline-flex mb-4 bg-blue-50">
            <ArrowUpRight className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Payout</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">R{pendingPayout.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by Booking ID or Trans ID..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 text-center text-slate-500 font-medium">
                <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                Loading commissions...
             </div>
          ) : filteredCommissions.length === 0 ? (
             <div className="p-12 text-center text-slate-400 font-medium">No commissions found.</div>
          ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCommissions.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{log.id.split('-')[0]}...</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{log.reference_id.split('-')[0]}...</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">{new Date(log.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-black text-slate-900 text-right">R{Number(log.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                      log.status === 'PAID' 
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
