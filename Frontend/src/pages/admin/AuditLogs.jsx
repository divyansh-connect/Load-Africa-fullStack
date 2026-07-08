import React from 'react';
import { Search, Filter, History, Download, Calendar } from 'lucide-react';

export default function AuditLogs() {

  // Mock Data for Audit Logs
  const logs = [
    { id: 'LOG-001', eventType: 'Login', email: 'admin@loadafrica.com', date: '2023-10-25 09:00:12', timezone: 'SAST', ip: '192.168.1.1', action: 'User logged in successfully' },
    { id: 'LOG-002', eventType: 'Update Config', email: 'admin@loadafrica.com', date: '2023-10-25 09:15:33', timezone: 'SAST', ip: '192.168.1.1', action: 'Changed Match Radius to 50KM' },
    { id: 'LOG-003', eventType: 'Driver Approval', email: 'sarah@loadafrica.com', date: '2023-10-24 14:20:00', timezone: 'SAST', ip: '10.0.0.5', action: 'Approved driver DRV-1002' },
    { id: 'LOG-004', eventType: 'Logout', email: 'sarah@loadafrica.com', date: '2023-10-24 17:05:10', timezone: 'SAST', ip: '10.0.0.5', action: 'User logged out' },
    { id: 'LOG-005', eventType: 'Failed Login', email: 'unknown@loadafrica.com', date: '2023-10-23 23:45:11', timezone: 'UTC', ip: '198.51.100.2', action: 'Invalid password attempt' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Audit Logs</h1>
          <p className="text-sm text-slate-500 font-medium">Track all administrative actions across the platform</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Advanced Filters Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Event Type</label>
            <select className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm font-medium bg-white">
              <option>All Events</option>
              <option>Login / Logout</option>
              <option>Data Modification</option>
              <option>Approvals</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">User Email</label>
            <input 
              type="text" 
              placeholder="Filter by email..." 
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Select date range" 
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm font-medium"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              <Filter className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs by action or IP..." 
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-bold text-slate-700">Timestamp</th>
                <th className="px-6 py-3 font-bold text-slate-700">User Email</th>
                <th className="px-6 py-3 font-bold text-slate-700">Event Type</th>
                <th className="px-6 py-3 font-bold text-slate-700">Action Detail</th>
                <th className="px-6 py-3 font-bold text-slate-700">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{log.date}</p>
                    <p className="text-xs text-slate-500">{log.timezone}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{log.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      log.eventType.includes('Login') || log.eventType.includes('Logout') ? 'bg-sky-100 text-sky-700' :
                      log.eventType.includes('Approval') ? 'bg-green-100 text-green-700' :
                      log.eventType.includes('Failed') ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {log.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
