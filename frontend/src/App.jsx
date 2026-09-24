import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardRouter } from './pages/Dashboard/DashboardRouter';
import { TravelRequestsPage } from './pages/Travel/TravelRequestsPage';
import { TripsPage } from './pages/Travel/TripsPage';
import { ApprovalsPage } from './pages/Approvals/ApprovalsPage';
import { BookingsPage } from './pages/Bookings/BookingsPage';
import { VendorsPage } from './pages/Vendors/VendorsPage';
import { ExpensesPage } from './pages/Expenses/ExpensesPage';
import { ReimbursementsPage } from './pages/Reimbursements/ReimbursementsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { AuditLogsPage } from './pages/Audit/AuditLogsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes inside Layout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/travel-requests" element={<TravelRequestsPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/reimbursements" element={<ReimbursementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/policies" element={<SettingsPage />} />
      </Route>

      {/* Manager, Finance & Admin Protected */}
      <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'FINANCE OFFICER', 'COMPANY ADMIN']} />}>
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Coordinator & Admin Protected */}
      <Route element={<ProtectedRoute allowedRoles={['TRAVEL COORDINATOR', 'COMPANY ADMIN', 'MANAGER']} />}>
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
