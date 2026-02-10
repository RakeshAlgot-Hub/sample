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
import { CheckCircle, X } from 'lucide-react-native';

interface FloorConfirmationModalProps {
  visible: boolean;
  buildingName: string;
  selectedFloors: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function FloorConfirmationModal({
  visible,
  buildingName,
  selectedFloors,
  onConfirm,
  onCancel,
}: FloorConfirmationModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: '#00000080' }]}>
        <SafeAreaView style={styles.container}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.background },
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>
                Confirm Floors
              </Text>
              <TouchableOpacity
                onPress={onCancel}
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
              <View style={styles.messageContainer}>
                <CheckCircle size={40} color={theme.success} strokeWidth={2} />
                <Text style={[styles.message, { color: theme.text }]}>
                  Adding {selectedFloors.length} floor
                  {selectedFloors.length !== 1 ? 's' : ''} to {buildingName}
                </Text>
              </View>

              <View style={styles.floorsList}>
                <Text style={[styles.floorsLabel, { color: theme.textSecondary }]}>
                  Selected floors:
                </Text>
                <View style={styles.floorsChips}>
                  {selectedFloors.map((floor, index) => (
                    <View
                      key={index}
                      style={[
                        styles.chip,
                        { backgroundColor: theme.primary + '15' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: theme.primary },
                        ]}
                      >
                        {floor}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: theme.inputBackground },
                ]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.accent }]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  modalContent: {
    marginHorizontal: 20,
    borderRadius: 16,
    maxHeight: '80%',
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
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
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
    paddingVertical: 24,
    gap: 24,
  },
  messageContainer: {
    alignItems: 'center',
    gap: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  floorsList: {
    gap: 12,
  },
  floorsLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  floorsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
