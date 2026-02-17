import React, { useState, useMemo, FC } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/theme/useTheme';

type AddRoomModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (room: {
    roomNumber: string;
    buildingName: string;
    floorName: string | number;
    shareType: number;
    isOtherFloor: boolean;
    isOtherShareType: boolean;
  }) => Promise<void>;
  property: {
    buildings: { name: string; floors: (string | number)[] }[];
    shareTypes: number[];
  };
  existingRooms: { roomNumber: string; buildingName: string; floorName: string | number }[];
};

const AddRoomModal: FC<AddRoomModalProps> = ({ visible, onClose, onSave, property, existingRooms }) => {
  const theme = useTheme();
  const [roomNumber, setRoomNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [shareType, setShareType] = useState('');
  const [otherFloor, setOtherFloor] = useState('');
  const [otherShareType, setOtherShareType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedBuilding = useMemo(() => property.buildings.find(b => b.name === building), [building, property.buildings]);
  const floorOptions = selectedBuilding ? selectedBuilding.floors : [];
  const isOtherFloor = floor === 'Other';
  const isOtherShareType = shareType === 'Other';

  const shareTypeOptions = property.shareTypes.map(String);

  const isDuplicateRoom = useMemo(() => {
    return existingRooms.some(r =>
      r.roomNumber === roomNumber &&
      r.buildingName === building &&
      String(r.floorName) === (isOtherFloor ? otherFloor : floor)
    );
  }, [roomNumber, building, floor, otherFloor, existingRooms, isOtherFloor]);

  const isValid =
    roomNumber.trim() !== '' &&
    building &&
    ((isOtherFloor && /^\d+$/.test(otherFloor)) || (!isOtherFloor && floor)) &&
    ((isOtherShareType && /^\d+$/.test(otherShareType)) || (!isOtherShareType && shareType)) &&
    !isDuplicateRoom &&
    !submitting;

  const handleSave = async () => {
    setError('');
    setSubmitting(true);
    try {
      await onSave({
        roomNumber: roomNumber.trim(),
        buildingName: building,
        floorName: isOtherFloor ? Number(otherFloor) : floor,
        shareType: isOtherShareType ? Number(otherShareType) : Number(shareType),
        isOtherFloor,
        isOtherShareType,
      });
      setRoomNumber('');
      setBuilding('');
      setFloor('');
      setShareType('');
      setOtherFloor('');
      setOtherShareType('');
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to add room.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.card }]}> 
          <Text style={[styles.title, { color: theme.text }]}>Add Room</Text>
          <Text style={styles.label}>Room Number *</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={roomNumber}
            onChangeText={setRoomNumber}
            placeholder="Enter room number"
            keyboardType="default"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Building *</Text>
          <View style={[styles.pickerWrapper, { borderColor: theme.border }]}> 
            <Picker
              selectedValue={building}
              onValueChange={setBuilding}
              style={{ color: theme.text }}
            >
              <Picker.Item label="Select building" value="" />
              {property.buildings.map(b => (
                <Picker.Item key={b.name} label={b.name} value={b.name} />
              ))}
            </Picker>
          </View>
          {building ? (
            <>
              <Text style={styles.label}>Floor *</Text>
              <View style={[styles.pickerWrapper, { borderColor: theme.border }]}> 
                <Picker
                  selectedValue={floor}
                  onValueChange={setFloor}
                  style={{ color: theme.text }}
                >
                  <Picker.Item label="Select floor" value="" />
                  {floorOptions.map(f => (
                    <Picker.Item key={String(f)} label={String(f)} value={String(f)} />
                  ))}
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
              {isOtherFloor && (
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  value={otherFloor}
                  onChangeText={setOtherFloor}
                  placeholder="Enter floor number"
                  keyboardType="number-pad"
                />
              )}
            </>
          ) : null}
          <Text style={styles.label}>Share Type *</Text>
          <View style={[styles.pickerWrapper, { borderColor: theme.border }]}> 
            <Picker
              selectedValue={shareType}
              onValueChange={setShareType}
              style={{ color: theme.text }}
            >
              <Picker.Item label="Select share type" value="" />
              {shareTypeOptions.map(st => (
                <Picker.Item key={st} label={st} value={st} />
              ))}
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          {isOtherShareType && (
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              value={otherShareType}
              onChangeText={setOtherShareType}
              placeholder="Enter share type (integer)"
              keyboardType="number-pad"
            />
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { opacity: isValid ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!isValid}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddRoomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '92%',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    height: 44,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  error: {
    color: '#E74C3C',
    marginTop: 4,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '600',
  },
});
