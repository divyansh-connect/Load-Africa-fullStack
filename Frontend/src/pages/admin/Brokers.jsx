import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Trash2, Eye, PauseCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

export default function Brokers() {
  const [search, setSearch] = useState('');
  
  const [brokers, setBrokers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBrokers, setTotalBrokers] = useState(0);
  const [error, setError] = useState(null);

  const fetchBrokers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.getUsersByRole({ role: 'BROKER', page, search });
      if (res.success) {
        setBrokers(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalBrokers(res.meta.total);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to load brokers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, [page, search]);

  const handleAction = async (id, newStatus) => {
    try {
      if (newStatus === 'ACTIVE') {
        await adminService.approveUser(id);
      } else if (newStatus === 'REJECTED' || newStatus === 'SUSPENDED') {
        await adminService.rejectUser(id);
      }
      fetchBrokers();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Brokers</h1>
        <p className="text-sm font-semibold text-slate-500">Manage load brokers, set commission rates, and track performance. Total: {totalBrokers}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by company or email..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm font-medium"
            />
          </div>
          <button onClick={fetchBrokers} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto justify-center">
            Refresh
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto relative">
          {isLoading && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
             </div>
          )}
          <table className="w-full min-w-[800px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-4 font-bold text-slate-500">Company / Broker</th>
                <th className="px-5 py-4 font-bold text-slate-500">Email</th>
                <th className="px-5 py-4 font-bold text-slate-500">Company Name</th>
                <th className="px-5 py-4 font-bold text-slate-500">Status</th>
                <th className="px-5 py-4 font-bold text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {error && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-red-500 font-medium">{error}</td>
                </tr>
              )}
              {!isLoading && !error && brokers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400 font-medium">No brokers found.</td>
                </tr>
              )}
              {brokers.map((broker) => (
                <tr key={broker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{broker.first_name ? `${broker.first_name} ${broker.last_name || ''}` : 'Broker'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{broker.phone || 'No phone'}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{broker.email}</td>
                  <td className="px-5 py-4 font-bold text-slate-700 whitespace-nowrap">{broker.broker?.company_name || 'N/A'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      broker.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      broker.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {broker.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-slate-400 hover:text-sky-500 transition-colors" title="View Profile">
                        <Eye className="h-4 w-4" />
                      </button>
                      {broker.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleAction(broker.id, 'ACTIVE')} className="text-green-500 hover:text-green-600 transition-colors" title="Approve">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleAction(broker.id, 'REJECTED')} className="text-red-500 hover:text-red-600 transition-colors" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {broker.status === 'ACTIVE' && (
                         <button onClick={() => handleAction(broker.id, 'SUSPENDED')} className="text-amber-500 hover:text-amber-600 transition-colors" title="Suspend">
                           <PauseCircle className="h-4 w-4" />
                         </button>
                      )}
                      {broker.status === 'SUSPENDED' && (
                         <button onClick={() => handleAction(broker.id, 'ACTIVE')} className="text-green-500 hover:text-green-600 transition-colors" title="Reactivate">
                           <CheckCircle2 className="h-4 w-4" />
                         </button>
                      )}
                      <button className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
