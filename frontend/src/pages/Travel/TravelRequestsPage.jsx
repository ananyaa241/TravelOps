// frontend/src/pages/Travel/TravelRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { travelAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { TravelRequestModal } from '../../components/travel/TravelRequestModal';
import { PolicyExceptionBanner } from '../../components/travel/PolicyExceptionBanner';
import {
  Plane,
  Search,
  Filter,
  Plus,
  Calendar,
  IndianRupee,
  MapPin,
  Eye,
  XCircle,
  FileText,
} from 'lucide-react';

export const TravelRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, search]);

  const fetchRequests = async () => {
    try {
      const res = await travelAPI.getAll({ search, status: statusFilter });
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.warn('Requests fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this travel request?')) return;
    try {
      await travelAPI.cancel(id);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const statusTabs = [
    { label: 'All Requests', value: '' },
    { label: 'Pending Approval', value: 'Pending Manager Approval' },
    { label: 'Approved & Booked', value: 'Booked' },
    { label: 'Policy Review', value: 'Policy Review' },
    { label: 'Completed', value: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            Corporate Travel Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit, track approval lifecycles, and view trip authorizations.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Travel Request
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === tab.value
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destination, employee..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Requests Table */}
        {requests.length === 0 ? (
          <EmptyState
            icon="plane"
            title="No Travel Requests Found"
            description="No requests match your current filter criteria."
            actionLabel="+ Create Request"
            onAction={() => setCreateModalOpen(true)}
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
                  <th className="py-3 px-3">Est. Budget</th>
                  <th className="py-3 px-3">Policy Status</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
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
                    <td className="py-3 px-3">
                      <Badge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Drawer / Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`Travel Request · ${selectedRequest.requestId}`}
          subtitle={`${selectedRequest.origin} ⟶ ${selectedRequest.destination} (${selectedRequest.travelType})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <PolicyExceptionBanner
              policyStatus={selectedRequest.policyStatus}
              violations={selectedRequest.policyViolations}
            />

            {/* General Trip Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400">Employee</span>
                <p className="font-bold text-slate-900">{selectedRequest.employeeName}</p>
              </div>
              <div>
                <span className="text-slate-400">Department</span>
                <p className="font-bold text-slate-900">{selectedRequest.departmentName}</p>
              </div>
              <div>
                <span className="text-slate-400">Duration</span>
                <p className="font-bold text-slate-900">{selectedRequest.durationDays} Days</p>
              </div>
              <div>
                <span className="text-slate-400">Current Status</span>
                <div><Badge status={selectedRequest.status} size="sm" /></div>
              </div>
            </div>

            {/* Purpose & Cost Breakdown */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-700">Business Purpose: </span>
                <span className="text-slate-600">{selectedRequest.purpose}</span>
              </div>
              {selectedRequest.businessCode && (
                <div>
                  <span className="font-bold text-slate-700">Project Code: </span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{selectedRequest.businessCode}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500">Accommodation Budget:</span>
                <p className="font-bold text-slate-900">₹{selectedRequest.estimatedAccommodationCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Transportation Budget:</span>
                <p className="font-bold text-slate-900">₹{selectedRequest.estimatedTransportationCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Meals & Per-diem:</span>
                <p className="font-bold text-slate-900">₹{selectedRequest.estimatedMealsCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Total Authorized Budget:</span>
                <p className="font-extrabold text-brand-900 text-sm">₹{selectedRequest.estimatedTotalCost?.toLocaleString()}</p>
              </div>
            </div>

            {/* Approval Chain history */}
            {selectedRequest.approvalChain?.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-display">
                  Approval Workflow History
                </h5>
                <div className="space-y-1.5">
                  {selectedRequest.approvalChain.map((chain, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">Level {chain.level} ({chain.role})</span>
                        {chain.approverName && <span className="text-slate-500"> · {chain.approverName}</span>}
                        {chain.comment && <p className="text-[11px] text-slate-600 italic mt-0.5">"{chain.comment}"</p>}
                      </div>
                      <Badge status={chain.status} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancel Action */}
            {['Submitted', 'Pending Manager Approval', 'Draft'].includes(selectedRequest.status) && (
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleCancelRequest(selectedRequest._id)}
                  className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Creation Wizard */}
      <TravelRequestModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          fetchRequests();
        }}
      />
    </div>
  );
};
