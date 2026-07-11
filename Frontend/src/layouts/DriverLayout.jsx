import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Wallet, ShieldCheck, Bell,
  Menu, X, LogOut, Navigation, User, Settings
} from 'lucide-react';
import { authService } from '../services/authService';

export default function DriverLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [driver, setDriver] = useState({
    name: 'Driver',
    vehicle: 'Loading...',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
  });
  
  React.useEffect(() => {
    import('../services/authService').then(({ authService }) => {
      const fetchUser = () => {
        const u = authService.getCurrentUser();
        if (u) {
          const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
          const rawAvatar = u.avatar || u.profile_photo;
          const formattedAvatar = rawAvatar ? (rawAvatar.startsWith('http') ? rawAvatar : `${base}${rawAvatar.startsWith('/') ? '' : '/'}${rawAvatar}`) : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80';
          setDriver({
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Driver',
            vehicle: u.email || 'Driver Account',
            avatar: formattedAvatar
          });
        }
      };
      fetchUser();
      window.addEventListener('user-updated', fetchUser);
      return () => window.removeEventListener('user-updated', fetchUser);
    });
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: LayoutDashboard },
    { name: 'Available Loads', path: '/driver/available-loads', icon: Truck },
    { name: 'Active Trip', path: '/driver/active-trip', icon: Navigation },
    { name: 'Earnings & Wallet', path: '/driver/earnings', icon: Wallet },
    { name: 'KYC & Documents', path: '/driver/kyc', icon: ShieldCheck },
    { name: 'Profile & Settings', path: '/driver/profile', icon: User },
  ];

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };
  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
        <Truck className="h-8 w-8 text-amber-500" />
        <span className="font-extrabold text-xl tracking-tight text-white">
          Load<span className="text-amber-500">Africa</span>
        </span>
        <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-1.5 py-0.5 rounded border border-amber-500/30">DRIVER</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-semibold'
                  : 'hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <img src={driver.avatar} alt={driver.name} className="h-10 w-10 rounded-full border border-slate-700 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{driver.name}</p>
            <p className="text-xs text-slate-400 truncate">{driver.vehicle}</p>
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
    </>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-800 flex font-sans">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-3 right-3">
          <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="relative h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-50 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-slate-900 font-sans tracking-tight">Driver Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-amber-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all"
              >
                <img src={driver.avatar} alt={driver.name} className="h-8 w-8 rounded-full border border-slate-200 object-cover" />
                <span className="hidden md:block text-sm font-semibold text-slate-700">{driver.name.split(' ')[0]}</span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-30">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800">{driver.name}</p>
                      <p className="text-xs text-slate-500">sipho.zuma@load-driver.co.za</p>
                    </div>
                    <Link to="/driver/profile" onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="h-4 w-4 mr-3 text-slate-400" /> My Profile
                    </Link>
                    <Link to="/driver/profile" onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <Settings className="h-4 w-4 mr-3 text-slate-400" /> Settings
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-3 text-red-500" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scaleIn text-left">
            <div>
              <h4 className="text-base font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                <LogOut className="h-5 w-5 text-amber-500" /> Confirm Logout
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                Are you sure you want to log out of your session? You will need to enter your credentials again to sign in.
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-55 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => authService.logout()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
