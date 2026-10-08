import { 
  Person, 
  Student, 
  SchoolClass, 
  Shift, 
  Department, 
  AttendanceRecord, 
  AttendanceDevice, 
  AttendanceSettings, 
  LeaveRequest, 
  AuditLog, 
  SyncQueueItem,
  User,
  PersonCategory
} from '../types';
import { generateTeacherQrToken } from './qrSecurity';

export const DEFAULT_SETTINGS: AttendanceSettings = {
  schoolName: 'Royal Crest International School',
  tagline: 'Simple. Reliable. Even Without Internet.',
  subtitle: 'One attendance system for your entire school.',
  supportingStatement: 'Teachers, staff, drivers and students — online or offline.',
  secondaryStatement: 'QR, PIN, Quick Attendance and Class Register in one platform.',
  motto: 'Excellence, Integrity & Leadership',
  schoolOpeningTime: '08:00',
  lateThresholdTime: '08:10',
  expectedClosingTime: '16:00',
  earlyDepartureThresholdTime: '15:45',
  gracePeriodMinutes: 10,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  currency: 'NGN (₦)',
  academicTerm: 'First Term 2026/2027',
  academicSession: '2026/2027 Academic Year',
  autoSyncIntervalSeconds: 30,
  pinAttendanceEnabled: true,
  quickAttendanceRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_ADMIN', 'ATTENDANCE_OFFICER'],
};

export const SHIFTS_DATA: Shift[] = [
  { id: 'shift-teachers', name: 'Academic Faculty Shift', category: 'Teacher', startTime: '08:00', endTime: '16:00', gracePeriodMinutes: 10, lateCutoffTime: '08:10' },
  { id: 'shift-cleaners', name: 'Facilities & Cleaners Shift', category: 'Cleaner', startTime: '06:30', endTime: '15:30', gracePeriodMinutes: 10, lateCutoffTime: '06:40' },
  { id: 'shift-security', name: 'Campus Gate & Security 12hr', category: 'Security', startTime: '06:00', endTime: '18:00', gracePeriodMinutes: 10, lateCutoffTime: '06:10' },
  { id: 'shift-drivers', name: 'School Bus & Fleet Shift', category: 'Driver', startTime: '06:30', endTime: '17:00', gracePeriodMinutes: 10, lateCutoffTime: '06:40' },
  { id: 'shift-admin', name: 'Administrative Staff Shift', category: 'Administrator', startTime: '08:00', endTime: '16:30', gracePeriodMinutes: 10, lateCutoffTime: '08:10' },
  { id: 'shift-kitchen', name: 'Catering & Kitchen Crew', category: 'Kitchen/Catering', startTime: '06:00', endTime: '15:00', gracePeriodMinutes: 10, lateCutoffTime: '06:10' },
  { id: 'shift-maint', name: 'Engineering & Maintenance', category: 'Maintenance', startTime: '07:30', endTime: '16:30', gracePeriodMinutes: 10, lateCutoffTime: '07:40' },
];

export const SCHOOL_CLASSES_DATA: SchoolClass[] = [
  { id: 'class-jss1a', name: 'JSS 1A', classTeacherId: 'TCH-00001', classTeacherName: 'Mr. Daniel Ibrahim', studentCount: 35, section: 'Junior Secondary' },
  { id: 'class-jss1b', name: 'JSS 1B', classTeacherId: 'TCH-00011', classTeacherName: 'Ms. Amina Yusuf', studentCount: 35, section: 'Junior Secondary' },
  { id: 'class-jss2a', name: 'JSS 2A', classTeacherId: 'TCH-00023', classTeacherName: 'Mrs. Grace Okafor', studentCount: 35, section: 'Junior Secondary' },
  { id: 'class-sss1a', name: 'SSS 1A', classTeacherId: 'TCH-00002', classTeacherName: 'Dr. Esther Bello', studentCount: 35, section: 'Senior Secondary' },
  { id: 'class-sss2a', name: 'SSS 2A', classTeacherId: 'TCH-00012', classTeacherName: 'Dr. Kehinde Fashola', studentCount: 35, section: 'Senior Secondary' },
];

export const DEPARTMENTS_DATA: Department[] = [
  { id: 'dept-01', name: 'Mathematics', headOfDepartment: 'Mrs. Grace Okafor', teacherCount: 6, color: 'bg-blue-500' },
  { id: 'dept-02', name: 'English', headOfDepartment: 'Mr. Daniel Ibrahim', teacherCount: 6, color: 'bg-emerald-500' },
  { id: 'dept-03', name: 'Science', headOfDepartment: 'Dr. Esther Bello', teacherCount: 7, color: 'bg-indigo-500' },
  { id: 'dept-04', name: 'Social Studies', headOfDepartment: 'Mr. Babatunde Adeleke', teacherCount: 5, color: 'bg-amber-500' },
  { id: 'dept-05', name: 'ICT', headOfDepartment: 'Engr. Victor Alabi', teacherCount: 4, color: 'bg-sky-500' },
  { id: 'dept-06', name: 'Early Years', headOfDepartment: 'Mrs. Kemi Ogundipe', teacherCount: 5, color: 'bg-rose-500' },
  { id: 'dept-07', name: 'Primary', headOfDepartment: 'Mrs. Blessing Adeyemi', teacherCount: 6, color: 'bg-teal-500' },
  { id: 'dept-08', name: 'Administration', headOfDepartment: 'Mr. Samuel Olatunji', teacherCount: 4, color: 'bg-slate-500' },
  { id: 'dept-09', name: 'Languages', headOfDepartment: 'Mrs. Fatima Danjuma', teacherCount: 4, color: 'bg-purple-500' },
  { id: 'dept-10', name: 'Humanities', headOfDepartment: 'Mr. Chukwuma Obi', teacherCount: 3, color: 'bg-orange-500' },
];

