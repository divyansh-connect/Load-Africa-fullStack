import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck, DollarSign, CheckCircle2, Clock, Plus, ChevronRight, MapPin, ArrowRight,
  TrendingUp, AlertCircle, Trash2, Edit2, ShieldAlert, Calendar, User, Key, Mail, Building,
  FileText, Star, X, Download
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';
import { Modal, Button, Input, Card, Table, StatCard } from '../../components/ui';
import { fleetService } from '../../services/fleetService';

export default function FleetDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Global State
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loads, setLoads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [fleetStatus, setFleetStatus] = useState('REGISTERED');
  const [loading, setLoading] = useState(true);

  // Local State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: '', load: null }); // type: 'accept', 'reject'
  const [assignModal, setAssignModal] = useState({ vehicleId: '', driverId: '' });
  const [rejectReason, setRejectReason] = useState('');
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fleetService.getDashboard();
      if (res.success && res.data) {
        setFleetStatus(res.data.status);
      }
    } catch (err) {
      console.error(err);
    }
    
    setVehicles(getMockData('vehicles') || []);
    setDrivers(getMockData('drivers') || []);
    setBookings(getMockData('bookings') || []);
    setLoads(getMockData('loads') || []);
    setPayments(getMockData('payments') || []);
    setLoading(false);
  };

  // Derived Stats
  const totalVehicles = vehicles.length;
  const onTripVehicles = vehicles.filter(v => v.status === 'on_trip' || v.status === 'active').length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const pendingRequests = loads.filter(l => l.status === 'available' || l.status === 'quote_requested').length;
  
  const monthlyRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  // --- ACTIONS ---

  const handleAcceptRequest = (e) => {
    e.preventDefault();
    if (!assignModal.vehicleId || !assignModal.driverId) {
      showToast('Please select both a vehicle and a driver.', 'error');
      return;
    }

    const load = actionModal.load;
    
    // Create new booking
    const newBookingId = `bk-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: newBookingId,
      loadId: load.id,
      customerId: load.customerId || 'cust-unknown',
      driverId: assignModal.driverId,
      vehicleId: assignModal.vehicleId,
      price: load.budget,
      paymentStatus: 'pending',
      bookingStatus: 'assigned',
      date: new Date().toISOString(),
      tracking: { currentLat: -26.2, currentLng: 28.0, status: 'Driver Assigned', lastUpdate: 'Just now' }
    };

    // Update global state
    const updatedBookings = [newBooking, ...bookings];
    saveMockData('bookings', updatedBookings);
    setBookings(updatedBookings);

    const updatedLoads = loads.map(l => l.id === load.id ? { ...l, status: 'assigned' } : l);
    saveMockData('loads', updatedLoads);
    setLoads(updatedLoads);

    const updatedVehicles = vehicles.map(v => v.id === assignModal.vehicleId ? { ...v, status: 'on_trip', driverId: assignModal.driverId } : v);
    saveMockData('vehicles', updatedVehicles);
    setVehicles(updatedVehicles);

    const updatedDrivers = drivers.map(d => d.id === assignModal.driverId ? { ...d, vehicleId: assignModal.vehicleId, status: 'on_trip' } : d);
    saveMockData('drivers', updatedDrivers);
    setDrivers(updatedDrivers);

    setActionModal({ open: false, type: '', load: null });
    showToast('Booking accepted! Vehicle & Driver assigned.');
    navigate('/fleet-portal/dashboard');
  };

  const handleRejectRequest = () => {
    setActionModal({ open: false, type: '', load: null });
    setRejectReason('');
    showToast('Booking request rejected.', 'error');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Fleet Command Center</h1>
        <p className="text-xs text-slate-500 font-medium">Real-time overview of your logistics operations.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Fleet" value={totalVehicles} icon={Truck} color="amber" />
        <StatCard title="On Trip" value={onTripVehicles} icon={MapPin} color="blue" />
        <StatCard title="Available" value={availableVehicles} icon={CheckCircle2} color="emerald" />
        <StatCard title="Pending Requests" value={pendingRequests} icon={Clock} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex justify-between items-center">
              <span>Active Trips</span>
              <button onClick={() => navigate('/fleet-portal/vehicles')} className="text-xs text-amber-600 hover:text-amber-700">View All</button>
            </h3>
            <div className="space-y-3">
              {bookings.filter(b => ['assigned', 'in_transit'].includes(b.bookingStatus)).map(trip => {
                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                const driver = drivers.find(d => d.id === trip.driverId);
                const load = loads.find(l => l.id === trip.loadId);
                if (!load) return null;
                return (
                  <div key={trip.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{vehicle?.numberPlate || 'Unknown Vehicle'}</p>
                        <p className="text-xs text-slate-500">{load.pickup.split(',')[0]} → {load.dropoff.split(',')[0]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                        {trip.bookingStatus.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{driver?.name}</p>
                    </div>
                  </div>
                );
              })}
              {bookings.filter(b => ['assigned', 'in_transit'].includes(b.bookingStatus)).length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm bg-slate-50 rounded-xl">No active trips currently.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Maintenance Alerts</h3>
            <div className="space-y-3">
              {vehicles.filter(v => v.status === 'maintenance').length > 0 ? (
                vehicles.filter(v => v.status === 'maintenance').map(v => (
                  <div key={v.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100/50">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{v.numberPlate}</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">Scheduled Maintenance</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">All vehicles are healthy.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => {
    const availableLoads = loads.filter(l => l.status === 'available' || l.status === 'quote_requested');
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Booking Requests</h1>
          <p className="text-xs text-slate-500 font-medium">Review and assign your fleet to pending requests.</p>
        </div>

        {availableLoads.length > 0 ? (
          <div className="grid gap-4">
            {availableLoads.map((load) => (
              <Card key={load.id} className="p-5">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{load.id}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">NEW</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                      <MapPin className="h-4 w-4 text-amber-500" />
                      <span className="truncate">{load.pickup.split(',')[0]}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400 mx-1" />
                      <span className="truncate">{load.dropoff.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-slate-600">
                      <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Cargo</span>{load.title} ({load.weight})</div>
                      <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Customer</span>{load.customerName}</div>
                      <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Date</span>{load.date}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 min-w-[120px]">
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Est. Revenue</span>
                      <span className="text-xl font-black text-emerald-600">R {load.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setActionModal({ open: true, type: 'reject', load })}>Reject</Button>
                      <Button size="sm" onClick={() => setActionModal({ open: true, type: 'accept', load })}>Accept & Assign</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Booking Requests</h3>
            <p className="text-sm text-slate-500 mt-2">You don't have any pending requests right now.</p>
          </div>
        )}

        {/* Accept / Assign Modal */}
        <Modal open={actionModal.open && actionModal.type === 'accept'} onClose={() => setActionModal({ open: false, type: '', load: null })} title="Assign Vehicle & Driver">
          <form onSubmit={handleAcceptRequest} className="space-y-5">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Load Details</p>
              <p className="text-sm font-bold text-slate-800">{actionModal.load?.title} ({actionModal.load?.weight})</p>
              <p className="text-xs text-slate-500">{actionModal.load?.pickup.split(',')[0]} → {actionModal.load?.dropoff.split(',')[0]}</p>
            </div>
            
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Available Vehicle</label>
              <select 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                value={assignModal.vehicleId}
                onChange={(e) => setAssignModal({...assignModal, vehicleId: e.target.value})}
              >
                <option value="">-- Choose Vehicle --</option>
                {vehicles.filter(v => v.status === 'available').map(v => (
                  <option key={v.id} value={v.id}>{v.numberPlate} - {v.type} ({v.capacity})</option>
                ))}
              </select>
              {vehicles.filter(v => v.status === 'available').length === 0 && (
                <p className="text-xs text-rose-500 font-bold mt-1">No available vehicles.</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Available Driver</label>
              <select 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                value={assignModal.driverId}
                onChange={(e) => setAssignModal({...assignModal, driverId: e.target.value})}
              >
                <option value="">-- Choose Driver --</option>
                {drivers.filter(d => d.status === 'active').map(d => (
                  <option key={d.id} value={d.id}>{d.name} (Rating: {d.rating}★)</option>
                ))}
              </select>
              {drivers.filter(d => d.status === 'active').length === 0 && (
                <p className="text-xs text-rose-500 font-bold mt-1">No available active drivers.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setActionModal({ open: false, type: '', load: null })}>Cancel</Button>
              <Button type="submit" disabled={!assignModal.vehicleId || !assignModal.driverId} className="bg-emerald-600 hover:bg-emerald-500 text-white">Confirm Assignment</Button>
            </div>
          </form>
        </Modal>

        {/* Reject Modal */}
        <Modal open={actionModal.open && actionModal.type === 'reject'} onClose={() => setActionModal({ open: false, type: '', load: null })} title="Reject Booking Request">
          <div className="space-y-5">
            <p className="text-sm text-slate-600">Are you sure you want to reject the booking for <span className="font-bold text-slate-800">{actionModal.load?.title}</span>?</p>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Reason (Optional)</label>
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500" 
                rows="3" 
                placeholder="e.g. No capacity on this date..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setActionModal({ open: false, type: '', load: null })}>Cancel</Button>
              <Button className="bg-rose-600 hover:bg-rose-500 text-white" onClick={handleRejectRequest}>Confirm Reject</Button>
            </div>
          </div>
        </Modal>

      </div>
    );
  };

  const renderVehicles = () => {
    if (selectedVehicle) {
      return renderVehicleDetails();
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">My Fleet</h1>
            <p className="text-xs text-slate-500 font-medium">Manage your vehicles, drivers, and documents.</p>
          </div>
          <Button onClick={() => navigate('/fleet-portal/add-vehicle')} className="gap-2">
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        </div>

        <Table headers={['Vehicle Info', 'Assigned Driver', 'Current Status', 'Actions']}>
          {vehicles.map((v) => {
            let driverName = 'Unassigned';
            if (v.driverId) {
              const driver = drivers.find(d => d.id === v.driverId);
              if (driver) driverName = driver.name;
            } else if (v.driverName) {
              driverName = v.driverName;
            }

            return (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedVehicle(v)}>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img src={v.image || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=80&auto=format&fit=crop&q=80'} alt="Truck" className="h-10 w-10 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{v.numberPlate}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{v.model} • {v.capacity}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User className="h-3 w-3 text-slate-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{driverName}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    v.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                    v.status === 'on_trip' || v.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    v.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {v.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedVehicle(v); }} className="text-amber-600">
                    Details
                  </Button>
                </td>
              </tr>
            );
          })}
        </Table>
      </div>
    );
  };

  const renderVehicleDetails = () => {
    const v = selectedVehicle;
    let driverName = 'Unassigned';
    if (v.driverId) {
      const driver = drivers.find(d => d.id === v.driverId);
      if (driver) driverName = driver.name;
    } else if (v.driverName) {
      driverName = v.driverName;
    }

    const currentBooking = bookings.find(b => b.vehicleId === v.id && ['assigned', 'in_transit'].includes(b.bookingStatus));
    const currentLoad = currentBooking ? loads.find(l => l.id === currentBooking.loadId) : null;

    return (
      <div className="space-y-6 animate-scaleIn">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedVehicle(null)} className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">{v.numberPlate} details</h1>
            <p className="text-xs text-slate-500 font-medium">Manage vehicle info, documents, and history.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden">
              <img src={v.image || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80'} alt="Truck" className="w-full h-48 object-cover" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{v.model}</h3>
                    <p className="text-sm text-slate-500">{v.type} • {v.capacity}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    v.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                    v.status === 'on_trip' || v.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    v.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {v.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Assigned Driver</span>
                    <span className="text-sm font-semibold text-slate-800">{driverName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">VIN Number</span>
                    <span className="text-sm font-mono text-slate-800">{v.vin || '1V4B3K1R2H...'}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" /> Compliance Documents
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Insurance</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Expires: 12 Jan 2027</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Registration (RC)</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Valid</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Road Permit</p>
                    <p className="text-[10px] text-amber-600 font-bold">Expires in 14 days</p>
                  </div>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Current Status & Trip</h3>
              {currentBooking ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ON TRIP</span>
                        <span className="text-[10px] font-bold bg-blue-200 text-blue-700 px-2 py-0.5 rounded">{currentBooking.id}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{currentLoad?.pickup.split(',')[0]} → {currentLoad?.dropoff.split(',')[0]}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Live Tracking</span>
                      <p className="text-xs font-semibold text-slate-800">{currentBooking.tracking?.status}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Updated {currentBooking.tracking?.lastUpdate}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Expected Revenue</span>
                      <p className="text-sm font-black text-emerald-600">R {currentBooking.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  <p className="text-sm font-semibold text-slate-700">Vehicle is currently Idle / Available.</p>
                  <p className="text-xs text-slate-500 mt-1">No active trip assigned.</p>
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Trip History</h3>
              <div className="space-y-3">
                {bookings.filter(b => b.vehicleId === v.id && b.bookingStatus === 'completed').map(trip => {
                  const load = loads.find(l => l.id === trip.loadId);
                  return (
                    <div key={trip.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{load?.pickup.split(',')[0]} → {load?.dropoff.split(',')[0]}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{trip.date} • {load?.title}</p>
                      </div>
                      <span className="text-xs font-black text-slate-800">R {trip.price.toLocaleString()}</span>
                    </div>
                  );
                })}
                {bookings.filter(b => b.vehicleId === v.id && b.bookingStatus === 'completed').length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No completed trips found for this vehicle.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderAddVehicle = () => {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-black text-slate-900">Add New Vehicle</h1>
          <p className="text-xs text-slate-500 font-medium">Expand your fleet capacity by adding a new vehicle to the system.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); showToast('Vehicle added successfully!'); navigate('/fleet-portal/vehicles'); }} className="space-y-5">
          <Card className="space-y-4 p-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="License Plate (Reg No)" placeholder="e.g. GP 12 ABC" required />
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Type</label>
                <select className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all">
                  <option>8-Ton Truck</option>
                  <option>Flatbed Truck</option>
                  <option>Tipper Truck</option>
                  <option>Box Truck</option>
                  <option>Refrigerated Truck</option>
                </select>
              </div>
              <Input label="Capacity (Tons)" type="number" placeholder="e.g. 15" required />
              <Input label="Brand / Make" placeholder="e.g. Scania" required />
              <Input label="Model & Year" placeholder="e.g. R500 2022" required />
              <Input label="VIN / Chassis Number" placeholder="Required for verification" required />
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Compliance & Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Insurance Expiry Date</label>
                <input type="date" className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" required />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Insurance Policy (PDF)</label>
                <input type="file" accept=".pdf" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Road Fitness Expiry</label>
                <input type="date" className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" required />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Registration / RC</label>
                <input type="file" accept=".pdf,.jpg,.png" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100" />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate('/fleet-portal/vehicles')}>Cancel</Button>
            <Button type="submit">Save & Register Vehicle</Button>
          </div>
        </form>
      </div>
    );
  };

  const renderRevenue = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Revenue & Earnings</h1>
          <p className="text-xs text-slate-500 font-medium">Track payments, download statements, and manage cash flow.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Revenue" value={`R ${monthlyRevenue.toLocaleString()}`} icon={DollarSign} color="emerald" />
          <StatCard title="Pending Payments" value="R 800" icon={Clock} color="amber" />
          <StatCard title="Completed Trips" value={payments.filter(p=>p.status==='completed').length} icon={CheckCircle2} color="blue" />
        </div>

        <Card>
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800">Transaction History</h3>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => showToast('Statement downloaded.', 'success')}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-bold uppercase border-b border-slate-100">
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Driver</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="py-3 font-mono text-xs">{p.id}</td>
                    <td className="py-3">{p.date}</td>
                    <td className="py-3">{p.customerName}</td>
                    <td className="py-3">{p.driverName}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">R {p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-black text-slate-900">Fleet Owner Profile</h1>
        <p className="text-xs text-slate-500 font-medium">Manage your company details and portal preferences.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); showToast('Profile updated successfully!'); }} className="space-y-6">
        <Card className="space-y-5">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="h-4 w-4 text-amber-500" /> Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Company Name" defaultValue="Motsepe Logistics" required />
            <Input label="Registration Number (CIPC)" defaultValue="2022/123456/07" required />
            <Input label="Owner Name" defaultValue="Patrice Motsepe" required />
            <Input label="Email Address" type="email" defaultValue="admin@motsepelogistics.co.za" required />
            <Input label="Phone Number" defaultValue="+27 82 111 2222" required />
            <Input label="Business Address" defaultValue="123 Sandton Drive, Sandton, 2196" required />
          </div>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-slate-500">Loading fleet data...</div>;

  if (fleetStatus !== 'ACTIVE' && path !== '/fleet-portal/profile') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
        <ShieldAlert className="h-16 w-16 text-amber-500 mb-6" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Account Not Active</h2>
        <p className="text-slate-600 max-w-md mb-8">
          Your Fleet Account is currently <span className="font-bold uppercase">{fleetStatus}</span>. You cannot participate in the marketplace or access operational modules until the LoadAfrica Compliance Team verifies and approves your company, vehicles, and drivers.
        </p>
        <Button onClick={() => navigate('/fleet-portal/compliance')} className="bg-amber-500 hover:bg-amber-600 text-white">
          View Compliance Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0 animate-fadeIn">
      {/* Dynamic Tab Rendering */}
      {path.endsWith('/dashboard') && renderDashboard()}
      {path.endsWith('/requests') && renderRequests()}
      {path.endsWith('/vehicles') && renderVehicles()}
      {path.endsWith('/add-vehicle') && renderAddVehicle()}
      {path.endsWith('/revenue') && renderRevenue()}
      {path.endsWith('/profile') && renderProfile()}

      {/* Global Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-slideUp border ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-rose-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          <p className="text-sm font-bold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
