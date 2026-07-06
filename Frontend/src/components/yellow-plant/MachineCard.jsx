import React from 'react';

export default function MachineCard({ machine, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-between py-2 px-3 rounded-xl border bg-white cursor-pointer transition-all duration-300 hover:shadow-sm ${
        isSelected 
          ? 'border-[#f99c00] ring-1 ring-[#f99c00]/30 shadow-sm bg-amber-50/10' 
          : 'border-slate-200 shadow-none hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
          <img 
            src={machine.image} 
            alt={machine.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex flex-col justify-center">
          <h4 className="text-[14px] font-black text-slate-900 leading-tight mb-0.5">
            {machine.name}
          </h4>
          <span className="text-[11px] font-bold text-slate-500 capitalize">
            {machine.category}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-end justify-center text-right">
        <span className="text-[15px] font-black text-[#f99c00] mb-0.5">
          R {machine.hourlyRate.toLocaleString()}/hr
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          Min {machine.minHireHours}hrs
        </span>
      </div>
    </div>
  );
}
