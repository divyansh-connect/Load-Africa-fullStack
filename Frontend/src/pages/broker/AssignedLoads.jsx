import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, Package, Calendar, MapPin, 
  ExternalLink, CheckCircle2, X, RefreshCcw
} from 'lucide-react';
import { brokerService } from '../../services/brokerService';
import { bookingService } from '../../services/bookingService';
import { Badge, Table, StatCard } from '../../components/ui';

export default function AssignedLoads() {
  const navigate = useNavigate();
  const [assignedLoads, setAssignedLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);

  const [fleets, setFleets] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedFleetId, setSelectedFleetId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchAssignedLoads();
    fetchTransporters();
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

  const fetchTransporters = async () => {
    try {
      const resFleets = await brokerService.getApprovedFleetOwners();
      const resDrivers = await brokerService.getApprovedDrivers();
      if (resFleets.success) setFleets(resFleets.data);
      if (resDrivers.success) setDrivers(resDrivers.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewClick = (load) => {
    setSelectedLoad(load);
    setSelectedFleetId('');
    setSelectedDriverId('');
    setViewModalOpen(true);
  };

  const handleAssignFleet = async () => {
    if (!selectedFleetId) return;
    try {
      setAssigning(true);
      const res = await brokerService.assignFleet(selectedLoad.id, selectedFleetId);
      if (res.success) {
        setViewModalOpen(false);
        fetchAssignedLoads();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign Fleet');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) return;
    try {
      setAssigning(true);
      const res = await brokerService.assignDriver(selectedLoad.id, selectedDriverId);
      if (res.success) {
        setViewModalOpen(false);
        fetchAssignedLoads();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign Driver');
    } finally {
      setAssigning(false);
    }
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
        return <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-650 border border-slate-200">{status}</span>;
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
              const transporterName = load.assignment?.driver?.user?.first_name 
                ? `${load.assignment.driver.user.first_name} ${load.assignment.driver.user.last_name || ''}` 
                : load.assignment?.fleet_owner?.company_name 
                ? load.assignment.fleet_owner.company_name
                : 'Awaiting Operator Assignment';
              
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
                      className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" 
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900">Booking Details</h2>
                <p className="text-sm text-slate-500">View logistics information</p>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                  <p className="text-sm font-semibold text-slate-900">{selectedLoad.cargo_name} ({selectedLoad.weight}kg)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Assigned Transporter</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedLoad.assignment?.driver?.user?.first_name 
                      ? `${selectedLoad.assignment.driver.user.first_name} ${selectedLoad.assignment.driver.user.last_name || ''}` 
                      : selectedLoad.assignment?.fleet_owner?.company_name 
                      ? selectedLoad.assignment.fleet_owner.company_name
                      : 'Unassigned'}
                  </p>
                </div>
              </div>

              {selectedLoad.status === 'POD_UPLOADED' && (
                <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl text-center space-y-3">
                  <p className="text-xs font-bold text-amber-800">The driver has uploaded the Proof of Delivery (POD). Please verify document correctness.</p>
                  <button
                    onClick={async () => {
                      try {
                        setAssigning(true);
                        const res = await bookingService.updateBookingStatus(selectedLoad.id, 'POD_VERIFIED', 'Broker verified uploaded Proof of Delivery (POD).');
                        if (res.success) {
                          setViewModalOpen(false);
                          fetchAssignedLoads();
                        }
                      } catch (err) {
                        alert(err.message || 'Failed to verify POD');
                      } finally {
                        setAssigning(false);
                      }
                    }}
                    disabled={assigning}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-extrabold text-xs tracking-wider rounded-xl uppercase transition-colors"
                  >
                    {assigning ? 'Verifying...' : 'Verify Proof of Delivery (POD)'}
                  </button>
                </div>
              )}

              {/* Assignment Selector if not assigned */}
              {!selectedLoad.assignment && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Assign Operations Dispatch</h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Option A: Assign Fleet */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Option A: Dispatch to Fleet Owner</p>
                        <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">Fleet Owner will review, accept, and dispatch their vehicle and fleet driver.</p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedFleetId}
                          onChange={(e) => { setSelectedFleetId(e.target.value); setSelectedDriverId(''); }}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        >
                          <option value="">Select approved fleet owner...</option>
                          {fleets.map(f => (
                            <option key={f.id} value={f.fleet_owner?.id}>
                              {f.fleet_owner?.company_name || `${f.first_name} ${f.last_name}`}
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={!selectedFleetId || assigning}
                          onClick={handleAssignFleet}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-955 text-xs font-black rounded-lg transition-colors cursor-pointer"
                        >
                          Assign Fleet
                        </button>
                      </div>
                    </div>

                    {/* Option B: Assign Independent Driver */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Option B: Dispatch to Independent Driver</p>
                        <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">Driver will receive load, review details, and start transit directly.</p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedDriverId}
                          onChange={(e) => { setSelectedDriverId(e.target.value); setSelectedFleetId(''); }}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        >
                          <option value="">Select approved driver...</option>
                          {drivers.map(d => (
                            <option key={d.id} value={d.driver?.id}>
                              {d.first_name} {d.last_name}
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={!selectedDriverId || assigning}
                          onClick={handleAssignDriver}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-955 text-xs font-black rounded-lg transition-colors cursor-pointer"
                        >
                          Assign Driver
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
