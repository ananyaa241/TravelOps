// frontend/src/pages/Dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Building2,
  Plane,
  CreditCard,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Sliders,
  History,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#0e86d4', '#0284c7', '#38bdf8', '#f59e0b', '#10b981', '#8b5cf6'];

export const AdminDashboard = ({ onOpenTravelModal }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getAdmin();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Admin dashboard fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    totalEmployees: 48,
    departmentsCount: 4,
    activeTripsCount: 3,
    pendingApprovalsCount: 2,
    totalTravelSpend: 1180000,
    policyExceptionsCount: 1,
  };

  const charts = data?.charts || {
    destinations: [
      { destination: 'Bengaluru', count: 14 },
      { destination: 'Delhi NCR', count: 10 },
      { destination: 'Mumbai', count: 8 },
      { destination: 'Hyderabad', count: 6 },
      { destination: 'Dubai', count: 3 },
    ],
    travelTypes: [
      { name: 'Business Conf', value: 16 },
      { name: 'Client Visit', value: 12 },
      { name: 'Domestic', value: 8 },
      { name: 'International', value: 5 },
    ],
    monthlyTrend: [
      { month: 'Jun', spend: 410000, trips: 12 },
      { month: 'Jul', spend: 530000, trips: 18 },
      { month: 'Aug', spend: 490000, trips: 15 },
      { month: 'Sep', spend: 680000, trips: 22 },
    ],
  };

  const recentRequests = data?.recentRequests || [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full text-xs text-brand-700 font-semibold border border-brand-200">
            <Sliders className="w-3.5 h-3.5 text-brand-600" />
            Executive Administration & TravelOps Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-slate-800">
            Organization Control Center · <span className="text-brand-900 font-black">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-600">
            Real-time multi-department travel operations, budgets, policy rules, and compliance analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/policies"
            className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs hover:bg-brand-700 shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-white" />
            Policy Engine
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2.5 bg-slate-100 text-slate-800 rounded-xl font-semibold text-xs border border-slate-200 hover:bg-slate-200 transition-all"
          >
            Analytics & Reports
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Employees"
          value={stats.totalEmployees}
          subtitle="Across 4 corporate branches"
          icon={Users}
          iconBg="bg-brand-50 text-brand-600 border-brand-200"
        />
        <StatCard
          title="Active Trips On Road"
          value={stats.activeTripsCount}
          subtitle="Currently traveling staff"
          icon={Plane}
          iconBg="bg-sky-50 text-sky-600 border-sky-200"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovalsCount}
          subtitle="Across all departments"
          icon={CheckSquare}
          iconBg="bg-amber-50 text-amber-600 border-amber-200"
        />
        <StatCard
          title="Total Travel Spend"
          value={stats.totalTravelSpend}
          isCurrency={true}
          subtitle="FY 2026 organization budget"
          icon={CreditCard}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-200"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Spend & Trips Trend */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-display">
                Organization Travel Spending Trends (INR)
              </h3>
              <p className="text-xs text-slate-500">Monthly authorized corporate expense trend</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Spend']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Line type="monotone" dataKey="spend" stroke="#0e86d4" strokeWidth={3} dot={{ r: 4, fill: '#0e86d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Travel Types Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
          <h3 className="text-sm font-extrabold text-slate-900 font-display mb-1">
            Travel Type Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">By trip category classification</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.travelTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.travelTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Organization Requests Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display">
              Organization Travel Stream
            </h3>
            <p className="text-xs text-slate-500">Live feed of employee travel requests across departments</p>
          </div>
          <Link to="/travel-requests" className="text-xs font-bold text-brand-600 hover:underline">
            All Requests →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Request</th>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Dates</th>
                <th className="py-3 px-3">Est. Cost</th>
                <th className="py-3 px-3">Policy Status</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRequests.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{r.requestId}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{r.employeeName}</td>
                  <td className="py-3 px-3 text-slate-600">{r.departmentName}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{r.origin} ⟶ {r.destination}</td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(r.departureDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">₹{r.estimatedTotalCost?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3"><Badge status={r.policyStatus} size="sm" /></td>
                  <td className="py-3 px-3"><Badge status={r.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
