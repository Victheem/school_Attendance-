import React from 'react';
import { Building, Users, UserCheck, Clock, Award, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS_DATA } from '../../services/seedData';

interface DepartmentsViewProps {
  onSelectDepartmentFilter?: (dept: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ onSelectDepartmentFilter }) => {
  const { teachers, attendanceRecords } = useApp();

  const todayRecords = attendanceRecords.filter(r => r.date === '2026-10-06');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Academic & Administrative Departments</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Overview of faculty faculties, staff distribution and real-time daily attendance adherence
        </p>
      </div>

      {/* Grid of 10 Departments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEPARTMENTS_DATA.map((dept) => {
          const deptTeachers = teachers.filter(t => (t.departmentOrClass === dept.name || t.department === dept.name));
          const deptTodayRecords = todayRecords.filter(r => (r.department_or_class === dept.name || r.department === dept.name));
          const presentCount = deptTodayRecords.filter(r => r.status === 'Present').length;
          const lateCount = deptTodayRecords.filter(r => r.status === 'Late').length;
          const absentCount = deptTeachers.length - (presentCount + lateCount);
          const complianceRate = deptTeachers.length > 0 
            ? Math.round(((presentCount + lateCount) / deptTeachers.length) * 100) 
            : 100;

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`w-3 h-3 rounded-full ${dept.color}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {dept.id}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 mt-2">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-sky-600" />
                  <span>HOD: <strong className="text-slate-700">{dept.headOfDepartment}</strong></span>
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Staff</span>
                    <span className="text-sm font-black text-slate-900">{deptTeachers.length}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-600 block">Present</span>
                    <span className="text-sm font-black text-emerald-700">{presentCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[10px] text-amber-600 block">Late</span>
                    <span className="text-sm font-black text-amber-700">{lateCount}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Today's Compliance</span>
                    <span className="text-sky-700 font-bold">{complianceRate}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        complianceRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${complianceRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {onSelectDepartmentFilter && (
                <button
                  onClick={() => onSelectDepartmentFilter(dept.name)}
                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 hover:text-sky-700 font-bold transition"
                >
                  <span>View Staff Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
