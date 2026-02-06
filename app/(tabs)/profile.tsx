import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useStore } from '@/store/useStore';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { User, Mail, Moon, Sun, LogOut } from 'lucide-react-native';
import { useEffect } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, themeMode, toggleTheme, logout } = useStore();
  const {
    properties,
    activePropertyId,
    loadProperties,
    setActiveProperty,
  } = usePropertiesStore();

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSwitchProperty = (propertyId: string, propertyName: string) => {
    if (propertyId === activePropertyId) {
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        ? window.confirm(`Use "${propertyName}" as the active property?`)
        : true;

      if (confirmed) {
        void setActiveProperty(propertyId);
      }

      return;
    }

    Alert.alert(
      'Switch Property',
      `Use "${propertyName}" as the active property?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            void setActiveProperty(propertyId);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Active Property
          </Text>
          {properties.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No properties created yet.
            </Text>
          ) : (
            <View style={styles.propertyList}>
              {properties.map((property) => {
                const isActive = property.id === activePropertyId;
                return (
                  <View key={property.id} style={styles.propertyRow}>
                    <View style={styles.propertyInfo}>
                      <Text style={[styles.propertyName, { color: theme.text }]}>
                        {property.name}
                      </Text>
                      <Text style={[styles.propertyMeta, { color: theme.textSecondary }]}>
                        {property.type}
                        {property.city ? ` • ${property.city}` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.switchButton,
                        {
                          backgroundColor: isActive
                            ? theme.primary + '15'
                            : theme.inputBackground,
                          borderColor: isActive ? theme.primary : theme.inputBorder,
                        },
                      ]}
                      onPress={() => handleSwitchProperty(property.id, property.name)}
                      activeOpacity={0.8}
                      disabled={isActive}
                    >
                      <Text
                        style={[
                          styles.switchText,
                          { color: isActive ? theme.primary : theme.text },
                        ]}
                      >
                        {isActive ? 'Active' : 'Switch'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
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
    padding: 16,
    paddingBottom: 100,
    gap: 18,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 18,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  userInfo: {
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoTextContainer: {
    flex: 1,
    gap: 3,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
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
    gap: 10,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
  },
  propertyList: {
    gap: 12,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  propertyInfo: {
    flex: 1,
    gap: 4,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '600',
  },
  propertyMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchButton: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
