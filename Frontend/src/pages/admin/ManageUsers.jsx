import React, { useState, useEffect } from 'react';
import { 
  Users, Truck, Compass, Search, Filter, CheckCircle2, 
  XCircle, Award, Eye, ExternalLink, Calendar, Trash2, Percent
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';
import { Table, Badge } from '../../components/ui';

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const loadData = () => {
    setCustomers(getMockData('users') || []);
    setDrivers(getMockData('drivers') || []);
    setBrokers(getMockData('brokers') || []);
    setVehicles(getMockData('vehicles') || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (type, id, newStatus) => {
    if (type === 'driver') {
      const allDrivers = getMockData('drivers') || [];
      const idx = allDrivers.findIndex(d => d.id === id);
      if (idx > -1) {
        allDrivers[idx].status = newStatus;
        if (newStatus === 'active') allDrivers[idx].kycStatus = 'verified';
        saveMockData('drivers', allDrivers);
      }
    } else if (type === 'customer') {
      const allUsers = getMockData('users') || [];
      const idx = allUsers.findIndex(u => u.id === id);
      if (idx > -1) {
        allUsers[idx].status = newStatus;
        saveMockData('users', allUsers);
      }
    } else if (type === 'broker') {
      const allBrokers = getMockData('brokers') || [];
      const idx = allBrokers.findIndex(b => b.id === id);
      if (idx > -1) {
        allBrokers[idx].status = newStatus;
        saveMockData('brokers', allBrokers);
      }
    } else if (type === 'vehicle') {
      const allVehicles = getMockData('vehicles') || [];
      const idx = allVehicles.findIndex(v => v.id === id);
      if (idx > -1) {
        allVehicles[idx].status = newStatus;
        saveMockData('vehicles', allVehicles);
      }
    }
    loadData();
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Resource Control</h2>
        <p className="text-xs text-slate-400">Review status, manage permissions, and update verifications on system entities.</p>
      </div>

      {/* Tabs list navigation row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={() => { setActiveTab('customers'); setSearchTerm(''); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'customers' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            Shippers ({customers.length})
          </button>
          <button 
            onClick={() => { setActiveTab('drivers'); setSearchTerm(''); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'drivers' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Truck className="h-4 w-4" />
            Transporters ({drivers.length})
          </button>
          <button 
            onClick={() => { setActiveTab('brokers'); setSearchTerm(''); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'brokers' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Percent className="h-4 w-4" />
            Brokers ({brokers.length})
          </button>
          <button 
            onClick={() => { setActiveTab('vehicles'); setSearchTerm(''); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'vehicles' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Compass className="h-4 w-4" />
            Vehicles ({vehicles.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs transition-all"
          />
        </div>
      </div>

      {/* Resource Tables list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        
        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            <Table headers={['Shipper Name', 'Company / Org', 'Joined Date', 'System Access', '']}>
              {customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/30">
                  <td className="py-4.5 px-6">
                    <div className="flex items-center gap-3">
                      <img src={cust.avatar} alt={cust.name} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-850 text-sm">{cust.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{cust.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 font-bold text-slate-800">{cust.company}</td>
                  <td className="py-4.5 px-6 font-mono text-slate-400">{cust.joinedDate}</td>
                  <td className="py-4.5 px-6">
                    <Badge status={cust.status} />
                  </td>
                  <td className="py-4.5 px-6 text-right">
                    {cust.status === 'active' ? (
                      <button 
                        onClick={() => handleUpdateStatus('customer', cust.id, 'inactive')}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-xl transition-all font-bold"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus('customer', cust.id, 'active')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl transition-all font-bold"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="overflow-x-auto">
            <Table headers={['Transporter', 'CDL KYC Audit', 'Total Trips / Rating', 'Status', '']}>
              {drivers.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map((drv) => (
                <tr key={drv.id} className="hover:bg-slate-50/30">
                  <td className="py-4.5 px-6">
                    <div className="flex items-center gap-3">
                      <img src={drv.avatar} alt={drv.name} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-850 text-sm">{drv.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{drv.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4.5 px-6">
                    {drv.kycStatus === 'verified' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase text-[9px] font-bold">Verified CDL</span>
                    )}
                    {drv.kycStatus === 'submitted' && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase text-[9px] animate-pulse font-bold">Under Audit</span>
                    )}
                    {drv.kycStatus === 'pending' && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 uppercase text-[9px] font-bold">Pending Setup</span>
                    )}
                  </td>
                  <td className="py-4.5 px-6 font-mono text-slate-700 font-bold">
                    <span>{drv.trips} Trips</span> / <span className="text-amber-500">★ {drv.rating}</span>
                  </td>
                  <td className="py-4.5 px-6">
                    <Badge status={drv.status} />
                  </td>
                  <td className="py-4.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {drv.kycStatus === 'submitted' && (
                        <button 
                          onClick={() => handleUpdateStatus('driver', drv.id, 'active')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold"
                        >
                          Verify KYC
                        </button>
                      )}
                      {drv.status === 'active' ? (
                        <button 
                          onClick={() => handleUpdateStatus('driver', drv.id, 'inactive')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all border border-slate-200 font-bold"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateStatus('driver', drv.id, 'active')}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all font-bold"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {activeTab === 'brokers' && (
          <div className="overflow-x-auto">
            <Table headers={['Broker Associate', 'Commission Rate', 'Total Loads Matched', 'Status', '']}>
              {brokers.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())).map((brk) => (
                <tr key={brk.id} className="hover:bg-slate-50/30">
                  <td className="py-4.5 px-6">
                    <div className="flex items-center gap-3">
                      <img src={brk.avatar} alt={brk.name} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-850 text-sm">{brk.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{brk.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 font-bold text-slate-800">{brk.commissionRate}%</td>
                  <td className="py-4.5 px-6 font-mono text-slate-700 font-bold">{brk.assignedLoadsCount} Loads</td>
                  <td className="py-4.5 px-6">
                    <Badge status={brk.status} />
                  </td>
                  <td className="py-4.5 px-6 text-right">
                    {brk.status === 'active' ? (
                      <button 
                        onClick={() => handleUpdateStatus('broker', brk.id, 'inactive')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl transition-all border font-bold"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus('broker', brk.id, 'active')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl transition-all font-bold"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="overflow-x-auto">
            <Table headers={['Vehicle Model & Plate', 'Type & Capacity', 'Registered Driver', 'Status', '']}>
              {vehicles.filter(v => v.model.toLowerCase().includes(searchTerm.toLowerCase())).map((vh) => (
                <tr key={vh.id} className="hover:bg-slate-50/30">
                  <td className="py-4.5 px-6">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-850 text-sm">{vh.model}</p>
                      <span className="text-[10px] text-slate-450 font-mono font-bold bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">{vh.numberPlate}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 font-bold text-slate-800">
                    <p>{vh.type}</p>
                    <span className="text-xs text-slate-405 font-light font-sans">{vh.capacity} payload</span>
                  </td>
                  <td className="py-4.5 px-6 text-slate-850 font-bold">{vh.driverName}</td>
                  <td className="py-4.5 px-6">
                    <Badge status={vh.status} />
                  </td>
                  <td className="py-4.5 px-6 text-right">
                    {vh.status === 'active' ? (
                      <button 
                        onClick={() => handleUpdateStatus('vehicle', vh.id, 'inactive')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all border border-slate-200 font-bold"
                      >
                        Decommission
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus('vehicle', vh.id, 'active')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all font-bold"
                      >
                        Add to Fleet
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}

      </div>

    </div>
  );
}
