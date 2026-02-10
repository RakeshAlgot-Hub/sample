import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import WizardHeader from '@/components/WizardHeader';
import WizardTopHeader from '@/components/WizardTopHeader';
import WizardFooter from '@/components/WizardFooter';
import { PropertyType } from '@/types/property';
import { Home, MapPin } from 'lucide-react-native';

const PROPERTY_TYPES: { type: PropertyType; disabled?: boolean; label?: string }[] = [
  { type: 'Hostel/PG' },
  { type: 'Apartments', disabled: true, label: 'Upcoming' },
];

export default function PropertyDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const {
    propertyDetails,
    updatePropertyDetails,
    nextStep,
    resetWizard,
    loadWizardState,
    editingPropertyId,
  } = useWizardStore();

  const [name, setName] = useState(propertyDetails.name);
  const [type, setType] = useState<PropertyType | null>(propertyDetails.type || 'Hostel/PG');
  const [city, setCity] = useState(propertyDetails.city);
  const [area, setArea] = useState(propertyDetails.area || '');

  const isEditing = mode === 'edit' || Boolean(editingPropertyId);

  useEffect(() => {
    if (!isEditing) {
      loadWizardState();
    }
  }, [isEditing, loadWizardState]);

  useEffect(() => {
    setName(propertyDetails.name);
    setType(propertyDetails.type || 'Hostel/PG');
    setCity(propertyDetails.city);
    setArea(propertyDetails.area || '');
  }, [propertyDetails]);

  const handleClose = useCallback(() => {
    resetWizard();
    if (editingPropertyId) {
      router.replace({
        pathname: '/settings/property-details/[id]',
        params: { id: editingPropertyId },
      });
      return;
    }
    router.replace('/(tabs)');
  }, [resetWizard, router, editingPropertyId]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleClose();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [handleClose]),
  );

  const handleNext = () => {
    updatePropertyDetails({ name, type, city, area });
    nextStep();
    router.push('/wizard/buildings');
  };

  const canProceed = name.trim().length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardTopHeader
        onBack={handleClose}
        title="Property Details"
        rightAction="close"
        onClose={handleClose}
      />
      <WizardHeader
        currentStep={1}
        totalSteps={6}
        title="Property Details"
        onClose={handleClose}
        showClose={false}
        showSteps
        showTitle={false}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Home size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.label, { color: theme.text }]}>
                Property Name
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
              placeholder="Enter property name"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Home size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.label, { color: theme.text }]}>
                Property Type
              </Text>
            </View>
            <View style={styles.typeContainer}>
              {PROPERTY_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        type === item.type
                          ? theme.primary + '15'
                          : theme.inputBackground,
                      borderColor:
                        type === item.type ? theme.primary : theme.inputBorder,
                      opacity: isEditing || item.disabled ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => !item.disabled && setType(item.type)}
                  disabled={isEditing || item.disabled}
                  activeOpacity={0.7}
                >
                  <View style={styles.typeButtonContent}>
                    {item.label && (
                      <Text style={[styles.upcomingLabel, { color: theme.textSecondary }]}>
                        {item.label}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.typeText,
                        {
                          color: type === item.type ? theme.primary : theme.text,
                          fontWeight: type === item.type ? '600' : '500',
                        },
                      ]}
                    >
                      {item.type}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {isEditing && (
              <Text style={[styles.helperText, { color: theme.textSecondary }]}
              >
                Property type is locked for existing properties.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <MapPin size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.label, { color: theme.text }]}>City</Text>
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
              placeholder="Enter city"
              placeholderTextColor={theme.textSecondary}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <MapPin size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.label, { color: theme.text }]}>Area</Text>
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
              placeholder="Enter area"
              placeholderTextColor={theme.textSecondary}
              value={area}
              onChangeText={setArea}
              autoCapitalize="words"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardFooter
        onNext={handleNext}
        nextDisabled={!canProceed}
        showBack={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  required: {
    fontSize: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    height: 58,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeButtonContent: {
    alignItems: 'center',
    gap: 2,
  },
  upcomingLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeText: {
    fontSize: 15,
  },
  helperText: {
    fontSize: 13,
  },
});
