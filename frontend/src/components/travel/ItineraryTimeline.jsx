// frontend/src/components/travel/ItineraryTimeline.jsx
import React from 'react';
import {
  Plane,
  Building,
  Car,
  Train,
  Briefcase,
  Utensils,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';

const TYPE_ICONS = {
  Flight: Plane,
  Hotel: Building,
  Taxi: Car,
  'Car Rental': Car,
  Train: Train,
  Meeting: Briefcase,
  Meal: Utensils,
  Other: Ticket,
};

const TYPE_COLORS = {
  Flight: 'bg-sky-50 text-sky-600 border-sky-200',
  Hotel: 'bg-amber-50 text-amber-600 border-amber-200',
  Taxi: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'Car Rental': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Train: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Meeting: 'bg-purple-50 text-purple-600 border-purple-200',
  Meal: 'bg-rose-50 text-rose-600 border-rose-200',
  Other: 'bg-slate-50 text-slate-600 border-slate-200',
};

export const ItineraryTimeline = ({ items = [], onAddItem }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-50/70 border border-slate-200/80">
        <Plane className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700 font-display">No Itinerary Generated Yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Travel coordinator will add flight tickets, hotel reservations, and transit schedules once booked.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {items.map((item, idx) => {
        const Icon = TYPE_ICONS[item.type] || Ticket;
        const colorClass = TYPE_COLORS[item.type] || 'bg-slate-50 text-slate-600 border-slate-200';
        const formattedDate = item.date ? new Date(item.date).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          weekday: 'short',
        }) : '';

        return (
          <div key={item._id || idx} className="relative group">
            {/* Timeline node icon */}
            <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${colorClass}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
            </div>

            {/* Event Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-display">
                        {item.provider || item.type}
                      </span>
                      {item.bookingReference && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                          Ref: {item.bookingReference}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formattedDate} · {item.startTime} {item.endTime ? `– ${item.endTime}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {item.cost > 0 && (
                    <span className="text-xs font-bold text-slate-900 font-display block">
                      ₹{item.cost.toLocaleString('en-IN')}
                    </span>
                  )}
                  <Badge status={item.status || 'Confirmed'} size="sm" />
                </div>
              </div>

              {item.location && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>{item.location}</span>
                </div>
              )}

              {item.notes && (
                <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                  {item.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
