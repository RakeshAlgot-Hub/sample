import React, { useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePushNotificationStore } from '../../stores/usePushNotificationStore';
import { useToast } from '../UI/ToastContainer';

interface PushNotificationButtonProps {
  publicKey?: string;
  className?: string;
}

const PushNotificationButton: React.FC<PushNotificationButtonProps> = ({
  publicKey = import.meta.env.VITE_PUSH_PUBLIC_KEY || '',
  className = ''
}) => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    initialize,
    subscribe,
    unsubscribe,
    clearError
  } = usePushNotificationStore();

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isSupported) {
      initialize();
    }
  }, [initialize, isSupported]);

  useEffect(() => {
    if (error) {
      showError('Notification Error', error);
      clearError();
    }
  }, [error, showError, clearError]);

  const handleToggleNotifications = async () => {
    if (!publicKey) {
      showError('Configuration Error', 'Push notification public key not configured');
      return;
    }

    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        showSuccess('Notifications Disabled', 'Push notifications have been disabled. Refresh the page to re-enable.');
      }
    } else {
      const success = await subscribe(publicKey);
      if (success) {
        showSuccess('Notifications Enabled', 'You will now receive push notifications');
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <BellOff className="w-4 h-4 mr-1" />
        <span>Blocked</span>
      </div>
    );
  }

  const defaultClassName = `
    inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium
    transition-all duration-200 border
    ${isSubscribed 
      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
    }
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim();

  return (
    <motion.button
      onClick={handleToggleNotifications}
      disabled={isLoading}
      className={className || defaultClassName}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : isSubscribed ? (
        <Bell className="w-4 h-4 mr-2" />
      ) : (
        <BellOff className="w-4 h-4 mr-2" />
      )}
      <span>
        {isLoading ? 'Loading...' : isSubscribed ? 'Notifications On' : 'Enable Notifications'}
      </span>
    </motion.button>
  );
};

export default PushNotificationButton;