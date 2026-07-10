import React, { useState, useEffect, useRef } from 'react';
import { Save, Globe, Mail, ShieldCheck, MapPin, Settings as SettingsIcon, RefreshCcw, CheckCircle2, User, Camera } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { settingService } from '../../services/settingService';
import { authService } from '../../services/authService';
import { uploadService } from '../../services/uploadService';
export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'platform');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings Saved!');
  const [successDesc, setSuccessDesc] = useState('Global configurations have been updated.');
  
  const [settings, setSettings] = useState({
    SYSTEM_TIMEZONE: 'Africa/Johannesburg (SAST)',
    GOOGLE_MAPS_KEY: '',
    PAYMENT_GATEWAY_KEY: '',
    SMTP_SERVER: '',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASS: ''
  });

  const [adminUser, setAdminUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSettings();
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setAdminUser({
        first_name: currentUser.first_name || currentUser.firstName || '',
        last_name: currentUser.last_name || currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        avatar: currentUser.avatar || ''
      });
    }
  }, []);

  useEffect(() => {
    if (queryTab) setActiveTab(queryTab);
  }, [queryTab]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingService.getSettings();
      if (res.success && res.data) {
        setSettings(prev => ({
          ...prev,
          ...res.data
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await settingService.updateSettings(settings);
      if (res.success) {
        setSuccessMessage('Settings Saved!');
        setSuccessDesc('Global configurations have been updated.');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await authService.updateProfile({
        first_name: adminUser.first_name,
        last_name: adminUser.last_name,
        phone: adminUser.phone,
        avatar: adminUser.avatar
      });
      if (res.success) {
        setSuccessMessage('Profile Saved!');
        setSuccessDesc('Your admin profile has been updated.');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const res = await uploadService.uploadFile(file);
        if (res.success && res.data.urls.length > 0) {
          const url = 'http://localhost:5000' + res.data.urls[0];
          setAdminUser(prev => ({ ...prev, avatar: url }));
        }
      } catch (err) {
        console.error('Error uploading avatar:', err);
        alert('Failed to upload avatar');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCcw className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Configuration</h1>
          <p className="text-sm text-slate-500 font-medium">Manage platform settings and your profile</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={activeTab === 'platform' ? handleSave : handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-amber-400 transition-colors shadow-sm disabled:opacity-70"
          >
            {saving ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : (activeTab === 'platform' ? 'Save Settings' : 'Save Profile')}
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm border">
        <button 
          onClick={() => { setActiveTab('platform'); navigate('/admin-portal/settings?tab=platform', { replace: true }); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'platform' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <SettingsIcon className="h-4 w-4" />
          Platform Settings
        </button>
        <button 
          onClick={() => { setActiveTab('profile'); navigate('/admin-portal/settings?tab=profile', { replace: true }); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'profile' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <User className="h-4 w-4" />
          My Profile
        </button>
      </div>

      {activeTab === 'platform' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Localization & Region */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Regional Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Operating Country</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 font-medium cursor-not-allowed" disabled>
                  <option>South Africa</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Default Currency</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 font-medium cursor-not-allowed" disabled>
                  <option>ZAR (South African Rand)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">System Timezone</label>
                <select 
                  value={settings.SYSTEM_TIMEZONE}
                  onChange={(e) => handleChange('SYSTEM_TIMEZONE', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Africa/Johannesburg (SAST)">Africa/Johannesburg (SAST)</option>
                  <option value="Africa/Harare (CAT)">Africa/Harare (CAT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* API Keys */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">API Configurations</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Google Maps API Key</label>
                <p className="text-xs text-slate-400 mb-2">Required for route calculation and tracking.</p>
                <input 
                  type="password" 
                  value={settings.GOOGLE_MAPS_KEY}
                  onChange={(e) => handleChange('GOOGLE_MAPS_KEY', e.target.value)}
                  placeholder="AIzaSyA8..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Payment Gateway (PayGate / PayFast)</label>
                <input 
                  type="password" 
                  value={settings.PAYMENT_GATEWAY_KEY}
                  onChange={(e) => handleChange('PAYMENT_GATEWAY_KEY', e.target.value)}
                  placeholder="merchant_key_12345"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">SMTP & Email Configuration</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">SMTP Server</label>
                <input 
                  type="text" 
                  value={settings.SMTP_SERVER}
                  onChange={(e) => handleChange('SMTP_SERVER', e.target.value)}
                  placeholder="smtp.loadafrica.com" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">SMTP Port</label>
                <input 
                  type="number" 
                  value={settings.SMTP_PORT}
                  onChange={(e) => handleChange('SMTP_PORT', e.target.value)}
                  placeholder="587" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">SMTP Username</label>
                <input 
                  type="text" 
                  value={settings.SMTP_USER}
                  onChange={(e) => handleChange('SMTP_USER', e.target.value)}
                  placeholder="noreply@loadafrica.com" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">SMTP Password</label>
                <input 
                  type="password" 
                  value={settings.SMTP_PASS}
                  onChange={(e) => handleChange('SMTP_PASS', e.target.value)}
                  placeholder="password123" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm" 
                />
              </div>
            </div>
          </div>
        </div>

      </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Personal Information</h2>
          <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="h-28 w-28 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden relative">
                  {adminUser.avatar ? (
                    <img src={adminUser.avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-black text-slate-300">
                      {(adminUser.first_name || 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Click to change<br/>Avatar</p>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">First Name</label>
                  <input 
                    type="text"
                    value={adminUser.first_name}
                    onChange={(e) => setAdminUser(prev => ({...prev, first_name: e.target.value}))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Last Name</label>
                  <input 
                    type="text"
                    value={adminUser.last_name}
                    onChange={(e) => setAdminUser(prev => ({...prev, last_name: e.target.value}))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Email Address (Read-only)</label>
                <input 
                  type="email"
                  value={adminUser.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                <input 
                  type="tel"
                  value={adminUser.phone}
                  onChange={(e) => setAdminUser(prev => ({...prev, phone: e.target.value}))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-black text-sm">{successMessage}</p>
              <p className="text-xs font-semibold text-emerald-100">{successDesc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
