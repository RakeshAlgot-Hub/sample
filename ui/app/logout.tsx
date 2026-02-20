import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function LogoutScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      router.replace('/(auth)/login');
    };

    performLogout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#075E54" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
