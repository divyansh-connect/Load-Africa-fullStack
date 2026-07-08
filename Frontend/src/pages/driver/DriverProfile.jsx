import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Shield, Bell, CreditCard, Star, Lock
} from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { driverService } from '../../services/driverService';

export default function DriverProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'profile');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // States for forms
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  
  const [bankData, setBankData] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    branchCode: ''
  });

  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    push: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await driverService.getProfile();
      if (res.success && res.data) {
        const p = res.data;
        setProfileData({
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          email: p.email || '',
          phone: p.phone || '',
          avatar: p.avatar || ''
        });
        if (p.bank_details) {
          setBankData({
            bankName: p.bank_details.bankName || '',
            accountHolder: p.bank_details.accountHolder || '',
            accountNumber: p.bank_details.accountNumber || '',
            branchCode: p.bank_details.branchCode || ''
          });
        }
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        // Optional: email updates typically require a separate verification flow, not doing here
      };
      const res = await driverService.updateProfile(payload);
      if (res.success) {
        alert('Profile updated successfully!');
      }
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        bank_details: bankData
      };
      const res = await driverService.updateProfile(payload);
      if (res.success) {
        alert('Bank details updated successfully!');
      }
    } catch (err) {
      alert('Failed to update bank details');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (loading) return <div className="p-10 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Driver Profile</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage your personal information, bank payouts, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <img 
                    src={profileData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80'} 
                    alt="Driver" 
                    className="h-20 w-20 rounded-full object-cover border-4 border-slate-50"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Profile Photo</h3>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" className="text-[10px] py-1.5 px-3" type="button">Change Photo</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label="First Name" 
                    value={profileData.first_name} 
                    onChange={e => setProfileData({...profileData, first_name: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="Last Name" 
                    value={profileData.last_name} 
                    onChange={e => setProfileData({...profileData, last_name: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="Email Address" 
                    type="email"
                    value={profileData.email} 
                    onChange={e => setProfileData({...profileData, email: e.target.value})} 
                    disabled // usually disabled since it's the login identifier
                  />
                  <Input 
                    label="Mobile Number" 
                    value={profileData.phone} 
                    onChange={e => setProfileData({...profileData, phone: e.target.value})} 
                  />
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driver Rating</label>
                    <div className="flex items-center gap-2 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-sm">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      New Driver
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    {saving ? 'Saving...' : 'Save Profile Details'}
                  </Button>
                </div>
              </form>
            )}

            {/* Bank Details Tab */}
            {activeTab === 'bank' && (
              <form onSubmit={handleSaveBank} className="space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">Payout Bank Details</h3>
                  <p className="text-[10px] text-slate-500">Ensure these details exactly match your registered ID to prevent payout delays.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label="Bank Name" 
                    value={bankData.bankName} 
                    onChange={e => setBankData({...bankData, bankName: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="Account Holder Name" 
                    value={bankData.accountHolder} 
                    onChange={e => setBankData({...bankData, accountHolder: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="Account Number" 
                    value={bankData.accountNumber} 
                    onChange={e => setBankData({...bankData, accountNumber: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="Branch Code" 
                    value={bankData.branchCode} 
                    onChange={e => setBankData({...bankData, branchCode: e.target.value})} 
                    required 
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white">
                    {saving ? 'Saving...' : 'Update Bank Details'}
                  </Button>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">Notification Preferences</h3>
                  <p className="text-[10px] text-slate-500">Choose how you want to be notified about load assignments and payouts.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'sms', label: 'SMS Notifications', desc: 'Get critical alerts (OTP, Payouts) via text.' },
                    { id: 'email', label: 'Email Notifications', desc: 'Receive statements and trip summaries via email.' },
                    { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts while the app is active.' }
                  ].map(pref => (
                    <div key={pref.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{pref.label}</h4>
                        <p className="text-[10px] text-slate-500">{pref.desc}</p>
                      </div>
                      <button 
                        onClick={() => toggleNotification(pref.id)}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notifications[pref.id] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`h-4 w-4 bg-white rounded-full shadow-sm transition-all absolute ${notifications[pref.id] ? 'left-[26px]' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Change Password</h3>
                    <p className="text-[10px] text-slate-500">Update your account password regularly to stay secure.</p>
                  </div>
                  
                  <div className="space-y-4 max-w-sm">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white mt-2">Update Password</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Device Security</h3>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-red-500" />
                      <div>
                        <h4 className="text-xs font-bold text-red-800">Logout Everywhere</h4>
                        <p className="text-[10px] text-red-600">Sign out of all active sessions across devices.</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100 text-xs px-4" onClick={() => navigate('/login')}>
                      Log Out All
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
