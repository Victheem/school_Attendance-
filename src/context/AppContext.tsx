import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  User, 
  UserRole, 
  Person,
  Teacher, 
  Student, 
  SchoolClass, 
  Shift, 
  AttendanceRecord, 
  SyncQueueItem, 
  AttendanceDevice, 
  AttendanceSettings, 
  LeaveRequest, 
  AuditLog, 
  AppNotification, 
  AttendanceStatus,
  AttendanceMethod,
  EventType,
  PersonCategory
} from '../types';
import { dbService } from '../services/db';
import { apiService } from '../services/apiService';
import { DEMO_USERS, DEFAULT_SETTINGS, SHIFTS_DATA, SCHOOL_CLASSES_DATA } from '../services/seedData';
import { validateQrToken, generateTeacherQrToken } from '../services/qrSecurity';

interface ScanFeedback {
  type: 'SUCCESS' | 'WARNING' | 'ERROR';
  action: 'CLOCK_IN' | 'CLOCK_OUT' | 'PRESENT';
  person?: Person | Student;
  record?: AttendanceRecord;
  message: string;
  time: string;
  clockInTime?: string;
  clockOutTime?: string;
  hoursWorkedFormatted?: string;
  statusText?: string;
  timestamp: number;
}

interface AppContextType {
  currentUser: User;
  switchUser: (role: UserRole) => void;
  isOnline: boolean;
  toggleNetworkSimulation: () => void;
  isSimulatedOffline: boolean;
  lastSyncTime: string;
  isSyncing: boolean;
  triggerSyncNow: () => Promise<{ syncedCount: number }>;
  
  // Data
  people: Person[];
  teachers: Teacher[];
  students: Student[];
  classes: SchoolClass[];
  shifts: Shift[];
  attendanceRecords: AttendanceRecord[];
  syncQueue: SyncQueueItem[];
  devices: AttendanceDevice[];
  settings: AttendanceSettings;
  leaveRequests: LeaveRequest[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  activeDeviceId: string;
  setActiveDeviceId: (id: string) => void;
  
  // 4 Core Attendance Methods
  processQrScan: (token: string, forcedAction?: 'CLOCK_IN' | 'CLOCK_OUT') => Promise<ScanFeedback>;
  recordQuickAttendance: (personId: string, eventType: 'CLOCK_IN' | 'CLOCK_OUT', reason?: string) => Promise<ScanFeedback>;
  recordPinAttendance: (staffId: string, pin: string, eventType?: 'CLOCK_IN' | 'CLOCK_OUT') => Promise<ScanFeedback>;
  recordClassRegister: (classId: string, date: string, entries: { studentId: string; status: AttendanceStatus }[]) => Promise<{ savedCount: number }>;
  recordStudentQuickAttendance: (studentId: string, status: AttendanceStatus) => Promise<ScanFeedback>;

  // Management actions
  adjustAttendance: (recordId: string, updates: { clockInTime?: string; clockOutTime?: string; status: AttendanceStatus; reason: string }) => Promise<boolean>;
  regeneratePersonQr: (personId: string) => Promise<string>;
  regenerateTeacherQr: (teacherId: string) => Promise<string>;
  savePerson: (person: Person) => Promise<void>;
  saveTeacher: (teacher: Teacher) => Promise<void>;
  saveStudent: (student: Student) => Promise<void>;
  saveShift: (shift: Shift) => Promise<void>;
  updateSettings: (newSettings: AttendanceSettings) => Promise<void>;
  handleLeaveAction: (leaveId: string, status: 'Approved' | 'Rejected', remarks?: string) => Promise<void>;
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>) => Promise<void>;
  dismissNotification: (id: string) => void;
  resetDemo: () => Promise<void>;

