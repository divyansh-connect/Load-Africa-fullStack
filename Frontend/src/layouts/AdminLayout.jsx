import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  Truck, LogOut, LayoutDashboard, Users, FileText, Shield, 
  Settings, Briefcase, BookOpen, Target, Menu, X, User, Bell
} from 'lucide-react';
import { authService } from '../services/authService';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [adminUser, setAdminUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handleUpdate = () => setAdminUser(authService.getCurrentUser());
    window.addEventListener('user-updated', handleUpdate);
    return () => window.removeEventListener('user-updated', handleUpdate);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin-portal/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin-portal/bookings', icon: BookOpen },
    { name: 'Finance Center', path: '/admin-portal/payments', icon: FileText },
    { name: 'Customers', path: '/admin-portal/customers', icon: Users },
    { name: 'Drivers', path: '/admin-portal/drivers', icon: Truck },
    { name: 'Broker Accounts', path: '/admin-portal/brokers', icon: Briefcase },
    { name: 'Fleet Accounts', path: '/admin-portal/fleet', icon: Truck },
    { name: 'Plant Owners', path: '/admin-portal/plant-owners', icon: Target },
    { name: 'Admins', path: '/admin-portal/admins', icon: Shield },
    { name: 'Audit Logs', path: '/admin-portal/audit-logs', icon: FileText },
    { name: 'Settings', path: '/admin-portal/settings', icon: Settings },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 font-sans flex selection:bg-amber-500 selection:text-slate-950">
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden lg:flex shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <Truck className="h-6 w-6 text-amber-500 mr-2" />
          <span className="font-black text-lg text-white tracking-tight uppercase">Load<span className="text-amber-500">Africa</span></span>
          <span className="ml-2 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/20">Admin</span>
        </div>
        
        <nav className="flex-1 py-6 space-y-1.5 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <LogOut className="h-5 w-5 text-slate-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-amber-500" />
            <span className="font-extrabold text-lg text-white uppercase tracking-tight">Load<span className="text-amber-500">Africa</span></span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <LogOut className="h-5 w-5 text-slate-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)} 
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-slate-900 font-sans tracking-tight">Admin Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                }}
                className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {/* Red dot badge for unread notifications */}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-30 transform origin-top-right transition-all">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                      <p className="text-sm font-bold text-slate-800">Notifications</p>
                      <button className="text-[11px] text-[#f99c00] hover:underline font-semibold">Mark all read</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {/* Placeholder Notification Items */}
                      <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                        <p className="text-xs font-semibold text-slate-800">New Fleet Registration</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">A new fleet owner has uploaded their documents for approval.</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">5 minutes ago</span>
                      </div>
                      <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                        <p className="text-xs font-semibold text-slate-800">System Alert</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Your admin session will expire in 1 hour.</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                      </div>
                    </div>
                    <div className="px-4 py-2 text-center border-t border-slate-100">
                      <button className="text-xs font-bold text-slate-600 hover:text-slate-900">View all notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200"
              >
                <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-amber-500 font-black border border-slate-200 overflow-hidden shrink-0">
                  {adminUser?.avatar ? (
                    <img src={adminUser.avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    (adminUser?.first_name?.[0] || adminUser?.email?.[0] || 'A').toUpperCase()
                  )}
                </div>
                <span className="hidden md:block text-sm font-bold text-slate-700">{adminUser?.first_name || 'Admin'}</span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-30 transform origin-top-right transition-all">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800">{adminUser ? `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim() || 'Admin User' : 'Admin User'}</p>
                      <p className="text-xs text-slate-500 truncate">{adminUser?.email || 'admin@loadafrica.com'}</p>
                    </div>
                    <button 
                      onClick={() => { setIsUserMenuOpen(false); navigate('/admin-portal/settings?tab=profile'); }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3 text-slate-400" />
                      My Profile
                    </button>
                    <button 
                      onClick={() => { setIsUserMenuOpen(false); navigate('/admin-portal/settings?tab=platform'); }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-slate-400" />
                      Platform Settings
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-red-500" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
