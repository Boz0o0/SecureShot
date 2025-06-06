export default function CheckoutPage() {
  const handlePay = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.approveLink) {
        window.location.href = data.approveLink;
      } else {
        alert('Erreur PayPal');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Finaliser votre paiement</h2>
      <p>Total : 10€</p>
      <button onClick={handlePay} style={{ padding: '1rem 2rem' }}>
        Payer avec PayPal
      </button>
    </div>
  );
}
