// frontend/src/components/common/StatCard.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-brand-50 text-brand-600 border-brand-100',
  trend,
  trendPositive = true,
  isCurrency = false,
  onClick,
}) => {
  const formattedValue = isCurrency && typeof value === 'number'
    ? `₹${value.toLocaleString('en-IN')}`
    : value;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-brand-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-display">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
          {formattedValue ?? 0}
        </h3>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              trendPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trendPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
