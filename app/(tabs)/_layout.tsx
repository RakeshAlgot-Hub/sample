import { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { Platform } from 'react-native';
import { CreditCard, LayoutDashboard, Users } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import TopBar from '@/components/TopBar';
import MemberSearchModal from '@/components/MemberSearchModal';

export default function TabLayout() {
  const theme = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);
  const pathname = usePathname();
  const hideTopBar = pathname.includes('/member/') || pathname.includes('/wizard/') || pathname.includes('/settings') || pathname.includes('/beds/') || pathname.includes('/floors') || pathname.includes('/properties') || pathname.includes('/buildings') || pathname.includes('/rooms');
  const hideTabBar = pathname.includes('/settings') || pathname.includes('/beds/') || pathname.includes('/floors') || pathname.includes('/properties') || pathname.includes('/buildings') || pathname.includes('/rooms');

  return (
    <>
      {!hideTopBar && (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.card }]}>
          <TopBar onSearchPress={() => setSearchVisible(true)} />
        </SafeAreaView>
      )}
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
            display: hideTabBar ? 'none' : 'flex',
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
          name="payments"
          options={{
            title: 'Payments',
            tabBarIcon: ({ size, color }) => (
              <CreditCard size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            href: null,
            title: 'Settings',
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen name="settings/property-details/index" options={{ href: null }} />
        <Tabs.Screen name="settings/property-details/[id]" options={{ href: null }} />
        <Tabs.Screen name="settings/property-details/buildings" options={{ href: null }} />
        <Tabs.Screen name="settings/property-details/floors" options={{ href: null }} />
        <Tabs.Screen name="settings/property-details/rooms" options={{ href: null }} />
        <Tabs.Screen name="settings/property-details/beds" options={{ href: null }} />
        <Tabs.Screen name="settings/notifications" options={{ href: null }} />
        <Tabs.Screen name="settings/preferences" options={{ href: null }} />
        <Tabs.Screen name="settings/import-export" options={{ href: null }} />
        <Tabs.Screen name="settings/privacy-security" options={{ href: null }} />
        <Tabs.Screen name="settings/help-support" options={{ href: null }} />
        <Tabs.Screen name="settings/account" options={{ href: null }} />
        <Tabs.Screen name="beds/total" options={{ href: null }} />
        <Tabs.Screen name="beds/available" options={{ href: null }} />
        <Tabs.Screen name="floors" options={{ href: null }} />
        <Tabs.Screen name="properties" options={{ href: null }} />
        <Tabs.Screen name="buildings" options={{ href: null }} />
        <Tabs.Screen name="rooms" options={{ href: null }} />
        {/* Hidden from tab bar but keep tabs visible on these screens */}
        <Tabs.Screen
          name="wizard"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="member"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
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
