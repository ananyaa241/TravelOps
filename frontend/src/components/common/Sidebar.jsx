// frontend/src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Plane,
  FileText,
  CalendarDays,
  Ticket,
  Receipt,
  CreditCard,
  CheckSquare,
  BarChart3,
  History,
  Users,
  Building2,
  Briefcase,
  Sliders,
  Settings,
  X,
  Compass,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';

  const isEmployee = role === 'EMPLOYEE';
  const isManager = role === 'MANAGER';
  const isCoordinator = role === 'TRAVEL COORDINATOR';
  const isFinance = role === 'FINANCE OFFICER';
  const isAdmin = role === 'COMPANY ADMIN';

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: true },
      ],
    },
    {
      label: 'Travel Operations',
      items: [
        { name: 'My Trips', path: '/trips', icon: Compass, show: isEmployee || isManager || isAdmin },
        { name: 'Travel Requests', path: '/travel-requests', icon: Plane, show: true },
        { name: 'Bookings Desk', path: '/bookings', icon: Ticket, show: isCoordinator || isAdmin || isManager },
      ],
    },
    {
      label: 'Expenses & Payouts',
      items: [
        { name: 'Expense Claims', path: '/expenses', icon: Receipt, show: true },
        { name: 'Reimbursements', path: '/reimbursements', icon: CreditCard, show: isFinance || isEmployee || isAdmin },
      ],
    },
    {
      label: 'Approvals',
      items: [
        { name: 'Approval Queue', path: '/approvals', icon: CheckSquare, show: isManager || isFinance || isAdmin },
      ],
    },
    {
      label: 'Intelligence & Audit',
      items: [
        { name: 'Analytics & Reports', path: '/reports', icon: BarChart3, show: isAdmin || isFinance || isManager },
        { name: 'Audit Trail', path: '/audit-logs', icon: History, show: isAdmin || isFinance || isManager },
      ],
    },
    {
      label: 'Organization',
      items: [
        { name: 'Vendors Desk', path: '/vendors', icon: Briefcase, show: isCoordinator || isAdmin },
        { name: 'Employees', path: '/employees', icon: Users, show: isAdmin || isCoordinator },
        { name: 'Policies & Rules', path: '/policies', icon: Sliders, show: isAdmin },
        { name: 'Settings', path: '/settings', icon: Settings, show: true },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-900 text-slate-300 border-r border-navy-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-800/80 bg-navy-950/40">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="TravelOps Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-md shadow-brand-500/20 border border-navy-700/80"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white font-display">
                  Travel<span className="text-sky-400">Ops</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-brand-500/20 text-sky-300 rounded border border-brand-400/30">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Corporate Travel Cloud</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((i) => i.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label}>
                <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-display">
                  {group.label}
                </h4>
                <nav className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                            isActive
                              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                              : 'text-slate-300 hover:bg-navy-800/80 hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 opacity-80" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        {/* Current Persona Badge at bottom */}
        <div className="p-3 border-t border-navy-800 bg-navy-950/60">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-850 border border-navy-800">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-navy-700"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <span className="inline-block text-[10px] text-sky-400 font-semibold truncate">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
