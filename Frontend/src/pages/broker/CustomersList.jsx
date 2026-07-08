import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Mail, Phone, Building, 
  ExternalLink, Calendar, ChevronRight, RefreshCcw 
} from 'lucide-react';
import { brokerService } from '../../services/brokerService';
import { Table, Input, Card } from '../../components/ui';

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
    const name = c.user?.first_name || '';
    const company = c.company_name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || company.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cargo Shippers Database</h2>
          <p className="text-xs text-slate-400 font-medium">Shipper client registrations managed under your broker account.</p>
        </div>
        <button 
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search shippers by Name, Company..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs transition-all"
          />
        </div>
      </div>

      {/* Shippers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        {loading ? (
           <div className="p-12 text-center text-slate-500 font-medium">
              <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
              Loading customers...
           </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No customer shippers found.</div>
        ) : (
          <Table headers={['Shipper Name', 'Company', 'Phone Contact', 'System Status', 'Date Joined']}>
            {filteredCustomers.map((cust) => (
              <tr key={cust.id} className="hover:bg-slate-50/30">
                <td className="py-4.5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{cust.user?.first_name} {cust.user?.last_name}</p>
                      <span className="text-[10px] text-slate-450 font-mono">{cust.user?.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4.5 px-6 font-bold text-slate-850">
                  <p>{cust.company_name || 'Individual'}</p>
                </td>
                <td className="py-4.5 px-6 font-mono text-slate-700">{cust.user?.phone}</td>
                <td className="py-4.5 px-6">
                  {cust.user?.status === 'APPROVED' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase text-[9px]">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase text-[9px]">{cust.user?.status || 'Pending'}</span>
                  )}
                </td>
                <td className="py-4.5 px-6 font-mono text-slate-400">{new Date(cust.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>

    </div>
  );
}
