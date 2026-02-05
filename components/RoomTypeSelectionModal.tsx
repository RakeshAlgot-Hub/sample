import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { X, Bed, CheckCircle2 } from 'lucide-react-native';
import { RoomType } from './RoomTypeSelector';

interface RoomTypeSelectionModalProps {
  visible: boolean;
  roomNumber: string;
  availableTypes: RoomType[];
  selectedType: RoomType | null;
  onSelect: (type: RoomType) => void;
  onClose: () => void;
}

export default function RoomTypeSelectionModal({
  visible,
  roomNumber,
  availableTypes,
  selectedType,
  onSelect,
  onClose,
}: RoomTypeSelectionModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: '#00000080' }]}>
        <SafeAreaView style={styles.container}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <View
              style={[styles.header, { borderBottomColor: theme.border }]}
            >
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Select Room Type
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Room {roomNumber}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.inputBackground },
                ]}
                activeOpacity={0.7}
              >
                <X size={24} color={theme.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.typesList}>
                {availableTypes.map((type) => {
                  const isSelected = selectedType?.id === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeCard,
                        {
                          backgroundColor: isSelected
                            ? theme.primary + '15'
                            : theme.card,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.cardBorder,
                        },
                      ]}
                      onPress={() => {
                        onSelect(type);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.typeInfo}>
                        <Text
                          style={[
                            styles.typeLabel,
                            {
                              color: isSelected ? theme.primary : theme.text,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                        >
                          {type.label}
                        </Text>
                        <View style={styles.bedsContainer}>
                          {Array.from({ length: type.bedCount }).map(
                            (_, index) => (
                              <Bed
                                key={index}
                                size={16}
                                color={
                                  isSelected ? theme.primary : theme.textSecondary
                                }
                                strokeWidth={2}
                              />
                            )
                          )}
                          <Text
                            style={[
                              styles.bedCountText,
                              {
                                color: isSelected
                                  ? theme.primary
                                  : theme.textSecondary,
                              },
                            ]}
                          >
                            {type.bedCount} {type.bedCount === 1 ? 'Bed' : 'Beds'}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <CheckCircle2
                          size={24}
                          color={theme.primary}
                          strokeWidth={2}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  typesList: {
    gap: 12,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  typeInfo: {
    flex: 1,
    gap: 8,
  },
  typeLabel: {
    fontSize: 16,
  },
  bedsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bedCountText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
