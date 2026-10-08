import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle,
  History,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = `${log.action} ${log.user} ${log.details} ${log.recordId || ''} ${log.deviceId || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Log ID,Timestamp,Date,Time,User,Role,Action,Category,Details,Device ID,Record ID\n" +
      filteredLogs.map(l => 
        `"${l.id}","${l.timestamp}","${l.date}","${l.time}","${l.user}","${l.userRole}","${l.action}","${l.category}","${l.details.replace(/"/g, '""')}","${l.deviceId || ''}","${l.recordId || ''}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Royal_Crest_Attendance_Audit_Trail.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Security & Attendance Audit Log</h1>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-full">
              <Lock className="w-3 h-3" />
              IMMUTABLE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed timeline of all clock-ins, clock-outs, token regenerations and administrative corrections
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions, users, devices, record IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800"
          >
            <option value="ALL">All Categories</option>
            <option value="ATTENDANCE">Attendance (Clock In/Out)</option>
            <option value="SECURITY">Security & Corrections</option>
            <option value="SYNC">Synchronization Events</option>
            <option value="TEACHER">Teacher Profile Actions</option>
            <option value="LEAVE">Leave Management</option>
            <option value="SYSTEM">System Rules</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Total <strong>{filteredLogs.length}</strong> audited operations
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-3 px-5">Time & Date</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Details & Justification</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-5 text-right">Record Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Time & Date */}
                  <td className="py-3 px-5 font-mono text-slate-800">
                    <span className="font-bold">{log.time}</span>
                    <span className="block text-[11px] text-slate-400">{log.date}</span>
                  </td>

                  {/* User */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{log.user}</div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {log.userRole}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {log.action}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      log.category === 'SECURITY' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      log.category === 'ATTENDANCE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      log.category === 'SYNC' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {log.category}
                    </span>
                  </td>

                  {/* Details */}
                  <td className="py-3 px-4 text-slate-700 max-w-sm">
                    {log.details}
                  </td>

                  {/* Device */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {log.deviceId || '--'}
                  </td>

                  {/* Record Ref */}
                  <td className="py-3 px-5 text-right font-mono font-bold text-sky-700">
                    {log.recordId || '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
