import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import { Home } from 'lucide-react-native';

export default function SplashScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, isLoading, initializeAuth, initializeTheme } =
    useStore();

  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const initialize = async () => {
      await initializeTheme();
      await initializeAuth();
    };

    initialize();

    scale.value = withSequence(
      withTiming(1.1, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 200 })
    );

    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
        >
          <Home size={64} color={theme.background} strokeWidth={2} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>PropertyPal</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
          Smart Property Management
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});
