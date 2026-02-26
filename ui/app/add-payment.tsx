import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Wallet, ChevronLeft, ChevronDown, Calendar } from 'lucide-react-native';
import { spacing, typography, radius, shadows } from '@/theme';
import { useTheme } from '@/context/ThemeContext';
import { useProperty } from '@/context/PropertyContext';
import { paymentService, tenantService } from '@/services/apiClient';
import type { Tenant } from '@/services/apiTypes';
import EmptyState from '@/components/EmptyState';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Other'];
const PAYMENT_STATUSES = [
  { value: 'paid', label: 'Paid' },
  { value: 'due', label: 'Due' },
  { value: 'overdue', label: 'Overdue' },
];

export default function AddPaymentScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { tenantId: prefilledTenantId } = useLocalSearchParams<{ tenantId?: string }>();
  const { selectedPropertyId } = useProperty();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentDate, setPaymentDate] = useState('');
  const [method, setMethod] = useState('Cash');
  const [status, setStatus] = useState<'paid' | 'due' | 'overdue'>('paid');

  const [loading, setLoading] = useState(false);
  const [fetchingTenants, setFetchingTenants] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTenantPicker, setShowTenantPicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const isPrefilled = !!prefilledTenantId;

  useEffect(() => {
    if (selectedPropertyId) {
      fetchTenants();
    }
  }, [selectedPropertyId]);

  const fetchTenants = async () => {
    if (!selectedPropertyId) return;

    try {
      setFetchingTenants(true);
      const response = await tenantService.getTenants();
      if (response.data) {
        const filteredTenants = response.data.filter(t => t.propertyId === selectedPropertyId);
        setTenants(filteredTenants);

        if (prefilledTenantId) {
          const prefilled = filteredTenants.find(t => t.id === prefilledTenantId);
          if (prefilled) {
            setSelectedTenant(prefilled);
            const rentAmount = prefilled.rent.replace(/[^0-9]/g, '');
            setAmount(rentAmount);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load tenants');
    } finally {
      setFetchingTenants(false);
    }
  };

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    const rentAmount = tenant.rent.replace(/[^0-9]/g, '');
    setAmount(rentAmount);
    setShowTenantPicker(false);
  };

  const handleSubmit = async () => {
    if (!selectedTenant || !amount || !dueDate || !method || !status) {
      setError('All required fields must be filled');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!selectedPropertyId) {
      setError('No property selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await paymentService.recordPayment({
        tenantId: selectedTenant.id,
        propertyId: selectedPropertyId,
        tenantName: selectedTenant.name,
        property: selectedPropertyId,
        bed: selectedTenant.bedId,
        amount: `₹${amountNum.toLocaleString()}`,
        dueDate,
        date: paymentDate || null,
        method: paymentDate ? method : null,
        status,
      });

      router.back();
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      selectedTenant &&
      amount.trim() &&
      dueDate &&
      method &&
      status &&
      !isNaN(parseFloat(amount)) &&
      parseFloat(amount) > 0
    );
  };

  if (!selectedPropertyId) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.border.light }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Record Payment</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={Wallet}
            title="No Property Selected"
            subtitle="Please create a property first to record payments"
            actionLabel="Go Back"
            onActionPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (fetchingTenants) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.border.light }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Record Payment</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.border.light }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Record Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary[50] }]}>
              <Wallet size={48} color={colors.primary[500]} />
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>Record Payment</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Track tenant payment details
            </Text>
          </View>

          <View style={styles.formContainer}>
            {error && (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: colors.danger[50],
                    borderColor: colors.danger[200],
                  },
                ]}>
                <Text style={[styles.errorText, { color: colors.danger[700] }]}>{error}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Tenant *</Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border.medium,
                    opacity: isPrefilled ? 0.6 : 1,
                  },
                ]}
                onPress={() => !isPrefilled && setShowTenantPicker(true)}
                activeOpacity={0.7}
                disabled={loading || isPrefilled || tenants.length === 0}>
                <Text
                  style={[
                    styles.pickerButtonText,
                    {
                      color: selectedTenant ? colors.text.primary : colors.text.tertiary,
                    },
                  ]}>
                  {selectedTenant ? selectedTenant.name : 'Select Tenant'}
                </Text>
                {!isPrefilled && <ChevronDown size={20} color={colors.text.tertiary} />}
              </TouchableOpacity>
              {tenants.length === 0 && (
                <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
                  No tenants available. Please add tenants first.
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Amount *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.white,
                    color: colors.text.primary,
                    borderColor: colors.border.medium,
                  },
                ]}
                placeholder="e.g., 5000"
                keyboardType="numeric"
                placeholderTextColor={colors.text.tertiary}
                value={amount}
                onChangeText={setAmount}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Due Date *</Text>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color={colors.text.tertiary} style={styles.dateIcon} />
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: colors.white,
                      color: colors.text.primary,
                      borderColor: colors.border.medium,
                    },
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.text.tertiary}
                  value={dueDate}
                  onChangeText={setDueDate}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Payment Date</Text>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color={colors.text.tertiary} style={styles.dateIcon} />
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: colors.white,
                      color: colors.text.primary,
                      borderColor: colors.border.medium,
                    },
                  ]}
                  placeholder="YYYY-MM-DD (optional)"
                  placeholderTextColor={colors.text.tertiary}
                  value={paymentDate}
                  onChangeText={setPaymentDate}
                  editable={!loading}
                />
              </View>
              <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
                Leave empty if not yet paid
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Payment Method *</Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border.medium,
                  },
                ]}
                onPress={() => setShowMethodPicker(true)}
                activeOpacity={0.7}
                disabled={loading}>
                <Text
                  style={[
                    styles.pickerButtonText,
                    {
                      color: method ? colors.text.primary : colors.text.tertiary,
                    },
                  ]}>
                  {method || 'Select Method'}
                </Text>
                <ChevronDown size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Status *</Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border.medium,
                  },
                ]}
                onPress={() => setShowStatusPicker(true)}
                activeOpacity={0.7}
                disabled={loading}>
                <Text
                  style={[
                    styles.pickerButtonText,
                    {
                      color: status ? colors.text.primary : colors.text.tertiary,
                    },
                  ]}>
                  {PAYMENT_STATUSES.find(s => s.value === status)?.label || 'Select Status'}
                </Text>
                <ChevronDown size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.primary[500],
                  opacity: loading || !isFormValid() ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading || !isFormValid()}>
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={[styles.submitButtonText, { color: colors.white }]}>
                  Record Payment
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showTenantPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTenantPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border.light }]}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Select Tenant
              </Text>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {tenants.map((tenant, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border.light },
                  ]}
                  onPress={() => handleTenantSelect(tenant)}
                  activeOpacity={0.7}>
                  <View style={styles.modalOptionContent}>
                    <Text
                      style={[
                        styles.modalOptionText,
                        {
                          color:
                            selectedTenant?.id === tenant.id
                              ? colors.primary[500]
                              : colors.text.primary,
                          fontWeight:
                            selectedTenant?.id === tenant.id
                              ? typography.fontWeight.semibold
                              : typography.fontWeight.regular,
                        },
                      ]}>
                      {tenant.name}
                    </Text>
                    <Text style={[styles.modalOptionSubtext, { color: colors.text.secondary }]}>
                      {tenant.email}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCloseButton, { borderTopColor: colors.border.light }]}
              onPress={() => setShowTenantPicker(false)}
              activeOpacity={0.7}>
              <Text style={[styles.modalCloseButtonText, { color: colors.text.secondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMethodPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMethodPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border.light }]}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Select Payment Method
              </Text>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {PAYMENT_METHODS.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border.light },
                  ]}
                  onPress={() => {
                    setMethod(m);
                    setShowMethodPicker(false);
                  }}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          method === m ? colors.primary[500] : colors.text.primary,
                        fontWeight:
                          method === m
                            ? typography.fontWeight.semibold
                            : typography.fontWeight.regular,
                      },
                    ]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCloseButton, { borderTopColor: colors.border.light }]}
              onPress={() => setShowMethodPicker(false)}
              activeOpacity={0.7}>
              <Text style={[styles.modalCloseButtonText, { color: colors.text.secondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showStatusPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border.light }]}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Select Payment Status
              </Text>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {PAYMENT_STATUSES.map((s, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border.light },
                  ]}
                  onPress={() => {
                    setStatus(s.value as 'paid' | 'due' | 'overdue');
                    setShowStatusPicker(false);
                  }}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          status === s.value ? colors.primary[500] : colors.text.primary,
                        fontWeight:
                          status === s.value
                            ? typography.fontWeight.semibold
                            : typography.fontWeight.regular,
                      },
                    ]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCloseButton, { borderTopColor: colors.border.light }]}
              onPress={() => setShowStatusPicker(false)}
              activeOpacity={0.7}>
              <Text style={[styles.modalCloseButtonText, { color: colors.text.secondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  placeholder: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    borderWidth: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
  },
  pickerButtonText: {
    fontSize: typography.fontSize.md,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  dateInputContainer: {
    position: 'relative',
  },
  dateIcon: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.md,
    zIndex: 1,
  },
  dateInput: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingLeft: 48,
    fontSize: typography.fontSize.md,
    borderWidth: 1,
  },
  submitButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.lg,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '70%',
    ...shadows.xl,
  },
  modalHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  modalOptionContent: {
    gap: spacing.xs,
  },
  modalOptionText: {
    fontSize: typography.fontSize.md,
  },
  modalOptionSubtext: {
    fontSize: typography.fontSize.sm,
  },
  modalCloseButton: {
    padding: spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
