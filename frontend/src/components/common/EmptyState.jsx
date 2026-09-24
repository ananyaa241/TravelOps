// frontend/src/components/common/EmptyState.jsx
import React from 'react';
import { Plane, FileCheck, Receipt, Clock, Sparkles } from 'lucide-react';

const ICON_MAP = {
  plane: Plane,
  approval: FileCheck,
  expense: Receipt,
  clock: Clock,
  sparkles: Sparkles,
};

export const EmptyState = ({
  icon = 'plane',
  title = 'No items found',
  description = 'There are no active records in this view right now.',
  actionLabel,
  onAction,
}) => {
  const IconComponent = ICON_MAP[icon] || Plane;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 shadow-sm">
        <IconComponent className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800 font-display">
        {title}
      </h4>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
