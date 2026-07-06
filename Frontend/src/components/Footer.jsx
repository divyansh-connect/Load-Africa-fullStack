import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-6 text-slate-500 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 text-left">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-[#f99c00] text-slate-950 p-1.5 rounded">
                <Truck className="h-4 w-4 fill-current" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-600 uppercase">
                LOADAFRICA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold pr-4">
              South Africa's on-demand logistics & transport platform. Bakkies, trucks, tippers, tankers and yellow plant.
            </p>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <p className="font-black text-slate-950 uppercase tracking-widest text-[10px]">Explore</p>
            <div className="flex flex-col space-y-2.5 text-slate-500 font-bold">
              <button onClick={() => navigate('/customers')} className="hover:text-[#f99c00] text-left bg-transparent border-none p-0 cursor-pointer text-[11px] transition-colors">For Customers</button>
              <button onClick={() => navigate('/drivers')} className="hover:text-[#f99c00] text-left bg-transparent border-none p-0 cursor-pointer text-[11px] transition-colors">For Drivers</button>
              <button onClick={() => navigate('/fleet')} className="hover:text-[#f99c00] text-left bg-transparent border-none p-0 cursor-pointer text-[11px] transition-colors">Our Fleet</button>
              <button onClick={() => navigate('/contact')} className="hover:text-[#f99c00] text-left bg-transparent border-none p-0 cursor-pointer text-[11px] transition-colors">Contact</button>
              <button className="hover:text-[#f99c00] text-left bg-transparent border-none p-0 cursor-pointer text-[11px] transition-colors">Terms & Conditions</button>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <p className="font-black text-slate-950 uppercase tracking-widest text-[10px]">Company</p>
            <div className="flex flex-col space-y-2.5 text-slate-600 font-bold">
              <p className="text-[11px]">Loadafrica (Pty) Ltd</p>
              <p className="text-[11px]">Company Reg: 2016 / 389702 / 07</p>
              <p className="leading-relaxed font-semibold text-slate-400 text-[11px] mt-1">Operating in Gauteng, North West<br/>(Rustenburg)<br/>& Northern Cape</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="font-black text-slate-950 uppercase tracking-widest text-[10px]">Contact</p>
            <div className="flex flex-col space-y-3 text-slate-600 font-bold">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-700 shrink-0" />
                <span className="text-[11px]">WhatsApp Support: 063 931 6677</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#f99c00] shrink-0" />
                <span className="text-[11px]">support@loadafrica.app</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom line */}
        <div className="border-t border-slate-200 mt-10 pt-6 text-center text-slate-600 text-[11px] sm:text-xs font-bold pb-2">
          © {year} Loadafrica (Pty) Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
