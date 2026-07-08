import React, { useState, useEffect } from 'react';
import { Save, Globe, Mail, ShieldCheck, MapPin, Settings as SettingsIcon, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { settingService } from '../../services/settingService';

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [settings, setSettings] = useState({
    SYSTEM_TIMEZONE: 'Africa/Johannesburg (SAST)',
    GOOGLE_MAPS_KEY: '',
    PAYMENT_GATEWAY_KEY: '',
    SMTP_SERVER: '',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASS: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
          <p className="text-sm text-slate-500 font-medium">Configure global LoadAfrica application settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-amber-400 transition-colors shadow-sm disabled:opacity-70"
          >
            {saving ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>

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

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-black text-sm">Settings Saved!</p>
              <p className="text-xs font-semibold text-emerald-100">Global configurations have been updated.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
