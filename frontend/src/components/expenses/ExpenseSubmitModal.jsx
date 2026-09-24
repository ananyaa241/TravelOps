// frontend/src/components/expenses/ExpenseSubmitModal.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { expenseAPI } from '../../services/api';
import {
  Receipt,
  Upload,
  Calendar,
  IndianRupee,
  FileCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  'Flight',
  'Hotel',
  'Food',
  'Taxi',
  'Train',
  'Fuel',
  'Parking',
  'Miscellaneous',
];

export const ExpenseSubmitModal = ({ isOpen, onClose, trip, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Hotel',
    date: new Date().toISOString().split('T')[0],
    amount: 3500,
    merchant: '',
    description: '',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
    receiptName: 'Hotel_Tax_Invoice.pdf',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trip || !trip._id) {
      alert('Please select an associated travel request.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        travelRequestId: trip._id,
      };
      const res = await expenseAPI.create(payload);
      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit expense claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Travel Expense Claim"
      subtitle={`Claim reimbursement for trip: ${trip?.requestId || 'Travel Request'} (${trip?.destination || 'Destination'})`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Expense Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  formData.category === cat
                    ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Claim Amount (INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                required
                min={1}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Expense Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            />
          </div>
        </div>

        {/* Merchant Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Vendor / Merchant Name
          </label>
          <input
            type="text"
            placeholder="e.g. Taj West End, Uber India, Air India"
            value={formData.merchant}
            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
            className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Description & Business Purpose *
          </label>
          <textarea
            rows={2}
            required
            placeholder="e.g. Client dinner with VP of Engineering and project leads."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Receipt Attachment Preview */}
        <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-100 text-brand-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{formData.receiptName}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">✓ Digital Receipt Attached (Simulated Cloud Ready)</p>
            </div>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
          >
            Change File
          </button>
        </div>

        {/* Submit Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-md hover:shadow transition-all"
          >
            {submitting ? 'Submitting Claim...' : 'Submit Claim for Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
