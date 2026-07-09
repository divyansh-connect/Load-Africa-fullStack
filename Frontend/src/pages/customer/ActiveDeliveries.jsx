import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Package, Clock, ChevronRight } from 'lucide-react';
import { Card, Badge, Table, Button } from '../../components/ui';
import { bookingService } from '../../services/bookingService';

export default function ActiveDeliveries() {
  const navigate = useNavigate();
  const [activeLoads, setActiveLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchActiveLoads();
  }, []);

  const fetchActiveLoads = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getCustomerBookingsHistory();
      if (res.success && res.data) {
        const active = res.data.filter(l => 
          ['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'ARRIVED_PICKUP', 'LOADING', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_DESTINATION', 'DELIVERED', 'POD_UPLOADED', 'POD_VERIFIED'].includes(l.status)
        );
        setActiveLoads(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (bookingId) => {
    try {
      setConfirmingId(bookingId);
      const res = await bookingService.updateBookingStatus(bookingId, 'COMPLETED', 'Customer confirmed cargo receipt.');
      if (res.success) {
        alert('Delivery confirmed! Final invoice generated and payout split completed.');
        await fetchActiveLoads();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'draft';
    switch (s) {
      case 'in_transit':
      case 'picked_up':
      case 'loading':
      case 'driver_en_route':
      case 'arrived_pickup':
        return <Badge status="in_transit" />;
      case 'delivered':
      case 'pod_uploaded':
      case 'pod_verified':
        return <Badge status="completed" />;
      default:
        return <Badge status="assigned" />;
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Deliveries</h2>
        <p className="text-xs text-slate-400">Manage and track your commercial cargo shipments currently transiting corridors.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">
          Loading active transits...
        </div>
      ) : activeLoads.length === 0 ? (
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
          <Table headers={['Cargo Shipment', 'Route Details', 'Budget & Weight', 'Status', 'Actions']}>
            {activeLoads.map((load) => {
              const assignment = load.assignments?.[0];
              const driverName = assignment?.driver?.user 
                ? `${assignment.driver.user.first_name} ${assignment.driver.user.last_name || ''}` 
                : 'Awaiting dispatch';

              return (
                <tr key={load.id} className="hover:bg-slate-50/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500 shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{load.cargo_name}</p>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{load.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="space-y-1 text-slate-650 font-semibold">
                      <p className="truncate text-slate-800">From: {load.pickup_address?.split(',')[0]}</p>
                      <p className="truncate text-slate-800">To: {load.delivery_address?.split(',')[0]}</p>
                      <p className="text-[10px] text-slate-500 font-medium pt-1">Driver: {driverName}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">R{load.quotes?.[0]?.grand_total || '0'}</p>
                    <span className="text-slate-400">{load.weight} tons</span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(load.status)}
                    <span className="block text-[9px] text-slate-400 font-bold uppercase mt-1">{load.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {load.status === 'POD_VERIFIED' && (
                        <Button 
                          onClick={() => handleConfirmDelivery(load.id)}
                          size="sm"
                          disabled={confirmingId === load.id}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase"
                        >
                          {confirmingId === load.id ? 'Confirming...' : 'Confirm Receipt'}
                        </Button>
                      )}
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
              );
            })}
          </Table>
        </div>
      )}

    </div>
  );
}
