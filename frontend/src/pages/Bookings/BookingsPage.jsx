// frontend/src/pages/Bookings/BookingsPage.jsx
import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Ticket,
  Plane,
  Building,
  Car,
  Search,
  Filter,
  Plus,
  Calendar,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react';

export const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [search, typeFilter]);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getAll({ search, bookingType: typeFilter });
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.warn('Bookings fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            Travel Bookings & Concierge Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed flight tickets, hotel reservations, train tickets, and car rentals.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['', 'Flight', 'Hotel', 'Train', 'Car Rental'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  typeFilter === type
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type || 'All Bookings'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PNR or vendor..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon="plane"
            title="No Bookings Found"
            description="No travel reservations matching your search query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Vendor / Provider</th>
                  <th className="py-3 px-3">Confirmation Ref</th>
                  <th className="py-3 px-3">Travel Date</th>
                  <th className="py-3 px-3">Cost</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{b.bookingId}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{b.bookingType}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{b.employeeName}</td>
                    <td className="py-3 px-3 text-slate-700">{b.vendorName}</td>
                    <td className="py-3 px-3 font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-800 font-bold">
                      {b.referenceNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {new Date(b.travelDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      ₹{b.cost?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={b.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
