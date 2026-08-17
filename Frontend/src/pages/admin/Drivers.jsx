import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, AlertCircle, CheckCircle2, XCircle, Eye, Check, X, Search,
  ChevronLeft, ChevronRight, Loader2, PauseCircle, RefreshCw, Star, Info,
  MapPin, Shield, Truck, FileText
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { socket } from '../../utils/socket';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function Drivers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, SUSPENDED
  const [stats, setStats] = useState({ ALL: 0, PENDING: 0, ACTIVE: 0, REJECTED: 0, SUSPENDED: 0 });
  
  // Real-time toast alert state
  const [liveAlert, setLiveAlert] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reason: '' });

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const roleParams = { role: 'DRIVER', page, search };
      if (statusFilter !== 'ALL') {
        roleParams.status = statusFilter;
      }
      
      const res = await adminService.getUsersByRole(roleParams);
      if (res.success) {
        setDrivers(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalDrivers(res.meta.total);
        if (res.meta.stats) {
          setStats(res.meta.stats);
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to load drivers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, search, statusFilter]);

  // Real-time WebSocket handlers
  useEffect(() => {
    // Make sure we connect
    socket.connect();

    socket.on('driver_registered', (newDriver) => {
      setLiveAlert(`New driver registered: ${newDriver.fullName} (${newDriver.email})`);
      fetchDrivers();
      // Clear alert after 5s
      setTimeout(() => setLiveAlert(null), 5000);
    });

    socket.on('driver_status_changed', (data) => {
      setDrivers(prev => prev.map(d => {
        if (d.id === data.id) {
          return { ...d, status: data.status };
        }
        return d;
      }));
    });

    return () => {
      socket.off('driver_registered');
      socket.off('driver_status_changed');
    };
  }, [statusFilter, page, search]);

  const handleAction = (id, actionType) => {
    if (actionType === 'APPROVE') {
      setConfirmModal({
        isOpen: true,
        action: 'APPROVE',
        id,
        title: "Approve Driver Profile",
        message: "Are you sure you want to approve this driver? They will gain access to the driver app.",
        variant: "success",
        confirmText: "Approve Driver",
        showInput: false,
        reason: ''
      });
    } else if (actionType === 'REJECT') {
      setConfirmModal({
        isOpen: true,
        action: 'REJECT',
        id,
        title: "Reject Driver Profile",
        message: "Please provide a reason for rejecting this driver profile.",
        variant: "danger",
        confirmText: "Reject Profile",
        showInput: true,
        inputPlaceholder: "Enter rejection reason...",
        reason: ''
      });
    } else if (actionType === 'SUSPEND') {
      setConfirmModal({
        isOpen: true,
        action: 'SUSPEND',
        id,
        title: "Suspend Driver Account",
        message: "Please provide a reason for suspending this driver.",
        variant: "danger",
        confirmText: "Suspend Account",
        showInput: true,
        inputPlaceholder: "Enter suspension reason...",
        reason: ''
      });
    }
  };

  const executeDriverAction = async () => {
    const { action, id, reason, showInput } = confirmModal;
    
    if (showInput && !reason.trim()) {
      alert("Please enter a reason.");
      return;
    }
    
    try {
      if (action === 'APPROVE') {
        await adminService.approveDriverProfile(id);
      } else if (action === 'REJECT') {
        await adminService.rejectDriverProfile(id, reason);
      } else if (action === 'SUSPEND') {
        await adminService.suspendDriverProfile(id, reason);
      }
      fetchDrivers();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setConfirmModal({ isOpen: false, reason: '' });
    }
  };

  const statusTabs = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending Review' },
    { key: 'ACTIVE', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'SUSPENDED', label: 'Suspended' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Verification Module</h1>
          <p className="text-sm font-semibold text-slate-500">Perform profile checks, compliance validation, and fleet owner assignment.</p>
        </div>
        <button
          onClick={fetchDrivers}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm select-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Sync Records
        </button>
      </div>

      {/* Real-time Toast Alert */}
      {liveAlert && (
        <div className="bg-amber-500 text-slate-950 p-4 rounded-xl shadow-lg font-black text-xs tracking-wide animate-bounce flex items-center justify-between">
          <span>🔔 {liveAlert}</span>
          <button onClick={() => setLiveAlert(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Stats Counter Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              statusFilter === tab.key
                ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-md font-black'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className="block text-[10px] font-black uppercase tracking-wider opacity-85">{tab.label}</span>
            <span className="block text-xl font-black mt-1">
              {stats[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, province..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-semibold bg-white"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto relative min-h-[250px]">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
          )}

          <table className="w-full min-w-[900px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-55/20 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                <th className="px-5 py-4">Driver</th>
                <th className="px-5 py-4">Affiliation Type</th>
                <th className="px-5 py-4">Verification Specs</th>
                <th className="px-5 py-4">Base Location</th>
                <th className="px-5 py-4">Current Status</th>
                <th className="px-5 py-4 text-right">Verification Center</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {error && (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-red-500 font-bold">{error}</td>
                </tr>
              )}
              {!isLoading && !error && drivers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 font-bold">No registered drivers found matching criteria.</td>
                </tr>
              )}

              {drivers.map((user) => {
                const driverData = user.driver || {};
                const profile = driverData.profile || {};
                const vehicle = driverData.vehicle_relation || {};
                const photos = driverData.photos || {};

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Driver main column */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                          {photos.profile_photo ? (
                            <img src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${photos.profile_photo}`} alt="avatar" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-500"><Users className="h-5 w-5" /></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{user.first_name} {user.last_name || ''}</h4>
                          <p className="text-[10px] text-slate-400 font-bold leading-normal">{user.email}</p>
                          <p className="text-[10px] text-slate-400 font-bold leading-normal">{user.phone || 'No phone number'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Affiliation Type */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div>
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-black tracking-wide uppercase rounded-md ${
                          driverData.fleet_owner_id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {driverData.fleet_owner_id ? 'Fleet Driver' : 'Independent'}
                        </span>
                        {driverData.fleet_owner && (
                          <p className="text-[10px] text-slate-500 font-bold mt-1 max-w-[150px] truncate">{driverData.fleet_owner.company_name}</p>
                        )}
                      </div>
                    </td>

                    {/* Verification Specs */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-900"><span className="text-[10px] text-slate-450 uppercase font-black">Lic:</span> {driverData.license || 'N/A'}</p>
                        {vehicle.registration_number && (
                          <p className="text-[10px] text-slate-500"><span className="uppercase font-black text-[9px]">Veh Reg:</span> {vehicle.registration_number}</p>
                        )}
                      </div>
                    </td>

                    {/* Base Location */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <div>
                          <span>{profile.city || user.driver?.address || 'N/A'}</span>
                          {profile.province && <span className="block text-[9px] font-black text-slate-450 uppercase">{profile.province}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                        user.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                        user.status === 'SUSPENDED' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        user.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {user.status === 'ACTIVE' ? 'APPROVED' : user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {user.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAction(user.id, 'APPROVE')}
                              className="h-7 w-7 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                              title="Approve Driver"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction(user.id, 'REJECT')}
                              className="h-7 w-7 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                              title="Reject Driver"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {user.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleAction(user.id, 'SUSPEND')}
                            className="h-7 w-7 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 flex items-center justify-center transition-colors"
                            title="Suspend Account"
                          >
                            <PauseCircle className="h-4 w-4" />
                          </button>
                        )}
                        {user.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleAction(user.id, 'APPROVE')}
                            className="h-7 w-7 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                            title="Reactivate Account"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin-portal/drivers/${user.id}`)}
                          className="h-7 w-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-bold">
            Showing Page {page} of {totalPages}
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
        showInput={confirmModal.showInput}
        inputValue={confirmModal.reason}
        setInputValue={(val) => setConfirmModal(prev => ({ ...prev, reason: val }))}
        inputPlaceholder={confirmModal.inputPlaceholder}
        onConfirm={executeDriverAction}
        onCancel={() => setConfirmModal({ isOpen: false, reason: '' })}
      />
    </div>
  );
}
