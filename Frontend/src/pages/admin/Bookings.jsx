import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

export default function Bookings() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [activeCategory, setActiveCategory] = useState('TRANSPORT'); // 'TRANSPORT' or 'PLANT'
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [error, setError] = useState(null);

  const tabs = ['All', 'Live', 'Pending', 'Accepted', 'Completed', 'Cancelled'];

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Map 'Live' to IN_TRANSIT or something? Actually let's just pass the tab to the API. 
      // In the API, status is matched exactly if it's not 'All'. 
      let statusParam = activeTab;
      if (activeTab === 'Live') statusParam = 'IN_TRANSIT'; // Example mapping
      if (activeTab === 'Pending') statusParam = 'DRAFT'; // DRAFT or QUOTE_REQUESTED

      const res = await adminService.getAllBookings({ status: activeTab, page, search, category: activeCategory });
      if (res.success) {
        setBookings(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalBookings(res.meta.total);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, search, activeTab, activeCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bookings</h1>
          <p className="text-sm text-slate-500 font-medium">Monitor all platform bookings. Total: {totalBookings}</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl max-w-xs border border-slate-200 shadow-sm shrink-0">
          <button
            onClick={() => { setActiveCategory('TRANSPORT'); setPage(1); }}
            className={`flex-1 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
              activeCategory === 'TRANSPORT'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Transport
          </button>
          <button
            onClick={() => { setActiveCategory('PLANT'); setPage(1); }}
            className={`flex-1 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
              activeCategory === 'PLANT'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Plant Hire
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 pt-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'border-amber-500 text-amber-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or customer..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm font-medium"
            />
          </div>
          <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto justify-center">
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative">
          {isLoading && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
             </div>
          )}
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-bold text-slate-700">Booking ID</th>
                <th className="px-6 py-3 font-bold text-slate-700">Customer</th>
                <th className="px-6 py-3 font-bold text-slate-700">Route</th>
                <th className="px-6 py-3 font-bold text-slate-700">Assigned Provider</th>
                <th className="px-6 py-3 font-bold text-slate-700">Status</th>
                <th className="px-6 py-3 font-bold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {error && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-red-500 font-medium text-sm">
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && bookings.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-medium text-sm">
                    No bookings found matching criteria.
                  </td>
                </tr>
              )}
              {bookings.map((booking) => {
                let providerName = 'Unassigned';
                if (booking.assignments && booking.assignments.length > 0) {
                  const assignment = booking.assignments[0];
                  if (assignment.driver) {
                    providerName = `${assignment.driver.user.first_name || ''} ${assignment.driver.user.last_name || ''} (Driver)`;
                  } else if (assignment.fleet_owner) {
                    providerName = `${assignment.fleet_owner.company_name || assignment.fleet_owner.user.first_name} (Fleet)`;
                  }
                }

                return (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{booking.id.split('-')[0].substring(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-slate-500">{new Date(booking.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {booking.customer?.company_name || `${booking.customer?.user?.first_name || 'Guest'} ${booking.customer?.user?.last_name || ''}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {booking.pickup_address?.split(',')[0]}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                        <MapPin className="h-3 w-3 text-amber-500" />
                        {booking.delivery_address?.split(',')[0]}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {providerName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      ['IN_TRANSIT', 'PICKED_UP'].includes(booking.status) ? 'bg-sky-100 text-sky-700' :
                      ['DRIVER_ASSIGNED', 'CUSTOMER_ACCEPTED'].includes(booking.status) ? 'bg-indigo-100 text-indigo-700' :
                      booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      ['CANCELLED', 'REJECTED'].includes(booking.status) ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700' // Pending
                    }`}>
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin-portal/bookings/${booking.id}`)}
                        className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors" 
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
