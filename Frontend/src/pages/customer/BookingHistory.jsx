import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, MapPin, Package, Download, 
  ExternalLink, ChevronRight, Eye, CheckCircle2
} from 'lucide-react';
import { getMockData } from '../../data/mockData';

export default function BookingHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loads, setLoads] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const allLoads = getMockData('loads') || [];
    const customerLoads = allLoads.filter(l => l.customerId === 'usr-1');
    setLoads(customerLoads);
  }, []);

  const filteredLoads = loads.filter(load => {
    const matchesSearch = load.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          load.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || load.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Finding Driver</span>;
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking History</h2>
          <p className="text-xs text-slate-400">View and manage invoices, manifests, and receipts for all historical loads.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm">
          <Download className="h-4 w-4 text-slate-400" />
          Export All (CSV)
        </button>
      </div>

      {/* Search and Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Cargo details, Load ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-700 focus:outline-none focus:border-amber-500 text-xs transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-600 focus:outline-none text-xs transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="available">Finding Driver</option>
            <option value="assigned">Driver Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Delivered</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLoads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No shipments found matching the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-3 px-6">Load Cargo</th>
                  <th className="py-3 px-6">Route Details</th>
                  <th className="py-3 px-6">Dispatch Date</th>
                  <th className="py-3 px-6">Amount & Weight</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredLoads.map((load) => (
                  <tr key={load.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-xl text-slate-500 shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{load.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{load.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="space-y-1 text-xs">
                        <p className="text-slate-600 truncate font-semibold">From: {load.pickup.split(',')[0]}</p>
                        <p className="text-slate-600 truncate font-semibold">To: {load.dropoff.split(',')[0]}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{load.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">R{load.budget}</p>
                      <span className="text-xs text-slate-400 font-medium">{load.weight}</span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(load.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedReceipt(load)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                          title="View Digital Receipt"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                          title="Download Invoice PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Digital Receipt Modal Overlay */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedReceipt(null)} />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-scaleIn">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-amber-500" />
                <span className="font-bold text-sm">Receipt - {selectedReceipt.id}</span>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                Close
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest">PAYMENT SECURED VIA ESCROW</span>
                <h4 className="text-3xl font-extrabold text-slate-900 mt-1">R{selectedReceipt.budget}</h4>
                <p className="text-xs text-emerald-600 font-bold mt-1">Transaction Successful</p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Cargo Detail:</span>
                  <span className="text-slate-800 font-bold">{selectedReceipt.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <span className="text-slate-800 font-bold">{selectedReceipt.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Weight:</span>
                  <span className="text-slate-800 font-bold">{selectedReceipt.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Date Dispatched:</span>
                  <span className="text-slate-800 font-bold">{selectedReceipt.date}</span>
                </div>
                <div className="border-t border-slate-100 my-2" />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PICKUP ADDRESS</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{selectedReceipt.pickup}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">DELIVERY ADDRESS</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{selectedReceipt.dropoff}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
