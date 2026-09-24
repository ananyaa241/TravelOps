// frontend/src/components/travel/PolicyExceptionBanner.jsx
import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const PolicyExceptionBanner = ({ violations = [], policyStatus = 'Within Policy' }) => {
  if (policyStatus === 'Within Policy' || violations.length === 0) {
    return (
      <div className="rounded-xl bg-teal-50/80 border border-teal-200 p-4 flex items-start gap-3 text-teal-800">
        <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-teal-900 font-display">
            ✓ Within Corporate Travel Policy
          </h5>
          <p className="text-xs text-teal-700 mt-0.5">
            All estimated rates (hotel per night, meals per diem, transport & advance limits) strictly comply with corporate guidelines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-amber-50/90 border border-amber-300 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-display">
            ⚠ Policy Exception Detected ({violations.length} {violations.length === 1 ? 'rule' : 'rules'})
          </h5>
          <p className="text-xs text-amber-800 mt-0.5">
            This request exceeds standard limits. It will automatically route to Finance / Admin for secondary exception approval.
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-amber-200">
        {violations.map((v, i) => (
          <div key={i} className="bg-white/80 rounded-lg p-2.5 border border-amber-200 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span className="text-amber-900 font-bold">{v.rule}</span>
              <span className="text-rose-600 font-bold">Excess: +₹{v.difference?.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1.5 text-[11px] text-slate-600">
              <div>Requested: <span className="font-semibold text-slate-800">₹{v.requestedAmount?.toLocaleString()}</span></div>
              <div>Policy Cap: <span className="font-semibold text-slate-800">₹{v.allowedAmount?.toLocaleString()}</span></div>
            </div>
            {v.description && (
              <p className="text-[11px] text-slate-500 mt-1 italic">{v.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
