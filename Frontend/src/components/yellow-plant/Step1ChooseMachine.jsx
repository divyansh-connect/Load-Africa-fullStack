import React, { useState, useMemo } from 'react';
import MachineCard from './MachineCard';
import machineData from '../../data/machineData.json';

const CATEGORIES = ['All', 'Earthmoving', 'Grading & Compaction', 'Lifting', 'Drilling & Breaking', 'Concrete'];

export default function Step1ChooseMachine({ selectedMachine, onSelectMachine, onNext }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredMachines = useMemo(() => {
    if (activeCategory === 'All') return machineData;
    return machineData.filter(m => m.category === activeCategory);
  }, [activeCategory]);

  const handleMachineClick = (machine) => {
    onSelectMachine(machine);
    setTimeout(() => {
      onNext();
    }, 150);
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full overflow-hidden">
      
      {/* Category Pills (Fixed at the top of the step) */}
      <div className="flex flex-wrap gap-2 mb-4 shrink-0 bg-white">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-colors duration-200 ${
              activeCategory === category 
                ? 'bg-[#f99c00] text-slate-955' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Machines List (Scrolls independently) */}
      <div className="flex flex-col space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {filteredMachines.map(machine => (
          <MachineCard 
            key={machine.id} 
            machine={machine} 
            isSelected={selectedMachine?.id === machine.id}
            onClick={() => handleMachineClick(machine)}
          />
        ))}
        {filteredMachines.length === 0 && (
          <div className="py-10 text-center text-slate-500 text-xs font-bold bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            No machines found in this category.
          </div>
        )}
      </div>

      {/* Footer Disclaimer Text (Fixed at the bottom) */}
      <div className="pt-4 pb-1 text-center border-t border-slate-100 shrink-0 bg-white mt-4">
        <p className="text-[10px] font-bold text-slate-400 tracking-tight">
          All rates exclude VAT &middot; Minimum hire: 4 hours &middot; Site establishment &amp; de-establishment fees apply
        </p>
      </div>


    </div>
  );
}
