// frontend/src/components/common/Badge.jsx
import React from 'react';

const BADGE_STYLES = {
  // Travel & Approval statuses
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',
  'Booked': 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/10',
  'Completed': 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/10',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
  'Pending Manager Approval': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
  'Pending Additional Approval': 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/10',
  'Policy Review': 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/10',
  'Booking In Progress': 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/10',
  'Rejected': 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10',
  'Cancelled': 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-600/10',
  'Draft': 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-600/10',
  'Changes Requested': 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/10',

  // Policy Engine statuses
  'Within Policy': 'bg-teal-50 text-teal-700 border-teal-200',
  'Policy Exception': 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',

  // Reimbursement & Expense statuses
  'Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Finance Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Processing': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',
  'Reimbursed': 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // Roles
  'COMPANY ADMIN': 'bg-purple-50 text-purple-700 border-purple-200',
  'MANAGER': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'EMPLOYEE': 'bg-blue-50 text-blue-700 border-blue-200',
  'TRAVEL COORDINATOR': 'bg-sky-50 text-sky-700 border-sky-200',
  'FINANCE OFFICER': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const DOT_COLORS = {
  'Approved': 'bg-emerald-500',
  'Booked': 'bg-sky-500',
  'Completed': 'bg-indigo-500',
  'Pending': 'bg-amber-500',
  'Pending Manager Approval': 'bg-amber-500',
  'Pending Additional Approval': 'bg-orange-500',
  'Policy Exception': 'bg-amber-600',
  'Within Policy': 'bg-teal-500',
  'Rejected': 'bg-rose-500',
  'Paid': 'bg-emerald-500',
};

export const Badge = ({ status, size = 'md', showDot = true, className = '' }) => {
  const style = BADGE_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const dotColor = DOT_COLORS[status] || 'bg-slate-400';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${sizeClasses} ${style} ${className}`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      )}
      {status}
    </span>
  );
};
