import { db, memoryStore } from '../config/database';
import { 
  ALL_STAFF_DATA, 
  STUDENTS_DATA, 
  SCHOOL_CLASSES_DATA, 
  SHIFTS_DATA, 
  ATTENDANCE_DEVICES_DATA, 
  DEFAULT_SETTINGS, 
  LEAVE_REQUESTS_DATA, 
  INITIAL_AUDIT_LOGS,
  generateInitialAttendanceRecords,
  DEMO_USERS 
} from '../../../src/services/seedData';

class SeedAndStorageService {
  private initialized = false;

  async ensureSeeded() {
    if (this.initialized) return;

    if (memoryStore.people.length === 0) {
      const { records, syncQueue } = generateInitialAttendanceRecords();
      memoryStore.users = [...DEMO_USERS];
      memoryStore.people = [...ALL_STAFF_DATA];
      memoryStore.students = [...STUDENTS_DATA];
      memoryStore.classes = [...SCHOOL_CLASSES_DATA];
      memoryStore.shifts = [...SHIFTS_DATA];
      memoryStore.attendance = [...records];
      memoryStore.devices = [...ATTENDANCE_DEVICES_DATA];
      memoryStore.settings = { ...DEFAULT_SETTINGS };
      memoryStore.leave_requests = [...LEAVE_REQUESTS_DATA];
      memoryStore.audit_logs = [...INITIAL_AUDIT_LOGS];
    }

    this.initialized = true;
  }

  // Attendance records
  async getAttendance(filter?: { date?: string; personId?: string; limit?: number }) {
    await this.ensureSeeded();
    let results = [...memoryStore.attendance];
    if (filter?.date) {
      results = results.filter(r => r.date === filter.date);
    }
    if (filter?.personId) {
      results = results.filter(r => r.person_id === filter.personId);
    }
    // Return latest first
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }
    return results;
  }

  async saveAttendanceRecord(record: any) {
    await this.ensureSeeded();
    const idx = memoryStore.attendance.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      memoryStore.attendance[idx] = { ...record, updatedAt: new Date().toISOString() };
    } else {
      memoryStore.attendance.unshift({ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    return record;
  }

  // Sync batch with Idempotency Protection
  async processSyncBatch(events: any[]) {
    await this.ensureSeeded();
    const results = {
      received: events.length,
      processed: 0,
      duplicatesIgnored: 0,
      errors: 0,
      processedIds: [] as string[],
    };

    for (const evt of events) {
      try {
        const localId = evt.localId || evt.id;
        const deviceId = evt.deviceId || 'DEVICE-01';

        // Idempotency check: see if record with this localId on this device was already ingested
        const isDuplicate = memoryStore.sync_events.some(
          e => e.localId === localId && e.deviceId === deviceId
        );

        if (isDuplicate) {
          results.duplicatesIgnored++;
          continue;
        }

        // Store sync event log
        memoryStore.sync_events.push({
          localId,
          deviceId,
          personId: evt.personId,
          timestamp: evt.timestamp,
          syncedAt: new Date().toISOString(),
        });

        // Upsert the attendance record in central database
        const existingIdx = memoryStore.attendance.findIndex(r => r.id === evt.attendanceId || r.local_id === localId);
        const record = {
          id: evt.attendanceId || `ATT-${Date.now().toString().slice(-6)}`,
          school_id: 'RCIS',
          person_id: evt.personId,
          person_name: evt.personName,
          person_type: evt.personType || 'Staff',
          department_or_class: evt.departmentOrClass || 'Campus',
          attendance_method: evt.attendanceMethod || 'QR',
          event_type: evt.eventType || 'CLOCK_IN',
          date: evt.date,
          timestamp: evt.timestamp,
          clockInTime: evt.eventType === 'CLOCK_IN' ? evt.formattedTime : '07:45:00',
          clockOutTime: evt.eventType === 'CLOCK_OUT' ? evt.formattedTime : null,
          status: 'Present',
          device_id: deviceId,
          recorded_by: evt.recordedBy || 'Offline Terminal Sync',
          offline_created: true,
          sync_status: 'SYNCED',
          local_id: localId,
          synced_at: new Date().toISOString(),
          createdAt: evt.timestamp,
          updatedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          memoryStore.attendance[existingIdx] = { ...memoryStore.attendance[existingIdx], ...record, sync_status: 'SYNCED' };
        } else {
          memoryStore.attendance.unshift(record);
        }

        results.processed++;
        results.processedIds.push(record.id);
      } catch (err) {
        results.errors++;
      }
    }

    // Add audit log for sync batch
    if (results.processed > 0) {
      await this.addAuditLog({
        user: 'Sync Engine',
        userRole: 'SYSTEM',
        action: 'Offline Batch Ingested',
        category: 'SYNC',
        details: `Processed ${results.processed} offline records. ${results.duplicatesIgnored} duplicates rejected.`,
      });
    }

    return results;
  }

  // People & Workforce
  async getPeople() {
    await this.ensureSeeded();
    return memoryStore.people;
  }

  async savePerson(person: any) {
    await this.ensureSeeded();
    const idx = memoryStore.people.findIndex(p => p.id === person.id);
    if (idx >= 0) {
      memoryStore.people[idx] = person;
    } else {
      memoryStore.people.unshift(person);
    }
    return person;
  }

  // Students
  async getStudents() {
    await this.ensureSeeded();
    return memoryStore.students;
  }

  async saveStudent(student: any) {
    await this.ensureSeeded();
    const idx = memoryStore.students.findIndex(s => s.id === student.id);
    if (idx >= 0) {
      memoryStore.students[idx] = student;
    } else {
      memoryStore.students.unshift(student);
    }
    return student;
  }

  // Classes & Shifts & Devices
  async getClasses() {
    await this.ensureSeeded();
    return memoryStore.classes;
  }

  async getShifts() {
    await this.ensureSeeded();
    return memoryStore.shifts;
  }

  async getDevices() {
    await this.ensureSeeded();
    return memoryStore.devices;
  }

  async getSettings() {
    await this.ensureSeeded();
    return memoryStore.settings;
  }

  async updateSettings(newSettings: any) {
    await this.ensureSeeded();
    memoryStore.settings = { ...memoryStore.settings, ...newSettings };
    return memoryStore.settings;
  }

  async getLeaveRequests() {
    await this.ensureSeeded();
    return memoryStore.leave_requests;
  }

  async saveLeaveRequest(leave: any) {
    await this.ensureSeeded();
    const idx = memoryStore.leave_requests.findIndex(l => l.id === leave.id);
    if (idx >= 0) {
      memoryStore.leave_requests[idx] = leave;
    } else {
      memoryStore.leave_requests.unshift(leave);
    }
    return leave;
  }

  async getAuditLogs() {
    await this.ensureSeeded();
    return memoryStore.audit_logs;
  }

  async addAuditLog(log: any) {
    await this.ensureSeeded();
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-GB'),
      ...log,
      timestamp: new Date().toISOString(),
    };
    memoryStore.audit_logs.unshift(newLog);
    return newLog;
  }
}

export const storage = new SeedAndStorageService();
