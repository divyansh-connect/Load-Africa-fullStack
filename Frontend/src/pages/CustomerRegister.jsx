import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, Input } from '../components/ui';
import { User, MapPin } from 'lucide-react';

export default function CustomerRegister() {
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would submit the registration/login data
    console.log('Form submitted:', { fullName, phone, email, password, address });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 pt-24 pb-20">
        <div className="w-full max-w-[622px] mx-auto animate-fadeIn">
          
          {/* Header Section */}
          <div className="text-center space-y-3 mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Create a customer account
            </h1>
            <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto">
              Fast sign-up. Add ID or proof of address now or later — it's optional.
            </p>
          </div>

          {/* Form Card */}
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 sm:p-8 text-left transition-all duration-300">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Card Header */}
              <div className="space-y-1.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <User className="h-5 w-5 text-[#f99c00]" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Create your customer account
                  </h3>
                </div>
                <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                  Book bakkies, trucks and deliveries. Documents are optional and can be added later.
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Full Name"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="bg-white border-slate-200 focus:border-amber-500 py-2.5 text-xs font-semibold shadow-sm"
                />
                <Input 
                  label="Phone"
                  placeholder="+27..."
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="bg-white border-slate-200 focus:border-amber-500 py-2.5 text-xs font-semibold shadow-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Email"
                  placeholder="john@example.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-white border-slate-200 focus:border-amber-500 py-2.5 text-xs font-semibold shadow-sm"
                />
                <Input 
                  label="Password"
                  placeholder="Enter secure password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-white border-slate-200 focus:border-amber-500 py-2.5 text-xs font-semibold shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#f99c00]" />
                  Delivery Address *
                </label>
                <input 
                  type="text"
                  placeholder="Start typing your address..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#f99c00] focus:border-transparent transition-all shadow-sm"
                />
                <p className="text-[10px] text-slate-500 font-semibold pt-1">
                  Pick a suggestion so we can match you with nearby drivers on Google Maps.
                </p>
              </div>

              {/* Optional Documents Block */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-900">Optional documents</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    PDF, JPG, PNG or WEBP. Max 15 MB each. You can also add these later from your dashboard.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-800">ID / Passport (optional)</label>
                    <input 
                      type="file" 
                      className="w-full text-[11px] text-slate-500 font-medium file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 transition-all border border-slate-200 bg-white rounded-lg p-1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-800">Proof of Address (optional)</label>
                    <input 
                      type="file" 
                      className="w-full text-[11px] text-slate-500 font-medium file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 transition-all border border-slate-200 bg-white rounded-lg p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-xs tracking-widest uppercase transition-colors shadow-sm"
              >
                CREATE ACCOUNT
              </button>

              {/* Link to Login */}
              <div className="pt-2 text-center">
                <p className="text-xs font-bold text-slate-500">
                  Already registered? <button type="button" onClick={() => navigate('/login')} className="text-[#f99c00] hover:text-[#e08b00] font-black">Sign in</button>
                </p>
              </div>

            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
