import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Clock, 
  Database, 
  ShieldCheck, 
  AlertCircle,
  Tablet,
  ArrowRight,
  Server,
  HardDrive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';

export const SyncCenter: React.FC = () => {
  const { 
    isOnline, 
    lastSyncTime, 
    syncQueue, 
    triggerSyncNow, 
    isSyncing, 
    devices,
    stats,
    toggleNetworkSimulation,
    activeDeviceId
  } = useApp();

  const [backendHealth, setBackendHealth] = useState<{ status: string; database: string; provider: string } | null>(null);

  useEffect(() => {
    if (isOnline) {
      apiService.checkHealth().then(health => setBackendHealth(health));
    } else {
      setBackendHealth(null);
    }
  }, [isOnline]);

  const handleSync = async () => {
    const res = await triggerSyncNow();
    if (res.syncedCount > 0) {
      alert(`Synchronized ${res.syncedCount} offline record(s) to central database!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Synchronisation Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Offline database ledger, background synchronization telemetry and conflict resolution pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleNetworkSimulation}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-emerald-900 text-emerald-100 border-emerald-500'
            }`}
          >
            {isOnline ? 'Simulate Cut Internet' : 'Restore Simulated Connection'}
          </button>

          <button
            onClick={handleSync}
            disabled={!isOnline || isSyncing || syncQueue.length === 0}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition ${
              !isOnline || syncQueue.length === 0
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/20'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronising Records...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Main Connection Status Hero Card */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 transition-all ${
          isOnline
            ? 'bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200'
            : 'bg-gradient-to-br from-emerald-950/20 to-slate-900 text-slate-100 border-emerald-500/40'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                isOnline
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isOnline ? <Wifi className="w-7 h-7" /> : <WifiOff className="w-7 h-7" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  CONNECTION STATUS
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isOnline
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-emerald-800 text-emerald-100 border border-emerald-400'
                  }`}
                >
                  {isOnline ? 'CONNECTED' : 'OFFLINE MODE ACTIVE'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black mt-1">
                {isOnline ? 'CENTRAL DATABASE ONLINE' : 'OFFLINE MODE — RECORDING ACTIVE'}
              </h2>

              <p className="text-xs mt-1 text-slate-600 dark:text-slate-300 max-w-xl">
                {isOnline
                  ? 'Local terminal IndexedDB is connected to Royal Crest central SQL cloud. Auto-sync active.'
                  : 'Internet connection is unavailable. Attendance recording continues uninterrupted. Queued records will synchronize automatically when internet returns.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Last Sync</span>
              <span className="text-sm font-black font-mono mt-0.5 block">{lastSyncTime}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Pending Sync</span>
              <span className={`text-sm font-black mt-0.5 block ${syncQueue.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {syncQueue.length}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Synced Today</span>
              <span className="text-sm font-black mt-0.5 block text-sky-500">126</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Failed</span>
              <span className="text-sm font-black mt-0.5 block text-emerald-500">0</span>
            </div>
          </div>
        </div>

        {/* Server & Database Diagnostics Bar (Section 31 requirement) */}
        <div className="mt-6 pt-5 border-t border-slate-200/40 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5 bg-white/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <Server className="w-4 h-4 text-sky-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Backend Architecture</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{backendHealth ? 'REST API (Node.js/Express)' : 'Offline Local Fallback'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <HardDrive className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Database Provider</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{backendHealth?.provider || 'IndexedDB Local Cache (Zero Supabase)'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <Tablet className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Active Terminal Device</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeDeviceId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Queue Inspector Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Offline Attendance Buffer Queue ({syncQueue.length})
            </h3>
            <p className="text-xs text-slate-500">
              Hardware-buffered scan events awaiting background reconciliation
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Idempotent Deduplication Protected</span>
          </div>
        </div>

        {syncQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">All Attendance Records Synchronized</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No pending records in terminal cache. Every teacher clock-in is safely verified in the central ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-5">Queue ID</th>
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Time Stamped</th>
                  <th className="py-3 px-4">Terminal Device</th>
                  <th className="py-3 px-4">Sync Status</th>
                  <th className="py-3 px-5 text-right">Retries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syncQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-5 font-mono font-bold text-slate-800">
                      {item.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.personName || item.teacherName}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{item.personId || item.teacherId} • {item.personType || 'Staff'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        {item.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {item.formattedTime}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {item.deviceId} ({item.deviceLocation})
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        PENDING SYNC
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-mono text-slate-500">
                      {item.retryCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
