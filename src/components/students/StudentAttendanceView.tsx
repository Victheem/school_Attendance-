import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar, 
  QrCode, 
  Users, 
  CheckCheck,
  ChevronRight,
  Download,
  Building,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, AttendanceStatus } from '../../types';

export const StudentAttendanceView: React.FC = () => {
  const { 
    students, 
    classes, 
    attendanceRecords, 
    recordClassRegister, 
    recordStudentQuickAttendance, 
    isOnline 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'DIRECTORY' | 'QUICK' | 'REPORTS'>('REGISTER');
  const [selectedClassId, setSelectedClassId] = useState<string>('class-jss2a');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [classRegisterMap, setClassRegisterMap] = useState<Record<string, AttendanceStatus>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Load students for active class
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === currentClass.id);

  // Initialize map
  React.useEffect(() => {
    const init: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      init[s.id] = 'Present';
    });
    setClassRegisterMap(init);
  }, [selectedClassId, students]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      updated[s.id] = 'Present';
    });
    setClassRegisterMap(updated);
  };

  const handleSubmitRegister = async () => {
    const entries = Object.entries(classRegisterMap).map(([studentId, status]) => ({
      studentId,
      status,
    }));
    await recordClassRegister(selectedClassId, '2026-10-06', entries);
    const absentCount = entries.filter(e => e.status === 'Absent').length;
    const lateCount = entries.filter(e => e.status === 'Late').length;
    const smsNote = absentCount + lateCount > 0 
      ? ` • Parent SMS Alert queue triggered for ${absentCount + lateCount} parents (MTN/Airtel Gateway)` 
      : '';
    setFeedbackMsg(`✓ Class register recorded for ${entries.length} students (${isOnline ? 'Synced' : 'Saved Offline'})${smsNote}`);
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleStudentQuick = async (studentId: string, status: AttendanceStatus) => {
    await recordStudentQuickAttendance(studentId, status);
    setFeedbackMsg(`✓ Student marked as ${status}`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Student Attendance & Class Registers</h1>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
              175 Active Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer roll calls, classroom registers, student QR badges and term attendance percentages
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'REGISTER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Class Register
          </button>
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'DIRECTORY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Directory
          </button>
          <button
            onClick={() => setActiveTab('QUICK')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'QUICK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quick Attendance
          </button>
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'REPORTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Term Rates %
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-in fade-in">
          {feedbackMsg}
        </div>
      )}

      {/* VIEW 1: CLASS REGISTER */}
      {activeTab === 'REGISTER' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="p-2 border border-slate-300 rounded-xl text-sm font-black text-slate-900 bg-slate-50 focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                  ))}
                </select>

                <div className="text-xs text-slate-500">
                  Form Teacher: <strong className="text-slate-800">{currentClass.classTeacherName}</strong> • Date: <strong>06 Oct 2026</strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleMarkAllPresent}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
            >
              [ MARK ALL PRESENT ]
            </button>
          </div>

          {/* Student roll call table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Adm No.</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">House</th>
                  <th className="py-2.5 px-3">Parent Contact</th>
                  <th className="py-2.5 px-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((s) => {
                  const status = classRegisterMap[s.id] || 'Present';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.admissionNumber}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <img src={s.photo} alt={s.firstName} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                        <span>{s.fullName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{s.house}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{s.parentPhone}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {(['Present', 'Late', 'Absent', 'Excused'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setClassRegisterMap(prev => ({ ...prev, [s.id]: st }))}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                                status === st
                                  ? st === 'Present' ? 'bg-emerald-600 text-white' :
                                    st === 'Late' ? 'bg-amber-600 text-white' :
                                    st === 'Absent' ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Present: <strong className="text-emerald-700">{Object.values(classRegisterMap).filter(v => v === 'Present').length}</strong> • 
              Late: <strong className="text-amber-700">{Object.values(classRegisterMap).filter(v => v === 'Late').length}</strong> • 
              Absent: <strong className="text-rose-700">{Object.values(classRegisterMap).filter(v => v === 'Absent').length}</strong> • 
              Excused: <strong className="text-sky-700">{Object.values(classRegisterMap).filter(v => v === 'Excused').length}</strong>
            </div>

            <button
              onClick={handleSubmitRegister}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              [ SUBMIT CLASS ATTENDANCE REGISTER ]
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name, admission number, class..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Admission No</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3">House</th>
                  <th className="py-2.5 px-3">Parent / Guardian</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students
                  .filter(s => `${s.fullName} ${s.admissionNumber} ${s.className}`.toLowerCase().includes(searchStudent.toLowerCase()))
                  .slice(0, 20)
                  .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.admissionNumber}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <img src={s.photo} alt={s.firstName} className="w-7 h-7 rounded-full object-cover" />
                        <span>{s.fullName}</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{s.className}</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.section}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.house}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.parentGuardianName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: STUDENT QUICK ATTENDANCE */}
      {activeTab === 'QUICK' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 max-w-xl mx-auto space-y-4">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900">Student Quick Attendance Search</h3>
            <p className="text-xs text-slate-500">Quickly mark a late or arriving student without QR card</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student (e.g. 'Peter Musa', 'David', 'RCIS/2026/0042')..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {students
              .filter(s => `${s.fullName} ${s.admissionNumber} ${s.className}`.toLowerCase().includes(searchStudent.toLowerCase()))
              .slice(0, 6)
              .map(s => (
                <div key={s.id} className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={s.photo} alt={s.firstName} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">{s.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono">{s.admissionNumber} • {s.className}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStudentQuick(s.id, 'Present')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                    >
                      [ PRESENT ]
                    </button>
                    <button
                      onClick={() => handleStudentQuick(s.id, 'Late')}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold"
                    >
                      [ LATE ]
                    </button>
                    <button
                      onClick={() => handleStudentQuick(s.id, 'Absent')}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                    >
                      [ ABSENT ]
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW 4: TERM RATES & PERCENTAGES */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Term Attendance Compliance Rates</h3>
              <p className="text-xs text-slate-500">Calculated percentage: Present %, Late %, Absent %, Excused %</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Print Student Ledger
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3 text-center">Present (Days)</th>
                  <th className="py-2.5 px-3 text-center">Late</th>
                  <th className="py-2.5 px-3 text-center">Absent</th>
                  <th className="py-2.5 px-3 text-center">Excused</th>
                  <th className="py-2.5 px-3 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.slice(0, 15).map((s, idx) => {
                  const isSampleLate = idx % 5 === 0;
                  const isSampleAbsent = idx === 3;
                  const present = isSampleAbsent ? 20 : 22;
                  const late = isSampleLate ? 2 : 1;
                  const absent = isSampleAbsent ? 2 : 0;
                  const excused = 1;
                  const rate = ((present + (late * 0.5)) / 24 * 100).toFixed(1);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {s.fullName} <span className="font-mono text-slate-400 font-normal">({s.admissionNumber})</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{s.className}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{present}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-700">{late}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-700">{absent}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-sky-700">{excused}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
