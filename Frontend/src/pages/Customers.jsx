import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Box, Sofa, Mountain, Building, ShieldCheck, Clock, Mail, MessageSquare, ArrowLeft
} from 'lucide-react';
import { Card } from '../components/ui';

export default function Customers() {
  const navigate = useNavigate();

  const customerServices = [
    {
      title: 'Business Deliveries',
      desc: 'Daily courier runs, retail distribution and e-commerce drop-offs with bakkies and 1-ton trucks.',
      icon: Box
    },
    {
      title: 'Furniture Removal',
      desc: 'Home and office moves with furniture trucks and trained crews — packing, loading, delivery.',
      icon: Sofa
    },
    {
      title: 'Sand & Rubble Removal',
      desc: 'Site clearing, rubble removal and sand delivery with tippers, skips and tipper trucks.',
      icon: Mountain
    },
    {
      title: 'Construction Loads',
      desc: 'Stone, cement and building material delivered with tippers and side tippers.',
      icon: Building
    },
    {
      title: 'Bakkie & Truck Hire',
      desc: 'On-demand bakkie hire and 4-ton or 8-ton truck hire with vetted drivers.',
      icon: Truck
    },
    {
      title: 'Insured Loads',
      desc: 'Verified drivers, insured cargo and live tracking on every booking.',
      icon: ShieldCheck
    },
    {
      title: 'Same-Day Service',
      desc: 'Same-day pickups across Gauteng, North West (Rustenburg) and Northern Cape when you need it fast.',
      icon: Clock
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      {/* Hero Header Area */}
      <div className="relative z-10 w-full overflow-hidden bg-slate-900 text-white pt-12 pb-24 lg:pt-16 lg:pb-32 mt-16">
        <main className="relative z-10 max-w-7xl mx-auto px-6 text-left space-y-6 mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          
          <div className="space-y-4">
            <span className="text-[#f99c00] font-bold text-xs uppercase tracking-wider block">
              FOR CUSTOMERS
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight uppercase max-w-4xl tracking-tight">
              MOVE ANYTHING ACROSS SOUTH AFRICA
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-3xl">
              Whether it's a single bakkie courier run or a full fleet of trucks, LoadAfrica connects you with verified drivers in Gauteng, North West (Rustenburg) and Northern Cape.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider"
              >
                BOOK A LOAD
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-lg text-xs tracking-wider uppercase border border-slate-700"
              >
                Request Quote
              </button>
            </div>
          </div>
        </main>
        
        {/* Decorative Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-[calc(100%+1.3px)] h-[40px] sm:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C49.71,114.73,103.1,119.5,155,116.14,213.1,112.35,268.49,84.45,321.39,56.44Z" fill="#ffffff"></path>
          </svg>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-16 text-left">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {customerServices.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <Card key={idx} className="bg-white border border-slate-200/80 p-6 text-left space-y-4 shadow-xs rounded-2xl">
                <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-base text-slate-955">{srv.title}</h4>
                  <p className="text-xs text-slate-550 leading-relaxed font-normal">{srv.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <section className="bg-[#0b1329] py-12 border-t border-slate-800/40 text-center text-white">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <h2 className="text-3xl font-black tracking-tight uppercase">
            REQUEST A QUOTE
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Get instant pricing and book in minutes.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3.5 bg-[#f99c00] hover:bg-[#e08b00] active:scale-[0.98] text-slate-955 font-extrabold rounded text-xs tracking-wider transition-all duration-150 uppercase shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              REQUEST QUOTE
            </button>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
