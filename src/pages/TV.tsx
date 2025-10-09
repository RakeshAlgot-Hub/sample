import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { useTVStore } from '../stores/useTVStore';
import VideoPlayer from '../components/VideoPlayer';
import BrandingOverlay from '../components/BrandingOverlay';

const TV: React.FC = () => {
  const {
    latestFutureImageUrl,
    studentName,
    studentClass,
    profession,
    status,
    pollLatest
  } = useTVStore();

  useEffect(() => {
    // Start polling for latest content
    pollLatest();

    // Set up periodic polling
    const interval = setInterval(pollLatest, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [pollLatest]);

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      {/* Teacher Mode Button - Always visible */}
      <Link
        to="/teacher"
        className="absolute top-4 right-4 z-20 flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg transition-all duration-200 border border-white/20"
      >
        <Smartphone className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">Teacher Mode</span>
      </Link>

      {/* Branding Overlay */}
      <BrandingOverlay />

      {/* Main Content Area */}
      <div className="w-full h-full flex items-center justify-center">
        {status === 'waiting' ? (
          <div className="text-center text-white">
            <div className="mb-8">
              <div className="w-32 h-32 border-8 border-white border-l-transparent rounded-full animate-spin mx-auto mb-8"></div>
              <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
                Future Frame Citizens
              </h2>
              <p className="text-2xl opacity-75 drop-shadow-md">
                Waiting for the next future leader...
              </p>
            </div>
          </div>
        ) : (
          <VideoPlayer
            futureImageUrl={latestFutureImageUrl}
            studentName={studentName}
            studentClass={studentClass}
            profession={profession}
          />
        )}
      </div>

      {/* Status Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          status === 'playing' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
        } backdrop-blur-sm border border-white/10`}>
          {status === 'playing' ? 'Now Playing' : 'Ready'}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-2">
          <div className="text-center">
            <p className="text-xs text-white/60">
              Powered by{' '}
              <span className="font-semibold text-white/80">Yensi Solutions</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TV;