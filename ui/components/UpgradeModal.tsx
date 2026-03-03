import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Check, X, AlertCircle } from 'lucide-react-native';
import { spacing, typography, radius, shadows } from '@/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { subscriptionService } from '@/services/apiClient';
import { openRazorpayCheckout, RazorpaySuccessResponse, RazorpayErrorResponse } from '@/services/razorpayService';
import type { Subscription } from '@/services/apiTypes';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan?: (plan: 'free' | 'pro' | 'premium') => void;
  subscriptions?: Subscription[];
  currentPlan?: 'free' | 'pro' | 'premium';
}

type Plan = 'free' | 'pro' | 'premium';

interface PlanWithLimits {
  id: Plan;
  name: string;
  limits?: {
    properties: number;
    tenants: number;
    rooms: number;
    staff: number;
    price: number;
  };
}

export default function UpgradeModal({
  visible,
  onClose,
  onSelectPlan = () => {},
  subscriptions = [],
  currentPlan = 'free',
}: UpgradeModalProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<Plan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [liveSubscriptions, setLiveSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isFetchingPlansRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const fetchAvailablePlans = useCallback(async () => {
    if (isFetchingPlansRef.current) return;
    
    try {
      isFetchingPlansRef.current = true;
      setLoadingPlans(true);
      const response = await subscriptionService.getAllSubscriptions();
      setLiveSubscriptions(response.data.subscriptions || []);
      hasLoadedRef.current = true;
    } catch (err: any) {
      setError(err?.message || 'Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
      isFetchingPlansRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      hasLoadedRef.current = false;
      return;
    }
    
    if (hasLoadedRef.current) return;
    setError(null);

    if (subscriptions.length > 0) {
      setLiveSubscriptions(subscriptions);
      hasLoadedRef.current = true;
      return;
    }

    fetchAvailablePlans();
  }, [visible, subscriptions, fetchAvailablePlans]);

  const handlePlanSelection = async (plan: Plan) => {
    if (plan === 'free') {
      try {
        setProcessing(true);
        setProcessingPlan(plan);
        setError(null);

        const updatedSubscription = await subscriptionService.updateSubscription(plan);

        onSelectPlan(updatedSubscription.data.plan);
        onClose();
      } catch (err: any) {
        setError(err?.message || 'Failed to update subscription');
      } finally {
        setProcessing(false);
        setProcessingPlan(null);
      }
      return;
    }

    if (!user) {
      setError('User information not available');
      return;
    }

    try {
      setProcessing(true);
      setProcessingPlan(plan);
      setError(null);

      const sessionResponse = await subscriptionService.createCheckoutSession(plan);
      const session = sessionResponse.data;

      openRazorpayCheckout(
        session,
        user.name,
        user.email,
        plan.charAt(0).toUpperCase() + plan.slice(1),
        async (response: RazorpaySuccessResponse) => {
          await handlePaymentSuccess(response);
        },
        (error: RazorpayErrorResponse) => {
          handlePaymentError(error);
        }
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate checkout');
      setProcessing(false);
      setProcessingPlan(null);
    }
  };

  const handlePaymentSuccess = async (response: RazorpaySuccessResponse) => {
    try {
      const verifyResponse = await subscriptionService.verifyPayment({
        payment_id: response.razorpay_payment_id,
        order_id: response.razorpay_order_id,
        signature: response.razorpay_signature,
      });

      if (verifyResponse.data.success) {
        onSelectPlan(verifyResponse.data.subscription.plan);
        onClose();

        Alert.alert(
          'Success',
          'Your subscription has been upgraded successfully!',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Payment verification failed. Please contact support.');
    } finally {
      setProcessing(false);
      setProcessingPlan(null);
    }
  };

  const handlePaymentError = (error: RazorpayErrorResponse) => {
    console.error('Razorpay payment error:', error);
    setError(error.description || 'Payment failed. Please try again.');
    setProcessing(false);
    setProcessingPlan(null);
  };

  const formatLimit = (value: number) => {
    return value === 999 ? 'Unlimited' : `Up to ${value}`;
  };

  const formatPrice = (paise: number) => {
    if (paise === 0) return 'Free';
    const rupees = paise / 100;
    return `₹${rupees.toFixed(rupees === Math.floor(rupees) ? 0 : 2)}`;
  };

  const plans = useMemo<PlanWithLimits[]>(() => {
    const source = subscriptions.length > 0 ? subscriptions : liveSubscriptions;
    const planHierarchy: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };
    const currentTier = planHierarchy[currentPlan];

    // Filter and sort plans
    return source
      .map((sub) => ({
        id: sub.plan as Plan,
        name: sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1),
        limits: {
          properties: sub.propertyLimit,
          tenants: sub.tenantLimit,
          rooms: sub.roomLimit,
          staff: sub.staffLimit,
          price: sub.price,
        },
      }))
      .filter((plan) => {
        const planTier = planHierarchy[plan.id];
        // Show only plans higher than current, or free if on paid plan (for downgrade option)
        if (currentPlan === 'free') {
          // If on free, show pro and premium only
          return planTier > currentTier;
        } else {
          // If on paid plan, show higher plans and include free at the bottom
          return planTier !== currentTier;
        }
      })
      .sort((a, b) => {
        // Sort descending (premium first, free last)
        return planHierarchy[b.id] - planHierarchy[a.id];
      });
  }, [subscriptions, liveSubscriptions, currentPlan]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={processing ? undefined : onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.white }]}>
          <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Choose Your Plan</Text>
            {!processing && (
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            )}
          </View>

          {loadingPlans ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          ) : (
            <>
          {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.danger[50], borderColor: colors.danger[200] }]}>
                  <AlertCircle size={16} color={colors.danger[600]} />
                  <Text style={[styles.errorText, { color: colors.danger[700] }]}>{error}</Text>
                </View>
              )}

              <ScrollView style={styles.scrollView}>
                {plans.map((plan) => {
                  const isProcessingThisPlan = processing && processingPlan === plan.id;
                  const isDisabled = processing && processingPlan !== plan.id;

                  return (
                    <View key={plan.id} style={[styles.planCard, { backgroundColor: colors.background.tertiary }]}>
                      <View style={styles.planHeader}>
                        <Text style={[styles.planName, { color: colors.text.primary }]}>{plan.name}</Text>
                        {plan.limits?.price !== undefined && (
                          <Text style={[styles.price, { color: colors.primary[600] }]}>
                            {formatPrice(plan.limits.price)}{plan.limits.price > 0 ? '/month' : ''}
                          </Text>
                        )}
                      </View>

                      {plan.limits && (
                        <View style={styles.featuresContainer}>
                          <View style={styles.featureRow}>
                            <Check size={16} color={colors.success[500]} />
                            <Text style={[styles.featureText, { color: colors.text.primary }]}>
                              {formatLimit(plan.limits.properties)} properties
                            </Text>
                          </View>
                          <View style={styles.featureRow}>
                            <Check size={16} color={colors.success[500]} />
                            <Text style={[styles.featureText, { color: colors.text.primary }]}>
                              {formatLimit(plan.limits.tenants)} tenants per property
                            </Text>
                          </View>
                          <View style={styles.featureRow}>
                            <Check size={16} color={colors.success[500]} />
                            <Text style={[styles.featureText, { color: colors.text.primary }]}>
                              {formatLimit(plan.limits.rooms)} rooms per property
                            </Text>
                          </View>
                          <View style={styles.featureRow}>
                            <Check size={16} color={colors.success[500]} />
                            <Text style={[styles.featureText, { color: colors.text.primary }]}>
                              {formatLimit(plan.limits.staff)} staff per property
                            </Text>
                          </View>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          {
                            backgroundColor: plan.id === 'premium' ? colors.primary[500] : plan.id === 'free' ? colors.neutral[100] : colors.white,
                            borderColor: plan.id === 'premium' ? colors.primary[500] : colors.border.medium,
                            opacity: isDisabled ? 0.5 : 1,
                          },
                        ]}
                        onPress={() => handlePlanSelection(plan.id)}
                        activeOpacity={0.7}
                        disabled={isDisabled}>
                        {isProcessingThisPlan ? (
                          <ActivityIndicator
                            size="small"
                            color={plan.id === 'premium' ? colors.white : colors.primary[500]}
                          />
                        ) : (
                          <Text
                            style={[
                              styles.selectButtonText,
                              { color: plan.id === 'premium' ? colors.white : plan.id === 'free' ? colors.text.tertiary : colors.text.primary },
                            ]}>
                            {plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {!loadingPlans && plans.length === 0 && (
                  <Text style={[styles.featureText, { color: colors.text.secondary }]}>No subscription plans available right now.</Text>
                )}
              </ScrollView>
            </>
          )}

          {!processing && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderTopColor: colors.border.light }]}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={[styles.cancelButtonText, { color: colors.text.secondary }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContainer: {
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...shadows.xl,
  },
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.sm,
    flex: 1,
  },
  scrollView: {
    padding: spacing.lg,
  },
  planCard: {
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  planHeader: {
    marginBottom: spacing.lg,
  },
  planName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
  },
  price: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.sm,
    flex: 1,
  },
  selectButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  cancelButton: {
    padding: spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
