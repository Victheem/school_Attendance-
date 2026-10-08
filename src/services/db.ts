import { 
  Person, 
  Student, 
  SchoolClass, 
  Shift, 
  AttendanceRecord, 
  SyncQueueItem, 
  AttendanceDevice, 
  AttendanceSettings, 
  LeaveRequest, 
  AuditLog, 
  Teacher
} from '../types';
import { 
  ALL_STAFF_DATA, 
  STUDENTS_DATA, 
  SCHOOL_CLASSES_DATA, 
  SHIFTS_DATA, 
  ATTENDANCE_DEVICES_DATA, 
  DEFAULT_SETTINGS, 
  LEAVE_REQUESTS_DATA, 
  INITIAL_AUDIT_LOGS,
  generateInitialAttendanceRecords
} from './seedData';

const DB_NAME = 'SchoolAttendanceWorkforceOS_DB_v2';
const DB_VERSION = 1;

class OfflineDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback: Record<string, any> = {};

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('people')) {
          db.createObjectStore('people', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('students')) {
          db.createObjectStore('students', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('classes')) {
          db.createObjectStore('classes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('shifts')) {
          db.createObjectStore('shifts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('attendance')) {
          const store = db.createObjectStore('attendance', { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('person_id', 'person_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('devices')) {
          db.createObjectStore('devices', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('leave_requests')) {
          db.createObjectStore('leave_requests', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('audit_logs')) {
          db.createObjectStore('audit_logs', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  private async getStoreData<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const local = localStorage.getItem(`saw_${storeName}`);
      return local ? JSON.parse(local) : (this.memoryFallback[storeName] || []);
    }
  }

  private async putItem(storeName: string, item: any): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => {
          this.syncToLocalStorage(storeName);
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const list = await this.getStoreData<any>(storeName);
      const idx = list.findIndex(i => i.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.push(item);
      localStorage.setItem(`saw_${storeName}`, JSON.stringify(list));
      this.memoryFallback[storeName] = list;
    }
  }

  private async putBatch(storeName: string, items: any[]): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        items.forEach(item => store.put(item));
        tx.oncomplete = () => {
          this.syncToLocalStorage(storeName);
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      localStorage.setItem(`saw_${storeName}`, JSON.stringify(items));
      this.memoryFallback[storeName] = items;
    }
  }

  private async deleteItem(storeName: string, id: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const list = await this.getStoreData<any>(storeName);
      const filtered = list.filter(i => i.id !== id);
      localStorage.setItem(`saw_${storeName}`, JSON.stringify(filtered));
      this.memoryFallback[storeName] = filtered;
    }
  }

  private async syncToLocalStorage(storeName: string) {
    try {
      const data = await this.getStoreData(storeName);
      localStorage.setItem(`saw_${storeName}`, JSON.stringify(data));
    } catch (e) {
      // Ignored
    }
  }

  public async initialize(): Promise<void> {
    const existing = await this.getStoreData<Person>('people');
    if (existing.length === 0) {
      const { records: seedAttendance, syncQueue: seedQueue } = generateInitialAttendanceRecords();
      await this.putBatch('people', ALL_STAFF_DATA);
      await this.putBatch('students', STUDENTS_DATA);
      await this.putBatch('classes', SCHOOL_CLASSES_DATA);
      await this.putBatch('shifts', SHIFTS_DATA);
      await this.putBatch('attendance', seedAttendance);
      await this.putBatch('sync_queue', seedQueue);
      await this.putBatch('devices', ATTENDANCE_DEVICES_DATA);
      await this.putItem('settings', { id: 'primary_settings', ...DEFAULT_SETTINGS });
      await this.putBatch('leave_requests', LEAVE_REQUESTS_DATA);
      await this.putBatch('audit_logs', INITIAL_AUDIT_LOGS);
    }
  }

  public async getPeople(): Promise<Person[]> {
    return this.getStoreData<Person>('people');
  }

  public async getTeachers(): Promise<Teacher[]> {
    const people = await this.getPeople();
    return people.filter(p => p.category === 'Teacher');
  }

  public async savePerson(person: Person): Promise<void> {
    await this.putItem('people', person);
  }

  public async saveTeacher(teacher: Teacher): Promise<void> {
    await this.savePerson(teacher);
  }

  public async getStudents(): Promise<Student[]> {
    return this.getStoreData<Student>('students');
  }

  public async saveStudent(student: Student): Promise<void> {
    await this.putItem('students', student);
  }

  public async getClasses(): Promise<SchoolClass[]> {
    return this.getStoreData<SchoolClass>('classes');
  }

  public async getShifts(): Promise<Shift[]> {
    return this.getStoreData<Shift>('shifts');
  }

  public async saveShift(shift: Shift): Promise<void> {
    await this.putItem('shifts', shift);
  }

  public async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    return this.getStoreData<AttendanceRecord>('attendance');
  }

  public async saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
    await this.putItem('attendance', record);
  }

  public async saveAttendanceBatch(records: AttendanceRecord[]): Promise<void> {
    await this.putBatch('attendance', records);
  }

  public async getSyncQueue(): Promise<SyncQueueItem[]> {
    return this.getStoreData<SyncQueueItem>('sync_queue');
  }

  public async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    await this.putItem('sync_queue', item);
  }

  public async addToSyncQueueBatch(items: SyncQueueItem[]): Promise<void> {
    await this.putBatch('sync_queue', items);
  }

  public async clearSyncQueue(): Promise<void> {
    const items = await this.getSyncQueue();
    for (const item of items) {
      await this.deleteItem('sync_queue', item.id);
    }
  }

  public async getDevices(): Promise<AttendanceDevice[]> {
    return this.getStoreData<AttendanceDevice>('devices');
  }

  public async saveDevice(device: AttendanceDevice): Promise<void> {
    await this.putItem('devices', device);
  }

  public async getSettings(): Promise<AttendanceSettings> {
    const list = await this.getStoreData<any>('settings');
    if (list.length > 0) {
      const { id, ...rest } = list[0];
      return rest as AttendanceSettings;
    }
    return DEFAULT_SETTINGS;
  }

  public async saveSettings(settings: AttendanceSettings): Promise<void> {
    await this.putItem('settings', { id: 'primary_settings', ...settings });
  }

  public async getLeaveRequests(): Promise<LeaveRequest[]> {
    return this.getStoreData<LeaveRequest>('leave_requests');
  }

  public async saveLeaveRequest(request: LeaveRequest): Promise<void> {
    await this.putItem('leave_requests', request);
  }

  public async getAuditLogs(): Promise<AuditLog[]> {
    const logs = await this.getStoreData<AuditLog>('audit_logs');
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public async addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const timestamp = new Date().toISOString();
    const newLog: AuditLog = {
      ...log,
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp,
    };
    await this.putItem('audit_logs', newLog);
    return newLog;
  }

  public async resetDemoData(): Promise<void> {
    localStorage.clear();
    const { records: seedAttendance, syncQueue: seedQueue } = generateInitialAttendanceRecords();
    await this.putBatch('people', ALL_STAFF_DATA);
    await this.putBatch('students', STUDENTS_DATA);
    await this.putBatch('classes', SCHOOL_CLASSES_DATA);
    await this.putBatch('shifts', SHIFTS_DATA);
    await this.putBatch('attendance', seedAttendance);
    await this.putBatch('sync_queue', seedQueue);
    await this.putBatch('devices', ATTENDANCE_DEVICES_DATA);
    await this.putItem('settings', { id: 'primary_settings', ...DEFAULT_SETTINGS });
    await this.putBatch('leave_requests', LEAVE_REQUESTS_DATA);
    await this.putBatch('audit_logs', INITIAL_AUDIT_LOGS);
  }
}

export const dbService = new OfflineDatabase();
