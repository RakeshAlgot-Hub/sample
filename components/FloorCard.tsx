import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Floor } from '@/types/property';
import { useTheme } from '@/theme/useTheme';
import { Layers, Pencil, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface FloorCardProps {
  floor: Floor;
  onUpdate: (label: string) => void;
  onRemove: () => void;
}

export default function FloorCard({ floor, onUpdate, onRemove }: FloorCardProps) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState(floor.label);

  const handleSave = () => {
    if (editingLabel.trim()) {
      onUpdate(editingLabel.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditingLabel(floor.label);
    setIsEditing(false);
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[
              styles.editInput,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            value={editingLabel}
            onChangeText={setEditingLabel}
            autoFocus
            onSubmitEditing={handleSave}
            placeholder="Floor label"
            placeholderTextColor={theme.textSecondary}
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.editButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={[
                styles.editButton,
                { backgroundColor: theme.inputBackground },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.floorInfo}>
            <View
              style={[
                styles.floorIcon,
                { backgroundColor: theme.primary + '15' },
              ]}
            >
              <Layers size={20} color={theme.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.floorLabel, { color: theme.text }]}>
              Floor {floor.label}
            </Text>
          </View>
          <View style={styles.floorActions}>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={[
                styles.actionButton,
                { backgroundColor: theme.inputBackground },
              ]}
              activeOpacity={0.7}
            >
              <Pencil size={16} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onRemove}
              style={[
                styles.actionButton,
                { backgroundColor: theme.error + '15' },
              ]}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color={theme.error} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  floorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floorIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  floorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContainer: {
    flex: 1,
    gap: 12,
  },
  editInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
