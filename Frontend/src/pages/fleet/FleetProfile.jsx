import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Building, Save, Mail, Phone, MapPin, 
  FileText, ShieldCheck, Star, AlertCircle
} from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { fleetService } from '../../services/fleetService';

export default function FleetProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'profile');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    company_registration: '',
    tax_number: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fleetService.getProfile();
      if (res.success && res.data) {
        const p = res.data;
        setProfileData({
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          email: p.email || '',
          phone: p.phone || '',
          company_name: p.company_name || '',
          company_registration: p.company_registration || '',
          tax_number: p.tax_number || '',
          address: p.address || ''
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError('');
    try {
      const res = await fleetService.updateProfile(profileData);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Profile & Settings</h2>
        <p className="text-xs text-slate-400 font-bold mt-1">Manage your Fleet Owner profile, corporate documents, and platform preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-200/80">
        <button 
          onClick={() => { setActiveTab('profile'); navigate('/fleet-portal/profile?tab=profile', { replace: true }); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all ${
            activeTab === 'profile' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <User className="h-4 w-4" />
          Personal Details
        </button>
        <button 
          onClick={() => { setActiveTab('company'); navigate('/fleet-portal/profile?tab=company', { replace: true }); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all ${
            activeTab === 'company' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Building className="h-4 w-4" />
          Company Information
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 sm:p-8">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl text-red-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            <p>Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center gap-6 pb-4 border-b border-slate-100">
                <img 
                  src={profileData.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80'} 
                  alt="Fleet Owner" 
                  className="h-20 w-20 rounded-full object-cover border-4 border-slate-50"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Profile Photo</h3>
                  <div className="flex gap-2 mt-2">
                    <label className="cursor-pointer text-[10px] py-1.5 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-slate-700 transition-colors">
                      Change Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const { uploadService } = await import('../../services/uploadService');
                              const res = await uploadService.uploadFile(file);
                              if (res.success && res.data.urls.length > 0) {
                                const url = 'http://localhost:5000' + res.data.urls[0];
                                setProfileData(prev => ({ ...prev, avatar: url }));
                              }
                            } catch (err) {
                              alert('Upload failed');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mt-4">
                <User className="h-4 w-4 text-amber-500" /> Owner Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">First Name</label>
                  <Input 
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Last Name</label>
                  <Input 
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1"><Mail className="h-3 w-3" /> Email Address</label>
                  <Input 
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-slate-50 opacity-60 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1"><Phone className="h-3 w-3" /> Phone Number</label>
                  <Input 
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="e.g., +27 82 123 4567"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Building className="h-4 w-4 text-amber-500" /> Corporate Profile
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Company Name</label>
                  <Input 
                    type="text"
                    value={profileData.company_name}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                    placeholder="e.g., LoadAfrica Logistics Ltd"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1"><FileText className="h-3 w-3" /> Company Registration No.</label>
                  <Input 
                    type="text"
                    value={profileData.company_registration}
                    onChange={(e) => setProfileData({ ...profileData, company_registration: e.target.value })}
                    placeholder="e.g., 2026/123456/07"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Tax / VAT Number</label>
                  <Input 
                    type="text"
                    value={profileData.tax_number}
                    onChange={(e) => setProfileData({ ...profileData, tax_number: e.target.value })}
                    placeholder="e.g., 4010293847"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Business Address</label>
                  <Input 
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="e.g., 45 Logistics Blvd, Merewent, Durban"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-150 pt-6 flex justify-end">
            <Button 
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {saving ? <><span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> Saving Changes</> : <><Save className="h-4 w-4" /> Save Preferences</>}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
}
