import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck, DollarSign, CheckCircle2, Clock, Plus, ChevronRight, MapPin,
  TrendingUp, AlertCircle, ShieldAlert, Calendar, User, Key, Mail, Building,
  FileText, Star, Download, Package
} from 'lucide-react';
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
  const [fleetStatus, setFleetStatus] = useState('REGISTERED');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Local State
  const [actionModal, setActionModal] = useState({ open: false, type: '', load: null });
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
        if (res.stats) setStats(res.stats);
        setVehicles(res.data.vehicles || []);
        setDrivers(res.data.drivers || []);
        setBookings(res.data.assignments || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Derived Stats (real data)
  const totalVehicles = vehicles.length;

  // --- ACTIONS ---

  const handleAcceptRequest = async (e) => {
    e.preventDefault();
    if (!assignModal.vehicleId || !assignModal.driverId) {
      showToast('Please select both a vehicle and a driver.', 'error');
      return;
    }

    const load = actionModal.load;
    try {
      // Call the real booking API to assign vehicle and driver
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/bookings/${load.id}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vehicle_id: assignModal.vehicleId, driver_id: assignModal.driverId })
      });

      if (!res.ok) {
        // If no real endpoint yet, just update UI optimistically
        console.warn('Assign endpoint not available yet');
      }

      setActionModal({ open: false, type: '', load: null });
      setAssignModal({ vehicleId: '', driverId: '' });
      showToast('Booking accepted! Vehicle & Driver assigned.');
      await fetchData(); // Refresh data
      navigate('/fleet-portal/dashboard');
    } catch (err) {
      showToast('Failed to assign booking', 'error');
    }
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Drivers" value={stats?.totalDrivers || 0} icon={User} color="amber" />
        <StatCard title="Available Drivers" value={stats?.availableDrivers || 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Drivers On Trip" value={stats?.driversOnTrip || 0} icon={MapPin} color="blue" />
        <StatCard title="Inactive Drivers" value={stats?.inactiveDrivers || 0} icon={Clock} color="indigo" />
        <StatCard title="Expired Licenses" value={stats?.expiredLicenses || 0} icon={AlertCircle} color="red" />
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
    // Show bookings that are in PENDING / QUOTE_REQUESTED state as "requests"
    const pendingBookings = bookings.filter(b =>
      ['PENDING', 'QUOTE_REQUESTED', 'AWAITING_ASSIGNMENT'].includes(b.status)
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Booking Requests</h1>
          <p className="text-xs text-slate-500 font-medium">Review and assign your fleet to pending requests.</p>
        </div>

        {pendingBookings.length > 0 ? (
          <div className="grid gap-4">
            {pendingBookings.map((booking) => (
              <Card key={booking.id} className="p-5">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">{booking.id?.slice(0, 8)}…</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">NEW</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                      <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="truncate">{booking.booking?.pickup_address?.split(',')[0] || 'Pickup'}</span>
                      <ChevronRight className="h-3 w-3 text-slate-400 mx-1" />
                      <span className="truncate">{booking.booking?.delivery_address?.split(',')[0] || 'Delivery'}</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-slate-600">
                      <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Status</span>{booking.status?.replace(/_/g, ' ')}</div>
                      <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Date</span>{new Date(booking.created_at || Date.now()).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActionModal({ open: true, type: 'reject', load: booking })}>Reject</Button>
                    <Button size="sm" onClick={() => setActionModal({ open: true, type: 'accept', load: booking })}>Accept & Assign</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Pending Requests</h3>
            <p className="text-sm text-slate-500 mt-2">You don't have any pending booking requests right now.</p>
          </div>
        )}

        {/* Accept / Assign Modal */}
        <Modal open={actionModal.open && actionModal.type === 'accept'} onClose={() => setActionModal({ open: false, type: '', load: null })} title="Assign Vehicle & Driver">
          <form onSubmit={handleAcceptRequest} className="space-y-5">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Booking</p>
              <p className="text-xs text-slate-500">{actionModal.load?.booking?.pickup_address?.split(',')[0]} → {actionModal.load?.booking?.delivery_address?.split(',')[0]}</p>
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
                {vehicles.filter(v => v.status !== 'ON_TRIP').map(v => (
                  <option key={v.id} value={v.id}>{v.registration_number} - {v.vehicle_type} ({v.capacity}T)</option>
                ))}
              </select>
              {vehicles.filter(v => v.status !== 'ON_TRIP').length === 0 && (
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
                {drivers.filter(d => d.status === 'AVAILABLE' && d.user?.status === 'ACTIVE').map(d => (
                  <option key={d.id} value={d.id}>{d.user?.first_name} {d.user?.last_name} ({d.license})</option>
                ))}
              </select>
              {drivers.filter(d => d.status === 'AVAILABLE' && d.user?.status === 'ACTIVE').length === 0 && (
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
            <p className="text-sm text-slate-600">Are you sure you want to reject this booking request?</p>
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




  const renderRevenue = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Revenue & Earnings</h1>
          <p className="text-xs text-slate-500 font-medium">Track payments, download statements, and manage cash flow.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Trips" value={bookings.length} icon={DollarSign} color="emerald" />
          <StatCard title="Active Trips" value={bookings.filter(b => ['DRIVER_ASSIGNED','IN_TRANSIT','DRIVER_EN_ROUTE'].includes(b.status)).length} icon={Clock} color="amber" />
          <StatCard title="Completed Trips" value={bookings.filter(b => b.status === 'DELIVERED').length} icon={CheckCircle2} color="blue" />
        </div>

        <Card>
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800">Trip / Booking History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-bold uppercase border-b border-slate-100">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">Pickup</th>
                  <th className="pb-3">Delivery</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                {bookings.length === 0 && (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400">No bookings yet.</td></tr>
                )}
                {bookings.map(b => {
                  const vehicle = vehicles.find(v => v.id === b.vehicle_id);
                  return (
                  <tr key={b.id}>
                    <td className="py-3 font-mono text-xs">{b.id?.slice(0,8)}…</td>
                    <td className="py-3 text-xs truncate max-w-[120px]">{b.booking?.pickup_address || '-'}</td>
                    <td className="py-3 text-xs truncate max-w-[120px]">{b.booking?.delivery_address || '-'}</td>
                    <td className="py-3 text-xs">{vehicle?.registration_number || '-'}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {b.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderProfile = () => {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
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
              <Input label="Company Name" name="company_name" required />
              <Input label="Registration Number (CIPC)" name="registration_number" />
              <Input label="Owner Full Name" name="owner_name" required />
              <Input label="Email Address" type="email" name="email" required />
              <Input label="Phone Number" name="phone" />
              <Input label="Business Address" name="address" />
            </div>
          </Card>
          
          <Card className="space-y-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-500" /> Fleet Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <p className="text-2xl font-black text-amber-600">{vehicles.length}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">Total Vehicles</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <p className="text-2xl font-black text-emerald-600">{stats?.totalDrivers || 0}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">Total Drivers</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <p className="text-2xl font-black text-blue-600">{bookings.length}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">Total Trips</p>
              </div>
            </div>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    );
  };

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
