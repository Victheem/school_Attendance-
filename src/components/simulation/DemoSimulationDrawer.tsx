import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  QrCode, 
  Search, 
  KeyRound, 
  GraduationCap, 
  Play
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DemoSimulationDrawerProps {
  onNavigateToTab?: (tab: string) => void;
}

export const DemoSimulationDrawer: React.FC<DemoSimulationDrawerProps> = ({ onNavigateToTab }) => {
  const { 
    isOnline, 
    toggleNetworkSimulation, 
    isSimulatedOffline, 
    triggerSyncNow, 
    isSyncing, 
    syncQueue,
    processQrScan,
    recordQuickAttendance,
    recordPinAttendance,
    recordClassRegister,
    resetDemo
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepNote, setStepNote] = useState<string>('Online baseline active. Ready for Multi-Person School Attendance demonstration.');

  // Step 1: Teacher scans QR (Online)
  const runStep1 = async () => {
    if (isSimulatedOffline) toggleNetworkSimulation();
    const res = await processQrScan('TCH-00023', 'CLOCK_IN');
    setCurrentStep(1);
    setStepNote('✓ Step 1: Mrs. Grace Okafor (Teacher) clocked in via QR Scanner (Online Synced).');
    if (onNavigateToTab) onNavigateToTab('dashboard');
  };

  // Step 2: Cleaner uses Quick Attendance (Online)
  const runStep2 = async () => {
    const res = await recordQuickAttendance('CLN-0012', 'CLOCK_IN', 'No QR Card / Verified Roster');
    setCurrentStep(2);
    setStepNote('✓ Step 2: Grace Bello (Cleaner) clocked in via Quick Attendance by Officer.');
    if (onNavigateToTab) onNavigateToTab('dashboard');
  };

  // Step 3: Driver uses PIN (Online)
  const runStep3 = async () => {
    const res = await recordPinAttendance('DRV-0001', '3819', 'CLOCK_IN');
    setCurrentStep(3);
    setStepNote('✓ Step 3: Ibrahim Musa (Bus Driver) clocked in with PIN code. Bus 04 On Duty.');
    if (onNavigateToTab) onNavigateToTab('dashboard');
  };

  // Step 4: Student class register (Online)
  const runStep4 = async () => {
    await recordClassRegister('class-jss2a', '2026-10-06', [
      { studentId: 'STU-0071', status: 'Present' },
      { studentId: 'STU-0072', status: 'Present' },
      { studentId: 'STU-0073', status: 'Late' },
    ]);
    setCurrentStep(4);
    setStepNote('✓ Step 4: JSS 2A Form Teacher submitted student morning roll call.');
    if (onNavigateToTab) onNavigateToTab('students');
  };

  // Step 5: Cut internet (Switch OFFLINE)
  const runStep5 = () => {
    if (!isSimulatedOffline) toggleNetworkSimulation();
    setCurrentStep(5);
    setStepNote('⚡ Step 5: Internet connection CUT! Offline Mode active. No operations interrupted.');
  };

  // Step 6: Another teacher scans QR offline
  const runStep6 = async () => {
    await processQrScan('TCH-00001', 'CLOCK_IN');
    setCurrentStep(6);
    setStepNote('✓ Step 6: Mr. Daniel Ibrahim scanned QR offline. Event cached in local IndexedDB.');
    if (onNavigateToTab) onNavigateToTab('sync');
  };

  // Step 7: Another cleaner uses Quick Attendance offline
  const runStep7 = async () => {
    await recordQuickAttendance('CLN-0013', 'CLOCK_IN', 'Cleaner Badge Forgotten');
    setCurrentStep(7);
    setStepNote('✓ Step 7: Chinedu Okeke (Cleaner) clocked in offline via Quick Attendance.');
    if (onNavigateToTab) onNavigateToTab('sync');
  };

  // Step 8: Teacher records student class attendance offline
  const runStep8 = async () => {
    await recordClassRegister('class-jss1a', '2026-10-06', [
      { studentId: 'STU-0001', status: 'Present' },
      { studentId: 'STU-0002', status: 'Present' },
    ]);
    setCurrentStep(8);
    setStepNote(`✓ Step 8: Class register recorded offline! Total pending buffer: ${syncQueue.length + 1} records.`);
    if (onNavigateToTab) onNavigateToTab('sync');
  };

  // Step 9: Restore internet
  const runStep9 = () => {
    if (isSimulatedOffline) toggleNetworkSimulation();
    setCurrentStep(9);
    setStepNote('⚡ Step 9: Internet restored! Auto background synchronization triggered.');
  };

  // Step 10: Automatic synchronization
  const runStep10 = async () => {
    const res = await triggerSyncNow();
    setCurrentStep(10);
    setStepNote(`✓ Step 10: All records reconciled into central SQL database! Synced: ${res.syncedCount}.`);
    if (onNavigateToTab) onNavigateToTab('dashboard');
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 bg-sky-950 px-2.5 py-1 rounded-md border border-sky-800">
              Workforce OS Presentation Demo
            </span>

            {/* Offline simulation toggle */}
            <button
              onClick={toggleNetworkSimulation}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-emerald-900 text-emerald-100 border border-emerald-400'
              }`}
              title="Click to simulate network outage"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Network: ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-emerald-300" />
                  <span>OFFLINE MODE (Recording Active)</span>
                </>
              )}
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-white/90">
                {isOnline ? 'Simulate Cut' : 'Restore Net'}
              </span>
            </button>

            {syncQueue.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {syncQueue.length} pending offline sync
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Full 10-Step Interactive Demo</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={resetDemo}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-slate-800"
              title="Reset all demo data back to baseline"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Flow Drawer */}
        {isOpen && (
          <div className="mt-3 pt-3 border-t border-slate-800 animate-in fade-in">
            <div className="text-xs text-slate-300 mb-2 flex items-center justify-between">
              <div>
                <strong className="text-white">Active Simulation Progress:</strong>{' '}
                <span className="text-sky-300">{stepNote}</span>
              </div>
              <span className="text-[11px] text-slate-400">Step {currentStep} of 10</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 text-[11px]">
              <button
                onClick={runStep1}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 1 ? 'bg-sky-900 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-sky-400">1. Teacher QR</div>
                <div className="text-[10px]">Online clock-in</div>
              </button>

              <button
                onClick={runStep2}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 2 ? 'bg-sky-900 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-emerald-400">2. Cleaner</div>
                <div className="text-[10px]">Quick Attendance</div>
              </button>

              <button
                onClick={runStep3}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 3 ? 'bg-sky-900 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-amber-400">3. Driver PIN</div>
                <div className="text-[10px]">Bus 04 duty</div>
              </button>

              <button
                onClick={runStep4}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 4 ? 'bg-sky-900 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-indigo-400">4. Class Reg</div>
                <div className="text-[10px]">Student roll call</div>
              </button>

              <button
                onClick={runStep5}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 5 ? 'bg-amber-950 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-rose-400">5. Cut Net</div>
                <div className="text-[10px]">Simulate outage</div>
              </button>

              <button
                onClick={runStep6}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 6 ? 'bg-sky-900 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-sky-400">6. Offline QR</div>
                <div className="text-[10px]">Scan teacher</div>
              </button>

              <button
                onClick={runStep7}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 7 ? 'bg-sky-900 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-emerald-400">7. Offline Quick</div>
                <div className="text-[10px]">Clock in cleaner</div>
              </button>

              <button
                onClick={runStep8}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 8 ? 'bg-sky-900 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-indigo-400">8. Offline Class</div>
                <div className="text-[10px]">Buffer register</div>
              </button>

              <button
                onClick={runStep9}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 9 ? 'bg-emerald-950 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-emerald-400">9. Restore Net</div>
                <div className="text-[10px]">Re-enable network</div>
              </button>

              <button
                onClick={runStep10}
                disabled={isSyncing}
                className={`p-2 rounded-xl text-left border transition ${
                  currentStep === 10 ? 'bg-emerald-900 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-emerald-400">10. Auto Sync</div>
                <div className="text-[10px]">Verify central DB</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
