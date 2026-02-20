import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor = Colors.primary,
  iconBgColor = Colors.background.elevated,
  subtitle,
  trend,
}: MetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Icon size={20} color={iconColor} strokeWidth={2} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>

        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}

        {trend && (
          <View style={styles.trendContainer}>
            <Text
              style={[
                styles.trendText,
                { color: trend.isPositive ? Colors.success : Colors.danger },
              ]}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Text>
            <Text style={styles.trendLabel}>vs last month</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.paper,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
