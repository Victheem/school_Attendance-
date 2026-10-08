import React from 'react';
import { 
  Menu, 
  QrCode, 
  Wifi, 
  WifiOff, 
  Bell, 
  RefreshCw, 
  Tablet, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onNavigateToTab }) => {
  const { 
    currentUser, 
    isOnline, 
    toggleNetworkSimulation, 
    lastSyncTime, 
    syncQueue, 
    isSyncing,
    notifications, 
    settings 
  } = useApp();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile hamburger & Tagline */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 tracking-tight">
            SCHOOL ATTENDANCE & WORKFORCE OS
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-semibold text-slate-500 italic">
            "{settings.tagline}"
          </span>
        </div>
      </div>

      {/* Right: Telemetry, Kiosk button, PWA Install & Alerts */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Network indicator */}
        <button
          onClick={toggleNetworkSimulation}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
            isSyncing
              ? 'bg-blue-50 text-blue-800 border-blue-300'
              : isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-emerald-900 text-emerald-100 border-emerald-500'
          }`}
          title="Click to toggle network simulation"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>Syncing...</span>
            </>
          ) : isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-emerald-300" />
              <span>Offline — Attendance will sync automatically</span>
            </>
          )}
        </button>

        {/* Sync queue alert if any */}
        {syncQueue.length > 0 && (
          <button
            onClick={() => onNavigateToTab('sync')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold hover:bg-amber-100 transition"
            title={`${syncQueue.length} records pending synchronization`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Pending sync: {syncQueue.length}</span>
          </button>
        )}

        {/* Quick Kiosk Launch */}
        <button
          onClick={() => onNavigateToTab('kiosk')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
        >
          <QrCode className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Kiosk Terminal</span>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Notification Bell */}
        <button
          onClick={() => onNavigateToTab('notifications')}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          title="Notifications & Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
};
