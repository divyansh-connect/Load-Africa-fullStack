import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { authService } from '../../services/authService';

export default function BrokerProfile() {
  const [activeBroker, setActiveBroker] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setActiveBroker(user);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Manage your personal information and broker preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Header Cover */}
        <div className="h-32 bg-amber-500 w-full relative">
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-amber-500">
                <User className="h-10 w-10" />
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white" title="Online" />
            </div>
            <div className="mb-2 pb-2 hidden sm:block">
              <h2 className="text-xl font-black text-slate-900">{activeBroker?.first_name} {activeBroker?.last_name}</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Freight Coordinator</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-16 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Personal Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-semibold text-slate-900">{activeBroker?.first_name} {activeBroker?.last_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900">{activeBroker?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-900">{activeBroker?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Account Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-900">{activeBroker?.status === 'APPROVED' ? 'Verified Broker' : activeBroker?.status}</p>
                    {activeBroker?.status === 'APPROVED' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Building className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</p>
                  <p className="text-sm font-semibold text-slate-900">{activeBroker?.role}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button 
            onClick={() => setEditModalOpen(true)}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-900">Edit Profile</h2>
                <p className="text-sm text-slate-500">Update your broker information</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">First Name</label>
                <input type="text" defaultValue={activeBroker?.first_name} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-semibold text-slate-900" />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Last Name</label>
                <input type="text" defaultValue={activeBroker?.last_name} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-semibold text-slate-900" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                <input type="email" defaultValue={activeBroker?.email} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-semibold text-slate-900" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                <input type="tel" defaultValue={activeBroker?.phone} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-semibold text-slate-900" />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setEditModalOpen(false);
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 3000);
                }} 
                className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Popup */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-black text-sm">Profile Updated!</p>
              <p className="text-xs font-semibold text-emerald-100">Your changes have been saved.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
