import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, History, User, Settings, Bell, 
  Menu, X, LogOut, Navigation, ShieldCheck, HelpCircle, Truck, FileText
} from 'lucide-react';
import { authService } from '../services/authService';

export default function CustomerLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [activeUser, setActiveUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handleUpdate = () => setActiveUser(authService.getCurrentUser());
    window.addEventListener('user-updated', handleUpdate);
    return () => window.removeEventListener('user-updated', handleUpdate);
  }, []);

  const userDisplayName = activeUser?.first_name || activeUser?.firstName
    ? `${activeUser.first_name || activeUser.firstName || ''} ${activeUser.last_name || activeUser.lastName || ''}`.trim()
    : activeUser?.email || 'Customer';

  const userAvatar = activeUser?.avatar || null;

  const unreadCount = 0;

  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Create Booking', path: '/customer/create-booking', icon: PlusCircle },
    { name: 'My Quotations', path: '/customer/my-quotations', icon: FileText },
    { name: 'Active Deliveries', path: '/customer/active-deliveries', icon: Truck },
    { name: 'Live Tracking', path: '/customer/tracking', icon: Navigation },
    { name: 'Booking History', path: '/customer/booking-history', icon: History },
    { name: 'Profile & Settings', path: '/customer/profile', icon: User },
  ];
  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-800 flex font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <Truck className="h-8 w-8 text-amber-500" />
          <span className="font-extrabold text-xl tracking-tight text-white">
            Load<span className="text-amber-500">Africa</span>
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-1.5 py-0.5 rounded border border-amber-500/30">CLIENT</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-semibold' 
                    : 'hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card on Sidebar bottom */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-800/40 border border-slate-800">
            {userAvatar ? (
              <img src={userAvatar} alt="Profile" className="h-10 w-10 rounded-full border border-slate-700 object-cover shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm border border-amber-400 shrink-0">
                {userDisplayName[0]?.toUpperCase() || 'C'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{userDisplayName}</p>
              <p className="text-xs text-slate-400 truncate">{activeUser?.email || ''}</p>
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
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="h-7 w-7 text-amber-500" />
            <span className="font-extrabold text-xl text-white">Load<span className="text-amber-500">Africa</span></span>
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
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-semibold' 
                    : 'hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm border border-amber-400 shrink-0">
              {userDisplayName[0]?.toUpperCase() || 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{userDisplayName}</p>
              <p className="text-xs text-slate-400 truncate">{activeUser?.email || ''}</p>
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
              <h1 className="text-lg font-black text-slate-900 font-sans tracking-tight">Customer Portal</h1>
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
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white scale-95 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-30 transform origin-top-right transition-all">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                              setIsNotifOpen(false);
                            }}
                            className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer flex gap-3 text-left transition-colors duration-150 ${
                              !notif.read ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold text-slate-800 truncate ${!notif.read ? 'font-bold' : ''}`}>{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                            </div>
                            {!notif.read && (
                              <div className="h-2 w-2 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-1.5 border-t border-slate-100 text-center">
                      <Link 
                        to="/customer/profile?tab=notifications" 
                        onClick={() => setIsNotifOpen(false)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-semibold block w-full"
                      >
                        View all notifications
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
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="h-8 w-8 rounded-full border border-slate-200 object-cover shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm border border-amber-300 shrink-0">
                    {userDisplayName?.[0]?.toUpperCase() || 'C'}
                  </div>
                )}
                <span className="hidden md:block text-sm font-semibold text-slate-700">{userDisplayName?.split(' ')[0] || 'Customer'}</span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-30 transform origin-top-right transition-all">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800">{userDisplayName}</p>
                      <p className="text-xs text-slate-500 truncate">{activeUser?.email || ''}</p>
                    </div>
                    <Link 
                      to="/customer/profile" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3 text-slate-400" />
                      My Profile
                    </Link>
                    <Link 
                      to="/customer/profile?tab=settings" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-slate-400" />
                      Settings
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
