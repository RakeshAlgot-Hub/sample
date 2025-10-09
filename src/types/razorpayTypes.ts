export interface PaymentFormData {
  amount: number;
  currency: string;
  receipt: string;
  notes: string;
}

export interface OrderResponse {
  success: boolean;
  data?: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    [key: string]: any;
  };
  error?: string;
}

export interface VerificationResponse {
  status: 'success' | 'failed';
  message?: string;
}

export interface PaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentFormProps {
  // Backend configuration
  backendUrl: string;
  razorpayKeyId: string;
  
  // Form customization
  className?: string;
  formClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  
  // Field customization
  amountLabel?: string;
  currencyLabel?: string;
  receiptLabel?: string;
  notesLabel?: string;
  submitButtonText?: string;
  
  // Placeholders
  amountPlaceholder?: string;
  currencyPlaceholder?: string;
  receiptPlaceholder?: string;
  notesPlaceholder?: string;
  
  // Default values
  defaultCurrency?: string;
  defaultAmount?: number;
  
  // Callbacks
  onPaymentSuccess?: (response: PaymentResponse) => void;
  onPaymentFailure?: (error: any) => void;
  onOrderCreated?: (order: OrderResponse) => void;
  onFormSubmit?: (data: PaymentFormData) => void;
  
  // Validation
  validateForm?: (data: PaymentFormData) => string | null;
  
  // Loading states
  loadingText?: string;
  
  // Styling options
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
}