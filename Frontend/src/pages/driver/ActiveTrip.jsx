import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Navigation, Compass, AlertCircle, Play, 
  CheckCircle, Truck, Info, Phone, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';

export default function ActiveTrip() {
  const navigate = useNavigate();
  const [activeBooking, setActiveBooking] = useState(null);
  const [load, setLoad] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [tripState, setTripState] = useState('assigned'); // 'assigned', 'started', 'completed'
  const [simProgress, setSimProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bookings = getMockData('bookings') || [];
    // Sipho's active booking (driverId drv-1)
    const active = bookings.find(b => b.driverId === 'drv-1' && (b.bookingStatus === 'assigned' || b.bookingStatus === 'in_transit'));
    
    if (active) {
      setActiveBooking(active);
      setTripState(active.bookingStatus);
      
      const loads = getMockData('loads') || [];
      const ld = loads.find(l => l.id === active.loadId);
      setLoad(ld);

      const users = getMockData('users') || [];
      const cust = users.find(u => u.id === active.customerId);
      setCustomer(cust);

      if (active.bookingStatus === 'in_transit') {
        setSimProgress(45);
      }
    }
  }, []);

  // Map route simulation
  useEffect(() => {
    if (tripState === 'in_transit') {
      const timer = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 95) return 95;
          return prev + 2;
        });
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [tripState]);

  const handleStartTrip = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTripState('in_transit');
      setSimProgress(10);
      
      // Update booking status in local storage
      const bookings = getMockData('bookings') || [];
      const index = bookings.findIndex(b => b.id === activeBooking.id);
      if (index > -1) {
        bookings[index].bookingStatus = 'in_transit';
        saveMockData('bookings', bookings);
      }

      // Update load status
      const loads = getMockData('loads') || [];
      const loadIndex = loads.findIndex(l => l.id === activeBooking.loadId);
      if (loadIndex > -1) {
        loads[loadIndex].status = 'in_transit';
        saveMockData('loads', loads);
      }

      // Add customer notification
      const notifications = getMockData('notifications');
      notifications.customer.unshift({
        id: `nt-c-${Math.random()}`,
        title: 'Trip In Transit',
        message: `Driver Sipho Zuma has started transport of "${load.title}" to destination.`,
        read: false,
        time: 'Just now',
        type: 'info'
      });
      saveMockData('notifications', notifications);
    }, 1000);
  };

  const handleCompleteTrip = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTripState('completed');
      setSimProgress(100);

      // Update booking status
      const bookings = getMockData('bookings') || [];
      const index = bookings.findIndex(b => b.id === activeBooking.id);
      if (index > -1) {
        bookings[index].bookingStatus = 'completed';
        saveMockData('bookings', bookings);
      }

      // Update load status
      const loads = getMockData('loads') || [];
      const loadIndex = loads.findIndex(l => l.id === activeBooking.loadId);
      if (loadIndex > -1) {
        loads[loadIndex].status = 'completed';
        saveMockData('loads', loads);
      }

      // Add to driver earnings
      const drivers = getMockData('drivers') || [];
      const driverIndex = drivers.findIndex(d => d.id === 'drv-1');
      if (driverIndex > -1) {
        drivers[driverIndex].trips += 1;
        drivers[driverIndex].earnings += activeBooking.price;
        drivers[driverIndex].walletBalance += activeBooking.price;
        saveMockData('drivers', drivers);
      }

      // Record transaction
      const payments = getMockData('payments') || [];
      payments.unshift({
        id: `tx-${Math.floor(2000 + Math.random() * 9000)}`,
        bookingId: activeBooking.id,
        amount: activeBooking.price,
        status: 'completed',
        method: 'Escrow Release',
        date: new Date().toISOString().split('T')[0],
        customerName: customer.name,
        driverName: 'Sipho Zuma'
      });
      saveMockData('payments', payments);

      // Add customer notification
      const notifications = getMockData('notifications');
      notifications.customer.unshift({
        id: `nt-c-${Math.random()}`,
        title: 'Delivery Complete',
        message: `Your cargo "${load.title}" has been successfully delivered and payment released.`,
        read: false,
        time: 'Just now',
        type: 'success'
      });
      // Add driver notification
      notifications.driver.unshift({
        id: `nt-d-${Math.random()}`,
        title: 'Payment Received',
        message: `Payout of $${activeBooking.price} for load ${load.id} has been credited to your wallet.`,
        read: false,
        time: 'Just now',
        type: 'success'
      });
      saveMockData('notifications', notifications);
    }, 1500);
  };

  if (!activeBooking || !load || !customer) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
        <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-500 rounded-full">
          <Truck className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No Active Trips Assigned</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          You are currently off-duty or don't have any cargo loads assigned. Visit the Available Loads dashboard to find contracts.
        </p>
        <button 
          onClick={() => navigate('/driver/dashboard')}
          className="mt-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          Check Available Loads
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      
      {/* Visual Navigation Display (Left 2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-500 animate-spin" />
              <span className="font-bold text-sm">GPS Navigation Stream</span>
            </div>
            
            {tripState === 'assigned' && (
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase">Awaiting Departure</span>
            )}
            {tripState === 'in_transit' && (
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase animate-pulse">Routing Active</span>
            )}
            {tripState === 'completed' && (
              <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 uppercase">Delivered</span>
            )}
          </div>

          {/* Interactive Simulated Map */}
          <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:30px_30px]" />
            
            {tripState === 'completed' ? (
              <div className="relative z-10 text-center space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 max-w-sm backdrop-blur">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-white text-base">Cargo Successfully Delivered!</h4>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  The shipper has released your funds. Check Earnings to request withdrawal to bank or mobile wallet.
                </p>
                <button 
                  onClick={() => navigate('/driver/dashboard')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <svg className="w-full h-full relative z-10" viewBox="0 0 500 300">
                {/* Route Vector line */}
                <circle cx="100" cy="150" r="8" className="fill-amber-500 stroke-amber-500/40 stroke-[6px]" />
                <circle cx="400" cy="150" r="8" className="fill-indigo-500 stroke-indigo-500/40 stroke-[6px]" />
                <path d="M 100 150 Q 250 80 400 150" fill="none" stroke="#1e293b" strokeWidth="4" />
                
                {tripState === 'in_transit' && (
                  <>
                    <path 
                      d="M 100 150 Q 250 80 400 150" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="4" 
                      strokeDasharray="500" 
                      strokeDashoffset={500 - (500 * (simProgress / 100))}
                    />
                    {(() => {
                      const t = simProgress / 100;
                      const x = (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * 250 + t * t * 400;
                      const y = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * 80 + t * t * 150;
                      return (
                        <g transform={`translate(${x - 12}, ${y - 12})`}>
                          <circle cx="12" cy="12" r="14" className="fill-emerald-500/25 stroke-emerald-500/40 animate-ping" />
                          <rect x="5" y="7" width="14" height="10" rx="1.5" className="fill-emerald-500" />
                        </g>
                      );
                    })()}
                  </>
                )}
              </svg>
            )}

            {/* GPS Telemetry reading */}
            {tripState === 'in_transit' && (
              <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-[10px] text-slate-300 font-mono space-y-1 backdrop-blur z-20">
                <p className="font-semibold text-white">CORRIDOR COORDINATES</p>
                <div className="grid grid-cols-2 gap-x-3">
                  <span>HEADING:</span>
                  <span className="text-emerald-400">North-East</span>
                  <span>VELOCITY:</span>
                  <span className="text-white">65 km/h</span>
                  <span>GPS SYNC:</span>
                  <span className="text-emerald-400">Stable</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Operational Guidelines alerts */}
        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-800">Escrow Security Protocols</p>
            <p className="text-slate-500 font-light leading-relaxed">
              Keep your GPS active at all check nodes on the Ewekoro-Ikeja tollway. Turning off tracking may hold payment release audits.
            </p>
          </div>
        </div>
      </div>

      {/* Control Actions & Cargo Info Panel (Right 1 col) */}
      <div className="space-y-6">
        
        {/* Navigation Actions Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Trip Actions</h3>

          {tripState === 'assigned' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs text-slate-500 leading-relaxed text-left">
                You have arrived at the pickup warehouse. Please inspect cement loading cargo slips before starting routing.
              </div>
              <button 
                onClick={handleStartTrip}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Trip & Broadcast GPS
                  </>
                )}
              </button>
            </div>
          )}

          {tripState === 'in_transit' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-xs text-slate-500 leading-relaxed text-left">
                Cargo is in transit. Drive safely. Upon reaching destination, submit delivery proof to receive wallet payout.
              </div>
              <button 
                onClick={handleCompleteTrip}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Confirm Delivery (Release Escrow)
                  </>
                )}
              </button>
            </div>
          )}

          {tripState === 'completed' && (
            <div className="p-4 bg-slate-50 text-slate-500 text-xs rounded-xl border border-slate-100">
              Trip completed successfully. Funding released.
            </div>
          )}
        </div>

        {/* Cargo Booking Specs */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Shipper Details</h3>

          <div className="flex items-center gap-3">
            <img 
              src={customer.avatar} 
              alt={customer.name} 
              className="h-12 w-12 rounded-full border border-slate-100 object-cover"
            />
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-800 text-sm">{customer.name}</h4>
              <span className="block text-[10px] text-slate-400 font-medium">{customer.company}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">PICKUP</span>
              <p className="text-slate-600 font-semibold">{load.pickup}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">DROPOFF</span>
              <p className="text-slate-600 font-semibold">{load.dropoff}</p>
            </div>
            
            <div className="border-t border-slate-100 pt-4 flex justify-between">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">CARGO WEIGHT</span>
                <span className="font-bold text-slate-800 text-xs block mt-0.5">{load.weight}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">YOUR PAYOUT</span>
                <span className="font-bold text-emerald-600 text-xs block mt-0.5">R{activeBooking.price}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
