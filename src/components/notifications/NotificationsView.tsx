import React, { useState } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Smartphone, 
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsView: React.FC<{ onNavigateToTab?: (tab: string) => void }> = ({ onNavigateToTab }) => {
  const { notifications, dismissNotification, teachers, settings } = useApp();

  // Simulated notification dispatch triggers
  const [testChannel, setTestChannel] = useState<'SMS' | 'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [recipientGroup, setRecipientGroup] = useState<'LATE_TEACHERS' | 'ABSENT_TEACHERS' | 'PRINCIPAL'>('LATE_TEACHERS');
  const [customMsg, setCustomMsg] = useState('Royal Crest Alert: Good morning. This is an automated reminder that your clock-in has not been recorded for 06/10/2026.');
  const [isSent, setIsSent] = useState(false);

  const handleSendSimulated = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Attendance Alerts & Dispatch Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts, absent staff escalations and multi-channel SMS/WhatsApp communication
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Active Channels:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            WhatsApp Gateway
          </span>
          <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200">
            School SMS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: In-App System Alerts Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-600" />
                Live Automated Alerts ({notifications.length})
              </span>
              <span className="text-xs text-slate-400 font-normal">Real-time school monitor</span>
            </h2>

            <div className="mt-4 space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition ${
                    n.type === 'ALERT'
                      ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                      : n.type === 'WARNING'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : 'bg-sky-50/60 border-sky-200 text-sky-950'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        n.type === 'ALERT'
                          ? 'bg-rose-500 text-white'
                          : n.type === 'WARNING'
                          ? 'bg-amber-500 text-white'
                          : 'bg-sky-500 text-white'
                      }`}
                    >
                      {n.type === 'ALERT' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{n.title}</h4>
                      <p className="text-xs mt-0.5 text-slate-700">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.timeAgo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {n.linkTab && onNavigateToTab && (
                      <button
                        onClick={() => onNavigateToTab(n.linkTab!)}
                        className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-0.5"
                      >
                        <span>Resolve</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 p-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Multi-Channel Dispatch Simulation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-600" />
            Dispatch Staff Notification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test sending automated WhatsApp or SMS notices to staff smartphones
          </p>

          <form onSubmit={handleSendSimulated} className="mt-4 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Channel</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTestChannel('WHATSAPP')}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    testChannel === 'WHATSAPP'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setTestChannel('SMS')}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    testChannel === 'SMS'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  SMS
                </button>
                <button
                  type="button"
                  onClick={() => setTestChannel('EMAIL')}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    testChannel === 'EMAIL'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Target Group</label>
              <select
                value={recipientGroup}
                onChange={(e: any) => setRecipientGroup(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl text-xs"
              >
                <option value="LATE_TEACHERS">All Late Teachers Today (7)</option>
                <option value="ABSENT_TEACHERS">Unclocked / Absent Staff (3)</option>
                <option value="PRINCIPAL">School Principal (Executive Summary)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Message Template</label>
              <textarea
                rows={4}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>

            {isSent && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Simulated {testChannel} message dispatched to {recipientGroup}!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Send Simulated Broadcast</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