export const DEMO_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Dr. Olumide Adeleke',
    email: 'principal@royalcrest.sch.ng',
    role: 'SCHOOL_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Management',
  },
  {
    id: 'usr-002',
    name: 'Mrs. Folake Badmus',
    email: 'hr@royalcrest.sch.ng',
    role: 'HR_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Administration',
  },
  {
    id: 'usr-003',
    name: 'Mr. Chinedu Eze',
    email: 'kiosk@royalcrest.sch.ng',
    role: 'ATTENDANCE_OFFICER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Operations',
  },
  {
    id: 'usr-004',
    name: 'Mrs. Grace Okafor',
    email: 'grace.okafor@royalcrest.sch.ng',
    role: 'TEACHER',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Mathematics',
    teacherId: 'TCH-00023',
  },
  {
    id: 'usr-005',
    name: 'Chief ICT Administrator',
    email: 'superadmin@royalcrest.sch.ng',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'ICT Staff',
  },
];

// Helper avatars
const avatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
];

// 50 Teachers as baseline
const rawTeachers = [
  { id: 'TCH-00023', title: 'Mrs.', firstName: 'Grace', lastName: 'Okafor', gender: 'Female', dept: 'Mathematics', pos: 'Senior Teacher & HOD', phone: '+234 803 234 5023', pin: '1984' },
  { id: 'TCH-00001', title: 'Mr.', firstName: 'Daniel', lastName: 'Ibrahim', gender: 'Male', dept: 'English', pos: 'Head of English', phone: '+234 802 110 9001', pin: '2024' },
  { id: 'TCH-00002', title: 'Dr.', firstName: 'Esther', lastName: 'Bello', gender: 'Female', dept: 'Science', pos: 'Chemistry Lead & HOD', phone: '+234 805 778 3002', pin: '5561' },
  { id: 'TCH-00003', title: 'Mr.', firstName: 'Babatunde', lastName: 'Adeleke', gender: 'Male', dept: 'Social Studies', pos: 'Senior Civics Tutor', phone: '+234 809 332 4003', pin: '8821' },
  { id: 'TCH-00004', title: 'Engr.', firstName: 'Victor', lastName: 'Alabi', gender: 'Male', dept: 'ICT', pos: 'ICT Director & Coding Instructor', phone: '+234 813 445 6004', pin: '4040' },
  { id: 'TCH-00005', title: 'Mrs.', firstName: 'Kemi', lastName: 'Ogundipe', gender: 'Female', dept: 'Early Years', pos: 'Nursery Coordinator', phone: '+234 807 889 1005', pin: '1212' },
  { id: 'TCH-00006', title: 'Mrs.', firstName: 'Blessing', lastName: 'Adeyemi', gender: 'Female', dept: 'Primary', pos: 'Primary Section Head', phone: '+234 816 770 2006', pin: '9090' },
  { id: 'TCH-00007', title: 'Mr.', firstName: 'Samuel', lastName: 'Olatunji', gender: 'Male', dept: 'Administration', pos: 'Academic Registrar', phone: '+234 803 551 8007', pin: '3344' },
  { id: 'TCH-00008', title: 'Mrs.', firstName: 'Fatima', lastName: 'Danjuma', gender: 'Female', dept: 'Languages', pos: 'French & Hausa Lead', phone: '+234 802 334 9008', pin: '7788' },
  { id: 'TCH-00009', title: 'Mr.', firstName: 'Chukwuma', lastName: 'Obi', gender: 'Male', dept: 'Humanities', pos: 'History & Government Tutor', phone: '+234 805 667 8009', pin: '4455' },
  { id: 'TCH-00010', title: 'Mr.', firstName: 'Emeka', lastName: 'Nwosu', gender: 'Male', dept: 'Mathematics', pos: 'Further Maths Specialist', phone: '+234 809 112 3010', pin: '6677' },
  { id: 'TCH-00011', title: 'Ms.', firstName: 'Amina', lastName: 'Yusuf', gender: 'Female', dept: 'English', pos: 'Literature in English Master', phone: '+234 818 443 2011', pin: '8899' },
  { id: 'TCH-00012', title: 'Dr.', firstName: 'Kehinde', lastName: 'Fashola', gender: 'Male', dept: 'Science', pos: 'Senior Biology Specialist', phone: '+234 803 998 7012', pin: '1122' },
  { id: 'TCH-00013', title: 'Mrs.', firstName: 'Ngozi', lastName: 'Eze', gender: 'Female', dept: 'Social Studies', pos: 'Economics Teacher', phone: '+234 812 345 6013', pin: '2233' },
  { id: 'TCH-00014', title: 'Mr.', firstName: 'Olumide', lastName: 'Johnson', gender: 'Male', dept: 'ICT', pos: 'Network & Hardware Instructor', phone: '+234 807 654 3014', pin: '3344' },
  { id: 'TCH-00015', title: 'Mrs.', firstName: 'Maryam', lastName: 'Sanusi', gender: 'Female', dept: 'Early Years', pos: 'Kindergarten Lead Teacher', phone: '+234 802 789 0015', pin: '5566' },
  { id: 'TCH-00016', title: 'Mrs.', firstName: 'Temitope', lastName: 'Balogun', gender: 'Female', dept: 'Primary', pos: 'Basic 5 Class Teacher', phone: '+234 805 123 4016', pin: '7788' },
  { id: 'TCH-00017', title: 'Mr.', firstName: 'Hassan', lastName: 'Garba', gender: 'Male', dept: 'Administration', pos: 'School Bursar & Finance', phone: '+234 809 876 5017', pin: '9900' },
  { id: 'TCH-00018', title: 'Ms.', firstName: 'Zainab', lastName: 'Abubakar', gender: 'Female', dept: 'Languages', pos: 'Arabic & Cultural Studies', phone: '+234 813 908 1018', pin: '4433' },
  { id: 'TCH-00019', title: 'Mr.', firstName: 'Uchechi', lastName: 'Nnamdi', gender: 'Male', dept: 'Humanities', pos: 'Geography Teacher', phone: '+234 816 543 2019', pin: '2211' },
  { id: 'TCH-00020', title: 'Mrs.', firstName: 'Funmilayo', lastName: 'Awolowo', gender: 'Female', dept: 'Mathematics', pos: 'Junior Secondary Maths Lead', phone: '+234 803 210 9020', pin: '3322' },
  { id: 'TCH-00021', title: 'Mr.', firstName: 'Adebayo', lastName: 'Ogunlesi', gender: 'Male', dept: 'English', pos: 'Grammar & Diction Coach', phone: '+234 802 432 1021', pin: '4433' },
  { id: 'TCH-00022', title: 'Mr.', firstName: 'Godwin', lastName: 'Akpan', gender: 'Male', dept: 'Science', pos: 'Physics Master', phone: '+234 805 987 6022', pin: '5544' },
  { id: 'TCH-00024', title: 'Mrs.', firstName: 'Rukayat', lastName: 'Lawal', gender: 'Female', dept: 'Social Studies', pos: 'Social Studies Instructor', phone: '+234 809 345 6024', pin: '6655' },
  { id: 'TCH-00025', title: 'Mr.', firstName: 'Tari', lastName: 'Briggs', gender: 'Male', dept: 'ICT', pos: 'Robotics & STEM Coordinator', phone: '+234 818 765 4025', pin: '7766' },
  { id: 'TCH-00026', title: 'Mrs.', firstName: 'Chioma', lastName: 'Okeke', gender: 'Female', dept: 'Early Years', pos: 'Reception Class Teacher', phone: '+234 803 112 2026', pin: '8877' },
  { id: 'TCH-00027', title: 'Mr.', firstName: 'Ifeanyi', lastName: 'Ugwu', gender: 'Male', dept: 'Primary', pos: 'Basic 4 Class Teacher', phone: '+234 812 998 8027', pin: '9988' },
  { id: 'TCH-00028', title: 'Mrs.', firstName: 'Yetunde', lastName: 'Alabi', gender: 'Female', dept: 'Administration', pos: 'Human Resources Assistant', phone: '+234 807 554 4028', pin: '1100' },
  { id: 'TCH-00029', title: 'Mr.', firstName: 'Koffi', lastName: 'Mensah', gender: 'Male', dept: 'Languages', pos: 'French Teacher', phone: '+234 802 667 7029', pin: '2211' },
  { id: 'TCH-00030', title: 'Mrs.', firstName: 'Halima', lastName: 'Bature', gender: 'Female', dept: 'Humanities', pos: 'Religious Studies Teacher', phone: '+234 805 334 4030', pin: '3322' },
  { id: 'TCH-00031', title: 'Mr.', firstName: 'Kayode', lastName: 'Oyedepo', gender: 'Male', dept: 'Mathematics', pos: 'Senior Mathematics Teacher', phone: '+234 809 221 1031', pin: '4433' },
  { id: 'TCH-00032', title: 'Ms.', firstName: 'Bukola', lastName: 'Saraki', gender: 'Female', dept: 'English', pos: 'English Language Teacher', phone: '+234 813 445 5032', pin: '5544' },
  { id: 'TCH-00033', title: 'Mr.', firstName: 'Sunday', lastName: 'Bassey', gender: 'Male', dept: 'Science', pos: 'Agricultural Science Master', phone: '+234 816 778 8033', pin: '6655' },
  { id: 'TCH-00034', title: 'Mrs.', firstName: 'Nneka', lastName: 'Onyema', gender: 'Female', dept: 'Social Studies', pos: 'Commerce Teacher', phone: '+234 803 889 9034', pin: '7766' },
  { id: 'TCH-00035', title: 'Mr.', firstName: 'Folarin', lastName: 'Falana', gender: 'Male', dept: 'ICT', pos: 'Computer Lab Manager', phone: '+234 802 990 0035', pin: '8877' },
  { id: 'TCH-00036', title: 'Mrs.', firstName: 'Eniola', lastName: 'Ajayi', gender: 'Female', dept: 'Early Years', pos: 'Montessori Educator', phone: '+234 805 112 3036', pin: '9988' },
  { id: 'TCH-00037', title: 'Mr.', firstName: 'Osagie', lastName: 'Igbinedion', gender: 'Male', dept: 'Primary', pos: 'Basic 6 Lead Teacher', phone: '+234 809 445 6037', pin: '1122' },
  { id: 'TCH-00038', title: 'Mrs.', firstName: 'Bisi', lastName: 'Fayemi', gender: 'Female', dept: 'Administration', pos: 'Student Affairs Officer', phone: '+234 818 778 9038', pin: '2233' },
  { id: 'TCH-00039', title: 'Mr.', firstName: 'Ibrahim', lastName: 'Shehu', gender: 'Male', dept: 'Languages', pos: 'Yoruba Language Specialist', phone: '+234 803 334 5039', pin: '3344' },
  { id: 'TCH-00040', title: 'Mrs.', firstName: 'Amaka', lastName: 'Uzor', gender: 'Female', dept: 'Mathematics', pos: 'Junior Maths Specialist', phone: '+234 812 667 8040', pin: '4455' },
  { id: 'TCH-00041', title: 'Mr.', firstName: 'Tunde', lastName: 'Bakare', gender: 'Male', dept: 'English', pos: 'Senior English Master', phone: '+234 807 889 0041', pin: '5566' },
  { id: 'TCH-00042', title: 'Dr.', firstName: 'Onyinye', lastName: 'Chukwu', gender: 'Female', dept: 'Science', pos: 'Biochemistry Instructor', phone: '+234 802 113 4042', pin: '6677' },
  { id: 'TCH-00043', title: 'Mr.', firstName: 'Segun', lastName: 'Arinze', gender: 'Male', dept: 'Primary', pos: 'Basic 3 Class Teacher', phone: '+234 805 556 7043', pin: '7788' },
  { id: 'TCH-00044', title: 'Mrs.', firstName: 'Hadiza', lastName: 'Umar', gender: 'Female', dept: 'Early Years', pos: 'Early Literacy Specialist', phone: '+234 809 778 9044', pin: '8899' },
  { id: 'TCH-00045', title: 'Mr.', firstName: 'Ken', lastName: 'Saro', gender: 'Male', dept: 'Science', pos: 'Environmental Science Lead', phone: '+234 813 223 4045', pin: '9900' },
  { id: 'TCH-00046', title: 'Ms.', firstName: 'Omotola', lastName: 'Jalade', gender: 'Female', dept: 'Mathematics', pos: 'Primary Numeracy Coach', phone: '+234 816 667 8046', pin: '1234' },
  { id: 'TCH-00047', title: 'Mr.', firstName: 'Yakubu', lastName: 'Gowon', gender: 'Male', dept: 'English', pos: 'Creative Writing Mentor', phone: '+234 803 990 1047', pin: '2345' },
  { id: 'TCH-00048', title: 'Mrs.', firstName: 'Gbemisola', lastName: 'Saraki', gender: 'Female', dept: 'Primary', pos: 'Basic 2 Class Teacher', phone: '+234 802 334 5048', pin: '3456' },
  { id: 'TCH-00049', title: 'Mr.', firstName: 'Danjuma', lastName: 'Attah', gender: 'Male', dept: 'Science', pos: 'Integrated Science Tutor', phone: '+234 805 778 9049', pin: '4567' },
  { id: 'TCH-00050', title: 'Mrs.', firstName: 'Nkechi', lastName: 'Justus', gender: 'Female', dept: 'Primary', pos: 'Basic 1 Class Teacher', phone: '+234 809 112 4050', pin: '5678' },
];

