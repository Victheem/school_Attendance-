import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  QrCode, 
  FileText, 
  PlusCircle, 
  User, 
  Smartphone,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateQrDataUrl } from '../../services/qrSecurity';

export const TeacherPortal: React.FC = () => {
  const { currentUser, teachers, attendanceRecords, leaveRequests, submitLeaveRequest, settings } = useApp();

  // Find teacher profile for logged in user (or fallback to Mrs. Grace Okafor)
  const teacher = teachers.find(t => t.id === (currentUser.teacherId || 'TCH-00023')) || teachers[0];
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-16');
  const [leaveReason, setLeaveReason] = useState('');

  useEffect(() => {
    if (teacher?.qrToken) {
      generateQrDataUrl(teacher.qrToken).then(url => setQrUrl(url));
    }
  }, [teacher]);

  const teacherRecords = attendanceRecords
    .filter(r => r.teacherId === teacher.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const todayRecord = teacherRecords.find(r => r.date === '2026-10-06');
  const teacherLeaves = leaveRequests.filter(l => l.teacherId === teacher.id);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${teacher.title || ''} ${teacher.firstName} ${teacher.lastName}`.trim();
    const dept = teacher.departmentOrClass || teacher.department || 'General';
    await submitLeaveRequest({
      personId: teacher.id,
      personName: fullName,
      category: 'Teacher',
      departmentOrClass: dept,
      teacherId: teacher.id,
      teacherName: fullName,
      department: dept,
      leaveType: leaveType as any,
      startDate,
      endDate,
      daysCount: 2,
      reason: leaveReason || 'Personal academic leave',
    });
    setIsLeaveModalOpen(false);
    setLeaveReason('');
    alert('Leave request submitted to administration for review.');
  };

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={teacher.avatar}
              alt={teacher.firstName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Teacher Personal Portal
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {teacher.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-0.5 text-white">
                {teacher.title} {teacher.firstName} {teacher.lastName}
              </h1>
              <p className="text-xs text-sky-200 mt-1">
                {teacher.position} • {teacher.department} Department • Staff ID: <strong className="font-mono text-white">{teacher.id}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Attendance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Today's Attendance (06 Oct 2026)</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {todayRecord?.status || 'Present'}
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Clock In</span>
              <span className="text-xl font-black font-mono text-slate-900 mt-1 block">
                {todayRecord?.clockInTime ? todayRecord.clockInTime.slice(0, 5) + ' AM' : '07:34 AM'}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">✓ Verified On-Time</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Clock Out</span>
              <span className="text-xl font-black font-mono text-slate-900 mt-1 block">
                {todayRecord?.clockOutTime ? todayRecord.clockOutTime.slice(0, 5) + ' PM' : '04:12 PM'}
              </span>
              <span className="text-[11px] text-sky-600 font-semibold mt-1 block">8h 38m recorded</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-800 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>Clocked via Reception Attendance Tablet (DEVICE-01).</span>
          </div>
        </div>

        {/* This Month Metrics (October 2026) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900">
            This Month Performance (October 2026)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Academic session attendance tracking</p>

          <div className="grid grid-cols-4 gap-3 text-center mt-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-2xl font-black text-emerald-700">20</span>
              <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">Present</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-2xl font-black text-amber-700">2</span>
              <span className="text-[11px] font-semibold text-amber-600 block mt-0.5">Late</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-2xl font-black text-rose-700">0</span>
              <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">Absent</span>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <span className="text-2xl font-black text-sky-700">1</span>
              <span className="text-[11px] font-semibold text-sky-600 block mt-0.5">Leave</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Punctuality Score:</span>
            <span className="font-bold text-slate-900">95.4% (Grade: Excellent)</span>
          </div>
        </div>
      </div>

      {/* Digital QR Staff Pass Badge */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="Digital Staff Pass"
              className="w-28 h-28 rounded-2xl border border-slate-200 p-1 bg-white shadow-xs"
            />
          ) : (
            <div className="w-28 h-28 bg-slate-100 rounded-2xl flex items-center justify-center">
              <QrCode className="w-10 h-10 text-slate-400" />
            </div>
          )}
          <div>
            <span className="text-xs font-bold uppercase text-sky-600 tracking-wider">
              Digital Mobile Attendance Badge
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Instant Kiosk Clock-In Pass
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Show this QR code to the entrance or reception scanner on your phone to clock in or out without touching paper.
            </p>
          </div>
        </div>

        {qrUrl && (
          <a
            href={qrUrl}
            download={`${teacher.id}_Digital_Pass.png`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <Download className="w-4 h-4" />
            <span>Save to Phone</span>
          </a>
        )}
      </div>

      {/* Security Notice: Teachers cannot edit attendance */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <strong className="font-bold">Staff Access Security Notice:</strong> Attendance records are cryptographically verified and immutable. If you forgot to scan your badge or have a time discrepancy, please submit an Adjustment Request through the HR Office.
        </div>
      </div>

      {/* Recent Personal Logs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">Recent Attendance Logs</h3>
          <p className="text-xs text-slate-500">Your historical physical terminal records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Clock In</th>
                <th className="py-2.5 px-4">Clock Out</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacherRecords.slice(0, 6).map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-800">{r.date}</td>
                  <td className="py-2.5 px-4 font-mono">{r.clockInTime ? r.clockInTime.slice(0, 5) : '--'}</td>
                  <td className="py-2.5 px-4 font-mono">{r.clockOutTime ? r.clockOutTime.slice(0, 5) : '--'}</td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                      r.status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{r.deviceId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Apply for Leave Authorization
            </h3>

            <form onSubmit={handleApplyLeave} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Official Assignment">Official Assignment</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">From</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">To</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Reason</label>
                <textarea
                  rows={2}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="State reason..."
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
