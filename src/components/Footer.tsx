import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-10">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500">
          Powered by{' '}
          <span className="font-semibold text-gray-700">Yensi Solutions</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;