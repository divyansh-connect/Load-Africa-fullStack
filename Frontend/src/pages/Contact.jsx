import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Mail, MessageSquare, MapPin, Building, Phone
} from 'lucide-react';

export default function Contact() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative selection:bg-amber-500 selection:text-slate-950">

      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-left space-y-6">
        <div className="space-y-4">
          <span className="text-[#f99c00] font-bold text-xs uppercase tracking-wider block">
            CONTACT
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 leading-tight uppercase">
            GET IN TOUCH
          </h1>
          <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-2xl">
            For quotes, please use the booking form on the homepage. For tracking, bookings and disputes, reach our team directly:
          </p>
        </div>

        {/* Stack of cards */}
        <div className="space-y-4">
          {/* Card 1: WhatsApp */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center gap-5 shadow-xs">
            <div className="h-12 w-12 rounded-full border border-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0 bg-emerald-50/10">
              <MessageSquare className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-950">WhatsApp Support</h4>
              <p className="text-xs text-slate-500 font-bold mt-0.5">063 931 6677 — tracking, bookings & disputes</p>
            </div>
          </div>

          {/* Card 2: Email */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center gap-5 shadow-xs">
            <div className="h-12 w-12 rounded-full border border-amber-500/20 text-[#f99c00] flex items-center justify-center shrink-0 bg-amber-50/10">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-950">Email</h4>
              <a href="mailto:support@loadafrica.app" className="text-xs text-slate-500 font-bold mt-0.5 hover:underline">
                support@loadafrica.app
              </a>
            </div>
          </div>

          {/* Card 3: Regions */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center gap-5 shadow-xs">
            <div className="h-12 w-12 rounded-full border border-amber-500/20 text-[#f99c00] flex items-center justify-center shrink-0 bg-amber-50/10">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-950">Operating Regions</h4>
              <p className="text-xs text-slate-500 font-bold mt-0.5">Gauteng, North West (Rustenburg) & Northern Cape</p>
            </div>
          </div>

          {/* Card 4: Business registration */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center gap-5 shadow-xs">
            <div className="h-12 w-12 rounded-full border border-amber-500/20 text-[#f99c00] flex items-center justify-center shrink-0 bg-amber-50/10">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-950">Loadafrica (Pty) Ltd</h4>
              <p className="text-xs text-slate-500 font-bold mt-0.5">Company Reg 2016 / 389702 / 07</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
}
