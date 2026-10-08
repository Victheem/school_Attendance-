import React, { useState } from 'react';
import { 
  Building, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  Mail, 
  Phone, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceSettings } from '../../types';

export const SchoolSettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemo } = useApp();

  const [form, setForm] = useState<AttendanceSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">School Profile & System Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure school institutional identity, academic session metadata and offline sync policies
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-sky-600" />
              Institutional Identity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear on official attendance cards, printed principal reports and terminal displays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Official School Name
              </label>
              <input
                type="text"
                required
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Institutional Motto
              </label>
              <input
                type="text"
                value={form.motto}
                onChange={(e) => setForm({ ...form, motto: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                System Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Academic Session
              </label>
              <input
                type="text"
                value={form.academicSession}
                onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Academic Term
              </label>
              <input
                type="text"
                value={form.academicTerm}
                onChange={(e) => setForm({ ...form, academicTerm: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Auto-Sync Interval (Seconds)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={form.autoSyncIntervalSeconds}
                onChange={(e) => setForm({ ...form, autoSyncIntervalSeconds: Number(e.target.value) })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={resetDemo}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Entire Demo Database to Default State</span>
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
