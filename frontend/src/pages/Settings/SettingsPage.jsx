// frontend/src/pages/Settings/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { policyAPI, authAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Settings,
  User,
  Shield,
  Sliders,
  Bell,
  Save,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [policies, setPolicies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Arjun Verma',
    phone: user?.phone || '+91 97170 88990',
    city: user?.city || 'Hyderabad',
    designation: user?.designation || 'Senior Lead Architect',
  });

  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    title: '',
    travelType: 'Domestic',
    hotelMaxPerNight: 8000,
    mealsMaxPerDay: 2000,
    transportMaxPerDay: 3000,
    flightClassDomestic: 'Economy',
    flightClassInternational: 'Premium Economy',
  });

  useEffect(() => {
    if (user?.role === 'COMPANY ADMIN') {
      fetchPolicies();
    }
  }, [user]);

  const fetchPolicies = async () => {
    try {
      const res = await policyAPI.getAll();
      if (res.data.success) {
        setPolicies(res.data.data);
      }
    } catch (err) {
      console.warn('Policy fetch fallback:', err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      if (res.data.success) {
        updateUser(res.data.data);
        setSuccessMessage('Profile details updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    try {
      const res = await policyAPI.create(policyForm);
      if (res.data.success) {
        setPolicyModalOpen(false);
        setPolicyForm({
          title: '',
          travelType: 'Domestic',
          hotelMaxPerNight: 8000,
          mealsMaxPerDay: 2000,
          transportMaxPerDay: 3000,
          flightClassDomestic: 'Economy',
          flightClassInternational: 'Premium Economy',
        });
        fetchPolicies();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create policy');
    }
  };

  const isAdmin = user?.role === 'COMPANY ADMIN';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
          System Settings & Policies
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Account preferences, notification rules, and organizational travel compliance caps.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'profile' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Profile
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'policies' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Travel Policies Engine
          </button>
        )}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card max-w-2xl">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">{user?.name}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <Badge status={user?.role} size="sm" className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  value={profileForm.designation}
                  onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Base City / Branch
                </label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'policies' && isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 font-display">
              Configured Travel Policy Rules
            </h3>
            <button
              onClick={() => setPolicyModalOpen(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + Add Policy Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 font-display">{p.title}</h4>
                  <Badge status="Within Policy" size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400">Hotel Nightly Cap:</span>
                    <p className="font-bold text-slate-800">₹{p.hotelMaxPerNight?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Meals Per Diem:</span>
                    <p className="font-bold text-slate-800">₹{p.mealsMaxPerDay?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Domestic Flight:</span>
                    <p className="font-bold text-slate-800">{p.flightClassDomestic}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Intl Flight:</span>
                    <p className="font-bold text-slate-800">{p.flightClassInternational}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">{p.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Policy Modal */}
      {policyModalOpen && (
        <Modal
          isOpen={policyModalOpen}
          onClose={() => setPolicyModalOpen(false)}
          title="Create New Travel Policy Rule"
          subtitle="Configure rate limits for automatic compliance evaluation."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreatePolicy} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Policy Rule Title *
              </label>
              <input
                type="text"
                required
                value={policyForm.title}
                onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                placeholder="e.g. Executive Client Relations Policy"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Max Hotel / Night (INR)
                </label>
                <input
                  type="number"
                  required
                  value={policyForm.hotelMaxPerNight}
                  onChange={(e) => setPolicyForm({ ...policyForm, hotelMaxPerNight: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Max Meals / Day (INR)
                </label>
                <input
                  type="number"
                  required
                  value={policyForm.mealsMaxPerDay}
                  onChange={(e) => setPolicyForm({ ...policyForm, mealsMaxPerDay: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md"
              >
                Save Policy Rule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
