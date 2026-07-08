import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, MapPin, Package, Download, 
  ExternalLink, Eye, CheckCircle2, RotateCcw, FileText, Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMockData } from '../../data/mockData';
import { Button } from '../../components/ui';

export default function MyLoads() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); // 'pending', 'active', 'past'
  const [searchTerm, setSearchTerm] = useState('');
  const [loads, setLoads] = useState([]);

  useEffect(() => {
    const allLoads = getMockData('loads') || [];
    const customerLoads = allLoads.filter(l => l.customerId === 'usr-1');
    setLoads(customerLoads);
  }, []);

  const getFilteredLoads = () => {
    let filtered = loads.filter(load => {
      const matchesSearch = load.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            load.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    if (activeTab === 'pending') {
      return filtered.filter(l => l.status === 'available');
    }
    if (activeTab === 'active') {
      return filtered.filter(l => l.status === 'assigned' || l.status === 'in_transit');
    }
    if (activeTab === 'past') {
      return filtered.filter(l => l.status === 'completed');
    }
    return filtered;
  };

  const filteredLoads = getFilteredLoads();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Pending Review</span>;
      case 'assigned':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">Driver Assigned</span>;
      case 'in_transit':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">In Transit</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Delivered</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Loads</h2>
          <p className="text-xs text-slate-400">Manage all your pending, active, and past commercial shipments.</p>
        </div>
        <button 
          onClick={() => navigate('/customer/create-booking')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f4a236] hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-amber-500/20 uppercase tracking-wider"
        >
          Book Transport
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-bold transition-all ${activeTab === 'pending' ? 'text-[#f4a236] border-b-2 border-[#f4a236]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Pending Quotes
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-sm font-bold transition-all ${activeTab === 'active' ? 'text-[#f4a236] border-b-2 border-[#f4a236]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Active Deliveries
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-bold transition-all ${activeTab === 'past' ? 'text-[#f4a236] border-b-2 border-[#f4a236]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Booking History
        </button>
      </div>

      {/* Search Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Cargo details, Load ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-700 focus:outline-none focus:border-[#f4a236] text-xs transition-all"
          />
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLoads.length === 0 ? (
          <div className="p-12 text-center space-y-3 max-w-md mx-auto">
            <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 rounded-full">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">No Loads Found</h4>
              <p className="text-xs text-slate-400 font-light mt-1">There are no loads matching your current filters in this tab.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Cargo Shipment</th>
                  <th className="py-3 px-4">Route Details</th>
                  <th className="py-3 px-4">Budget & Weight</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredLoads.map((load) => (
                  <tr key={load.id} className="hover:bg-slate-50/40 transition-colors">
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
                      <div className="space-y-1 text-slate-600 font-semibold text-xs">
                        <p className="truncate text-slate-800">From: {load.pickup.split(',')[0]}</p>
                        <p className="truncate text-slate-800">To: {load.dropoff.split(',')[0]}</p>
                        {load.status !== 'available' && (
                          <p className="text-[10px] text-slate-500 font-medium pt-1">Driver: Sipho Zuma • 8-Ton Truck</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">R {load.budget}</p>
                      <span className="text-xs text-slate-400 font-medium">{load.weight}</span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(load.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/customer/booking-details/${load.id}`)}
                          className="px-3 py-1.5 text-xs font-bold border-2 border-slate-200 text-slate-600 hover:border-slate-300 rounded-lg transition-colors uppercase tracking-wider"
                        >
                          Details
                        </button>
                        
                        {(load.status === 'in_transit' || load.status === 'assigned') && (
                          <button 
                            onClick={() => navigate('/customer/tracking')}
                            className="px-3 py-1.5 text-xs font-bold bg-[#f4a236] text-white hover:bg-amber-500 rounded-lg transition-colors uppercase tracking-wider shadow-sm shadow-amber-500/20"
                          >
                            Track Live
                          </button>
                        )}
                        
                        {load.status === 'completed' && (
                          <button 
                            onClick={() => alert('Downloading Invoice...')}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                            title="Download Invoice PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
