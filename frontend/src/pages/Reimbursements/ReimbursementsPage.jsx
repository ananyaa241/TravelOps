// frontend/src/pages/Reimbursements/ReimbursementsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reimbursementAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ReimbursementTimeline } from '../../components/expenses/ReimbursementTimeline';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Building,
} from 'lucide-react';

export const ReimbursementsPage = () => {
  const { user } = useAuth();
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReimbursements();
  }, []);

  const fetchReimbursements = async () => {
    try {
      const res = await reimbursementAPI.getAll();
      if (res.data.success) {
        setReimbursements(res.data.data);
      }
    } catch (err) {
      console.warn('Reimbursements fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
          Employee Reimbursements & Payout Desk
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Bank transfers, UPI disbursements, and corporate reimbursement transaction logs.
        </p>
      </div>

      {/* Reimbursement Trackers */}
      <div className="space-y-4">
        {reimbursements.length === 0 ? (
          <EmptyState
            icon="expense"
            title="No Reimbursements"
            description="Approved travel expense claims will generate reimbursement payment batches here."
          />
        ) : (
          reimbursements.map((r) => (
            <ReimbursementTimeline key={r._id} reimbursement={r} />
          ))
        )}
      </div>
    </div>
  );
};
