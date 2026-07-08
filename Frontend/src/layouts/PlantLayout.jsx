import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, HardHat, DollarSign, PlusCircle, Bell,
  Menu, X, LogOut, User, FileText, Settings, Wrench, ShieldAlert
} from 'lucide-react';
import { plantService } from '../services/plantService';

const plantOwner = {
  name: 'Plant Owner',
  sub: '6 Heavy Machines Listed',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
};

export default function PlantLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [plantStatus, setPlantStatus] = useState('REGISTERED');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await plantService.getDashboard();
        if (res.success && res.data) {
          setPlantStatus(res.data.status);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/plant-portal/dashboard', icon: LayoutDashboard },
    ...(plantStatus === 'ACTIVE' ? [
      { name: 'My Equipment', path: '/plant-portal/equipment', icon: HardHat },
      { name: 'Hire Requests', path: '/plant-portal/requests', icon: FileText },
      { name: 'Revenue', path: '/plant-portal/revenue', icon: DollarSign },
      { name: 'List New Machine', path: '/plant-portal/add-machine', icon: PlusCircle },
      { name: 'Maintenance', path: '/plant-portal/maintenance', icon: Wrench },
    ] : [
      { name: 'Compliance', path: '/plant-portal/compliance', icon: ShieldAlert },
    ]),
    { name: 'Profile & Settings', path: '/plant-portal/profile', icon: User },
  ];

  const handleLogout = () => navigate('/login');
  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
        <HardHat className="h-8 w-8 text-amber-500" />
        <span className="font-extrabold text-xl tracking-tight text-white">
          Load<span className="text-amber-500">Africa</span>
        </span>
        <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-1.5 py-0.5 rounded border border-amber-500/30">PLANT</span>
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
          <img src={plantOwner.avatar} alt={plantOwner.name} className="h-10 w-10 rounded-full border border-slate-700 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{plantOwner.name}</p>
            <p className="text-xs text-slate-400 truncate">{plantOwner.sub}</p>
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

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileOpen(false)} />
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
        <header className="relative h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-50 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Yellow Plant Portal</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-amber-500 rounded-full" />
            </button>
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100">
                <img src={plantOwner.avatar} alt={plantOwner.name} className="h-8 w-8 rounded-full border border-slate-200 object-cover" />
                <span className="hidden md:block text-sm font-semibold text-slate-700">Plant</span>
              </button>
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-30">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800">{plantOwner.name}</p>
                      <p className="text-xs text-slate-500">plant@loadafrica.co.za</p>
                    </div>
                    <Link to="/plant-portal/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="h-4 w-4 mr-3 text-slate-400" /> My Profile
                    </Link>
                    <Link to="/plant-portal/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <Settings className="h-4 w-4 mr-3 text-slate-400" /> Settings
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-3 text-red-500" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
