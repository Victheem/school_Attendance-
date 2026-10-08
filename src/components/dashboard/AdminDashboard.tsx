import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  Hourglass, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpRight, 
  QrCode, 
  FileText, 
  ShieldAlert,
  Calendar,
  GraduationCap,
  Bus,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, PersonCategory } from '../../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onSelectTeacherForModal?: (teacherId: string) => void;
  onOpenAdjustmentModal?: (record: AttendanceRecord) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onNavigate, 
  onSelectTeacherForModal,
  onOpenAdjustmentModal
}) => {
  const { 
    currentUser, 
    stats, 
    isOnline, 
    lastSyncTime, 
    attendanceRecords, 
    settings 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Filter today's records
  const todayRecords = attendanceRecords.filter(r => r.date === '2026-10-06');
  
  const filteredRecords = todayRecords.filter(r => {
    const personName = r.person_name || (r as any).teacherName || '';
    const deptOrClass = r.department_or_class || (r as any).department || '';
    const personId = r.person_id || (r as any).teacherId || '';
    const personType = r.person_type || 'Teacher';

    const matchesSearch = `${personName} ${deptOrClass} ${personId}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (categoryFilter === 'STAFF') {
      matchesCategory = personType !== 'Student';
    } else if (categoryFilter === 'STUDENTS') {
      matchesCategory = personType === 'Student';
    } else if (categoryFilter === 'TEACHERS') {
      matchesCategory = personType === 'Teacher';
    } else if (categoryFilter === 'DRIVERS') {
      matchesCategory = personType === 'Driver';
    } else if (categoryFilter === 'SUPPORT') {
      matchesCategory = personType === 'Cleaner' || personType === 'Security' || personType === 'Maintenance' || personType === 'Kitchen/Catering';
    } else if (categoryFilter === 'ADMINISTRATION') {
      matchesCategory = personType === 'Administrator' || personType === 'Management';
    }

    return matchesSearch && matchesCategory;
  });

  const formatHours = (mins: number | null) => {
    if (!mins) return '--';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & System Status Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tuesday, 06 October 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            Good morning, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {settings.schoolName} • School Attendance & Workforce Console
          </p>
        </div>

        {/* System Online / Offline Status Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${
              isOnline
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-emerald-950 text-emerald-100 border-emerald-500'
            }`}
          >
            {isOnline ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span>● ONLINE</span>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Last synchronization: {lastSyncTime}
                  </div>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-emerald-300" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    ● OFFLINE MODE
                  </div>
                  <div className="text-[11px] text-emerald-300 font-medium">
                    Attendance recording continues normally • Pending: {stats.offlineRecords}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => onNavigate('kiosk')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
          >
            <QrCode className="w-4 h-4 text-sky-400" />
            <span>Launch Kiosk Terminal</span>
          </button>
        </div>
      </div>

      {/* Main KPI Statistics Grid (Calibrated to 250 Total People, 75 Staff, 175 Students, 221 Present, 18 Late, 11 Absent, 9 Not Clocked Out, 6 Offline, 215 Synced) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* TOTAL PEOPLE */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>TOTAL PEOPLE</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">{stats.totalPeople}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <strong>{stats.totalStaff}</strong> Staff • <strong>{stats.totalStudents}</strong> Students
          </div>
        </div>

        {/* PRESENT TODAY */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-between">
            <span>PRESENT TODAY</span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600">{stats.presentToday}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">On-time & verified</div>
        </div>

        {/* LATE */}
        <div className="bg-white p-4 rounded-3xl border border-amber-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between">
            <span>LATE</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-600">{stats.late}</div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">Shift cutoff breached</div>
        </div>

        {/* ABSENT */}
        <div className="bg-white p-4 rounded-3xl border border-rose-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center justify-between">
            <span>ABSENT</span>
            <UserX className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-600">{stats.absent}</div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">Unexcused / Leave</div>
        </div>

        {/* NOT CLOCKED OUT */}
        <div className="bg-white p-4 rounded-3xl border border-sky-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center justify-between">
            <span>NOT CLOCKED OUT</span>
            <Hourglass className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-sky-600">{stats.notClockedOut}</div>
          <div className="text-[11px] text-sky-600 mt-1 font-medium">Currently on campus</div>
        </div>

        {/* OFFLINE & SYNCED */}
        <div className="bg-white p-4 rounded-3xl border border-indigo-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center justify-between">
            <span>SYNCED / BUFFER</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-indigo-700">{stats.synchronized}</div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">
            Synced • <strong className="text-amber-600">{stats.offlineRecords}</strong> Offline
          </div>
        </div>
      </div>

      {/* Category Filter Pills (All, Staff, Teachers, Students, Drivers, Support Staff, Administration) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <span className="text-[11px] uppercase text-slate-400 mr-1">Roster Filter:</span>
          {[
            { id: 'ALL', label: 'All (250)' },
            { id: 'STAFF', label: 'All Staff (75)' },
            { id: 'TEACHERS', label: 'Teachers (50)' },
            { id: 'STUDENTS', label: 'Students (175)' },
            { id: 'DRIVERS', label: 'Bus Drivers (5)' },
            { id: 'SUPPORT', label: 'Cleaners & Support (17)' },
            { id: 'ADMINISTRATION', label: 'Admin (3)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search person or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Today's Unified Attendance Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Unified Attendance Feed</h2>
            <p className="text-xs text-slate-500">Live multi-person records: QR, PIN, Quick Attendance and Class Register</p>
          </div>
          <span className="text-xs text-slate-500">
            Displaying <strong>{filteredRecords.length}</strong> records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-3 px-5">Person</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department / Class</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Sync State</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                const personName = r.person_name || (r as any).teacherName || 'Staff Member';
                const personId = r.person_id || (r as any).teacherId || '';
                const personType = r.person_type || 'Teacher';
                const deptOrClass = r.department_or_class || (r as any).department || '';
                const method = r.attendance_method || 'QR';
                const sync = r.sync_status || (r as any).syncStatus || 'SYNCED';

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-bold text-slate-900">{personName}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{personId}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        personType === 'Teacher' ? 'bg-blue-50 text-blue-700' :
                        personType === 'Student' ? 'bg-indigo-50 text-indigo-700' :
                        personType === 'Cleaner' ? 'bg-emerald-50 text-emerald-700' :
                        personType === 'Driver' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {personType}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">{deptOrClass}</td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {method}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {r.clockInTime ? r.clockInTime.slice(0, 5) : '--'}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {r.clockOutTime ? r.clockOutTime.slice(0, 5) : '--'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        r.status === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        sync === 'SYNCED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {sync === 'SYNCED' ? 'Synced' : 'Pending Sync'}
                      </span>
                    </td>

                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => onOpenAdjustmentModal && onOpenAdjustmentModal(r)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
