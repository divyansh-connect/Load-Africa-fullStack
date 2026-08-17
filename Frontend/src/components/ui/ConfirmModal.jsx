import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "danger",
  showInput = false,
  inputValue = "",
  setInputValue = null,
  inputPlaceholder = "Enter reason..."
}) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className={`p-6 ${isDanger ? 'bg-red-50' : 'bg-emerald-50'} flex flex-col items-center text-center space-y-4`}>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {isDanger ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm font-semibold text-slate-600 mt-2 leading-relaxed">
              {message}
            </p>
            {showInput && (
              <div className="mt-4 text-left w-full">
                <input
                  type="text"
                  required
                  placeholder={inputPlaceholder}
                  value={inputValue}
                  onChange={(e) => setInputValue && setInputValue(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-medium"
                />
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-black text-sm shadow-md transition-colors ${
              isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