  // Metrics
  stats: {
    totalPeople: number;
    totalStaff: number;
    totalStudents: number;
    presentToday: number;
    late: number;
    absent: number;
    notClockedOut: number;
    offlineRecords: number;
    synchronized: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function playBeep(type: 'success' | 'warning' | 'error') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'warning') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {
    // browser policy
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [browserOnline, setBrowserOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('2 minutes ago');
  const [activeDeviceId, setActiveDeviceId] = useState<string>('DEVICE-01');

  const [people, setPeople] = useState<Person[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>(SCHOOL_CLASSES_DATA);
  const [shifts, setShifts] = useState<Shift[]>(SHIFTS_DATA);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [devices, setDevices] = useState<AttendanceDevice[]>([]);
  const [settings, setSettings] = useState<AttendanceSettings>(DEFAULT_SETTINGS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Workforce Roll Call Check',
      message: '11 people (staff & students) recorded absent today.',
      type: 'ALERT',
      timestamp: new Date().toISOString(),
      timeAgo: '20 mins ago',
      isRead: false,
      linkTab: 'attendance',
    },
    {
      id: 'notif-2',
      title: 'Late Arrivals Alert',
      message: '18 people arrived past assigned shift threshold.',
      type: 'WARNING',
      timestamp: new Date().toISOString(),
      timeAgo: '45 mins ago',
      isRead: false,
      linkTab: 'late-early',
    },
    {
      id: 'notif-3',
      title: 'Terminal Buffer Status',
      message: 'Science Complex Terminal (DEVICE-03) has 6 queued offline events.',
      type: 'INFO',
      timestamp: new Date().toISOString(),
      timeAgo: '1 hr ago',
      isRead: false,
      linkTab: 'sync',
    },
  ]);

  const effectiveOnline = browserOnline && !isSimulatedOffline;

  const refreshData = useCallback(async () => {
    try {
      await dbService.initialize();
      const [pList, sList, cList, shList, aList, qList, dList, sSet, lList, logList] = await Promise.all([
        dbService.getPeople(),
        dbService.getStudents(),
        dbService.getClasses(),
        dbService.getShifts(),
        dbService.getAttendanceRecords(),
        dbService.getSyncQueue(),
        dbService.getDevices(),
        dbService.getSettings(),
        dbService.getLeaveRequests(),
        dbService.getAuditLogs(),
      ]);
      setPeople(pList);
      setStudents(sList);
      setClasses(cList);
      setShifts(shList);
      setAttendanceRecords(aList);
      setSyncQueue(qList);
      setDevices(dList);
      setSettings(sSet);
      setLeaveRequests(lList);
      setAuditLogs(logList);
    } catch (err) {
      console.error('Failed to load DB state:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();

    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshData]);

  // Synchronisation
  const triggerSyncNow = useCallback(async (): Promise<{ syncedCount: number }> => {
    if (!effectiveOnline) {
      return { syncedCount: 0 };
    }

    setIsSyncing(true);
    try {
      const currentQueue = await dbService.getSyncQueue();
      if (currentQueue.length === 0) {
        setLastSyncTime('Just now');
        setIsSyncing(false);
        return { syncedCount: 0 };
      }

      await new Promise(r => setTimeout(r, 650));

      // Synchronize with server REST API /api/attendance/sync
      const syncResult = await apiService.syncOfflineBatch(currentQueue);
      if (syncResult) {
        console.log(`[REST Sync] Processed: ${syncResult.processed}, Duplicates Ignored: ${syncResult.duplicatesIgnored}`);
      }

      const attendance = await dbService.getAttendanceRecords();
      for (const item of currentQueue) {
        const record = attendance.find(a => a.id === item.attendanceId);
        if (record) {
          record.sync_status = 'SYNCED';
          record.updatedAt = new Date().toISOString();
          await dbService.saveAttendanceRecord(record);
        }
      }

      await dbService.clearSyncQueue();

      const currentDevices = await dbService.getDevices();
      for (const d of currentDevices) {
        d.pendingRecords = 0;
        d.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await dbService.saveDevice(d);
      }

      await dbService.addAuditLog({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-GB'),
        user: currentUser.name,
        userRole: currentUser.role,
        action: 'Attendance Batch Synchronized',
        category: 'SYNC',
        details: `Successfully synchronized ${currentQueue.length} offline workforce & student records to central database.`,
        deviceId: activeDeviceId,
      });

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: 'Sync Complete',
          message: `All ${currentQueue.length} offline attendance records synchronized with central SQL ledger.`,
          type: 'SUCCESS',
          timestamp: new Date().toISOString(),
          timeAgo: 'Just now',
          isRead: false,
          linkTab: 'sync',
        },
        ...prev,
      ]);

      setLastSyncTime('Just now');
      await refreshData();
      return { syncedCount: currentQueue.length };
    } finally {
      setIsSyncing(false);
    }
  }, [effectiveOnline, currentUser, activeDeviceId, refreshData]);

  useEffect(() => {
    if (effectiveOnline) {
      dbService.getSyncQueue().then(queue => {
        if (queue.length > 0) triggerSyncNow();
      });
    }
  }, [effectiveOnline, triggerSyncNow]);

  const toggleNetworkSimulation = () => {
    setIsSimulatedOffline(prev => !prev);
  };

  const switchUser = (role: UserRole) => {
    const matched = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(matched);
    apiService.setAuth(matched.role, matched.name);
  };

  const formatMinutesWorked = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Helper: Shift status evaluation
  const calculateShiftStatus = (timeMinutes: number, shift?: Shift): { status: AttendanceStatus; statusText: string } => {
    if (!shift) {
      // Default to 8:00 AM opening
      const open = 8 * 60;
      const lateCutoff = open + 10;
      if (timeMinutes > lateCutoff) return { status: 'Late', statusText: 'LATE' };
      if (timeMinutes > open) return { status: 'Present', statusText: 'ON TIME / GRACE' };
      return { status: 'Present', statusText: 'ON TIME' };
    }

    const [shStartH, shStartM] = shift.startTime.split(':').map(Number);
    const startMins = shStartH * 60 + shStartM;
    const [shLateH, shLateM] = shift.lateCutoffTime.split(':').map(Number);
    const lateMins = shLateH * 60 + shLateM;

    if (timeMinutes > lateMins) return { status: 'Late', statusText: 'LATE' };
    if (timeMinutes > startMins) return { status: 'Present', statusText: 'ON TIME / GRACE' };
    return { status: 'Present', statusText: 'ON TIME' };
  };

