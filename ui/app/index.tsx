import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Building2, Eye, EyeOff } from 'lucide-react-native';
import { spacing, typography, radius, shadows } from '@/theme';

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/apiClient';
import { tokenStorage } from '@/services/tokenStorage';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  useEffect(() => {
    if (!lockoutTimer || lockoutTimer <= 0) {
      setIsLockedOut(false);
      return;
    }

    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev && prev > 1) {
          return prev - 1;
        } else {
          setIsLockedOut(false);
          return null;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await authService.login({ email: email.trim(), password });
      if (response?.data?.tokens) {
        await Promise.all([
          tokenStorage.setAccessToken(response.data.tokens.accessToken),
          tokenStorage.setRefreshToken(response.data.tokens.refreshToken),
          tokenStorage.setTokenExpiry(response.data.tokens.expiresAt),
        ]);

        login(response.data.user);
        return;
      }

      setError('Login failed. Please try again.');
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed. Please try again.';
      setError(errorMessage);

      // Check if it's a rate limit error (429)
      const status = err?.details?.status || err?.status;
      if (status === 429 || errorMessage.includes('Too many failed')) {
        setIsLockedOut(true);
        // Extract minutes from error message or default to 10
        const minutesMatch = errorMessage.match(/(\d+)\s*minutes?/);
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 10;
        setLockoutTimer(minutes * 60);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary[50] }]}>
              <Building2 size={48} color={colors.primary[500]} />
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>Hostel Manager</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Owner Dashboard</Text>
          </View>

          <View style={styles.formContainer}>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: isLockedOut ? colors.danger[50] : colors.warning[50], borderColor: isLockedOut ? colors.danger[200] : colors.warning[200] }]}>
                <Text style={[styles.errorText, { color: isLockedOut ? colors.danger[700] : colors.warning[700] }]}>
                  {error}
                </Text>
                {lockoutTimer && (
                  <Text style={[styles.errorText, { color: isLockedOut ? colors.danger[700] : colors.warning[700], marginTop: 4 }]}>
                    Try again in {Math.floor(lockoutTimer / 60)}:{(lockoutTimer % 60).toString().padStart(2, '0')} minutes
                  </Text>
                )}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.white, color: colors.text.primary, borderColor: colors.border.medium }]}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                editable={!loading && !isLockedOut}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: colors.white, color: colors.text.primary, borderColor: colors.border.medium }]}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholderTextColor={colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading && !isLockedOut}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading || isLockedOut}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.text.tertiary} />
                  ) : (
                    <Eye size={20} color={colors.text.tertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary[500], opacity: loading || isLockedOut ? 0.6 : 1 }]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading || isLockedOut}>
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={[styles.actionButtonText, { color: colors.white }]}>
                  {isLockedOut ? 'Account Locked' : 'Login'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/register' as any)}
              activeOpacity={0.7}
              disabled={loading || isLockedOut}>
              <Text style={[styles.registerLinkText, { color: colors.text.secondary }]}>
                Don't have an account?{' '}
                <Text style={[styles.registerLinkBold, { color: colors.primary[500] }]}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    borderWidth: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingRight: 50,
    fontSize: typography.fontSize.md,
    borderWidth: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    borderTopWidth: 1,
  },
  dividerText: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -15 }],
    backgroundColor: 'white',
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  errorContainer: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  actionButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  registerLinkText: {
    fontSize: typography.fontSize.sm,
  },
  registerLinkBold: {
    fontWeight: typography.fontWeight.semibold,
  },
});
