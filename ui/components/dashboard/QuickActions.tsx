import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserPlus, Home, Building, CreditCard } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface QuickAction {
  icon: React.ComponentType<any>;
  label: string;
  onPress: () => void;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={action.onPress}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: action.color + '15' },
                ]}>
                <Icon size={20} color={action.color} strokeWidth={2} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background.elevated,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
});
