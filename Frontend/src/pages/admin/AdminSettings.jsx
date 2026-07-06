import React, { useState, useEffect } from 'react';
import { 
  Settings, Bell, Shield, Save, Check, ToggleLeft, ToggleRight, 
  Trash2, FileText, Info, HelpCircle, Server
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('settings');
  const [notifications, setNotifications] = useState([]);
  const [saved, setSaved] = useState(false);

  // Settings configs
  const [commissionRate, setCommissionRate] = useState(5);
  const [autoAllocation, setAutoAllocation] = useState(false);
  const [requireCDL, setRequireCDL] = useState(true);

  useEffect(() => {
    const notifs = getMockData('notifications') || {};
    if (notifs.admin) {
      setNotifications(notifs.admin);
    }
  }, []);

  const handleSaveConfigs = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const deleteNotification = (id) => {
    const allNotifs = getMockData('notifications');
    allNotifs.admin = allNotifs.admin.filter(n => n.id !== id);
    saveMockData('notifications', allNotifs);
    setNotifications(allNotifs.admin);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn text-left">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings & Vetting Rules</h2>
        <p className="text-xs text-slate-400">Configure logistics platform variables, broker fees, and audit compliance guidelines.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm border">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'settings' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-55'
          }`}
        >
          <Settings className="h-4 w-4" />
          Global Configs
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'alerts' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-55'
          }`}
        >
          <Bell className="h-4 w-4" />
          Admin Alert Logs
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'rules' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-55'
          }`}
        >
          <Shield className="h-4 w-4" />
          Platform Policies
        </button>
      </div>

      {/* Settings Form */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveConfigs} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Operational Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform Escrow Fee Commission (%)</label>
              <input 
                type="number" 
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-rose-500 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Server Node Status</label>
              <div className="flex items-center gap-2.5 px-4 py-3.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-bold font-mono">
                <Server className="h-4 w-4 text-emerald-600 animate-pulse" />
                loadafrica-prod-core-01.local (ONLINE)
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 max-w-md">
                <span className="font-bold text-sm text-slate-800">Automated Driver Match Dispatch</span>
                <p className="text-xs text-slate-400 font-light">Let the system match unassigned cargo directly to the highest rated nearby flatbed transporters.</p>
              </div>
              <button type="button" onClick={() => setAutoAllocation(!autoAllocation)} className="text-slate-400 hover:text-rose-550 transition-colors">
                {autoAllocation ? <ToggleRight className="h-8 w-8 text-rose-600" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 max-w-md">
                <span className="font-bold text-sm text-slate-800">Enforce Commercial Vetting (CDL)</span>
                <p className="text-xs text-slate-400 font-light">Block drivers from accepting bulk cement orders &gt; 20 Tons if CDL documentation isn't active.</p>
              </div>
              <button type="button" onClick={() => setRequireCDL(!requireCDL)} className="text-slate-400 hover:text-rose-550 transition-colors">
                {requireCDL ? <ToggleRight className="h-8 w-8 text-rose-600" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-light">System Config: Active</span>
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Configurations Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Global Variables
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Alert Logs */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Admin Operational Logs</h3>
            <span className="text-xs font-semibold text-slate-400">{notifications.length} incidents logged</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No alert logs received.</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="py-4 flex items-start justify-between gap-4 first:pt-0 hover:bg-slate-50/20 px-2 rounded-xl transition-colors">
                  <div className="space-y-1 text-left">
                    <p className={`text-sm font-semibold text-slate-800 ${!notif.read ? 'text-rose-600 font-bold' : ''}`}>{notif.title}</p>
                    <p className="text-slate-500 font-light leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{notif.time}</span>
                  </div>
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1.5 text-slate-350 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Delete log entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Platform policies */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">System Compliance Rules</h3>
            <p className="text-xs text-slate-400">Core operational regulations extracted from system development rules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="font-bold text-slate-800 text-sm">Transporter Safety Rules</span>
              <ul className="space-y-2 text-slate-500 leading-relaxed font-light list-disc pl-4">
                <li>Double driver logs required on night transits.</li>
                <li>Escrow requires immediate digital confirmation coordinates of checkpoints.</li>
                <li>Soft deletes applied on driver profiles upon system decommissioning.</li>
              </ul>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="font-bold text-slate-800 text-sm">Security Protocols</span>
              <ul className="space-y-2 text-slate-500 leading-relaxed font-light list-disc pl-4">
                <li>Automatic rate-limiting active on cargo posts.</li>
                <li>Escrow wallets require two-factor validations for disbursements.</li>
                <li>GDPR compliance checks enforced on license records.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
