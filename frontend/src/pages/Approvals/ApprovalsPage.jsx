// frontend/src/pages/Approvals/ApprovalsPage.jsx
import React, { useState, useEffect } from 'react';
import { approvalAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { PolicyExceptionBanner } from '../../components/travel/PolicyExceptionBanner';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Clock,
  Eye,
} from 'lucide-react';

export const ApprovalsPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await approvalAPI.getPending();
      if (res.data.success) {
        setApprovals(res.data.data);
        setRecentDecisions(res.data.recentDecisions || []);
      }
    } catch (err) {
      console.warn('Approvals fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decisionType) => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      if (decisionType === 'approve') {
        await approvalAPI.approve(selectedRequest._id, { comment: actionComment || 'Approved' });
      } else if (decisionType === 'reject') {
        await approvalAPI.reject(selectedRequest._id, { comment: actionComment || 'Rejected per policy' });
      } else if (decisionType === 'changes') {
        await approvalAPI.requestChanges(selectedRequest._id, { comment: actionComment || 'Please adjust budget' });
      }
      setSelectedRequest(null);
      setActionComment('');
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.message || 'Decision processing failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
          Approval Queue & Workflow Authorization
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Multi-level corporate travel approvals, budget reviews, and policy exceptions.
        </p>
      </div>

      {/* Main Approvals Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display">
              Requests Awaiting Your Authorization ({approvals.length})
            </h3>
            <p className="text-xs text-slate-500">Review budgets, policy exceptions, and business justifications</p>
          </div>
          <Badge status="Pending" size="sm" />
        </div>

        {approvals.length === 0 ? (
          <EmptyState
            icon="approval"
            title="All Approvals Complete"
            description="You have no pending approvals in your queue right now."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Route & Purpose</th>
                  <th className="py-3 px-3">Travel Dates</th>
                  <th className="py-3 px-3">Est. Amount</th>
                  <th className="py-3 px-3">Policy Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvals.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{r.requestId}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{r.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{r.departmentName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 font-display">{r.origin} ⟶ {r.destination}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 italic">{r.purpose}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {new Date(r.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(r.returnDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      ₹{r.estimatedTotalCost?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={r.policyStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`Evaluate Travel Request · ${selectedRequest.requestId}`}
          subtitle={`${selectedRequest.employeeName} (${selectedRequest.origin} ⟶ ${selectedRequest.destination})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <PolicyExceptionBanner
              policyStatus={selectedRequest.policyStatus}
              violations={selectedRequest.policyViolations}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400">Hotel Est.</span>
                <p className="font-bold text-slate-900">₹{selectedRequest.estimatedAccommodationCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400">Flights/Cab</span>
                <p className="font-bold text-slate-900">₹{selectedRequest.estimatedTransportationCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400">Meals</span>
                <p className="font-bold text-slate-900">₹{selectedRequest.estimatedMealsCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400">Total Budget</span>
                <p className="font-extrabold text-brand-900 text-sm">₹{selectedRequest.estimatedTotalCost?.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Business Purpose: </span>
              <span className="text-slate-600">{selectedRequest.purpose}</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Approver Notes / Reason
              </label>
              <textarea
                rows={2}
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Optional reason for approval, rejection or revisions..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleDecision('changes')}
                className="px-3.5 py-2 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Request Changes
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleDecision('reject')}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleDecision('approve')}
                  className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
                >
                  {actionLoading ? 'Processing...' : '✓ Authorize & Approve'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
