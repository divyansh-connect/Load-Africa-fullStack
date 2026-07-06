import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, Scale, DollarSign, Calendar, 
  User, CheckCircle2, ChevronRight, AlertCircle, Compass, Truck
} from 'lucide-react';
import { getMockData } from '../../data/mockData';
import { Card, Badge, Button } from '../../components/ui';

export default function BookingDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(null);
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id') || 'ld-101';
    const allLoads = getMockData('loads') || [];
    const ld = allLoads.find(l => l.id === id);
    
    if (ld) {
      setLoad(ld);
      if (ld.driverId) {
        const drivers = getMockData('drivers') || [];
        setDriver(drivers.find(d => d.id === ld.driverId));
      }
    }
  }, [location]);

  if (!load) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Details</h2>
          <p className="text-xs text-slate-400">Escrow verification details on cargo transaction {load.id}.</p>
        </div>
        <Badge status={load.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Cargo summary */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500"><Package className="h-5 w-5" /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{load.title}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{load.id}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PICKUP</span>
                  <p className="text-slate-700 font-semibold leading-relaxed">{load.pickup}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">DELIVERY DROPOFF</span>
                  <p className="text-slate-700 font-semibold leading-relaxed">{load.dropoff}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Weight</span>
                <span className="font-bold text-slate-800 block mt-0.5">{load.weight}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Category</span>
                <span className="font-bold text-slate-800 block mt-0.5">{load.category}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Dispatch Fee</span>
                <span className="font-bold text-slate-800 block mt-0.5">R{load.budget}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Allocated transporter specs */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Transporter Allocation</h3>
            
            {driver ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={driver.avatar} alt={driver.name} className="h-10 w-10 rounded-full object-cover border border-slate-100" />
                  <div>
                    <p className="font-bold text-slate-800">{driver.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">Verified Driver</span>
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  <p className="text-slate-500 font-light">Phone: <span className="font-semibold text-slate-800">{driver.phone}</span></p>
                  <p className="text-slate-500 font-light">Trips: <span className="font-semibold text-slate-800">{driver.trips} completed</span></p>
                </div>
                {load.status === 'in_transit' && (
                  <Button 
                    onClick={() => navigate('/customer/tracking')}
                    className="w-full mt-2"
                  >
                    Track Live Position
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-center py-4 text-xs">
                <Truck className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-500">Matching Transporter</p>
                <p className="text-slate-400 font-light leading-relaxed">Broadcasted to nearby carriers matching vehicle type.</p>
              </div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
}
