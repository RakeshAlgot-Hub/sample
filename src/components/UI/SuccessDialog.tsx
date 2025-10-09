import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface SuccessDialogProps {
  title?: string;
  message?: string;
  onClose: () => void;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  title = "Payment Successful!",
  message = "Your payment has been processed successfully.",
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center relative"
      >
        {/* Close icon button in top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close dialog"
        >
          <X size={24} aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>
        <CheckCircle2 className="mx-auto mb-4 text-green-500" size={64} />
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            OK
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessDialog;
