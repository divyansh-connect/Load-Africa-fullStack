import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Mail, Phone, Building, 
  ExternalLink, Calendar, ChevronRight 
} from 'lucide-react';
import { getMockData } from '../../data/mockData';
import { Table, Input, Card } from '../../components/ui';

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCustomers(getMockData('users') || []);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cargo Shippers Database</h2>
        <p className="text-xs text-slate-400 font-medium">Shipper client registrations managed under your broker account.</p>
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
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No customer shippers registered.</div>
        ) : (
          <Table headers={['Shipper Name', 'Company', 'Phone Contact', 'System Status', 'Date Joined']}>
            {filteredCustomers.map((cust) => (
              <tr key={cust.id} className="hover:bg-slate-50/30">
                <td className="py-4.5 px-6">
                  <div className="flex items-center gap-3">
                    <img src={cust.avatar} alt={cust.name} className="h-9 w-9 rounded-full object-cover border border-slate-100" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{cust.name}</p>
                      <span className="text-[10px] text-slate-450 font-mono">{cust.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4.5 px-6 font-bold text-slate-850">
                  <p>{cust.company}</p>
                </td>
                <td className="py-4.5 px-6 font-mono text-slate-700">{cust.phone}</td>
                <td className="py-4.5 px-6">
                  {cust.status === 'active' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase text-[9px]">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 uppercase text-[9px]">Deactivated</span>
                  )}
                </td>
                <td className="py-4.5 px-6 font-mono text-slate-400">{cust.joinedDate}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>

    </div>
  );
}
