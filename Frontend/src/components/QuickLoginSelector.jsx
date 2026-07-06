import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function QuickLoginSelector({ setEmail, setPassword, setSecretKey, stayOnPage = false, setDashboard }) {
  const navigate = useNavigate();
  const location = useLocation();

  const panels = [
    {
      role: 'Customer',
      path: '/customer/login',
      dashboard: '/customer/dashboard',
      email: 'patrice@arm.co.za',
      password: 'password123',
      activeClass: 'bg-slate-900 border-2 border-amber-500 shadow-lg shadow-amber-500/5 text-amber-400',
      hoverBg: 'hover:bg-amber-500/10',
      hoverBorder: 'hover:border-amber-500/30',
      hoverText: 'group-hover:text-amber-400',
      normalText: 'text-slate-300',
      subtitle: 'Shipper'
    },
    {
      role: 'Driver',
      path: '/driver/login',
      dashboard: '/driver/dashboard',
      email: 'sipho.zuma@load-driver.co.za',
      password: 'password123',
      activeClass: 'bg-slate-900 border-2 border-emerald-500 shadow-lg shadow-emerald-500/5 text-emerald-400',
      hoverBg: 'hover:bg-emerald-500/10',
      hoverBorder: 'hover:border-emerald-500/30',
      hoverText: 'group-hover:text-emerald-400',
      normalText: 'text-slate-300',
      subtitle: 'Transporter'
    },
    {
      role: 'Broker',
      path: '/broker/login',
      dashboard: '/broker/dashboard',
      email: 'lwazi.dlamini@loadafrica-broker.co.za',
      password: 'password123',
      activeClass: 'bg-slate-900 border-2 border-indigo-500 shadow-lg shadow-indigo-500/5 text-indigo-400',
      hoverBg: 'hover:bg-indigo-500/10',
      hoverBorder: 'hover:border-indigo-500/30',
      hoverText: 'group-hover:text-indigo-400',
      normalText: 'text-slate-300',
      subtitle: 'Associate'
    },
    {
      role: 'Admin',
      path: '/admin/login',
      dashboard: '/admin/dashboard',
      email: 'admin@loadafrica.com',
      password: 'password123',
      activeClass: 'bg-slate-900 border-2 border-rose-500 shadow-lg shadow-rose-500/5 text-rose-400',
      hoverBg: 'hover:bg-rose-500/10',
      hoverBorder: 'hover:border-rose-500/30',
      hoverText: 'group-hover:text-rose-400',
      normalText: 'text-slate-300',
      subtitle: 'Control'
    }
  ];

  const handleClick = (panel) => {
    // If stayOnPage mode (e.g. /login page) — just fill credentials, don't navigate
    if (stayOnPage || location.pathname === panel.path) {
      setEmail(panel.email);
      setPassword(panel.password);
      if (panel.role === 'Admin' && setSecretKey) {
        setSecretKey('AFRICA_ADMIN_2026');
      }
      // Tell parent which dashboard to go to after sign in
      if (setDashboard) setDashboard(panel.dashboard);
    } else {
      navigate(panel.path, { 
        state: { 
          email: panel.email, 
          password: panel.password,
          secretKey: panel.role === 'Admin' ? 'AFRICA_ADMIN_2026' : undefined
        } 
      });
    }
  };

  return (
    <div className="mt-6 border-t border-slate-800/80 pt-6">
      <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Quick Demo Login
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {panels.map((panel) => {
          const isActive = location.pathname === panel.path;
          return (
            <button
              key={panel.role}
              type="button"
              onClick={() => handleClick(panel)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 group border text-center ${
                isActive 
                  ? panel.activeClass 
                  : 'bg-slate-900/40 border-slate-800/80'
              } ${panel.hoverBg} ${panel.hoverBorder}`}
            >
              <span className={`text-xs font-bold transition-colors ${
                isActive 
                  ? '' 
                  : panel.normalText
              } ${panel.hoverText}`}>
                {panel.role} Panel
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider font-medium">
                {panel.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
