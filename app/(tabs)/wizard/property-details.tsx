import { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import WizardHeader from '@/components/WizardHeader';
import WizardTopHeader from '@/components/WizardTopHeader';
import WizardFooter from '@/components/WizardFooter';
import { PropertyType } from '@/types/property';
import { Home, MapPin } from 'lucide-react-native';

const PROPERTY_TYPES: PropertyType[] = ['Hostel/PG', 'Apartment'];

export default function PropertyDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    propertyDetails,
    updatePropertyDetails,
    nextStep,
    resetWizard,
    loadWizardState,
  } = useWizardStore();

  const [name, setName] = useState(propertyDetails.name);
  const [type, setType] = useState<PropertyType | null>(propertyDetails.type);
  const [city, setCity] = useState(propertyDetails.city);

  useEffect(() => {
    loadWizardState();
  }, []);

  useEffect(() => {
    setName(propertyDetails.name);
    setType(propertyDetails.type);
    setCity(propertyDetails.city);
  }, [propertyDetails]);

  const handleClose = () => {
    resetWizard();
    router.back();
  };

  const handleNext = () => {
    updatePropertyDetails({ name, type, city });
    nextStep();
    router.push('/wizard/buildings');
  };

  const canProceed = name.trim().length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardTopHeader onBack={handleClose} title="Settings" />
      <WizardHeader
        currentStep={1}
        totalSteps={6}
        title="Property Details"
        onClose={handleClose}
        showClose
        showSteps
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
              {PROPERTY_TYPES.map((propertyType) => (
                <TouchableOpacity
                  key={propertyType}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        type === propertyType
                          ? theme.primary + '15'
                          : theme.inputBackground,
                      borderColor:
                        type === propertyType ? theme.primary : theme.inputBorder,
                    },
                  ]}
                  onPress={() => setType(propertyType)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color: type === propertyType ? theme.primary : theme.text,
                        fontWeight: type === propertyType ? '600' : '500',
                      },
                    ]}
                  >
                    {propertyType}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 15,
  },
});
