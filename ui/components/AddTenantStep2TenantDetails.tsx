import React, { useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { ArrowRight, Info, Camera, ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { UnitResponse } from '@/services/unitService';
import { Colors } from '@/constants/Colors';
import { Fonts, Spacing, BorderRadius } from '@/constants/Theme';

export interface TenantForm {
  fullName: string;
  phoneNumber: string;
  address: string;
  documentId: string;
  profilePictureUrl: string;
  profilePictureFile?: any;
  checkInDate: string;
  depositAmount: string;
  rentType: 'monthly' | 'daywise';
  nextDueDate: string;
  status?: 'stay' | 'vacate';
}

export interface PaymentStatusForm {
  paymentStatus: 'paid' | 'due';
}

interface Step2Props {
  tenant: TenantForm;
  setTenant: (t: TenantForm) => void;
  paymentStatus: 'paid' | 'due';
  setPaymentStatus: (status: 'paid' | 'due') => void;
  onNext: () => void;
  onBack: () => void;
  selectedUnit: UnitResponse | null;
  loading: boolean;
  showNextButton?: boolean;
  nextButtonLabel?: string;
  nextButtonDisabled?: boolean;
}

export function Step2TenantDetails({
  tenant,
  setTenant,
  paymentStatus,
  setPaymentStatus,
  onNext,
  onBack,
  selectedUnit,
  loading,
  showNextButton = true,
  nextButtonLabel = 'Continue',
  nextButtonDisabled,
}: Step2Props) {
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const requiredFields: (keyof TenantForm)[] = [
    'fullName',
    'phoneNumber',
    'address',
    'documentId',
    'checkInDate',
    'depositAmount',
    'rentType',
    'nextDueDate',
    // 'status',
  ];
  // Calculate nextDueDate when checkInDate or rentType changes
  React.useEffect(() => {
    if (!tenant.checkInDate) return;
    if (paymentStatus === 'due') {
      // If due, nextDueDate defaults to checkInDate (editable)
      if (tenant.nextDueDate !== tenant.checkInDate) {
        setTenant({ ...tenant, nextDueDate: tenant.checkInDate });
      }
    } else {
      // If paid, nextDueDate is calculated as per rentType
      if (!tenant.rentType) return;
      let nextDue = '';
      const checkIn = new Date(tenant.checkInDate);
      if (tenant.rentType === 'monthly') {
        const d = new Date(checkIn);
        d.setMonth(d.getMonth() + 1);
        nextDue = d.toISOString().split('T')[0];
      } else if (tenant.rentType === 'daywise') {
        const d = new Date(checkIn);
        d.setDate(d.getDate() + 1);
        nextDue = d.toISOString().split('T')[0];
      }
      if (tenant.nextDueDate !== nextDue) {
        setTenant({ ...tenant, nextDueDate: nextDue });
      }
    }
  }, [tenant.checkInDate, tenant.rentType, paymentStatus]);
            {/* Payment Status Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Status *</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                {['paid', 'due'].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: paymentStatus === opt ? Colors.primary : Colors.border.medium,
                      backgroundColor: paymentStatus === opt ? Colors.primary : Colors.background.paper,
                      marginRight: 8,
                    }}
                    onPress={() => setPaymentStatus(opt as 'paid' | 'due')}
                    disabled={loading}
                  >
                    <Text style={{ color: paymentStatus === opt ? Colors.background.paper : Colors.text.primary }}>
                      {opt === 'paid' ? 'Paid' : 'Due'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
  // Rent Type selection
  const rentTypeOptions: Array<{ label: string; value: 'monthly' | 'daywise' }> = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Daywise', value: 'daywise' },
  ];

  // Status selection removed for creation
// ...existing code...
// Insert these inside the <View style={styles.form}> ... </View> block, after deposit amount input
// ...existing code...

  const isValid = requiredFields.every((f) => tenant[f]);

  const handleChange = (field: keyof TenantForm, value: string) => {
    setTenant({ ...tenant, [field]: value });
    setTouched({ ...touched, [field]: true });
  };

  const getBedInfo = () => {
    if (!selectedUnit) return null;
    const building =
      ('buildingName' in selectedUnit
        ? (selectedUnit as any).buildingName
        : undefined) || selectedUnit.buildingId;
    const floor =
      ('floorName' in selectedUnit ? (selectedUnit as any).floorName : undefined) ||
      selectedUnit.floorId;
    const room =
      ('roomNumber' in selectedUnit
        ? (selectedUnit as any).roomNumber
        : undefined) || selectedUnit.roomId;
    return { building, floor, room, bed: selectedUnit.bedNumber };
  };

  const bedInfo = getBedInfo();

  const pickImage = async (fromCamera: boolean) => {
    try {
      let result;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Photo library permission is required to select photos');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        handleChange('profilePictureUrl', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    handleChange('profilePictureUrl', '');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tenant Details</Text>
          {bedInfo && (
            <View style={styles.bedInfoCompact}>
              <Text style={styles.bedInfoText}>
                Building {bedInfo.building} • Floor {bedInfo.floor} • Room {bedInfo.room} • Bed {bedInfo.bed}
              </Text>
              <TouchableOpacity onPress={onBack} disabled={loading}>
                <Text style={styles.changeBedLink}>Change</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={[styles.input, !tenant.fullName && touched.fullName && styles.inputError]}
                  value={tenant.fullName}
                  onChangeText={(v) => handleChange('fullName', v)}
                  editable={!loading}
                  placeholder="Full name"
                  placeholderTextColor={Colors.text.hint}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={[styles.input, !tenant.phoneNumber && touched.phoneNumber && styles.inputError]}
                  value={tenant.phoneNumber}
                  onChangeText={(v) => handleChange('phoneNumber', v)}
                  editable={!loading}
                  placeholder="Phone"
                  placeholderTextColor={Colors.text.hint}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, !tenant.address && touched.address && styles.inputError]}
                  value={tenant.address}
                  onChangeText={(v) => handleChange('address', v)}
                  editable={!loading}
                  placeholder="Full address"
                  placeholderTextColor={Colors.text.hint}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Document ID *</Text>
                <TextInput
                  style={[styles.input, !tenant.documentId && touched.documentId && styles.inputError]}
                  value={tenant.documentId}
                  onChangeText={(v) => handleChange('documentId', v)}
                  editable={!loading}
                  placeholder="Aadhar/Passport"
                  placeholderTextColor={Colors.text.hint}
                />
              </View>
            </View>

            {tenant.profilePictureUrl ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: tenant.profilePictureUrl }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage} disabled={loading}>
                  <X size={16} color={Colors.background.paper} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePickerRow}>
                <TouchableOpacity style={styles.imagePickerButtonCompact} onPress={() => pickImage(true)} disabled={loading}>
                  <Camera size={18} color={Colors.primary} />
                  <Text style={styles.imagePickerButtonTextCompact}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerButtonCompact} onPress={() => pickImage(false)} disabled={loading}>
                  <ImageIcon size={18} color={Colors.primary} />
                  <Text style={styles.imagePickerButtonTextCompact}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>

            <View style={styles.row}>
              <View style={[styles.col, { flex: 1 }]}>
                <Text style={styles.label}>Check-in Date *</Text>
                <TouchableOpacity
                  style={[styles.input, !tenant.checkInDate && touched.checkInDate && styles.inputError, { justifyContent: 'center' }]}
                  onPress={() => setShowDatePicker(true)}
                  disabled={loading}>
                  <Text style={{ color: tenant.checkInDate ? Colors.text.primary : Colors.text.hint, fontSize: Fonts.size.sm }}>
                    {tenant.checkInDate || 'Date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={tenant.checkInDate ? new Date(tenant.checkInDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event: DateTimePickerEvent, date?: Date | undefined) => {
                      setShowDatePicker(false);
                      if (date) handleChange('checkInDate', date.toISOString().split('T')[0]);
                    }}
                  />
                )}
              </View>

              <View style={[styles.col, { flex: 1 }]}>
                <Text style={styles.label}>Deposit Amount *</Text>
                <TextInput
                  style={[styles.input, !tenant.depositAmount && touched.depositAmount && styles.inputError]}
                  value={tenant.depositAmount}
                  onChangeText={(v) => handleChange('depositAmount', v)}
                  editable={!loading}
                  placeholder="Amount"
                  placeholderTextColor={Colors.text.hint}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Rent Type *</Text>
                <View style={styles.optionsRow}>
                  {rentTypeOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionButton, tenant.rentType === opt.value && styles.optionButtonActive]}
                      onPress={() => handleChange('rentType', opt.value)}
                      disabled={loading}>
                      <Text style={[styles.optionText, tenant.rentType === opt.value && styles.optionTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Payment Status *</Text>
                <View style={styles.optionsRow}>
                  {['paid', 'due'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.optionButton, paymentStatus === opt && styles.optionButtonActive]}
                      onPress={() => setPaymentStatus(opt as 'paid' | 'due')}
                      disabled={loading}>
                      <Text style={[styles.optionText, paymentStatus === opt && styles.optionTextActive]}>
                        {opt === 'paid' ? 'Paid' : 'Due'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Next Due Date *</Text>
                <TouchableOpacity
                  style={[styles.input, !tenant.nextDueDate && touched.nextDueDate && styles.inputError, { justifyContent: 'center' }]}
                  onPress={() => setShowDatePicker(true)}
                  disabled={loading}>
                  <Text style={{ color: tenant.nextDueDate ? Colors.text.primary : Colors.text.hint, fontSize: Fonts.size.sm }}>
                    {tenant.nextDueDate || 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={tenant.nextDueDate ? new Date(tenant.nextDueDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event: DateTimePickerEvent, date?: Date | undefined) => {
                      setShowDatePicker(false);
                      if (date) handleChange('nextDueDate', date.toISOString().split('T')[0]);
                    }}
                  />
                )}
              </View>
            </View>
          </View>


        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={loading}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        {showNextButton && (
          <TouchableOpacity
            style={[
              styles.nextButton,
              ((typeof nextButtonDisabled === 'boolean'
                ? nextButtonDisabled
                : !isValid) ||
                loading) &&
                styles.disabledButton,
            ]}
            onPress={onNext}
            disabled={
              (typeof nextButtonDisabled === 'boolean'
                ? nextButtonDisabled
                : !isValid) || loading
            }>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.background.paper} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>{nextButtonLabel}</Text>
                <ArrowRight size={18} color={Colors.background.paper} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.paper,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.base,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Fonts.size.xl,
    fontWeight: Fonts.weight.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  bedInfoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.sm,
  },
  bedInfoText: {
    fontSize: Fonts.size.xs,
    color: Colors.text.secondary,
    flex: 1,
  },
  changeBedLink: {
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.primary,
  },
  form: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  section: {
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.bold,
    color: Colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  col: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.secondary,
  },
  input: {
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.sm,
    padding: 10,
    fontSize: Fonts.size.sm,
    color: Colors.text.primary,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.background.paper,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.primary,
  },
  optionTextActive: {
    color: Colors.background.paper,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.base,
    backgroundColor: Colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.sm,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.primary,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextButtonText: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.background.paper,
  },
  disabledButton: {
    backgroundColor: Colors.neutral[300],
  },
  imagePreviewContainer: {
    alignItems: 'center',
    position: 'relative',
    marginTop: Spacing.sm,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background.elevated,
  },
  removeImageButton: {
    position: 'absolute',
    top: -4,
    right: '38%',
    backgroundColor: Colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  imagePickerButtonCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  imagePickerButtonTextCompact: {
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.primary,
  },
});
