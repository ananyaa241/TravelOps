// frontend/src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Building,
  Briefcase,
  Phone,
  MapPin,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const DEPARTMENTS = [
  'Engineering & Technology',
  'Sales & Business Development',
  'Product & Design',
  'Finance & Legal',
];

const ROLES = [
  { value: 'EMPLOYEE', label: 'Employee / Business Traveler' },
  { value: 'MANAGER', label: 'Department Manager / Approver' },
  { value: 'TRAVEL COORDINATOR', label: 'Travel Desk Coordinator' },
  { value: 'FINANCE OFFICER', label: 'Finance & Reimbursement Officer' },
  { value: 'COMPANY ADMIN', label: 'Enterprise Administrator' },
];

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE',
    departmentName: 'Engineering & Technology',
    designation: '',
    employeeId: '',
    phone: '',
    city: 'Bengaluru',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      departmentName: formData.departmentName,
      designation: formData.designation || 'Specialist',
      employeeId: formData.employeeId || undefined,
      phone: formData.phone || '+91 98000 12345',
      city: formData.city || 'Bengaluru',
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start z-10">
        
        {/* Left: Branding & Feature Overview */}
        <div className="lg:col-span-4 space-y-6 text-white p-4 lg:sticky lg:top-10">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="TravelOps Logo"
              className="w-12 h-12 rounded-2xl object-cover shadow-xl shadow-brand-500/30 border border-white/20"
            />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight font-display">
                Travel<span className="text-sky-400">Ops</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Corporate Travel & Expense Cloud</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight leading-tight font-display">
              Join your organization's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-brand-300">
                travel operations hub.
              </span>
            </h2>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              Create your corporate profile to book flights & hotels, manage multi-tier travel approvals, file expense claims, and track real-time reimbursements.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-sky-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Automated policy checks & rate caps</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-sky-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Role-tailored workspace & dashboards</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-sky-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Instant direct-deposit reimbursements</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400">Already registered in your org?</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 mt-1"
            >
              Sign in to existing account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-modal border border-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                Create Corporate Account
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your professional details to set up your TravelOps account.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-100">
              <Sparkles className="w-3 h-3" /> Quick Setup
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rohan Mehra"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Corporate Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rohan@organization.com"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Account Role *
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium appearance-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Department *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium appearance-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Designation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Designation / Job Title
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Employee ID (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="e.g. EMP-2045 (Auto-generated if blank)"
                    className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Base Location / City */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Base City / Office
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Hyderabad, Bengaluru, Mumbai"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-brand-500/30"
              >
                {loading ? 'Creating Account & Setting Up Workspace...' : 'Complete Registration & Go to Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 pt-2">
              By creating an account, you agree to your organization's Travel & Expense compliance policies.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
