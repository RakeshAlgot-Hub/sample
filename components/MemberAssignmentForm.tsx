import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import BedSelector from './BedSelector';
import { User, Phone, AlertCircle, MapPin, CreditCard, Camera, Globe } from 'lucide-react-native';
import { Image } from 'react-native';

interface MemberAssignmentFormProps {
  onSubmit: (
    name: string,
    phone: string,
    houseFlatNo: string,
    streetArea: string,
    city: string,
    state: string,
    pincode: string,
    country: string,
    proofId: string,
    profilePic: string | null,
    propertyId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    bedId: string
  ) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  initialName?: string;
  initialPhone?: string;
  initialHouseFlatNo?: string;
  initialStreetArea?: string;
  initialCity?: string;
  initialState?: string;
  initialPincode?: string;
  initialCountry?: string;
  initialProofId?: string;
  initialProfilePic?: string | null;
  initialPropertyId?: string | null;
  initialBuildingId?: string | null;
  initialFloorId?: string | null;
  initialRoomId?: string | null;
  initialBedId?: string | null;
}

export default function MemberAssignmentForm({
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  initialName = '',
  initialPhone = '',
  initialPropertyId = null,
  initialBuildingId = null,
  initialFloorId = null,
  initialRoomId = null,
  initialBedId = null,
  initialHouseFlatNo = '',
  initialStreetArea = '',
  initialCity = '',
  initialState = '',
  initialPincode = '',
  initialCountry = 'India',
  initialProofId = '',
  initialProfilePic = null,
}: MemberAssignmentFormProps) {
  const theme = useTheme();
  const { properties, activePropertyId, loadProperties } = usePropertiesStore();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [houseFlatNo, setHouseFlatNo] = useState(initialHouseFlatNo);
  const [streetArea, setStreetArea] = useState(initialStreetArea);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [pincode, setPincode] = useState(initialPincode);
  const [country, setCountry] = useState(initialCountry);
  const [proofId, setProofId] = useState(initialProofId);
  const [profilePic, setProfilePic] = useState<string | null>(initialProfilePic);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    initialPropertyId
  );
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    initialBuildingId
  );
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(
    initialFloorId
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    initialRoomId
  );
  const [selectedBedId, setSelectedBedId] = useState<string | null>(initialBedId);
  const [validationError, setValidationError] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
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
    let cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take a photo.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
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
      "Select Profile Picture",
      "Choose an option",
      [
        { text: "Choose from Gallery", onPress: pickImage },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (activePropertyId) {
      setSelectedPropertyId(activePropertyId);
      return;
    }

    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, activePropertyId]);

  const handleSubmit = () => {
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter a name');
      return;
    }

    if (!phone.trim()) {
      setValidationError('Please enter a phone number');
      return;
    }

    if (!houseFlatNo.trim()) {
      setValidationError('Please enter a House/Flat number');
      return;
    }

    if (!streetArea.trim()) {
      setValidationError('Please enter a Street or Area');
      return;
    }

    if (!city.trim()) {
      setValidationError('Please enter a City');
      return;
    }

    if (!state.trim()) {
      setValidationError('Please enter a State');
      return;
    }

    if (!pincode.trim()) {
      setValidationError('Please enter a Pincode');
      return;
    }

    if (!proofId.trim()) {
      setValidationError('Please enter a proof ID');
      return;
    }

    if (!selectedPropertyId) {
      setValidationError('Please select a property');
      return;
    }

    if (!selectedBuildingId) {
      setValidationError('Please select a building');
      return;
    }

    if (!selectedFloorId) {
      setValidationError('Please select a floor');
      return;
    }

    if (!selectedRoomId) {
      setValidationError('Please select a room');
      return;
    }

    if (!selectedBedId) {
      setValidationError('Please select a bed');
      return;
    }

    onSubmit(
      name.trim(),
      phone.trim(),
      houseFlatNo.trim(),
      streetArea.trim(),
      city.trim(),
      state.trim(),
      pincode.trim(),
      country.trim(),
      proofId.trim(),
      profilePic,
      selectedPropertyId,
      selectedBuildingId,
      selectedFloorId,
      selectedRoomId,
      selectedBedId
    );
  };

  const handlePropertyChange = (propertyId: string) => {
    if (activePropertyId) {
      return;
    }

    setSelectedPropertyId(propertyId);
    setSelectedBuildingId(null);
    setSelectedFloorId(null);
    setSelectedRoomId(null);
    setSelectedBedId(null);
  };

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedFloorId(null);
    setSelectedRoomId(null);
    setSelectedBedId(null);
  };

  const handleFloorChange = (floorId: string) => {
    setSelectedFloorId(floorId);
    setSelectedRoomId(null);
    setSelectedBedId(null);
  };

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSelectedBedId(null);
  };

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const selectedBuilding = selectedProperty?.buildings.find((b) => b.id === selectedBuildingId);
  const selectedFloor = selectedBuilding?.floors.find((f) => f.id === selectedFloorId);
  const selectedRoom = selectedFloor?.rooms.find((r) => r.id === selectedRoomId);
  const selectedBedCount = selectedRoom?.bedCount ?? selectedRoom?.beds.length;
  const selectedPricing = selectedProperty?.bedPricing?.find(
    (pricing) => pricing.bedCount === selectedBedCount
  );

  const canSubmit =
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    houseFlatNo.trim().length > 0 &&
    streetArea.trim().length > 0 &&
    city.trim().length > 0 &&
    state.trim().length > 0 &&
    pincode.trim().length > 0 &&
    proofId.trim().length > 0 && // New validation
    selectedPropertyId &&
    selectedBuildingId &&
    selectedFloorId &&
    selectedRoomId &&
    selectedBedId;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {validationError && (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: theme.error + '15', borderColor: theme.error },
            ]}
          >
            <AlertCircle size={20} color={theme.error} strokeWidth={2} />
            <Text style={[styles.errorText, { color: theme.error }]}>
              {validationError}
            </Text>
          </View>
        )}

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

        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <MapPin size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>Address</Text>
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
            placeholder="House/Flat No."
            placeholderTextColor={theme.textSecondary}
            value={houseFlatNo}
            onChangeText={setHouseFlatNo}
            autoCapitalize="words"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="Street or Area"
            placeholderTextColor={theme.textSecondary}
            value={streetArea}
            onChangeText={setStreetArea}
            autoCapitalize="words"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="City"
            placeholderTextColor={theme.textSecondary}
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="State"
            placeholderTextColor={theme.textSecondary}
            value={state}
            onChangeText={setState}
            autoCapitalize="words"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="Pincode"
            placeholderTextColor={theme.textSecondary}
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
          />
          <View style={styles.labelContainer}>
            <Globe size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>Country</Text>
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
            placeholder="Country"
            placeholderTextColor={theme.textSecondary}
            value={country}
            onChangeText={setCountry}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <CreditCard size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>Proof ID</Text>
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
            placeholder="Enter proof ID number"
            placeholderTextColor={theme.textSecondary}
            value={proofId}
            onChangeText={setProofId}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Camera size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>
              Profile Picture
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.imagePickerButton,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
              },
            ]}
            onPress={showImagePickerOptions}
            activeOpacity={0.7}
          >
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profileImage} />
            ) : (
              <Camera size={30} color={theme.textSecondary} strokeWidth={1.5} />
            )}
            <Text
              style={[styles.imagePickerText, { color: theme.textSecondary }]}
            >
              {profilePic ? 'Change Picture' : 'Upload Picture'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Bed Assignment
        </Text>

        <BedSelector
          selectedPropertyId={selectedPropertyId}
          selectedBuildingId={selectedBuildingId}
          selectedFloorId={selectedFloorId}
          selectedRoomId={selectedRoomId}
          selectedBedId={selectedBedId}
          onPropertyChange={handlePropertyChange}
          onBuildingChange={handleBuildingChange}
          onFloorChange={handleFloorChange}
          onRoomChange={handleRoomChange}
          onBedChange={setSelectedBedId}
        />

        {selectedPricing && selectedBedCount ? (
          <View
            style={[
              styles.pricingSummary,
              { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
            ]}
          >
            <CreditCard size={16} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.pricingText, { color: theme.text }]}
            >
              {selectedPricing.price} / {selectedPricing.period} per bed ({selectedBedCount} beds)
            </Text>
          </View>
        ) : null}

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
  errorCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    gap: 12,
  },
  pricingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  pricingText: {
    fontSize: 13,
    fontWeight: '600',
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
  divider: {
    height: 1,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  imagePickerButton: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
