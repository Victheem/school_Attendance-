import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Search, 
  Users, 
  KeyRound, 
  Camera, 
  CameraOff, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Building, 
  Wifi, 
  WifiOff, 
  Maximize2, 
  Minimize2, 
  LogOut, 
  Sparkles, 
  ChevronRight, 
  UserCheck, 
  Bus, 
  Shield, 
  Briefcase, 
  Check, 
  X,
  GraduationCap,
  LayoutDashboard,
  UserPlus,
  ArrowLeft,
  Printer,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Person, Student, AttendanceStatus, PersonCategory, AttendanceMethod } from '../../types';
import { generateTeacherQrToken, generateQrDataUrl } from '../../services/qrSecurity';

interface QRAttendanceKioskProps {
  onExitKiosk?: () => void;
  onNavigateToDashboard?: () => void;
  onOpenCreateStaff?: () => void;
}

export const QRAttendanceKiosk: React.FC<QRAttendanceKioskProps> = ({ 
  onExitKiosk, 
  onNavigateToDashboard, 
  onOpenCreateStaff 
}) => {
  const { 
    isOnline, 
    processQrScan, 
    recordQuickAttendance, 
    recordPinAttendance, 
    recordClassRegister, 
    people, 
    students, 
    classes, 
    settings, 
    activeDeviceId, 
    devices,
    syncQueue,
    currentUser,
    switchUser,
    savePerson
  } = useApp();

  // Kiosk Primary Modes
  const [terminalMode, setTerminalMode] = useState<'SCAN_QR' | 'QUICK_ATTENDANCE' | 'CLASS_REGISTER' | 'PIN_ENTRY'>('SCAN_QR');
  
  // General State
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // In-Kiosk Create Staff Modal State
  const [isCreateStaffModalOpen, setIsCreateStaffModalOpen] = useState<boolean>(false);
  const [createdStaffSuccess, setCreatedStaffSuccess] = useState<Person | null>(null);
  const [createdStaffQrUrl, setCreatedStaffQrUrl] = useState<string>('');
  const [newStaffForm, setNewStaffForm] = useState({
    title: 'Mr.' as any,
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    email: '',
    phone: '',
    category: 'Teacher' as PersonCategory,
    departmentOrClass: 'Mathematics',
    position: 'Teacher',
    attendanceMethod: 'QR' as AttendanceMethod,
    pinCode: '4826',
    shiftId: 'shift-teachers',
    vehicleName: '',
    registration: '',
    route: '',
  });

  // Quick Attendance Search state
  const [quickSearch, setQuickSearch] = useState<string>('');
  const [selectedQuickPerson, setSelectedQuickPerson] = useState<Person | null>(null);
  const [quickReason, setQuickReason] = useState<string>('No QR Card / Verified Roster');

  // PIN Entry state
  const [pinStaffId, setPinStaffId] = useState<string>('DRV-0001');
  const [pinCode, setPinCode] = useState<string>('3819');

  // Class Register state
  const [selectedClassId, setSelectedClassId] = useState<string>('class-jss2a');
  const [classAttendanceEntries, setClassAttendanceEntries] = useState<Record<string, AttendanceStatus>>({});
  const [classSavedMessage, setClassSavedMessage] = useState<string | null>(null);

  // Demo Scan Modal
  const [showDemoStaffPicker, setShowDemoStaffPicker] = useState<boolean>(false);
  const [demoSearch, setDemoSearch] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize class register entries when class changes
  useEffect(() => {
    const targetClass = classes.find(c => c.id === selectedClassId) || classes[0];
    const classStudents = students.filter(s => s.classId === targetClass.id);
    const initialMap: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      initialMap[s.id] = 'Present';
    });
    setClassAttendanceEntries(initialMap);
  }, [selectedClassId, classes, students]);

  // Feedback timer auto reset
  useEffect(() => {
    if (!feedback) return;
    setCountdown(4);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFeedback(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [feedback]);

  // Camera handling
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError('Camera unavailable in current environment. Use the "Demo Quick Scan" button.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleScanToken = async (token: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await processQrScan(token);
      setFeedback(res);
      setShowDemoStaffPicker(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickClockAction = async (action: 'CLOCK_IN' | 'CLOCK_OUT') => {
    if (!selectedQuickPerson || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await recordQuickAttendance(selectedQuickPerson.id, action, quickReason);
      setFeedback(res);
      setSelectedQuickPerson(null);
      setQuickSearch('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePinSubmit = async (action: 'CLOCK_IN' | 'CLOCK_OUT') => {
    if (!pinStaffId || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await recordPinAttendance(pinStaffId, pinCode, action);
      setFeedback(res);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAllClassPresent = () => {
    const targetClass = classes.find(c => c.id === selectedClassId) || classes[0];
    const classStudents = students.filter(s => s.classId === targetClass.id);
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      updated[s.id] = 'Present';
    });
    setClassAttendanceEntries(updated);
  };

  const handleSubmitClassRegister = async () => {
    const entries = Object.entries(classAttendanceEntries).map(([studentId, status]) => ({
      studentId,
      status,
    }));
    const res = await recordClassRegister(selectedClassId, '2026-10-06', entries);
    setClassSavedMessage(`✓ Successfully recorded attendance for ${res.savedCount} students! Mode: ${isOnline ? 'Online Synced' : 'Offline Cached'}`);
    setTimeout(() => setClassSavedMessage(null), 4000);
  };

  const handleCreateNewStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.firstName || !newStaffForm.lastName) return;

    let prefix = 'STF';
    if (newStaffForm.category === 'Teacher') prefix = 'TCH';
    else if (newStaffForm.category === 'Cleaner') prefix = 'CLN';
    else if (newStaffForm.category === 'Driver') prefix = 'DRV';
    else if (newStaffForm.category === 'Security') prefix = 'SEC';
    else if (newStaffForm.category === 'Maintenance') prefix = 'MNT';

    const staffId = `${prefix}-${Date.now().toString().slice(-4)}`;
    const qrToken = generateTeacherQrToken(staffId);
    const qrDataUrl = await generateQrDataUrl(qrToken);

    const created: Person = {
      id: staffId,
      uuid: `uuid-${staffId.toLowerCase()}`,
      fullName: `${newStaffForm.title} ${newStaffForm.firstName} ${newStaffForm.lastName}`,
      firstName: newStaffForm.firstName,
      lastName: newStaffForm.lastName,
      title: newStaffForm.title,
      gender: newStaffForm.gender,
      email: newStaffForm.email || `${newStaffForm.firstName.toLowerCase()}.${newStaffForm.lastName.toLowerCase()}@school.edu.ng`,
      phone: newStaffForm.phone || '+234 800 000 0000',
      category: newStaffForm.category,
      departmentOrClass: newStaffForm.departmentOrClass,
      position: newStaffForm.position,
      employmentDate: '2026-10-06',
      status: 'Active',
      attendanceMethod: newStaffForm.attendanceMethod,
      pinCode: newStaffForm.pinCode,
      shiftId: newStaffForm.shiftId,
      avatar: newStaffForm.gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      qrToken,
      qrGeneratedAt: new Date().toISOString(),
      vehicleInfo: newStaffForm.category === 'Driver' && newStaffForm.vehicleName ? {
        vehicleName: newStaffForm.vehicleName,
        registration: newStaffForm.registration || 'ABC-000-XY',
        route: newStaffForm.route || 'School Route',
        morningShift: '06:30 AM',
        afternoonShift: '03:30 PM',
      } : undefined,
    };

    await savePerson(created);
    setCreatedStaffSuccess(created);
    setCreatedStaffQrUrl(qrDataUrl);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeDevice = devices.find(d => d.id === activeDeviceId) || devices[0];

  // Quick attendance filtered search
  const quickSearchResults = quickSearch.trim()
    ? people.filter(p => 
        `${p.fullName} ${p.id} ${p.category} ${p.departmentOrClass}`.toLowerCase().includes(quickSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  const targetClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === targetClass.id);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Kiosk Terminal Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md px-6 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-800 flex items-center justify-center shadow-md border border-sky-400/30">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide uppercase">
                {settings.schoolName}
              </h1>
              <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                ATTENDANCE TERMINAL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Terminal: <strong className="text-slate-300">{activeDevice?.name || 'Reception Tablet'}</strong> • Location: {activeDevice?.location || 'Main Reception'}
            </p>
          </div>
        </div>

        {/* Telemetry and actions */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-emerald-950/90 border-emerald-400/60 text-emerald-200'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>● ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-emerald-300" />
                <span>● OFFLINE MODE — Attendance recording is active</span>
              </>
            )}
          </div>

          {syncQueue.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{syncQueue.length} pending local sync</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Toggle fullscreen terminal"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Quick Create Staff Action */}
          <button
            onClick={() => setIsCreateStaffModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/50 transition active:scale-95"
            title="Add a new staff member to the school registry"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Staff</span>
          </button>

          {/* General Dashboard Navigation */}
          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-950/50 transition active:scale-95"
              title="Open full School Administration Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>General Dashboard</span>
            </button>
          )}

          {onExitKiosk && !onNavigateToDashboard && (
            <button
              onClick={onExitKiosk}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Kiosk</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector Tabs (Large, Touch-Friendly for Tablets & Kiosks) */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-center gap-3">
        <button
          onClick={() => setTerminalMode('SCAN_QR')}
          className={`flex-1 max-w-xs py-3 px-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
            terminalMode === 'SCAN_QR'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/50 ring-2 ring-sky-400'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>1. SCAN QR CODE</span>
        </button>

        <button
          onClick={() => setTerminalMode('QUICK_ATTENDANCE')}
          className={`flex-1 max-w-xs py-3 px-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
            terminalMode === 'QUICK_ATTENDANCE'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 ring-2 ring-emerald-400'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>2. QUICK ATTENDANCE</span>
        </button>

        <button
          onClick={() => setTerminalMode('CLASS_REGISTER')}
          className={`flex-1 max-w-xs py-3 px-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
            terminalMode === 'CLASS_REGISTER'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 ring-2 ring-indigo-400'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>3. CLASS ATTENDANCE</span>
        </button>

        <button
          onClick={() => setTerminalMode('PIN_ENTRY')}
          className={`py-3 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
            terminalMode === 'PIN_ENTRY'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50 ring-2 ring-amber-400'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
          title="Staff PIN Mode for Cleaners & Drivers"
        >
          <KeyRound className="w-4 h-4" />
          <span className="hidden sm:inline">STAFF PIN</span>
        </button>
      </div>

      {/* Main Terminal Display Body */}
      <div className="flex-1 p-6 flex flex-col justify-center items-center max-w-6xl mx-auto w-full">
        {feedback ? (
          /* Feedback Confirmation Screen */
          <div
            className={`w-full max-w-xl rounded-3xl p-8 border shadow-2xl transition-all ${
              feedback.type === 'SUCCESS'
                ? 'bg-gradient-to-b from-slate-900 to-emerald-950/80 border-emerald-500/50 text-white'
                : feedback.type === 'WARNING'
                ? 'bg-gradient-to-b from-slate-900 to-amber-950/80 border-amber-500/50 text-white'
                : 'bg-gradient-to-b from-slate-900 to-rose-950/80 border-rose-500/50 text-white'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl ${
                  feedback.type === 'SUCCESS' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {feedback.type === 'SUCCESS' ? (
                  <CheckCircle className="w-12 h-12 stroke-[2.5]" />
                ) : (
                  <AlertTriangle className="w-12 h-12 stroke-[2.5]" />
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
                {feedback.type === 'SUCCESS'
                  ? feedback.action === 'CLOCK_IN'
                    ? '✓ CLOCK-IN RECORDED'
                    : '✓ CLOCK-OUT RECORDED'
                  : '⚠ NOTICE'}
              </h2>
              <p className="mt-1 text-sm text-slate-300 font-medium">{feedback.message}</p>
            </div>

            {feedback.person && (
              <div className="mt-6 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <img
                    src={(feedback.person as any).photo || (feedback.person as any).avatar}
                    alt="avatar"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {(feedback.person as any).fullName || `${(feedback.person as any).firstName} ${(feedback.person as any).lastName}`}
                    </h3>
                    <p className="text-xs text-sky-400">
                      {(feedback.person as any).category || 'Student'} • {(feedback.person as any).departmentOrClass || (feedback.person as any).className} • <span className="font-mono text-slate-300">{feedback.person.id}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                  <div className="bg-slate-800/70 p-2.5 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Stamped</span>
                    <span className="text-white font-bold text-sm font-mono">{feedback.time}</span>
                  </div>
                  <div className="bg-slate-800/70 p-2.5 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Rule</span>
                    <span className={`font-bold text-xs uppercase ${feedback.statusText === 'LATE' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {feedback.statusText || 'ON TIME'}
                    </span>
                  </div>
                  <div className="bg-slate-800/70 p-2.5 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Terminal Device</span>
                    <span className="text-white font-mono text-xs">{activeDevice?.id || 'DEVICE-01'}</span>
                  </div>
                  <div className="bg-slate-800/70 p-2.5 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Recorded By</span>
                    <span className="text-slate-200 text-xs truncate block" title={feedback.record?.recorded_by || currentUser.name}>
                      {feedback.record?.recorded_by ? feedback.record.recorded_by.split('(')[0] : currentUser.name.split(' ')[0]}
                    </span>
                  </div>
                  <div className="col-span-2 bg-slate-800/70 p-2.5 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Sync Ledger</span>
                    <span className={`font-bold text-xs ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isOnline ? '● SYNCED (Central Database)' : '● PENDING (Local Encrypted Buffer)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Auto-reset in {countdown}s...</span>
              <button
                onClick={() => setFeedback(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                Scan Next Person
              </button>
            </div>
          </div>
        ) : (
          /* Main Views based on selected mode */
          <>
            {/* MODE 1: SCAN QR */}
            {terminalMode === 'SCAN_QR' && (
              <div className="w-full flex flex-col items-center text-center animate-in fade-in">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  SCAN YOUR STAFF OR STUDENT QR CODE
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-md">
                  Teachers, staff and students: hold your QR card in front of the terminal camera.
                </p>

                {/* Scan Frame */}
                <div className="relative mt-6 w-72 h-72 sm:w-80 sm:h-80 rounded-3xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center shadow-2xl overflow-hidden">
                  <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce pointer-events-none" />
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-sky-400 rounded-tl-xl" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-sky-400 rounded-tr-xl" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-sky-400 rounded-bl-xl" />
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-sky-400 rounded-br-xl" />

                  {isCameraActive ? (
                    <video ref={videoRef} playsInline className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 space-y-3">
                      <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-sky-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300">Scanner Ready</span>
                      <span className="text-[11px] text-slate-500">Offline Cryptographic Engine</span>
                    </div>
                  )}
                </div>

                {cameraError && <p className="text-xs text-amber-400 mt-3">{cameraError}</p>}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={isCameraActive ? stopCamera : startCamera}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700"
                  >
                    {isCameraActive ? <CameraOff className="w-4 h-4 text-rose-400" /> : <Camera className="w-4 h-4 text-sky-400" />}
                    <span>{isCameraActive ? 'Stop Camera' : 'Start Camera'}</span>
                  </button>

                  <button
                    onClick={() => setShowDemoStaffPicker(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-900/40"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Demo Scan Person (Auto Clock In/Out)</span>
                  </button>
                </div>

                {/* Primary Action Buttons Below QR Scanner: No QR, General Dashboard, Create Staff */}
                <div className="mt-8 w-full max-w-xl flex flex-col gap-3">
                  {/* Dedicated "No QR Card" Button */}
                  <button
                    onClick={() => setTerminalMode('QUICK_ATTENDANCE')}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/60 transition transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] border border-emerald-400/30"
                  >
                    <Search className="w-5 h-5" />
                    <span>Don't Have a QR Card? Tap Here for Quick Clock In / Out</span>
                    <ChevronRight className="w-5 h-5 ml-auto text-emerald-200" />
                  </button>

                  {/* Secondary Quick Links Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {onNavigateToDashboard && (
                      <button
                        onClick={onNavigateToDashboard}
                        className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-sky-400" />
                        <span>General Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => setIsCreateStaffModalOpen(true)}
                      className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition"
                    >
                      <UserPlus className="w-4 h-4 text-indigo-400" />
                      <span>+ Create Staff Member</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: QUICK ATTENDANCE */}
            {terminalMode === 'QUICK_ATTENDANCE' && (
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in">
                {/* Security Authorization Guard */}
                {!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ATTENDANCE_OFFICER', 'HR_ADMIN'].includes(currentUser.role) ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">Quick Attendance Restricted</h2>
                      <p className="text-xs text-slate-300 mt-1.5 max-w-md mx-auto">
                        Security Rule: Regular staff and teachers cannot record attendance for other personnel. Only designated <strong>Attendance Officers</strong>, <strong>HR Admins</strong>, or <strong>School Administrators</strong> are authorized.
                      </p>
                      <div className="mt-3 text-[11px] font-mono text-slate-400">
                        Current User: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
                      </div>
                    </div>

                    <button
                      onClick={() => switchUser('ATTENDANCE_OFFICER')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
                    >
                      <span>Switch to Attendance Officer Role (Demo)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Return to QR scanner button */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setTerminalMode('SCAN_QR')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Standby QR Scanner</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {onNavigateToDashboard && (
                          <button
                            onClick={onNavigateToDashboard}
                            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                          >
                            Dashboard →
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                          Offline Quick Attendance Mode
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                          Officer: {currentUser.name.split(' ')[0]}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white mt-2">
                        Search Staff Without QR Card
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Search cleaners, support staff, drivers or teachers to record instant verified attendance
                      </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Type name (e.g. 'Grace', 'Bello', 'Ibrahim', 'Cleaners')..."
                        value={quickSearch}
                        onChange={(e) => {
                          setQuickSearch(e.target.value);
                          setSelectedQuickPerson(null);
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                      />
                    </div>

                    {/* Quick Category filter chips */}
                    <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-[11px]">
                      {['All', 'Cleaners', 'Drivers', 'Security', 'Teachers'].map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            if (chip === 'All') setQuickSearch('');
                            else if (chip === 'Cleaners') setQuickSearch('Cleaner');
                            else if (chip === 'Drivers') setQuickSearch('Driver');
                            else if (chip === 'Security') setQuickSearch('Security');
                            else if (chip === 'Teachers') setQuickSearch('Teacher');
                            setSelectedQuickPerson(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 whitespace-nowrap"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* Search Results List */}
                    {quickSearchResults.length > 0 && !selectedQuickPerson && (
                      <div className="mt-4 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800 bg-slate-800/40 max-h-60 overflow-y-auto">
                        {quickSearchResults.map(p => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedQuickPerson(p)}
                            className="p-3.5 flex items-center justify-between hover:bg-emerald-950/40 cursor-pointer transition"
                          >
                            <div className="flex items-center gap-3">
                              <img src={p.avatar} alt={p.firstName} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                              <div>
                                <div className="font-bold text-sm text-white">{p.fullName}</div>
                                <div className="text-xs text-slate-400">
                                  <span className="text-emerald-400 font-semibold">{p.category}</span> • {p.departmentOrClass} • <span className="font-mono">{p.id}</span>
                                </div>
                              </div>
                            </div>

                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              Select <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Person Action Confirmation Card */}
                    {selectedQuickPerson && (
                      <div className="mt-6 p-6 rounded-2xl bg-slate-800/80 border border-emerald-500/40 animate-in fade-in">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                          <div className="flex items-center gap-4">
                            <img
                              src={selectedQuickPerson.avatar}
                              alt={selectedQuickPerson.firstName}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
                            />
                            <div>
                              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                                {selectedQuickPerson.category}
                              </div>
                              <h3 className="text-xl font-black text-white">{selectedQuickPerson.fullName}</h3>
                              <p className="text-xs text-slate-400">
                                {selectedQuickPerson.position} • {selectedQuickPerson.departmentOrClass} • {selectedQuickPerson.id}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedQuickPerson(null)}
                            className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-700/60 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="my-4">
                          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                            Recorded By & Justification Reason
                          </label>
                          <input
                            type="text"
                            value={quickReason}
                            onChange={(e) => setQuickReason(e.target.value)}
                            placeholder="e.g. No QR Card / Verified Roster"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                          />

                          {/* Reason Preset Buttons */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {['No QR Card', 'Card Forgotten', 'Card Damaged', 'Verified Gate Roster', 'Supervisor Authorized'].map(r => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setQuickReason(r)}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition ${
                                  quickReason === r
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                            <span>Recorded by: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
                            <span className="text-emerald-400 font-semibold">Works 100% Offline</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-5">
                          <button
                            onClick={() => handleQuickClockAction('CLOCK_IN')}
                            disabled={isProcessing}
                            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition active:scale-95"
                          >
                            [ CLOCK IN ]
                          </button>
                          <button
                            onClick={() => handleQuickClockAction('CLOCK_OUT')}
                            disabled={isProcessing}
                            className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition active:scale-95"
                          >
                            [ CLOCK OUT ]
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* MODE 3: CLASS ATTENDANCE */}
            {terminalMode === 'CLASS_REGISTER' && (
              <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-indigo-400" />
                      Class Attendance Register
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Class: <strong className="text-white">{targetClass.name}</strong> • Date: 06 October 2026 • Teacher: {targetClass.classTeacherName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.studentCount} Students)</option>
                      ))}
                    </select>

                    <button
                      onClick={handleMarkAllClassPresent}
                      className="px-3 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs"
                    >
                      [ MARK ALL PRESENT ]
                    </button>
                  </div>
                </div>

                {classSavedMessage && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold text-center">
                    {classSavedMessage}
                  </div>
                )}

                {/* Student list grid */}
                <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-slate-800 pr-1">
                  {classStudents.map((s) => {
                    const status = classAttendanceEntries[s.id] || 'Present';
                    return (
                      <div key={s.id} className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-800/50 rounded-xl transition">
                        <div className="flex items-center gap-3">
                          <img src={s.photo} alt={s.firstName} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                          <div>
                            <div className="font-bold text-sm text-white">{s.fullName}</div>
                            <span className="text-[11px] text-slate-400 font-mono">{s.admissionNumber} • {s.house}</span>
                          </div>
                        </div>

                        {/* Status buttons: Present, Late, Absent, Excused */}
                        <div className="flex items-center gap-1.5">
                          {(['Present', 'Late', 'Absent', 'Excused'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setClassAttendanceEntries(prev => ({ ...prev, [s.id]: st }))}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                status === st
                                  ? st === 'Present' ? 'bg-emerald-600 text-white' :
                                    st === 'Late' ? 'bg-amber-600 text-white' :
                                    st === 'Absent' ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {st === 'Present' ? '✓ Present' : st === 'Late' ? 'L Late' : st === 'Absent' ? 'A Absent' : 'E Excused'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Submission */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 flex items-center gap-4">
                    <span>Present: <strong className="text-emerald-400">{Object.values(classAttendanceEntries).filter(v => v === 'Present').length}</strong></span>
                    <span>Late: <strong className="text-amber-400">{Object.values(classAttendanceEntries).filter(v => v === 'Late').length}</strong></span>
                    <span>Absent: <strong className="text-rose-400">{Object.values(classAttendanceEntries).filter(v => v === 'Absent').length}</strong></span>
                    <span>Excused: <strong className="text-sky-400">{Object.values(classAttendanceEntries).filter(v => v === 'Excused').length}</strong></span>
                  </div>

                  <button
                    onClick={handleSubmitClassRegister}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition"
                  >
                    [ SUBMIT CLASS ATTENDANCE ]
                  </button>
                </div>
              </div>
            )}

            {/* MODE 4: STAFF PIN */}
            {terminalMode === 'PIN_ENTRY' && (
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-white">Staff PIN Attendance</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    For transport drivers, facility cleaners and security staff without QR cards
                  </p>
                </div>

                {/* Quick Staff Presets */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Quick Demo Staff Profiles:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => { setPinStaffId('DRV-0001'); setPinCode('3819'); }}
                      className={`p-1.5 rounded-lg border text-center transition ${pinStaffId === 'DRV-0001' ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                    >
                      <div>Bus Driver</div>
                      <div className="font-mono text-slate-400">DRV-0001</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPinStaffId('CLN-0012'); setPinCode('4826'); }}
                      className={`p-1.5 rounded-lg border text-center transition ${pinStaffId === 'CLN-0012' ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                    >
                      <div>Cleaner</div>
                      <div className="font-mono text-slate-400">CLN-0012</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPinStaffId('SEC-0001'); setPinCode('7721'); }}
                      className={`p-1.5 rounded-lg border text-center transition ${pinStaffId === 'SEC-0001' ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                    >
                      <div>Security</div>
                      <div className="font-mono text-slate-400">SEC-0001</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Staff ID
                    </label>
                    <input
                      type="text"
                      value={pinStaffId}
                      onChange={(e) => setPinStaffId(e.target.value.toUpperCase())}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-center text-lg uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      4-Digit Secret PIN
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={4}
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-center text-xl tracking-widest focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Touch Numpad for Tablet/Kiosk Display */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          if (pinCode.length < 4) setPinCode(prev => prev + num);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white font-bold text-base transition border border-slate-700"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPinCode('')}
                      className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-rose-400 font-bold text-xs uppercase transition border border-slate-700"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (pinCode.length < 4) setPinCode(prev => prev + '0');
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white font-bold text-base transition border border-slate-700"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => setPinCode(prev => prev.slice(0, -1))}
                      className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-amber-400 font-bold text-xs uppercase transition border border-slate-700"
                    >
                      ⌫ Del
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      onClick={() => handlePinSubmit('CLOCK_IN')}
                      disabled={isProcessing || !pinStaffId || pinCode.length !== 4}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                    >
                      [ CLOCK IN ]
                    </button>
                    <button
                      onClick={() => handlePinSubmit('CLOCK_OUT')}
                      disabled={isProcessing || !pinStaffId || pinCode.length !== 4}
                      className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                    >
                      [ CLOCK OUT ]
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Demo Person Picker Modal */}
      {showDemoStaffPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                Select Any School Person to Simulate QR Scan
              </h3>
              <button onClick={() => setShowDemoStaffPicker(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="mt-3 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search teachers, cleaners, drivers, students..."
                value={demoSearch}
                onChange={(e) => setDemoSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              {[...people, ...students.slice(0, 15)]
                .filter(p => `${(p as any).fullName} ${p.id} ${(p as any).category || 'Student'}`.toLowerCase().includes(demoSearch.toLowerCase()))
                .map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleScanToken(p.qrToken)}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-sky-950/60 border border-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={(p as any).avatar || (p as any).photo} alt="avatar" className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-sm text-white">{(p as any).fullName}</div>
                        <div className="text-xs text-slate-400">
                          <span className="text-sky-400">{(p as any).category || 'Student'}</span> • {(p as any).departmentOrClass || (p as any).className} • <span className="font-mono">{p.id}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-700 text-white">Scan</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Terminal Quick Create Staff Member Modal */}
      {isCreateStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            {!createdStaffSuccess ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Add Staff Member</h3>
                      <p className="text-xs text-slate-400">Enroll new teacher, cleaner, driver or support personnel</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreateStaffModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewStaff} className="space-y-4 mt-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Title</label>
                      <select
                        value={newStaffForm.title}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, title: e.target.value as any })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option>Mr.</option>
                        <option>Mrs.</option>
                        <option>Ms.</option>
                        <option>Dr.</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Gender</label>
                      <div className="flex gap-2">
                        {['Male', 'Female'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setNewStaffForm({ ...newStaffForm, gender: g as any })}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                              newStaffForm.gender === g
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Samuel"
                        value={newStaffForm.firstName}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, firstName: e.target.value })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Adeleke"
                        value={newStaffForm.lastName}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, lastName: e.target.value })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Person Category</label>
                      <select
                        value={newStaffForm.category}
                        onChange={(e: any) => {
                          const cat = e.target.value;
                          let defaultDept = 'Facilities';
                          let defaultMethod: AttendanceMethod = 'QUICK_ATTENDANCE';
                          let defaultShift = 'shift-cleaners';

                          if (cat === 'Teacher') {
                            defaultDept = 'Mathematics';
                            defaultMethod = 'QR';
                            defaultShift = 'shift-teachers';
                          } else if (cat === 'Driver') {
                            defaultDept = 'Transport Fleet';
                            defaultMethod = 'PIN';
                            defaultShift = 'shift-drivers';
                          } else if (cat === 'Security') {
                            defaultDept = 'Security Unit';
                            defaultMethod = 'PIN';
                            defaultShift = 'shift-security';
                          } else if (cat === 'Administrator' || cat === 'Management') {
                            defaultDept = 'Administration';
                            defaultMethod = 'QR';
                            defaultShift = 'shift-admin';
                          }

                          setNewStaffForm({
                            ...newStaffForm,
                            category: cat,
                            departmentOrClass: defaultDept,
                            attendanceMethod: defaultMethod,
                            shiftId: defaultShift,
                          });
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="Teacher">Teacher</option>
                        <option value="Cleaner">Cleaner</option>
                        <option value="Driver">Driver</option>
                        <option value="Security">Security</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Kitchen/Catering">Kitchen/Catering</option>
                        <option value="Librarian">Librarian</option>
                        <option value="ICT Staff">ICT Staff</option>
                        <option value="Management">Management</option>
                        <option value="Support Staff">Support Staff</option>
                        <option value="Contract Staff">Contract Staff</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Department / Unit</label>
                      <input
                        type="text"
                        value={newStaffForm.departmentOrClass}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, departmentOrClass: e.target.value })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Attendance Method</label>
                      <select
                        value={newStaffForm.attendanceMethod}
                        onChange={(e: any) => setNewStaffForm({ ...newStaffForm, attendanceMethod: e.target.value })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="QR">QR Code Badge</option>
                        <option value="QUICK_ATTENDANCE">Quick Attendance (No QR Card)</option>
                        <option value="PIN">Staff PIN Code</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">4-Digit PIN Code</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={newStaffForm.pinCode}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, pinCode: e.target.value })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Driver transport details if applicable */}
                  {newStaffForm.category === 'Driver' && (
                    <div className="p-3 bg-slate-800/80 border border-amber-500/30 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold uppercase text-amber-300 block">Driver Transport Fleet Assignment</span>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Bus 05"
                          value={newStaffForm.vehicleName}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, vehicleName: e.target.value })}
                          className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Plate No (e.g. KJA-881-XY)"
                          value={newStaffForm.registration}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, registration: e.target.value })}
                          className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Route (e.g. Maitama → School)"
                          value={newStaffForm.route}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, route: e.target.value })}
                          className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateStaffModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50"
                    >
                      Save & Issue Staff ID
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success confirmation with QR card and Immediate Clock In action */
              <div className="text-center py-4 space-y-5 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Staff Member Created!</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Enrolled into School Workforce Database (Works 100% Offline)
                  </p>
                </div>

                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 text-left flex flex-col sm:flex-row items-center gap-5">
                  {createdStaffQrUrl && (
                    <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                      <img src={createdStaffQrUrl} alt="QR Badge" className="w-28 h-28" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {createdStaffSuccess.category}
                    </span>
                    <h4 className="text-lg font-bold text-white">{createdStaffSuccess.fullName}</h4>
                    <p className="text-xs text-slate-400">ID: <strong className="font-mono text-emerald-400">{createdStaffSuccess.id}</strong></p>
                    <p className="text-xs text-slate-400">Dept: {createdStaffSuccess.departmentOrClass}</p>
                    <p className="text-xs text-slate-400">Method: <strong className="text-slate-200">{createdStaffSuccess.attendanceMethod}</strong> (PIN: <span className="font-mono text-amber-300">{createdStaffSuccess.pinCode}</span>)</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleScanToken(createdStaffSuccess.qrToken);
                      setIsCreateStaffModalOpen(false);
                      setCreatedStaffSuccess(null);
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg"
                  >
                    Auto Clock In Now (QR)
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateStaffModalOpen(false);
                      setCreatedStaffSuccess(null);
                      setTerminalMode('SCAN_QR');
                    }}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
