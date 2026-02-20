import { Tabs } from 'expo-router';
import {
  LayoutDashboard,
  Users,
  CreditCard,
} from 'lucide-react-native';
import { AppHeader } from '@/components/AppHeader';

export default function TabsLayout() {
  return (
    <>
      <AppHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#075E54',
          tabBarInactiveTintColor: '#8696a0',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ size, color }) => (
              <LayoutDashboard size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="members"
          options={{
            title: 'Members',
            tabBarIcon: ({ size, color }) => (
              <Users size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="payments"
          options={{
            title: 'Payments',
            tabBarIcon: ({ size, color }) => (
              <CreditCard size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
