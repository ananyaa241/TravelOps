// frontend/src/components/common/Layout.jsx
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { TravelRequestModal } from '../travel/TravelRequestModal';
import { Plus, Plane } from 'lucide-react';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [travelModalOpen, setTravelModalOpen] = useState(false);

  const handleTravelSuccess = (newRequest) => {
    // Refresh page or trigger notification
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenTravelModal={() => setTravelModalOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TravelOps Platform · Enterprise Travel & Expense Management System</p>
        </footer>
      </div>

      {/* Global Travel Request Wizard Modal */}
      <TravelRequestModal
        isOpen={travelModalOpen}
        onClose={() => setTravelModalOpen(false)}
        onSuccess={handleTravelSuccess}
      />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setTravelModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-40 p-4 rounded-full bg-brand-600 text-white shadow-elevated hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all flex items-center justify-center"
        aria-label="New Travel Request"
      >
        <Plane className="w-6 h-6 -rotate-45" />
      </button>
    </div>
  );
};
