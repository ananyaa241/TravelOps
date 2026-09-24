// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('travelops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors and handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      const isAuthEndpoint = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('travelops_token');
        localStorage.removeItem('travelops_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const travelAPI = {
  getAll: (params) => api.get('/travel-requests', { params }),
  getById: (id) => api.get(`/travel-requests/${id}`),
  create: (data) => api.post('/travel-requests', data),
  update: (id, data) => api.put(`/travel-requests/${id}`, data),
  cancel: (id) => api.post(`/travel-requests/${id}/cancel`),
  checkPolicy: (data) => api.post('/travel-requests/check-policy', data),
};

export const approvalAPI = {
  getPending: () => api.get('/approvals'),
  approve: (id, data) => api.post(`/approvals/${id}/approve`, data),
  reject: (id, data) => api.post(`/approvals/${id}/reject`, data),
  requestChanges: (id, data) => api.post(`/approvals/${id}/request-changes`, data),
};

export const itineraryAPI = {
  getByTrip: (tripId) => api.get(`/itineraries/${tripId}`),
  save: (data) => api.post('/itineraries', data),
  addItem: (id, item) => api.post(`/itineraries/${id}/items`, item),
  deleteItem: (id, itemId) => api.delete(`/itineraries/${id}/items/${itemId}`),
};

export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export const vendorAPI = {
  getAll: (params) => api.get('/vendors', { params }),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  review: (id, data) => api.post(`/expenses/${id}/review`, data),
};

export const reimbursementAPI = {
  getAll: (params) => api.get('/reimbursements', { params }),
  process: (id, data) => api.post(`/reimbursements/${id}/process`, data),
};

export const reportAPI = {
  getTravel: (params) => api.get('/reports/travel', { params }),
  getExpenses: (params) => api.get('/reports/expenses', { params }),
  getDepartmentSpend: () => api.get('/reports/department-spend'),
};

export const dashboardAPI = {
  getEmployee: () => api.get('/dashboard/employee'),
  getManager: () => api.get('/dashboard/manager'),
  getCoordinator: () => api.get('/dashboard/coordinator'),
  getFinance: () => api.get('/dashboard/finance'),
  getAdmin: () => api.get('/dashboard/admin'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/mark-all-read'),
};

export const auditAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
};

export const policyAPI = {
  getAll: () => api.get('/policies'),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  delete: (id) => api.delete(`/policies/${id}`),
};

export const departmentAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
