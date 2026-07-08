import React, { useState } from 'react';
import { 
  Truck, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, Info
} from 'lucide-react';
import { Button, Input } from '../../components/ui';

export default function VehicleManagement() {
  const [vehicle] = useState({
    model: 'Mercedes-Benz Actros 2645',
    registration: 'GP 12 ABC',
    capacity: '34 Tons',
    bodyType: 'Flatbed Superlink'
  });

  const [documents, setDocuments] = useState([
    {
      id: 'vdoc-1',
      title: 'Vehicle Registration Certificate (RC)',
      status: 'valid', // valid, expiring, expired
      expiryDate: '2025-10-15',
    },
    {
      id: 'vdoc-2',
      title: 'Commercial Insurance Policy',
      status: 'valid',
      expiryDate: '2025-05-20',
    },
    {
      id: 'vdoc-3',
      title: 'Vehicle Fitness Certificate',
      status: 'expiring', // Need renewal reminder
      expiryDate: '2024-08-01', 
    },
    {
      id: 'vdoc-4',
      title: 'Cross-Border Road Permit',
      status: 'expired',
      expiryDate: '2024-06-15',
    }
  ]);

  const handleUpload = (docId) => {
    // Mock upload action
    const newDocs = documents.map(d => {
      if (d.id === docId) {
        return { ...d, status: 'valid', expiryDate: '2025-07-06' };
      }
      return d;
    });
    setDocuments(newDocs);
    alert('Document uploaded successfully for review.');
  };

  const getStatusDisplay = (doc) => {
    switch (doc.status) {
      case 'valid':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase"><CheckCircle2 className="h-3 w-3" /> Valid</span>;
      case 'expiring':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase"><AlertTriangle className="h-3 w-3" /> Expiring Soon</span>;
      case 'expired':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase"><AlertCircle className="h-3 w-3" /> Expired</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vehicle Management</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage your assigned vehicle details and compliance documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Vehicle Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-900 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{vehicle.registration}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                  Active Vehicle
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Make & Model</span>
                <p className="text-sm font-bold text-slate-800">{vehicle.model}</p>
              </div>
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cargo Capacity</span>
                <p className="text-sm font-bold text-slate-800">{vehicle.capacity}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Body Type</span>
                <p className="text-sm font-bold text-slate-800">{vehicle.bodyType}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-800">Need to change vehicles?</p>
              <p className="text-[10px] text-amber-700 leading-relaxed">Vehicle reassignments must be handled by your fleet manager or LoadAfrica support to ensure compliance matching.</p>
            </div>
          </div>
        </div>

        {/* Right Col: Vehicle Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Compliance Documents</h3>
                <p className="text-[10px] text-slate-500 mt-1">Keep your vehicle documents up to date to avoid dispatch suspension.</p>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {documents.map(doc => (
                <div key={doc.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                  
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl shrink-0 ${
                      doc.status === 'valid' ? 'bg-emerald-100 text-emerald-600' :
                      doc.status === 'expiring' ? 'bg-amber-100 text-amber-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-800 text-sm">{doc.title}</h4>
                      <div className="flex items-center gap-3">
                        {getStatusDisplay(doc)}
                        <span className={`text-[10px] font-bold ${
                          doc.status === 'expired' ? 'text-red-500' : 
                          doc.status === 'expiring' ? 'text-amber-600' : 
                          'text-slate-500'
                        }`}>
                          Expiry: {doc.expiryDate}
                        </span>
                      </div>
                      
                      {doc.status === 'expiring' && (
                        <p className="text-[10px] font-medium text-amber-700 mt-1">Renewal Reminder: Please upload a new certificate before the expiry date.</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button 
                      className={`text-xs px-4 flex items-center gap-2 ${
                        doc.status !== 'valid' ? 'bg-slate-900 hover:bg-slate-800 text-white' : ''
                      }`} 
                      variant={doc.status === 'valid' ? 'outline' : 'default'}
                      onClick={() => handleUpload(doc.id)}
                    >
                      <Upload className="h-3 w-3" /> Update Document
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
