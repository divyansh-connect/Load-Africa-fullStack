import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, User, Calendar, DollarSign, Loader2, UserCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchBooking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.getBookingById(id);
      if (res.success) {
        setBooking(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to fetch booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await adminService.getUsersByRole({ role: 'DRIVER', status: 'ACTIVE', limit: 50 });
      if (res.success) {
        setDrivers(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooking();
    fetchDrivers();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedDriver) return;
    try {
      setIsAssigning(true);
      const driver = drivers.find(d => d.id === selectedDriver);
      const res = await adminService.assignProvider(id, { driverId: driver.driver.id });
      if (res.success) {
        fetchBooking();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Failed to assign driver');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 text-amber-500 animate-spin" /></div>;
  }

  if (error || !booking) {
    return <div className="p-12 text-center text-red-500">{error || 'Booking not found'}</div>;
  }

  const assignment = booking.assignments && booking.assignments[0];
  let providerName = 'Unassigned';
  if (assignment) {
    if (assignment.driver) {
      providerName = `${assignment.driver.user.first_name || ''} ${assignment.driver.user.last_name || ''} (Driver)`;
    } else if (assignment.fleet_owner) {
      providerName = `${assignment.fleet_owner.company_name || assignment.fleet_owner.user.first_name} (Fleet)`;
    }
  }

  const grandTotal = booking.quotes && booking.quotes.length > 0 ? booking.quotes[0].grand_total : '0.00';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking Details: {booking.id.split('-')[0].substring(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-slate-500 font-medium">View full information for this booking</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" /> Customer Information
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Name:</span> {booking.customer?.company_name || `${booking.customer?.user?.first_name || 'Guest'} ${booking.customer?.user?.last_name || ''}`}</p>
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Contact:</span> {booking.customer?.user?.phone || booking.guest_phone || 'N/A'}</p>
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Email:</span> {booking.customer?.user?.email || booking.guest_email || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" /> Route Details
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1"><MapPin className="h-4 w-4 text-slate-400" /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Pickup Location</p>
                    <p className="text-sm font-medium text-slate-900">{booking.pickup_address}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1"><MapPin className="h-4 w-4 text-amber-500" /></div>
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase">Delivery Location</p>
                    <p className="text-sm font-medium text-slate-900">{booking.delivery_address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-400" /> Assignment Details
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Status:</span> 
                    <span className="text-sky-600 font-bold bg-sky-100 px-2 py-0.5 rounded ml-2">{booking.status.replace(/_/g, ' ')}</span>
                  </p>
                  <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Provider:</span> {providerName}</p>
                  <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Vehicle Req:</span> {booking.requested_vehicle || 'N/A'}</p>
                </div>
                
                {!assignment && (
                  <div className="pt-4 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-2">Assign Driver</label>
                    <div className="flex gap-2">
                      <select 
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Select a driver...</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleAssign}
                        disabled={!selectedDriver || isAssigning}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2"
                      >
                        {isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                        Assign
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-400" /> Pricing & Schedule
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Created:</span> {new Date(booking.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Pickup Date:</span> {new Date(booking.pickup_date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Delivery Date:</span> {new Date(booking.delivery_date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Cost:</span> R {grandTotal}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
