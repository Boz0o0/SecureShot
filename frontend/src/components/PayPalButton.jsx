import React, { useState } from 'react';
import { paymentAPI } from '../services/api';

const PayPalButton = ({ sessionId, buyerEmail, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create payment
      const createResponse = await paymentAPI.create({
        sessionId,
        buyer_email: buyerEmail
      });

      // Redirect to PayPal
      window.location.href = createResponse.data.approvalUrl;
    } catch (error) {
      console.error('Payment creation failed:', error);
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !buyerEmail}
      className="w-full bg-yellow-500 text-black py-3 px-6 rounded-lg font-bold text-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Processing...' : 'Pay with PayPal'}
    </button>
  );
};

export default PayPalButton;