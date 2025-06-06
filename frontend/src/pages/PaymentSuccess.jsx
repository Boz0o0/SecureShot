import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
  const [params] = useSearchParams();

  useEffect(() => {
    const confirmPayment = async () => {
      const orderId = params.get('token');
      if (!orderId) return;

      try {
        await axios.post('http://localhost:3000/api/payment/confirm', {
          orderId,
          buyerEmail: 'sb-ojxwy43430775@personal.example.com',         // REMPLACER PAR LE BUYER EMAIL
          sessionId: '7e6a0d85-d8f0-4be0-88fc-8c37051cb29e',             // REMPLACER PAR LE SESSION ID (TEMPORARY)
          photographerId: 'c8dd6a78-1cfa-4c0f-a9b1-1f4dc3ccba44'    // REMPLACER PAR LE PHOTOGRAPHER ID (TEMPORARY)
        });

        alert('✅ Paiement confirmé et email envoyé !');
      } catch (err) {
        console.error('Erreur confirmation paiement :', err.message);
        alert('❌ Erreur lors de la confirmation.');
      }
    };

    confirmPayment();
  }, [params]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>✅ Paiement réussi</h1>
      <p>Merci pour votre achat. Vous allez recevoir un email.</p>
    </div>
  );
}

export default PaymentSuccess;
