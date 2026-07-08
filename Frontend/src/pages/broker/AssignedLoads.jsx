import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, Package, Calendar, MapPin, 
  ExternalLink, CheckCircle2, X, RefreshCcw
} from 'lucide-react';
import { brokerService } from '../../services/brokerService';
import { Badge, Table, StatCard } from '../../components/ui';

export default function AssignedLoads() {
  const navigate = useNavigate();
  const [assignedLoads, setAssignedLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);

  useEffect(() => {
    fetchAssignedLoads();
  }, []);

  const fetchAssignedLoads = async () => {
    try {
      const res = await brokerService.getAssignedLoads();
      if (res.success) {
        setAssignedLoads(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (load) => {
    setSelectedLoad(load);
    setViewModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'draft';
    switch (s) {
      case 'in_transit':
      case 'driver_en_route':
      case 'loading':
      case 'picked_up':
        return <Badge status="in_transit" />;
      case 'delivered':
      case 'completed':
        return <Badge status="completed" />;
      case 'booking_confirmed':
      case 'driver_assigned':
        return <Badge status="assigned" />;
      default:
        return <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Bookings</h2>
          <p className="text-xs text-slate-400">Track current logistics transits and delivery status for your brokered bookings.</p>
        </div>
        <button 
          onClick={fetchAssignedLoads}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="In Transit" value={assignedLoads.filter(l => ['IN_TRANSIT', 'PICKED_UP', 'LOADING', 'DRIVER_EN_ROUTE'].includes(l.status)).length} icon={Navigation} color="amber" />
        <StatCard title="Completed Deliveries" value={assignedLoads.filter(l => ['COMPLETED', 'DELIVERED', 'PAYMENT_RECEIVED'].includes(l.status)).length} icon={CheckCircle2} color="emerald" />
        <StatCard title="Total Allocations" value={assignedLoads.length} icon={Package} color="indigo" />
      </div>

      {/* Grid list table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
            Loading assigned bookings...
          </div>
        ) : assignedLoads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">You don't have any assigned bookings yet.</div>
        ) : (
          <Table headers={['Booking Details', 'Assigned Transporter', 'Transit State', 'Date Created', 'Action']}>
            {assignedLoads.map((load) => {
              const transporterName = load.assignment?.driver?.user?.first_name || 
                                      load.assignment?.fleet_owner?.company_name || 
                                      'Admin Dispatching...';
              
              return (
                <tr key={load.id} className="hover:bg-slate-50/30">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{load.pickup_address} → {load.delivery_address}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{load.id.split('-')[0]}...</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-850">
                    <p>{transporterName}</p>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(load.status)}
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-400">{new Date(load.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleViewClick(load)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" 
                      title="View Details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>

      {/* View Details Modal */}
      {viewModalOpen && selectedLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-900">Booking Details</h2>
                <p className="text-sm text-slate-500">View logistics information</p>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Booking Status</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">ID: {selectedLoad.id.split('-')[0]}</p>
                </div>
                {getStatusBadge(selectedLoad.status)}
              </div>

              {/* Route */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transit Route</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedLoad.pickup_address} <span className="text-slate-400 mx-1">→</span> {selectedLoad.delivery_address}</p>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Cargo</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedLoad.cargo_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Assigned Transporter</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedLoad.assignment?.driver?.user?.first_name || 
                     selectedLoad.assignment?.fleet_owner?.company_name || 
                     'Awaiting Admin Assignment'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50 text-center">
                <p className="text-xs font-bold text-slate-500">Note: Dispatch and driver management is handled by Admin.</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
