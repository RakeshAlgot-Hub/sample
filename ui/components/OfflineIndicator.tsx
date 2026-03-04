import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTheme } from '@/context/ThemeContext';

export function OfflineIndicator() {
  const isOnline = useNetworkStatus();
  const { colors } = useTheme();

  if (isOnline) {
    return null;
  }

  return (
    <View style={[styles.container, { borderBottomColor: colors.border.medium }]}> 
      <WifiOff size={14} color={colors.text.secondary} />
      <Text style={[styles.text, { color: colors.text.secondary }]}>You are offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
