import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';

interface MenuOption {
  label: string;
  onPress: () => void;
}

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  options: MenuOption[];
  anchorRef: React.RefObject<View | null>;
}

export function Menu({ visible, onClose, options }: MenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === options.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => {
                onClose();
                option.onPress();
              }}>
              <Text style={styles.menuText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});
