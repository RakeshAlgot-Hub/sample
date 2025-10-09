import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Monitor, RotateCcw, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useSessionStore } from '../stores/useSessionStore';
import Footer from '../components/Footer';
import StartSessionForm from '../components/StartSessionForm';
import CapturePanel from '../components/CapturePanel';
import UploadProgress from '../components/UploadProgress';
import SessionStatus from '../components/SessionStatus';

type ViewState = 'form' | 'capture' | 'processing' | 'status';

const Teacher: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('form');
  const { currentSession, resetSession } = useSessionStore();
  const { logout } = useAuthStore();

  const handleSessionStart = () => {
    setCurrentView('capture');
  };

  const handleSessionComplete = () => {
    setCurrentView('processing');
    // After upload completes, switch to status view
    setTimeout(() => {
      setCurrentView('status');
    }, 2000);
  };

  const handleRetry = () => {
    setCurrentView('capture');
  };

  const handleNewSession = () => {
    resetSession();
    setCurrentView('form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-600 rounded-full p-2 mr-3">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Future Frame</h1>
                <p className="text-sm text-gray-600">Teacher Mode</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to="/generated-content"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
              >
                <span className="text-xs font-medium">Generated</span>
              </Link>
              <Link
                to="/branding"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <Link
                to="/tv"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
              >
                <Monitor className="w-4 h-4" />
              </Link>
              <button
                onClick={logout}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-2 h-[calc(100vh-100px)] flex flex-col">

        {currentView === 'form' && (
          <div className="bg-white p-4 rounded-lg shadow-md flex-1 flex flex-col min-h-0">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Start New Session
            </h2>
            <div className="flex-1">
              <StartSessionForm onSessionStart={handleSessionStart} />
            </div>
          </div>
        )}

        {currentView === 'capture' && (
          <div className="bg-white p-4 rounded-lg shadow-md flex-1 flex flex-col min-h-0">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Capture Session
            </h2>
            <div className="flex-1 min-h-0">
              <CapturePanel onSessionComplete={handleSessionComplete} />
            </div>
          </div>
        )}

        {currentView === 'processing' && (
          <div className="flex-1 flex items-center justify-center">
            <UploadProgress />
          </div>
        )}

        {currentView === 'status' && (
          <div className="flex-1 flex items-center justify-center">
            <SessionStatus onNewSession={handleNewSession} />
          </div>
        )}

        {currentView !== 'form' && currentView !== 'status' && (
          <div className="mt-4 text-center flex-shrink-0">
            <button
              onClick={handleNewSession}
              className="flex items-center justify-center mx-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              <span className="text-sm">Start Over</span>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Teacher;