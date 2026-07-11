import React, { useState, useEffect, useMemo } from 'react';
import MachineCard from './MachineCard';
import machineData from '../../data/machineData.json';
import { plantService } from '../../services/plantService';

const CATEGORIES = ['All', 'Earthmoving', 'Grading & Compaction', 'Lifting', 'Drilling & Breaking', 'Concrete'];

const getCategoryGroup = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('excavator') || t.includes('loader') || t.includes('tlb') || t.includes('skid') || t.includes('bobcat') || t.includes('bulldozer') || t.includes('backhoe') || t.includes('truck') || t.includes('tanker') || t.includes('bowser')) {
    return 'Earthmoving';
  }
  if (t.includes('grader') || t.includes('roller') || t.includes('compactor') || t.includes('paver') || t.includes('milling') || t.includes('asphalt')) {
    return 'Grading & Compaction';
  }
  if (t.includes('crane') || t.includes('forklift') || t.includes('telehandler') || t.includes('stacker') || t.includes('lift') || t.includes('picker') || t.includes('handler')) {
    return 'Lifting';
  }
  if (t.includes('rig') || t.includes('breaker') || t.includes('hammer') || t.includes('compressor')) {
    return 'Drilling & Breaking';
  }
  if (t.includes('concrete') || t.includes('mixer') || t.includes('pump')) {
    return 'Concrete';
  }
  return 'Earthmoving';
};

const getCategoryPlaceholder = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('excavator')) return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80';
  if (t.includes('grader')) return 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&auto=format&fit=crop&q=80';
  if (t.includes('crane')) return 'https://images.unsplash.com/photo-1542345812-d98b5cd6cfc5?w=400&auto=format&fit=crop&q=80';
  if (t.includes('forklift') || t.includes('telehandler') || t.includes('stacker')) return 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=400&auto=format&fit=crop&q=80';
  if (t.includes('roller') || t.includes('compactor')) return 'https://images.unsplash.com/photo-1536766768598-e0b20a135305?w=400&auto=format&fit=crop&q=80';
  if (t.includes('loader') || t.includes('tlb') || t.includes('backhoe') || t.includes('bobcat')) return 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80';
  if (t.includes('truck') || t.includes('tanker')) return 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80';
};

export default function Step1ChooseMachine({ selectedMachine, onSelectMachine, onNext }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMachines = async () => {
      try {
        setIsLoading(true);
        const res = await plantService.getPublicMachines();
        if (res.success && res.data && res.data.length > 0) {
          const dbMachines = res.data.map(m => {
            let doc = {};
            if (m.machine_documents) {
              try {
                doc = typeof m.machine_documents === 'string' ? JSON.parse(m.machine_documents) : m.machine_documents;
              } catch (e) {
                console.error("Error parsing machine_documents", e);
                doc = {};
              }
            }
            let img = '';
            if (doc.photos && Array.isArray(doc.photos) && doc.photos.length > 0) {
              const primaryPhoto = doc.photos.find(p => p.isPrimary) || doc.photos[0];
              img = primaryPhoto.url;
            } else {
              img = doc.photo || '';
            }

            if (!img) {
              img = getCategoryPlaceholder(m.type);
            } else if (!img.startsWith('http')) {
              const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
              img = `${base}${img.startsWith('/') ? '' : '/'}${img}`;
            }

            return {
              id: m.id,
              name: `${doc.make || ''} ${doc.model || m.type}`.trim(),
              category: getCategoryGroup(m.type),
              hourlyRate: Number(doc.rate) || 500,
              minHireHours: Number(doc.min_hire_hours) || 4,
              image: img,
              originalData: m
            };
          });
          setMachines(dbMachines);
        } else {
          setMachines(machineData);
        }
      } catch (err) {
        console.error(err);
        setMachines(machineData);
      } finally {
        setIsLoading(false);
      }
    };
    loadMachines();
  }, []);

  const filteredMachines = useMemo(() => {
    if (activeCategory === 'All') return machines;
    return machines.filter(m => m.category === activeCategory);
  }, [activeCategory, machines]);

  const handleMachineClick = (machine) => {
    onSelectMachine(machine);
    setTimeout(() => {
      onNext();
    }, 150);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs font-bold bg-white rounded-xl">
        Loading active inventory...
      </div>
    );
  }

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
          <div className="py-10 text-center text-slate-500 text-xs font-bold bg-slate-55 rounded-xl border border-slate-200 border-dashed">
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
