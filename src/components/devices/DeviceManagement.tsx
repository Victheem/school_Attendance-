import React, { useState } from 'react';
import { 
  Tablet, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Power, 
  Settings2, 
  MapPin,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceDevice } from '../../types';

export const DeviceManagement: React.FC = () => {
  const { devices, activeDeviceId, setActiveDeviceId, isOnline, triggerSyncNow, isSyncing } = useApp();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    id: `DEVICE-${String(devices.length + 1).padStart(2, '0')}`,
    name: '',
    location: '',
    deviceType: 'Tablet' as const,
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.location) return;
    alert(`Device ${newDevice.id} (${newDevice.name}) successfully registered in school device network.`);
    setIsRegisterModalOpen(false);
    setNewDevice({
      id: `DEVICE-${String(devices.length + 2).padStart(2, '0')}`,
      name: '',
      location: '',
      deviceType: 'Tablet',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Attendance Device & Kiosk Terminals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor and administer hardware attendance tablets deployed across school entrances and faculty blocks
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register Terminal Device</span>
        </button>
      </div>

      {/* Grid of registered devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {devices.map((d) => {
          const isCurrentActive = d.id === activeDeviceId;
          const isDevOnline = d.status === 'ONLINE' && isOnline;

          return (
            <div
              key={d.id}
              className={`bg-white rounded-3xl border-2 p-5 shadow-xs flex flex-col justify-between transition-all ${
                isCurrentActive
                  ? 'border-sky-500 ring-2 ring-sky-200'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {d.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isDevOnline
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {isDevOnline ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>ONLINE</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-emerald-700" />
                        <span>OFFLINE</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <Tablet className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {d.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{d.location}</span>
                    </div>
                  </div>
                </div>

                {/* Device Telemetry */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>IP Address:</span>
                    <span className="font-mono text-slate-900 font-semibold">{d.ipAddress}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Last Seen:</span>
                    <span className="text-slate-900 font-medium">{d.lastSeen}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Last Central Sync:</span>
                    <span className="text-slate-900 font-medium font-mono">{d.lastSyncTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Queued Records:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                      d.pendingRecords > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {d.pendingRecords} {d.pendingRecords === 1 ? 'record' : 'records'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Select as active scanning terminal */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                {isCurrentActive ? (
                  <div className="py-2 text-center text-xs font-bold text-sky-700 bg-sky-50 rounded-xl border border-sky-200">
                    ✓ Selected Kiosk Terminal
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveDeviceId(d.id)}
                    className="w-full py-2 text-center text-xs font-bold text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-800 rounded-xl transition"
                  >
                    Select as Active Scanner
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Register New Attendance Terminal</h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Device ID</label>
                <input
                  type="text"
                  disabled
                  value={newDevice.id}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Terminal Friendly Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports Complex Terminal"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Campus Physical Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Campus Pavilion"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Hardware Form Factor</label>
                <select
                  value={newDevice.deviceType}
                  onChange={(e: any) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Tablet">Android / iOS Tablet</option>
                  <option value="Dedicated Kiosk">Dedicated Stand Kiosk</option>
                  <option value="Mobile Reader">Handheld QR Scanner</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500"
                >
                  Authorize Terminal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
