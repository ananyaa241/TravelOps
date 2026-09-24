// frontend/src/components/expenses/ReimbursementTimeline.jsx
import React from 'react';
import { CheckCircle2, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ReimbursementTimeline = ({ reimbursement }) => {
  if (!reimbursement) return null;

  const steps = [
    { title: 'Expenses Validated', done: true, desc: 'Receipts verified' },
    { title: 'Finance Approved', done: reimbursement.status !== 'Rejected', desc: 'Approved for payout' },
    { title: 'Processing', done: ['Processing', 'Paid'].includes(reimbursement.status), desc: 'Banking gateway' },
    { title: 'Disbursed / Paid', done: reimbursement.status === 'Paid', desc: reimbursement.paymentReference ? `Ref: ${reimbursement.paymentReference}` : 'Pending release' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">
            Disbursement Lifecycle · {reimbursement.reimbursementId}
          </span>
          <h4 className="text-base font-extrabold text-slate-900 font-display">
            Reimbursement Status
          </h4>
        </div>
        <div className="text-right">
          <span className="text-lg font-extrabold text-brand-900 font-display block">
            ₹{reimbursement.netPayableAmount?.toLocaleString('en-IN')}
          </span>
          <Badge status={reimbursement.status} size="sm" />
        </div>
      </div>

      {/* Progress Timeline Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border transition-all ${
              step.done
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className="text-xs font-bold font-display">{step.title}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">{step.desc}</p>
          </div>
        ))}
      </div>

      {reimbursement.paymentReference && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>
            Payment Method: <span className="font-semibold text-slate-900">{reimbursement.paymentMethod}</span>
          </span>
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">
            Txn: {reimbursement.paymentReference}
          </span>
        </div>
      )}
    </div>
  );
};
