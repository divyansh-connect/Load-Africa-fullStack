import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, Package, Calendar, MapPin, Search, 
  ExternalLink, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { getMockData } from '../../data/mockData';
import { Badge, Table, StatCard } from '../../components/ui';

export default function AssignedLoads() {
  const navigate = useNavigate();
  const [assignedLoads, setAssignedLoads] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const allLoads = getMockData('loads') || [];
    // Broker Lwazi Dlamini assigned loads (brokerId brk-1)
    const brokerLoads = allLoads.filter(l => l.brokerId === 'brk-1');
    setAssignedLoads(brokerLoads);

    const allDrivers = getMockData('drivers') || [];
    setDrivers(allDrivers);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge status="available" />;
      case 'assigned':
        return <Badge status="assigned" />;
      case 'in_transit':
        return <Badge status="in_transit" />;
      case 'completed':
        return <Badge status="completed" />;
      default:
        return <Badge status={status} />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Shipments</h2>
        <p className="text-xs text-slate-400">Track current logistics transits and escrow release status for loads matches by you.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="In Transit" value={assignedLoads.filter(l => l.status === 'in_transit').length} icon={Navigation} color="amber" />
        <StatCard title="Completed Escrow" value={assignedLoads.filter(l => l.status === 'completed').length} icon={CheckCircle2} color="emerald" />
        <StatCard title="Total Allocations" value={assignedLoads.length} icon={Package} color="indigo" />
      </div>

      {/* Grid list table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        {assignedLoads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">You haven't allocated any loads yet.</div>
        ) : (
          <Table headers={['Load Details', 'Assigned Transporter', 'Payout / Commission', 'Transit State', 'Dispatch Date']}>
            {assignedLoads.map((load) => {
              const drv = drivers.find(d => d.id === load.driverId);
              return (
                <tr key={load.id} className="hover:bg-slate-50/30">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{load.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{load.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-850">
                    <p>{drv ? drv.name : 'Unassigned'}</p>
                    {drv && <span className="text-[10px] text-slate-400 font-mono font-medium">{drv.phone}</span>}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-slate-800 font-bold">R{load.budget}</p>
                    <span className="text-emerald-600 font-bold">Comm: R{Math.round(load.budget * 0.05)}</span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(load.status)}
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-400">{load.date}</td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>

    </div>
  );
}
