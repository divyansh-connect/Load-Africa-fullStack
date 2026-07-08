import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Trash2, Edit, UserPlus, ChevronLeft, ChevronRight, Loader2, CheckCircle2, XCircle, PauseCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';

export default function Admins() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [error, setError] = useState(null);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.getUsersByRole({ role: 'ADMIN,SUPER_ADMIN', page, search });
      if (res.success) {
        setAdmins(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalAdmins(res.meta.total);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page, search]);

  const handleAction = async (id, newStatus) => {
    try {
      if (newStatus === 'ACTIVE') {
        await adminService.approveUser(id);
      } else if (newStatus === 'REJECTED' || newStatus === 'SUSPENDED') {
        await adminService.rejectUser(id);
      }
      fetchAdmins();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admins</h1>
          <p className="text-sm text-slate-500 font-medium">Manage platform administrators and roles. Total: {totalAdmins}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Admin
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search admins..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm font-medium"
            />
          </div>
          <button onClick={fetchAdmins} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto justify-center">
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
                <th className="px-6 py-3 font-bold text-slate-700">Admin Details</th>
                <th className="px-6 py-3 font-bold text-slate-700">Role</th>
                <th className="px-6 py-3 font-bold text-slate-700">Status</th>
                <th className="px-6 py-3 font-bold text-slate-700">Joined</th>
                <th className="px-6 py-3 font-bold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {error && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-red-500 font-medium text-sm">
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && admins.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-medium text-sm">
                    No administrators found.
                  </td>
                </tr>
              )}
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {(admin.first_name?.[0] || admin.email?.[0] || 'A').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{admin.first_name ? `${admin.first_name} ${admin.last_name || ''}` : 'Admin User'}</p>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold flex w-max items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-slate-400" />
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      admin.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      admin.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors" title="Edit Role">
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {admin.role !== 'SUPER_ADMIN' && (
                        <>
                          {admin.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleAction(admin.id, 'ACTIVE')} className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleAction(admin.id, 'REJECTED')} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {admin.status === 'ACTIVE' && (
                            <button onClick={() => handleAction(admin.id, 'SUSPENDED')} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Suspend">
                              <PauseCircle className="h-4 w-4" />
                            </button>
                          )}
                          {admin.status === 'SUSPENDED' && (
                            <button onClick={() => handleAction(admin.id, 'ACTIVE')} className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Reactivate">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Admin">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
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

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Create New Admin</h2>
              <p className="text-sm text-slate-500">Add a new administrator to the platform</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm" placeholder="John Doe" />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                <input type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm" placeholder="john@loadafrica.com" />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Role</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm bg-white">
                  <option>ADMIN</option>
                  <option>SUPER_ADMIN</option>
                </select>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Create User (Mock)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
