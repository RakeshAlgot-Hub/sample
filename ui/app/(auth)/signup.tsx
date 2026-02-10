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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import { Home, User, Mail, Lock, Smartphone } from 'lucide-react-native';
import * as Application from 'expo-application';

export default function SignupScreen() {
  const router = useRouter();
  const theme = useTheme();
  const signup = useStore((state) => state.signup);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceMetaData, setDeviceMetaData] = useState<{
    deviceId: string;
    platform: string;
    appVersion: string;
  } | null>(null);

  useEffect(() => {
    if (__DEV__) {
      setFullName('Test User');
      setEmail('testuser@gmail.com');
      setPassword('asdfgh');
      setConfirmPassword('asdfgh');
    }
    async function getDeviceData() {
      // Ensure Application.getInstallationIdAsync() is called correctly
      let deviceId: string | null = null;
      if (Platform.OS === 'ios') {
        deviceId = await Application.getIosIdForVendorAsync();
      } else if (Platform.OS === 'android') {
        deviceId = await Application.getAndroidId();
      } else {
        deviceId = 'web-device-' + Math.random().toString(36).substring(2, 15);
      }

      const appVersion = Application.nativeApplicationVersion || 'unknown';
      setDeviceMetaData({
        deviceId: deviceId || 'unknown', // Provide a fallback if deviceId is null
        platform: Platform.OS,
        appVersion,
      });
    }
    getDeviceData();
  }, []);

  const handleSignup = async () => {
    setError('');

    if (!fullName || !password || !confirmPassword || (!email && !phoneNumber)) {
      setError('Please fill in all required fields (Full Name, Password, and either Email or Phone Number)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!deviceMetaData || !deviceMetaData.deviceId) {
      setError('Device information is not available. Please try again.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(
        fullName.trim(),
        email.trim() || undefined,
        phoneNumber.trim() || undefined,
        password,
        deviceMetaData
      );
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: theme.primary },
            ]}
          >
            <Home size={48} color={theme.background} strokeWidth={2} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign up to get started
          </Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: theme.error + '15' }]}>
              <Text style={[styles.errorText, { color: theme.error }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <User size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Full Name
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Mail size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Email (Optional)
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Smartphone size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Phone Number (Optional)
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.textSecondary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoComplete="tel"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Lock size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Password
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Create a password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Lock size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Confirm Password
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Confirm your password"
              placeholderTextColor={theme.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent }]}
            onPress={handleSignup}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.link, { color: theme.primary }]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 20,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});