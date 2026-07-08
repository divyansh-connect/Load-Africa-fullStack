import React, { useState } from 'react';
import { Target, Save } from 'lucide-react';

export default function ProviderMatchRadius() {
  const [radius, setRadius] = useState(50);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Provider Match Radius</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Configure the default radius (in KM) used to match customers with nearby drivers and fleet owners when no specific radius is selected by the customer.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Global Default Radius</h2>
            <p className="text-sm text-slate-500">Slide to adjust the matching distance limit.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">
              {radius} <span className="text-2xl text-amber-500 tracking-normal">KM</span>
            </span>
          </div>

          <div className="px-2">
            <input 
              type="range" 
              min="10" 
              max="200" 
              step="5"
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
              <span>10 KM</span>
              <span>100 KM</span>
              <span>200 KM</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
