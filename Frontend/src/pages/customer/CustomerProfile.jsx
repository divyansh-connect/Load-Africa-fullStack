import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, Settings, Bell, Lock, Shield, Eye, Save, 
  Trash2, Mail, Phone, Building, ToggleLeft, ToggleRight, Check
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';

export default function CustomerProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'profile');
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    avatar: ''
  });
  const [notifications, setNotifications] = useState([]);
  const [saved, setSaved] = useState(false);

  // Settings states
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    const activeUser = getMockData('users')[0];
    if (activeUser) {
      setUser({
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone,
        company: activeUser.company,
        avatar: activeUser.avatar
      });
    }

    const notifs = getMockData('notifications') || {};
    if (notifs.customer) {
      setNotifications(notifs.customer);
    }
  }, []);

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const { authService } = await import('../../services/authService');
      const parts = user.name.split(' ');
      const payload = {
        first_name: parts[0],
        last_name: parts.slice(1).join(' '),
        phone: user.phone,
        avatar: user.avatar
      };
      const res = await authService.updateProfile(payload);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      alert('Failed to save profile');
    }
  };

  const deleteNotification = (id) => {
    const allNotifs = getMockData('notifications');
    allNotifs.customer = allNotifs.customer.filter(n => n.id !== id);
    saveMockData('notifications', allNotifs);
    setNotifications(allNotifs.customer);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account & Security</h2>
        <p className="text-xs text-slate-400">Manage your shipper profile settings, notifications preferences, and security.</p>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm border">
        <button 
          onClick={() => { setActiveTab('profile'); navigate('/customer/profile?tab=profile', { replace: true }); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'profile' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <User className="h-4 w-4" />
          Edit Profile
        </button>
        <button 
          onClick={() => { setActiveTab('notifications'); navigate('/customer/profile?tab=notifications', { replace: true }); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'notifications' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </button>
        <button 
          onClick={() => { setActiveTab('settings'); navigate('/customer/profile?tab=settings', { replace: true }); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'settings' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Edit Profile Tab content */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100">
            <img 
              src={user.avatar || null} 
              alt={user.name} 
              className="h-20 w-20 rounded-full border border-slate-200 object-cover"
            />
            <div className="text-center sm:text-left space-y-1">
              <h3 className="font-bold text-slate-800 text-lg">{user.name}</h3>
              <p className="text-xs text-slate-400">Customer account joined Jan 2025</p>
              <label className="cursor-pointer text-xs text-amber-600 hover:text-amber-700 font-bold inline-block">
                Change Profile Photo
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
                          setUser(prev => ({ ...prev, avatar: url }));
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={user.company}
                  onChange={(e) => setUser({ ...user, company: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="email" 
                  value={user.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Last updated: Just now</span>
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved Profile info
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Notifications Tab content */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Notifications Log</h3>
            <span className="text-xs font-semibold text-slate-400">{notifications.length} alerts logged</span>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No logs of notifications yet.</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="py-4.5 flex items-start justify-between gap-4 first:pt-0 hover:bg-slate-50/20 px-2 rounded-xl transition-colors">
                  <div className="space-y-1 text-left">
                    <p className={`text-sm font-semibold text-slate-800 ${!notif.read ? 'text-amber-600 font-bold' : ''}`}>{notif.title}</p>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{notif.time}</span>
                  </div>
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings Tab content */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">System Preferences</h3>
            <p className="text-xs text-slate-400">Adjust how Load Africa communicates platform updates and billing.</p>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-6 border-b border-slate-100 pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 text-left max-w-md">
                <span className="font-bold text-sm text-slate-800">SMS Driver Assignments</span>
                <p className="text-xs text-slate-400 font-light">Receive SMS alerts to your phone as soon as a driver is assigned or checkpoints are crossed.</p>
              </div>
              <button onClick={() => setSmsAlerts(!smsAlerts)} className="text-slate-400 hover:text-amber-500 transition-colors">
                {smsAlerts ? <ToggleRight className="h-8 w-8 text-amber-500" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 text-left max-w-md">
                <span className="font-bold text-sm text-slate-800">Email Invoices & Manifests</span>
                <p className="text-xs text-slate-400 font-light">Automatically dispatch billing details and transport slips directly to accounting email.</p>
              </div>
              <button onClick={() => setEmailInvoices(!emailInvoices)} className="text-slate-400 hover:text-amber-500 transition-colors">
                {emailInvoices ? <ToggleRight className="h-8 w-8 text-amber-500" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">Account Security</h3>
            <p className="text-xs text-slate-400">Configure safety mechanisms to protect your account.</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 text-left max-w-md">
                <span className="font-bold text-sm text-slate-800">Two-Factor Authentication</span>
                <p className="text-xs text-slate-400 font-light">Prompt for a 6-digit verification code when withdrawing or dispatching high-value loads.</p>
              </div>
              <button onClick={() => setTwoFactor(!twoFactor)} className="text-slate-400 hover:text-amber-500 transition-colors">
                {twoFactor ? <ToggleRight className="h-8 w-8 text-amber-500" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>
            
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm">
                Change Password
              </button>
              <button className="px-5 py-3 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