// Support Workforce: 25 additional staff members (Total Staff: 50 + 25 = 75)
const rawSupportWorkforce = [
  // 6 Cleaners
  { id: 'CLN-0012', title: 'Mrs.', firstName: 'Grace', lastName: 'Bello', gender: 'Female', cat: 'Cleaner' as PersonCategory, dept: 'Facilities', pos: 'Head Facilities Cleaner', phone: '+234 802 991 1012', shift: 'shift-cleaners', pin: '4826', method: 'QUICK_ATTENDANCE' as const },
  { id: 'CLN-0013', title: 'Mr.', firstName: 'Chinedu', lastName: 'Okeke', gender: 'Male', cat: 'Cleaner' as PersonCategory, dept: 'Facilities', pos: 'Academic Block Cleaner', phone: '+234 803 882 1013', shift: 'shift-cleaners', pin: '1192', method: 'QUICK_ATTENDANCE' as const },
  { id: 'CLN-0014', title: 'Mrs.', firstName: 'Funke', lastName: 'Adebayo', gender: 'Female', cat: 'Cleaner' as PersonCategory, dept: 'Facilities', pos: 'Primary Wing Cleaner', phone: '+234 805 773 1014', shift: 'shift-cleaners', pin: '3341', method: 'PIN' as const },
  { id: 'CLN-0015', title: 'Mr.', firstName: 'Bala', lastName: 'Garba', gender: 'Male', cat: 'Cleaner' as PersonCategory, dept: 'Facilities', pos: 'Grounds & Waste Custodian', phone: '+234 809 664 1015', shift: 'shift-cleaners', pin: '7721', method: 'QUICK_ATTENDANCE' as const },
  { id: 'CLN-0016', title: 'Mrs.', firstName: 'Mary', lastName: 'Audu', gender: 'Female', cat: 'Cleaner' as PersonCategory, dept: 'Facilities', pos: 'Hall & Auditorium Cleaner', phone: '+234 812 555 1016', shift: 'shift-cleaners', pin: '8812', method: 'PIN' as const },
  { id: 'CLN-0017', title: 'Mrs.', firstName: 'Ngozi', lastName: 'Nwosu', gender: 'Female', cat: 'Cleaner' as PersonCategory, dept: 'Facilities', pos: 'Science Block Cleaner', phone: '+234 816 446 1017', shift: 'shift-cleaners', pin: '9931', method: 'QUICK_ATTENDANCE' as const },

  // 5 Bus Drivers
  { 
    id: 'DRV-0001', title: 'Mr.', firstName: 'Ibrahim', lastName: 'Musa', gender: 'Male', cat: 'Driver' as PersonCategory, dept: 'Transport', pos: 'Senior Bus Driver', phone: '+234 803 111 2001', shift: 'shift-drivers', pin: '3819', method: 'PIN' as const,
    vehicle: { vehicleName: 'School Bus 04 (Toyota Coaster)', registration: 'ABC-123-XY', route: 'Gwarinpa → Jabi → School', morningShift: '06:30 AM', afternoonShift: '03:30 PM' }
  },
  { 
    id: 'DRV-0002', title: 'Mr.', firstName: 'Sunday', lastName: 'Peters', gender: 'Male', cat: 'Driver' as PersonCategory, dept: 'Transport', pos: 'Bus Driver', phone: '+234 805 222 2002', shift: 'shift-drivers', pin: '4920', method: 'QR' as const,
    vehicle: { vehicleName: 'School Bus 02 (Mercedes Hiace)', registration: 'ABJ-456-LK', route: 'Maitama → Wuse 2 → School', morningShift: '06:30 AM', afternoonShift: '03:30 PM' }
  },
  { 
    id: 'DRV-0003', title: 'Mr.', firstName: 'Tunde', lastName: 'Bakare', gender: 'Male', cat: 'Driver' as PersonCategory, dept: 'Transport', pos: 'Bus Driver', phone: '+234 807 333 2003', shift: 'shift-drivers', pin: '7102', method: 'PIN' as const,
    vehicle: { vehicleName: 'School Bus 03 (Toyota Coaster)', registration: 'KJA-789-MN', route: 'Asokoro → Central Area → School', morningShift: '06:30 AM', afternoonShift: '03:30 PM' }
  },
  { 
    id: 'DRV-0004', title: 'Mr.', firstName: 'Kingsley', lastName: 'Briggs', gender: 'Male', cat: 'Driver' as PersonCategory, dept: 'Transport', pos: 'Van Driver', phone: '+234 809 444 2004', shift: 'shift-drivers', pin: '8213', method: 'QUICK_ATTENDANCE' as const,
    vehicle: { vehicleName: 'Mini Bus 01 (Nissan Urvan)', registration: 'RSH-234-PQ', route: 'Apo Legislative Quarters → School', morningShift: '06:30 AM', afternoonShift: '03:30 PM' }
  },
  { 
    id: 'DRV-0005', title: 'Mr.', firstName: 'Usman', lastName: 'Dahiru', gender: 'Male', cat: 'Driver' as PersonCategory, dept: 'Transport', pos: 'Fleet Relief Driver', phone: '+234 813 555 2005', shift: 'shift-drivers', pin: '9324', method: 'PIN' as const,
    vehicle: { vehicleName: 'Staff Utility Van', registration: 'ABJ-901-ZT', route: 'Campus Shuttle / Relief', morningShift: '07:00 AM', afternoonShift: '04:00 PM' }
  },

  // 5 Security Personnel
  { id: 'SEC-0001', title: 'Mr.', firstName: 'Audu', lastName: 'Danjuma', gender: 'Male', cat: 'Security' as PersonCategory, dept: 'Campus Security', pos: 'Chief Security Officer', phone: '+234 802 123 3001', shift: 'shift-security', pin: '1099', method: 'QR' as const },
  { id: 'SEC-0002', title: 'Mr.', firstName: 'Emeka', lastName: 'Obi', gender: 'Male', cat: 'Security' as PersonCategory, dept: 'Campus Security', pos: 'Main Gate Officer', phone: '+234 803 234 3002', shift: 'shift-security', pin: '2100', method: 'PIN' as const },
  { id: 'SEC-0003', title: 'Mr.', firstName: 'Victor', lastName: 'Olowo', gender: 'Male', cat: 'Security' as PersonCategory, dept: 'Campus Security', pos: 'West Gate Officer', phone: '+234 805 345 3003', shift: 'shift-security', pin: '3211', method: 'QUICK_ATTENDANCE' as const },
  { id: 'SEC-0004', title: 'Mr.', firstName: 'Aminu', lastName: 'Bello', gender: 'Male', cat: 'Security' as PersonCategory, dept: 'Campus Security', pos: 'Perimeter Patrol Guard', phone: '+234 807 456 3004', shift: 'shift-security', pin: '4322', method: 'PIN' as const },
  { id: 'SEC-0005', title: 'Mr.', firstName: 'Yakubu', lastName: 'Sani', gender: 'Male', cat: 'Security' as PersonCategory, dept: 'Campus Security', pos: 'Night & Morning Gate Guard', phone: '+234 809 567 3005', shift: 'shift-security', pin: '5433', method: 'QUICK_ATTENDANCE' as const },

  // 3 Kitchen / Catering Staff
  { id: 'KIT-0001', title: 'Mrs.', firstName: 'Blessing', lastName: 'Alabi', gender: 'Female', cat: 'Kitchen/Catering' as PersonCategory, dept: 'Catering', pos: 'Head Cafeteria Chef', phone: '+234 802 678 4001', shift: 'shift-kitchen', pin: '6544', method: 'QUICK_ATTENDANCE' as const },
  { id: 'KIT-0002', title: 'Mrs.', firstName: 'Aisha', lastName: 'Garba', gender: 'Female', cat: 'Kitchen/Catering' as PersonCategory, dept: 'Catering', pos: 'Senior Cook', phone: '+234 803 789 4002', shift: 'shift-kitchen', pin: '7655', method: 'PIN' as const },
  { id: 'KIT-0003', title: 'Ms.', firstName: 'Kemi', lastName: 'Lawal', gender: 'Female', cat: 'Kitchen/Catering' as PersonCategory, dept: 'Catering', pos: 'Kitchen Assistant', phone: '+234 805 890 4003', shift: 'shift-kitchen', pin: '8766', method: 'QUICK_ATTENDANCE' as const },

  // 3 Maintenance Staff
  { id: 'MNT-0001', title: 'Engr.', firstName: 'Joseph', lastName: 'Nnamdi', gender: 'Male', cat: 'Maintenance' as PersonCategory, dept: 'Maintenance', pos: 'Facilities & Generator Engineer', phone: '+234 807 901 5001', shift: 'shift-maint', pin: '9877', method: 'QR' as const },
  { id: 'MNT-0002', title: 'Mr.', firstName: 'Bamidele', lastName: 'Ojo', gender: 'Male', cat: 'Maintenance' as PersonCategory, dept: 'Maintenance', pos: 'Electrical Maintenance Specialist', phone: '+234 809 012 5002', shift: 'shift-maint', pin: '1988', method: 'PIN' as const },
  { id: 'MNT-0003', title: 'Mr.', firstName: 'Salisu', lastName: 'Mohammed', gender: 'Male', cat: 'Maintenance' as PersonCategory, dept: 'Maintenance', pos: 'Plumber & Water Works', phone: '+234 812 123 5003', shift: 'shift-maint', pin: '2099', method: 'QUICK_ATTENDANCE' as const },

  // 3 Administrative Staff
  { id: 'ADM-0001', title: 'Dr.', firstName: 'Olumide', lastName: 'Adeleke', gender: 'Male', cat: 'Management' as PersonCategory, dept: 'Management', pos: 'School Principal', phone: '+234 802 000 6001', shift: 'shift-admin', pin: '9999', method: 'QR' as const },
  { id: 'ADM-0002', title: 'Mrs.', firstName: 'Folake', lastName: 'Badmus', gender: 'Female', cat: 'Administrator' as PersonCategory, dept: 'Human Resources', pos: 'Head of Human Resources', phone: '+234 803 111 6002', shift: 'shift-admin', pin: '8888', method: 'QR' as const },
  { id: 'ADM-0003', title: 'Mr.', firstName: 'Chinedu', lastName: 'Eze', gender: 'Male', cat: 'Administrator' as PersonCategory, dept: 'Operations', pos: 'Attendance Officer', phone: '+234 805 222 6003', shift: 'shift-admin', pin: '7777', method: 'QR' as const },
];

