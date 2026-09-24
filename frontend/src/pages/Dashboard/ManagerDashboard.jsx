// frontend/src/pages/Dashboard/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, approvalAPI } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { PolicyExceptionBanner } from '../../components/travel/PolicyExceptionBanner';
import { Modal } from '../../components/common/Modal';
import {
  CheckSquare,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Plane,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getManager();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Manager dashboard fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await approvalAPI.approve(id, { comment: actionComment || 'Approved at department level.' });
      setSelectedRequest(null);
      setActionComment('');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!actionComment) {
      alert('Please provide a rejection note.');
      return;
    }
    setActionLoading(true);
    try {
      await approvalAPI.reject(id, { comment: actionComment });
      setSelectedRequest(null);
      setActionComment('');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = data?.stats || {
    pendingApprovalsCount: 2,
    teamTravelSpend: 840000,
    upcomingTeamTripsCount: 4,
    policyExceptionsCount: 1,
  };

  const pendingApprovals = data?.pendingApprovals || [];
  const teamTrips = data?.teamTrips || [];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full text-xs text-brand-700 font-semibold border border-brand-200">
            <CheckSquare className="w-3.5 h-3.5 text-brand-600" />
            Manager Approval Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-slate-800">
            Welcome back, <span className="text-brand-900 font-black">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-600">
            {stats.pendingApprovalsCount > 0
              ? `You have ${stats.pendingApprovalsCount} travel request(s) awaiting your authorization.`
              : 'You are all caught up! No travel requests waiting for approval.'}
          </p>
        </div>

        <Link
          to="/approvals"
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs hover:bg-brand-700 shadow-md transition-all inline-flex items-center gap-2"
        >
          Open Approval Queue
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovalsCount}
          subtitle="Requests requiring action"
          icon={CheckSquare}
          iconBg="bg-amber-50 text-amber-600 border-amber-200"
        />
        <StatCard
          title="Team Travel Spend"
          value={stats.teamTravelSpend}
          isCurrency={true}
          subtitle="Department authorized budget"
          icon={CreditCard}
          iconBg="bg-brand-50 text-brand-600 border-brand-200"
        />
        <StatCard
          title="Upcoming Team Trips"
          value={stats.upcomingTeamTripsCount}
          subtitle="Approved active team journeys"
          icon={Plane}
          iconBg="bg-sky-50 text-sky-600 border-sky-200"
        />
        <StatCard
          title="Policy Exceptions"
          value={stats.policyExceptionsCount}
          subtitle="Special clearance required"
          icon={AlertTriangle}
          iconBg="bg-rose-50 text-rose-600 border-rose-200"
        />
      </div>

      {/* Approval Queue Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 font-display">
              Pending Team Approvals Queue
            </h3>
            <p className="text-xs text-slate-500">Review itineraries, estimated budget, and policy adherence.</p>
          </div>
          <Badge status="Pending" size="sm" />
        </div>

        {pendingApprovals.length === 0 ? (
          <EmptyState
            icon="approval"
            title="All Approvals Processed"
            description="There are no pending team travel requests requiring your review at this time."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((req) => (
              <div
                key={req._id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-card transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  {/* Top row: Employee and Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={req.employee?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                        alt={req.employeeName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {req.employeeName}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {req.employee?.designation || req.departmentName}
                        </p>
                      </div>
                    </div>
                    <Badge status={req.policyStatus} size="sm" />
                  </div>

                  {/* Trip Details */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 mb-3 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900 font-display">
                        {req.origin} ⟶ {req.destination}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {req.requestId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center justify-between">
                      <span>{req.travelType} · {req.durationDays} Days</span>
                      <span className="font-bold text-brand-900 text-xs">
                        ₹{req.estimatedTotalCost?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic pt-1 border-t border-slate-200/60">
                      "{req.purpose}"
                    </p>
                  </div>

                  {/* Violations if any */}
                  {req.policyViolations?.length > 0 && (
                    <div className="mb-3 text-[11px] p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
                      <span className="font-bold">⚠ Exception:</span> {req.policyViolations[0]?.rule}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="p-2 text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    Inspect Details
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-all"
                    >
                      ✓ Quick Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`Review Travel Request · ${selectedRequest.requestId}`}
          subtitle={`${selectedRequest.employeeName} (${selectedRequest.origin} ⟶ ${selectedRequest.destination})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <PolicyExceptionBanner
              policyStatus={selectedRequest.policyStatus}
              violations={selectedRequest.policyViolations}
            />

            <div className="grid grid-cols-2 gap-3 text-xs p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium">Estimated Hotel</span>
                <p className="font-bold text-slate-900">₹{selectedRequest.estimatedAccommodationCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Estimated Flights/Transport</span>
                <p className="font-bold text-slate-900">₹{selectedRequest.estimatedTransportationCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Estimated Meals</span>
                <p className="font-bold text-slate-900">₹{selectedRequest.estimatedMealsCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Advance Cash</span>
                <p className="font-bold text-slate-900">₹{Number(selectedRequest.advanceRequested || 0).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Approver Feedback / Decision Comment
              </label>
              <textarea
                rows={2}
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="e.g., Approved based on Q3 conference representation priority."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReject(selectedRequest._id)}
                className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all"
              >
                Reject Request
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApprove(selectedRequest._id)}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md transition-all"
              >
                {actionLoading ? 'Processing...' : '✓ Approve Travel Request'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
