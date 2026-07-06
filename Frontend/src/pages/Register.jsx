import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import React from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import {
  Truck, User, Shield, Wrench, Building, Mail, MessageSquare
} from 'lucide-react';
import { Card } from '../components/ui';

export default function Register() {
  const navigate = useNav();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative selection:bg-amber-500 selection:text-slate-950">

      <Navbar />
      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center space-y-5">
        <div className="space-y-2 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-955 leading-tight uppercase">
            Join LoadAfrica
          </h1>
          <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-2xl mx-auto">
            Pick the account type that fits you. All registrations are free, and you can upload your supporting documents during sign-up or later from your dashboard.
          </p>
        </div>

        {/* 2x2 Grid of registration cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left max-w-5xl mx-auto">
          
          {/* Card 1: Customer */}
          <Card className="bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-[#f99c00] flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-950">Customer</h4>
                <p className="text-xs text-slate-550 leading-relaxed font-normal">
                  Book bakkies, trucks and deliveries. Optional ID & proof-of-address upload.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/customer/register')}
              className="mt-4 w-full py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-extrabold rounded-lg text-xs tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              SIGN UP AS CUSTOMER <ArrowRight className="h-4 w-4" />
            </button>
          </Card>

          {/* Card 2: Driver */}
          <Card className="bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-[#f99c00] flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-955">Driver</h4>
                <p className="text-xs text-slate-555 leading-relaxed font-normal">
                  Get loads, upload your licence, PrDP and vehicle docs to get verified.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/driver/register')}
              className="mt-4 w-full py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-extrabold rounded-lg text-xs tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              SIGN UP AS DRIVER <ArrowRight className="h-4 w-4" />
            </button>
          </Card>

          {/* Card 3: Plant Owner */}
          <Card className="bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-[#f99c00] flex items-center justify-center">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-950">Plant Owner</h4>
                <p className="text-xs text-slate-550 leading-relaxed font-normal">
                  List TLBs, excavators and yellow plant. Upload operator and machine documents.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/plant/register')}
              className="mt-4 w-full py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-extrabold rounded-lg text-xs tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              SIGN UP AS PLANT OWNER <ArrowRight className="h-4 w-4" />
            </button>
          </Card>

          {/* Card 4: Fleet Owner */}
          <Card className="bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-[#f99c00] flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-950">Fleet Owner</h4>
                <p className="text-xs text-slate-550 leading-relaxed font-normal">
                  Manage a fleet of vehicles. Upload company docs, licences and vehicle photos.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/fleet/register')}
              className="mt-4 w-full py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-extrabold rounded-lg text-xs tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              SIGN UP AS FLEET OWNER <ArrowRight className="h-4 w-4" />
            </button>
          </Card>

        </div>

        {/* Footer-like sign in selector note */}
        <div className="text-xs text-slate-500 font-bold pt-4">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#f99c00] hover:text-[#e08b00] font-black underline transition-colors"
          >
            Sign in
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
const ArrowRight = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>;