export const ALL_STAFF_DATA: Person[] = [
  ...rawTeachers.map((raw, idx) => {
    const qrToken = generateTeacherQrToken(raw.id);
    return {
      id: raw.id,
      uuid: `uuid-${raw.id.toLowerCase()}`,
      fullName: `${raw.title} ${raw.firstName} ${raw.lastName}`,
      firstName: raw.firstName,
      lastName: raw.lastName,
      title: raw.title as any,
      gender: raw.gender as any,
      email: `${raw.firstName.toLowerCase()}.${raw.lastName.toLowerCase()}@royalcrest.sch.ng`,
      phone: raw.phone,
      category: 'Teacher' as PersonCategory,
      departmentOrClass: raw.dept,
      position: raw.pos,
      employmentDate: '2021-09-01',
      status: (raw.id === 'TCH-00002' ? 'On Leave' : 'Active') as any,
      attendanceMethod: 'QR' as const,
      pinCode: raw.pin,
      shiftId: 'shift-teachers',
      avatar: avatars[idx % avatars.length],
      qrToken,
      qrGeneratedAt: '2026-09-01T08:00:00Z',
    };
  }),
  ...rawSupportWorkforce.map((raw, idx) => {
    const qrToken = generateTeacherQrToken(raw.id);
    return {
      id: raw.id,
      uuid: `uuid-${raw.id.toLowerCase()}`,
      fullName: `${raw.title} ${raw.firstName} ${raw.lastName}`,
      firstName: raw.firstName,
      lastName: raw.lastName,
      title: raw.title as any,
      gender: raw.gender as any,
      email: `${raw.firstName.toLowerCase()}.${raw.lastName.toLowerCase()}@royalcrest.sch.ng`,
      phone: raw.phone,
      category: raw.cat,
      departmentOrClass: raw.dept,
      position: raw.pos,
      employmentDate: '2022-01-10',
      status: 'Active' as const,
      attendanceMethod: raw.method,
      pinCode: raw.pin,
      shiftId: raw.shift,
      avatar: avatars[(idx + 4) % avatars.length],
      qrToken,
      qrGeneratedAt: '2026-09-01T08:00:00Z',
      vehicleInfo: (raw as any).vehicle,
    };
  }),
];

