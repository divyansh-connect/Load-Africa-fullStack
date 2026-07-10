import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Mail, Phone, Building, 
  Calendar, RefreshCcw, ShieldCheck, Box, Route
} from 'lucide-react';
import { brokerService } from '../../services/brokerService';
import { Table } from '../../components/ui';

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await brokerService.getCustomers();
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const name = `${c.user?.first_name || ''} ${c.user?.last_name || ''}`;
    const company = c.company_name || '';
    const email = c.user?.email || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate summary metrics
  const totalShippers = customers.length;
  const activeShippers = customers.filter(c => c.user?.status === 'ACTIVE').length;
  const activeTransitsCount = customers.reduce((sum, c) => sum + (c.activeBookings || 0), 0);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cargo Shippers Database</h2>
          <p className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Shipper client registrations managed under your broker account</p>
        </div>
        <button 
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors shrink-0"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh Database
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Shippers Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Shippers</p>
            <p className="text-2xl font-black text-slate-900">{totalShippers}</p>
          </div>
          <div className="h-12 w-12 rounded-xl flex items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Active Accounts Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Verified Shippers</p>
            <p className="text-2xl font-black text-slate-900">{activeShippers}</p>
          </div>
          <div className="h-12 w-12 rounded-xl flex items-center justify-center border border-emerald-100 bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Active Transits Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Shipper Transits</p>
            <p className="text-2xl font-black text-slate-900">{activeTransitsCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl flex items-center justify-center border border-amber-100 bg-amber-50 text-amber-600">
            <Route className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search shippers by Name, Company, Email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-semibold text-slate-700 bg-white"
          />
        </div>
      </div>

      {/* Shippers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        {loading ? (
           <div className="p-16 text-center text-slate-500 font-medium">
              <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
              Loading shippers...
           </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-1.5">
            <Users className="h-8 w-8 text-slate-350" />
            <span>No customer shippers found in database.</span>
          </div>
        ) : (
          <Table headers={['Shipper Name', 'Company', 'Total Bookings', 'Active Transits', 'Phone Contact', 'Status', 'Joined']}>
            {filteredCustomers.map((cust) => (
              <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Shipper Details */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 shrink-0">
                      <Users className="h-4.5 w-4.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{cust.user?.first_name} {cust.user?.last_name || ''}</p>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">{cust.user?.email}</span>
                    </div>
                  </div>
                </td>

                {/* Company Name */}
                <td className="py-4 px-6 font-bold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cust.company_name || 'Individual Shipper'}</span>
                  </div>
                </td>

                {/* Total Bookings */}
                <td className="py-4 px-6 font-bold text-slate-900 text-center font-mono">
                  <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {cust.totalBookings || 0}
                  </span>
                </td>

                {/* Active Transits */}
                <td className="py-4 px-6 font-bold text-center font-mono">
                  <span className={`inline-flex px-2 py-0.5 rounded-md ${
                    (cust.activeBookings || 0) > 0 
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-slate-50 text-slate-400'
                  }`}>
                    {cust.activeBookings || 0} active
                  </span>
                </td>

                {/* Phone Contact */}
                <td className="py-4 px-6 font-mono text-slate-600 font-medium">{cust.user?.phone || '—'}</td>

                {/* Status */}
                <td className="py-4 px-6">
                  {cust.user?.status === 'ACTIVE' ? (
                    <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase text-[9px] font-black tracking-wider">Active</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200 uppercase text-[9px] font-black tracking-wider">{cust.user?.status || 'Pending'}</span>
                  )}
                </td>

                {/* Date Joined */}
                <td className="py-4 px-6 font-mono text-slate-400 font-medium">
                  {new Date(cust.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
