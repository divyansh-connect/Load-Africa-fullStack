import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, AlertTriangle, 
  Truck, Info, Eye, Save, Trash2, ArrowUpRight, Compass
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';

export default function KYCVerification() {
  const [driver, setDriver] = useState(null);
  const [kycStatus, setKycStatus] = useState('pending');
  const [licensePlate, setLicensePlate] = useState('');
  const [truckModel, setTruckModel] = useState('');
  const [capacity, setCapacity] = useState('20 Tons');
  const [truckType, setTruckType] = useState('Flatbed Truck');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const drivers = getMockData('drivers') || [];
    const me = drivers[0]; // Kofi Mensah
    if (me) {
      setDriver(me);
      setKycStatus(me.kycStatus || 'pending');
      
      const vehicles = getMockData('vehicles') || [];
      const myVehicle = vehicles.find(v => v.id === me.vehicleId);
      if (myVehicle) {
        setLicensePlate(myVehicle.numberPlate);
        setTruckModel(myVehicle.model);
        setCapacity(myVehicle.capacity);
        setTruckType(myVehicle.type);
      }
    }
  }, []);

  const handleKYCSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    setTimeout(() => {
      setSubmitting(false);
      setKycStatus('submitted');
      setSubmitted(true);

      // Save back to local storage
      const drivers = getMockData('drivers') || [];
      const meIdx = drivers.findIndex(d => d.id === 'drv-1');
      if (meIdx > -1) {
        drivers[meIdx].kycStatus = 'submitted';
        saveMockData('drivers', drivers);
      }

      // Sync vehicle registry updates
      const vehicles = getMockData('vehicles') || [];
      const vehicleIdx = vehicles.findIndex(v => v.id === driver.vehicleId);
      if (vehicleIdx > -1) {
        vehicles[vehicleIdx] = {
          ...vehicles[vehicleIdx],
          numberPlate: licensePlate,
          model: truckModel,
          capacity: capacity,
          type: truckType
        };
        saveMockData('vehicles', vehicles);
      }
      
      setTimeout(() => setSubmitted(false), 2000);
    }, 1500);
  };

  if (!driver) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">KYC Verification & Vehicle Registry</h2>
        <p className="text-xs text-slate-400">Complete verification to unlock higher budget transportation contracts.</p>
      </div>

      {/* KYC Progress Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className={`p-4 rounded-2xl ${
            kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-600' :
            kycStatus === 'submitted' ? 'bg-blue-100 text-blue-600 animate-pulse' :
            'bg-amber-100 text-amber-600'
          }`}>
            {kycStatus === 'verified' ? <ShieldCheck className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Verification Status</h3>
            <p className="text-xs text-slate-400 mt-1">
              {kycStatus === 'verified' && 'Verified Driver - full portal bidding access is unlocked.'}
              {kycStatus === 'submitted' && 'KYC Documents submitted. Review takes up to 24 hours.'}
              {kycStatus === 'pending' && 'KYC pending. Please upload national identification details.'}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {kycStatus === 'verified' && (
            <span className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">KYC VERIFIED</span>
          )}
          {kycStatus === 'submitted' && (
            <span className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 rounded-xl border border-blue-200">UNDER REVIEW</span>
          )}
          {kycStatus === 'pending' && (
            <span className="px-3.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-xl border border-amber-200 animate-pulse">ACTION REQUIRED</span>
          )}
        </div>
      </div>

      <form onSubmit={handleKYCSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Driver Upload fields & Vehicle details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* File Upload card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-800">1. Verification Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between items-center text-center hover:bg-slate-50/50 cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="font-bold text-xs text-slate-700 mt-2">Driver's License (Front & Back)</span>
                <p className="text-[10px] text-slate-400 mt-1">PDF, PNG, JPG accepted (Max 5MB)</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-3 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> cdl-front.jpg uploaded
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between items-center text-center hover:bg-slate-50/50 cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="font-bold text-xs text-slate-700 mt-2">National ID or Passport</span>
                <p className="text-[10px] text-slate-400 mt-1">Verification photo check node</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-3 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> passport.pdf uploaded
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle specs registry form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-800">2. Truck Registry Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Truck Model</label>
                <input 
                  type="text" 
                  value={truckModel}
                  onChange={(e) => setTruckModel(e.target.value)}
                  placeholder="e.g. Volvo FH16 Flatbed"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">License Plate Number</label>
                <input 
                  type="text" 
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="e.g. GAR-492-KM"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:border-emerald-500 text-sm transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Truck Capacity (Tons)</label>
                <input 
                  type="text" 
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 25 Tons"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Truck Body Category</label>
                <select 
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none text-sm transition-all"
                >
                  <option>Flatbed Truck</option>
                  <option>Tipper Truck</option>
                  <option>Box Truck</option>
                  <option>Refrigerated Van</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : submitted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Registry Updated
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save & Submit KYC
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Guidelines info */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Why Verification?</h3>
              <p className="text-xs text-slate-400">Security policies protect both shippers and transporters.</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-800">Escrow Disbursals</p>
                  <p className="text-slate-500 font-light leading-relaxed">Only verified carriers have access to immediate payout release locks.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Truck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-800">High Weight Bids</p>
                  <p className="text-slate-500 font-light leading-relaxed">Bulk cement flatbed loads &gt; 25 Tons require verification audit compliance.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-2xl border border-amber-100 font-medium">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
              <span>Compliance reviews take 2-4 hours.</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
