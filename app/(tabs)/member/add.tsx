import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import WizardTopHeader from '@/components/WizardTopHeader';
import { AlertCircle, Camera, User, Phone, MapPin, ArrowRight } from 'lucide-react-native';
import { Image } from 'react-native';

type SelectedBed = {
  propertyId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  bedId: string;
  bedNumber?: number;
};

const formatDate = (value: Date) => value.toISOString().slice(0, 10);

export default function AddMemberScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    propertyId?: string;
    buildingId?: string;
    floorId?: string;
    roomId?: string;
    bedId?: string;
    from?: string;
  }>();
  const { properties, loadProperties } = usePropertiesStore();

  const getParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const paramPropertyId = getParam(params.propertyId);
  const paramBuildingId = getParam(params.buildingId);
  const paramFloorId = getParam(params.floorId);
  const paramRoomId = getParam(params.roomId);
  const paramBedId = getParam(params.bedId);
  const paramFrom = getParam(params.from);

  const [selectedBed, setSelectedBed] = useState<SelectedBed | null>(
    paramPropertyId && paramBuildingId && paramFloorId && paramRoomId && paramBedId
      ? {
        propertyId: paramPropertyId,
        buildingId: paramBuildingId,
        floorId: paramFloorId,
        roomId: paramRoomId,
        bedId: paramBedId,
      }
      : null
  );

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [villageName, setVillageName] = useState('');
  const [joinedDate, setJoinedDate] = useState(formatDate(new Date()));
  const [joinedDateValue, setJoinedDateValue] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [proofId, setProofId] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const today = useMemo(() => new Date(), []);
  const minJoinedDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 2);
    return date;
  }, []);
  const maxJoinedDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }, []);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (paramPropertyId && paramBuildingId && paramFloorId && paramRoomId && paramBedId) {
      setSelectedBed({
        propertyId: paramPropertyId,
        buildingId: paramBuildingId,
        floorId: paramFloorId,
        roomId: paramRoomId,
        bedId: paramBedId,
      });
    }
  }, [paramPropertyId, paramBuildingId, paramFloorId, paramRoomId, paramBedId]);

  const hasBedParams =
    Boolean(paramPropertyId) &&
    Boolean(paramBuildingId) &&
    Boolean(paramFloorId) &&
    Boolean(paramRoomId) &&
    Boolean(paramBedId);

  useEffect(() => {
    if (!selectedBed && !hasBedParams) {
      router.replace('/beds/available');
    }
  }, [selectedBed, hasBedParams, router]);

  const bedSummary = useMemo(() => {
    if (!selectedBed) {
      return null;
    }

    const property = properties.find((p) => p.id === selectedBed.propertyId);
    const building = property?.buildings.find((b) => b.id === selectedBed.buildingId);
    const floor = building?.floors.find((f) => f.id === selectedBed.floorId);
    const room = floor?.rooms.find((r) => r.id === selectedBed.roomId);
    const bedIndex = room?.beds.findIndex((b) => b.id === selectedBed.bedId) ?? -1;
    const bedNumber = selectedBed.bedNumber ?? (bedIndex >= 0 ? bedIndex + 1 : undefined);

    return {
      propertyName: property?.name ?? 'Property',
      buildingName: building?.name ?? 'Building',
      floorLabel: floor?.label ?? 'Floor',
      roomNumber: room?.roomNumber ?? 'Room',
      bedNumber: bedNumber ?? 0,
    };
  }, [selectedBed, properties]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose an option',
      [
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setJoinedDateValue(selectedDate);
      setJoinedDate(formatDate(selectedDate));
    }
  };

  const handleSubmit = async () => {
    setValidationError(null);

    if (!selectedBed) {
      setValidationError('Please select a bed.');
      return;
    }

    if (!name.trim()) {
      setValidationError('Please enter a full name.');
      return;
    }

    if (name.trim().length > 20) {
      setValidationError('Name must be 20 characters or less.');
      return;
    }

    if (!phone.trim()) {
      setValidationError('Please enter a mobile number.');
      return;
    }

    const normalizedPhone = phone.trim();
    if (!/^[0-9]{8,15}$/.test(normalizedPhone)) {
      setValidationError('Mobile number must be 8 to 15 digits.');
      return;
    }

    if (!villageName.trim()) {
      setValidationError('Please enter a village name.');
      return;
    }

    if (!joinedDate.trim() || !joinedDateValue) {
      setValidationError('Please enter a joined date.');
      return;
    }

    if (joinedDateValue < minJoinedDate || joinedDateValue > maxJoinedDate) {
      setValidationError('Joined date must be within the last 2 years and up to 1 month ahead.');
      return;
    }

    if (!proofId.trim()) {
      setValidationError('Please enter a proof ID.');
      return;
    }

    if (proofId.trim().length > 20) {
      setValidationError('Proof ID must be 20 characters or less.');
      return;
    }

    router.push({
      pathname: '/member/payment',
      params: {
        name: name.trim(),
        phone: normalizedPhone,
        villageName: villageName.trim(),
        joinedDate: joinedDate.trim(),
        proofId: proofId.trim(),
        profilePic: profilePic ?? '',
        propertyId: selectedBed.propertyId,
        buildingId: selectedBed.buildingId,
        floorId: selectedBed.floorId,
        roomId: selectedBed.roomId,
        bedId: selectedBed.bedId,
        from: paramFrom ?? '',
      },
    });
  };

  const handleBack = useCallback(() => {
    if (paramFrom === 'total' || paramFrom === 'available') {
      router.replace('/(tabs)/members');
      return;
    }

    router.back();
  }, [paramFrom, router]);

  if (!selectedBed && !hasBedParams) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <WizardTopHeader onBack={handleBack} title="Add Member" />
        <View style={styles.redirectContent}>
          <Text style={[styles.redirectText, { color: theme.textSecondary }]}>Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <WizardTopHeader onBack={handleBack} title="Add Member" />
      {selectedBed ? (
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.stepHeaderRow}>
              <View>
                <Text style={[styles.stepTitle, { color: theme.text }]}>Member Details</Text>
                <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Add profile information</Text>
              </View>
              <TouchableOpacity onPress={() => router.replace('/beds/available')} activeOpacity={0.7}>
                <Text style={[styles.linkText, { color: theme.accent }]}>Change Bed</Text>
              </TouchableOpacity>
            </View>

            {bedSummary && (
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <Text style={[styles.summaryTitle, { color: theme.text }]}>Selected Bed</Text>
                <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
                  {bedSummary.propertyName} • {bedSummary.buildingName}
                </Text>
                <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
                  Floor {bedSummary.floorLabel} • Room {bedSummary.roomNumber} • Bed {bedSummary.bedNumber}
                </Text>
              </View>
            )}

            {validationError && (
              <View
                style={[
                  styles.errorCard,
                  { backgroundColor: theme.error + '15', borderColor: theme.error },
                ]}
              >
                <AlertCircle size={18} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{validationError}</Text>
              </View>
            )}

            <View
              style={[
                styles.formCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <View style={styles.cardHeader}>
                <User size={18} color={theme.textSecondary} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Profile</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.imagePicker,
                  { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                ]}
                onPress={showImagePickerOptions}
                activeOpacity={0.7}
              >
                {profilePic ? (
                  <Image source={{ uri: profilePic }} style={styles.profileImage} />
                ) : (
                  <Camera size={28} color={theme.textSecondary} />
                )}
                <Text style={[styles.imagePickerText, { color: theme.textSecondary }]}>
                  {profilePic ? 'Change Picture' : 'Upload Picture'}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.formCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <View style={styles.cardHeader}>
                <Phone size={18} color={theme.textSecondary} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Contact</Text>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Full Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Enter full name"
                  placeholderTextColor={theme.textSecondary}
                  value={name}
                  onChangeText={setName}
                  maxLength={20}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Mobile Number *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Enter mobile number"
                  placeholderTextColor={theme.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>

            <View
              style={[
                styles.formCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <View style={styles.cardHeader}>
                <MapPin size={18} color={theme.textSecondary} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Additional</Text>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Village Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Enter village name"
                  placeholderTextColor={theme.textSecondary}
                  value={villageName}
                  onChangeText={setVillageName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Joined Date *</Text>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateText, { color: joinedDate ? theme.text : theme.textSecondary }]}
                  >
                    {joinedDate || 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={joinedDateValue ?? today}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    minimumDate={minJoinedDate}
                    maximumDate={maxJoinedDate}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Proof ID *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Enter proof ID"
                  placeholderTextColor={theme.textSecondary}
                  value={proofId}
                  onChangeText={setProofId}
                  maxLength={20}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.accent }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <ArrowRight size={18} color="#ffffff" />
              <Text style={styles.submitButtonText}>Continue to Payment</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}
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
  redirectContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  redirectText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  stepSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imagePicker: {
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  imagePickerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
