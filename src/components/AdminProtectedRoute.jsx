// ProtectedRoute.jsx
/*
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function ProtectedRoute({ adminOnly = false, superAdminOnly = false }) {
  const { isAuthenticated, isAdmin, isSuperAdmin } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (adminOnly && !isAdmin && !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;*/
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function AdminProtectedRoute({ children, superAdminOnly = false }) {
  const { isAuthenticated, isAdmin, isSuperAdmin } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/sign_in" replace />;
  }

  // For superadmin-only routes
  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  // For regular admin routes
  if (!isAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminProtectedRoute;