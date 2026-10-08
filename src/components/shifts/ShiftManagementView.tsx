import React, { useState } from 'react';
import { 
  Clock, 
  Save, 
  Plus, 
  Users, 
  Calendar, 
  Sliders, 
  ShieldCheck, 
  Briefcase,
  Bus,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shift, PersonCategory } from '../../types';

export const ShiftManagementView: React.FC = () => {
  const { shifts, people, saveShift } = useApp();
  const [selectedShiftId, setSelectedShiftId] = useState<string>(shifts[0]?.id || 'shift-teachers');
  const [isSaved, setIsSaved] = useState(false);

  const activeShift = shifts.find(s => s.id === selectedShiftId) || shifts[0];
  const [form, setForm] = useState<Shift>({ ...activeShift });

  React.useEffect(() => {
    if (activeShift) {
      setForm({ ...activeShift });
    }
  }, [activeShift]);

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveShift(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const assignedPeople = people.filter(p => p.shiftId === selectedShiftId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Workforce Shifts & Timetables</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure department work schedules, opening hours, grace periods and late thresholds
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Shift Policy Updated</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Shift List Selector */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            Active School Shifts ({shifts.length})
          </h2>

          <div className="space-y-2">
            {shifts.map((s) => {
              const count = people.filter(p => p.shiftId === s.id).length;
              const isSelected = s.id === selectedShiftId;

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedShiftId(s.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-400 ring-1 ring-sky-300'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{s.name}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {s.startTime} → {s.endTime}
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {count} staff
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Shift Editor & Assigned Staff */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
            <form onSubmit={handleSaveShift} className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-600" />
                  Edit Schedule: {form.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Arrival and departure thresholds apply to all {assignedPeople.length} staff assigned to this shift.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Shift Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Category Filter
                  </label>
                  <input
                    type="text"
                    disabled
                    value={form.category}
                    className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-500 font-semibold"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Shift Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Shift End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Grace Period (Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={form.gracePeriodMinutes}
                    onChange={(e) => setForm({ ...form, gracePeriodMinutes: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Late Arrival Cutoff Time
                  </label>
                  <input
                    type="time"
                    required
                    value={form.lateCutoffTime}
                    onChange={(e) => setForm({ ...form, lateCutoffTime: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Schedule Configuration</span>
                </button>
              </div>
            </form>
          </div>

          {/* Assigned Staff Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Personnel Assigned to this Shift ({assignedPeople.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {assignedPeople.map(p => (
                <div key={p.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                  <img src={p.avatar} alt={p.firstName} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{p.fullName}</div>
                    <div className="text-[11px] text-slate-500">{p.category} • {p.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
