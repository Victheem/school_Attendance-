import { Router, Request, Response } from 'express';
import { storage } from '../services/storage.service';
import { db } from '../config/database';
import { generateToken, authenticate, authorize } from '../middleware/auth';
import { DEMO_USERS } from '../../../src/services/seedData';

const router = Router();

// 1. Health check endpoint (Section 29)
router.get('/health', async (req: Request, res: Response) => {
  const dbStatus = await db.testConnection();
  res.json({
    status: 'ok',
    database: dbStatus.connected ? 'connected' : 'offline_fallback',
    provider: dbStatus.provider,
    serverTime: new Date().toISOString(),
    version: '2.0.0-standalone',
    mode: process.env.NODE_ENV || 'production',
    offlineCapable: true,
    supabaseFree: true,
  });
});

// 2. Authentication: Login endpoint
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, role } = req.body;
  const user = DEMO_USERS.find(u => u.email === email || u.role === role) || DEMO_USERS[0];
  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: 'RCIS'
  });

  res.json({
    token,
    user,
    message: 'Authentication successful',
  });
});

// 3. People (Staff & Teachers)
router.get('/people', authenticate, async (req: Request, res: Response) => {
  const people = await storage.getPeople();
  res.json(people);
});

router.post('/people', authenticate, authorize(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_ADMIN']), async (req: Request, res: Response) => {
  const saved = await storage.savePerson(req.body);
  await storage.addAuditLog({
    user: req.user?.name || 'Administrator',
    userRole: req.user?.role || 'SCHOOL_ADMIN',
    action: 'Person Registered',
    category: 'WORKFORCE',
    details: `Added ${saved.fullName} (${saved.category}, ${saved.id}) to school directory.`,
  });
  res.status(201).json(saved);
});

// 4. Students
router.get('/students', authenticate, async (req: Request, res: Response) => {
  const students = await storage.getStudents();
  res.json(students);
});

router.post('/students', authenticate, authorize(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']), async (req: Request, res: Response) => {
  const saved = await storage.saveStudent(req.body);
  res.status(201).json(saved);
});

// 5. Attendance Listing & Recording
router.get('/attendance', authenticate, async (req: Request, res: Response) => {
  const { date, personId, limit } = req.query;
  const records = await storage.getAttendance({
    date: date as string,
    personId: personId as string,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  res.json(records);
});

router.post('/attendance', authenticate, async (req: Request, res: Response) => {
  const record = req.body;
  const saved = await storage.saveAttendanceRecord(record);
  await storage.addAuditLog({
    user: req.user?.name || record.recorded_by || 'Terminal',
    userRole: req.user?.role || 'ATTENDANCE_OFFICER',
    action: `${record.event_type} Recorded`,
    category: 'ATTENDANCE',
    details: `${record.person_name} (${record.person_id}) recorded via ${record.attendance_method}.`,
    recordId: record.id,
  });
  res.status(201).json(saved);
});

// 6. Offline Synchronization Batch with Idempotency Protection (Section 11, 38)
router.post('/attendance/sync', authenticate, async (req: Request, res: Response) => {
  const { events } = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Expected "events" array in payload' });
  }

  const result = await storage.processSyncBatch(events);
  res.json({
    status: 'success',
    ...result,
    timestamp: new Date().toISOString(),
  });
});

// 7. Classes, Shifts, Devices, Settings, Leaves & Logs
router.get('/classes', authenticate, async (req: Request, res: Response) => {
  res.json(await storage.getClasses());
});

router.get('/shifts', authenticate, async (req: Request, res: Response) => {
  res.json(await storage.getShifts());
});

router.get('/devices', authenticate, async (req: Request, res: Response) => {
  res.json(await storage.getDevices());
});

router.get('/settings', authenticate, async (req: Request, res: Response) => {
  res.json(await storage.getSettings());
});

router.put('/settings', authenticate, authorize(['SUPER_ADMIN', 'SCHOOL_ADMIN']), async (req: Request, res: Response) => {
  const updated = await storage.updateSettings(req.body);
  res.json(updated);
});

router.get('/leave-requests', authenticate, async (req: Request, res: Response) => {
  res.json(await storage.getLeaveRequests());
});

router.post('/leave-requests', authenticate, async (req: Request, res: Response) => {
  const saved = await storage.saveLeaveRequest(req.body);
  res.status(201).json(saved);
});

router.get('/audit-logs', authenticate, async (req: Request, res: Response) => {
  res.json(await storage.getAuditLogs());
});

// 8. Reports summary (Section 23)
router.get('/reports/attendance', authenticate, async (req: Request, res: Response) => {
  const records = await storage.getAttendance();
  const people = await storage.getPeople();
  const students = await storage.getStudents();
  
  const todayRecords = records.filter(r => r.date === '2026-10-06');
  const present = todayRecords.filter(r => r.status === 'Present').length;
  const late = todayRecords.filter(r => r.status === 'Late').length;
  const absent = todayRecords.filter(r => r.status === 'Absent').length;

  res.json({
    totalWorkforce: people.length,
    totalStudents: students.length,
    todayPresent: present + late,
    todayLate: late,
    todayAbsent: absent,
    attendanceRate: (people.length + students.length) > 0 
      ? Math.round(((present + late) / (people.length + students.length)) * 100) 
      : 95,
  });
});

export const apiRouter = router;
