// frontend/src/components/travel/TravelRequestModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { PolicyExceptionBanner } from './PolicyExceptionBanner';
import { travelAPI } from '../../services/api';
import {
  Plane,
  Building,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
} from 'lucide-react';

const CITIES = [
  'Hyderabad',
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Chennai',
  'Pune',
  'Kolkata',
  'Goa',
  'Dubai (UAE)',
  'Singapore',
  'London (UK)',
  'San Francisco (US)',
];

const TRAVEL_TYPES = [
  'Domestic',
  'International',
  'Business Conference',
  'Client Visit',
  'Training',
  'Site Visit',
  'Other',
];

export const TravelRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [policyChecking, setPolicyChecking] = useState(false);
  const [policyResult, setPolicyResult] = useState({
    policyStatus: 'Within Policy',
    violations: [],
  });

  const [formData, setFormData] = useState({
    purpose: '',
    travelType: 'Domestic',
    origin: 'Hyderabad',
    destination: 'Bengaluru',
    departureDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    travelersCount: 1,
    estimatedAccommodationCost: 18000,
    estimatedTransportationCost: 8500,
    estimatedMealsCost: 4500,
    estimatedOtherCost: 1000,
    advanceRequested: 5000,
    businessCode: 'PRJ-CLIENT-2026',
    notes: '',
  });

  // Calculate duration in days
  const start = new Date(formData.departureDate);
  const end = new Date(formData.returnDate);
  const durationDays = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
  const estimatedTotalCost = Number(formData.estimatedAccommodationCost || 0) +
                             Number(formData.estimatedTransportationCost || 0) +
                             Number(formData.estimatedMealsCost || 0) +
                             Number(formData.estimatedOtherCost || 0);

  // Check policy automatically when moving to Step 4 or when costs change
  useEffect(() => {
    if (step >= 3) {
      checkPolicyLive();
    }
  }, [
    formData.travelType,
    formData.estimatedAccommodationCost,
    formData.estimatedTransportationCost,
    formData.estimatedMealsCost,
    formData.advanceRequested,
    formData.departureDate,
    formData.returnDate,
  ]);

  const checkPolicyLive = async () => {
    setPolicyChecking(true);
    try {
      const res = await travelAPI.checkPolicy({
        ...formData,
        durationDays,
        estimatedTotalCost,
      });
      if (res.data.success) {
        setPolicyResult(res.data.data);
      }
    } catch (e) {
      // fallback heuristic if offline
      const hotelPerNight = Number(formData.estimatedAccommodationCost) / durationDays;
      const mealsPerDay = Number(formData.estimatedMealsCost) / durationDays;
      const violations = [];
      if (hotelPerNight > 8000) {
        violations.push({
          rule: 'Hotel Nightly Rate Cap Exceeded',
          category: 'Accommodation',
          requestedAmount: hotelPerNight,
          allowedAmount: 8000,
          difference: hotelPerNight - 8000,
          description: `₹${hotelPerNight.toLocaleString()}/night exceeds standard ₹8,000 policy cap.`,
        });
      }
      if (mealsPerDay > 2000) {
        violations.push({
          rule: 'Daily Meal Cap Exceeded',
          category: 'Meals',
          requestedAmount: mealsPerDay,
          allowedAmount: 2000,
          difference: mealsPerDay - 2000,
          description: `₹${mealsPerDay.toLocaleString()}/day exceeds standard ₹2,000 allowance.`,
        });
      }
      setPolicyResult({
        policyStatus: violations.length > 0 ? 'Policy Exception' : 'Within Policy',
        violations,
      });
    } finally {
      setPolicyChecking(false);
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (isDraft = false) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        durationDays,
        estimatedTotalCost,
        status: isDraft ? 'Draft' : 'Submitted',
      };
      const res = await travelAPI.create(payload);
      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.data);
        onClose();
        setStep(1);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit travel request');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Trip Type', desc: 'Purpose & Classification' },
    { num: 2, label: 'Destinations', desc: 'Origin, City & Dates' },
    { num: 3, label: 'Budget', desc: 'Hotel, Flights & Per-diem' },
    { num: 4, label: 'Policy Check', desc: 'Automated Compliance' },
    { num: 5, label: 'Review', desc: 'Summary & Submit' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Corporate Travel Request"
      subtitle="Complete the guided 5-step form to request travel authorization."
      maxWidth="max-w-3xl"
    >
      {/* Progress Bar */}
      <div className="mb-6 grid grid-cols-5 gap-2">
        {steps.map((s) => {
          const isCurrent = step === s.num;
          const isCompleted = step > s.num;
          return (
            <div
              key={s.num}
              onClick={() => isCompleted && setStep(s.num)}
              className={`flex flex-col border-t-2 pt-2 transition-all ${
                isCompleted
                  ? 'border-brand-600 text-brand-700 cursor-pointer'
                  : isCurrent
                  ? 'border-brand-500 text-slate-900 font-bold'
                  : 'border-slate-200 text-slate-400'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">
                0{s.num} {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {/* STEP 1: Trip Details */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Travel Classification *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TRAVEL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, travelType: type })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      formData.travelType === type
                        ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{type}</span>
                    {formData.travelType === type && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Business Purpose of Travel *
              </label>
              <textarea
                rows={3}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g., Attending AWS Tech Summit 2026 as keynote speaker and conducting on-site client architecture reviews."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Project / Business Code
                </label>
                <input
                  type="text"
                  value={formData.businessCode}
                  onChange={(e) => setFormData({ ...formData, businessCode: e.target.value })}
                  placeholder="e.g., PRJ-AWS-CONF-26"
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Number of Travelers
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.travelersCount}
                  onChange={(e) => setFormData({ ...formData, travelersCount: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Destination & Dates */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Origin City *
                </label>
                <select
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Destination City *
                </label>
                <select
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual Route Preview Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-900 to-navy-850 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-sky-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Travel Route</p>
                  <p className="text-sm font-bold text-white font-display">
                    {formData.origin} <span className="text-sky-400">⟶</span> {formData.destination}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Duration</p>
                <p className="text-sm font-bold text-sky-300 font-display">{durationDays} Days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Departure Date *
                </label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Return Date *
                </label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Estimated Expenses */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Estimated Accommodation (Hotel) ₹
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={formData.estimatedAccommodationCost}
                  onChange={(e) => setFormData({ ...formData, estimatedAccommodationCost: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <span className="text-[10px] text-slate-500">
                  ≈ ₹{Math.round(formData.estimatedAccommodationCost / durationDays).toLocaleString()}/night (Policy Cap: ₹8,000)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Estimated Transportation (Flights / Cabs) ₹
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={formData.estimatedTransportationCost}
                  onChange={(e) => setFormData({ ...formData, estimatedTransportationCost: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Estimated Meals & Daily Per Diem ₹
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={formData.estimatedMealsCost}
                  onChange={(e) => setFormData({ ...formData, estimatedMealsCost: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <span className="text-[10px] text-slate-500">
                  ≈ ₹{Math.round(formData.estimatedMealsCost / durationDays).toLocaleString()}/day (Policy Cap: ₹2,000)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Advance Cash Requested (Optional) ₹
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={formData.advanceRequested}
                  onChange={(e) => setFormData({ ...formData, advanceRequested: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Total Budget Card */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Estimated Trip Budget</p>
                <p className="text-[11px] text-slate-500">{durationDays} days · {formData.travelersCount} traveler(s)</p>
              </div>
              <p className="text-2xl font-extrabold text-brand-900 font-display">
                ₹{estimatedTotalCost.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Live Policy Engine Check */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <PolicyExceptionBanner
              policyStatus={policyResult.policyStatus}
              violations={policyResult.violations}
            />

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider font-display">
                Corporate Compliance Checklist
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Hotel Cap: ₹8,000 / Night</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Meals Per Diem: ₹2,000 / Day</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Flight Class: Domestic Economy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Advance Cash: Up to 80% Allowed</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Additional Notes / Business Justification
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any specific context or flight timing preferences..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Submit */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-gradient-brand text-white shadow-card">
              <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-sky-300">Travel Itinerary Overview</span>
                  <h4 className="text-lg font-extrabold text-white font-display">
                    {formData.origin} ⟶ {formData.destination}
                  </h4>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-white/10 rounded-full border border-white/20">
                  {formData.travelType}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-300 text-[10px]">Dates</p>
                  <p className="font-semibold text-white">{formData.departureDate} to {formData.returnDate}</p>
                </div>
                <div>
                  <p className="text-slate-300 text-[10px]">Duration</p>
                  <p className="font-semibold text-white">{durationDays} Days</p>
                </div>
                <div>
                  <p className="text-slate-300 text-[10px]">Total Budget</p>
                  <p className="font-bold text-sky-300 text-sm">₹{estimatedTotalCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-300 text-[10px]">Advance</p>
                  <p className="font-semibold text-white">₹{Number(formData.advanceRequested || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Purpose: </span>
              <span className="text-slate-600">{formData.purpose || 'Client Visit & Technical Consulting'}</span>
            </div>

            <PolicyExceptionBanner
              policyStatus={policyResult.policyStatus}
              violations={policyResult.violations}
            />
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline"
          >
            Save as Draft
          </button>
        )}

        <div className="flex items-center gap-2">
          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm transition-all"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
            >
              {submitting ? 'Submitting...' : '✓ Submit Travel Request'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
