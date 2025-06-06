import { useState } from 'react';
import axios from 'axios';

function Checkout() {
  const [approveLink, setApproveLink] = useState(null);

  const handlePay = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/payment/create');
      setApproveLink(response.data.approveLink);
    } catch (err) {
      console.error('Erreur lors de la création de la commande PayPal :', err.message);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Payer votre session</h1>
      {!approveLink ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handlePay}
        >
          Payer maintenant
        </button>
      ) : (
        <a
          href={approveLink}
          className="bg-green-600 text-white px-4 py-2 rounded inline-block"
          target="_blank"
          rel="noopener noreferrer"
        >
          Payer avec PayPal
        </a>
      )}
    </div>
  );
}

export default Checkout;
