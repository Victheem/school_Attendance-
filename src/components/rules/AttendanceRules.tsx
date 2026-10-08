import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Calendar, 
  Play, 
  Sliders, 
  Info,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceSettings } from '../../types';

export const AttendanceRules: React.FC = () => {
  const { settings, updateSettings, attendanceRecords } = useApp();

  const [formSettings, setFormSettings] = useState<AttendanceSettings>({ ...settings });
  const [testTime, setTestTime] = useState<string>('08:07');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Late and Early departure counts from records
  const lateRecords = attendanceRecords.filter(r => r.status === 'Late' && r.date === '2026-10-06');
  const earlyDepartureRecords = attendanceRecords.filter(r => r.status === 'Early Departure' || (r.clockOutTime && r.clockOutTime < '15:45:00'));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Threshold evaluation logic simulation
  const evaluateTestTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const testMins = (h || 0) * 60 + (m || 0);

    const [openH, openM] = formSettings.schoolOpeningTime.split(':').map(Number);
    const openMins = openH * 60 + openM;

    const [lateH, lateM] = formSettings.lateThresholdTime.split(':').map(Number);
    const lateCutoff = lateH * 60 + lateM;

    const [closeH, closeM] = formSettings.expectedClosingTime.split(':').map(Number);
    const closeMins = closeH * 60 + closeM;

    const [earlyH, earlyM] = formSettings.earlyDepartureThresholdTime.split(':').map(Number);
    const earlyCutoff = earlyH * 60 + earlyM;

    if (testMins <= openMins) {
      return { status: 'ON TIME', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', note: 'Standard arrival prior to official opening hour' };
    }
    if (testMins <= lateCutoff) {
      return { status: 'ON TIME / GRACE PERIOD', color: 'text-sky-700 bg-sky-50 border-sky-200', note: `Arrived within allowable ${formSettings.gracePeriodMinutes}-minute grace window` };
    }
    return { status: 'LATE', color: 'text-amber-700 bg-amber-50 border-amber-200', note: 'Arrival exceeded grace threshold. Flagged for HR review.' };
  };

  const testResult = evaluateTestTime(testTime);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Attendance Policy & Time Thresholds</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure official school opening hours, grace period allowances, late penalties and early departure thresholds
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Policy Settings Saved & Synchronized</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                School Operating Windows
              </h2>
              <p className="text-xs text-slate-500">
                These thresholds govern automatic status calculation on the QR Kiosk terminals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* School Opening */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Official School Opening
                </label>
                <div className="text-[11px] text-slate-500 mb-2">Morning bell & arrival deadline</div>
                <input
                  type="time"
                  value={formSettings.schoolOpeningTime}
                  onChange={(e) => setFormSettings({ ...formSettings, schoolOpeningTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm"
                />
              </div>

              {/* Grace Period */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Grace Period (Minutes)
                </label>
                <div className="text-[11px] text-slate-500 mb-2">Tolerance window after opening time</div>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formSettings.gracePeriodMinutes}
                  onChange={(e) => setFormSettings({ ...formSettings, gracePeriodMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm"
                />
              </div>

              {/* Late Threshold */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                  Late Arrival Cutoff
                </label>
                <div className="text-[11px] text-slate-500 mb-2">Arrival past this time marked LATE</div>
                <input
                  type="time"
                  value={formSettings.lateThresholdTime}
                  onChange={(e) => setFormSettings({ ...formSettings, lateThresholdTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm"
                />
              </div>

              {/* Expected Closing */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Expected Closing Time
                </label>
                <div className="text-[11px] text-slate-500 mb-2">Standard school dismissal time</div>
                <input
                  type="time"
                  value={formSettings.expectedClosingTime}
                  onChange={(e) => setFormSettings({ ...formSettings, expectedClosingTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm"
                />
              </div>

              {/* Early Departure Threshold */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
                  Early Departure Threshold
                </label>
                <div className="text-[11px] text-slate-500 mb-2">Clock-out before this hour requires gate pass justification</div>
                <input
                  type="time"
                  value={formSettings.earlyDepartureThresholdTime}
                  onChange={(e) => setFormSettings({ ...formSettings, earlyDepartureThresholdTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm"
                />
              </div>
            </div>

            {/* Working Days */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Active Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const isChecked = formSettings.workingDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => {
                        const next = isChecked
                          ? formSettings.workingDays.filter(d => d !== day)
                          : [...formSettings.workingDays, day];
                        setFormSettings({ ...formSettings, workingDays: next });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        isChecked
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>Save School Attendance Rules</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Interactive Rule Verification Simulator */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              Live Rule Verification
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Test any clock-in time to verify instant kiosk status classification.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Simulated Clock-In Time
              </label>
              <input
                type="time"
                value={testTime}
                onChange={(e) => setTestTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-black text-lg text-slate-800"
              />

              {/* Status Outcome Card */}
              <div className={`p-4 rounded-xl border mt-3 transition ${testResult.color}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Calculated Status
                </div>
                <div className="text-lg font-black tracking-tight mt-0.5">
                  {testResult.status}
                </div>
                <p className="text-xs mt-1">{testResult.note}</p>
              </div>

              {/* Standard presets */}
              <div className="pt-2 text-[11px] text-slate-500">
                <span>Presets: </span>
                <button
                  type="button"
                  onClick={() => setTestTime('07:55')}
                  className="text-sky-600 underline font-semibold mr-2"
                >
                  7:55 AM (Early)
                </button>
                <button
                  type="button"
                  onClick={() => setTestTime('08:07')}
                  className="text-sky-600 underline font-semibold mr-2"
                >
                  8:07 AM (Grace)
                </button>
                <button
                  type="button"
                  onClick={() => setTestTime('08:16')}
                  className="text-sky-600 underline font-semibold"
                >
                  8:16 AM (Late)
                </button>
              </div>
            </div>
          </div>

          {/* Today's Late Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Today's Late Arrivals Logged
            </h3>
            <div className="text-2xl font-black text-amber-600">
              {lateRecords.length} Teachers
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Arrived after 8:10 AM threshold today. Recorded in Audit Log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
