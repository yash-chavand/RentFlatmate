import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Auth/Login';
import { Register } from '../pages/Auth/Register';
import { OwnerDashboard } from '../pages/Dashboard/OwnerDashboard';
import { TenantDashboard } from '../pages/Dashboard/TenantDashboard';
import { AdminDashboard } from '../pages/Dashboard/AdminDashboard';
import { SearchListings } from '../pages/Listings/SearchListings';
import { ListingDetails } from '../pages/Listings/ListingDetails';
import { ChatPage } from '../pages/Chat/ChatPage';
import { ProfilePage } from '../pages/Profile/ProfilePage';
import { SettingsPage } from '../pages/Settings/SettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><Landing /></MainLayout>} />
      <Route path="/listings" element={<MainLayout><SearchListings /></MainLayout>} />
      <Route path="/listings/:id" element={<MainLayout><ListingDetails /></MainLayout>} />

      {/* Auth Routes (Redirect to dashboard if already logged in) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Owner Routes */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <DashboardLayout>
              <OwnerDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Tenant Routes */}
      <Route
        path="/tenant/dashboard"
        element={
          <ProtectedRoute allowedRoles={['TENANT']}>
            <DashboardLayout>
              <TenantDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Shared Routes (Owner & Tenant) */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'TENANT']}>
            <MainLayout>
              <ChatPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'TENANT']}>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'TENANT']}>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
