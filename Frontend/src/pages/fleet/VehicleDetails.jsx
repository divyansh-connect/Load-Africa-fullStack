import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Truck, User, FileText, Calendar,
  AlertTriangle, CheckCircle2, Clock, AlertCircle, ExternalLink,
  Shield, Hash, MapPin, Zap
} from 'lucide-react';
import { fleetService } from '../../services/fleetService';
import { getVehicleImage } from '../../constants/vehicleTypes';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const StatusBadge = ({ status }) => {
  const cfg = {
    AVAILABLE:   { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',  label: 'Available' },
    ON_TRIP:     { cls: 'bg-blue-100 text-blue-700 border-blue-200',           label: 'On Trip' },
    REGISTERED:  { cls: 'bg-amber-100 text-amber-700 border-amber-200',        label: 'Registered' },
    MAINTENANCE: { cls: 'bg-orange-100 text-orange-700 border-orange-200',     label: 'Maintenance' },
    INACTIVE:    { cls: 'bg-slate-100 text-slate-600 border-slate-200',        label: 'Inactive' },
  };
  const s = cfg[status] || cfg.INACTIVE;
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${s.cls}`}>
      {s.label}
    </span>
  );
};

const DocLink = ({ url, label, icon: Icon }) => {
  if (!url) return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 opacity-40">
      <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-700">{label}</p>
        <p className="text-[10px] text-slate-400">Not uploaded</p>
      </div>
    </div>
  );
  const href = url.startsWith('http') ? url : `${API_BASE}${url}`;
  return (
    <a href={href} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 hover:border-amber-300 transition-all group">
      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100">
        <Icon className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800">{label}</p>
        <p className="text-[10px] text-slate-400 truncate">{url.split('/').pop()}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
    </a>
  );
};

const InfoItem = ({ label, value, icon: Icon, highlight }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      <p className={`text-sm font-bold ${highlight || 'text-slate-900'}`}>
        {value || <span className="text-slate-300 font-normal">Not specified</span>}
      </p>
    </div>
  </div>
);

const formatDate = d => d ? new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

const isExpired = d => d && new Date(d) < new Date();
const isExpiringSoon = d => {
  if (!d) return false;
  const days = Math.ceil((new Date(d) - Date.now()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 30;
};

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { fetchVehicle(); }, [id]);

  const fetchVehicle = async () => {
    try {
      const res = await fleetService.getVehicles();
      if (res.success) {
        const v = res.data.find(v => v.id === id);
        if (v) setVehicle(v);
      }
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
      const res = await fleetService.deleteVehicle(id);
      if (!res.success) throw new Error(res.message);
      navigate('/fleet-portal/vehicles');
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-bold text-slate-700">Vehicle not found</h3>
        <button onClick={() => navigate('/fleet-portal/vehicles')} className="mt-4 text-amber-600 text-sm font-bold hover:underline">
          Back to My Fleet
        </button>
      </div>
    );
  }

  const img = getVehicleImage(vehicle.photo_url, vehicle.vehicle_type);
  const driver = vehicle.assigned_drivers?.[0];
  const activeAssignment = vehicle.assignments?.[0];

  return (
    <div className="min-h-full bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/fleet-portal/vehicles')}
              className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900">{vehicle.registration_number}</h1>
              <p className="text-sm text-slate-500">{vehicle.vehicle_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/fleet-portal/vehicles/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:border-amber-300 rounded-xl transition-all"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden h-64 bg-slate-200">
          <img src={img} alt={vehicle.vehicle_type} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{vehicle.vehicle_type}</p>
              <h2 className="text-white text-2xl font-black">{vehicle.registration_number}</h2>
              {vehicle.brand && <p className="text-white/80 text-sm">{vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}</p>}
            </div>
            <StatusBadge status={vehicle.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Vehicle Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" /> Vehicle Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoItem label="Registration" value={vehicle.registration_number} icon={Hash} />
                <InfoItem label="Type" value={vehicle.vehicle_type} icon={Truck} />
                <InfoItem label="Capacity" value={vehicle.capacity ? `${vehicle.capacity} Ton` : null} icon={Zap} />
                <InfoItem label="Brand" value={vehicle.brand} />
                <InfoItem label="Model" value={vehicle.model} />
                <InfoItem label="Year" value={vehicle.year?.toString()} />
                <InfoItem label="VIN / Chassis" value={vehicle.vin} icon={Shield} />
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" /> Compliance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Insurance Expiry', date: vehicle.insurance_expiry },
                  { label: 'Fitness Expiry', date: vehicle.fitness_expiry },
                ].map(({ label, date }) => {
                  const expired = isExpired(date);
                  const expiring = isExpiringSoon(date);
                  return (
                    <div key={label} className={`p-4 rounded-xl border ${expired ? 'bg-red-50 border-red-200' : expiring ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {expired ? <AlertTriangle className="w-4 h-4 text-red-500" /> : expiring ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                      </div>
                      <p className={`text-base font-black ${expired ? 'text-red-700' : expiring ? 'text-amber-700' : 'text-slate-900'}`}>
                        {date ? formatDate(date) : 'Not set'}
                      </p>
                      {expired && <p className="text-[10px] text-red-600 font-bold mt-1">EXPIRED</p>}
                      {expiring && !expired && <p className="text-[10px] text-amber-600 font-bold mt-1">Expiring within 30 days</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> Uploaded Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <DocLink url={vehicle.insurance_document} label="Insurance Policy" icon={Shield} />
                <DocLink url={vehicle.registration_document} label="Registration / RC" icon={FileText} />
                <DocLink url={vehicle.fitness_document} label="Fitness Certificate" icon={CheckCircle2} />
              </div>
            </div>

            {/* Trip history */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" /> Trip History
              </h3>
              {vehicle.assignments?.length > 0 ? (
                <div className="space-y-2">
                  {vehicle.assignments.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-700">{a.booking?.pickup_address?.slice(0,30) || 'Unknown'} → {a.booking?.delivery_address?.slice(0,30) || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(a.created_at)}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${a.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {a.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">No trips recorded yet.</p>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Driver card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" /> Assigned Driver
              </h3>
              {driver ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-700 text-lg flex-shrink-0">
                    {driver.user?.first_name?.[0]}{driver.user?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{driver.user?.first_name} {driver.user?.last_name}</p>
                    <p className="text-xs text-slate-500">{driver.user?.phone}</p>
                    <p className="text-[10px] text-slate-400">{driver.license}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <User className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No driver assigned</p>
                </div>
              )}
            </div>

            {/* Current Booking */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Current Booking
              </h3>
              {activeAssignment ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">{activeAssignment.status?.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-bold">From:</span> {activeAssignment.booking?.pickup_address?.slice(0, 40) || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-bold">To:</span> {activeAssignment.booking?.delivery_address?.slice(0, 40) || 'N/A'}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-700">Vehicle Available</p>
                  <p className="text-xs text-slate-400 mt-1">No active booking</p>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Fleet Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Trips</span>
                  <span className="font-bold text-slate-900">{vehicle.assignments?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Completed</span>
                  <span className="font-bold text-emerald-600">{vehicle.assignments?.filter(a => a.status === 'DELIVERED').length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete Vehicle</h3>
                <p className="text-sm text-slate-500">{vehicle.registration_number}</p>
              </div>
            </div>
            {deleteError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{deleteError}
              </div>
            )}
            <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModal(false); setDeleteError(''); }} className="flex-1 py-2.5 text-sm font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
