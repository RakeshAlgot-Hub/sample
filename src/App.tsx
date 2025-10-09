import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/UI/ToastContainer';
import PublicRoute from './components/PublicRouter';
import React from "react";
import { useAuthStore } from './stores/useAuthStore';
import AdminPage from './pages/AdminPage';
import Teacher from './pages/Teacher';
import TV from './pages/TV';
import BrandingSettings from './pages/BrandingSettings';
import BrandingSetup from './components/BrandingSetup';
import GeneratedContent from './pages/GeneratedContent';

function App() {
  const { user, verifySessionPeriodically, verifyTokenAfterLogin, authState, isAuthenticated } = useAuthStore();
  const adminRole = import.meta.env.VITE_ADMIN_ROLE || 'admin';
  
  // Verify token on app load
  React.useEffect(() => {
    if (authState === 'notChecked') {
      verifyTokenAfterLogin();
    }
  }, [verifyTokenAfterLogin, authState]);

  // Auto-redirect based on user role after login
  React.useEffect(() => {
    if (user && isAuthenticated && authState === 'valid') {
      const isUserAdmin = user.role === adminRole;
      const currentPath = window.location.pathname;
      
      // If admin is on branding-setup page, redirect to admin page
      if (isUserAdmin && currentPath === '/branding-setup') {
        window.history.replaceState(null, '', '/admin');
      }
      // If regular user is on admin page, redirect to branding-setup
      else if (!isUserAdmin && currentPath === '/admin') {
        window.history.replaceState(null, '', '/branding-setup');
      }
    }
  }, [user, isAuthenticated, authState, adminRole]);

  // Periodic session verification
  React.useEffect(() => {
    if (!user || authState !== 'valid') return;

    const interval = setInterval(() => {
      verifySessionPeriodically();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, verifySessionPeriodically, authState]);

  return (
    <ToastProvider>
      <Router>
        <div className="relative min-h-screen">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />


            {/* Admin-only route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* User-only route - Branding Setup */}
            <Route
              path="/branding-setup"
              element={
                <ProtectedRoute userOnly={true}>
                  <BrandingSetup />
                </ProtectedRoute>
              }
            />

            {/* Protected routes for Future Frame features */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute>
                  <Teacher />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tv"
              element={
                <ProtectedRoute>
                  <TV />
                </ProtectedRoute>
              }
            />
            <Route
              path="/branding"
              element={
                <ProtectedRoute>
                  <BrandingSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/branding-settings"
              element={
                <ProtectedRoute>
                  <BrandingSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generated-content"
              element={
                <ProtectedRoute>
                  <GeneratedContent />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;