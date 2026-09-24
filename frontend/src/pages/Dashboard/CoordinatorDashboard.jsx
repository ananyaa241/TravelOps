// frontend/src/pages/Dashboard/CoordinatorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, bookingAPI } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Ticket,
  Plane,
  Building,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [bookingType, setBookingType] = useState('Flight');
  const [vendorName, setVendorName] = useState('IndiGo Airlines');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [bookingCost, setBookingCost] = useState(9000);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getCoordinator();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Coordinator dashboard fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setBookingSubmitting(true);
    try {
      const payload = {
        travelRequestId: selectedTask._id,
        vendorName,
        bookingType,
        referenceNumber: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        cost: bookingCost,
        travelDate: selectedTask.departureDate,
        returnDate: selectedTask.returnDate,
      };

      const res = await bookingAPI.create(payload);
      if (res.data.success) {
        setSelectedTask(null);
        setReferenceNumber('');
        fetchDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const stats = data?.stats || {
    pendingBookingTasks: 1,
    upcomingBookingsCount: 2,
    activeTripsCount: 1,
    totalBookingsCount: 4,
  };

  const pendingBookings = data?.pendingBookings || [];
  const upcomingBookings = data?.upcomingBookings || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full text-xs text-brand-700 font-semibold border border-brand-200">
            <Ticket className="w-3.5 h-3.5 text-brand-600" />
            Travel Desk & Booking Concierge
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-slate-800">
            Welcome, <span className="text-brand-900 font-black">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-600">
            {stats.pendingBookingTasks > 0
              ? `There are ${stats.pendingBookingTasks} approved travel requests waiting for concierge ticketing.`
              : 'All approved travel requests have been ticketed and confirmed.'}
          </p>
        </div>

        <Link
          to="/bookings"
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs hover:bg-brand-700 shadow-md transition-all inline-flex items-center gap-2"
        >
          View Bookings Desk
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Booking Tasks"
          value={stats.pendingBookingTasks}
          subtitle="Approved requests awaiting tickets"
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600 border-amber-200"
        />
        <StatCard
          title="Upcoming Bookings"
          value={stats.upcomingBookingsCount}
          subtitle="Departures in next 14 days"
          icon={Calendar}
          iconBg="bg-sky-50 text-sky-600 border-sky-200"
        />
        <StatCard
          title="Active On-Trip Travelers"
          value={stats.activeTripsCount}
          subtitle="Currently traveling employees"
          icon={Plane}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-200"
        />
        <StatCard
          title="Total Ticketed Bookings"
          value={stats.totalBookingsCount}
          subtitle="Confirmed flight/hotel vouchers"
          icon={Ticket}
          iconBg="bg-purple-50 text-purple-600 border-purple-200"
        />
      </div>

      {/* Main Grid: Pending Tasks vs Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Booking Tasks */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  Approved Requests Ready for Booking
                </h3>
                <p className="text-xs text-slate-500">Issue flight tickets, hotel reservations, and update itinerary</p>
              </div>
              <Badge status="Approved" size="sm" />
            </div>

            {pendingBookings.length === 0 ? (
              <EmptyState
                icon="plane"
                title="No Pending Booking Tasks"
                description="All approved trips are currently booked and scheduled."
              />
            ) : (
              <div className="space-y-3">
                {pendingBookings.map((trip) => (
                  <div
                    key={trip._id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-brand-300 transition-all bg-slate-50/50 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 font-display">
                          {trip.employeeName}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {trip.requestId}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {trip.origin} ⟶ {trip.destination}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Depart: {new Date(trip.departureDate).toLocaleDateString('en-IN')} · Est. Budget: ₹{trip.estimatedTotalCost?.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTask(trip);
                        setBookingCost(trip.estimatedTransportationCost || 9000);
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all whitespace-nowrap"
                    >
                      + Book Tickets
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Confirmed Bookings list */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  Recent Issued Bookings
                </h3>
                <p className="text-xs text-slate-500">Confirmed tickets & vendor vouchers</p>
              </div>
              <Link to="/bookings" className="text-xs font-bold text-brand-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <EmptyState
                  icon="sparkles"
                  title="No Bookings Yet"
                  description="Confirmed bookings will appear here."
                />
              ) : (
                recentBookings.slice(0, 5).map((b) => (
                  <div key={b._id} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 font-display">{b.vendorName}</span>
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">
                        {b.referenceNumber}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{b.employeeName} ({b.destination})</span>
                      <span className="font-bold text-brand-900">₹{b.cost?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book Ticket Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Generate Booking Voucher · ${selectedTask.requestId}`}
          subtitle={`Assign vendor and enter confirmation reference for ${selectedTask.employeeName}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Booking Type
              </label>
              <select
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
              >
                <option value="Flight">Flight (Airlines)</option>
                <option value="Hotel">Hotel Reservation</option>
                <option value="Train">Train (IRCTC)</option>
                <option value="Car Rental">Cab / Car Rental</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. IndiGo Airlines, Taj West End, Savaari"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  PNR / Confirmation Ref
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. 6E-HYD-9921"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Cost (INR)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={bookingCost}
                  onChange={(e) => setBookingCost(Number(e.target.value))}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingSubmitting}
                className="px-6 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all"
              >
                {bookingSubmitting ? 'Issuing...' : '✓ Issue & Notify Employee'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
