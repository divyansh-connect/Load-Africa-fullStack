import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, Clock, AlertCircle, XCircle, User, MapPin
} from 'lucide-react';
import { Button } from '../../components/ui';
import { driverService } from '../../services/driverService';
import api from '../../services/api';

export default function KYCVerification() {
  const [status, setStatus] = useState('AVAILABLE'); 
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [profile, setProfile] = useState(null);

  const [documents, setDocuments] = useState([
    { key: 'govt_id', title: 'Government ID / Passport', type: 'Personal ID', status: 'not_uploaded', uploadDate: 'Not Uploaded', expiryDate: 'Never' },
    { key: 'license_front', title: 'Driver License Front', type: 'Driving Credentials', status: 'not_uploaded', uploadDate: 'Not Uploaded', expiryDate: 'Never' },
    { key: 'license_back', title: 'Driver License Back', type: 'Driving Credentials', status: 'not_uploaded', uploadDate: 'Not Uploaded', expiryDate: 'Never' },
    { key: 'vehicle_registration', title: 'Vehicle Registration Disc/Paper', type: 'Vehicle Compliance', status: 'not_uploaded', uploadDate: 'Not Uploaded', expiryDate: 'Never' }
  ]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const fetchKYCDocs = async () => {
    try {
      setLoading(true);
      const res = await driverService.getKYCDocuments();
      if (res.success && res.data) {
        const dbDocs = res.data.documents || {};
        const driverStatus = res.data.status;
        const approval = res.data.approval || {};
        
        setStatus(driverStatus);
        setProfile(res.data.profileDetails);
        
        setDocuments(prevDocs => 
          prevDocs.map(doc => {
            const fileUrl = dbDocs[doc.key];
            if (fileUrl) {
              let docStatus = 'pending';
              if (driverStatus === 'ACTIVE' || driverStatus === 'AVAILABLE') {
                docStatus = 'approved';
              } else if (driverStatus === 'REJECTED') {
                docStatus = 'rejected';
              }
              return {
                ...doc,
                status: docStatus,
                uploadDate: 'Uploaded to Compliance',
                reason: approval.rejection_reason || ''
              };
            }
            return {
              ...doc,
              status: 'not_uploaded',
              uploadDate: 'Not Uploaded'
            };
          })
        );
      }
    } catch (err) {
      console.error("Failed to load KYC documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCDocs();
  }, []);

  const handleUpload = async (docKey, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast(`Uploading ${file.name}...`);
      
      const formData = new FormData();
      formData.append('files', file);

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data?.success && uploadRes.data?.data?.urls?.[0]) {
        const fileUrl = uploadRes.data.data.urls[0];
        
        const saveRes = await driverService.uploadKYCDocument(docKey, fileUrl);
        if (saveRes.success) {
          showToast("Document uploaded and saved successfully!");
          fetchKYCDocs(); 
        }
      }
    } catch (err) {
      alert("Failed to upload document. Please try again.");
    }
  };

  const handleSubmitKYC = async () => {
    try {
      setLoading(true);
      const res = await driverService.submitKYC({
        license: profile?.licenseNumber || 'LIC-12345',
        id_document: profile?.nationalId || 'ID-98765'
      });
      if(res.success) {
        setStatus('UNDER_REVIEW');
        fetchKYCDocs();
        alert("KYC Profile Submitted! An admin will review your profile details shortly.");
      }
    } catch (err) {
      alert("Failed to submit KYC profile");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
      case 'pending':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase"><Clock className="h-3 w-3" /> Pending Review</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Not Uploaded</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">KYC & Document Verification</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Upload and maintain your mandatory compliance documents to ensure uninterrupted load matching.
        </p>
      </div>

      {/* Global Status Banner */}
      {status === 'REJECTED' ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-4">
          <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-extrabold text-red-800">Action Required: Profile Rejected</p>
            <p className="text-xs text-red-605 mt-1">One or more of your documents were rejected. Please check, re-upload, and resubmit.</p>
          </div>
        </div>
      ) : status === 'PENDING' || status === 'UNDER_REVIEW' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-4">
          <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-extrabold text-amber-800">Under Compliance Review</p>
            <p className="text-xs text-amber-655 mt-1">Your documents have been submitted and are under review. Our team will verify them in 1-2 business days.</p>
          </div>
        </div>
      ) : status === 'ACTIVE' || status === 'AVAILABLE' ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-start gap-4">
          <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-extrabold text-emerald-800">Compliance Verified</p>
            <p className="text-xs text-emerald-655 mt-1">All your documents are approved and up to date. You have full access to platform matching and dispatch.</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-slate-550 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-extrabold text-slate-800">Verification Pending</p>
            <p className="text-xs text-slate-500 mt-1">Please upload clear copies of all required documents and click submit below to request compliance approval.</p>
          </div>
        </div>
      )}

      {/* Profile Info Details Card */}
      {profile && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-amber-500" /> Submitted Registration Profile
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-left">
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Full Name</span>
              <span className="text-slate-800 font-bold">{profile.fullName || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Email Address</span>
              <span className="text-slate-800 font-bold">{profile.email || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Phone Number</span>
              <span className="text-slate-800 font-bold">{profile.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Date of Birth</span>
              <span className="text-slate-800 font-bold">
                {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Gender</span>
              <span className="text-slate-800 font-bold">{profile.gender || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">National ID Number</span>
              <span className="text-slate-800 font-bold">{profile.nationalId || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">License Number</span>
              <span className="text-slate-800 font-bold">{profile.licenseNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">License Expiry</span>
              <span className="text-slate-800 font-bold">
                {profile.licenseExpiry ? new Date(profile.licenseExpiry).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Emergency Contact</span>
              <span className="text-slate-800 font-bold">
                {profile.emergencyContactName ? `${profile.emergencyContactName} (${profile.emergencyContactPhone})` : 'N/A'}
              </span>
            </div>
            <div className="sm:col-span-3">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Physical Address</span>
              <span className="text-slate-800 font-bold">
                {profile.address ? `${profile.address}, ${profile.city}, ${profile.province}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Document Tracker */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Required Documents</h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase">{documents.filter(d => d.status === 'approved').length} / {documents.length} Approved</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {documents.map(doc => (
            <div key={doc.key} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
              
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl shrink-0 ${
                  doc.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                  doc.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  doc.status === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-800">{doc.title}</h4>
                    {getStatusBadge(doc.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-500">
                    <span className="uppercase text-slate-400">Type: {doc.type}</span>
                    <span>Status: {doc.uploadDate}</span>
                    <span className={doc.expiryDate !== 'Never' ? 'text-amber-600' : ''}>Expires: {doc.expiryDate}</span>
                  </div>
                  
                  {doc.status === 'rejected' && doc.reason && (
                    <div className="mt-2 p-3 bg-red-50 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2 border border-red-100">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Reason: {doc.reason}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <input 
                  type="file" 
                  id={`file-input-${doc.key}`}
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleUpload(doc.key, e)} 
                />
                
                <label 
                  htmlFor={`file-input-${doc.key}`}
                  className="cursor-pointer px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" /> 
                  {doc.status === 'approved' ? 'Update Document' : doc.status === 'rejected' ? 'Re-upload' : doc.status === 'pending' ? 'Update File' : 'Upload File'}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button 
          disabled={loading || status === 'PENDING' || status === 'UNDER_REVIEW' || status === 'ACTIVE'}
          onClick={handleSubmitKYC} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 text-sm border-0 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : status === 'PENDING' || status === 'UNDER_REVIEW' ? 'Under Review' : status === 'ACTIVE' ? 'KYC Approved' : 'Submit KYC Profile'}
        </Button>
      </div>

      {/* Local Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 p-4 rounded-xl shadow-xl bg-slate-900 border border-slate-800 text-white z-50 animate-slideUp">
          <p className="text-xs font-bold">{toast.message}</p>
        </div>
      )}

    </div>
  );
}
