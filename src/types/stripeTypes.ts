import type { Stripe, PaymentIntent } from "@stripe/stripe-js";


export interface PaymentIntentData {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, any> | string;
}

export interface PaymentResult {
  code: number;
  message: string;
  result: {
    paymentIntentId: string;
    status: 'succeeded' | 'failed' | 'requires_payment_method' | 'canceled';
    amount: number;
    currency: string;
    metadata?: Record<string, any>;
    paymentMethodTypes?: string[];
    [key: string]: any;
  };
}

export interface PaymentFormData {
  amount: number;
  currency: string;
  receipt: string;
  notes?: string;
}

export interface StripePaymentFormProps {
  backendUrl: string;                     // URL to your backend server
  stripe: Stripe;                          // The Stripe object passed via context or props
  elements: Element;                      // The Elements object passed via context or props (corrected from Element)
  className?: string;                      // Optional className for the wrapper
  formClassName?: string;                  // Optional className for the form
  inputClassName?: string;                 // Optional className for the inputs
  buttonClassName?: string;                // Optional className for the button
  labelClassName?: string;                 // Optional className for the labels
  errorClassName?: string;                 // Optional className for error messages
  amountLabel?: string;                    // Optional label text for the amount field
  currencyLabel?: string;                  // Optional label text for the currency field
  receiptLabel?: string;                   // Optional label text for the receipt field
  notesLabel?: string;                     // Optional label text for the notes field
  submitButtonText?: string;               // Optional text for the submit button
  loadingText?: string;                    // Optional loading text while processing
  amountPlaceholder?: string;              // Optional placeholder text for the amount field
  receiptPlaceholder?: string;             // Optional placeholder text for the receipt field
  notesPlaceholder?: string;               // Optional placeholder text for the notes field
  defaultCurrency?: string;                // Default currency (e.g., USD)
  defaultAmount?: number;                  // Default amount (if any)
  onPaymentSuccess?: (paymentIntent: PaymentIntent) => void; // Callback for successful payment (updated type)
  onPaymentFailure?: (error: PaymentError) => void;        // Callback for failed payment (updated type)
  onPaymentIntentCreated?: (paymentIntent: PaymentIntent) => void; // Callback when paymentIntent is created
  onFormSubmit?: (formData: PaymentFormData) => void; // Callback for form submission
  stripePublishableKey: string;  
  validateForm?: () => boolean;             // Optional validation function for the form
  style?: React.CSSProperties;             // Inline styles for the component
  inputStyle?: React.CSSProperties;        // Inline styles for the input fields
  buttonStyle?: React.CSSProperties;       // Inline styles for the submit button
  labelStyle?: React.CSSProperties;        // Inline styles for the label
}

export interface PaymentIntentResponse {
  success: boolean;
  data?: {
    id: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
    clientSecret: string;
    [key: string]: any;
  };
  error?: string | null; // Allow error to be nullable
}

export interface VerificationResponse {
  success: boolean;
  data?: {
    paymentIntentId: string;
    status: string;
    amount: number;
    currency: string;
    [key: string]: any;
  };
  error?: string | null; // Allow error to be nullable
}

export interface PaymentSuccessResponse {
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
}

export interface PaymentError {
  code?: number;
  message: string;
  details?: any;
}

export interface StripeProviderProps {
  children: React.ReactNode;
  backendUrl: string;
  stripePublishableKey: string;
}

export interface PaymentButtonProps {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, any> | string;
  onSuccess?: (result: PaymentResult) => void;
  onFailure?: (error: PaymentError) => void;
  
  // Styling options
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  
  // Button customization
  children?: React.ReactNode;
  loadingText?: string;
  
  // Card collection options
  collectBillingDetails?: boolean;
  showCardForm?: boolean;
}

export interface UseStripePaymentReturn {
  createPayment: (data: PaymentIntentData) => Promise<{
    paymentIntentId: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: string;
  }>;
  verifyPayment: (paymentIntentId: string) => Promise<PaymentResult>;
  confirmPayment: (clientSecret: string, paymentMethod?: any) => Promise<{
    paymentIntent: any;
    error?: any;
  }>;
  isLoading: boolean;
  error: string | null;
}
