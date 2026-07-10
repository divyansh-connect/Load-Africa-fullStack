import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Building, ShieldCheck, CheckCircle2, X, Camera, Loader2, Edit3, Calendar } from 'lucide-react';
import { authService } from '../../services/authService';
import { uploadService } from '../../services/uploadService';

export default function BrokerProfile() {
  const [activeBroker, setActiveBroker] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Editable form state
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    companyName: '',
    avatar: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setActiveBroker(user);
  }, []);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
    return `${base}${avatar}`;
  };

  const openEditModal = () => {
    setForm({
      first_name: activeBroker?.first_name || '',
      last_name: activeBroker?.last_name || '',
      phone: activeBroker?.phone || '',
      companyName: activeBroker?.broker?.company_name || activeBroker?.companyName || '',
      avatar: activeBroker?.avatar || ''
    });
    setEditModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res.success && res.data?.urls?.length > 0) {
        setForm(prev => ({ ...prev, avatar: res.data.urls[0] }));
      }
    } catch (err) {
      alert('Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await authService.updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        avatar: form.avatar
      });

      if (res.success) {
        // Refresh local state
        const updatedUser = authService.getCurrentUser();
        setActiveBroker(updatedUser);
        setEditModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = getAvatarUrl(activeBroker?.avatar);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Manage your personal information and broker preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Header Cover */}
        <div className="h-36 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 w-full relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA4Ij48cGF0aCBkPSJNMzYgMzRWMGgydjM0aDI0djJIMzZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="absolute -bottom-14 left-8 flex items-end gap-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center text-amber-500 overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12" />
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 h-5 w-5 rounded-full border-[3px] border-white" title="Online" />
            </div>
            <div className="mb-3 pb-2 hidden sm:block">
              <h2 className="text-xl font-black text-slate-900">
                {activeBroker ? `${activeBroker.first_name || ''} ${activeBroker.last_name || ''}`.trim() || 'Broker' : 'Loading...'}
              </h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Freight Coordinator • {activeBroker?.status || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" /> Personal Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                  <User className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-bold text-slate-900">
                    {activeBroker ? `${activeBroker.first_name || ''} ${activeBroker.last_name || ''}`.trim() || 'Not set' : '—'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-bold text-slate-900">{activeBroker?.email || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                  <Phone className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-bold text-slate-900">{activeBroker?.phone || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100 shrink-0">
                  <Building className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</p>
                  <p className="text-sm font-bold text-slate-900">
                    {activeBroker?.broker?.company_name || activeBroker?.companyName || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-400" /> Account Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900">
                      {activeBroker?.status === 'ACTIVE' ? 'Verified Broker' : activeBroker?.status || 'N/A'}
                    </p>
                    {activeBroker?.status === 'ACTIVE' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Building className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</p>
                  <p className="text-sm font-bold text-slate-900">{activeBroker?.role || 'BROKER'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-bold text-slate-900">
                    {activeBroker?.created_at ? new Date(activeBroker.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button 
            onClick={openEditModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            <Edit3 className="h-4 w-4" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg relative z-10 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-black text-slate-900">Edit Profile</h2>
                <p className="text-xs text-slate-500 font-medium">Update your information and photo</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-200 shadow-sm bg-white flex items-center justify-center overflow-hidden">
                    {form.avatar ? (
                      <img src={getAvatarUrl(form.avatar)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 h-8 w-8 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Click camera icon to change photo</p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">First Name</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Email (disabled) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={activeBroker?.email || ''}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 cursor-not-allowed text-slate-400 text-sm font-semibold"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold text-slate-900"
                  placeholder="+27 ..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEditModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-amber-500 text-white text-sm font-black rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider text-[11px]"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
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
