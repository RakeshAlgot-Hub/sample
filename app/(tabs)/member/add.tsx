import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useMembersStore } from '@/store/useMembersStore';
import AvailableBedsList from '@/components/AvailableBedsList';
import WizardTopHeader from '@/components/WizardTopHeader';
import { CheckCircle, User, Phone, MapPin, CreditCard, Camera, AlertCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Image } from 'react-native';

export default function AddMemberScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { addMember } = useMembersStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1: Member Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [proofId, setProofId] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Step 2: Bed Assignment
  const [selectedBed, setSelectedBed] = useState<{
    propertyId: string;
    buildingId: string;
    floorId: string;
    roomId: string;
    bedId: string;
    bedCount: number;
    price?: number;
    period?: string;
  } | null>(null);
  const [bedAmount, setBedAmount] = useState('');

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

  const handleNextStep = () => {
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter a name');
      return;
    }

    if (!phone.trim()) {
      setValidationError('Please enter a phone number');
      return;
    }

    if (!address.trim()) {
      setValidationError('Please enter an address');
      return;
    }

    if (!city.trim()) {
      setValidationError('Please enter a city');
      return;
    }

    if (!pincode.trim()) {
      setValidationError('Please enter a pincode');
      return;
    }

    if (!proofId.trim()) {
      setValidationError('Please enter a proof ID');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    setValidationError(null);

    if (!selectedBed) {
      setValidationError('Please select a bed');
      return;
    }

    const parsedAmount = Number(bedAmount);
    if (!bedAmount.trim() || !Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Please enter a valid bed amount');
      return;
    }

    const newMember = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      proofId: proofId.trim(),
      profilePic,
      propertyId: selectedBed.propertyId,
      buildingId: selectedBed.buildingId,
      floorId: selectedBed.floorId,
      roomId: selectedBed.roomId,
      bedId: selectedBed.bedId,
      bedAmount: parsedAmount,
      billingPeriod: selectedBed.period,
      createdAt: new Date().toISOString(),
    };

    await addMember(newMember);

    setShowSuccess(true);
    setTimeout(() => {
      router.back();
    }, 800);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <WizardTopHeader onBack={handleBack} title="Member" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.page}>
          <View style={styles.content}>
            {step === 1 && (
              <View style={styles.stepContainer}>
                {validationError && (
                  <View style={[styles.errorBanner, { backgroundColor: theme.error + '20' }]}>
                    <AlertCircle size={18} color={theme.error} />
                    <Text style={[styles.errorText, { color: theme.error }]}>{validationError}</Text>
                  </View>
                )}

                {/* Profile Picture */}
                <View style={styles.section}>
                  <TouchableOpacity
                    style={[styles.profilePicContainer, { borderColor: theme.border }]}
                    onPress={showImagePickerOptions}
                  >
                    {profilePic ? (
                      <Image source={{ uri: profilePic }} style={styles.profilePic} />
                    ) : (
                      <View style={styles.profilePicPlaceholder}>
                        <Camera size={40} color={theme.textSecondary} />
                        <Text style={[styles.profilePicText, { color: theme.textSecondary }]}>
                          Add Photo
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Name */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    <User size={16} color={theme.textSecondary} /> Name *
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Full Name"
                    placeholderTextColor={theme.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Phone */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    <Phone size={16} color={theme.textSecondary} /> Phone Number *
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Phone"
                    placeholderTextColor={theme.textSecondary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Address */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    <MapPin size={16} color={theme.textSecondary} /> Address *
                  </Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Full address (House/Flat, Street, Area, etc.)"
                    placeholderTextColor={theme.textSecondary}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.flexInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                      placeholder="City"
                      placeholderTextColor={theme.textSecondary}
                      value={city}
                      onChangeText={setCity}
                    />
                    <TextInput
                      style={[styles.input, styles.pincodeInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                      placeholder="Pincode"
                      placeholderTextColor={theme.textSecondary}
                      value={pincode}
                      onChangeText={setPincode}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                {/* Proof ID */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    <CreditCard size={16} color={theme.textSecondary} /> ID Proof *
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Aadhar/PAN/etc."
                    placeholderTextColor={theme.textSecondary}
                    value={proofId}
                    onChangeText={setProofId}
                  />
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>Bed Assignment</Text>

                {validationError && (
                  <View style={[styles.errorBanner, { backgroundColor: theme.error + '20' }]}>
                    <AlertCircle size={18} color={theme.error} />
                    <Text style={[styles.errorText, { color: theme.error }]}>{validationError}</Text>
                  </View>
                )}

                <AvailableBedsList
                  selectedBedId={selectedBed?.bedId || null}
                  onBedSelect={(bed) => {
                    setSelectedBed({
                      propertyId: bed.propertyId,
                      buildingId: bed.buildingId,
                      floorId: bed.floorId,
                      roomId: bed.roomId,
                      bedId: bed.bedId,
                      bedCount: bed.bedCount,
                      price: bed.price,
                      period: bed.period,
                    });
                    setBedAmount(bed.price ? bed.price.toString() : '');
                  }}
                />

                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}
                  >
                    <CreditCard size={16} color={theme.textSecondary} /> Bed Amount *
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Enter amount"
                    placeholderTextColor={theme.textSecondary}
                    value={bedAmount}
                    onChangeText={(value) => setBedAmount(value.replace(/\D+/g, ''))}
                    keyboardType="number-pad"
                  />
                  {selectedBed?.period && (
                    <Text style={[styles.helperText, { color: theme.textSecondary }]}
                    >
                      Default: {selectedBed.price ?? '--'} / {selectedBed.period}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
          {/* Footer Buttons */}
          <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
            {step === 1 ? (
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: theme.primary }]}
                onPress={handleNextStep}
              >
                <Text style={styles.nextButtonText}>Next: Assign Bed</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: theme.primary }]}
                onPress={handleSubmit}
              >
                <Text style={styles.nextButtonText}>Add Member</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {showSuccess && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.successOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}
        >
          <CheckCircle size={60} color="#10b981" />
          <Text style={styles.successText}>Member added successfully!</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepIndicator: {
    fontSize: 12,
    marginTop: 2,
  },
  stepContainer: {
    paddingTop: 10,
    gap: 10,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 13,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  profilePicContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  profilePicPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  profilePicText: {
    fontSize: 12,
  },
  input: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 56,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flexInput: {
    flex: 2,
  },
  pincodeInput: {
    flex: 1,
    minWidth: 100,
  },
  footer: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
  },
  nextButton: {
    height: 46,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
});
