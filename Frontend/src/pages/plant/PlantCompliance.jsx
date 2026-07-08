import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { plantService } from '../../services/plantService';

export default function PlantCompliance() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('REGISTERED');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [docs, setDocs] = useState({
    registration: null,
    vat: null,
    license: null,
    insurance: null
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await plantService.getDashboard();
      if (res.success && res.data) {
        setStatus(res.data.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, key) => {
    if (e.target.files.length > 0) {
      setDocs(prev => ({ ...prev, [key]: 'UPLOADED_DOC' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docs.registration || !docs.vat || !docs.license || !docs.insurance) {
      alert("Please upload all required company documents.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await plantService.submitCompliance({ company_documents: docs });
      if (res.success) {
        setStatus('UNDER_REVIEW');
        alert("Compliance submitted successfully!");
      }
    } catch (err) {
      alert("Failed to submit compliance.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading compliance status...</div>;

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <div>
        <h1 className="text-xl font-black text-slate-900">Compliance & Verification</h1>
        <p className="text-xs text-slate-500 font-medium">LoadAfrica requires strict compliance to activate your Plant Owner account.</p>
      </div>

      {status === 'ACTIVE' && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
          <div>
            <h3 className="font-bold text-emerald-800 text-lg">Account Active</h3>
            <p className="text-emerald-700 text-sm mt-1">Your company has been verified and you are fully operational in the Heavy Equipment Marketplace.</p>
          </div>
        </div>
      )}

      {status === 'UNDER_REVIEW' && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
          <AlertCircle className="h-8 w-8 text-amber-500 shrink-0" />
          <div>
            <h3 className="font-bold text-amber-800 text-lg">Account Under Review</h3>
            <p className="text-amber-700 text-sm mt-1">Your account is currently under compliance review. The Admin team is verifying your company documents. You will be notified once approved.</p>
          </div>
        </div>
      )}

      {status === 'REGISTERED' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-rose-500 shrink-0" />
            <div>
              <h4 className="font-bold text-rose-800">Action Required: Upload Business Documents</h4>
              <p className="text-xs text-rose-600 mt-1">Please provide the following documents to initiate the verification process.</p>
            </div>
          </div>

          <Card className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Company Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Company Registration (CIPC)</label>
                <input type="file" required onChange={(e) => handleFileChange(e, 'registration')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-100 file:text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">VAT Certificate</label>
                <input type="file" required onChange={(e) => handleFileChange(e, 'vat')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-100 file:text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Business License</label>
                <input type="file" required onChange={(e) => handleFileChange(e, 'license')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-100 file:text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Public Liability Insurance</label>
                <input type="file" required onChange={(e) => handleFileChange(e, 'insurance')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-100 file:text-slate-700" />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8">
              {submitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
