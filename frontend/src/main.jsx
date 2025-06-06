import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PaymentSuccess from './PaymentSuccess';

const Home = () => {
  const handlePay = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.approveLink) {
        window.location.href = data.approveLink;
      } else {
        alert('Erreur PayPal : lien absent');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur serveur');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>SecureShot</h1>
      <button onClick={handlePay}>Payer avec PayPal</button>
    </div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
    </Routes>
  </Router>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
