// frontend/src/pages/Dashboard/FinanceDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, expenseAPI, reimbursementAPI } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Send,
  Building2,
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

const COLORS = ['#0e86d4', '#0267b5', '#38a5f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export const FinanceDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDisbursement, setSelectedDisbursement] = useState(null);
  const [disburseSubmitting, setDisburseSubmitting] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT/RTGS)');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getFinance();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Finance dashboard fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewExpense = async (id, decision) => {
    try {
      await expenseAPI.review(id, { decision, rejectionReason: decision === 'Rejected' ? 'Policy limit exceeded or invalid invoice.' : '' });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedDisbursement) return;

    setDisburseSubmitting(true);
    try {
      await reimbursementAPI.process(selectedDisbursement._id, {
        status: 'Paid',
        paymentMethod,
        paymentReference: paymentRef || `NEFT-HDFC-${Math.floor(1000000 + Math.random() * 9000000)}`,
      });
      setSelectedDisbursement(null);
      setPaymentRef('');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setDisburseSubmitting(false);
    }
  };

  const stats = data?.stats || {
    pendingExpensesCount: 1,
    approvedExpensesCount: 4,
    totalTravelSpending: 640000,
    pendingReimbursementAmount: 19700,
    paidReimbursementAmount: 48000,
    policyExceptionsCount: 1,
  };

  const pendingExpenses = data?.pendingExpenses || [];
  const reimbursementQueue = data?.reimbursementQueue || [];
  const charts = data?.charts || {
    departmentSpending: [
      { name: 'Engineering', spend: 320000 },
      { name: 'Sales & BD', spend: 210000 },
      { name: 'Product', spend: 75000 },
      { name: 'Finance', spend: 35000 },
    ],
    expenseCategories: [
      { name: 'Hotel', value: 240000 },
      { name: 'Flight', value: 280000 },
      { name: 'Food', value: 65000 },
      { name: 'Taxi', value: 55000 },
    ],
    monthlySpending: [
      { month: 'Jun', spend: 410000 },
      { month: 'Jul', spend: 530000 },
      { month: 'Aug', spend: 490000 },
      { month: 'Sep', spend: 640000 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full text-xs text-brand-700 font-semibold border border-brand-200">
            <CreditCard className="w-3.5 h-3.5 text-brand-600" />
            Corporate Finance & Payout Controller
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-slate-800">
            Finance Overview · <span className="text-brand-900 font-black">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-600">
            {stats.pendingExpensesCount > 0 || reimbursementQueue.length > 0
              ? `₹${(stats.pendingReimbursementAmount || 19700).toLocaleString('en-IN')} in expense claims and reimbursements ready for review.`
              : 'All expense claims and employee reimbursements have been processed.'}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Claims"
          value={stats.pendingExpensesCount}
          subtitle="Awaiting receipts audit"
          icon={Receipt}
          iconBg="bg-amber-50 text-amber-600 border-amber-200"
        />
        <StatCard
          title="Pending Reimbursements"
          value={stats.pendingReimbursementAmount}
          isCurrency={true}
          subtitle="Ready for bank disbursement"
          icon={Clock}
          iconBg="bg-brand-50 text-brand-600 border-brand-200"
        />
        <StatCard
          title="Total Travel Spend"
          value={stats.totalTravelSpending}
          isCurrency={true}
          subtitle="FY 2026 authorized spend"
          icon={TrendingUp}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-200"
        />
        <StatCard
          title="Paid Reimbursements"
          value={stats.paidReimbursementAmount || 48000}
          isCurrency={true}
          subtitle="Total disbursed to employees"
          icon={CheckCircle2}
          iconBg="bg-purple-50 text-purple-600 border-purple-200"
        />
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dept Spending Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
          <h3 className="text-sm font-extrabold text-slate-900 font-display mb-1">
            Travel Spend by Department (INR)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Cumulative spend across authorized travel</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentSpending}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Spend']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="spend" fill="#0e86d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Donut Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
          <h3 className="text-sm font-extrabold text-slate-900 font-display mb-1">
            Expense Category Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown of claimed expenses</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.expenseCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reimbursement Payout Queue Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display">
              Reimbursement Disbursement Queue
            </h3>
            <p className="text-xs text-slate-500">Approve batch disbursements and record banking transaction references</p>
          </div>
          <Badge status="Pending" size="sm" />
        </div>

        {reimbursementQueue.length === 0 ? (
          <EmptyState
            icon="expense"
            title="Reimbursement Queue Clear"
            description="No pending reimbursements awaiting payment release."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Reimbursement ID</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Trip</th>
                  <th className="py-3 px-3">Approved Amount</th>
                  <th className="py-3 px-3">Net Payable</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reimbursementQueue.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{r.reimbursementId}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{r.employeeName}</td>
                    <td className="py-3 px-3 text-slate-600">{r.destination || r.requestId}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">₹{r.approvedAmount?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-extrabold text-emerald-600 text-sm">₹{r.netPayableAmount?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedDisbursement(r)}
                        className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition-all"
                      >
                        Disburse Payout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disburse Modal */}
      {selectedDisbursement && (
        <Modal
          isOpen={!!selectedDisbursement}
          onClose={() => setSelectedDisbursement(null)}
          title={`Disburse Payment · ${selectedDisbursement.reimbursementId}`}
          subtitle={`Payee: ${selectedDisbursement.employeeName} · Net Payable: ₹${selectedDisbursement.netPayableAmount?.toLocaleString('en-IN')}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleProcessPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Disbursement Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
              >
                <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS Direct)</option>
                <option value="UPI Direct">UPI Direct Transfer</option>
                <option value="Corporate Card Credit">Corporate Card Credit</option>
                <option value="Payroll Adjustment">Monthly Payroll Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Transaction Reference Number
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. NEFT-HDFC-9928174"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono font-bold"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDisbursement(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={disburseSubmitting}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
              >
                {disburseSubmitting ? 'Processing...' : '✓ Confirm & Mark Paid'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
