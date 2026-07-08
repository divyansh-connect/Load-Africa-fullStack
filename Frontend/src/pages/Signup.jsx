import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { authService } from '../services/authService';

export default function Signup() {
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Driver');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    
    // Map role format to match backend enum
    const roleMapping = {
      'Customer': 'CUSTOMER',
      'Driver': 'DRIVER',
      'Fleet Owner': 'FLEET_OWNER',
      'Plant Owner': 'PLANT_OWNER'
    };

    const backendRole = roleMapping[role] || 'CUSTOMER';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    try {
      await authService.register({
        email,
        password,
        role: backendRole,
        firstName,
        lastName
      });
      setLoading(false);
      navigate('/login');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center font-sans p-6 selection:bg-amber-500 selection:text-slate-955">
      
      {/* Back to Home Link */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Back to Home
      </button>

      {/* Center Sign Up Card Container */}
      <div className="bg-white border border-slate-200/80 shadow-md p-6 rounded-2xl w-full max-w-md space-y-4 text-center">
        
        {/* Logo and Brand header */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-[#f99c00] text-slate-955 p-1.5 rounded">
              <Truck className="h-5 w-5 fill-current" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-955 uppercase">
              LOADAFRICA
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <h2 className="text-2xl font-black text-slate-955 tracking-tight">
              Create an account
            </h2>
            <p className="text-xs text-slate-450 font-bold">
              Join LoadAfrica today
            </p>
          </div>
        </div>

        {/* Signup form block */}
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Full Name input field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
            />
          </div>

          {/* Email input field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Email</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
            />
          </div>

          {/* Password input field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <input 
              type="password" 
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
            />
          </div>

          {/* User Type select drop down */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">I am registering as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
            >
              <option value="Driver">Driver</option>
              <option value="Customer">Customer</option>
              <option value="Fleet Owner">Fleet Owner</option>
              <option value="Plant Owner">Plant Owner</option>
            </select>
            <p className="text-[10px] text-slate-400 font-bold leading-normal mt-1">
              Administrator access is granted by a master admin only.
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded-lg text-xs uppercase tracking-wider transition-colors mt-2"
          >
            {loading ? 'Registering...' : 'SIGN UP'}
          </button>
        </form>

        {/* Footer sign in direction */}
        <div className="text-xs text-slate-500 font-bold pt-2">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#f99c00] hover:text-[#e08b00] underline font-black transition-colors"
          >
            Sign in
          </button>
        </div>

      </div>

    </div>
  );
}
