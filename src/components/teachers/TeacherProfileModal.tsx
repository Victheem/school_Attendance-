import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  QrCode, 
  Mail, 
  Phone, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle, 
  FileText,
  Building
} from 'lucide-react';
import { Teacher, AttendanceRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateQrDataUrl } from '../../services/qrSecurity';

interface TeacherProfileModalProps {
  teacherId: string;
  onClose: () => void;
  onOpenAdjustment?: (record: AttendanceRecord) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({ 
  teacherId, 
  onClose,
  onOpenAdjustment 
}) => {
  const { teachers, attendanceRecords, settings } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const teacher = teachers.find(t => t.id === teacherId);

  useEffect(() => {
    if (teacher?.qrToken) {
      generateQrDataUrl(teacher.qrToken).then(url => setQrDataUrl(url));
    }
  }, [teacher]);

  if (!teacher) return null;

  // Filter attendance records for this teacher
  const teacherRecords = attendanceRecords
    .filter(r => r.teacherId === teacher.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const todayRecord = teacherRecords.find(r => r.date === '2026-10-06');

  // Realistic monthly metrics (October 2026)
  const monthlyMetrics = {
    present: teacher.id === 'TCH-00023' ? 20 : 18,
    late: teacher.id === 'TCH-00023' ? 3 : 2,
    absent: teacher.id === 'TCH-00002' ? 3 : 1,
    leave: teacher.id === 'TCH-00002' ? 2 : 1,
    totalHours: '168 hrs',
  };

  const handleDownloadReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Teacher,Department,Clock In,Clock Out,Status,Hours\n" +
      teacherRecords.map(r => `${r.date},"${r.teacherName}",${r.department},${r.clockInTime || '--'},${r.clockOutTime || '--'},${r.status},${r.hoursWorked ? Math.round(r.hoursWorked/60)+'h' : '--'}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${teacher.lastName}_${teacher.id}_Monthly_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={teacher.avatar}
              alt={teacher.firstName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">
                  {teacher.title} {teacher.firstName} {teacher.lastName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/30 text-sky-200 border border-sky-400/30">
                  {teacher.status}
                </span>
              </div>
              <p className="text-sm text-sky-200 mt-0.5">
                {teacher.position} • {teacher.department} Department
              </p>
              <div className="text-xs text-slate-300 mt-1 font-mono">
                Staff ID: <strong className="text-white">{teacher.id}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Today's Attendance & Monthly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Today's Status */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Today's Attendance (06 Oct 2026)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {todayRecord ? todayRecord.status : 'Present'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Clock In</span>
                  <span className="text-xs font-bold font-mono text-slate-800">
                    {todayRecord?.clockInTime ? todayRecord.clockInTime.slice(0, 5) : '07:42 AM'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Clock Out</span>
                  <span className="text-xs font-bold font-mono text-slate-800">
                    {todayRecord?.clockOutTime ? todayRecord.clockOutTime.slice(0, 5) : '04:15 PM'}
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Attendance */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Monthly Attendance (October 2026)
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <span className="text-lg font-black text-emerald-700">{monthlyMetrics.present}</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">Present</span>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
                  <span className="text-lg font-black text-amber-700">{monthlyMetrics.late}</span>
                  <span className="text-[10px] text-amber-600 block font-semibold">Late</span>
                </div>
                <div className="bg-rose-50 p-2 rounded-xl border border-rose-200">
                  <span className="text-lg font-black text-rose-700">{monthlyMetrics.absent}</span>
                  <span className="text-[10px] text-rose-600 block font-semibold">Absent</span>
                </div>
                <div className="bg-sky-50 p-2 rounded-xl border border-sky-200">
                  <span className="text-lg font-black text-sky-700">{monthlyMetrics.leave}</span>
                  <span className="text-[10px] text-sky-600 block font-semibold">Leave</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Badge Card Section */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Staff QR Badge"
                  className="w-24 h-24 rounded-xl border border-slate-200 shadow-xs p-1 bg-white"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-400" />
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-slate-700 block">Personal QR Staff ID</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cryptographically signed attendance token. Revocable anytime.
                </p>
                <div className="text-[11px] font-mono text-slate-400 mt-1 truncate max-w-xs">
                  Token: {teacher.qrToken.slice(0, 24)}...
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`${teacher.id}_QR_Code.png`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR</span>
                </a>
              )}
              <button
                onClick={handlePrintCard}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
            </div>
          </div>

          {/* Attendance History Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Attendance History Logs</h3>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Attendance Report (CSV)</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Clock In</th>
                    <th className="py-2.5 px-3">Clock Out</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Terminal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherRecords.slice(0, 5).map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{r.date}</td>
                      <td className="py-2.5 px-3 font-mono">{r.clockInTime || '--'}</td>
                      <td className="py-2.5 px-3 font-mono">{r.clockOutTime || '--'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                          r.status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{r.deviceId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
