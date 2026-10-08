import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Building, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Award,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AttendanceReports: React.FC = () => {
  const { teachers, attendanceRecords, settings } = useApp();

  const [activeReportType, setActiveReportType] = useState<
    'MONTHLY_PRINCIPAL' | 'DAILY' | 'WEEKLY' | 'LATE' | 'EARLY_DEP' | 'ABSENCE' | 'MISSING_OUT' | 'LEAVE' | 'DEPARTMENT'
  >('MONTHLY_PRINCIPAL');

  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const todayRecords = attendanceRecords.filter(r => r.date === '2026-10-06');
  const lateRecords = todayRecords.filter(r => r.status === 'Late');
  const absentRecords = todayRecords.filter(r => r.status === 'Absent');
  const missingOutRecords = todayRecords.filter(r => r.clockInTime && !r.clockOutTime);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let rows: string[] = [];
    if (activeReportType === 'MONTHLY_PRINCIPAL') {
      rows.push("Staff ID,Teacher Name,Department,Position,Days Present,Days Late,Days Absent,Approved Leave,Total Working Hours,Compliance Rate");
      teachers.forEach(t => {
        const isLate = t.id === 'TCH-00001' || t.id === 'TCH-00031';
        const isAbsent = t.id === 'TCH-00002';
        rows.push(`"${t.id}","${t.title} ${t.firstName} ${t.lastName}","${t.department}","${t.position}",${isAbsent ? 18 : 22},${isLate ? 4 : 1},${isAbsent ? 3 : 0},${isAbsent ? 2 : 0},${isAbsent ? '144h' : '176h'},"${isAbsent ? '85.7%' : '98.5%'}"`);
      });
    } else {
      rows.push("Record ID,Date,Staff ID,Teacher Name,Department,Clock In,Clock Out,Status");
      todayRecords.forEach(r => {
        rows.push(`"${r.id}","${r.date}","${r.teacherId}","${r.teacherName}","${r.department}","${r.clockInTime || '--'}","${r.clockOutTime || '--'}","${r.status}"`);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Royal_Crest_${activeReportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Official Attendance Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade summaries formatted for presentation to the School Principal, Proprietor & Governing Council
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs (Hidden on Print) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-2 print:hidden">
        <button
          onClick={() => setActiveReportType('MONTHLY_PRINCIPAL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeReportType === 'MONTHLY_PRINCIPAL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          ★ Principal's Monthly Ledger
        </button>
        <button
          onClick={() => setActiveReportType('DAILY')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeReportType === 'DAILY'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily Roll Call
        </button>
        <button
          onClick={() => setActiveReportType('LATE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeReportType === 'LATE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Late Arrival Report ({lateRecords.length})
        </button>
        <button
          onClick={() => setActiveReportType('ABSENCE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeReportType === 'ABSENCE'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Absence Report ({absentRecords.length})
        </button>
        <button
          onClick={() => setActiveReportType('MISSING_OUT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeReportType === 'MISSING_OUT'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Missing Clock-Out ({missingOutRecords.length})
        </button>
      </div>

      {/* Formal Printable Document Canvas */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-md p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
        {/* Formal School Letterhead */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-950 to-sky-700 flex items-center justify-center font-black text-white text-xl shadow-md border-2 border-slate-900">
              RC
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase">
                {settings.schoolName}
              </h2>
              <p className="text-xs font-bold text-sky-800 tracking-wider">
                {settings.motto} • ACADEMIC SESSION {settings.academicSession}
              </p>
              <p className="text-[11px] text-slate-500">
                P.O. Box 4820 Victoria Island, Lagos, Nigeria • registrar@royalcrest.sch.ng
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 text-xs text-slate-600 space-y-0.5">
            <div><strong>Report Reference:</strong> <span className="font-mono">RCIS/ATT/2026/M10</span></div>
            <div><strong>Date of Issue:</strong> 06 October 2026</div>
            <div><strong>Academic Term:</strong> {settings.academicTerm}</div>
            <div><strong>Terminal Sync Status:</strong> <span className="text-emerald-700 font-bold">100% Certified</span></div>
          </div>
        </div>

        {/* Report Title & Metadata */}
        <div className="my-6">
          <div className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
            Executive Administrative Summary
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase">
            {activeReportType === 'MONTHLY_PRINCIPAL' && 'Comprehensive Staff Monthly Attendance & Punctuality Ledger'}
            {activeReportType === 'DAILY' && "Daily Staff Physical Attendance Roll Call (06 Oct 2026)"}
            {activeReportType === 'LATE' && "Late Arrivals & Threshold Infraction Summary"}
            {activeReportType === 'ABSENCE' && "Staff Absence & Leave Authorization Report"}
            {activeReportType === 'MISSING_OUT' && "Unreconciled Clock-Out Exception Report"}
          </h3>
          <p className="text-xs text-slate-500">
            Certified record derived from offline-hardened biometric QR gate & reception terminals.
          </p>
        </div>

        {/* Summary Metrics Banner */}
        <div className="grid grid-cols-4 gap-3 my-6 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Staff</span>
            <span className="text-xl font-black text-slate-900">{teachers.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-700 block text-[10px] font-bold uppercase">Present Today</span>
            <span className="text-xl font-black text-emerald-800">43 (86%)</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-amber-700 block text-[10px] font-bold uppercase">Late Today</span>
            <span className="text-xl font-black text-amber-800">7 (14%)</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-rose-700 block text-[10px] font-bold uppercase">Absent / Leave</span>
            <span className="text-xl font-black text-rose-800">3 (6%)</span>
          </div>
        </div>

        {/* Report Data Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden mt-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Staff ID</th>
                <th className="py-2.5 px-3">Staff Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Position</th>
                {activeReportType === 'MONTHLY_PRINCIPAL' ? (
                  <>
                    <th className="py-2.5 px-3 text-center">Present</th>
                    <th className="py-2.5 px-3 text-center">Late</th>
                    <th className="py-2.5 px-3 text-center">Absent</th>
                    <th className="py-2.5 px-3 text-center">Leave</th>
                    <th className="py-2.5 px-3 text-right">Compliance</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3">Clock In</th>
                    <th className="py-2.5 px-3">Clock Out</th>
                    <th className="py-2.5 px-3">Hours</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.slice(0, 15).map((t, idx) => {
                const todayRec = todayRecords.find(r => r.teacherId === t.id);
                const isLate = todayRec?.status === 'Late';
                const isAbsent = todayRec?.status === 'Absent' || t.status === 'On Leave';

                return (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{t.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {t.title} {t.firstName} {t.lastName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{t.department}</td>
                    <td className="py-2.5 px-3 text-slate-500">{t.position}</td>

                    {activeReportType === 'MONTHLY_PRINCIPAL' ? (
                      <>
                        <td className="py-2.5 px-3 text-center font-semibold text-emerald-700">
                          {isAbsent ? 18 : 22}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-amber-700">
                          {isLate ? 4 : 1}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-rose-700">
                          {isAbsent ? 2 : 0}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">
                          {isAbsent ? 2 : 0}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {isAbsent ? '85.7%' : '98.5%'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-3 font-mono">
                          {todayRec?.clockInTime ? todayRec.clockInTime.slice(0, 5) : '--'}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {todayRec?.clockOutTime ? todayRec.clockOutTime.slice(0, 5) : '--'}
                        </td>
                        <td className="py-2.5 px-3">
                          {todayRec?.hoursWorked ? Math.round(todayRec.hoursWorked/60) + ' hrs' : '--'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            todayRec?.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                            todayRec?.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {todayRec?.status || 'Present'}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Formal Signatures & Endorsement Block */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
          <div>
            <div className="font-bold uppercase tracking-wider text-slate-500 mb-8">
              Prepared by: Attendance / HR Officer
            </div>
            <div className="border-b border-slate-400 w-48 mb-1" />
            <div className="font-bold text-slate-900">Mrs. Folake Badmus</div>
            <div className="text-[11px] text-slate-500">Head of Human Resources & Staff Records</div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="font-bold uppercase tracking-wider text-slate-500 mb-8">
              Approved by: School Principal / Proprietor
            </div>
            <div className="border-b border-slate-400 w-48 mb-1" />
            <div className="font-bold text-slate-900">Dr. Olumide Adeleke, Ph.D.</div>
            <div className="text-[11px] text-slate-500">Principal, Royal Crest International School</div>
          </div>
        </div>
      </div>
    </div>
  );
};
