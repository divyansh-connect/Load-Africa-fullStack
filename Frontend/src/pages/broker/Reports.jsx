import React, { useState, useEffect } from 'react';
import { 
  Percent, DollarSign, Calendar, TrendingUp, Download, 
  ArrowUpRight, BarChart2, ShieldCheck, Check 
} from 'lucide-react';
import { getMockData } from '../../data/mockData';
import { Table, StatCard, Card, Button } from '../../components/ui';

export default function Reports() {
  const [broker, setBroker] = useState(null);
  const [assignedLoads, setAssignedLoads] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const brokers = getMockData('brokers') || [];
    setBroker(brokers[0]); // Lwazi Dlamini

    const allLoads = getMockData('loads') || [];
    setAssignedLoads(allLoads.filter(l => l.brokerId === 'brk-1'));
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }, 1500);
  };

  if (!broker) return null;

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Broker Commission Reports</h2>
          <p className="text-xs text-slate-400 font-medium">Verify historical matched freight payouts and active escrow commissions logs.</p>
        </div>
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          {downloading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : downloaded ? (
            <>
              <Check className="h-4 w-4 text-emerald-450 text-emerald-400" />
              Manifest Statement Downloaded
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Statement (PDF)
            </>
          )}
        </button>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Commissions Settled" value={`R${broker.commissionEarned}`} icon={DollarSign} color="emerald" />
        <StatCard title="Total Cargo Handled" value={`R${assignedLoads.reduce((sum, l) => sum + l.budget, 0).toLocaleString()}`} icon={TrendingUp} color="indigo" />
        <StatCard title="Broker Rate" value={`${broker.commissionRate}%`} icon={Percent} color="rose" />
      </div>

      {/* Grid of chart & detailed table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graph representation */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6 bg-white border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Commissions Trend (Monthly)</h3>
              <p className="text-xs text-slate-405 text-slate-400 mt-1">Earnings accrued across the flat 5% match rate.</p>
            </div>

            {/* Simulated Vector Graph */}
            <div className="h-40 bg-slate-950 rounded-2xl relative flex items-end justify-between p-4 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:100%_20px]" />
              
              <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path 
                  d="M 0 85 Q 80 70 160 50 T 320 30 T 400 20" 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="3" 
                />
              </svg>

              <div className="w-full flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Breakdown table */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-850">Commissions Breakdown</h3>
          <Card className="p-6 space-y-4">
            {assignedLoads.slice(0, 3).map((load) => (
              <div key={load.id} className="flex justify-between items-center text-xs pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">{load.id}</p>
                  <span className="text-slate-400">{load.date}</span>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-emerald-600">+R{Math.round(load.budget * 0.05)}</p>
                  <span className="text-[10px] text-slate-400">Rate: 5%</span>
                </div>
              </div>
            ))}
          </Card>
        </div>

      </div>

    </div>
  );
}
