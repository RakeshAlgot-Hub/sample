import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, authState } = useAuthStore();

  // Don't redirect while checking authentication
  if (authState === 'checking') {
    return <>{children}</>;
  }

  // Only redirect if definitely authenticated
  if (isAuthenticated && authState === 'valid') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
