import React from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Home, Users } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { motion } from "framer-motion";
import { useProjectConfig } from "../../hooks/useProjectConfig";


const Navbar: React.FC = () => {
  const { logout, user } = useAuthStore();
  const { projectName, theme } = useProjectConfig();


  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-md"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary[500]}20, ${theme.colors.secondary[500]}20)`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="text-xl font-bold" style={{ color: theme.colors.primary[600] }}>
              {projectName}
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 drop-shadow" style={{ color: theme.colors.primary[400] }} />
                  <span 
                    className="text-sm font-semibold drop-shadow"
                    style={{ color: theme.colors.primary[600] }}
                  >
                    {user.username || user.email.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 transition-all hover:opacity-80"
                  style={{ color: theme.colors.accent[500] }}
                  data-testid="logout-button"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 drop-shadow" />
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
