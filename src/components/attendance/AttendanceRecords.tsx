import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Edit3, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  X,
  History
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus, SyncStatus } from '../../types';

interface AttendanceRecordsProps {
  onSelectTeacher?: (teacherId: string) => void;
  initialAdjustRecord?: AttendanceRecord | null;
  onClearInitialAdjust?: () => void;
}

export const AttendanceRecords: React.FC<AttendanceRecordsProps> = ({ 
  onSelectTeacher,
  initialAdjustRecord,
  onClearInitialAdjust
}) => {
  const { attendanceRecords, adjustAttendance, settings, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-10-06');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSync, setSelectedSync] = useState('ALL');
  
  // Adjustment modal
  const [activeAdjust, setActiveAdjust] = useState<AttendanceRecord | null>(initialAdjustRecord || null);
  const [adjClockIn, setAdjClockIn] = useState('');
  const [adjClockOut, setAdjClockOut] = useState('');
  const [adjStatus, setAdjStatus] = useState<AttendanceStatus>('Present');
  const [adjReason, setAdjReason] = useState('');

  // Handle open adjustment
  const handleOpenAdjustment = (rec: AttendanceRecord) => {
    setActiveAdjust(rec);
    setAdjClockIn(rec.clockInTime ? rec.clockInTime.slice(0, 5) : '07:45');
    setAdjClockOut(rec.clockOutTime ? rec.clockOutTime.slice(0, 5) : '16:05');
    setAdjStatus(rec.status);
    setAdjReason(rec.correctionReason || 'Card forgotten / system adjustment requested');
  };

  const handleCloseAdjustment = () => {
    setActiveAdjust(null);
    if (onClearInitialAdjust) onClearInitialAdjust();
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdjust) return;
    if (!adjReason.trim()) {
      alert('A valid reason is required for administrative attendance correction.');
      return;
    }

    await adjustAttendance(activeAdjust.id, {
      clockInTime: adjClockIn ? `${adjClockIn}:00` : undefined,
      clockOutTime: adjClockOut ? `${adjClockOut}:00` : undefined,
      status: adjStatus,
      reason: adjReason.trim(),
    });

    handleCloseAdjustment();
  };

  const filteredRecords = attendanceRecords.filter((r) => {
    const personName = r.person_name || r.teacherName || '';
    const deptOrClass = r.department_or_class || r.department || '';
    const personId = r.person_id || r.teacherId || '';
    const devId = r.device_id || r.deviceId || '';
    const personCat = r.person_type || 'Teacher';
    const attMethod = r.attendance_method || 'QR';

    const matchesSearch = `${personName} ${deptOrClass} ${personId} ${devId}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesCategory = selectedCategory === 'ALL' || personCat === selectedCategory;
    const matchesMethod = selectedMethod === 'ALL' || attMethod === selectedMethod;
    const matchesDept = selectedDept === 'ALL' || deptOrClass === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    const matchesSync = selectedSync === 'ALL' || (r.sync_status || r.syncStatus) === selectedSync;

    return matchesSearch && matchesDate && matchesCategory && matchesMethod && matchesDept && matchesStatus && matchesSync;
  });

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Record ID,Date,Name,Person ID,Category,Department/Class,Method,Clock In,Clock Out,Status,Hours (mins),Device,Sync Status,Recorded By,Reason,Adjustment Reason\n" +
      filteredRecords.map(r => 
        `"${r.id}","${r.date}","${r.person_name || r.teacherName}","${r.person_id || r.teacherId}","${r.person_type || 'Staff'}","${r.department_or_class || r.department}","${r.attendance_method || 'QR'}","${r.clockInTime || '--'}","${r.clockOutTime || '--'}","${r.status}","${r.hoursWorked || 0}","${r.device_id || r.deviceId}","${r.sync_status || r.syncStatus}","${r.recorded_by || ''}","${r.reason || ''}","${r.correctionReason || ''}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Ledger_${selectedDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatHours = (mins: number | null) => {
    if (!mins) return '--';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Attendance Records & Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade clock-in and clock-out logs with hardware terminal tracking and sync telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Ledger</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search teacher, staff ID, terminal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-slate-800 font-semibold focus:outline-none"
            />
          </div>

          {/* Person Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold"
          >
            <option value="ALL">All Personnel</option>
            <option value="Teacher">Teachers</option>
            <option value="Cleaner">Cleaners</option>
            <option value="Driver">Bus Drivers</option>
            <option value="Security">Security Personnel</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Kitchen/Catering">Kitchen / Catering</option>
            <option value="Administrator">Administrators</option>
            <option value="ICT Staff">ICT Staff</option>
            <option value="Student">Students</option>
          </select>

          {/* Attendance Method */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800"
          >
            <option value="ALL">All Methods</option>
            <option value="QR">Method A: QR Code</option>
            <option value="QUICK_ATTENDANCE">Method B: Quick Attendance</option>
            <option value="PIN">Method C: Staff PIN</option>
            <option value="CLASS_REGISTER">Method D: Class Register</option>
          </select>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800"
          >
            <option value="ALL">All Depts / Classes</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Science">Science</option>
            <option value="Social Studies">Social Studies</option>
            <option value="ICT">ICT</option>
            <option value="Facilities">Facilities</option>
            <option value="Transport / Fleet">Transport / Fleet</option>
            <option value="Early Years">Early Years</option>
            <option value="Primary">Primary</option>
            <option value="Administration">Administration</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Early Departure">Early Departure</option>
            <option value="Missing Clock-Out">Missing Clock-Out</option>
            <option value="Leave">Approved Leave</option>
          </select>

          {/* Sync Status */}
          <select
            value={selectedSync}
            onChange={(e) => setSelectedSync(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800"
          >
            <option value="ALL">All Sync States</option>
            <option value="SYNCED">Synced (Central DB)</option>
            <option value="PENDING">Pending (Offline Queue)</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-900">{filteredRecords.length}</strong> attendance records
          </div>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-sky-600 hover:text-sky-700 font-semibold"
            >
              Clear Date Filter (Show All History)
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-4">Person & Category</th>
                <th className="py-3 px-4">Dept / Class</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Terminal Device</th>
                <th className="py-3 px-4">Sync & Officer</th>
                <th className="py-3 px-5 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.map((r) => {
                const isLate = r.status === 'Late';
                const isPresent = r.status === 'Present';
                const isAbsent = r.status === 'Absent' || r.status === 'Leave';
                const pCategory = r.person_type || 'Teacher';
                const pMethod = r.attendance_method || 'QR';
                const syncSt = r.sync_status || r.syncStatus || 'SYNCED';

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-5 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {r.date}
                    </td>

                    {/* Person / Category */}
                    <td className="py-3 px-4">
                      <div>
                        <button
                          onClick={() => onSelectTeacher && onSelectTeacher(r.person_id || r.teacherId || '')}
                          className="font-bold text-slate-900 hover:text-sky-600 text-left transition"
                        >
                          {r.person_name || r.teacherName}
                        </button>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {pCategory}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {r.person_id || r.teacherId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department or Class */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {r.department_or_class || r.department}
                    </td>

                    {/* Method */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        pMethod === 'QR' 
                          ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                          : pMethod === 'QUICK_ATTENDANCE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : pMethod === 'PIN'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {pMethod === 'QR' ? 'QR Code' : pMethod === 'QUICK_ATTENDANCE' ? 'Quick Manual' : pMethod === 'PIN' ? 'Staff PIN' : 'Class Register'}
                      </span>
                    </td>

                    {/* Clock In */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {r.clockInTime ? r.clockInTime.slice(0, 5) : '--'}
                    </td>

                    {/* Clock Out */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {r.clockOutTime ? r.clockOutTime.slice(0, 5) : '--'}
                    </td>

                    {/* Hours */}
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {formatHours(r.hoursWorked)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isLate
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {r.status}
                        </span>
                        {r.isManualCorrection && (
                          <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">
                            Admin Corrected
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Device */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      <div>{r.device_id || r.deviceId}</div>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                        {r.device_location || r.deviceLocation}
                      </span>
                    </td>

                    {/* Sync State & Officer Details */}
                    <td className="py-3 px-4">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            syncSt === 'SYNCED'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {syncSt === 'SYNCED' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Synced
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pending Sync
                            </>
                          )}
                        </span>
                        {r.recorded_by && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]" title={r.recorded_by}>
                            By: {r.recorded_by.split('(')[0]}
                          </div>
                        )}
                        {r.reason && (
                          <div className="text-[9px] text-amber-600 italic truncate max-w-[140px]" title={r.reason}>
                            {r.reason}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Adjustment */}
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => handleOpenAdjustment(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition"
                      >
                        <Edit3 className="w-3 h-3 text-sky-600" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Attendance Adjustment Modal */}
      {activeAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 my-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Attendance Adjustment</h3>
                <p className="text-xs text-slate-500">
                  Record ID: <strong className="font-mono text-slate-700">{activeAdjust.id}</strong>
                </p>
              </div>
              <button
                onClick={handleCloseAdjustment}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-900 text-sm">{activeAdjust.teacherName}</div>
              <div className="text-slate-500">
                Staff ID: {activeAdjust.teacherId} • {activeAdjust.department} • Date: {activeAdjust.date}
              </div>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Clock In Time
                  </label>
                  <input
                    type="time"
                    value={adjClockIn}
                    onChange={(e) => setAdjClockIn(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Clock Out Time
                  </label>
                  <input
                    type="time"
                    value={adjClockOut}
                    onChange={(e) => setAdjClockOut(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Attendance Status
                </label>
                <select
                  value={adjStatus}
                  onChange={(e: any) => setAdjStatus(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Present">Present (On Time)</option>
                  <option value="Late">Late</option>
                  <option value="Early Departure">Early Departure</option>
                  <option value="Leave">Official Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Mandatory Justification / Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Teacher forgot to scan badge at gate terminal; arrival confirmed by Vice Principal."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This justification will be permanently stamped with your admin signature in the immutable Audit Log.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseAdjustment}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 shadow-sm"
                >
                  Save & Log Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
