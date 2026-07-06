import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressStepper({ currentStep }) {
  const getStepText = () => {
    switch(currentStep) {
      case 1: return "Choose machine";
      case 2: return "Enter details";
      case 3: return "Your quotation";
      default: return "";
    }
  };

  return (
    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pb-2 pt-0">
      <div className="flex items-center gap-3">
        {/* Step 1 */}
        {currentStep > 1 ? (
          <span className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-amber-50 text-[#f99c00] border border-amber-200">
            <Check className="w-4 h-4" strokeWidth={3} />
          </span>
        ) : (
          <span className={`h-8 w-8 rounded-full text-sm flex items-center justify-center shrink-0 transition-colors duration-300 ${currentStep === 1 ? 'bg-[#f99c00] text-slate-955 font-black' : 'bg-slate-100 text-slate-600 font-bold'}`}>1</span>
        )}
        
        <div className={`h-0.5 w-8 rounded-full transition-colors duration-300 ${currentStep >= 2 ? 'bg-[#f99c00]' : 'bg-slate-100'}`} />
        
        {/* Step 2 */}
        {currentStep > 2 ? (
          <span className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-amber-50 text-[#f99c00] border border-amber-200">
            <Check className="w-4 h-4" strokeWidth={3} />
          </span>
        ) : (
          <span className={`h-8 w-8 rounded-full text-sm flex items-center justify-center shrink-0 transition-colors duration-300 ${currentStep === 2 ? 'bg-[#f99c00] text-slate-955 font-black' : 'bg-slate-100 text-slate-600 font-bold'}`}>2</span>
        )}

        <div className={`h-0.5 w-8 rounded-full transition-colors duration-300 ${currentStep >= 3 ? 'bg-[#f99c00]' : 'bg-slate-100'}`} />
        
        {/* Step 3 */}
        <span className={`h-8 w-8 rounded-full text-sm flex items-center justify-center shrink-0 transition-colors duration-300 ${currentStep === 3 ? 'bg-[#f99c00] text-slate-955 font-black' : 'bg-slate-100 text-slate-600 font-bold'}`}>3</span>
      </div>

      <span className="ml-2 font-black text-slate-600">{getStepText()}</span>
    </div>
  );
}
