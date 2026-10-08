import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DemoSimulationDrawer } from './components/simulation/DemoSimulationDrawer';
import { LoginView } from './components/auth/LoginView';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { QRAttendanceKiosk } from './components/kiosk/QRAttendanceKiosk';
import { WorkforceDirectory } from './components/workforce/WorkforceDirectory';
import { StudentAttendanceView } from './components/students/StudentAttendanceView';
import { ShiftManagementView } from './components/shifts/ShiftManagementView';
import { TeacherProfileModal } from './components/teachers/TeacherProfileModal';
import { AttendanceRecords } from './components/attendance/AttendanceRecords';
import { LeaveManagement } from './components/leave/LeaveManagement';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { AttendanceReports } from './components/reports/AttendanceReports';
import { DeviceManagement } from './components/devices/DeviceManagement';
import { SyncCenter } from './components/sync/SyncCenter';
import { NotificationsView } from './components/notifications/NotificationsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { SchoolSettingsView } from './components/settings/SchoolSettingsView';
import { QRManagement } from './components/qr/QRManagement';
import { AttendanceRecord } from './types';

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('kiosk');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedPersonModalId, setSelectedPersonModalId] = useState<string | null>(null);
  const [adjustTargetRecord, setAdjustTargetRecord] = useState<AttendanceRecord | null>(null);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Dedicated Kiosk Terminal Mode (Standby QR Scanning page)
  if (activeTab === 'kiosk') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <DemoSimulationDrawer onNavigateToTab={setActiveTab} />
        <QRAttendanceKiosk 
          onExitKiosk={() => setActiveTab('dashboard')} 
          onNavigateToDashboard={() => setActiveTab('dashboard')}
          onOpenCreateStaff={() => setActiveTab('workforce')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 10-Step Interactive Presentation Walkthrough Drawer */}
      <DemoSimulationDrawer onNavigateToTab={setActiveTab} />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={setActiveTab}
          onLogout={() => setIsAuthenticated(false)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Header
            onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onNavigateToTab={setActiveTab}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            {activeTab === 'dashboard' && (
              <AdminDashboard
                onNavigate={setActiveTab}
                onSelectTeacherForModal={(id) => setSelectedPersonModalId(id)}
                onOpenAdjustmentModal={(rec) => {
                  setAdjustTargetRecord(rec);
                  setActiveTab('attendance');
                }}
              />
            )}

            {activeTab === 'workforce' && (
              <WorkforceDirectory
                onSelectPerson={(id) => setSelectedPersonModalId(id)}
                onNavigateToQR={() => setActiveTab('qr-cards')}
              />
            )}

            {activeTab === 'students' && (
              <StudentAttendanceView />
            )}

            {activeTab === 'shifts' && (
              <ShiftManagementView />
            )}

            {activeTab === 'qr-cards' && (
              <QRManagement />
            )}

            {activeTab === 'attendance' && (
              <AttendanceRecords
                onSelectTeacher={(id) => setSelectedPersonModalId(id)}
                initialAdjustRecord={adjustTargetRecord}
                onClearInitialAdjust={() => setAdjustTargetRecord(null)}
              />
            )}

            {activeTab === 'leave' && (
              <LeaveManagement />
            )}

            {activeTab === 'departments' && (
              <DepartmentsView
                onSelectDepartmentFilter={() => setActiveTab('workforce')}
              />
            )}

            {activeTab === 'reports' && (
              <AttendanceReports />
            )}

            {activeTab === 'devices' && (
              <DeviceManagement />
            )}

            {activeTab === 'sync' && (
              <SyncCenter />
            )}

            {activeTab === 'notifications' && (
              <NotificationsView onNavigateToTab={setActiveTab} />
            )}

            {activeTab === 'audit' && (
              <AuditLogView />
            )}

            {activeTab === 'settings' && (
              <SchoolSettingsView />
            )}
          </main>
        </div>
      </div>

      {/* Person Profile Modal */}
      {selectedPersonModalId && (
        <TeacherProfileModal
          teacherId={selectedPersonModalId}
          onClose={() => setSelectedPersonModalId(null)}
          onOpenAdjustment={(rec) => {
            setSelectedPersonModalId(null);
            setAdjustTargetRecord(rec);
            setActiveTab('attendance');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