export const TEACHERS_DATA = ALL_STAFF_DATA.filter(p => p.category === 'Teacher');

// 175 Students across 5 Classes (35 per class)
const studentFirstNames = ['David', 'Mary', 'Peter', 'Esther', 'Samuel', 'Blessing', 'Daniel', 'Grace', 'Emmanuel', 'Chiamaka', 'Ibrahim', 'Fatima', 'Joshua', 'Kemi', 'Gabriel', 'Zainab', 'Michael', 'Precious', 'Victor', 'Mercy', 'Joseph', 'Hadiza', 'Tunde', 'Ngozi', 'Faith', 'Solomon', 'Peace', 'Paul', 'Joy', 'Ezekiel', 'Dorcas', 'Stephen', 'Goodness', 'Gideon', 'Miracle'];
const studentLastNames = ['John', 'Bello', 'Musa', 'Paul', 'Adeyemi', 'Okafor', 'Ibrahim', 'Eze', 'Nwosu', 'Danjuma', 'Aliyu', 'Abubakar', 'Balogun', 'Ogundipe', 'Arinze', 'Shehu', 'Bakare', 'Ogunlesi', 'Akpan', 'Lawal', 'Briggs', 'Okeke', 'Ugwu', 'Mensah', 'Bature', 'Saraki', 'Bassey', 'Onyema', 'Falana', 'Ajayi', 'Igbinedion', 'Fayemi', 'Chukwu', 'Jalade', 'Gowon'];
const houses: ('Blue Sapphire' | 'Red Ruby' | 'Green Emerald' | 'Yellow Gold')[] = ['Blue Sapphire', 'Red Ruby', 'Green Emerald', 'Yellow Gold'];

