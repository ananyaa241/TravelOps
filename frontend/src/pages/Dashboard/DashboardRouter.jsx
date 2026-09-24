// frontend/src/pages/Dashboard/DashboardRouter.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EmployeeDashboard } from './EmployeeDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { CoordinatorDashboard } from './CoordinatorDashboard';
import { FinanceDashboard } from './FinanceDashboard';
import { AdminDashboard } from './AdminDashboard';
import { TravelRequestModal } from '../../components/travel/TravelRequestModal';

export const DashboardRouter = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const role = user?.role || 'EMPLOYEE';

  const renderDashboard = () => {
    switch (role) {
      case 'COMPANY ADMIN':
        return <AdminDashboard onOpenTravelModal={() => setModalOpen(true)} />;
      case 'MANAGER':
        return <ManagerDashboard onOpenTravelModal={() => setModalOpen(true)} />;
      case 'TRAVEL COORDINATOR':
        return <CoordinatorDashboard onOpenTravelModal={() => setModalOpen(true)} />;
      case 'FINANCE OFFICER':
        return <FinanceDashboard onOpenTravelModal={() => setModalOpen(true)} />;
      case 'EMPLOYEE':
      default:
        return <EmployeeDashboard onOpenTravelModal={() => setModalOpen(true)} />;
    }
  };

  return (
    <>
      {renderDashboard()}
      <TravelRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
};
