import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-10 bg-gradient-to-br from-orange-50/30 via-red-50/30 to-yellow-50/30" />

      <div className="fixed inset-0 z-20 bg-white/10 backdrop-blur-[0.2px]" />

      <Navbar />

      <main className="pt-16 relative z-30">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
