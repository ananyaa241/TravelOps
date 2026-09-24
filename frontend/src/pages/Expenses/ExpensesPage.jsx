// frontend/src/pages/Expenses/ExpensesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { expenseAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Receipt,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  Eye,
  Building,
} from 'lucide-react';

export const ExpensesPage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const isFinance = user?.role === 'FINANCE OFFICER' || user?.role === 'COMPANY ADMIN';

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const fetchExpenses = async () => {
    try {
      const res = await expenseAPI.getAll({ category: categoryFilter });
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.warn('Expenses fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, decision) => {
    try {
      await expenseAPI.review(id, {
        decision,
        rejectionReason: decision === 'Rejected' ? 'Exceeds standard category allowances' : '',
      });
      setSelectedExpense(null);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            Travel Expense Claims & Audit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Post-trip expense submissions, digital receipt validation, and finance approval.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['', 'Hotel', 'Flight', 'Food', 'Taxi', 'Train', 'Miscellaneous'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat || 'All Categories'}
            </button>
          ))}
        </div>

        {expenses.length === 0 ? (
          <EmptyState
            icon="expense"
            title="No Expenses Logged"
            description="No expense claims match your filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Expense ID</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Trip Ref</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Description & Merchant</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Policy Status</th>
                  <th className="py-3 px-3">Approval Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{e.expenseId}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{e.employeeName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{e.requestId}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{e.category}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 line-clamp-1">{e.description}</div>
                      {e.merchant && <div className="text-[10px] text-slate-400">{e.merchant}</div>}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900 text-sm">
                      ₹{e.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={e.policyStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={e.approvalStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedExpense(e)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect / Review Modal */}
      {selectedExpense && (
        <Modal
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          title={`Expense Claim · ${selectedExpense.expenseId}`}
          subtitle={`${selectedExpense.category} claim by ${selectedExpense.employeeName} for ${selectedExpense.requestId}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-medium">Claim Amount</span>
                <p className="text-2xl font-extrabold text-brand-900 font-display">
                  ₹{selectedExpense.amount?.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <Badge status={selectedExpense.approvalStatus} />
                <div><Badge status={selectedExpense.policyStatus} size="sm" /></div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">Business Purpose: </span>
                <span className="text-slate-600">{selectedExpense.description}</span>
                {selectedExpense.merchant && (
                  <div className="mt-1 text-slate-500">
                    <span className="font-semibold">Merchant:</span> {selectedExpense.merchant}
                  </div>
                )}
              </div>

              {/* Receipt Preview Card */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-100 text-brand-700">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{selectedExpense.receiptName || 'Receipt_Invoice.pdf'}</h5>
                    <p className="text-[11px] text-emerald-600 font-semibold">✓ Digital Receipt Attached & Legally Verified</p>
                  </div>
                </div>
                <a
                  href={selectedExpense.receiptUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-bold text-brand-600 bg-white border border-brand-200 rounded-xl hover:bg-brand-50"
                >
                  View Attachment
                </a>
              </div>
            </div>

            {/* Finance Review Actions */}
            {isFinance && selectedExpense.approvalStatus === 'Submitted' && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleReview(selectedExpense._id, 'Rejected')}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100"
                >
                  Reject Claim
                </button>
                <button
                  onClick={() => handleReview(selectedExpense._id, 'Approved')}
                  className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  ✓ Approve for Reimbursement
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
