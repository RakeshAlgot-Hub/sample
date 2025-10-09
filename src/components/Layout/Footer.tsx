import React from 'react';
import { Mail, FileText, Shield, XCircle, Cookie } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjectConfig } from '../../hooks/useProjectConfig';

const Footer: React.FC = () => {
  const { projectName, companyName, companyLogo, theme } = useProjectConfig();

  return (
    <footer 
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary[900]}, ${theme.colors.secondary[900]}, ${theme.colors.primary[900]})`
      }}
    >
      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, ${theme.colors.primary[600]}30, ${theme.colors.accent[600]}30, ${theme.colors.secondary[600]}30)`
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Bottom Strip */}
      <div className="relative border-t border-white/30 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center text-gray-200 font-semibold text-xs sm:text-sm gap-2 sm:gap-0">
          <span className="drop-shadow text-center sm:text-left">© 2025 {projectName}. All rights reserved.</span>
          <div className="flex items-center gap-2 drop-shadow text-center">
            <span>Powered by</span>
            <img 
              src={companyLogo} 
              alt={companyName} 
                className="h-6 object-contain"
              />
            <span className="text-white font-bold">{companyName}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;