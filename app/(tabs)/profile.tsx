import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useStore } from '@/store/useStore';
import { User, Mail, Moon, Sun, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, themeMode, toggleTheme, logout } = useStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: theme.primary + '15' },
            ]}
          >
            <User size={48} color={theme.primary} strokeWidth={2} />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.infoRow}>
              <User size={18} color={theme.textSecondary} strokeWidth={2} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Name
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {user?.name}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <Mail size={18} color={theme.textSecondary} strokeWidth={2} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Email
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              {themeMode === 'light' ? (
                <Sun size={20} color={theme.textSecondary} strokeWidth={2} />
              ) : (
                <Moon size={20} color={theme.textSecondary} strokeWidth={2} />
              )}
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.inputBorder, true: theme.primary }}
              thumbColor={theme.background}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.accent }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={20} color="#ffffff" strokeWidth={2} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            PropertyPal v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 20,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  userInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
  },
});
