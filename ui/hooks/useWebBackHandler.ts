import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useWebBackHandler(onBack: () => void, enabled = true) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || typeof window === 'undefined') {
      return;
    }

    // On web, call the back handler which will use router navigation
    // This ensures proper history stack management
    const handlePopState = () => {
      onBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onBack, enabled]);
}
