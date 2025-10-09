// StripePaymentForm.tsx
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "../UI/ToastContainer";
import { usePaymentStore } from "../../stores/usePaymentStore";
import SuccessDialog from "../UI/SuccessDialog";
import FailureDialog from "../UI/FailureDialog";

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess?: (result: any) => void;
  onFailure?: (error: any) => void;
  onClose?: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onFailure,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showError, showSuccess } = useToast();
  const { verifyStripePayment } = usePaymentStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailureDialog, setShowFailureDialog] = useState(false);
  console.log("showFailureDialog", showFailureDialog)
  const [failureMessage, setFailureMessage] = useState("");

  const displayAmount = (amount / 100).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      showError("Card Error", "Card details not entered.");
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        showError("Payment Failed", error.message || "Payment failed.");
        setFailureMessage(error.message || "Payment failed.");
        setShowFailureDialog(true);
        onFailure?.(error);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        const verificationResult = await verifyStripePayment(paymentIntent.id);

        if (verificationResult?.result?.status === "succeeded") {
          showSuccess(
            "Payment Successful!",
            `Your payment of ${displayAmount} ${currency.toUpperCase()} has been processed successfully!`
          );

          setShowSuccessDialog(true);

          onSuccess?.(verificationResult);
        } else {
          showError("Payment Verification Failed", "Payment could not be verified.");
          setFailureMessage("Payment could not be verified.");
          setShowFailureDialog(true);
          onFailure?.(verificationResult);
        }
      } else {
        showError("Payment Failed", `Payment status: ${paymentIntent?.status}`);
        setFailureMessage(`Payment status: ${paymentIntent?.status}`);
        setShowFailureDialog(true);
        onFailure?.(paymentIntent);
      }
    } catch (err: any) {
      showError("Payment Failed", err.message || "Payment failed.");
      setFailureMessage(err.message || "Payment failed.");
      setShowFailureDialog(true);
      onFailure?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    onClose?.();
  };

  const handleFailureDialogClose = () => {
    setShowFailureDialog(false);
    onClose?.();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="card-element" className="block mb-1 font-medium">
            Card Details
          </label>
          <div className="p-2 border rounded">
            <CardElement id="card-element" options={{ hidePostalCode: true }} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : `Pay ${displayAmount} ${currency.toUpperCase()}`}
        </button>
      </form>

      {showSuccessDialog && (
        <SuccessDialog
          title="Payment Successful!"
          message={`Your payment of ${displayAmount} ${currency.toUpperCase()} has been processed successfully.`}
          onClose={handleDialogClose}
        />
      )}

      {showFailureDialog && (
        <FailureDialog
          title="Payment Failed"
          message={failureMessage}
          onClose={handleFailureDialogClose}
        />
      )}
    </>
  );
};

export default StripePaymentForm;
