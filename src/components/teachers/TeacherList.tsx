import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  QrCode, 
  Download, 
  Eye, 
  MoreVertical, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  UserX,
  RefreshCw,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Teacher, DepartmentName } from '../../types';
import { generateTeacherQrToken } from '../../services/qrSecurity';

interface TeacherListProps {
  onSelectTeacher: (teacherId: string) => void;
  onNavigateToQR?: () => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({ onSelectTeacher, onNavigateToQR }) => {
  const { teachers, saveTeacher, regenerateTeacherQr, attendanceRecords } = useApp();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New teacher form state
  const [newTeacher, setNewTeacher] = useState({
    title: 'Mr.' as const,
    firstName: '',
    lastName: '',
    gender: 'Male' as const,
    email: '',
    phone: '',
    department: 'Mathematics' as DepartmentName,
    position: 'Teacher',
    employmentDate: '2026-09-01',
    employmentType: 'Full-time' as const,
    status: 'Active' as const,
  });

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = `${t.firstName} ${t.lastName} ${t.id} ${t.phone} ${t.department}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleToggleStatus = async (teacher: Teacher) => {
    const nextStatus = teacher.status === 'Active' ? 'Suspended' : 'Active';
    await saveTeacher({
      ...teacher,
      status: nextStatus,
    });
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.firstName || !newTeacher.lastName) {
      alert('Please fill in First and Last Name');
      return;
    }

    const nextIdNum = teachers.length + 1;
    const staffId = `TCH-${String(nextIdNum).padStart(5, '0')}`;
    const qrToken = generateTeacherQrToken(staffId);

    const fullName = `${newTeacher.title} ${newTeacher.firstName} ${newTeacher.lastName}`.trim();
    const created: Teacher = {
      id: staffId,
      uuid: `uuid-${staffId.toLowerCase()}`,
      fullName,
      title: newTeacher.title,
      firstName: newTeacher.firstName,
      lastName: newTeacher.lastName,
      gender: newTeacher.gender,
      email: newTeacher.email || `${newTeacher.firstName.toLowerCase()}.${newTeacher.lastName.toLowerCase()}@royalcrest.sch.ng`,
      phone: newTeacher.phone || '+234 800 000 0000',
      category: 'Teacher',
      departmentOrClass: newTeacher.department,
      department: newTeacher.department,
      position: newTeacher.position,
      employmentDate: newTeacher.employmentDate,
      status: newTeacher.status,
      attendanceMethod: 'QR',
      shiftId: 'shift-teachers',
      qrToken,
      qrGeneratedAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    await saveTeacher(created);
    setIsAddModalOpen(false);
    setNewTeacher({
      title: 'Mr.',
      firstName: '',
      lastName: '',
      gender: 'Male',
      email: '',
      phone: '',
      department: 'Mathematics',
      position: 'Teacher',
      employmentDate: '2026-09-01',
      employmentType: 'Full-time',
      status: 'Active',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Staff & Teacher Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic and administrative personnel, credentials and biometric QR badges
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateToQR && (
            <button
              onClick={onNavigateToQR}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <QrCode className="w-3.5 h-3.5 text-sky-600" />
              <span>Print All Badges</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, phone, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Departments (10)</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Science">Science</option>
            <option value="Social Studies">Social Studies</option>
            <option value="ICT">ICT</option>
            <option value="Early Years">Early Years</option>
            <option value="Primary">Primary</option>
            <option value="Administration">Administration</option>
            <option value="Languages">Languages</option>
            <option value="Humanities">Humanities</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Employment Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{filteredTeachers.length}</strong> of {teachers.length} teachers
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-5">Staff ID</th>
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">QR Status</th>
                <th className="py-3 px-4">Today's Attendance</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTeachers.map((t) => {
                const todayRec = attendanceRecords.find(r => r.teacherId === t.id && r.date === '2026-10-06');
                const isClockedIn = todayRec && todayRec.clockInTime;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Staff ID */}
                    <td className="py-3 px-5 font-mono font-bold text-slate-800">
                      {t.id}
                    </td>

                    {/* Teacher Photo & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.avatar}
                          alt={t.firstName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <button
                            onClick={() => onSelectTeacher(t.id)}
                            className="font-bold text-slate-900 hover:text-sky-600 text-left transition"
                          >
                            {t.title} {t.firstName} {t.lastName}
                          </button>
                          <span className="block text-[11px] text-slate-400">{t.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 font-medium text-slate-700">{t.department}</td>

                    {/* Position */}
                    <td className="py-3 px-4 text-slate-600">{t.position}</td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{t.phone}</td>

                    {/* QR Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {t.status === 'Active' ? 'Active Badge' : 'Revoked'}
                      </span>
                    </td>

                    {/* Today's Attendance */}
                    <td className="py-3 px-4">
                      {isClockedIn ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>In: {todayRec.clockInTime?.slice(0, 5)}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not Clocked In</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectTeacher(t.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition"
                          title="View Profile & Attendance History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => regenerateTeacherQr(t.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                          title="Regenerate QR Code Security Token"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(t)}
                          className={`p-1.5 rounded-lg transition ${
                            t.status === 'Active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-rose-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={t.status === 'Active' ? 'Revoke/Disable Badge' : 'Reactivate Badge'}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 my-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Teacher</h3>
                <p className="text-xs text-slate-500">Auto-generates a secure signed QR credential</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Title</label>
                  <select
                    value={newTeacher.title}
                    onChange={(e: any) => setNewTeacher({ ...newTeacher, title: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Engr.">Engr.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.firstName}
                    onChange={(e) => setNewTeacher({ ...newTeacher, firstName: e.target.value })}
                    placeholder="e.g. Oluwaseun"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.lastName}
                    onChange={(e) => setNewTeacher({ ...newTeacher, lastName: e.target.value })}
                    placeholder="e.g. Bakare"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Department</label>
                  <select
                    value={newTeacher.department}
                    onChange={(e: any) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Science">Science</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="ICT">ICT</option>
                    <option value="Early Years">Early Years</option>
                    <option value="Primary">Primary</option>
                    <option value="Administration">Administration</option>
                    <option value="Languages">Languages</option>
                    <option value="Humanities">Humanities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Position</label>
                  <input
                    type="text"
                    value={newTeacher.position}
                    onChange={(e) => setNewTeacher({ ...newTeacher, position: e.target.value })}
                    placeholder="e.g. Senior Teacher"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    placeholder="+234 803 000 0000"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Gender</label>
                  <select
                    value={newTeacher.gender}
                    onChange={(e: any) => setNewTeacher({ ...newTeacher, gender: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>A unique high-security QR attendance token will be generated immediately.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 shadow-sm"
                >
                  Create & Generate QR Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
