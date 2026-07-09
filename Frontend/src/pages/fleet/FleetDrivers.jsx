import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ShieldAlert, Trash2, Edit2, CheckCircle2, Mail, Phone, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '../../components/ui';
import { fleetService } from '../../services/fleetService';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

export default function FleetDrivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [actionModal, setActionModal] = useState({ open: false, driver: null, action: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const data = await fleetService.getDrivers();
      if (data.success) {
        setDrivers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.user.first_name.toLowerCase().includes(search.toLowerCase()) || 
    d.user.last_name.toLowerCase().includes(search.toLowerCase()) ||
    d.license?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async () => {
    setError('');
    const { driver, action } = actionModal;

    try {
      if (action === 'delete') {
        const data = await fleetService.deleteDriver(driver.id);
        if (!data.success) throw new Error(data.message);
      } else if (action === 'suspend' || action === 'activate') {
        const newStatus = action === 'suspend' ? 'SUSPENDED' : 'ACTIVE';
        const data = await fleetService.updateDriverStatus(driver.id, newStatus);
        if (!data.success) throw new Error(data.message);
      }
      
      setActionModal({ open: false, driver: null, action: '' });
      fetchDrivers();
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading drivers...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Drivers</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage your fleet's drivers and their documents</p>
        </div>
        <Button 
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20"
          onClick={() => navigate('/fleet-portal/drivers/add')}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Driver
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <Input 
            icon={Search} 
            placeholder="Search drivers by name or license..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md bg-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="p-4 pl-6">Driver</th>
                <th className="p-4">Contact</th>
                <th className="p-4">License Info</th>
                <th className="p-4">Assigned Vehicle</th>
                <th className="p-4">Availability</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredDrivers.map(driver => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={driver.user.avatar ? (driver.user.avatar.startsWith('http') ? driver.user.avatar : `${API_BASE}${driver.user.avatar}`) : 'https://via.placeholder.com/40'} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{driver.user.first_name} {driver.user.last_name}</p>
                        <p className="text-xs text-slate-500 font-medium">ID: {driver.national_id || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-slate-600">
                        <Phone className="w-3 h-3 mr-1.5" />
                        {driver.user.phone}
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <Mail className="w-3 h-3 mr-1.5" />
                        {driver.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-slate-700">{driver.license}</p>
                      <p className="text-xs text-slate-500">Exp: {driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {driver.assigned_vehicle ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {driver.assigned_vehicle.registration_number}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                      driver.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      driver.status === 'ON_TRIP' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                      driver.user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      driver.user.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {driver.user.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/fleet-portal/drivers/${driver.id}/edit`)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Driver"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActionModal({ open: true, driver, action: driver.user.status === 'ACTIVE' ? 'suspend' : 'activate' })}
                        className="p-1.5 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                        title={driver.user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      >
                        {driver.user.status === 'ACTIVE' ? <ShieldAlert className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </button>
                      <button 
                        onClick={() => setActionModal({ open: true, driver, action: 'delete' })}
                        className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-medium">
                    No drivers found. Add a driver to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={actionModal.open} 
        onClose={() => { setActionModal({ open: false, driver: null, action: '' }); setError(''); }}
        title={actionModal.action === 'delete' ? 'Delete Driver' : actionModal.action === 'suspend' ? 'Suspend Driver' : 'Activate Driver'}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-start gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <p className="text-slate-600 text-sm">
            {actionModal.action === 'delete' && "Are you sure you want to permanently delete this driver? This action cannot be undone."}
            {actionModal.action === 'suspend' && "Are you sure you want to suspend this driver? They will not be able to log in or receive trips."}
            {actionModal.action === 'activate' && "Are you sure you want to activate this driver? They will be able to log in and receive trips."}
          </p>

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={() => setActionModal({ open: false, driver: null, action: '' })}>
              Cancel
            </Button>
            <Button 
              className={actionModal.action === 'delete' ? 'bg-red-500 hover:bg-red-600 text-white border-none' : 'bg-slate-900 text-white'}
              onClick={handleAction}
            >
              {actionModal.action === 'delete' ? 'Delete Permanently' : 'Confirm Action'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
