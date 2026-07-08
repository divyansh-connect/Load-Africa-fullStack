import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck } from 'lucide-react';

export default function AdminAuth() {
  const [email, setEmail] = useState('admin@loadafrica.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.password) {
      setPassword(location.state.password);
    }
  }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate API loading
    setTimeout(() => {
      setLoading(false);
      navigate('/admin-portal/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center font-sans p-6 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Back to Home Link */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Back to Home
      </button>

      {/* Center Sign In Card Container */}
      <div className="bg-white border border-slate-200/80 shadow-md p-10 rounded-2xl w-full max-w-md space-y-6 text-center relative overflow-hidden">
        
        {/* Admin Header Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>

        {/* Logo and Brand header */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-[#f99c00] text-slate-950 p-1.5 rounded">
              <ShieldCheck className="h-5 w-5 fill-current" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-955 uppercase">
              ADMIN PORTAL
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">
              Platform Administration
            </h2>
            <p className="text-xs text-slate-400 font-bold">
              Sign in with your administrator credentials
            </p>
          </div>
        </div>

        {/* Login form block */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Email input field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Admin Email</label>
            <input 
              type="email" 
              placeholder="admin@loadafrica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
            />
          </div>

          {/* Password input field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-lg text-xs uppercase tracking-wider transition-colors mt-2 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'SECURE LOGIN'}
            {!loading && <ShieldCheck className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-[10px] text-slate-400 font-medium pt-2 mt-4 border-t border-slate-100">
          This is a restricted area. Unauthorized access is prohibited.
        </div>
      </div>
    </div>
  );
}