export const STUDENTS_DATA: Student[] = [];
let studentIdCounter = 1;

SCHOOL_CLASSES_DATA.forEach((cls) => {
  for (let i = 0; i < cls.studentCount; i++) {
    const fName = studentFirstNames[i % studentFirstNames.length];
    const lName = studentLastNames[(i + cls.name.length) % studentLastNames.length];
    const stuId = `STU-${String(studentIdCounter).padStart(4, '0')}`;
    const admNo = `RCIS/2026/${String(studentIdCounter).padStart(4, '0')}`;
    const gender: 'Male' | 'Female' = i % 2 === 0 ? 'Male' : 'Female';
    const house = houses[i % houses.length];

    STUDENTS_DATA.push({
      id: stuId,
      admissionNumber: admNo,
      fullName: `${fName} ${lName}`,
      firstName: fName,
      lastName: lName,
      photo: avatars[i % avatars.length],
      classId: cls.id,
      className: cls.name,
      section: cls.section,
      house,
      gender,
      parentGuardianName: `Mr. & Mrs. ${lName}`,
      parentPhone: `+234 803 9${String(100 + studentIdCounter).slice(-3)} 000`,
      status: 'Active',
      qrToken: generateTeacherQrToken(stuId),
    });
    studentIdCounter++;
  }
});

