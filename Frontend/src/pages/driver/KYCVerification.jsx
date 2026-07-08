import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, Clock, AlertCircle, XCircle 
} from 'lucide-react';
import { Button } from '../../components/ui';
import { driverService } from '../../services/driverService';

export default function KYCVerification() {
  const [status, setStatus] = useState('AVAILABLE'); // Maps to REGISTERED/AVAILABLE initially
  const [loading, setLoading] = useState(false);

  const [documents, setDocuments] = useState([
    { id: 'doc-1', title: 'Driver License', type: 'Personal ID', status: 'not_uploaded', uploadDate: 'Not Uploaded', expiryDate: 'Never' },
    { id: 'doc-2', title: 'National ID', type: 'Personal ID', status: 'not_uploaded', uploadDate: 'Not Uploaded', expiryDate: 'Never' }
  ]);

  useEffect(() => {
    driverService.getDriverDashboard().then(res => {
      if(res.success) {
        const currentStatus = res.data.status;
        setStatus(currentStatus);
        
        // Sync document UI with backend status
        if (currentStatus === 'UNDER_REVIEW') {
          setDocuments(docs => docs.map(d => ({ ...d, status: 'pending', uploadDate: new Date().toISOString().split('T')[0] })));
        } else if (currentStatus === 'ACTIVE') {
          setDocuments(docs => docs.map(d => ({ ...d, status: 'approved', uploadDate: new Date().toISOString().split('T')[0] })));
        }
      }
    });
  }, []);

  const handleUpload = (docId) => {
    const newDocs = documents.map(d => {
      if (d.id === docId) {
        return { ...d, status: 'uploaded', uploadDate: new Date().toISOString().split('T')[0] };
      }
      return d;
    });
    setDocuments(newDocs);
  };

  const handleSubmitKYC = async () => {
    try {
      setLoading(true);
      const res = await driverService.submitKYC({
        license: 'LIC-12345',
        id_document: 'ID-98765'
      });
      if(res.success) {
        setStatus('UNDER_REVIEW');
        setDocuments(docs => docs.map(d => ({ ...d, status: 'pending' })));
        alert("KYC Submitted! An admin will review your profile shortly.");
      }
    } catch (err) {
      alert("Failed to submit KYC");
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
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">KYC & Document Verification</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Upload and maintain your mandatory compliance documents to ensure uninterrupted load matching.
        </p>
      </div>

      {/* Global Status Banner */}
      {documents.some(d => d.status === 'rejected') ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-4">
          <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-red-800">Action Required: Documents Rejected</p>
            <p className="text-xs text-red-600 mt-1">One or more of your uploaded documents were rejected. Please review the reasons below and re-upload clear copies.</p>
          </div>
        </div>
      ) : documents.some(d => d.status === 'pending') ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-4">
          <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-amber-800">Under Review</p>
            <p className="text-xs text-amber-600 mt-1">Some of your documents are currently being reviewed by our compliance team. This typically takes 1-2 business days.</p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-start gap-4">
          <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-emerald-800">Fully Verified</p>
            <p className="text-xs text-emerald-600 mt-1">All your documents are approved and up to date. You have full access to all platform features and load assignments.</p>
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
            <div key={doc.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
              
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl shrink-0 ${
                  doc.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                  doc.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-800">{doc.title}</h4>
                    {getStatusBadge(doc.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-500">
                    <span className="uppercase text-slate-400">Type: {doc.type}</span>
                    <span>Uploaded: {doc.uploadDate}</span>
                    <span className={doc.expiryDate !== 'Never' ? 'text-amber-600' : ''}>Expires: {doc.expiryDate}</span>
                  </div>
                  
                  {doc.status === 'rejected' && doc.reason && (
                    <div className="mt-2 p-3 bg-red-50 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2 border border-red-100">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{doc.reason}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {doc.status === 'approved' ? (
                  <Button variant="outline" className="text-xs px-4" onClick={() => handleUpload(doc.id)}>Update Document</Button>
                ) : (
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 flex items-center gap-2" onClick={() => handleUpload(doc.id)}>
                    <Upload className="h-3 w-3" /> {doc.status === 'rejected' ? 'Re-upload' : 'Upload New'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button 
          disabled={loading || status === 'UNDER_REVIEW' || status === 'ACTIVE'}
          onClick={handleSubmitKYC} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 text-sm border-0 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : status === 'UNDER_REVIEW' ? 'Under Review' : status === 'ACTIVE' ? 'KYC Approved' : 'Submit KYC Profile'}
        </Button>
      </div>

    </div>
  );
}
