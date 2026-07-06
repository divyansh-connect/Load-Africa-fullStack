import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Truck, Navigation, FileText, Settings, Bell,
  Menu, X, LogOut, ShieldAlert, CreditCard, HelpCircle
} from 'lucide-react';
import { getMockData, saveMockData } from '../data/mockData';

export default function AdminLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const adminUser = {
    name: 'Super Admin',
    email: 'admin@loadafrica.com',
    role: 'Root Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  };

  useEffect(() => {
    const notifs = getMockData('notifications');
    if (notifs && notifs.admin) {
      setNotifications(notifs.admin);
    }
  }, [location]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const allNotifs = getMockData('notifications');
    allNotifs.admin = allNotifs.admin.map(n => ({ ...n, read: true }));
    saveMockData('notifications', allNotifs);
    setNotifications(allNotifs.admin);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users & Drivers', path: '/admin/users', icon: Users },
    { name: 'Loads & Bookings', path: '/admin/bookings', icon: Navigation },
    { name: 'Payments & Reports', path: '/admin/payments', icon: CreditCard },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-800 flex font-sans">

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <ShieldAlert className="h-8 w-8 text-rose-500 animate-pulse" />
          <span className="font-extrabold text-xl tracking-tight text-white">
            Load<span className="text-rose-500">Africa</span>
          </span>
          <span className="text-[10px] bg-rose-500/20 text-rose-400 font-semibold px-1.5 py-0.5 rounded border border-rose-500/30">ADMIN</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 font-semibold'
                    : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Admin Card bottom */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <img
              src={adminUser.avatar}
              alt={adminUser.name}
              className="h-10 w-10 rounded-full border border-slate-700 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{adminUser.name}</p>
              <p className="text-xs text-rose-400 truncate">{adminUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-slate-400 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
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

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-rose-500" />
            <span className="font-extrabold text-xl text-white">Load<span className="text-rose-500">Africa</span></span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 font-semibold'
                    : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <img src={adminUser.avatar} alt={adminUser.name} className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{adminUser.name}</p>
              <p className="text-xs text-rose-400 truncate">{adminUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium border border-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-slate-400 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="relative h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-50 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-slate-900 font-sans tracking-tight">Admin Control Center</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsUserMenuOpen(false); }}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white scale-95 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-30 transform origin-top-right transition-all">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">System Alerts</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No new alerts</div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              const allNotifs = getMockData('notifications');
                              allNotifs.admin = allNotifs.admin.map(n => n.id === notif.id ? { ...n, read: true } : n);
                              saveMockData('notifications', allNotifs);
                              setNotifications(allNotifs.admin);
                              setIsNotifOpen(false);
                            }}
                            className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer flex gap-3 text-left transition-colors duration-150 ${!notif.read ? 'bg-rose-500/5' : ''
                              }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold text-slate-800 truncate ${!notif.read ? 'font-bold' : ''}`}>{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                            </div>
                            {!notif.read && (
                              <div className="h-2 w-2 bg-rose-500 rounded-full mt-1.5 shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-1.5 border-t border-slate-100 text-center">
                      <Link
                        to="/admin/settings?tab=alerts"
                        onClick={() => setIsNotifOpen(false)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold block w-full"
                      >
                        View all system alerts
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotifOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200"
              >
                <img
                  src={adminUser.avatar}
                  alt={adminUser.name}
                  className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                />
                <span className="hidden md:block text-sm font-semibold text-slate-700">{adminUser.name.split(' ')[0]}</span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-30 transform origin-top-right transition-all">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800">{adminUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{adminUser.email}</p>
                    </div>
                    <Link
                      to="/admin/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-slate-400" />
                      Settings & Rules
                    </Link>
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

        {/* Child Router Views (Content) */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
