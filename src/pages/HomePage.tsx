import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout/Layout';
import { useProjectConfig } from '../hooks/useProjectConfig';
import { StripeCheckoutButton, RazorpayCheckoutButton } from '../components/Payment';
import { usePaymentStore } from '../stores/usePaymentStore';
import { useToast } from '../components/UI/ToastContainer';
import PushNotificationButton from '../components/PushNotifications/PushNotificationButton';

const HomePage: React.FC = () => {
  const { projectName, projectDescription, theme } = useProjectConfig();
  const { verifyStripePayment } = usePaymentStore();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentIntentClientSecret = query.get('payment_intent_client_secret');

    if (paymentIntentClientSecret) {
      // You can also use the payment_intent ID directly from the URL if available
      const paymentIntentId = paymentIntentClientSecret.split('_secret_')[0];

      verifyStripePayment(paymentIntentId)
        .then(result => {
          if (result.result.status === 'succeeded') {
            showSuccess("Payment Confirmed", "Your payment was successful!");
            // You can also clear URL parameters here
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            showError("Payment Failed", "Something went wrong with your payment.");
          }
        })
        .catch(err => {
          console.error('Verification error:', err);
          showError("Verification Error", "Could not verify payment status.");
        });
    }
  }, [verifyStripePayment, showSuccess, showError]);

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: theme.colors.primary[600] }}
            >
              Welcome to {projectName}
            </motion.h1>

            {/* Push Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex justify-center"
            >
              <PushNotificationButton />
            </motion.div>

            {/* Payment Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <StripeCheckoutButton
                amount={2999}
                currency="USD"
                receipt={`receipt_${Date.now()}`}
                notes={{ productId: "demo-product", userId: "demo-user" }}
                onSuccess={(result) => console.log("Stripe payment successful", result)}
                onFailure={(error) => console.error("Stripe payment failed", error)}
                 className="px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Pay $29.99 with Stripe
              </StripeCheckoutButton>

              <RazorpayCheckoutButton
                amount={2499} // ₹24.99
                currency="INR"
                receipt={`receipt_${Date.now()}`}
                notes={{ productId: 'demo-product', userId: 'demo-user' }}
                onSuccess={(response) => {
                  console.log('Razorpay payment successful:', response);
                }}
                onFailure={(error) => {
                  console.error('Razorpay payment failed:', error);
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                companyName={projectName}
              >
                Pay ₹24.99 with Razorpay
              </RazorpayCheckoutButton>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;