// frontend/src/pages/Dashboard/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ItineraryTimeline } from '../../components/travel/ItineraryTimeline';
import { ExpenseSubmitModal } from '../../components/expenses/ExpenseSubmitModal';
import { ReimbursementTimeline } from '../../components/expenses/ReimbursementTimeline';
import {
  Plane,
  Clock,
  Receipt,
  CreditCard,
  Plus,
  ArrowRight,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployeeDashboard = ({ onOpenTravelModal }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTripForExpense, setSelectedTripForExpense] = useState(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getEmployee();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    upcomingTripsCount: 1,
    pendingRequestsCount: 1,
    pendingExpensesCount: 0,
    totalTravelSpend: 32000,
  };

  const upcomingTrips = data?.upcomingTrips || [];
  const recentRequests = data?.recentRequests || [];
  const reimbursements = data?.reimbursements || [];

  return (
    <div className="space-y-6">
      {/* Dashboard Hero Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full border border-brand-200 text-xs text-brand-700 font-semibold">
            <img src="/logo.png" alt="TravelOps" className="w-4 h-4 rounded-md object-cover" />
            Corporate Travel Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-slate-800">
            Good morning, <span className="text-brand-900 font-black">{user?.name?.split(' ')[0] || 'Arjun'}</span> 👋
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {upcomingTrips.length > 0
              ? `Your next journey to ${upcomingTrips[0]?.destination} is scheduled soon.`
              : 'All your corporate travel authorizations, itineraries, and expense claims in one place.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={onOpenTravelModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs hover:bg-brand-700 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            New Travel Request
          </button>
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs border border-slate-200 transition-all"
          >
            View My Trips
            <ArrowRight className="w-4 h-4 text-slate-600" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Trips"
          value={stats.upcomingTripsCount}
          subtitle="Confirmed itinerary & bookings"
          icon={Plane}
          iconBg="bg-sky-50 text-sky-600 border-sky-200"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingRequestsCount}
          subtitle="Waiting for manager / finance"
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600 border-amber-200"
        />
        <StatCard
          title="Pending Claims"
          value={stats.pendingExpensesCount}
          subtitle="Expense claims under audit"
          icon={Receipt}
          iconBg="bg-purple-50 text-purple-600 border-purple-200"
        />
        <StatCard
          title="Total Travel Spend"
          value={stats.totalTravelSpend}
          isCurrency={true}
          subtitle="FY 2026 reimbursed & authorized"
          icon={CreditCard}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-200"
        />
      </div>

      {/* Main Grid: Upcoming Trips & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upcoming Trip Highlight */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  Upcoming Trip Itinerary
                </h3>
                <p className="text-xs text-slate-500">Scheduled departures and concierge arrangements</p>
              </div>
              <Link to="/trips" className="text-xs font-bold text-brand-600 hover:underline">
                All Trips →
              </Link>
            </div>

            {upcomingTrips.length === 0 ? (
              <EmptyState
                icon="plane"
                title="No Upcoming Trips"
                description="You don't have any confirmed travel departures scheduled right now."
                actionLabel="+ Plan a Trip"
                onAction={onOpenTravelModal}
              />
            ) : (
              <div className="space-y-4">
                {upcomingTrips.slice(0, 1).map((trip) => (
                  <div key={trip._id} className="space-y-4">
                    {/* Trip summary badge card */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                          <Plane className="w-5 h-5 -rotate-45" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 font-display">
                              {trip.origin} ⟶ {trip.destination}
                            </h4>
                            <span className="text-xs font-mono font-bold text-slate-500">
                              {trip.requestId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(trip.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(trip.returnDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} · {trip.durationDays} Days
                          </p>
                        </div>
                      </div>
                      <Badge status={trip.status} />
                    </div>

                    {/* Timeline items for this trip */}
                    <ItineraryTimeline items={[
                      {
                        type: 'Flight',
                        provider: 'IndiGo (6E-512)',
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
                        notes: '3 Nights reserved under corporate tariff.',
                      }
                    ]} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Travel Requests & Reimbursements */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Requests */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  Recent Requests
                </h3>
                <p className="text-xs text-slate-500">Approval status and policy checks</p>
              </div>
              <Link to="/travel-requests" className="text-xs font-bold text-brand-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {recentRequests.length === 0 ? (
                <EmptyState
                  icon="approval"
                  title="No Requests Submitted"
                  description="Submit your first corporate travel request."
                />
              ) : (
                recentRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 transition-all bg-white hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {req.destination}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">
                            {req.requestId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {req.purpose}
                        </p>
                      </div>
                      <Badge status={req.status} size="sm" />
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-slate-800">
                        ₹{req.estimatedTotalCost?.toLocaleString('en-IN')}
                      </span>
                      <Badge status={req.policyStatus} size="sm" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reimbursement tracker widget */}
          {reimbursements.length > 0 && (
            <ReimbursementTimeline reimbursement={reimbursements[0]} />
          )}
        </div>
      </div>

      {/* Post-trip Expense Modal */}
      {selectedTripForExpense && (
        <ExpenseSubmitModal
          isOpen={expenseModalOpen}
          onClose={() => {
            setExpenseModalOpen(false);
            setSelectedTripForExpense(null);
          }}
          trip={selectedTripForExpense}
          onSuccess={() => {
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
};
