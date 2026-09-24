// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, notificationAPI } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  {
    role: 'EMPLOYEE',
    label: 'Employee',
    name: 'Arjun Verma',
    email: 'employee@travelops.demo',
    badge: 'Employee (Traveler)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    desc: 'Submit requests, itineraries, post-trip expenses',
  },
  {
    role: 'MANAGER',
    label: 'Manager',
    name: 'Priya Venkatesh',
    email: 'manager@travelops.demo',
    badge: 'Engineering Director',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    desc: 'Review team travel, approve requests & exceptions',
  },
  {
    role: 'TRAVEL COORDINATOR',
    label: 'Coordinator',
    name: 'Sunita Menon',
    email: 'coordinator@travelops.demo',
    badge: 'Travel Desk Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    desc: 'Book flights, hotels, cabs, itinerary management',
  },
  {
    role: 'FINANCE OFFICER',
    label: 'Finance',
    name: 'Vikramaditya Rao',
    email: 'finance@travelops.demo',
    badge: 'Finance Controller',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    desc: 'Audit claims, approve expenses, process reimbursements',
  },
  {
    role: 'COMPANY ADMIN',
    label: 'Admin',
    name: 'Rajesh Sharma',
    email: 'admin@travelops.demo',
    badge: 'Company Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    desc: 'System config, policies, user/dept management, reports',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('travelops_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('travelops_token'));
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('travelops_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('travelops_user', JSON.stringify(res.data.data));
            fetchNotifications();
          }
        } catch (error) {
          console.warn('Session check failed:', error.message);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res.data.success) {
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (e) {
      // quiet fail
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token: jwtToken, ...userData } = res.data.data;

      localStorage.setItem('travelops_token', jwtToken);
      localStorage.setItem('travelops_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      fetchNotifications();
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      const { token: jwtToken, ...userData } = res.data.data;

      localStorage.setItem('travelops_token', jwtToken);
      localStorage.setItem('travelops_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      fetchNotifications();
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please check your inputs.',
      };
    } finally {
      setLoading(false);
    }
  };

  const switchRoleDemo = async (role) => {
    const target = DEMO_ACCOUNTS.find(acc => acc.role === role);
    if (!target) return;
    return await login(target.email, 'TravelOps@2026');
  };

  const logout = () => {
    localStorage.removeItem('travelops_token');
    localStorage.removeItem('travelops_user');
    setUser(null);
    setToken(null);
    setUnreadNotifications(0);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('travelops_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        unreadNotifications,
        setUnreadNotifications,
        fetchNotifications,
        login,
        register,
        logout,
        switchRoleDemo,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
