export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'SCHOOL_ADMIN' 
  | 'HR_ADMIN' 
  | 'ATTENDANCE_OFFICER' 
  | 'TEACHER'
  | 'CLASS_TEACHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  teacherId?: string;
}

export type DepartmentName = 
  | 'Mathematics'
  | 'English'
  | 'Science'
  | 'Social Studies'
  | 'ICT'
  | 'Early Years'
  | 'Primary'
  | 'Administration'
  | 'Languages'
  | 'Humanities';

export interface Department {
  id: string;
  name: DepartmentName;
  headOfDepartment: string;
  teacherCount: number;
  color: string;
}

export type PersonCategory = 
  | 'Teacher'
  | 'Administrator'
  | 'Cleaner'
  | 'Security'
  | 'Driver'
  | 'Maintenance'
  | 'Kitchen/Catering'
  | 'Librarian'
  | 'ICT Staff'
  | 'Management'
  | 'Support Staff'
  | 'Contract Staff'
  | 'Student';

export type AttendanceMethod = 
  | 'QR' 
  | 'PIN' 
  | 'QUICK_ATTENDANCE' 
  | 'CLASS_REGISTER';

export type EventType = 
  | 'CLOCK_IN' 
  | 'CLOCK_OUT' 
  | 'PRESENT' 
  | 'ABSENT' 
  | 'LATE' 
  | 'EXCUSED';

export type AttendanceStatus = 
  | 'Present' 
  | 'Late' 
  | 'Absent' 
  | 'Early Departure' 
  | 'Missing Clock-Out' 
  | 'Leave' 
  | 'Excused'
  | 'Holiday';

export type SyncStatus = 'SYNCED' | 'PENDING' | 'SYNCING' | 'FAILED';

export interface Shift {
  id: string;
  name: string;
  category: PersonCategory;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  lateCutoffTime: string;
}

export interface DriverVehicleInfo {
  vehicleName: string;
  registration: string;
  route: string;
  morningShift: string;
  afternoonShift: string;
}

export interface Person {
  id: string;
  uuid: string;
  fullName: string;
  firstName: string;
  lastName: string;
  title?: 'Mr.' | 'Mrs.' | 'Ms.' | 'Dr.' | 'Engr.' | 'Chief';
  gender: 'Female' | 'Male';
  email?: string;
  phone: string;
  category: PersonCategory;
  departmentOrClass: string;
  department?: string; // alias
  position: string;
  employmentDate: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Inactive';
  attendanceMethod: AttendanceMethod;
  pinCode?: string;
  shiftId: string;
  avatar: string;
  qrToken: string;
  qrGeneratedAt: string;
  supervisor?: string;
  vehicleInfo?: DriverVehicleInfo;
}

export type Teacher = Person;

export interface SchoolClass {
  id: string;
  name: string;
  classTeacherId: string;
  classTeacherName: string;
  section: 'Junior Secondary' | 'Senior Secondary' | 'Primary' | 'Early Years';
  studentCount: number;
}

export interface Student {
  id: string;
  admissionNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  photo: string;
  classId: string;
  className: string;
  section: string;
  house: 'Blue Sapphire' | 'Red Ruby' | 'Green Emerald' | 'Yellow Gold';
  gender: 'Male' | 'Female';
  parentGuardianName: string;
  parentPhone: string;
  status: 'Active' | 'Suspended' | 'Transferred';
  qrToken: string;
}

export interface AttendanceRecord {
  id: string;
  school_id: string;
  person_id: string;
  person_name: string;
  person_type: PersonCategory;
  department_or_class: string;
  attendance_method: AttendanceMethod;
  event_type: EventType;
  date: string;
  timestamp: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  shift_id?: string;
  status: AttendanceStatus;
  hoursWorked: number | null;
  device_id: string;
  device_location?: string;
  recorded_by: string;
  reason?: string;
  offline_created: boolean;
  sync_status: SyncStatus;
  isManualCorrection?: boolean;
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Backward compatibility aliases
  teacherId?: string;
  teacherName?: string;
  department?: string;
  deviceId?: string;
  deviceLocation?: string;
  syncStatus?: SyncStatus;
}

export interface SyncQueueItem {
  id: string;
  attendanceId: string;
  personId: string;
  personName: string;
  personType: PersonCategory;
  departmentOrClass: string;
  attendanceMethod: AttendanceMethod;
  eventType: EventType;
  timestamp: string;
  formattedTime: string;
  date: string;
  deviceId: string;
  deviceLocation: string;
  recordedBy: string;
  reason?: string;
  syncStatus: SyncStatus;
  retryCount: number;
  error?: string;

  // Backward compatibility aliases
  teacherName?: string;
  teacherId?: string;
  department?: string;
}

export interface AttendanceDevice {
  id: string;
  name: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  lastSeen: string;
  pendingRecords: number;
  lastSyncTime: string;
  ipAddress: string;
  deviceType: 'Tablet' | 'Dedicated Kiosk' | 'Mobile Reader';
}

export interface AttendanceSettings {
  schoolName: string;
  tagline: string;
  subtitle: string;
  supportingStatement: string;
  secondaryStatement: string;
  motto: string;
  schoolOpeningTime: string;
  lateThresholdTime: string;
  expectedClosingTime: string;
  earlyDepartureThresholdTime: string;
  gracePeriodMinutes: number;
  workingDays: string[];
  currency: string;
  academicTerm: string;
  academicSession: string;
  autoSyncIntervalSeconds: number;
  pinAttendanceEnabled: boolean;
  quickAttendanceRoles: UserRole[];
}

export type LeaveType = 
  | 'Annual Leave' 
  | 'Sick Leave' 
  | 'Maternity Leave' 
  | 'Official Assignment' 
  | 'Emergency Leave' 
  | 'Compassionate Leave'
  | 'Other';

export interface LeaveRequest {
  id: string;
  personId: string;
  personName: string;
  category: PersonCategory;
  departmentOrClass: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;

  // Backward compatibility aliases
  teacherId?: string;
  teacherName?: string;
  department?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  time: string;
  date: string;
  user: string;
  userRole: UserRole;
  action: string;
  category: 'ATTENDANCE' | 'SECURITY' | 'SYNC' | 'STAFF' | 'STUDENT' | 'LEAVE' | 'DEVICE' | 'SYSTEM';
  details: string;
  deviceId?: string;
  recordId?: string;
  method?: AttendanceMethod;
  recordedBy?: string;
  mode?: 'ONLINE' | 'OFFLINE';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  linkTab?: string;
}