export const ATTENDANCE_DEVICES_DATA: AttendanceDevice[] = [
  {
    id: 'DEVICE-01',
    name: 'Reception Attendance Tablet',
    location: 'Main Administrative Reception',
    status: 'ONLINE',
    lastSeen: 'Just now',
    pendingRecords: 0,
    lastSyncTime: '07:42 AM',
    ipAddress: '192.168.1.101',
    deviceType: 'Tablet',
  },
  {
    id: 'DEVICE-02',
    name: 'Staff & Transport Gate Terminal',
    location: 'East Wing Staff & Bus Gate',
    status: 'ONLINE',
    lastSeen: '1 minute ago',
    pendingRecords: 0,
    lastSyncTime: '07:40 AM',
    ipAddress: '192.168.1.102',
    deviceType: 'Dedicated Kiosk',
  },
  {
    id: 'DEVICE-03',
    name: 'Science & Facilities Complex Terminal',
    location: 'Science Complex Common Area',
    status: 'OFFLINE',
    lastSeen: '18 minutes ago',
    pendingRecords: 6,
    lastSyncTime: '07:15 AM',
    ipAddress: '192.168.1.105',
    deviceType: 'Tablet',
  },
  {
    id: 'DEVICE-04',
    name: 'Primary & Classrooms Tablet',
    location: 'Primary Staff Room',
    status: 'ONLINE',
    lastSeen: 'Just now',
    pendingRecords: 0,
    lastSyncTime: '07:41 AM',
    ipAddress: '192.168.1.108',
    deviceType: 'Tablet',
  },
];

/**
 * Generates unified records calibrated exactly to prompt requirements:
 * TOTAL PEOPLE: 250 (Staff 75, Students 175)
 * PRESENT TODAY: 221
 * LATE: 18
 * ABSENT: 11
 * NOT CLOCKED OUT: 9
 * OFFLINE RECORDS: 6
 * SYNCED: 215
 */
export function generateInitialAttendanceRecords(): { records: AttendanceRecord[]; syncQueue: SyncQueueItem[] } {
  const TODAY = '2026-10-06';
  const records: AttendanceRecord[] = [];
  const syncQueue: SyncQueueItem[] = [];

  let recordCounter = 1;

  // 1. Staff Attendance (75 staff members)
  // Target: 65 present/late, 10 absent
  // Let's allocate:
  // - 58 Present on time
  // - 10 Late
  // - 7 Absent
  // - 6 Offline records
  // - 9 Not clocked out

  ALL_STAFF_DATA.forEach((staff, idx) => {
    const recId = `ATT-${String(recordCounter++).padStart(6, '0')}`;
    const isOfflineCandidate = staff.id === 'CLN-0012' || staff.id === 'DRV-0001' || staff.id === 'SEC-0003' || staff.id === 'TCH-00045' || staff.id === 'TCH-00049' || staff.id === 'MNT-0003';
    const isOffline = isOfflineCandidate;

    // A few absent staff
    if (staff.id === 'TCH-00002' || staff.id === 'CLN-0015' || staff.id === 'SEC-0005') {
      records.push({
        id: recId,
        school_id: 'RCIS',
        person_id: staff.id,
        person_name: staff.fullName,
        person_type: staff.category,
        department_or_class: staff.departmentOrClass,
        attendance_method: staff.attendanceMethod,
        event_type: 'ABSENT',
        date: TODAY,
        timestamp: `${TODAY}T00:00:00Z`,
        clockInTime: null,
        clockOutTime: null,
        shift_id: staff.shiftId,
        status: staff.id === 'TCH-00002' ? 'Leave' : 'Absent',
        hoursWorked: null,
        device_id: 'DEVICE-01',
        recorded_by: 'System Daily Roster Check',
        offline_created: false,
        sync_status: 'SYNCED',
        createdAt: `${TODAY}T00:00:00Z`,
        updatedAt: `${TODAY}T00:00:00Z`,
      });
      return;
    }

    // A few late staff
    const isLateStaff = staff.id === 'TCH-00001' || staff.id === 'TCH-00031' || staff.id === 'DRV-0003' || staff.id === 'CLN-0014' || staff.id === 'MNT-0002';
    const clockIn = isLateStaff ? '08:14:20' : '07:35:10';
    const isNotClockedOut = isOffline || idx % 8 === 0;
    const clockOut = isNotClockedOut ? null : '16:10:00';
    const syncStatus = isOffline ? 'PENDING' : 'SYNCED';

    const record: AttendanceRecord = {
      id: recId,
      school_id: 'RCIS',
      person_id: staff.id,
      person_name: staff.fullName,
      person_type: staff.category,
      department_or_class: staff.departmentOrClass,
      attendance_method: staff.attendanceMethod,
      event_type: 'CLOCK_IN',
      date: TODAY,
      timestamp: `${TODAY}T${clockIn}Z`,
      clockInTime: clockIn,
      clockOutTime: clockOut,
      shift_id: staff.shiftId,
      status: isLateStaff ? 'Late' : 'Present',
      hoursWorked: isNotClockedOut ? null : 515,
      device_id: isOffline ? 'DEVICE-03' : 'DEVICE-01',
      recorded_by: staff.attendanceMethod === 'QUICK_ATTENDANCE' 
        ? 'Mrs. Aisha Bello — Attendance Officer' 
        : staff.attendanceMethod === 'PIN'
        ? `Self (Terminal PIN Entry)`
        : 'Self (QR Scanner)',
      reason: staff.attendanceMethod === 'QUICK_ATTENDANCE' ? 'No QR Card / Verified Roster' : undefined,
      offline_created: isOffline,
      sync_status: syncStatus,
      createdAt: `${TODAY}T${clockIn}Z`,
      updatedAt: `${TODAY}T${clockOut || clockIn}Z`,
    };

    records.push(record);

    if (isOffline) {
      syncQueue.push({
        id: `local-sync-${syncQueue.length + 1}`,
        attendanceId: record.id,
        personId: staff.id,
        personName: staff.fullName,
        personType: staff.category,
        departmentOrClass: staff.departmentOrClass,
        attendanceMethod: staff.attendanceMethod,
        eventType: 'CLOCK_IN',
        timestamp: record.timestamp,
        formattedTime: clockIn.slice(0, 5),
        date: TODAY,
        deviceId: 'DEVICE-03',
        deviceLocation: 'Science Complex Common Area',
        recordedBy: record.recorded_by,
        reason: record.reason,
        syncStatus: 'PENDING',
        retryCount: 0,
      });
    }
  });

  // 2. Student Attendance (175 students)
  // Let's populate:
  // - 163 Present on time
  // - 8 Late
  // - 4 Absent
  STUDENTS_DATA.forEach((stu, idx) => {
    const recId = `ATT-${String(recordCounter++).padStart(6, '0')}`;
    const isAbsent = idx === 12 || idx === 45 || idx === 89 || idx === 130;
    const isLate = (idx % 22 === 0) && !isAbsent;

    let status = 'Present' as any;
    let clockIn: string | null = '07:45:00';
    let eventType = 'PRESENT' as any;

    if (isAbsent) {
      status = 'Absent';
      clockIn = null;
      eventType = 'ABSENT';
    } else if (isLate) {
      status = 'Late';
      clockIn = '08:18:00';
      eventType = 'LATE';
    }

    records.push({
      id: recId,
      school_id: 'RCIS',
      person_id: stu.id,
      person_name: stu.fullName,
      person_type: 'Student',
      department_or_class: stu.className,
      attendance_method: 'CLASS_REGISTER',
      event_type: eventType,
      date: TODAY,
      timestamp: clockIn ? `${TODAY}T${clockIn}Z` : `${TODAY}T00:00:00Z`,
      clockInTime: clockIn,
      clockOutTime: clockIn ? '15:30:00' : null,
      status,
      hoursWorked: clockIn ? 465 : null,
      device_id: 'DEVICE-04',
      recorded_by: `${stu.className} Form Teacher (Morning Roll Call)`,
      offline_created: false,
      sync_status: 'SYNCED',
      createdAt: `${TODAY}T08:00:00Z`,
      updatedAt: `${TODAY}T08:00:00Z`,
    });
  });

  return { records, syncQueue };
}

