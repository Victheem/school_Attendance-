import React from 'react';
import { 
  LayoutDashboard, 
  QrCode, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  Clock, 
  Calendar, 
  Building, 
  FileText, 
  Tablet, 
  RefreshCw, 
  Bell, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Sliders,
  Bus,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, switchUser, settings, isOnline, syncQueue, notifications } = useApp();

  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kiosk', label: 'Attendance Kiosk', icon: QrCode, badge: 'Terminal' },
    { id: 'workforce', label: 'Staff & Workforce', icon: Users, badge: '75' },
    { id: 'students', label: 'Student Attendance', icon: GraduationCap, badge: '175' },
    { id: 'attendance', label: 'Unified Ledger', icon: CalendarCheck },
    { id: 'shifts', label: 'Shifts & Timetables', icon: Sliders },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'reports', label: 'Attendance Reports', icon: FileText },
    { id: 'devices', label: 'Terminal Devices', icon: Tablet },
    { 
      id: 'sync', 
      label: 'Synchronisation', 
      icon: RefreshCw, 
      count: syncQueue.length > 0 ? syncQueue.length : undefined 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      count: unreadNotifs > 0 ? unreadNotifs : undefined 
    },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'settings', label: 'School Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && (
        <div onClick={onCloseMobile} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & Branding */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-700 flex items-center justify-center font-bold text-white shadow-md border border-sky-400/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 className="font-black text-xs tracking-tight text-white uppercase leading-tight">
                {settings.schoolName}
              </h2>
              <div className="text-[10px] text-sky-400 font-semibold tracking-wide">
                Workforce & Student OS
              </div>
            </div>
          </div>
        </div>

        {/* Middle Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 mb-1">
            School Attendance
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Role Switcher & User Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2.5">
          <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Role Switcher
            </span>
            <select
              value={currentUser.role}
              onChange={(e) => switchUser(e.target.value as UserRole)}
              className="w-full bg-slate-800 text-xs text-white rounded-xl p-1.5 border border-slate-700 font-medium focus:outline-none"
            >
              <option value="SCHOOL_ADMIN">School Admin (Principal)</option>
              <option value="ATTENDANCE_OFFICER">Attendance Officer (Gate / Terminal)</option>
              <option value="HR_ADMIN">HR / Staff Admin</option>
              <option value="TEACHER">Teacher / Form Master</option>
              <option value="SUPER_ADMIN">Super Admin (ICT)</option>
            </select>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
              <div className="truncate text-left">
                <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{currentUser.role}</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
