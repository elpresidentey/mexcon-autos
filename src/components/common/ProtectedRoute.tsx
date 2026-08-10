import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingPage } from './LoadingSpinner';
import { isAdminUser, type AdminRole } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AdminRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated || !isAdminUser(user)) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole && user.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-metallic-50">
        <div className="text-center">
          <h1 className="text-4xl font-black text-dark-900 mb-4 tracking-tight">
            Access Denied
          </h1>
          <p className="text-metallic-600 mb-8">
            You don't have permission to access this page.
          </p>
          <a href="/admin" className="btn btn-primary">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
