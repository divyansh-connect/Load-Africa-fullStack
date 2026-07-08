import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Package, Clock, ChevronRight } from 'lucide-react';
import { getMockData } from '../../data/mockData';
import { Card, Badge, Table, Button } from '../../components/ui';

export default function ActiveDeliveries() {
  const navigate = useNavigate();
  const [activeLoads, setActiveLoads] = useState([]);

  useEffect(() => {
    const allLoads = getMockData('loads') || [];
    // Active deliveries are loads with status 'in_transit' or 'assigned'
    const active = allLoads.filter(l => l.customerId === 'usr-1' && (l.status === 'in_transit' || l.status === 'assigned'));
    setActiveLoads(active);
  }, []);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Deliveries</h2>
        <p className="text-xs text-slate-400">Manage and track your commercial cargo shipments currently transiting corridors.</p>
      </div>

      {activeLoads.length === 0 ? (
        <Card className="p-6 text-center space-y-3 max-w-md mx-auto">
          <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 rounded-full">
            <Truck className="h-8 w-8" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">No Active Transits</h4>
            <p className="text-xs text-slate-400 font-light mt-1">Book your cement or aggregate cargo load to match drivers.</p>
          </div>
          <Button onClick={() => navigate('/customer/create-booking')}>Book Transport</Button>
        </Card>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <Table headers={['Cargo Shipment', 'Route & Transporter', 'Budget & Weight', 'Status', 'Actions']}>
            {activeLoads.map((load) => (
              <tr key={load.id} className="hover:bg-slate-50/30">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500 shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{load.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">{load.id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 max-w-xs">
                  <div className="space-y-1 text-slate-650 font-semibold">
                    <p className="truncate text-slate-800">From: {load.pickup.split(',')[0]}</p>
                    <p className="truncate text-slate-800">To: {load.dropoff.split(',')[0]}</p>
                    <p className="text-[10px] text-slate-500 font-medium pt-1">Driver: Sipho Zuma • 8-Ton Truck</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-800">R{load.budget}</p>
                  <span className="text-slate-400">{load.weight}</span>
                </td>
                <td className="py-3 px-4">
                  {load.status === 'in_transit' ? (
                    <Badge status="in_transit" />
                  ) : (
                    <Badge status="assigned" />
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={() => navigate(`/customer/booking-details/${load.id}`)}
                      size="sm"
                      variant="outline"
                    >
                      Details
                    </Button>
                    <Button 
                      onClick={() => navigate('/customer/tracking')}
                      size="sm"
                    >
                      Track Live
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

    </div>
  );
}
