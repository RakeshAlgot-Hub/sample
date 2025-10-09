import React from 'react';
import { Clock, Cog, CheckCircle, Send, Heart, Image, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSessionStore } from '../stores/useSessionStore';

interface SessionStatusProps {
  onNewSession: () => void;
}

const SessionStatus: React.FC<SessionStatusProps> = ({ onNewSession }) => {
  const { currentSession } = useSessionStore();

  if (!currentSession) return null;

  const getStatusDisplay = () => {
    switch (currentSession.status) {
      case 'uploading':
        return {
          icon: <Upload className="w-6 h-6 text-blue-500" />,
          title: 'Uploading...',
          description: 'Please wait...',
          color: 'blue',
        };
      case 'queued':
        return {
          icon: <Clock className="w-6 h-6 text-yellow-500" />,
          title: 'Queued for Processing',
          description: 'Your session is in the queue...',
          color: 'yellow',
        };
      case 'processing':
        return {
          icon: <Cog className="w-6 h-6 text-blue-500 animate-spin" />,
          title: 'Processing Your Future',
          description: 'AI is generating your future image and video...',
          color: 'blue',
        };
      case 'ready':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          title: 'Session Complete!',
          description: 'Thank you for using Future Frame',
          color: 'green',
        };
      case 'published':
        return {
          icon: <Heart className="w-6 h-6 text-purple-500" />,
          title: 'Session Complete',
          description: 'Thank you for using Future Frame',
          color: 'purple',
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();
  if (!statusDisplay) return null;

  // Show simple thank you message for completed sessions
  if (currentSession.status === 'ready' || currentSession.status === 'published') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center justify-center mb-4">
            {statusDisplay.icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {statusDisplay.title}
          </h3>
          <p className="text-gray-600 mb-6">
            {statusDisplay.description}
          </p>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              Your generated content is ready! View and share all your students' future images and videos.
            </p>
            <Link
              to="/generated-content"
              className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition duration-200 text-sm font-medium"
            >
              <Image className="w-4 h-4 mr-2" />
              View Generated Content
            </Link>
          </div>
          <button
            onClick={onNewSession}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <Send className="w-5 h-5 mr-2" />
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-4">
          {statusDisplay.icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {statusDisplay.title}
        </h3>
        <p className="text-gray-600 mb-4">
          {statusDisplay.description}
        </p>
        <div className="text-sm text-gray-500">
          {currentSession.studentName} - {currentSession.studentClass}
        </div>
      </div>
    </div>
  );
};

export default SessionStatus;