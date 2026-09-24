// frontend/src/pages/Audit/AuditLogsPage.jsx
import React, { useState, useEffect } from 'react';
import { auditAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  History,
  Search,
  Filter,
  ShieldAlert,
  User,
  Clock,
} from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [search]);

  const fetchLogs = async () => {
    try {
      const res = await auditAPI.getAll({ search });
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.warn('Audit logs fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
          System Audit Trail & Compliance Log
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable event log of user authorizations, policy overrides, disbursements, and bookings.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by user, ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {logs.length === 0 ? (
          <EmptyState
            icon="clock"
            title="No Audit Logs"
            description="System events and user actions will be recorded here."
          />
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 mt-0.5">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{log.userName}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">({log.userRole})</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200/80 text-slate-700 rounded">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{log.description}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 whitespace-nowrap self-end sm:self-auto">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  {new Date(log.timestamp).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
