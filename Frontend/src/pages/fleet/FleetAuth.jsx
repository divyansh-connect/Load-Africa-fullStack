import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Truck } from 'lucide-react';
import QuickLoginSelector from '../../components/QuickLoginSelector';

export default function FleetAuth() {
  const [email, setEmail] = useState('fleet@loadafrica.co.za');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
    if (location.state?.password) setPassword(location.state.password);
  }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/fleet-portal/dashboard'); }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center font-sans p-6">
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
        ← Back to Home
      </button>

      <div className="bg-white border border-slate-200/80 shadow-md p-10 rounded-2xl w-full max-w-md space-y-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-[#f99c00] text-slate-950 p-1.5 rounded">
              <Truck className="h-5 w-5 fill-current" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-950 uppercase">LOADAFRICA</span>
          </div>
          <div className="mt-3 space-y-1">
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-400 font-bold">Sign in to your fleet owner account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl font-bold">{error}</div>}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Email</label>
            <input type="email" placeholder="fleet@example.com" value={email} onChange={e => setEmail(e.target.value)} required
              className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
              className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition-colors mt-2">
            {loading ? 'Signing In...' : 'SIGN IN'}
          </button>
        </form>

        <div className="text-xs text-slate-500 font-bold pt-2">
          Don't have an account?{' '}
          <button onClick={() => navigate('/fleet/register')} className="text-[#f99c00] hover:text-[#e08b00] underline font-black transition-colors">List Your Fleet</button>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <QuickLoginSelector setEmail={setEmail} setPassword={setPassword} />
        </div>
      </div>
    </div>
  );
}
