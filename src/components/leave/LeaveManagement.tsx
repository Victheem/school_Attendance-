import React, { useState } from 'react';
import { 
  CalendarCheck, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  Filter, 
  Search, 
  FileText, 
  User,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest, LeaveType } from '../../types';

export const LeaveManagement: React.FC = () => {
  const { leaveRequests, handleLeaveAction, submitLeaveRequest, teachers, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [reviewModalTarget, setReviewModalTarget] = useState<LeaveRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  // New leave form
  const [newLeave, setNewLeave] = useState({
    teacherId: 'TCH-00023',
    leaveType: 'Annual Leave' as LeaveType,
    startDate: '2026-10-15',
    endDate: '2026-10-17',
    reason: '',
  });

  const filteredLeaves = leaveRequests.filter((l) => {
    const personName = l.personName || l.teacherName || '';
    const personId = l.personId || l.teacherId || '';
    const matchesSearch = `${personName} ${personId} ${l.leaveType} ${l.reason}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = teachers.find(item => item.id === newLeave.teacherId);
    if (!t) return;

    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    await submitLeaveRequest({
      personId: t.id,
      personName: `${t.title} ${t.firstName} ${t.lastName}`,
      category: t.category,
      departmentOrClass: t.departmentOrClass,
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      daysCount: diffDays,
      reason: newLeave.reason || 'Personal leave request.',
    });

    setIsSubmitModalOpen(false);
    setNewLeave({
      teacherId: 'TCH-00023',
      leaveType: 'Annual Leave',
      startDate: '2026-10-15',
      endDate: '2026-10-17',
      reason: '',
    });
  };

  const handleConfirmReview = async (decision: 'Approved' | 'Rejected') => {
    if (!reviewModalTarget) return;
    await handleLeaveAction(reviewModalTarget.id, decision, reviewRemarks);
    setReviewModalTarget(null);
    setReviewRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Leave Management & Approvals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer staff absence permissions, medical exemptions and academic assignments
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply Staff Leave</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by teacher name, type, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filteredLeaves.length}</strong> leave applications
        </div>
      </div>

      {/* Leave List Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-5">Teacher</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Teacher / Staff */}
                  <td className="py-3 px-5">
                    <div>
                      <div className="font-bold text-slate-900">{l.personName || l.teacherName}</div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {l.personId || l.teacherId} • {l.departmentOrClass || l.department}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {l.leaveType}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {l.startDate} → {l.endDate}
                  </td>

                  {/* Days */}
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {l.daysCount} day{l.daysCount > 1 ? 's' : ''}
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={l.reason}>
                    {l.reason}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : l.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-5 text-right">
                    {l.status === 'Pending' ? (
                      <button
                        onClick={() => {
                          setReviewModalTarget(l);
                          setReviewRemarks('');
                        }}
                        className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition shadow-xs"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Reviewed by {l.reviewedBy?.split(' ')[0] || 'Admin'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Review Leave Application</h3>
              <button
                onClick={() => setReviewModalTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{reviewModalTarget.personName || reviewModalTarget.teacherName}</div>
              <div className="text-slate-500">
                {reviewModalTarget.leaveType} • {reviewModalTarget.startDate} to {reviewModalTarget.endDate} ({reviewModalTarget.daysCount} days)
              </div>
              <div className="text-slate-700 italic pt-1">"{reviewModalTarget.reason}"</div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500">
                Administrator Remarks
              </label>
              <textarea
                rows={2}
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Optional remarks (e.g. Approved with substitute teacher assigned)..."
                className="w-full p-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleConfirmReview('Rejected')}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleConfirmReview('Approved')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
              >
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Submit Staff Leave Request</h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Teacher</label>
                <select
                  value={newLeave.teacherId}
                  onChange={(e) => setNewLeave({ ...newLeave, teacherId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} {t.firstName} {t.lastName} ({t.id} - {t.departmentOrClass || t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Leave Category</label>
                <select
                  value={newLeave.leaveType}
                  onChange={(e: any) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Official Assignment">Official Assignment</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Official Justification</label>
                <textarea
                  rows={2}
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="State reason for leave..."
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
