import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Percent, Navigation, Users, DollarSign, Package, 
  ChevronRight, ArrowRight, ShieldCheck, Compass, Clock 
} from 'lucide-react';
import { getMockData } from '../../data/mockData';
import { StatCard, Card, Badge, Table } from '../../components/ui';

export default function BrokerDashboard() {
  const navigate = useNavigate();
  const [broker, setBroker] = useState(null);
  const [leads, setLeads] = useState([]);
  const [assignedLoads, setAssignedLoads] = useState([]);

  useEffect(() => {
    const brokers = getMockData('brokers') || [];
    setBroker(brokers[0]); // Lwazi Dlamini

    const allLoads = getMockData('loads') || [];
    // Leads are loads that are still 'available'
    const availableLeads = allLoads.filter(l => l.status === 'available');
    setLeads(availableLeads);

    // Assigned loads by this broker
    const assigned = allLoads.filter(l => l.brokerId === 'brk-1');
    setAssignedLoads(assigned);
  }, []);

  if (!broker) return null;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome, {broker.name}</h2>
          <p className="mt-2 text-slate-300 font-light text-sm sm:text-base">
            African logistics broker dispatch center. Connect shippers with verified carriers and track your commissions.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/broker/leads')}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-650 text-white hover:bg-indigo-600 text-sm font-bold rounded-2xl transition-all shadow-lg"
            >
              Browse Active Leads
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Commissions" value={`R${broker.commissionEarned}`} icon={DollarSign} color="emerald" />
        <StatCard title="My Allocated Shipments" value={assignedLoads.length} icon={Navigation} color="indigo" />
        <StatCard title="Available Corridor Leads" value={leads.length} icon={Package} color="amber" />
        <StatCard title="Flat Commission Rate" value={`${broker.commissionRate}%`} icon={Percent} color="rose" />
      </div>

      {/* Grid of leads list & recent commissions updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active leads table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Fresh Corridor Leads</h3>
              <p className="text-xs text-slate-400">Available cargo waiting for driver assignments.</p>
            </div>
            <Link to="/broker/leads" className="text-xs font-bold text-indigo-600 hover:text-indigo-755 flex items-center gap-0.5">
              View All Leads
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <Table headers={['Cargo Description', 'Route', 'Payout', 'Action']}>
            {leads.slice(0, 3).map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/50">
                <td className="py-4 px-6">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{lead.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">{lead.id} ({lead.weight})</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-slate-650 leading-tight">From: {lead.pickup.split(',')[0]}</p>
                  <p className="text-slate-650 leading-tight">To: {lead.dropoff.split(',')[0]}</p>
                </td>
                <td className="py-4 px-6 font-bold text-slate-800">R{lead.budget}</td>
                <td className="py-4 px-6">
                  <button 
                    onClick={() => navigate('/broker/leads')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Allocate
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Commissions reports sidebar */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Broker Commissions Guide</h3>
          
          <Card className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-indigo-650 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-slate-800">Guaranteed Escrow</p>
                <p className="text-slate-500 font-light leading-relaxed">Commission payouts are locked immediately upon matching and released upon shipper sign-off.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <Percent className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-slate-800">Automatic Crediting</p>
                <p className="text-slate-500 font-light leading-relaxed">No manual invoice request needed. Payout credits clear in M-Pesa within 2 hours of delivery.</p>
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
