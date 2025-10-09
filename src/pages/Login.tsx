import React, { useState, useEffect } from "react";
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useToast } from "../components/UI/ToastContainer";
import { serviceBaseUrl } from "../constants/appConstants";
import { useNavigate } from "react-router-dom";
import type { LoginProps } from "../types";

const Login: React.FC<LoginProps> = ({
  backendUrl = serviceBaseUrl,
  onSuccess,
  googleLogintheme = {},
  children
}) => {
  const navigate = useNavigate();
  const {
    Login,
    isLoading: authLoading,
    error: authError,
    clearError: clearAuthError,
    loginWithGoogle,
    verifyTokenAfterLogin,
    setBackendUrl
  } = useAuthStore();

  const user = useAuthStore.getState().user;
  const { showSuccess, showError } = useToast();
  const adminRole = import.meta.env.VITE_ADMIN_ROLE || 'admin';

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    verifyTokenAfterLogin();
  }, [verifyTokenAfterLogin]);

  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  useEffect(() => {
    if (backendUrl) {
      setBackendUrl(backendUrl);
    }
  }, [backendUrl, setBackendUrl]);

  useEffect(() => {
    if (user && onSuccess) {
      onSuccess(user);
    }
  }, [user, onSuccess]);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === adminRole) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/branding-setup", { replace: true });
      }
    }
  }, [user, navigate, adminRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();

    const result = await Login(email, password);

    if (!result.success) {
      showError(result.error || "Login failed. Please try again!");
    } else {
      showSuccess(
        "Welcome Back!",
        "Successfully logged in! Let's explore your future!"
      );
    }
  };

  const handleContinueWithGoogle = () => {
    setGoogleLoading(true);
    loginWithGoogle();
    setGoogleLoading(false);
  };

  const {
    primaryColor = "",
    fontFamily = "",
  } = googleLogintheme;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 pb-16">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full p-4 w-20 h-20 mx-auto mb-4">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">futureFrame</h1>
          <p className="text-gray-600">Inspiring Tomorrow's Leaders</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to access the Future Frame platform
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm">{authError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </div>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="email-input"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Password</span>
                </div>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading || !email || !password}
              data-testid="sign-in-button"
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-l-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="w-full border-t border-gray-300"></div>
            <span className="px-3 bg-white text-sm text-gray-500">or</span>
            <div className="w-full border-t border-gray-300"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleContinueWithGoogle}
            disabled={googleLoading}
            data-testid="google-login-button"
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: primaryColor || "white",
              fontFamily,
              ...(googleLogintheme.buttonStyle || {}),
            }}
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-l-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {children || "Continue with Google"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default Login;
