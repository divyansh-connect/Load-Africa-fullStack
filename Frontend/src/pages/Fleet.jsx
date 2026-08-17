import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Bike, Car, Sofa, Milestone, Droplet, ArrowLeft
} from 'lucide-react';
import { Card } from '../components/ui';

export default function Fleet() {
  const navigate = useNavigate();

  const vehiclesList = [
    { name: 'Motorbike', capacity: '10 kg', use: 'Fast same-day courier for documents and small parcels', icon: Bike },
    { name: 'Small Car', capacity: '80 kg', use: 'Courier runs for parcels, groceries and light cargo', icon: Car },
    { name: 'LDV', capacity: '1.5-3.5 tons', use: 'General utility deliveries, tools, and medium-scale cargo', icon: Truck },
    { name: 'Bakkie', capacity: '500-1000 kg', use: 'Multi-purpose delivery vehicle for parcels, home moves, and retail', icon: Truck },
    { name: 'Coldroom Bakkie', capacity: '500-1000 kg', use: 'Temperature-controlled transport for perishables and food cargo', icon: Truck },
    { name: '1-3 Ton Truck', capacity: '1-3 tons', use: 'Light distribution and closed transit for retail products', icon: Truck },
    { name: 'Furniture Truck', capacity: '3-5 tons', use: 'Spacious box truck optimized for household and office moves', icon: Sofa },
    { name: '4-8 Ton Truck', capacity: '4-8 tons', use: 'Large capacity transport for heavy pallets and corporate logistics', icon: Truck },
    { name: 'Box Truck', capacity: '4-8 tons', use: 'Enclosed cargo for secure, weather-protected deliveries', icon: Truck },
    { name: 'Flatbed Truck', capacity: '8-30 tons', use: 'Oversized, irregular, or crane-loaded freight', icon: Truck },
    { name: 'Dropside Truck', capacity: '3-8 tons', use: 'Open-top loads with fold-down sides for easy access', icon: Truck },
    { name: 'Curtain-Side Truck', capacity: '8-14 tons', use: 'General palletized freight where side-loading with forklifts is necessary', icon: Truck },
    { name: 'Crane Truck', capacity: '5-15 tons', use: 'Mounted crane for heavy lifting on project sites — self-load and unload building materials', icon: Truck },
    { name: 'Tipper Truck', capacity: '10-15 tons', use: 'Bulk material hauling for site sand, gravel, and construction aggregates', icon: Truck },
    { name: 'Side Tipper', capacity: '20-34 tons', use: 'Heavy bulk mining aggregate, ore, and sand transit', icon: Milestone },
    { name: 'Water Tanker', capacity: '8-18 kL', use: 'Water supply hauling for construction sites, events, or agriculture', icon: Droplet },
    { name: 'Fuel Tanker', capacity: '20-40 kL', use: 'Safe commercial transport for fuels, oils, and bulk industrial liquids', icon: Droplet }
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
              OUR FLEET
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight uppercase max-w-4xl tracking-tight">
              EVERY VEHICLE FOR EVERY LOAD
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-3xl">
              From small bakkies for parcel courier runs to 34-ton side tippers for mining haulage — LoadAfrica's network covers it all across South Africa.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
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
              <button
                onClick={() => navigate('/fleet/register')}
                className="px-6 py-3.5 border border-[#f99c00] hover:bg-[#f99c00] hover:text-slate-950 text-[#f99c00] font-black rounded-lg text-xs tracking-wider transition-colors uppercase"
              >
                LIST YOUR FLEET
              </button>
            </div>
          </div>
        </main>
        
        {/* Decorative Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-[calc(100%+1.3px)] h-[40px] sm:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C49.71,114.73,103.1,119.5,155,116.14,213.1,112.35,268.49,84.45,321.39,56.44Z" fill="#F0F2F6"></path>
          </svg>
        </div>
      </div>

      {/* Every Vehicle Section with light grey background */}
      <section className="bg-[#F0F2F6] w-full border-t border-b border-slate-200/60 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Center Section Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-955 uppercase">
              EVERY VEHICLE YOU NEED
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              From bakkies to heavy-duty trucks
            </p>
          </div>

          {/* Vehicles Grid Catalog */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {vehiclesList.map((vh, idx) => {
              const Icon = vh.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-[#f99c00] rounded-2xl overflow-hidden flex flex-col h-full min-h-[260px] text-center transition-all duration-300 ease-out transform">
                  {/* Top Half: Light Grey Background with Divider Border and Orange Icon */}
                  <div className="bg-[#F3F3F4] py-10 flex items-center justify-center border-b border-slate-200/50">
                    <Icon className="h-10 w-10 text-[#f99c00] stroke-[1.8]" />
                  </div>
                  
                  {/* Bottom Half: White Background with Text */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-900">{vh.name}</h4>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                        {vh.capacity.startsWith('Up to') || vh.capacity.includes('tons') || vh.capacity.includes('kL') ? vh.capacity : `Up to ${vh.capacity}`}
                      </span>
                    </div>
                    {vh.use && (
                      <p className="text-[10px] text-slate-400 leading-relaxed font-normal mt-2">
                        {vh.use}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer light />

    </div>
  );
}
