// frontend/src/pages/Travel/TripsPage.jsx
import React, { useState, useEffect } from 'react';
import { travelAPI, itineraryAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ItineraryTimeline } from '../../components/travel/ItineraryTimeline';
import { ExpenseSubmitModal } from '../../components/expenses/ExpenseSubmitModal';
import {
  Compass,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Receipt,
  Ticket,
  ChevronRight,
  Plane,
} from 'lucide-react';

export const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTrip, setActiveTrip] = useState(null);
  const [itineraryItems, setItineraryItems] = useState([]);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await travelAPI.getAll({ status: '' });
      if (res.data.success) {
        const list = res.data.data;
        setTrips(list);
        if (list.length > 0) {
          selectTrip(list[0]);
        }
      }
    } catch (err) {
      console.warn('Trips fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectTrip = async (trip) => {
    setActiveTrip(trip);
    try {
      const res = await itineraryAPI.getByTrip(trip._id);
      if (res.data.success && res.data.data?.items) {
        setItineraryItems(res.data.data.items);
      } else {
        // Fallback default sample itinerary for demonstration
        setItineraryItems([
          {
            type: 'Flight',
            provider: 'IndiGo Airlines (6E-512)',
            bookingReference: '6E-HYD-BLR-892',
            date: trip.departureDate,
            startTime: '08:30',
            endTime: '09:45',
            location: `${trip.origin} → ${trip.destination}`,
            cost: 4500,
            status: 'Confirmed',
          },
          {
            type: 'Hotel',
            provider: 'Taj West End',
            bookingReference: 'TAJ-BLR-66712',
            date: trip.departureDate,
            startTime: '12:00',
            location: trip.destination,
            cost: 18000,
            status: 'Confirmed',
            notes: '3 Nights Luxury Room with breakfast.',
          }
        ]);
      }
    } catch (err) {
      console.warn('Itinerary fetch fallback:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            My Journeys & Itineraries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active, scheduled, and past corporate trips with full concierge timeline.
          </p>
        </div>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon="plane"
          title="No Trips Scheduled"
          description="Create your first travel request to see itineraries and submit post-trip expenses."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Trips Cards List */}
          <div className="lg:col-span-5 space-y-3">
            {trips.map((trip) => {
              const isSelected = activeTrip?._id === trip._id;
              return (
                <div
                  key={trip._id}
                  onClick={() => selectTrip(trip)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50/60 border-brand-500 ring-2 ring-brand-500/20 shadow-card'
                      : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 font-display">
                          {trip.origin} ⟶ {trip.destination}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {trip.requestId}
                      </span>
                    </div>
                    <Badge status={trip.status} size="sm" />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {new Date(trip.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(trip.returnDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-extrabold text-brand-900">
                      ₹{trip.estimatedTotalCost?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Trip Itinerary Timeline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {activeTrip && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-6">
                {/* Trip Header Banner */}
                <div className="p-4 rounded-2xl bg-gradient-brand text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300">
                      Trip Overview · {activeTrip.travelType}
                    </span>
                    <h3 className="text-lg font-extrabold font-display">
                      {activeTrip.origin} ⟶ {activeTrip.destination}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {activeTrip.durationDays} Days · {activeTrip.purpose}
                    </p>
                  </div>

                  <button
                    onClick={() => setExpenseModalOpen(true)}
                    className="px-4 py-2 bg-white text-brand-900 font-bold text-xs rounded-xl hover:bg-slate-100 shadow-md transition-all inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Receipt className="w-3.5 h-3.5 text-brand-600" />
                    + Submit Expense
                  </button>
                </div>

                {/* Timeline section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display mb-4">
                    Trip Timeline & Reservations
                  </h4>
                  <ItineraryTimeline items={itineraryItems} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Submit Modal */}
      {activeTrip && (
        <ExpenseSubmitModal
          isOpen={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          trip={activeTrip}
          onSuccess={() => {
            alert('Expense claim submitted for finance review!');
          }}
        />
      )}
    </div>
  );
};
