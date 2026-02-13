import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <MaterialIcons name="error-outline" size={72} color="#FF6B6B" />
        </View>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Page Not Found</Text>
        <Text style={styles.text}>
          The page you are looking for doesn't exist or has been moved.
        </Text>
        <View style={styles.buttonRow}>
          <Link href="/(auth)/login" asChild>
            <Pressable style={({ pressed }) => [styles.button, styles.loginButton, pressed && styles.buttonPressed]}>
              <Text style={styles.buttonText}>Go to Login</Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/signup" asChild>
            <Pressable style={({ pressed }) => [styles.button, styles.registerButton, pressed && styles.buttonPressed]}>
              <Text style={styles.buttonText}>Go to Register</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8F9FB',
  },
  iconWrapper: {
    marginBottom: 16,
    backgroundColor: '#FFF0F0',
    borderRadius: 48,
    padding: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#22223B',
    marginBottom: 10,
    letterSpacing: 1,
  },
  text: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 320,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22223B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 2,
  },
  loginButton: {
    backgroundColor: '#4ECDC4',
  },
  registerButton: {
    backgroundColor: '#5F6FFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