  // METHOD A: QR SCANNER (Staff or Student)
  const processQrScan = async (
    token: string, 
    forcedAction?: 'CLOCK_IN' | 'CLOCK_OUT'
  ): Promise<ScanFeedback> => {
    const validation = validateQrToken(token);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeFull = now.toLocaleTimeString('en-GB', { hour12: false });
    const todayStr = '2026-10-06';

    if (!validation.isValid || !validation.teacherId) {
      playBeep('error');
      return {
        type: 'ERROR',
        action: forcedAction || 'CLOCK_IN',
        message: validation.error || 'Invalid or tampered QR code badge',
        time: timeFormatted,
        timestamp: Date.now(),
      };
    }

    const id = validation.teacherId;
    const isStudent = id.startsWith('STU-');
    const person = isStudent 
      ? students.find(s => s.id === id)
      : people.find(p => p.id === id);

    if (!person) {
      playBeep('error');
      return {
        type: 'ERROR',
        action: forcedAction || 'CLOCK_IN',
        message: `ID ${id} not found in school registry`,
        time: timeFormatted,
        timestamp: Date.now(),
      };
    }

    if (person.status === 'Suspended') {
      playBeep('error');
      return {
        type: 'ERROR',
        action: forcedAction || 'CLOCK_IN',
        person,
        message: `Badge disabled. Status: Suspended. Contact Administration.`,
        time: timeFormatted,
        timestamp: Date.now(),
      };
    }

    // Lookup today's record
    const allRecords = await dbService.getAttendanceRecords();
    let record = allRecords.find(r => r.person_id === person.id && r.date === todayStr);

    const activeDevice = devices.find(d => d.id === activeDeviceId) || devices[0];
    const locationName = activeDevice ? activeDevice.location : 'Reception Attendance Tablet';

    const personName = (person as any).fullName || `${(person as any).firstName} ${(person as any).lastName}`;
    const category = (person as any).category || 'Student';
    const deptOrClass = (person as any).departmentOrClass || (person as any).className;

    let targetAction: 'CLOCK_IN' | 'CLOCK_OUT' = forcedAction || (
      record && record.clockInTime ? 'CLOCK_OUT' : 'CLOCK_IN'
    );

    // CLOCK IN
    if (targetAction === 'CLOCK_IN') {
      if (record && record.clockInTime) {
        playBeep('warning');
        return {
          type: 'WARNING',
          action: 'CLOCK_IN',
          person,
          record,
          message: `Already Clocked In: ${personName} clocked in at ${record.clockInTime.slice(0, 5)}.`,
          time: timeFormatted,
          clockInTime: record.clockInTime,
          timestamp: Date.now(),
        };
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const personShift = shifts.find(s => s.id === (person as any).shiftId);
      const { status, statusText } = calculateShiftStatus(currentMinutes, personShift);

      const newRecordId = `ATT-${Date.now().toString().slice(-6)}`;
      const syncStatus = effectiveOnline ? 'SYNCED' : 'PENDING';

      const newRecord: AttendanceRecord = {
        id: newRecordId,
        school_id: 'RCIS',
        person_id: person.id,
        person_name: personName,
        person_type: category,
        department_or_class: deptOrClass,
        attendance_method: 'QR',
        event_type: 'CLOCK_IN',
        date: todayStr,
        timestamp: now.toISOString(),
        clockInTime: timeFull,
        clockOutTime: null,
        shift_id: (person as any).shiftId,
        status,
        hoursWorked: null,
        device_id: activeDeviceId,
        recorded_by: 'Self (QR Scanner)',
        offline_created: !effectiveOnline,
        sync_status: syncStatus,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await dbService.saveAttendanceRecord(newRecord);

      if (!effectiveOnline) {
        await dbService.addToSyncQueue({
          id: `local-${Date.now()}`,
          attendanceId: newRecordId,
          personId: person.id,
          personName,
          personType: category,
          departmentOrClass: deptOrClass,
          attendanceMethod: 'QR',
          eventType: 'CLOCK_IN',
          timestamp: now.toISOString(),
          formattedTime: timeFormatted,
          date: todayStr,
          deviceId: activeDeviceId,
          deviceLocation: locationName,
          recordedBy: 'Self (QR Scanner)',
          syncStatus: 'PENDING',
          retryCount: 0,
        });
      }

      await dbService.addAuditLog({
        time: timeFormatted,
        date: '06/10/2026',
        user: personName,
        userRole: currentUser.role,
        action: effectiveOnline ? 'Clocked In (QR)' : 'Clocked In (QR Offline)',
        category: 'ATTENDANCE',
        method: 'QR',
        details: `${category} ${person.id} clocked in via QR badge. Status: ${statusText}.${!effectiveOnline ? ' Saved to local device queue.' : ''}`,
        deviceId: activeDeviceId,
        recordId: newRecordId,
        mode: effectiveOnline ? 'ONLINE' : 'OFFLINE',
      });

      playBeep('success');
      await refreshData();

      return {
        type: 'SUCCESS',
        action: 'CLOCK_IN',
        person,
        record: newRecord,
        time: timeFormatted,
        clockInTime: timeFormatted,
        statusText,
        message: 'Have a productive day at Royal Crest!',
        timestamp: Date.now(),
      };
    }

    // CLOCK OUT
    if (targetAction === 'CLOCK_OUT') {
      if (!record || !record.clockInTime) {
        playBeep('warning');
        return {
          type: 'WARNING',
          action: 'CLOCK_OUT',
          person,
          message: `Cannot clock out: ${personName} has not clocked in yet today.`,
          time: timeFormatted,
          timestamp: Date.now(),
        };
      }

      if (record.clockOutTime) {
        playBeep('warning');
        return {
          type: 'WARNING',
          action: 'CLOCK_OUT',
          person,
          record,
          message: `Already Clocked Out: ${personName} clocked out at ${record.clockOutTime.slice(0, 5)}.`,
          time: timeFormatted,
          clockOutTime: record.clockOutTime,
          timestamp: Date.now(),
        };
      }

      const inMins = timeToMinutes(record.clockInTime);
      const outMins = now.getHours() * 60 + now.getMinutes();
      const diffMins = Math.max(0, outMins - inMins);
      const hoursWorkedStr = formatMinutesWorked(diffMins);

      const syncStatus = effectiveOnline ? 'SYNCED' : 'PENDING';
      const updatedRecord: AttendanceRecord = {
        ...record,
        clockOutTime: timeFull,
        hoursWorked: diffMins,
        sync_status: syncStatus,
        updatedAt: now.toISOString(),
      };

      await dbService.saveAttendanceRecord(updatedRecord);

      if (!effectiveOnline) {
        await dbService.addToSyncQueue({
          id: `local-${Date.now()}`,
          attendanceId: record.id,
          personId: person.id,
          personName,
          personType: category,
          departmentOrClass: deptOrClass,
          attendanceMethod: 'QR',
          eventType: 'CLOCK_OUT',
          timestamp: now.toISOString(),
          formattedTime: timeFormatted,
          date: todayStr,
          deviceId: activeDeviceId,
          deviceLocation: locationName,
          recordedBy: 'Self (QR Scanner)',
          syncStatus: 'PENDING',
          retryCount: 0,
        });
      }

      await dbService.addAuditLog({
        time: timeFormatted,
        date: '06/10/2026',
        user: personName,
        userRole: currentUser.role,
        action: effectiveOnline ? 'Clocked Out (QR)' : 'Clocked Out (QR Offline)',
        category: 'ATTENDANCE',
        method: 'QR',
        details: `${category} ${person.id} clocked out via QR badge. Hours: ${hoursWorkedStr}.${!effectiveOnline ? ' Queued offline.' : ''}`,
        deviceId: activeDeviceId,
        recordId: record.id,
        mode: effectiveOnline ? 'ONLINE' : 'OFFLINE',
      });

      playBeep('success');
      await refreshData();

      return {
        type: 'SUCCESS',
        action: 'CLOCK_OUT',
        person,
        record: updatedRecord,
        time: timeFormatted,
        clockInTime: record.clockInTime.slice(0, 5),
        clockOutTime: timeFormatted,
        hoursWorkedFormatted: hoursWorkedStr,
        message: 'Good afternoon! Safe travels home!',
        timestamp: Date.now(),
      };
    }

    return {
      type: 'ERROR',
      action: 'CLOCK_IN',
      message: 'Unknown scan execution',
      time: timeFormatted,
      timestamp: Date.now(),
    };
  };

  // METHOD B: OFFLINE QUICK ATTENDANCE (By authorized officer)
  const recordQuickAttendance = async (
    personId: string, 
    eventType: 'CLOCK_IN' | 'CLOCK_OUT',
    reason = 'No QR Card / Verified Roster'
  ): Promise<ScanFeedback> => {
    const isStudent = personId.startsWith('STU-');
    const person = isStudent
      ? students.find(s => s.id === personId)
      : people.find(p => p.id === personId);

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeFull = now.toLocaleTimeString('en-GB', { hour12: false });
    const todayStr = '2026-10-06';

    if (!person) {
      playBeep('error');
      return {
        type: 'ERROR',
        action: eventType,
        message: `Person ${personId} not found.`,
        time: timeFormatted,
        timestamp: Date.now(),
      };
    }

    const personName = (person as any).fullName || `${(person as any).firstName} ${(person as any).lastName}`;
    const category = (person as any).category || 'Student';
    const deptOrClass = (person as any).departmentOrClass || (person as any).className;
    const activeDevice = devices.find(d => d.id === activeDeviceId) || devices[0];
    const locationName = activeDevice ? activeDevice.location : 'Reception Tablet';

    const allRecords = await dbService.getAttendanceRecords();
    let record = allRecords.find(r => r.person_id === person.id && r.date === todayStr);

    if (eventType === 'CLOCK_IN') {
      if (record && record.clockInTime) {
        playBeep('warning');
        return {
          type: 'WARNING',
          action: 'CLOCK_IN',
          person,
          record,
          message: `Already Clocked In: ${personName} was clocked in at ${record.clockInTime.slice(0, 5)}.`,
          time: timeFormatted,
          timestamp: Date.now(),
        };
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const personShift = shifts.find(s => s.id === (person as any).shiftId);
      const { status, statusText } = calculateShiftStatus(currentMinutes, personShift);

      const newRecordId = `ATT-${Date.now().toString().slice(-6)}`;
      const syncStatus = effectiveOnline ? 'SYNCED' : 'PENDING';

      const newRecord: AttendanceRecord = {
        id: newRecordId,
        school_id: 'RCIS',
        person_id: person.id,
        person_name: personName,
        person_type: category,
        department_or_class: deptOrClass,
        attendance_method: 'QUICK_ATTENDANCE',
        event_type: 'CLOCK_IN',
        date: todayStr,
        timestamp: now.toISOString(),
        clockInTime: timeFull,
        clockOutTime: null,
        shift_id: (person as any).shiftId,
        status,
        hoursWorked: null,
        device_id: activeDeviceId,
        recorded_by: `${currentUser.name} (${currentUser.role})`,
        reason,
        offline_created: !effectiveOnline,
        sync_status: syncStatus,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await dbService.saveAttendanceRecord(newRecord);

      if (!effectiveOnline) {
        await dbService.addToSyncQueue({
          id: `local-quick-${Date.now()}`,
          attendanceId: newRecordId,
          personId: person.id,
          personName,
          personType: category,
          departmentOrClass: deptOrClass,
          attendanceMethod: 'QUICK_ATTENDANCE',
          eventType: 'CLOCK_IN',
          timestamp: now.toISOString(),
          formattedTime: timeFormatted,
          date: todayStr,
          deviceId: activeDeviceId,
          deviceLocation: locationName,
          recordedBy: `${currentUser.name} (${currentUser.role})`,
          reason,
          syncStatus: 'PENDING',
          retryCount: 0,
        });
      }

      await dbService.addAuditLog({
        time: timeFormatted,
        date: '06/10/2026',
        user: currentUser.name,
        userRole: currentUser.role,
        action: effectiveOnline ? 'Quick Attendance (Clock In)' : 'Quick Attendance (Clock In Offline)',
        category: 'ATTENDANCE',
        method: 'QUICK_ATTENDANCE',
        details: `Recorded Clock-In for ${category} ${personName} (${person.id}). Reason: "${reason}". Status: ${statusText}.`,
        deviceId: activeDeviceId,
        recordId: newRecordId,
        recordedBy: currentUser.name,
        mode: effectiveOnline ? 'ONLINE' : 'OFFLINE',
      });

      playBeep('success');
      await refreshData();

      return {
        type: 'SUCCESS',
        action: 'CLOCK_IN',
        person,
        record: newRecord,
        time: timeFormatted,
        clockInTime: timeFormatted,
        statusText,
        message: `Quick Clock-In Recorded for ${personName} (${category}).`,
        timestamp: Date.now(),
      };
    } else {
      // CLOCK OUT
      if (!record || !record.clockInTime) {
        playBeep('warning');
        return {
          type: 'WARNING',
          action: 'CLOCK_OUT',
          person,
          message: `Cannot clock out: ${personName} has no recorded clock-in today.`,
          time: timeFormatted,
          timestamp: Date.now(),
        };
      }

      if (record.clockOutTime) {
        playBeep('warning');
        return {
          type: 'WARNING',
          action: 'CLOCK_OUT',
          person,
          record,
          message: `Already Clocked Out: ${personName} clocked out at ${record.clockOutTime.slice(0, 5)}.`,
          time: timeFormatted,
          timestamp: Date.now(),
        };
      }

      const inMins = timeToMinutes(record.clockInTime);
      const outMins = now.getHours() * 60 + now.getMinutes();
      const diffMins = Math.max(0, outMins - inMins);
      const hoursWorkedStr = formatMinutesWorked(diffMins);

      const syncStatus = effectiveOnline ? 'SYNCED' : 'PENDING';
      const updatedRecord: AttendanceRecord = {
        ...record,
        clockOutTime: timeFull,
        hoursWorked: diffMins,
        sync_status: syncStatus,
        updatedAt: now.toISOString(),
      };

      await dbService.saveAttendanceRecord(updatedRecord);

      if (!effectiveOnline) {
        await dbService.addToSyncQueue({
          id: `local-quick-${Date.now()}`,
          attendanceId: record.id,
          personId: person.id,
          personName,
          personType: category,
          departmentOrClass: deptOrClass,
          attendanceMethod: 'QUICK_ATTENDANCE',
          eventType: 'CLOCK_OUT',
          timestamp: now.toISOString(),
          formattedTime: timeFormatted,
          date: todayStr,
          deviceId: activeDeviceId,
          deviceLocation: locationName,
          recordedBy: `${currentUser.name} (${currentUser.role})`,
          reason,
          syncStatus: 'PENDING',
          retryCount: 0,
        });
      }

      await dbService.addAuditLog({
        time: timeFormatted,
        date: '06/10/2026',
        user: currentUser.name,
        userRole: currentUser.role,
        action: effectiveOnline ? 'Quick Attendance (Clock Out)' : 'Quick Attendance (Clock Out Offline)',
        category: 'ATTENDANCE',
        method: 'QUICK_ATTENDANCE',
        details: `Recorded Clock-Out for ${category} ${personName} (${person.id}). Reason: "${reason}". Total: ${hoursWorkedStr}.`,
        deviceId: activeDeviceId,
        recordId: record.id,
        recordedBy: currentUser.name,
        mode: effectiveOnline ? 'ONLINE' : 'OFFLINE',
      });

      playBeep('success');
      await refreshData();

      return {
        type: 'SUCCESS',
        action: 'CLOCK_OUT',
        person,
        record: updatedRecord,
        time: timeFormatted,
        clockInTime: record.clockInTime.slice(0, 5),
        clockOutTime: timeFormatted,
        hoursWorkedFormatted: hoursWorkedStr,
        message: `Quick Clock-Out Recorded for ${personName} (${category}).`,
        timestamp: Date.now(),
      };
    }
  };

  // METHOD C: OPTIONAL STAFF PIN ATTENDANCE
  const recordPinAttendance = async (
    staffId: string, 
    pin: string, 
    forcedAction?: 'CLOCK_IN' | 'CLOCK_OUT'
  ): Promise<ScanFeedback> => {
    const person = people.find(p => p.id === staffId);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeFull = now.toLocaleTimeString('en-GB', { hour12: false });
    const todayStr = '2026-10-06';

    if (!person) {
      playBeep('error');
      return {
        type: 'ERROR',
        action: forcedAction || 'CLOCK_IN',
        message: `Staff ID "${staffId}" not registered.`,
        time: timeFormatted,
        timestamp: Date.now(),
      };
    }

    if (person.pinCode && person.pinCode !== pin.trim()) {
      playBeep('error');
      return {
        type: 'ERROR',
        action: forcedAction || 'CLOCK_IN',
        person,
        message: `Invalid PIN code for staff ${staffId}. Authentication denied.`,
        time: timeFormatted,
        timestamp: Date.now(),
      };
    }

    const allRecords = await dbService.getAttendanceRecords();
    let record = allRecords.find(r => r.person_id === person.id && r.date === todayStr);

    let targetAction: 'CLOCK_IN' | 'CLOCK_OUT' = forcedAction || (
      record && record.clockInTime ? 'CLOCK_OUT' : 'CLOCK_IN'
    );

    if (targetAction === 'CLOCK_IN') {
      if (record && record.clockInTime) {
        playBeep('warning');
        return {
          type: 'WARNING',
          action: 'CLOCK_IN',
          person,
          record,
          message: `Already Clocked In: ${person.fullName} clocked in at ${record.clockInTime.slice(0, 5)}.`,
          time: timeFormatted,
          timestamp: Date.now(),
        };
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const personShift = shifts.find(s => s.id === person.shiftId);
      const { status, statusText } = calculateShiftStatus(currentMinutes, personShift);

      const newRecordId = `ATT-${Date.now().toString().slice(-6)}`;
      const syncStatus = effectiveOnline ? 'SYNCED' : 'PENDING';

      const newRecord: AttendanceRecord = {
        id: newRecordId,
        school_id: 'RCIS',
        person_id: person.id,
        person_name: person.fullName,
        person_type: person.category,
        department_or_class: person.departmentOrClass,
        attendance_method: 'PIN',
        event_type: 'CLOCK_IN',
        date: todayStr,
        timestamp: now.toISOString(),
        clockInTime: timeFull,
        clockOutTime: null,
        shift_id: person.shiftId,
        status,
        hoursWorked: null,
        device_id: activeDeviceId,
        recorded_by: `Self (PIN Authenticated)`,
        offline_created: !effectiveOnline,
        sync_status: syncStatus,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await dbService.saveAttendanceRecord(newRecord);

      if (!effectiveOnline) {
        await dbService.addToSyncQueue({
          id: `local-pin-${Date.now()}`,
          attendanceId: newRecordId,
          personId: person.id,
          personName: person.fullName,
          personType: person.category,
          departmentOrClass: person.departmentOrClass,
          attendanceMethod: 'PIN',
          eventType: 'CLOCK_IN',
          timestamp: now.toISOString(),
          formattedTime: timeFormatted,
          date: todayStr,
          deviceId: activeDeviceId,
          deviceLocation: 'Campus Terminal',
          recordedBy: `Self (PIN Authenticated)`,
          syncStatus: 'PENDING',
          retryCount: 0,
        });
      }

      await dbService.addAuditLog({
        time: timeFormatted,
        date: '06/10/2026',
        user: person.fullName,
        userRole: 'ATTENDANCE_OFFICER',
        action: effectiveOnline ? 'Clock In (PIN)' : 'Clock In (PIN Offline)',
        category: 'ATTENDANCE',
        method: 'PIN',
        details: `${person.category} ${person.id} clocked in with PIN. Status: ${statusText}.${!effectiveOnline ? ' Cached offline.' : ''}`,
        deviceId: activeDeviceId,
        recordId: newRecordId,
        mode: effectiveOnline ? 'ONLINE' : 'OFFLINE',
      });

      playBeep('success');
      await refreshData();

      return {
        type: 'SUCCESS',
        action: 'CLOCK_IN',
        person,
        record: newRecord,
        time: timeFormatted,
        clockInTime: timeFormatted,
        statusText,
        message: person.category === 'Driver' && person.vehicleInfo
          ? `Driver On Duty: ${person.vehicleInfo.vehicleName} (${person.vehicleInfo.route})`
          : `PIN Verified! Clock-in successful for ${person.fullName}.`,
        timestamp: Date.now(),
      };
    } else {
      // CLOCK OUT
      if (!record || !record.clockInTime) {
        playBeep('warning');
        return {
          type: 'WARNING',
          action: 'CLOCK_OUT',
          person,
          message: `Cannot clock out: ${person.fullName} has no recorded clock-in today.`,
          time: timeFormatted,
          timestamp: Date.now(),
        };
      }

      const inMins = timeToMinutes(record.clockInTime);
      const outMins = now.getHours() * 60 + now.getMinutes();
      const diffMins = Math.max(0, outMins - inMins);
      const hoursWorkedStr = formatMinutesWorked(diffMins);

      const syncStatus = effectiveOnline ? 'SYNCED' : 'PENDING';
      const updatedRecord: AttendanceRecord = {
        ...record,
        clockOutTime: timeFull,
        hoursWorked: diffMins,
        sync_status: syncStatus,
        updatedAt: now.toISOString(),
      };

      await dbService.saveAttendanceRecord(updatedRecord);

      if (!effectiveOnline) {
        await dbService.addToSyncQueue({
          id: `local-pin-${Date.now()}`,
          attendanceId: record.id,
          personId: person.id,
          personName: person.fullName,
          personType: person.category,
          departmentOrClass: person.departmentOrClass,
          attendanceMethod: 'PIN',
          eventType: 'CLOCK_OUT',
          timestamp: now.toISOString(),
          formattedTime: timeFormatted,
          date: todayStr,
          deviceId: activeDeviceId,
          deviceLocation: 'Campus Terminal',
          recordedBy: `Self (PIN Authenticated)`,
          syncStatus: 'PENDING',
          retryCount: 0,
        });
      }

      await dbService.addAuditLog({
        time: timeFormatted,
        date: '06/10/2026',
        user: person.fullName,
        userRole: 'ATTENDANCE_OFFICER',
        action: effectiveOnline ? 'Clock Out (PIN)' : 'Clock Out (PIN Offline)',
        category: 'ATTENDANCE',
        method: 'PIN',
        details: `${person.category} ${person.id} clocked out with PIN. Worked: ${hoursWorkedStr}.`,
        deviceId: activeDeviceId,
        recordId: record.id,
        mode: effectiveOnline ? 'ONLINE' : 'OFFLINE',
      });

      playBeep('success');
      await refreshData();

      return {
        type: 'SUCCESS',
        action: 'CLOCK_OUT',
        person,
        record: updatedRecord,
        time: timeFormatted,
        clockInTime: record.clockInTime.slice(0, 5),
        clockOutTime: timeFormatted,
        hoursWorkedFormatted: hoursWorkedStr,
        message: `PIN Clock-out recorded. Have a restful evening!`,
        timestamp: Date.now(),
      };
    }
  };

  // METHOD D: CLASS REGISTER ATTENDANCE (Offline-capable)
  const recordClassRegister = async (
    classId: string, 
    date: string, 
    entries: { studentId: string; status: AttendanceStatus }[]
  ): Promise<{ savedCount: number }> => {
    const targetClass = classes.find(c => c.id === classId) || classes[0];
    const now = new Date();
    const timeFull = now.toLocaleTimeString('en-GB', { hour12: false });
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecords: AttendanceRecord[] = [];
    const newQueueItems: SyncQueueItem[] = [];

    for (const entry of entries) {
      const student = students.find(s => s.id === entry.studentId);
      if (!student) continue;

      const recId = `ATT-CLS-${Date.now().toString().slice(-5)}-${student.id}`;
      const syncStatus = effectiveOnline ? 'SYNCED' : 'PENDING';

      const isPresent = entry.status === 'Present' || entry.status === 'Late';
      const clockIn = isPresent ? (entry.status === 'Late' ? '08:20:00' : '07:45:00') : null;

      const record: AttendanceRecord = {
        id: recId,
        school_id: 'RCIS',
        person_id: student.id,
        person_name: student.fullName,
        person_type: 'Student',
        department_or_class: targetClass.name,
        attendance_method: 'CLASS_REGISTER',
        event_type: entry.status === 'Present' ? 'PRESENT' : entry.status === 'Late' ? 'LATE' : 'ABSENT',
        date,
        timestamp: now.toISOString(),
        clockInTime: clockIn,
        clockOutTime: isPresent ? '15:30:00' : null,
        status: entry.status,
        hoursWorked: isPresent ? 465 : null,
        device_id: activeDeviceId,
        recorded_by: `${currentUser.name} (Class Register Roll Call)`,
        offline_created: !effectiveOnline,
        sync_status: syncStatus,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      newRecords.push(record);

      if (!effectiveOnline) {
        newQueueItems.push({
          id: `local-cls-${recId}`,
          attendanceId: recId,
          personId: student.id,
          personName: student.fullName,
          personType: 'Student',
          departmentOrClass: targetClass.name,
          attendanceMethod: 'CLASS_REGISTER',
          eventType: record.event_type,
          timestamp: now.toISOString(),
          formattedTime: timeFormatted,
          date,
          deviceId: activeDeviceId,
          deviceLocation: 'Classroom',
          recordedBy: `${currentUser.name} (Class Register)`,
          syncStatus: 'PENDING',
          retryCount: 0,
        });
      }
    }

    await dbService.saveAttendanceBatch(newRecords);
    if (!effectiveOnline && newQueueItems.length > 0) {
      await dbService.addToSyncQueueBatch(newQueueItems);
    }

    await dbService.addAuditLog({
      time: timeFormatted,
      date: '06/10/2026',
      user: currentUser.name,
      userRole: currentUser.role,
      action: effectiveOnline ? 'Class Register Submitted' : 'Class Register Submitted (Offline)',
      category: 'STUDENT',
      method: 'CLASS_REGISTER',
      details: `Submitted register for ${targetClass.name} (${entries.length} students). Mode: ${effectiveOnline ? 'Online Synced' : 'Offline Cached'}.`,
      deviceId: activeDeviceId,
      recordedBy: currentUser.name,
      mode: effectiveOnline ? 'ONLINE' : 'OFFLINE',
    });

    playBeep('success');
    await refreshData();
    return { savedCount: newRecords.length };
  };

  // STUDENT QUICK ATTENDANCE
  const recordStudentQuickAttendance = async (
    studentId: string, 
    status: AttendanceStatus
  ): Promise<ScanFeedback> => {
    const student = students.find(s => s.id === studentId);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = '2026-10-06';

    if (!student) {
      playBeep('error');
      return {
        type: 'ERROR',
        action: 'PRESENT',
        message: 'Student not found',
        time: timeFormatted,
        timestamp: Date.now(),
      };
    }

    const recId = `ATT-STU-${Date.now().toString().slice(-6)}`;
    const syncStatus = effectiveOnline ? 'SYNCED' : 'PENDING';
    const isPresent = status === 'Present' || status === 'Late';

    const record: AttendanceRecord = {
      id: recId,
      school_id: 'RCIS',
      person_id: student.id,
      person_name: student.fullName,
      person_type: 'Student',
      department_or_class: student.className,
      attendance_method: 'QUICK_ATTENDANCE',
      event_type: status === 'Present' ? 'PRESENT' : status === 'Late' ? 'LATE' : 'ABSENT',
      date: todayStr,
      timestamp: now.toISOString(),
      clockInTime: isPresent ? (status === 'Late' ? '08:15:00' : '07:45:00') : null,
      clockOutTime: isPresent ? '15:30:00' : null,
      status,
      hoursWorked: isPresent ? 465 : null,
      device_id: activeDeviceId,
      recorded_by: `${currentUser.name} (Quick Attendance)`,
      offline_created: !effectiveOnline,
      sync_status: syncStatus,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await dbService.saveAttendanceRecord(record);

    if (!effectiveOnline) {
      await dbService.addToSyncQueue({
        id: `local-stu-${recId}`,
        attendanceId: recId,
        personId: student.id,
        personName: student.fullName,
        personType: 'Student',
        departmentOrClass: student.className,
        attendanceMethod: 'QUICK_ATTENDANCE',
        eventType: record.event_type,
        timestamp: now.toISOString(),
        formattedTime: timeFormatted,
        date: todayStr,
        deviceId: activeDeviceId,
        deviceLocation: 'Campus Terminal',
        recordedBy: `${currentUser.name} (Student Quick)`,
        syncStatus: 'PENDING',
        retryCount: 0,
      });
    }

    await dbService.addAuditLog({
      time: timeFormatted,
      date: '06/10/2026',
      user: currentUser.name,
      userRole: currentUser.role,
      action: 'Student Quick Attendance',
      category: 'STUDENT',
      method: 'QUICK_ATTENDANCE',
      details: `Marked student ${student.fullName} (${student.admissionNumber}, ${student.className}) as ${status}.`,
      deviceId: activeDeviceId,
      recordId: recId,
    });

    playBeep('success');
    await refreshData();

    return {
      type: 'SUCCESS',
      action: 'PRESENT',
      person: student,
      record,
      time: timeFormatted,
      statusText: status.toUpperCase(),
      message: `Student attendance marked as ${status}.`,
      timestamp: Date.now(),
    };
  };

  // Adjustments & QR regenerations
  const adjustAttendance = async (
    recordId: string, 
    updates: { clockInTime?: string; clockOutTime?: string; status: AttendanceStatus; reason: string }
  ): Promise<boolean> => {
    if (!updates.reason.trim()) {
      alert('A valid reason is required for attendance adjustments.');
      return false;
    }

    const currentRecords = await dbService.getAttendanceRecords();
    const record = currentRecords.find(r => r.id === recordId);
    if (!record) return false;

    let computedMinutes = record.hoursWorked;
    if (updates.clockInTime && updates.clockOutTime) {
      const inM = timeToMinutes(updates.clockInTime);
      const outM = timeToMinutes(updates.clockOutTime);
      computedMinutes = Math.max(0, outM - inM);
    }

    const updated: AttendanceRecord = {
      ...record,
      clockInTime: updates.clockInTime !== undefined ? updates.clockInTime : record.clockInTime,
      clockOutTime: updates.clockOutTime !== undefined ? updates.clockOutTime : record.clockOutTime,
      status: updates.status,
      hoursWorked: computedMinutes,
      isManualCorrection: true,
      correctionReason: updates.reason,
      correctedBy: currentUser.name,
      correctedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbService.saveAttendanceRecord(updated);

    await dbService.addAuditLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: '06/10/2026',
      user: currentUser.name,
      userRole: currentUser.role,
      action: 'Attendance Adjustment',
      category: 'SECURITY',
      details: `Admin adjusted attendance ${recordId} for ${record.person_name}. New Status: ${updates.status}. Reason: "${updates.reason}".`,
      recordId,
    });

    await refreshData();
    return true;
  };

  const regeneratePersonQr = async (personId: string): Promise<string> => {
    const isStudent = personId.startsWith('STU-');
    const newToken = generateTeacherQrToken(personId, Date.now());

    if (isStudent) {
      const student = students.find(s => s.id === personId);
      if (student) {
        student.qrToken = newToken;
        await dbService.saveStudent(student);
      }
    } else {
      const person = people.find(p => p.id === personId);
      if (person) {
        person.qrToken = newToken;
        person.qrGeneratedAt = new Date().toISOString();
        await dbService.savePerson(person);
      }
    }

    await dbService.addAuditLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: '06/10/2026',
      user: currentUser.name,
      userRole: currentUser.role,
      action: 'QR Code Regenerated',
      category: 'SECURITY',
      details: `Issued fresh cryptographic QR credential for ID ${personId}.`,
    });

    await refreshData();
    return newToken;
  };

  const regenerateTeacherQr = regeneratePersonQr;

  const savePerson = async (person: Person) => {
    await dbService.savePerson(person);
    await refreshData();
  };

  const saveTeacher = savePerson;

  const saveStudent = async (student: Student) => {
    await dbService.saveStudent(student);
    await refreshData();
  };

  const saveShift = async (shift: Shift) => {
    await dbService.saveShift(shift);
    await refreshData();
  };

  const updateSettings = async (newSettings: AttendanceSettings) => {
    await dbService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleLeaveAction = async (leaveId: string, status: 'Approved' | 'Rejected', remarks?: string) => {
    const list = await dbService.getLeaveRequests();
    const target = list.find(l => l.id === leaveId);
    if (!target) return;

    target.status = status;
    target.reviewedBy = currentUser.name;
    target.reviewedAt = new Date().toISOString();
    target.reviewRemarks = remarks || (status === 'Approved' ? 'Approved by administration.' : 'Declined.');
    await dbService.saveLeaveRequest(target);

    if (status === 'Approved' && target.startDate <= '2026-10-06' && target.endDate >= '2026-10-06') {
      const records = await dbService.getAttendanceRecords();
      const rec = records.find(r => r.person_id === target.personId && r.date === '2026-10-06');
      if (rec) {
        rec.status = 'Leave';
        rec.clockInTime = null;
        rec.clockOutTime = null;
        await dbService.saveAttendanceRecord(rec);
      }
    }

    await dbService.addAuditLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: '06/10/2026',
      user: currentUser.name,
      userRole: currentUser.role,
      action: `Leave Request ${status}`,
      category: 'LEAVE',
      details: `${status} ${target.leaveType} for ${target.personName} (${target.startDate} to ${target.endDate}).`,
    });

    await refreshData();
  };

  const submitLeaveRequest = async (req: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>) => {
    const newLeave: LeaveRequest = {
      ...req,
      id: `LEV-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };
    await dbService.saveLeaveRequest(newLeave);
    await refreshData();
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const resetDemo = async () => {
    await dbService.resetDemoData();
    setIsSimulatedOffline(false);
    await refreshData();
  };

  // Dynamic Overall Metrics
  const stats = useMemo(() => {
    const todayRecords = attendanceRecords.filter(r => r.date === '2026-10-06');
    const presentCount = todayRecords.filter(r => r.status === 'Present').length;
    const lateCount = todayRecords.filter(r => r.status === 'Late').length;
    const absentCount = todayRecords.filter(r => r.status === 'Absent' || r.status === 'Leave').length;
    const notClockedOutCount = todayRecords.filter(r => r.clockInTime && !r.clockOutTime).length;
    const offlineRecordsCount = syncQueue.length;
    const syncedCount = todayRecords.filter(r => r.sync_status === 'SYNCED' && r.clockInTime).length;

    const totalStaff = people.length || 75;
    const totalStudents = students.length || 175;
    const totalPeople = totalStaff + totalStudents;

    return {
      totalPeople: totalPeople || 250,
      totalStaff: totalStaff || 75,
      totalStudents: totalStudents || 175,
      presentToday: (presentCount || 203) + (lateCount || 18),
      late: lateCount || 18,
      absent: absentCount || 11,
      notClockedOut: notClockedOutCount || 9,
      offlineRecords: offlineRecordsCount || 6,
      synchronized: syncedCount || 215,
    };
  }, [attendanceRecords, people, students, syncQueue]);

  const teachers = useMemo(() => {
    return people.filter(p => p.category === 'Teacher');
  }, [people]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        isOnline: effectiveOnline,
        toggleNetworkSimulation,
        isSimulatedOffline,
        lastSyncTime,
        isSyncing,
        triggerSyncNow,
        people,
        teachers,
        students,
        classes,
        shifts,
        attendanceRecords,
        syncQueue,
        devices,
        settings,
        leaveRequests,
        auditLogs,
        notifications,
        activeDeviceId,
        setActiveDeviceId,
        processQrScan,
        recordQuickAttendance,
        recordPinAttendance,
        recordClassRegister,
        recordStudentQuickAttendance,
        adjustAttendance,
        regeneratePersonQr,
        regenerateTeacherQr,
        savePerson,
        saveTeacher,
        saveStudent,
        saveShift,
        updateSettings,
        handleLeaveAction,
        submitLeaveRequest,
        dismissNotification,
        resetDemo,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
