import { JSX, useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useLocation, useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string;
  adminOnly?: boolean;
  userOnly?: boolean;
}

const ProtectedRoute = ({ children, requiredRole, adminOnly = false, userOnly = false }: ProtectedRouteProps) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authState = useAuthStore((s) => s.authState);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect logic moved to a useEffect hook
  useEffect(() => {
    // Wait for the auth state to be checked
    if (authState === 'checking' || authState === 'notChecked') {
      return;
    }

    const adminRole = import.meta.env.VITE_ADMIN_ROLE || 'admin';
    const isUserAdmin = user?.role === adminRole;

    // Condition 1: Not authenticated, redirect to login
    if (!isAuthenticated || !user || authState === 'invalid') {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
      return;
    }

    // Condition 2: Admin-only route for a non-admin user
    if (adminOnly && !isUserAdmin) {
      navigate('/', { replace: true });
      return;
    }

    // Condition 3: User-only route for an admin user
    if (userOnly && isUserAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    // Condition 4: Role required but user's role doesn't match
    if (requiredRole && user.role !== requiredRole) {
      navigate(isUserAdmin ? '/admin' : '/', { replace: true });
      return;
    }

  }, [user, isAuthenticated, authState, location.pathname, navigate, requiredRole, adminOnly, userOnly]);

  // Render children only if all checks pass
  if (authState === 'valid' && isAuthenticated && user) {
    const adminRole = import.meta.env.VITE_ADMIN_ROLE || 'admin';
    const isUserAdmin = user.role === adminRole;

    if (adminOnly && !isUserAdmin) {
      return null;
    }
    if (userOnly && isUserAdmin) {
      return null;
    }
    if (requiredRole && user.role !== requiredRole) {
      return null;
    }

    return children;
  }

  // Show a loading state or nothing while checking authentication
  return null;
};

export default ProtectedRoute;