import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, Scale, DollarSign, Calendar, 
  User, CheckCircle2, Truck, FileText, Download, Building, Clock, Map
} from 'lucide-react';
import { getMockData } from '../../data/mockData';
import { Card, Badge, Button } from '../../components/ui';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [load, setLoad] = useState(null);
  const [driver, setDriver] = useState(null);

  // Use the ID from useParams, or fallback to ld-101 for demo purposes
  const bookingId = id || 'ld-101';

  useEffect(() => {
    const allLoads = getMockData('loads') || [];
    let ld = allLoads.find(l => l.id === bookingId);
    
    // If not found in mock data, create a mock one based on the ID for demo purposes
    if (!ld) {
      ld = {
        id: bookingId,
        title: '500 Bags of Cement',
        category: 'Building Materials',
        weight: '25 Tons',
        pickup: 'Johannesburg, Gauteng',
        dropoff: 'Cape Town, Western Cape',
        budget: 12000,
        status: 'in_transit',
        driverId: 'drv-1',
        date: '2024-06-12',
      };
    }

    setLoad(ld);
    if (ld.driverId) {
      const drivers = getMockData('drivers') || [];
      const foundDriver = drivers.find(d => d.id === ld.driverId);
      if (foundDriver) {
        setDriver(foundDriver);
      } else {
        // Mock driver if not found
        setDriver({
          name: 'Sipho Zuma',
          phone: '+27 82 123 4567',
          trips: 42,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          vehicle: { make: 'Scania', model: 'R500', reg: 'CA 123-456', type: '8-Ton Truck' }
        });
      }
    }
  }, [bookingId]);

  const handleDownload = (docName) => {
    alert(`Downloading ${docName} for ${load?.id}...`);
  };

  if (!load) return <div className="p-8 text-center text-slate-500">Loading booking details...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Details</h2>
          <p className="text-xs text-slate-400">Complete overview for {load.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={load.status} />
          {load.status === 'in_transit' && (
            <Button onClick={() => navigate('/customer/tracking')}>
              <Map className="h-4 w-4 mr-2" />
              Track Live
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Cargo, Route, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Route & Cargo Card */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500"><Package className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{load.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Cargo Name</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Weight</span>
                <span className="font-bold text-slate-800 text-sm">{load.weight}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4 text-sm relative">
              {/* Connecting line */}
              <div className="absolute left-2.5 top-6 bottom-4 w-0.5 bg-slate-100 -z-10" />
              
              <div className="flex items-start gap-4">
                <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PICKUP ADDRESS</span>
                  <p className="text-slate-700 font-semibold">{load.pickup}</p>
                  <p className="text-xs text-slate-500">Date: {load.date || 'Pending'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">DELIVERY ADDRESS</span>
                  <p className="text-slate-700 font-semibold">{load.dropoff}</p>
                  <p className="text-xs text-slate-500">ETA: {load.status === 'in_transit' ? '2h 30m remaining' : 'Pending'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline Card */}
          <Card className="p-6 space-y-6">
            <h3 className="font-bold text-slate-800 text-sm">Booking Timeline</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              
              {/* Node 1: Quote Requested */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-xs">Quote Requested</h4>
                    <span className="text-[9px] font-bold text-slate-400">{load.date || 'Pending'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">You successfully requested a quote for this booking.</p>
                </div>
              </div>

              {/* Node 2: Driver Assigned */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${['assigned', 'in_transit', 'completed', 'delivered'].includes(load.status) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  {['assigned', 'in_transit', 'completed', 'delivered'].includes(load.status) ? <CheckCircle2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-xs">Driver Assigned</h4>
                    <span className="text-[9px] font-bold text-slate-400">{['assigned', 'in_transit', 'completed', 'delivered'].includes(load.status) ? 'Updated' : 'Pending'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {['assigned', 'in_transit', 'completed', 'delivered'].includes(load.status) 
                      ? `Broker assigned ${driver?.name || 'a driver'} to this load.` 
                      : 'Waiting for broker to assign a driver.'}
                  </p>
                </div>
              </div>

              {/* Node 3: In Transit */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${['in_transit', 'completed', 'delivered'].includes(load.status) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  {['in_transit', 'completed', 'delivered'].includes(load.status) ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-xs">In Transit</h4>
                    <span className="text-[9px] font-bold text-slate-400">{['in_transit', 'completed', 'delivered'].includes(load.status) ? 'Updated' : 'Pending'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Cargo has been picked up and is en route.</p>
                </div>
              </div>

              {/* Node 4: Delivered */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${['completed', 'delivered'].includes(load.status) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  {['completed', 'delivered'].includes(load.status) ? <CheckCircle2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-xs">Delivered</h4>
                    <span className="text-[9px] font-bold text-slate-400">{['completed', 'delivered'].includes(load.status) ? 'Updated' : 'Pending'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Cargo delivered safely to destination.</p>
                </div>
              </div>

            </div>
          </Card>
        </div>

        {/* Right Column: Driver, Payment, Documents */}
        <div className="space-y-6">
          
          {/* Driver & Vehicle Details */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Assigned Transporter</h3>
            
            {driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img src={driver.avatar} alt={driver.name} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{driver.name}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driver • {driver.trips} Trips</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Vehicle</span>
                    <span className="text-slate-800 font-bold">{driver.vehicle?.make || 'Scania'} {driver.vehicle?.model || 'R500'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Type</span>
                    <span className="text-slate-800 font-bold">{driver.vehicle?.type || '8-Ton Truck'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Registration</span>
                    <span className="text-slate-800 font-bold">{driver.vehicle?.reg || 'CA 123-456'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Building className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Broker: Global Logistics</p>
                      <p className="text-slate-400 font-medium">Coordinator</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Truck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Driver assignment pending</p>
              </div>
            )}
          </Card>

          {/* Payment Summary */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Payment Summary</h3>
            
            <div className="space-y-3 text-xs border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Base Cost</span>
                <span className="text-slate-800 font-bold">R {load.budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Taxes (15% VAT)</span>
                <span className="text-slate-800 font-bold">R {(load.budget * 0.15).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Broker Commission (5%)</span>
                <span className="text-slate-800 font-bold">R {(load.budget * 0.05).toFixed(0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Amount</span>
              <span className="text-xl font-black text-slate-900">R {(load.budget * 1.20).toFixed(0)}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="font-bold text-emerald-700">Payment Status</span>
              </div>
              <span className="font-black text-emerald-700">PAID</span>
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Documents</h3>
            
            <div className="space-y-2">
              <button onClick={() => handleDownload('Invoice')} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-amber-400 hover:bg-slate-50 transition-colors group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Tax Invoice</p>
                    <p className="text-[10px] text-slate-400">INV-{load.id}.pdf</p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-slate-400 group-hover:text-amber-500" />
              </button>

              <button onClick={() => handleDownload('Receipt')} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-amber-400 hover:bg-slate-50 transition-colors group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Payment Receipt</p>
                    <p className="text-[10px] text-slate-400">REC-{load.id}.pdf</p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-slate-400 group-hover:text-amber-500" />
              </button>

              <button 
                onClick={() => handleDownload('Proof of Delivery')} 
                disabled={load.status !== 'delivered'}
                className={`w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 transition-colors group text-left ${load.status === 'delivered' ? 'hover:border-amber-400 hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${load.status === 'delivered' ? 'bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600' : 'bg-slate-50 text-slate-300'}`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Proof of Delivery (POD)</p>
                    <p className="text-[10px] text-slate-400">{load.status === 'delivered' ? `POD-${load.id}.pdf` : 'Not yet available'}</p>
                  </div>
                </div>
                <Download className={`h-4 w-4 ${load.status === 'delivered' ? 'text-slate-400 group-hover:text-amber-500' : 'text-slate-300'}`} />
              </button>
            </div>
          </Card>

        </div>
      </div>

    </div>
  );
}
