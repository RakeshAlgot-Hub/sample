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
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  header: {
    marginBottom: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
});