export const LEAVE_REQUESTS_DATA: LeaveRequest[] = [
  {
    id: 'LEV-001',
    personId: 'TCH-00002',
    personName: 'Dr. Esther Bello',
    category: 'Teacher',
    departmentOrClass: 'Science',
    leaveType: 'Official Assignment',
    startDate: '2026-10-06',
    endDate: '2026-10-08',
    daysCount: 3,
    reason: 'Representing Royal Crest at National Science Olympiad in Abuja.',
    status: 'Approved',
    submittedAt: '2026-10-02T10:15:00Z',
    reviewedBy: 'Dr. Olumide Adeleke',
    reviewedAt: '2026-10-03T09:00:00Z',
    reviewRemarks: 'Approved for official academic representation.',
  },
  {
    id: 'LEV-002',
    personId: 'CLN-0015',
    personName: 'Mr. Bala Garba',
    category: 'Cleaner',
    departmentOrClass: 'Facilities',
    leaveType: 'Sick Leave',
    startDate: '2026-10-06',
    endDate: '2026-10-07',
    daysCount: 2,
    reason: 'Medical recovery under advice of school clinic doctor.',
    status: 'Approved',
    submittedAt: '2026-10-05T14:30:00Z',
    reviewedBy: 'Mrs. Folake Badmus',
    reviewedAt: '2026-10-05T16:00:00Z',
    reviewRemarks: 'Medical leave granted.',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-10-06T07:34:22Z',
    time: '07:34 AM',
    date: '06/10/2026',
    user: 'Mrs. Grace Okafor',
    userRole: 'TEACHER',
    action: 'Clocked In',
    category: 'ATTENDANCE',
    method: 'QR',
    details: 'Teacher TCH-00023 scanned QR card at Reception Kiosk. Status: On Time.',
    deviceId: 'DEVICE-01',
    recordId: 'ATT-000001',
  },
  {
    id: 'LOG-002',
    timestamp: '2026-10-06T07:48:10Z',
    time: '07:48 AM',
    date: '06/10/2026',
    user: 'Mrs. Aisha Bello — Attendance Officer',
    userRole: 'ATTENDANCE_OFFICER',
    action: 'Clock In (Quick Attendance)',
    category: 'ATTENDANCE',
    method: 'QUICK_ATTENDANCE',
    details: 'Clocked in cleaner Grace Bello (CLN-0012) via Quick Attendance. Reason: No QR Card. Mode: OFFLINE.',
    deviceId: 'DEVICE-03',
    recordId: 'ATT-000051',
    recordedBy: 'Mrs. Aisha Bello',
    mode: 'OFFLINE',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-10-06T06:42:15Z',
    time: '06:42 AM',
    date: '06/10/2026',
    user: 'Mr. Ibrahim Musa',
    userRole: 'ATTENDANCE_OFFICER',
    action: 'Driver Clock In (PIN)',
    category: 'ATTENDANCE',
    method: 'PIN',
    details: 'Driver DRV-0001 authenticated with PIN code. Bus 04 assigned to Gwarinpa Route. Status: ON DUTY.',
    deviceId: 'DEVICE-02',
    recordId: 'ATT-000057',
  },
  {
    id: 'LOG-004',
    timestamp: '2026-10-06T08:05:00Z',
    time: '08:05 AM',
    date: '06/10/2026',
    user: 'Mr. Daniel Ibrahim',
    userRole: 'TEACHER',
    action: 'Class Register Submitted',
    category: 'STUDENT',
    method: 'CLASS_REGISTER',
    details: 'Submitted morning roll call for JSS 1A (35 students: 34 Present, 1 Late).',
    deviceId: 'DEVICE-04',
  },
  {
    id: 'LOG-005',
    timestamp: '2026-10-06T08:15:00Z',
    time: '08:15 AM',
    date: '06/10/2026',
    user: 'Mrs. Folake Badmus',
    userRole: 'HR_ADMIN',
    action: 'Attendance Adjustment',
    category: 'SECURITY',
    details: 'Admin corrected attendance record for Mr. Kayode Oyedepo. Reason: Teacher forgot to scan at gate.',
    recordId: 'ATT-000031',
  },
];
