import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { User, Phone } from 'lucide-react-native';

interface MemberFormProps {
  onSubmit: (member: {
    name: string;
    phone: string;
    propertyId?: string;
    buildingId?: string;
    floorId?: string;
    roomId?: string;
    bedId?: string;
    villageName?: string;
    joinedDate?: string;
    proofId?: string;
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function MemberForm({
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: MemberFormProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [bedId, setBedId] = useState('');
  const [villageName, setVillageName] = useState('');
  const [joinedDate, setJoinedDate] = useState('');
  const [proofId, setProofId] = useState('');

  const handleSubmit = () => {
    if (name.trim() && phone.trim()) {
      onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        propertyId: propertyId.trim() || undefined,
        buildingId: buildingId.trim() || undefined,
        floorId: floorId.trim() || undefined,
        roomId: roomId.trim() || undefined,
        bedId: bedId.trim() || undefined,
        villageName: villageName.trim() || undefined,
        joinedDate: joinedDate.trim() || undefined,
        proofId: proofId.trim() || undefined,
      });
    }
  };

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <User size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>
              Name
              <Text style={[styles.required, { color: theme.accent }]}>
                {' '}
                *
              </Text>
            </Text>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="Enter member name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Phone size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>
              Phone Number
              <Text style={[styles.required, { color: theme.accent }]}>
                {' '}
                *
              </Text>
            </Text>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="Enter phone number"
            placeholderTextColor={theme.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Assignment fields (simple text inputs, replace with dropdowns/selectors as needed) */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Property ID</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Property ID"
            placeholderTextColor={theme.textSecondary}
            value={propertyId}
            onChangeText={setPropertyId}
          />
        </View>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Building ID</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Building ID"
            placeholderTextColor={theme.textSecondary}
            value={buildingId}
            onChangeText={setBuildingId}
          />
        </View>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Floor ID</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Floor ID"
            placeholderTextColor={theme.textSecondary}
            value={floorId}
            onChangeText={setFloorId}
          />
        </View>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Room ID</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Room ID"
            placeholderTextColor={theme.textSecondary}
            value={roomId}
            onChangeText={setRoomId}
          />
        </View>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Bed ID</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Bed ID"
            placeholderTextColor={theme.textSecondary}
            value={bedId}
            onChangeText={setBedId}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Village Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Village Name"
            placeholderTextColor={theme.textSecondary}
            value={villageName}
            onChangeText={setVillageName}
          />
        </View>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Joined Date</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textSecondary}
            value={joinedDate}
            onChangeText={setJoinedDate}
          />
        </View>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Proof ID</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Proof ID"
            placeholderTextColor={theme.textSecondary}
            value={proofId}
            onChangeText={setProofId}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: canSubmit ? theme.accent : theme.inputBorder,
              },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>{submitLabel}</Text>
          </TouchableOpacity>

          {onCancel && (
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
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    fontSize: 16,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
