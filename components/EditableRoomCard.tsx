import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { DoorOpen, Trash2, Pencil, Check, X, Bed } from 'lucide-react-native';
import { ShareType } from '@/types/property';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface EditableRoomCardProps {
  roomNumber: string;
  shareType: ShareType;
  onUpdate: (newRoomNumber: string) => void;
  onRemove: () => void;
}

const getShareTypeLabel = (shareType: ShareType): string => {
  return shareType.charAt(0).toUpperCase() + shareType.slice(1);
};

const getBedCount = (shareType: ShareType): number => {
  switch (shareType) {
    case 'single':
      return 1;
    case 'double':
      return 2;
    case 'triple':
      return 3;
    default:
      return 0;
  }
};

export default function EditableRoomCard({
  roomNumber,
  shareType,
  onUpdate,
  onRemove,
}: EditableRoomCardProps) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(roomNumber);

  const handleSave = () => {
    if (editValue.trim() && editValue !== roomNumber) {
      onUpdate(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(roomNumber);
    setIsEditing(false);
  };

  const bedCount = getBedCount(shareType);

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
      <View style={styles.roomInfo}>
        <View
          style={[styles.roomIcon, { backgroundColor: theme.primary + '15' }]}
        >
          <DoorOpen size={20} color={theme.primary} strokeWidth={2} />
        </View>
        <View style={styles.roomDetails}>
          {isEditing ? (
            <TextInput
              style={[
                styles.editInput,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
              onSubmitEditing={handleSave}
              keyboardType="default"
            />
          ) : (
            <Text style={[styles.roomNumber, { color: theme.text }]}>
              Room {roomNumber}
            </Text>
          )}
          <View style={styles.shareTypeContainer}>
            <Text style={[styles.shareType, { color: theme.textSecondary }]}>
              {getShareTypeLabel(shareType)}
            </Text>
            <View style={styles.bedPreview}>
              {Array.from({ length: bedCount }).map((_, index) => (
                <Bed
                  key={index}
                  size={14}
                  color={theme.textSecondary}
                  strokeWidth={2}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        {isEditing ? (
          <>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.actionButton, { backgroundColor: theme.success + '15' }]}
              activeOpacity={0.7}
            >
              <Check size={16} color={theme.success} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.actionButton, { backgroundColor: theme.inputBackground }]}
              activeOpacity={0.7}
            >
              <X size={16} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={[styles.actionButton, { backgroundColor: theme.inputBackground }]}
              activeOpacity={0.7}
            >
              <Pencil size={16} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onRemove}
              style={[styles.actionButton, { backgroundColor: theme.error + '15' }]}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color={theme.error} strokeWidth={2} />
            </TouchableOpacity>
          </>
        )}
      </View>
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
  roomInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomDetails: {
    flex: 1,
    gap: 4,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  editInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  shareTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareType: {
    fontSize: 14,
    fontWeight: '500',
  },
  bedPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  actions: {
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
});
