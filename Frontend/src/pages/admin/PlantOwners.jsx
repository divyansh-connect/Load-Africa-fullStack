import React, { useState, useEffect } from 'react';
import {
  Search, Eye, CheckCircle2, XCircle, Trash2, PauseCircle,
  ChevronLeft, ChevronRight, Loader2, FileText, Download,
  Check, X, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { fleetService } from '../../services/fleetService';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function PlantOwners() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OWNERS'); // OWNERS, APPLICATIONS
  
  // Tab 1: Verified Owners State
  const [searchOwner, setSearchOwner] = useState('');
  const [owners, setOwners] = useState([]);
  const [isOwnersLoading, setIsOwnersLoading] = useState(true);
  const [ownerPage, setOwnerPage] = useState(1);
  const [ownerTotalPages, setOwnerTotalPages] = useState(1);
  const [totalOwners, setTotalOwners] = useState(0);
  const [ownersError, setOwnersError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  // Tab 2: Applications State
  const [searchApp, setSearchApp] = useState('');
  const [filterAppStatus, setFilterAppStatus] = useState('PENDING'); // PENDING, APPROVED, REJECTED, CHANGES_REQUESTED
  const [apps, setApps] = useState([]);
  const [isAppsLoading, setIsAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState(null);

  // Modals for Applications
  const [detailsModal, setDetailsModal] = useState({ open: false, app: null });
  const [actionModal, setActionModal] = useState({ open: false, app: null, type: '', reason: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Fetch verified owners
  const fetchOwners = async () => {
    try {
      setIsOwnersLoading(true);
      setOwnersError(null);
      const res = await adminService.getUsersByRole({ role: 'PLANT_OWNER', page: ownerPage, search: searchOwner });
      if (res.success) {
        setOwners(res.data);
        setOwnerTotalPages(res.meta.totalPages);
        setTotalOwners(res.meta.total);
      } else {
        setOwnersError(res.message);
      }
    } catch (err) {
      setOwnersError('Failed to load plant owners');
    } finally {
      setIsOwnersLoading(false);
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setIsAppsLoading(true);
      setAppsError(null);
      const res = await fleetService.getPlantApplications(filterAppStatus);
      if (res.success) {
        setApps(res.data);
      } else {
        setAppsError(res.message);
      }
    } catch (err) {
      setAppsError('Failed to load plant applications');
    } finally {
      setIsAppsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'OWNERS') {
      fetchOwners();
    } else {
      fetchApplications();
    }
  }, [activeTab, ownerPage, searchOwner, filterAppStatus]);

  // Verified Owner Actions
  const handleOwnerAction = async (id, newStatus) => {
    try {
      if (newStatus === 'ACTIVE') {
        await adminService.approveUser(id);
      } else if (newStatus === 'REJECTED' || newStatus === 'SUSPENDED') {
        await adminService.rejectUser(id);
      }
      fetchOwners();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleOwnerDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      action: 'DELETE_OWNER',
      id,
      title: "Delete Plant Owner",
      message: "Are you sure you want to delete this plant owner? This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete Owner"
    });
  };

  const executeOwnerDelete = async () => {
    try {
      const res = await adminService.deleteUser(confirmModal.id);
      if (res.success) {
        alert("Owner deleted successfully");
        fetchOwners();
      } else {
        alert(res.message || "Failed to delete owner");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Deletion failed");
    } finally {
      setConfirmModal({ isOpen: false });
    }
  };

  // Application Actions Submit
  const handleAppActionSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionLoading(true);

    const { app, type, reason } = actionModal;
    try {
      let res;
      if (type === 'approve') {
        res = await fleetService.approvePlantApplication(app.id);
      } else if (type === 'reject') {
        if (!reason.trim()) throw new Error('Please enter a rejection reason.');
        res = await fleetService.rejectPlantApplication(app.id, reason);
      } else if (type === 'request-changes') {
        if (!reason.trim()) throw new Error('Please enter instructions for the changes.');
        res = await fleetService.requestPlantChanges(app.id, reason);
      }

      if (!res.success) throw new Error(res.message || 'Operation failed');

      setActionModal({ open: false, app: null, type: '', reason: '' });
      setDetailsModal({ open: false, app: null });
      fetchApplications();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = apps.filter(app => {
    const q = searchApp.toLowerCase();
    return (
      app.company_name.toLowerCase().includes(q) ||
      app.contact_name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.registration_number.toLowerCase().includes(q)
    );
  });

  const getAppStatusBadge = (status) => {
    const cfgs = {
      PENDING:           'bg-amber-100 text-amber-800 border-amber-200',
      APPROVED:          'bg-emerald-100 text-emerald-800 border-emerald-200',
      REJECTED:          'bg-rose-100 text-rose-800 border-rose-200',
      CHANGES_REQUESTED: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${cfgs[status] || 'bg-slate-100 text-slate-800'}`}>
        {status?.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Plant Owners Directory</h1>
        <p className="text-sm font-semibold text-slate-500">Manage verified machinery owners and review registration applications.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('OWNERS')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'OWNERS' ? 'border-amber-500 text-amber-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Verified Owners
        </button>
        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'APPLICATIONS' ? 'border-amber-500 text-amber-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Registration Applications
        </button>
      </div>

      {/* ── TAB 1: VERIFIED OWNERS ── */}
      {activeTab === 'OWNERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by company or email..." 
                value={searchOwner}
                onChange={(e) => { setSearchOwner(e.target.value); setOwnerPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm font-medium"
              />
            </div>
            <button onClick={fetchOwners} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto justify-center">
              Refresh
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto relative min-h-[150px]">
            {isOwnersLoading && (
               <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
               </div>
            )}
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 pl-6">Company</th>
                  <th className="px-6 py-3.5">Contact Person</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ownersError && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-red-500 font-medium text-sm">{ownersError}</td>
                  </tr>
                )}
                {!isOwnersLoading && !ownersError && owners.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium text-sm">No plant owners found.</td>
                  </tr>
                )}
                {owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-slate-55 transition-colors">
                    <td className="px-6 py-4 pl-6 font-bold text-slate-900">
                      {owner.plant_owner?.company_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{owner.first_name ? `${owner.first_name} ${owner.last_name || ''}` : 'User'}</p>
                      <p className="text-xs text-slate-500 font-medium">{owner.email}</p>
                      <p className="text-xs text-slate-400">{owner.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${
                        owner.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {owner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/admin-portal/plant-owners/${owner.id}`)} className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        {owner.status === 'ACTIVE' && (
                           <button onClick={() => handleOwnerAction(owner.id, 'SUSPENDED')} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Suspend">
                             <PauseCircle className="h-4 w-4" />
                           </button>
                        )}
                        {owner.status === 'SUSPENDED' && (
                           <button onClick={() => handleOwnerAction(owner.id, 'ACTIVE')} className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Reactivate">
                             <CheckCircle2 className="h-4 w-4" />
                           </button>
                        )}
                        <button onClick={() => handleOwnerDelete(owner.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
            <p className="text-xs text-slate-500 font-medium">Page {ownerPage} of {ownerTotalPages}</p>
            <div className="flex gap-2">
              <button 
                disabled={ownerPage === 1}
                onClick={() => setOwnerPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                disabled={ownerPage === ownerTotalPages || ownerTotalPages === 0}
                onClick={() => setOwnerPage(p => Math.min(ownerTotalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: APPLICATIONS ── */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-5">
          {/* Status Sub-Filters */}
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl self-start w-fit">
            {['PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterAppStatus(status)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  filterAppStatus === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status?.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Search */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchApp}
                  onChange={e => setSearchApp(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto relative min-h-[150px]">
              {isAppsLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              )}
              {appsError && (
                <div className="py-8 text-center text-red-500 font-medium text-sm">{appsError}</div>
              )}
              {!isAppsLoading && !appsError && filteredApps.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm">No applications found.</div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Company</th>
                      <th className="p-4">Contact Person</th>
                      <th className="p-4">Equipment Info</th>
                      <th className="p-4">Reg / Serial</th>
                      <th className="p-4">Submitted Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-55 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-900">{app.company_name}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{app.contact_name}</p>
                          <p className="text-xs text-slate-500">{app.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{app.equipment_type}</p>
                          <p className="text-xs text-slate-500">{app.make} {app.model}</p>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">{app.registration_number}</td>
                        <td className="p-4 text-xs font-bold text-slate-500">{new Date(app.created_at).toLocaleDateString()}</td>
                        <td className="p-4">{getAppStatusBadge(app.status)}</td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => setDetailsModal({ open: true, app })}
                            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 transition-colors flex items-center gap-1.5 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      {detailsModal.open && detailsModal.app && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scaleIn max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-900">Application details</h3>
                <p className="text-xs text-slate-400 mt-0.5">Submitted on {new Date(detailsModal.app.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setDetailsModal({ open: false, app: null })} className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                  {getAppStatusBadge(detailsModal.app.status)}
                </div>
                {detailsModal.app.rejection_reason && (
                  <div className="text-right max-w-md">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Notes / Reason</span>
                    <p className="text-xs text-slate-600 font-bold">{detailsModal.app.rejection_reason}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
                  <h4 className="font-extrabold text-slate-800 border-b border-slate-100 pb-2">Company & Contact Info</h4>
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <p className="font-bold text-slate-400">Company Name</p>
                      <p className="font-extrabold text-slate-850 mt-0.5">{detailsModal.app.company_name}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Contact Person</p>
                      <p className="font-extrabold text-slate-850 mt-0.5">{detailsModal.app.contact_name}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Email Address</p>
                      <p className="font-extrabold text-slate-850 mt-0.5 select-all">{detailsModal.app.email}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Phone Number</p>
                      <p className="font-extrabold text-slate-850 mt-0.5 select-all">{detailsModal.app.phone}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">National ID / Passport</p>
                      <p className="font-extrabold text-slate-850 mt-0.5 select-all">{detailsModal.app.national_id}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Base Location</p>
                      <p className="font-extrabold text-slate-850 mt-0.5 select-all">{detailsModal.app.base_location}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
                  <h4 className="font-extrabold text-slate-800 border-b border-slate-100 pb-2">Machine Information</h4>
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <p className="font-bold text-slate-400">Equipment Type</p>
                      <p className="font-extrabold text-slate-850 mt-0.5">{detailsModal.app.equipment_type}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Registration / Serial</p>
                      <p className="font-extrabold text-slate-850 mt-0.5 select-all">{detailsModal.app.registration_number}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Make / Manufacturer</p>
                      <p className="font-extrabold text-slate-850 mt-0.5">{detailsModal.app.make || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Model</p>
                      <p className="font-extrabold text-slate-850 mt-0.5">{detailsModal.app.model || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Manufacture Year</p>
                      <p className="font-extrabold text-slate-850 mt-0.5">{detailsModal.app.year || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h4 className="font-extrabold text-slate-800 border-b border-slate-100 pb-2">Documents & Uploads</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detailsModal.app.company_reg_doc && (
                    <a
                      href={detailsModal.app.company_reg_doc.startsWith('http') ? detailsModal.app.company_reg_doc : `http://localhost:5000${detailsModal.app.company_reg_doc}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3.5 bg-slate-55 hover:bg-amber-50 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-850">Company Registration COR</p>
                        <p className="text-[10px] text-slate-400 truncate">{detailsModal.app.company_reg_doc.split('/').pop()}</p>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                    </a>
                  )}

                  {detailsModal.app.machine_photo && (
                    <a
                      href={detailsModal.app.machine_photo.startsWith('http') ? detailsModal.app.machine_photo : `http://localhost:5000${detailsModal.app.machine_photo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3.5 bg-slate-55 hover:bg-amber-50 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-850">Machine Photo</p>
                        <p className="text-[10px] text-slate-400 truncate">{detailsModal.app.machine_photo.split('/').pop()}</p>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                    </a>
                  )}
                </div>

                {detailsModal.app.machine_photo && (
                  <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 h-64 bg-slate-100">
                    <img
                      src={detailsModal.app.machine_photo.startsWith('http') ? detailsModal.app.machine_photo : `http://localhost:5000${detailsModal.app.machine_photo}`}
                      alt="Machine"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {detailsModal.app.status === 'PENDING' && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
                <button
                  onClick={() => setActionModal({ open: true, app: detailsModal.app, type: 'reject', reason: '' })}
                  className="px-5 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl bg-white transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  Reject
                </button>
                <button
                  onClick={() => setActionModal({ open: true, app: detailsModal.app, type: 'request-changes', reason: '' })}
                  className="px-5 py-2.5 border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-xl bg-white transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => setActionModal({ open: true, app: detailsModal.app, type: 'approve', reason: '' })}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  Approve Listing
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Dialog */}
      {actionModal.open && actionModal.app && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAppActionSubmit} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn p-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                actionModal.type === 'approve' ? 'bg-emerald-100 text-emerald-600' : actionModal.type === 'reject' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {actionModal.type === 'approve' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 capitalize">{actionModal.type?.replace('-', ' ')} Application</h3>
                <p className="text-xs text-slate-400">{actionModal.app.company_name}</p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">{actionError}</div>
            )}

            {actionModal.type === 'approve' ? (
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Are you sure you want to approve this application? This will create a live `PlantOwner` account and register the equipment into their active listing profile.
              </p>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Reason / Instructions <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  rows="3"
                  required
                  placeholder={actionModal.type === 'reject' ? 'e.g. Documents are invalid.' : 'e.g. Please upload a clearer machine photo.'}
                  value={actionModal.reason}
                  onChange={e => setActionModal({ ...actionModal, reason: e.target.value })}
                ></textarea>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal({ open: false, app: null, type: '', reason: '' })}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-55 text-slate-650 text-xs font-bold rounded-xl bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className={`px-5 py-2 text-xs font-black rounded-xl text-white uppercase tracking-wider ${
                  actionModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      )}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        onConfirm={executeOwnerDelete}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
    </div>
  );
}
