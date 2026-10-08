import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  QrCode, 
  KeyRound, 
  Eye, 
  Bus, 
  Shield, 
  Briefcase, 
  RefreshCw, 
  CheckCircle, 
  X,
  Phone,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Person, PersonCategory, AttendanceMethod } from '../../types';
import { generateTeacherQrToken } from '../../services/qrSecurity';

interface WorkforceDirectoryProps {
  onSelectPerson: (personId: string) => void;
  onNavigateToQR?: () => void;
}

export const WorkforceDirectory: React.FC<WorkforceDirectoryProps> = ({ 
  onSelectPerson,
  onNavigateToQR 
}) => {
  const { people, savePerson, regeneratePersonQr, shifts, attendanceRecords } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form for new staff member
  const [newPerson, setNewPerson] = useState({
    title: 'Mr.' as any,
    firstName: '',
    lastName: '',
    gender: 'Male' as const,
    email: '',
    phone: '',
    category: 'Cleaner' as PersonCategory,
    departmentOrClass: 'Facilities',
    position: 'Staff Worker',
    attendanceMethod: 'QUICK_ATTENDANCE' as AttendanceMethod,
    pinCode: '1234',
    shiftId: 'shift-cleaners',
    vehicleName: '',
    registration: '',
    route: '',
  });

  const categoriesList: PersonCategory[] = [
    'Teacher',
    'Administrator',
    'Cleaner',
    'Security',
    'Driver',
    'Maintenance',
    'Kitchen/Catering',
    'Librarian',
    'ICT Staff',
    'Management',
    'Support Staff',
    'Contract Staff',
  ];

  const filteredPeople = people.filter((p) => {
    const matchesSearch = `${p.fullName} ${p.id} ${p.phone} ${p.category} ${p.departmentOrClass}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.firstName || !newPerson.lastName) return;

    let prefix = 'STF';
    if (newPerson.category === 'Teacher') prefix = 'TCH';
    else if (newPerson.category === 'Cleaner') prefix = 'CLN';
    else if (newPerson.category === 'Driver') prefix = 'DRV';
    else if (newPerson.category === 'Security') prefix = 'SEC';
    else if (newPerson.category === 'Maintenance') prefix = 'MNT';

    const staffId = `${prefix}-${Date.now().toString().slice(-4)}`;
    const qrToken = generateTeacherQrToken(staffId);

    const created: Person = {
      id: staffId,
      uuid: `uuid-${staffId.toLowerCase()}`,
      fullName: `${newPerson.title} ${newPerson.firstName} ${newPerson.lastName}`,
      firstName: newPerson.firstName,
      lastName: newPerson.lastName,
      title: newPerson.title,
      gender: newPerson.gender,
      email: newPerson.email,
      phone: newPerson.phone || '+234 800 000 0000',
      category: newPerson.category,
      departmentOrClass: newPerson.departmentOrClass,
      position: newPerson.position,
      employmentDate: '2026-10-06',
      status: 'Active',
      attendanceMethod: newPerson.attendanceMethod,
      pinCode: newPerson.pinCode,
      shiftId: newPerson.shiftId,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      qrToken,
      qrGeneratedAt: new Date().toISOString(),
      vehicleInfo: newPerson.category === 'Driver' && newPerson.vehicleName ? {
        vehicleName: newPerson.vehicleName,
        registration: newPerson.registration || 'ABC-000-XY',
        route: newPerson.route || 'School Route',
        morningShift: '06:30 AM',
        afternoonShift: '03:30 PM',
      } : undefined,
    };

    await savePerson(created);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Workforce & Staff Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full workforce roster: Teachers, Facility Cleaners, Bus Drivers, Security Guards, Kitchen Crew & Administration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateToQR && (
            <button
              onClick={onNavigateToQR}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-sky-600" />
              <span>Print All Staff Badges</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Workforce Member</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, ID, department, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Categories (75 Staff)</option>
            {categoriesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredPeople.length}</strong> of {people.length} workforce members
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-3 px-5">Staff ID</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department / Fleet</th>
                <th className="py-3 px-4">Preferred Method</th>
                <th className="py-3 px-4">Assigned Shift</th>
                <th className="py-3 px-4">Today's Clock In</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPeople.map((p) => {
                const todayRec = attendanceRecords.find(r => r.person_id === p.id && r.date === '2026-10-06');
                const isClockedIn = todayRec && todayRec.clockInTime;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 font-mono font-bold text-slate-800">{p.id}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={p.avatar} alt={p.firstName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <div>
                          <button
                            onClick={() => onSelectPerson(p.id)}
                            className="font-bold text-slate-900 hover:text-sky-600 text-left transition"
                          >
                            {p.fullName}
                          </button>
                          <span className="block text-[11px] text-slate-400">{p.position}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.category === 'Teacher' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        p.category === 'Cleaner' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        p.category === 'Driver' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        p.category === 'Security' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {p.vehicleInfo ? (
                        <div title={p.vehicleInfo.route}>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Bus className="w-3.5 h-3.5 text-amber-600" /> {p.vehicleInfo.vehicleName.split('(')[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.vehicleInfo.registration}</span>
                        </div>
                      ) : (
                        p.departmentOrClass
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {p.attendanceMethod === 'QUICK_ATTENDANCE' ? 'Quick Roster' : p.attendanceMethod === 'PIN' ? 'PIN Code' : 'QR Badge'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px] font-mono text-slate-500">
                      {shifts.find(s => s.id === p.shiftId)?.name || 'Default Shift'}
                    </td>

                    <td className="py-3 px-4">
                      {isClockedIn ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{todayRec.clockInTime?.slice(0, 5)}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Clocked In</span>
                      )}
                    </td>

                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectPerson(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => regeneratePersonQr(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                          title="Regenerate QR Credential"
                        >
                          <RefreshCw className="w-4 h-4" />
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

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Title</label>
                  <select
                    value={newPerson.title}
                    onChange={(e: any) => setNewPerson({ ...newPerson, title: e.target.value })}
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
                    value={newPerson.firstName}
                    onChange={(e) => setNewPerson({ ...newPerson, firstName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newPerson.lastName}
                    onChange={(e) => setNewPerson({ ...newPerson, lastName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Person Category</label>
                  <select
                    value={newPerson.category}
                    onChange={(e: any) => setNewPerson({ ...newPerson, category: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Department / Unit</label>
                  <input
                    type="text"
                    value={newPerson.departmentOrClass}
                    onChange={(e) => setNewPerson({ ...newPerson, departmentOrClass: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Attendance Method</label>
                  <select
                    value={newPerson.attendanceMethod}
                    onChange={(e: any) => setNewPerson({ ...newPerson, attendanceMethod: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="QR">QR Code Badge</option>
                    <option value="QUICK_ATTENDANCE">Quick Attendance (No Card)</option>
                    <option value="PIN">Staff PIN Code</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Optional 4-Digit PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newPerson.pinCode}
                    onChange={(e) => setNewPerson({ ...newPerson, pinCode: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* If Driver: Transport fields */}
              {newPerson.category === 'Driver' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold uppercase text-amber-800 block">Driver Transport Details</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Vehicle (e.g. Bus 04)"
                      value={newPerson.vehicleName}
                      onChange={(e) => setNewPerson({ ...newPerson, vehicleName: e.target.value })}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Plate Number"
                      value={newPerson.registration}
                      onChange={(e) => setNewPerson({ ...newPerson, registration: e.target.value })}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Assigned Route"
                      value={newPerson.route}
                      onChange={(e) => setNewPerson({ ...newPerson, route: e.target.value })}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500"
                >
                  Save to School Workforce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
