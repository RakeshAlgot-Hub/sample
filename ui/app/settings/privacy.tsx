import { View, Text, StyleSheet } from 'react-native';
import { Header } from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';

export default function PrivacyScreen() {
  const { colors, fonts } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <Header title="Privacy" showBack />
      <View style={styles.content}>
        <Text style={[styles.text, { fontSize: fonts.size.lg, fontWeight: fonts.weight.semiBold, color: colors.text.secondary }]}>
          Privacy – Upcoming
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
  },
});
