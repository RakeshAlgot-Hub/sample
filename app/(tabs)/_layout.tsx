import { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { LayoutDashboard, Home, Users, User } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import TopBar from '@/components/TopBar';
import MemberSearchModal from '@/components/MemberSearchModal';

export default function TabLayout() {
  const theme = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.card }]}>
        <TopBar onSearchPress={() => setSearchVisible(true)} />
      </SafeAreaView>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 75,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 4,
            paddingHorizontal: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ size, color }) => (
              <LayoutDashboard size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="members"
          options={{
            title: 'Members',
            tabBarIcon: ({ size, color }) => (
              <Users size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="properties"
          options={{
            href: null,
            title: 'Properties',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        {/* Hidden from tab bar but keep tabs visible on these screens */}
        <Tabs.Screen
          name="wizard"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="member"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="property"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <MemberSearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 0,
  },
});
