import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Truck, Edit2, Trash2, Eye, AlertCircle,
  CheckCircle2, Clock, AlertTriangle, User
} from 'lucide-react';
import { fleetService } from '../../services/fleetService';
import { getVehicleImage, VEHICLE_TYPES } from '../../constants/vehicleTypes';
import { Button } from '../../components/ui';

const StatusBadge = ({ status }) => {
  const cfg = {
    AVAILABLE:   { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',  label: 'Available' },
    ON_TRIP:     { cls: 'bg-blue-50 text-blue-700 border-blue-200',           label: 'On Trip' },
    REGISTERED:  { cls: 'bg-amber-50 text-amber-700 border-amber-200',        label: 'Registered' },
    MAINTENANCE: { cls: 'bg-orange-50 text-orange-700 border-orange-200',     label: 'Maintenance' },
    INACTIVE:    { cls: 'bg-slate-100 text-slate-600 border-slate-200',       label: 'Inactive' },
  };
  const s = cfg[status] || cfg.INACTIVE;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${s.cls}`}>
      {s.label}
    </span>
  );
};

const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const days = Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 30;
};

const isExpired = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

export default function FleetVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, vehicle: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fleetService.getVehicles();
      if (res.success) setVehicles(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      const res = await fleetService.deleteVehicle(deleteModal.vehicle.id);
      if (!res.success) throw new Error(res.message);
      setDeleteModal({ open: false, vehicle: null });
      fetchVehicles();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || v.registration_number?.toLowerCase().includes(q)
      || v.vehicle_type?.toLowerCase().includes(q)
      || v.brand?.toLowerCase().includes(q);
    const matchType   = !filterType   || v.vehicle_type === filterType;
    const matchStatus = !filterStatus || v.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">Loading your fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Fleet</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Button
          onClick={() => navigate('/fleet-portal/vehicles/add')}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reg, type or brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
        >
          <option value="">All Types</option>
          {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="REGISTERED">Registered</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      {/* Vehicle Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 border-dashed py-20 text-center">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No vehicles found</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            {vehicles.length === 0 ? 'Add your first vehicle to get started.' : 'Try adjusting your filters.'}
          </p>
          {vehicles.length === 0 && (
            <Button onClick={() => navigate('/fleet-portal/vehicles/add')} className="bg-amber-500 text-slate-950 font-bold rounded-xl px-6 py-2.5">
              <Plus className="w-4 h-4 mr-2" /> Add First Vehicle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(vehicle => {
            const img = getVehicleImage(vehicle.photo_url, vehicle.vehicle_type);
            const driver = vehicle.assigned_drivers?.[0];
            const activeAssignment = vehicle.assignments?.[0];
            const insExpired = isExpired(vehicle.insurance_expiry);
            const insExpiring = isExpiringSoon(vehicle.insurance_expiry);

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-amber-200 transition-all duration-300 group"
              >
                {/* Vehicle Photo */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={img}
                    alt={vehicle.vehicle_type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = getVehicleImage(null, vehicle.vehicle_type); }}
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={vehicle.status} />
                  </div>
                  {(insExpired || insExpiring) && (
                    <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${insExpired ? 'bg-red-500 text-white' : 'bg-amber-400 text-slate-900'}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {insExpired ? 'Insurance Expired' : 'Expiring Soon'}
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{vehicle.vehicle_type}</p>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">{vehicle.registration_number}</h3>
                    {vehicle.brand && (
                      <p className="text-sm text-slate-500 font-medium">
                        {vehicle.brand}{vehicle.model ? ` ${vehicle.model}` : ''}{vehicle.year ? ` (${vehicle.year})` : ''}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Capacity</p>
                      <p className="text-sm font-bold text-slate-800">{vehicle.capacity ? `${vehicle.capacity}T` : '—'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Insurance</p>
                      <p className={`text-sm font-bold ${insExpired ? 'text-red-600' : insExpiring ? 'text-amber-600' : 'text-slate-800'}`}>
                        {vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Driver */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Driver</p>
                      <p className="text-xs font-semibold text-slate-700">
                        {driver ? `${driver.user?.first_name} ${driver.user?.last_name}` : 'Unassigned'}
                      </p>
                    </div>
                    {activeAssignment && (
                      <span className="ml-auto text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">ON TRIP</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => navigate(`/fleet-portal/vehicles/${vehicle.id}`)}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Button>
                    <Button
                      onClick={() => navigate(`/fleet-portal/vehicles/${vehicle.id}/edit`)}
                      className="px-3 py-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setDeleteModal({ open: true, vehicle })}
                      className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete Vehicle</h3>
                <p className="text-sm text-slate-500">{deleteModal.vehicle?.registration_number}</p>
              </div>
            </div>

            {deleteError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{deleteError}</p>
              </div>
            )}

            <p className="text-sm text-slate-600">
              Are you sure you want to delete this vehicle? This action cannot be undone and will remove all associated records.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => { setDeleteModal({ open: false, vehicle: null }); setDeleteError(''); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Vehicle'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
