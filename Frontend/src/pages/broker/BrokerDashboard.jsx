import React, { useState, useEffect } from 'react';
import { FileText, MapPin, Users, CreditCard, ChevronRight, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brokerService } from '../../services/brokerService';

export default function BrokerDashboard() {
  const [stats, setStats] = useState({
    pendingQuotes: 0,
    assignedBookings: 0,
    myCustomers: 0,
    commissionEarned: 0
  });
  
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [recentAssigned, setRecentAssigned] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await brokerService.getDashboardStats();
      if (res.success) {
        setStats({
          pendingQuotes: res.data.pendingQuotesCount,
          assignedBookings: res.data.assignedBookingsCount,
          myCustomers: res.data.customersCount,
          commissionEarned: res.data.commissionEarned
        });
        
        // Populate tables from dashboard payload if provided (or separate calls)
        if (res.data.recentQuotes) setRecentQuotes(res.data.recentQuotes);
        if (res.data.recentAssigned) setRecentAssigned(res.data.recentAssigned);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Pending Quotes', value: stats.pendingQuotes, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Assigned Bookings', value: stats.assignedBookings, icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'My Customers', value: stats.myCustomers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Commission Earned', value: `R${Number(stats.commissionEarned).toLocaleString()}`, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm font-semibold text-slate-500">Monitor your quotes, bookings, and commissions.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className={`p-3 rounded-xl inline-flex mb-4 ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              {loading ? (
                <div className="h-9 w-24 bg-slate-200 animate-pulse rounded-lg mt-1" />
              ) : (
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Quote Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Recent Quote Requests</h2>
            <Link to="/broker/quote-requests" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1 p-2">
            {loading ? (
               <div className="p-12 text-center text-slate-500 font-medium">
                  <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                  Loading...
               </div>
            ) : recentQuotes.length === 0 ? (
               <div className="p-12 text-center text-slate-400 font-medium">No recent quote requests.</div>
            ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">Route</th>
                  <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">Vehicle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">{q.customer?.company_name || q.customer?.user?.first_name || 'Guest'}</td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="block text-xs truncate max-w-[120px]">{q.pickup_address}</span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">to {q.delivery_address}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{q.requested_vehicle || 'Any'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Recent Assigned Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Recent Assigned Bookings</h2>
            <Link to="/broker/assigned-loads" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1 p-2">
            {loading ? (
               <div className="p-12 text-center text-slate-500 font-medium">
                  <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                  Loading...
               </div>
            ) : recentAssigned.length === 0 ? (
               <div className="p-12 text-center text-slate-400 font-medium">No recent assigned bookings.</div>
            ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAssigned.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">{b.id.split('-')[0]}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="block text-xs font-semibold">
                        {b.assignment?.driver?.user?.first_name || 
                         b.assignment?.fleet_owner?.company_name || 
                         'Awaiting Admin'}
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
    </div>
  );
}
