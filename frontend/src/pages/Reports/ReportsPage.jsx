// frontend/src/pages/Reports/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  Building2,
  TrendingUp,
} from 'lucide-react';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('travel');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'travel') {
        const res = await reportAPI.getTravel();
        if (res.data.success) {
          setData(res.data.data);
          setSummary(res.data.summary || {});
        }
      } else if (reportType === 'expenses') {
        const res = await reportAPI.getExpenses();
        if (res.data.success) {
          setData(res.data.data);
          setSummary(res.data.summary || {});
        }
      } else if (reportType === 'department') {
        const res = await reportAPI.getDepartmentSpend();
        if (res.data.success) {
          setData(res.data.data);
        }
      }
    } catch (err) {
      console.warn('Report fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'travel') {
      csvContent += 'Request ID,Employee,Department,Travel Type,Origin,Destination,Departure,Return,Estimated Cost,Policy Status,Status\n';
      data.forEach((r) => {
        csvContent += `"${r.requestId}","${r.employeeName}","${r.departmentName}","${r.travelType}","${r.origin}","${r.destination}","${new Date(r.departureDate).toISOString()}","${new Date(r.returnDate).toISOString()}",${r.estimatedTotalCost},"${r.policyStatus}","${r.status}"\n`;
      });
    } else if (reportType === 'expenses') {
      csvContent += 'Expense ID,Employee,Trip,Category,Amount,Description,Policy Status,Approval Status\n';
      data.forEach((e) => {
        csvContent += `"${e.expenseId}","${e.employeeName}","${e.requestId}","${e.category}",${e.amount},"${e.description.replace(/"/g, '""')}","${e.policyStatus}","${e.approvalStatus}"\n`;
      });
    } else {
      csvContent += 'Department,Code,Annual Budget,Spent Budget,Remaining Budget,Utilization %\n';
      data.forEach((d) => {
        csvContent += `"${d.name}","${d.code}",${d.annualBudget},${d.spent},${d.remaining},${d.utilization}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TravelOps_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            Corporate Travel & Financial Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit exports, department budget utilization, and tax compliance data.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Report to CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setReportType('travel')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'travel'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Travel Requests Report
        </button>
        <button
          onClick={() => setReportType('expenses')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'expenses'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Expenses & Claims Report
        </button>
        <button
          onClick={() => setReportType('department')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'department'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Department Budget Utilization
        </button>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <div className="overflow-x-auto">
          {reportType === 'travel' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Travel Type</th>
                  <th className="py-3 px-3">Cost (INR)</th>
                  <th className="py-3 px-3">Policy Status</th>
                  <th className="py-3 px-3">Lifecycle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{r.requestId}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{r.employeeName}</td>
                    <td className="py-3 px-3 text-slate-600">{r.departmentName}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{r.origin} ⟶ {r.destination}</td>
                    <td className="py-3 px-3 text-slate-600">{r.travelType}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">₹{r.estimatedTotalCost?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3"><Badge status={r.policyStatus} size="sm" /></td>
                    <td className="py-3 px-3"><Badge status={r.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'expenses' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-3">Expense ID</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Trip</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Amount (INR)</th>
                  <th className="py-3 px-3">Policy</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{e.expenseId}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{e.employeeName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{e.requestId}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{e.category}</td>
                    <td className="py-3 px-3 text-slate-600">{e.description}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">₹{e.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3"><Badge status={e.policyStatus} size="sm" /></td>
                    <td className="py-3 px-3"><Badge status={e.approvalStatus} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'department' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Annual Allocated Budget</th>
                  <th className="py-3 px-3">Travel Spent</th>
                  <th className="py-3 px-3">Remaining Balance</th>
                  <th className="py-3 px-3">Budget Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{d.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{d.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">₹{d.annualBudget?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-extrabold text-brand-900">₹{d.spent?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">₹{d.remaining?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{d.utilization}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
