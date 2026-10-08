-- ============================================================================
-- SCHOOL ATTENDANCE & WORKFORCE OS: PostgreSQL Production Schema
-- Designed for standalone deployment, school-owned computer servers & cloud VPS
-- Completely subscription-independent (Zero Supabase or SaaS locks)
-- ============================================================================

-- Extensions (UUID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Schools & Tenancy (Portable)
CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL,
    tagline VARCHAR(255),
    address TEXT,
    phone VARCHAR(64),
    email VARCHAR(255),
    principal_name VARCHAR(255),
    academic_term VARCHAR(64) DEFAULT 'First Term 2026/2027',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Roles & System Accounts
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL CHECK (role IN (
        'SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_ADMIN', 'ATTENDANCE_OFFICER', 
        'TEACHER', 'STAFF', 'STUDENT'
    )),
    phone VARCHAR(64),
    status VARCHAR(32) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Shifts & Working Hours
CREATE TABLE IF NOT EXISTS shifts (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_mins INTEGER DEFAULT 15,
    late_threshold_mins INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Workforce People (Teachers, Cleaners, Drivers, Security, Admin, etc.)
CREATE TABLE IF NOT EXISTS people (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    uuid VARCHAR(128) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    title VARCHAR(32),
    gender VARCHAR(16),
    email VARCHAR(255),
    phone VARCHAR(64),
    category VARCHAR(64) NOT NULL,
    department_or_class VARCHAR(128) NOT NULL,
    position VARCHAR(128) NOT NULL,
    employment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(32) DEFAULT 'Active',
    attendance_method VARCHAR(32) DEFAULT 'QR',
    pin_code VARCHAR(16),
    shift_id VARCHAR(64) REFERENCES shifts(id) ON DELETE SET NULL,
    avatar TEXT,
    qr_token TEXT NOT NULL,
    qr_generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    vehicle_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. School Classes & Sections
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    level VARCHAR(64) NOT NULL,
    section VARCHAR(32) NOT NULL,
    room VARCHAR(64),
    class_teacher_id VARCHAR(64) REFERENCES people(id) ON DELETE SET NULL,
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Students
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    admission_number VARCHAR(128) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    gender VARCHAR(16),
    class_id VARCHAR(64) REFERENCES classes(id) ON DELETE SET NULL,
    class_name VARCHAR(128) NOT NULL,
    section VARCHAR(32),
    house VARCHAR(64),
    parent_guardian_name VARCHAR(255),
    parent_phone VARCHAR(64),
    parent_email VARCHAR(255),
    status VARCHAR(32) DEFAULT 'Active',
    attendance_method VARCHAR(32) DEFAULT 'QR',
    qr_token TEXT NOT NULL,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Attendance Terminal Devices
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    device_type VARCHAR(64) DEFAULT 'Tablet Kiosk',
    status VARCHAR(32) DEFAULT 'Online',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(64),
    sync_status VARCHAR(32) DEFAULT 'Idle',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. UNIFIED ATTENDANCE LEDGER TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(128) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    person_id VARCHAR(64) NOT NULL,
    person_name VARCHAR(255) NOT NULL,
    person_type VARCHAR(64) NOT NULL,
    department_or_class VARCHAR(128) NOT NULL,
    attendance_method VARCHAR(64) NOT NULL CHECK (attendance_method IN (
        'QR', 'PIN', 'QUICK_ATTENDANCE', 'CLASS_REGISTER'
    )),
    event_type VARCHAR(32) NOT NULL CHECK (event_type IN (
        'CLOCK_IN', 'CLOCK_OUT', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'
    )),
    attendance_date DATE NOT NULL,
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_in_time TIME,
    clock_out_time TIME,
    shift_id VARCHAR(64) REFERENCES shifts(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL,
    hours_worked_mins INTEGER,
    device_id VARCHAR(64) REFERENCES devices(id) ON DELETE SET NULL,
    recorded_by VARCHAR(255) NOT NULL,
    offline_created BOOLEAN DEFAULT FALSE,
    sync_status VARCHAR(32) DEFAULT 'SYNCED',
    local_id VARCHAR(128),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_manual_correction BOOLEAN DEFAULT FALSE,
    correction_reason TEXT,
    corrected_by VARCHAR(255),
    corrected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Idempotency constraint prevents duplicate sync
    CONSTRAINT uq_offline_idempotency UNIQUE (device_id, local_id)
);

-- 9. Offline Sync Queue Ledger (Server-side tracking)
CREATE TABLE IF NOT EXISTS sync_queue (
    id VARCHAR(128) PRIMARY KEY,
    attendance_id VARCHAR(128),
    person_id VARCHAR(64) NOT NULL,
    person_name VARCHAR(255),
    person_type VARCHAR(64),
    attendance_method VARCHAR(64),
    event_type VARCHAR(32),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    device_id VARCHAR(64),
    recorded_by VARCHAR(255),
    sync_status VARCHAR(32) DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Comprehensive Security Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(128) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    log_date VARCHAR(32) NOT NULL,
    log_time VARCHAR(32) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    device_id VARCHAR(64),
    record_id VARCHAR(128),
    ip_address VARCHAR(64),
    mode VARCHAR(32) DEFAULT 'ONLINE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    person_id VARCHAR(64) NOT NULL,
    person_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    leave_type VARCHAR(64) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'Pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_remarks TEXT
);

-- 12. Settings
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    config JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance (Scales to 10,000+ daily attendees)
CREATE INDEX IF NOT EXISTS idx_att_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_att_person ON attendance(person_id);
CREATE INDEX IF NOT EXISTS idx_att_type ON attendance(person_type);
CREATE INDEX IF NOT EXISTS idx_att_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_att_sync ON attendance(sync_status);
CREATE INDEX IF NOT EXISTS idx_people_cat ON people(category);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at DESC);
