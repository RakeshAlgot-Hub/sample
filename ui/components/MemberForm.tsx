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
  onSubmit: (name: string, phone: string) => void;
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

  const handleSubmit = () => {
    if (name.trim() && phone.trim()) {
      onSubmit(name.trim(), phone.trim());
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
