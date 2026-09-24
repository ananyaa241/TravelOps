// frontend/src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import {
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Shield,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Badge } from './Badge';

export const Navbar = ({ onToggleSidebar, onOpenTravelModal, onGlobalSearch }) => {
  const { user, logout, switchRoleDemo, unreadNotifications, fetchNotifications } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleSwitch = async (role) => {
    setShowRoleMenu(false);
    await switchRoleDemo(role);
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      try {
        const res = await notificationAPI.getAll();
        if (res.data.success) {
          setNotificationsList(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load notifications:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      fetchNotifications();
      setNotificationsList(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onGlobalSearch) onGlobalSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-lg">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="lg:hidden flex items-center gap-1.5 shrink-0">
            <img src="/logo.png" alt="TravelOps" className="w-7 h-7 rounded-lg object-cover shadow-xs border border-slate-200" />
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requests, trips, bookings, expenses (e.g. TR-1024, Mumbai)..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </form>
        </div>

        {/* Right Action Tools: Role Switcher Demo, Quick Request, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick 1-Click Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200/80 rounded-xl hover:bg-brand-100/70 transition-all shadow-xs"
              title="Switch demo persona for instant workflow testing"
            >
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden md:inline">Role:</span>
              <span className="font-bold">{user?.role || 'EMPLOYEE'}</span>
              <ChevronDown className="w-3 h-3 text-brand-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-modal border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Switch Demo Persona
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click any role to test end-to-end workflows
                  </p>
                </div>
                <div className="space-y-1">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isCurrent = user?.role === acc.role;
                    return (
                      <button
                        key={acc.role}
                        onClick={() => handleRoleSwitch(acc.role)}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-start gap-2.5 transition-colors ${
                          isCurrent
                            ? 'bg-brand-50/80 border border-brand-200 text-brand-900'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate">{acc.label}</span>
                            {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{acc.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{acc.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Request Button */}
          <button
            onClick={onOpenTravelModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm hover:shadow transition-all"
          >
            <span>+ Travel Request</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={handleOpenNotifications}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-slate-200/80 p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-display">
                      Notifications
                    </h4>
                    {unreadNotifications > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-700 rounded-full">
                        {unreadNotifications} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-slate-50">
                  {notificationsList.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No notifications yet. You're all caught up!
                    </div>
                  ) : (
                    notificationsList.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-2.5 rounded-xl transition-colors ${
                          notif.isRead ? 'bg-white opacity-80' : 'bg-brand-50/40 border border-brand-100/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900">{notif.title}</h5>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'Arjun Verma'}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-1 font-medium">{user?.designation || user?.role}</p>
              </div>
              <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-slate-200/80 p-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <Badge status={user?.role} size="sm" className="mt-1.5" />
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    window.location.href = '/settings';
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Account Settings
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
