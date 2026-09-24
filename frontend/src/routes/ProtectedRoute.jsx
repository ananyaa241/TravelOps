// frontend/src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/common/Layout';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
          Initializing TravelOps Secure Session...
        </p>
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold">403</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">
            Access Restricted
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
            Your role ({user.role}) does not possess authorization for this corporate operational module.
          </p>
          <a
            href="/dashboard"
            className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md"
          >
            Return to Dashboard
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
