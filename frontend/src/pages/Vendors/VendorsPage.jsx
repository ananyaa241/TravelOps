// frontend/src/pages/Vendors/VendorsPage.jsx
import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Briefcase,
  Search,
  Plus,
  Star,
  Mail,
  Phone,
  MapPin,
  Building,
} from 'lucide-react';

export const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vendorType: 'Hotel',
    contactPerson: '',
    email: '',
    phone: '',
    city: 'Hyderabad',
    rating: 4.5,
  });

  useEffect(() => {
    fetchVendors();
  }, [search]);

  const fetchVendors = async () => {
    try {
      const res = await vendorAPI.getAll({ search });
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (err) {
      console.warn('Vendors fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    try {
      const res = await vendorAPI.create(formData);
      if (res.data.success) {
        setModalOpen(false);
        setFormData({
          name: '',
          vendorType: 'Hotel',
          contactPerson: '',
          email: '',
          phone: '',
          city: 'Hyderabad',
          rating: 4.5,
        });
        fetchVendors();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save vendor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            Corporate Travel Vendors Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Contracted airlines, luxury hotels, corporate travel agencies, and cabs.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Add New Vendor
        </button>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <div
            key={v._id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                  {v.vendorType}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{v.rating}</span>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {v.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {v.city || 'India'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                {v.contactPerson && (
                  <p><span className="text-slate-400 font-medium">Contact:</span> {v.contactPerson}</p>
                )}
                {v.email && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {v.email}
                  </p>
                )}
                {v.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {v.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-600">✓ Contract Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Onboard Corporate Travel Vendor"
          subtitle="Add contracted airlines, hotel chains, and logistics partners."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateVendor} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Vendor Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Air India Corporate, Taj Hotels"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Vendor Classification *
              </label>
              <select
                value={formData.vendorType}
                onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="Airline">Airline</option>
                <option value="Hotel">Hotel & Resorts</option>
                <option value="Travel Agency">Travel Agency</option>
                <option value="Transport">Transport / Cabs</option>
                <option value="Car Rental">Car Rental</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Corporate Email Desk
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all"
              >
                Save Vendor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
