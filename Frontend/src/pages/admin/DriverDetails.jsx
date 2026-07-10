import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, Mail, Activity, Calendar, Truck, FileText,
  CreditCard, RefreshCw, ZoomIn, ZoomOut, RotateCw, Download, Check, X,
  AlertTriangle, Shield, CheckCircle2, ListFilter, UserPlus, Clock
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const DOCUMENT_LABELS = {
  profile_photo: 'Profile Photo',
  selfie: 'Selfie Verification',
  govt_id: 'Government ID / Passport',
  license_front: 'Driver License Front',
  license_back: 'Driver License Back',
  police_clearance: 'Police Clearance Certificate',
  medical_certificate: 'Medical Fitness Certificate',
  proof_of_address: 'Proof of Address',
  vehicle_registration: 'Vehicle Registration Disc/Paper',
  insurance: 'Vehicle Insurance Policy',
  roadworthy_certificate: 'Roadworthy Certificate (COF)'
};

export default function DriverDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fleets, setFleets] = useState([]);
  const [selectedFleetId, setSelectedFleetId] = useState('');

  // Modals / Action Prompts
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');

  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionChecklist, setRevisionChecklist] = useState({
    govt_id: false,
    license_front: false,
    license_back: false,
    police_clearance: false,
    medical_certificate: false,
    proof_of_address: false,
    vehicle_registration: false,
    insurance: false,
    roadworthy_certificate: false
  });

  // Document Viewer settings
  const [activeDocKey, setActiveDocKey] = useState('govt_id');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const fetchDriverDetails = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUserById(id);
      if (res.success) {
        setUser(res.data);
        if (res.data.driver?.fleet_owner_id) {
          setSelectedFleetId(res.data.driver.fleet_owner_id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFleetOwnersList = async () => {
    try {
      const res = await adminService.getApprovedFleetOwners();
      if (res.success) {
        setFleets(res.data);
      }
    } catch (err) {
      console.error('Failed to load fleet owners', err);
    }
  };

  useEffect(() => {
    fetchDriverDetails();
    fetchFleetOwnersList();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500 gap-3 font-semibold text-xs uppercase tracking-wider">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" /> Loading driver verification files...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-500 font-bold text-sm">
        Driver profile records not found.
      </div>
    );
  }

  const driver = user.driver || {};
  const profile = driver.profile || {};
  const photos = driver.photos || {};
  const docs = driver.documents_relation || {};
  const allDocs = { ...docs, profile_photo: photos?.profile_photo, selfie: photos?.selfie };
  const vehicle = driver.vehicle_relation || {};
  const approval = driver.approval || {};
  const statusHistory = driver.status_history || [];
  const wallet = user.wallets && user.wallets.length > 0 ? user.wallets[0] : null;

  // Document Viewer Handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownloadActiveDoc = () => {
    const fileUrl = allDocs[activeDocKey];
    if (fileUrl) {
      const baseServerUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
      const absoluteUrl = `${baseServerUrl}${fileUrl}`;
      window.open(absoluteUrl, '_blank');
    }
  };

  // Driver action triggers
  const handleApprove = async () => {
    const confirm = window.confirm("Approve this driver profile? This will activate their credentials and notify them.");
    if (!confirm) return;
    try {
      setActionLoading(true);
      const res = await adminService.approveDriverProfile(user.id);
      if (res.success) {
        alert("Driver profile approved and welcome notification logged.");
        fetchDriverDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason) {
      alert("Please enter a rejection reason.");
      return;
    }
    try {
      setActionLoading(true);
      const res = await adminService.rejectDriverProfile(user.id, rejectionReason);
      if (res.success) {
        alert("Driver profile rejected successfully.");
        setRejectionModalOpen(false);
        setRejectionReason('');
        fetchDriverDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendSubmit = async () => {
    if (!suspensionReason) {
      alert("Please enter a suspension reason.");
      return;
    }
    try {
      setActionLoading(true);
      const res = await adminService.suspendDriverProfile(user.id, suspensionReason);
      if (res.success) {
        alert("Driver profile suspended successfully.");
        setSuspensionModalOpen(false);
        setSuspensionReason('');
        fetchDriverDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevisionSubmit = async () => {
    const selectedDocsList = Object.entries(revisionChecklist)
      .filter(([_, checked]) => checked)
      .map(([key, _]) => DOCUMENT_LABELS[key])
      .join(', ');

    if (!selectedDocsList) {
      alert("Please select at least one document to request revision.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminService.requestMoreDocs(user.id, selectedDocsList);
      if (res.success) {
        alert(`Document revision request sent: ${selectedDocsList}`);
        setRevisionModalOpen(false);
        fetchDriverDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignFleetSubmit = async () => {
    try {
      setActionLoading(true);
      const res = await adminService.assignDriverFleet(user.id, selectedFleetId);
      if (res.success) {
        alert("Fleet owner assigned to driver profile successfully.");
        fetchDriverDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-slate-650" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Compliance Center</h1>
          <p className="text-sm font-semibold text-slate-500">Review documents, assign fleet managers, and update approval status.</p>
        </div>
      </div>

      {/* Main Grid: Profile Details Card + Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Profile Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Driver Avatar Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
            {/* Status bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              user.status === 'REJECTED' ? 'bg-red-500' :
              user.status === 'SUSPENDED' ? 'bg-orange-500' :
              user.status === 'PENDING' ? 'bg-amber-500' :
              'bg-emerald-500'
            }`} />

            <div className="mx-auto h-24 w-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 shadow-inner relative group">
              {photos.profile_photo ? (
                <img src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${photos.profile_photo}`} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-xs uppercase">No Photo</div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-black text-slate-900 leading-tight">{user.first_name} {user.last_name || ''}</h3>
              <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-wider">{driver.fleet_owner_id ? 'Fleet Driver' : 'Independent Driver'}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Status</span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{user.status}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">License Expiry</span>
                <span className="text-xs font-bold text-slate-800">
                  {driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Actions Center */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-amber-500" /> Verification Workflow
            </h4>

            {user.status === 'PENDING' && (
              <div className="space-y-2">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wide rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  Approve Driver Profile
                </button>
                <button
                  onClick={() => setRejectionModalOpen(true)}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 border border-red-200 font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer transition-colors"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => setRevisionModalOpen(true)}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-800 border border-amber-200 font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer transition-colors"
                >
                  Request Document Corrections
                </button>
              </div>
            )}

            {user.status === 'ACTIVE' && (
              <button
                onClick={() => setSuspensionModalOpen(true)}
                disabled={actionLoading}
                className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 text-orange-700 border border-orange-200 font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer transition-colors"
              >
                Suspend Driver Account
              </button>
            )}

            {user.status === 'SUSPENDED' && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wide rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                Reactivate Driver Profile
              </button>
            )}

            {approval.rejection_reason && user.status === 'REJECTED' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <span className="font-bold">Rejection Reason:</span> {approval.rejection_reason}
              </div>
            )}
            
            {approval.suspension_reason && user.status === 'SUSPENDED' && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700">
                <span className="font-bold">Suspension Reason:</span> {approval.suspension_reason}
              </div>
            )}

            {approval.requested_documents && user.status === 'PENDING' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold leading-normal">
                ⚠️ Correction Request Active: {approval.requested_documents}
              </div>
            )}
          </div>

          {/* Fleet owner assignment panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-indigo-500" /> Fleet Assignment
            </h4>

            <div className="space-y-3">
              <div className="relative text-left">
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Company Fleet Owner</label>
                <select
                  value={selectedFleetId}
                  onChange={e => setSelectedFleetId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="">Independent (No Company)</option>
                  {fleets.map(f => (
                    <option key={f.id} value={f.fleet_owner?.id || f.id}>
                      {f.fleet_owner?.company_name || `${f.first_name} ${f.last_name}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssignFleetSubmit}
                disabled={actionLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wide rounded-xl shadow cursor-pointer transition-colors"
              >
                Update Affiliation
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Document Review Section */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[550px]">
            
            {/* Sidebar list of documents */}
            <div className="w-full md:w-64 border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-100 bg-slate-100/50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Submitted Documents
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {Object.entries(DOCUMENT_LABELS).map(([key, label]) => {
                  const url = allDocs[key];
                  const isUploaded = !!url;
                  return (
                    <button
                      key={key}
                      onClick={() => { setActiveDocKey(key); setZoom(1); setRotation(0); }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all select-none cursor-pointer ${
                        activeDocKey === key
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate pr-2">{label}</span>
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${isUploaded ? 'bg-emerald-500' : 'bg-slate-350'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document display screen with Zoom/Rotate */}
            <div className="flex-1 flex flex-col bg-slate-900 relative">
              {allDocs[activeDocKey] ? (
                <>
                  {/* Toolbar */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button onClick={handleZoomIn} className="p-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-lg backdrop-blur" title="Zoom In"><ZoomIn className="h-4 w-4" /></button>
                    <button onClick={handleZoomOut} className="p-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-lg backdrop-blur" title="Zoom Out"><ZoomOut className="h-4 w-4" /></button>
                    <button onClick={handleRotate} className="p-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-lg backdrop-blur" title="Rotate"><RotateCw className="h-4 w-4" /></button>
                    <button onClick={handleDownloadActiveDoc} className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow font-black" title="Download Document"><Download className="h-4 w-4" /></button>
                  </div>

                  {/* Viewer frame */}
                  <div className="flex-1 overflow-auto flex items-center justify-center p-6">
                    {allDocs[activeDocKey].toLowerCase().endsWith('.pdf') ? (
                      <div className="text-center text-slate-300 font-bold space-y-3">
                        <FileText className="h-12 w-12 mx-auto text-slate-400 animate-pulse" />
                        <p className="text-xs">PDF Document uploaded. Click the button to view/download.</p>
                        <button
                          onClick={handleDownloadActiveDoc}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-lg shadow-md cursor-pointer"
                        >
                          Open PDF In New Tab
                        </button>
                      </div>
                    ) : (
                      <img
                        src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${allDocs[activeDocKey]}`}
                        alt="Doc preview"
                        className="max-w-full max-h-full object-contain transition-all shadow-xl rounded-md"
                        style={{
                          transform: `scale(${zoom}) rotate(${rotation}deg)`
                        }}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 text-xs font-bold gap-2">
                  <AlertTriangle className="h-8 w-8 text-slate-600" />
                  <span>Document has not been uploaded by this driver yet.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Driver info panel & status history */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Personal details info board */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <User className="h-4 w-4 text-slate-450" /> Personal Profile Details
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-655 text-left">
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Full Name</span>
              <span className="text-slate-850 font-bold">{user.first_name} {user.last_name || ''}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Email Address</span>
              <span className="text-slate-850 font-bold">{user.email}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Phone Number</span>
              <span className="text-slate-850 font-bold">{user.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">ID / Passport Number</span>
              <span className="text-slate-850 font-bold">{driver.id_document || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Driving License Number</span>
              <span className="text-slate-850 font-bold">{driver.license || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Vehicle Type</span>
              <span className="text-slate-850 font-bold">{driver.documents?.vehicleType || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Vehicle Registration</span>
              <span className="text-slate-850 font-bold">{driver.documents?.vehicleReg || 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Base / Residential Address</span>
              <span className="text-slate-850 font-bold">{driver.address || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Audit Log status history timeline */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-450" /> Status Change Audit Logs
          </h3>

          <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2">
            {statusHistory.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold text-center py-6">No audits log for this driver yet.</p>
            ) : (
              statusHistory.map((history) => (
                <div key={history.id} className="flex gap-3 text-xs leading-relaxed">
                  <div className="flex flex-col items-center">
                    <span className="h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm shrink-0" />
                    <span className="w-px flex-1 bg-slate-200" />
                  </div>
                  <div className="pb-2">
                    <p className="font-bold text-slate-800">
                      Status changed to <span className="text-amber-600 font-black">{history.new_status}</span>
                    </p>
                    {history.change_reason && <p className="text-[10px] text-slate-500 italic mt-0.5">Reason: "{history.change_reason}"</p>}
                    <span className="block text-[9px] text-slate-400 mt-1 font-bold">
                      By {history.changed_by?.email || 'System'} • {new Date(history.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Dialog: Rejection Reason */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-black text-slate-900 uppercase">Reject Driver Registration</h3>
              <button onClick={() => setRejectionModalOpen(false)} className="text-slate-400 hover:text-slate-655"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Enter Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. License back copy is blurry, please re-upload."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 h-24"
                />
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button onClick={() => setRejectionModalOpen(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleRejectSubmit} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black uppercase tracking-wider">Confirm Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog: Suspension Reason */}
      {suspensionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-black text-slate-900 uppercase">Suspend Driver Account</h3>
              <button onClick={() => setSuspensionModalOpen(false)} className="text-slate-400 hover:text-slate-655"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Enter Suspension Reason *</label>
                <textarea
                  value={suspensionReason}
                  onChange={e => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Terms violation - offline load handling."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 h-24"
                />
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button onClick={() => setSuspensionModalOpen(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleSuspendSubmit} className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-black uppercase tracking-wider">Confirm Suspend</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog: Request Documents Corrections */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-black text-slate-900 uppercase">Request Correction Checklist</h3>
              <button onClick={() => setRevisionModalOpen(false)} className="text-slate-400 hover:text-slate-655"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto text-left">
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-2">Check the document(s) that require revision. The driver status will be reverted to pending so they can re-upload.</p>
              
              <div className="space-y-2">
                {Object.entries(DOCUMENT_LABELS).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 border border-slate-150 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={revisionChecklist[key]}
                      onChange={(e) => setRevisionChecklist(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded accent-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button onClick={() => setRevisionModalOpen(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleRevisionSubmit} className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-955 rounded-lg text-xs font-black uppercase tracking-wider">Send Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
