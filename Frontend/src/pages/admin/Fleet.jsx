import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle2, XCircle, Trash2, PauseCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function Fleet() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  const [fleets, setFleets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFleets, setTotalFleets] = useState(0);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const fetchFleets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.getUsersByRole({ role: 'FLEET_OWNER', page, search });
      if (res.success) {
        setFleets(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalFleets(res.meta.total);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to load fleet owners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleets();
  }, [page, search]);

  const handleAction = async (id, newStatus) => {
    try {
      if (newStatus === 'DELETE') {
        setConfirmModal({
          isOpen: true,
          action: 'DELETE',
          id,
          title: "Delete Fleet Account",
          message: "Are you sure you want to delete this fleet account? This action cannot be undone.",
          variant: "danger",
          confirmText: "Delete Account"
        });
        return;
      } else if (newStatus === 'ACTIVE') {
        await adminService.approveUser(id);
      } else if (newStatus === 'REJECTED' || newStatus === 'SUSPENDED') {
        await adminService.rejectUser(id);
      }
      fetchFleets();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const executeConfirmAction = async () => {
    try {
      if (confirmModal.action === 'DELETE') {
        await adminService.deleteUser(confirmModal.id);
        fetchFleets();
      }
    } catch (err) {
      alert("Failed to execute action");
    } finally {
      setConfirmModal({ isOpen: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Accounts</h1>
          <p className="text-sm text-slate-500 font-medium">Manage fleet owner applications and accounts. Total: {totalFleets}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
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
          <button onClick={fetchFleets} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto justify-center">
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative">
          {isLoading && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
             </div>
          )}
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-bold text-slate-700">Company</th>
                <th className="px-6 py-3 font-bold text-slate-700">Contact Person</th>
                <th className="px-6 py-3 font-bold text-slate-700 text-center">Status</th>
                <th className="px-6 py-3 font-bold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {error && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-red-500 font-medium text-sm">
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && fleets.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium text-sm">
                    No fleet accounts found.
                  </td>
                </tr>
              )}
              {fleets.map((fleet) => (
                <tr key={fleet.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {fleet.fleet_owner?.company_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">{fleet.first_name ? `${fleet.first_name} ${fleet.last_name || ''}` : 'User'}</p>
                    <p className="text-xs text-slate-500">{fleet.email}</p>
                    <p className="text-xs text-slate-400">{fleet.phone || 'No phone'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      fleet.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      fleet.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {fleet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => navigate(`/admin-portal/fleet/${fleet.id}`)} className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      {fleet.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleAction(fleet.id, 'ACTIVE')} className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleAction(fleet.id, 'REJECTED')} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {fleet.status === 'ACTIVE' && (
                         <button onClick={() => handleAction(fleet.id, 'SUSPENDED')} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Suspend">
                           <PauseCircle className="h-4 w-4" />
                         </button>
                      )}
                      {fleet.status === 'SUSPENDED' && (
                         <button onClick={() => handleAction(fleet.id, 'ACTIVE')} className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Reactivate">
                           <CheckCircle2 className="h-4 w-4" />
                         </button>
                      )}
                      <button onClick={() => handleAction(fleet.id, 'DELETE')} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
    </div>
  );
}
