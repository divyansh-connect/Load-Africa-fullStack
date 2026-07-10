import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, Package, Calendar, MapPin, 
  ExternalLink, CheckCircle2, X, RefreshCcw,
  Truck, User, Building, Phone, Clock, FileText, ArrowRight, ShieldCheck, Send
} from 'lucide-react';
import { brokerService } from '../../services/brokerService';
import { bookingService } from '../../services/bookingService';
import { Badge, Table, StatCard } from '../../components/ui';
import LoadAfricaMap from '../../components/ui/LoadAfricaMap';

export default function AssignedLoads() {
  const navigate = useNavigate();
  const [assignedLoads, setAssignedLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);

  const [fleets, setFleets] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [plantOwners, setPlantOwners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [partnerType, setPartnerType] = useState('FLEET'); // FLEET or DRIVER
  const [assigning, setAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState('TRANSPORT'); // TRANSPORT or PLANT

  useEffect(() => {
    fetchAssignedLoads();
    fetchTransporters();
  }, []);

  const fetchAssignedLoads = async () => {
    try {
      setLoading(true);
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
      brokerService.getApprovedFleetOwners().then(res => {
        if (res.success) setFleets(res.data);
      }).catch(err => console.error("Error fetching fleets:", err));

      brokerService.getApprovedDrivers().then(res => {
        if (res.success) setDrivers(res.data);
      }).catch(err => console.error("Error fetching drivers:", err));

      brokerService.getApprovedPlantOwners().then(res => {
        if (res.success) setPlantOwners(res.data);
      }).catch(err => console.error("Error fetching plant owners:", err));
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewClick = (load) => {
    setSelectedLoad(load);
    setSelectedPartnerId('');
    setPartnerType('FLEET');
    setViewModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedPartnerId) return;
    try {
      setAssigning(true);
      let res;
      if (selectedLoad.cargo_category === 'Plant Hire') {
        res = await brokerService.assignPlant(selectedLoad.id, selectedPartnerId);
      } else {
        if (partnerType === 'FLEET') {
          res = await brokerService.assignFleet(selectedLoad.id, selectedPartnerId);
        } else {
          res = await brokerService.assignDriver(selectedLoad.id, selectedPartnerId);
        }
      }
      
      if (res.success) {
        setViewModalOpen(false);
        fetchAssignedLoads();
        alert('Assignment completed successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Assignment failed');
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
      case 'arrived_pickup':
      case 'arrived_destination':
        return <Badge status="in_transit" />;
      case 'delivered':
      case 'completed':
      case 'pod_verified':
        return <Badge status="completed" />;
      case 'booking_confirmed':
      case 'driver_assigned':
        return <Badge status="assigned" />;
      default:
        return (
          <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-50 text-amber-700 border border-amber-250">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Bookings</h2>
          <p className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Manage transporter dispatching and track active delivery status</p>
        </div>
        <button 
          onClick={fetchAssignedLoads}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors shrink-0"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh Bookings
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard 
          title="Active Transits" 
          value={assignedLoads.filter(l => ['IN_TRANSIT', 'PICKED_UP', 'LOADING', 'DRIVER_EN_ROUTE', 'ARRIVED_PICKUP'].includes(l.status)).length} 
          icon={Navigation} 
          color="amber" 
        />
        <StatCard 
          title="Completed Trips" 
          value={assignedLoads.filter(l => ['COMPLETED', 'DELIVERED', 'POD_VERIFIED'].includes(l.status)).length} 
          icon={CheckCircle2} 
          color="emerald" 
        />
        <StatCard 
          title="Total Brokered Loads" 
          value={assignedLoads.length} 
          icon={Package} 
          color="indigo" 
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2.5 bg-slate-100 p-1.5 rounded-xl max-w-sm shrink-0 border border-slate-200">
        <button
          onClick={() => setActiveTab('TRANSPORT')}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'TRANSPORT'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Transport
        </button>
        <button
          onClick={() => setActiveTab('PLANT')}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'PLANT'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Plant Hire
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium">
            <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
            Loading assigned bookings...
          </div>
        ) : (() => {
          const filteredLoads = assignedLoads.filter(load => {
            if (activeTab === 'PLANT') {
              return load.cargo_category === 'Plant Hire';
            } else {
              return load.cargo_category !== 'Plant Hire';
            }
          });

          if (filteredLoads.length === 0) {
            return (
              <div className="p-16 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-1.5 bg-white">
                <Package className="h-8 w-8 text-slate-350" />
                <span>No {activeTab === 'PLANT' ? 'plant hire' : 'transport'} bookings found.</span>
              </div>
            );
          }

          return (
            <Table headers={['Booking Info', 'Assigned Transporter / Operator', 'Transit State', 'Date Created', 'Details']}>
              {filteredLoads.map((load) => {
                const transporterName = load.assignment?.driver?.user?.first_name 
                  ? `${load.assignment.driver.user.first_name} ${load.assignment.driver.user.last_name || ''}` 
                  : load.assignment?.fleet_owner?.company_name 
                  ? load.assignment.fleet_owner.company_name
                  : load.assignment?.plant_owner?.company_name
                  ? load.assignment.plant_owner.company_name
                  : null;
                
                return (
                  <tr key={load.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        {load.cargo_category === 'Plant Hire' ? (
                          <div className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[240px]">
                            {load.pickup_address?.split(',')[0]}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 font-bold text-slate-800 text-xs sm:text-sm">
                            <span className="truncate max-w-[120px]">{load.pickup_address?.split(',')[0]}</span>
                            <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{load.delivery_address?.split(',')[0]}</span>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 font-mono">ID: {load.id.split('-')[0].toUpperCase()}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {transporterName ? (
                        <div className="flex items-center gap-1.5">
                          {load.assignment?.plant_owner_id ? (
                            <Building className="h-3.5 w-3.5 text-purple-500" />
                          ) : load.assignment?.fleet_owner_id ? (
                            <Building className="h-3.5 w-3.5 text-indigo-500" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          <span className="text-slate-800">{transporterName}</span>
                        </div>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] uppercase font-black bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          Awaiting Partner Dispatch
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(load.status)}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400 font-medium">
                      {new Date(load.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-left">
                      <button 
                        onClick={() => handleViewClick(load)}
                        className="h-8 w-8 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-slate-500 hover:text-amber-600 flex items-center justify-center transition-all cursor-pointer" 
                        title="View Details"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          );
        })()}
      </div>

      {/* View Details / Dispatch Modal */}
      {viewModalOpen && selectedLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg relative overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-900">Booking Management</h2>
                <p className="text-xs text-slate-500 font-semibold font-sans mt-0.5">
                  {selectedLoad.cargo_category === 'Plant Hire' 
                    ? `Site Location: ${selectedLoad.pickup_address?.split(',')[0]}` 
                    : `Route: ${selectedLoad.pickup_address?.split(',')[0]} → ${selectedLoad.delivery_address?.split(',')[0]}`
                  }
                </p>
              </div>
              <button 
                onClick={() => setViewModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-650 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Transit State Indicator */}
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-600">Current Transit State:</span>
                {getStatusBadge(selectedLoad.status)}
              </div>

              {/* Map */}
              <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200">
                <LoadAfricaMap
                  pickupCoords={{ lat: selectedLoad.pickup_coords_lat, lng: selectedLoad.pickup_coords_lng }}
                  deliveryCoords={selectedLoad.cargo_category === 'Plant Hire' ? null : { lat: selectedLoad.delivery_coords_lat, lng: selectedLoad.delivery_coords_lng }}
                  currentCoords={selectedLoad.current_latitude ? { lat: selectedLoad.current_latitude, lng: selectedLoad.current_longitude } : null}
                  routePolyline={selectedLoad.cargo_category === 'Plant Hire' ? null : selectedLoad.route_polyline}
                  heading={selectedLoad.telemetry?.heading || 0}
                  status={selectedLoad.status}
                  height="100%"
                />
              </div>

              {/* Addresses details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Logistics Locations</h4>
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                  {selectedLoad.cargo_category === 'Plant Hire' ? (
                    <div className="flex gap-3 relative z-10">
                      <div className="h-5 w-5 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-[9px] shrink-0">S</div>
                      <div>
                        <p className="font-black text-slate-900">Site Location Address</p>
                        <p className="text-slate-600 mt-0.5 font-medium">{selectedLoad.pickup_address}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-sans font-semibold">Preferred Start Date: {new Date(selectedLoad.pickup_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute left-6.5 top-8 bottom-8 w-0.5 bg-dashed border-l border-slate-350" />
                      
                      <div className="flex gap-3 relative z-10">
                        <div className="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-[9px] shrink-0">A</div>
                        <div>
                          <p className="font-black text-slate-900">Pickup Address</p>
                          <p className="text-slate-600 mt-0.5 font-medium">{selectedLoad.pickup_address}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-sans font-semibold">Date: {new Date(selectedLoad.pickup_date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 relative z-10">
                        <div className="h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-[9px] shrink-0">B</div>
                        <div>
                          <p className="font-black text-slate-900">Delivery Address</p>
                          <p className="text-slate-600 mt-0.5 font-medium">{selectedLoad.delivery_address}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-sans font-semibold">Date: {new Date(selectedLoad.delivery_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Cargo Details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cargo & Capacity Info</h4>
                {selectedLoad.cargo_category === 'Plant Hire' ? (
                  (() => {
                    let plantDetails = {};
                    if (selectedLoad.description) {
                      try {
                        plantDetails = JSON.parse(selectedLoad.description);
                      } catch (e) {
                        plantDetails = {
                          machineType: selectedLoad.requested_vehicle || 'Machine',
                          machineCategory: 'Plant',
                          durationValue: '',
                          durationUnit: ''
                        };
                      }
                    }
                    return (
                      <div className="grid grid-cols-3 gap-4 p-4 border border-slate-100 rounded-xl bg-white">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Machine Type</span>
                          <span className="text-slate-900 font-bold text-sm">{plantDetails.machineType || selectedLoad.requested_vehicle}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Category</span>
                          <span className="text-slate-900 font-bold text-sm">{plantDetails.machineCategory || 'Plant'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                          <span className="text-slate-900 font-bold text-sm">{plantDetails.durationValue} {plantDetails.durationUnit}</span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="grid grid-cols-2 gap-4 p-4 border border-slate-100 rounded-xl bg-white">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Cargo Material</span>
                      <span className="text-slate-900 font-bold text-sm">{selectedLoad.cargo_name}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Weight</span>
                      <span className="text-slate-900 font-bold text-sm">{selectedLoad.weight?.toLocaleString()} kg</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Proof of Delivery (POD) Section */}
              {selectedLoad.status === 'POD_UPLOADED' && (
                <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900 text-xs">Proof of Delivery (POD) uploaded</p>
                      <p className="text-[10px] text-amber-700 mt-0.5 font-medium font-sans">The driver has completed delivery. Please verify the uploaded document before confirmation.</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        setAssigning(true);
                        const res = await bookingService.updateBookingStatus(selectedLoad.id, 'POD_VERIFIED', 'Broker verified uploaded Proof of Delivery (POD).');
                        if (res.success) {
                          setViewModalOpen(false);
                          fetchAssignedLoads();
                          alert('Proof of Delivery verified and invoice scheduled');
                        }
                      } catch (err) {
                        alert(err.message || 'Failed to verify POD');
                      } finally {
                        setAssigning(false);
                      }
                    }}
                    disabled={assigning}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs tracking-wider rounded-xl uppercase transition-colors flex items-center justify-center gap-1.5"
                  >
                    {assigning ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Verify Proof of Delivery (POD)
                  </button>
                </div>
              )}              {/* Transporter Dispatch Control Box */}
              {(!selectedLoad.assignment || (!selectedLoad.assignment.driver && !selectedLoad.assignment.fleet_owner && !selectedLoad.assignment.plant_owner) || selectedLoad.assignment.status === 'PENDING') ? (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Transporter Dispatch Allocation</h4>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {selectedLoad.cargo_category === 'Plant Hire' ? (
                      <div className="flex border-b border-slate-200 bg-slate-50">
                        <button type="button" className="flex-1 py-3 text-xs font-black uppercase tracking-wider bg-white text-amber-600 border-b-2 border-amber-500">
                          Option A: Plant Owner / Supplier Company
                        </button>
                      </div>
                    ) : (
                      /* Partner Type Selector Tab Buttons */
                      <div className="flex border-b border-slate-200 bg-slate-50">
                        <button 
                          type="button"
                          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${partnerType === 'FLEET' ? 'bg-white text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'}`}
                          onClick={() => { setPartnerType('FLEET'); setSelectedPartnerId(''); }}
                        >
                          Option A: Fleet Owner
                        </button>
                        <button 
                          type="button"
                          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${partnerType === 'DRIVER' ? 'bg-white text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'}`}
                          onClick={() => { setPartnerType('DRIVER'); setSelectedPartnerId(''); }}
                        >
                          Option B: Independent Driver
                        </button>
                      </div>
                    )}

                    {/* Dispatch inputs area */}
                    <div className="p-4 space-y-4 bg-white">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Select Approved {selectedLoad.cargo_category === 'Plant Hire' ? 'Plant Supplier Company' : partnerType === 'FLEET' ? 'Fleet Transporter' : 'Independent Driver'} *
                        </label>
                        <select
                          required
                          value={selectedPartnerId}
                          onChange={(e) => setSelectedPartnerId(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 shadow-sm"
                        >
                          <option value="">-- Click to choose partner --</option>
                          {selectedLoad.cargo_category === 'Plant Hire' ? (
                            plantOwners.map(p => (
                              <option key={p.plant_owner?.id} value={p.plant_owner?.id}>
                                {p.plant_owner?.company_name || `${p.first_name} ${p.last_name}`}
                              </option>
                            ))
                          ) : partnerType === 'FLEET' ? (
                            fleets.map(f => (
                              <option key={f.fleet_owner?.id} value={f.fleet_owner?.id}>
                                {f.fleet_owner?.company_name || `${f.first_name} ${f.last_name}`}
                              </option>
                            ))
                          ) : (
                            drivers.map(d => {
                              const vehicleType = d.driver?.vehicle_relation?.vehicle_type || d.driver?.assigned_vehicle?.type || 'Unspecified vehicle';
                              return (
                                <option key={d.driver?.id} value={d.driver?.id}>
                                  {d.first_name} {d.last_name} — ({vehicleType})
                                </option>
                              );
                            })
                          )}
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={!selectedPartnerId || assigning}
                        onClick={handleAssign}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1"
                      >
                        {assigning ? (
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Confirm Dispatch Assignment
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Assigned Operator Details view */
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Allocated Operator Info</h4>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-4">
                    <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                      {selectedLoad.assignment.plant_owner_id ? (
                        <Building className="h-5 w-5 text-purple-500" />
                      ) : selectedLoad.assignment.fleet_owner_id ? (
                        <Building className="h-5 w-5 text-indigo-500" />
                      ) : (
                        <User className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">
                        {selectedLoad.assignment.driver?.user?.first_name 
                          ? `${selectedLoad.assignment.driver.user.first_name} ${selectedLoad.assignment.driver.user.last_name || ''}`
                          : selectedLoad.assignment.plant_owner?.company_name 
                          ? selectedLoad.assignment.plant_owner.company_name
                          : selectedLoad.assignment.fleet_owner?.company_name || 'Fleet operator'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Type: {selectedLoad.assignment.plant_owner_id ? 'Plant supplier dispatch' : selectedLoad.assignment.fleet_owner_id ? 'Fleet dispatch' : 'Independent Driver'}
                      </p>
                      {selectedLoad.assignment.driver?.user?.phone && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 font-sans mt-0.5">
                          <Phone className="h-3 w-3" /> {selectedLoad.assignment.driver.user.phone}
                        </p>
                      )}
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
