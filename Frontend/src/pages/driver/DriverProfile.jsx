import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, Settings, Bell, Lock, Shield, Eye, Save, 
  Trash2, Mail, Phone, FileText, ToggleLeft, ToggleRight, Check, Star
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';

export default function DriverProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryTab = new URLSearchParams(location.search).get('tab');
  
  const [activeTab, setActiveTab] = useState(queryTab || 'profile');
  const [driver, setDriver] = useState({
    name: '',
    email: '',
    phone: '',
    rating: 0,
    trips: 0,
    avatar: ''
  });
  const [notifications, setNotifications] = useState([]);
  const [saved, setSaved] = useState(false);

  // Settings states
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [loadNotifications, setLoadNotifications] = useState(true);
  const [payoutInvoices, setPayoutInvoices] = useState(true);

  useEffect(() => {
    const drivers = getMockData('drivers') || [];
    const activeDriver = drivers[0];
    if (activeDriver) {
      setDriver({
        name: activeDriver.name,
        email: activeDriver.email,
        phone: activeDriver.phone,
        rating: activeDriver.rating,
        trips: activeDriver.trips,
        avatar: activeDriver.avatar
      });
    }

    const notifs = getMockData('notifications') || {};
    if (notifs.driver) {
      setNotifications(notifs.driver);
    }
  }, []);

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaved(true);
    
    // Save to localstorage mock
    const allDrivers = getMockData('drivers') || [];
    if (allDrivers.length > 0) {
      allDrivers[0] = { ...allDrivers[0], ...driver };
      saveMockData('drivers', allDrivers);
    }

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const deleteNotification = (id) => {
    const allNotifs = getMockData('notifications');
    allNotifs.driver = allNotifs.driver.filter(n => n.id !== id);
    saveMockData('notifications', allNotifs);
    setNotifications(allNotifs.driver);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Driver Settings & Alerts</h2>
        <p className="text-xs text-slate-400">Configure your transporter profile, notifications, and telemetry routing alerts.</p>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm border">
        <button 
          onClick={() => { setActiveTab('profile'); navigate('/driver/profile?tab=profile'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'profile' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <User className="h-4 w-4" />
          Transporter Info
        </button>
        <button 
          onClick={() => { setActiveTab('notifications'); navigate('/driver/profile?tab=notifications'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'notifications' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Bell className="h-4 w-4" />
          Alert Logs
        </button>
        <button 
          onClick={() => { setActiveTab('settings'); navigate('/driver/profile?tab=settings'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'settings' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Settings className="h-4 w-4" />
          Preferences
        </button>
      </div>

      {/* Edit Profile Tab content */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100">
            <img 
              src={driver.avatar} 
              alt={driver.name} 
              className="h-20 w-20 rounded-full border border-slate-200 object-cover"
            />
            <div className="text-center sm:text-left space-y-1">
              <h3 className="font-bold text-slate-800 text-lg">{driver.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 justify-center sm:justify-start">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-slate-700">{driver.rating}</span>
                <span className="text-[10px] text-slate-400">({driver.trips} completed trips)</span>
              </div>
              <button type="button" className="text-xs text-emerald-605 text-emerald-600 hover:text-emerald-700 font-bold mt-2 block">Change Profile Photo</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Transporter Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={driver.name}
                  onChange={(e) => setDriver({ ...driver, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Commercial Driver License (CDL)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value="CDL-9028-KM"
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-sm cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="email" 
                  value={driver.email}
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
                  value={driver.phone}
                  onChange={(e) => setDriver({ ...driver, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-light">Status: Verified Carrier</span>
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved Transporter info
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
            <h3 className="text-lg font-bold text-slate-800">Alert Center Logs</h3>
            <span className="text-xs font-semibold text-slate-400">{notifications.length} alerts logged</span>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No alert logs received.</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="py-4.5 flex items-start justify-between gap-4 first:pt-0 hover:bg-slate-50/20 px-2 rounded-xl transition-colors">
                  <div className="space-y-1 text-left">
                    <p className={`text-sm font-semibold text-slate-800 ${!notif.read ? 'text-emerald-650 text-emerald-600 font-bold' : ''}`}>{notif.title}</p>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{notif.time}</span>
                  </div>
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Delete alert"
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
            <h3 className="text-lg font-bold text-slate-800">Operational Preferences</h3>
            <p className="text-xs text-slate-400">Adjust active radar filters for regional loads.</p>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-6 border-b border-slate-100 pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 text-left max-w-md">
                <span className="font-bold text-sm text-slate-800">Broadcast Cargo Alerts</span>
                <p className="text-xs text-slate-400 font-light">Receive push notifications immediately when a new load matches your flatbed truck type.</p>
              </div>
              <button onClick={() => setLoadNotifications(!loadNotifications)} className="text-slate-400 hover:text-emerald-500 transition-colors">
                {loadNotifications ? <ToggleRight className="h-8 w-8 text-emerald-500" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 text-left max-w-md">
                <span className="font-bold text-sm text-slate-800">SMS Checkpoint Verifications</span>
                <p className="text-xs text-slate-400 font-light">Receive automated verification prompts when crossing custom corridor checkpoints.</p>
              </div>
              <button onClick={() => setSmsAlerts(!smsAlerts)} className="text-slate-400 hover:text-emerald-500 transition-colors">
                {smsAlerts ? <ToggleRight className="h-8 w-8 text-emerald-500" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 text-left max-w-md">
                <span className="font-bold text-sm text-slate-800">Email Payout Statements</span>
                <p className="text-xs text-slate-400 font-light">Receive digital copies of invoices and release statements for accounting records.</p>
              </div>
              <button onClick={() => setPayoutInvoices(!payoutInvoices)} className="text-slate-400 hover:text-emerald-500 transition-colors">
                {payoutInvoices ? <ToggleRight className="h-8 w-8 text-emerald-500" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">Security & CDL Node</h3>
            <p className="text-xs text-slate-400">Lock down your wallet details and verification codes.</p>
          </div>

          <div className="space-y-6">
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm">
                Change Login Password
              </button>
              <button className="px-5 py-3 border border-red-205 border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all">
                Deregister Vehicle Specs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
