const supabase = require('../services/supabaseClient');
const paypal = require('@paypal/checkout-server-sdk');

const environment =
  process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

const client = new paypal.core.PayPalHttpClient(environment);

async function validatePayPalOrder(orderId) {
  const request = new paypal.orders.OrdersGetRequest(orderId);
  const response = await client.execute(request);
  if (response.result.status !== 'COMPLETED') {
    throw new Error(`Order status is not COMPLETED: ${response.result.status}`);
  }
  return response.result;
}

async function handlePaymentConfirmation(req, res) {
  try {
    const { orderId, buyerEmail, sessionId, photographerId } = req.body;

    if (!orderId || !buyerEmail || !sessionId || !photographerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Étape 1 : GET pour vérifier le statut
    const getRequest = new paypal.orders.OrdersGetRequest(orderId);
    const getResponse = await client.execute(getRequest);

    const orderStatus = getResponse.result.status;
    if (orderStatus === 'APPROVED') {
      // Étape 2 : CAPTURE
      const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
      captureRequest.requestBody({});
      const captureResponse = await client.execute(captureRequest);

      console.log('✅ Payment captured:', captureResponse.result.status);
    } else if (orderStatus !== 'COMPLETED') {
      return res.status(400).json({ error: `Order status is not COMPLETED: ${orderStatus}` });
    }

    // Étape 3 : Enregistre dans Supabase
    const { error } = await supabase.rpc('send_purchase_email', {
      p_buyer_email: buyerEmail,
      p_session_id: sessionId,
      p_photographer_id: photographerId,
    });

    if (error) {
      console.error('Supabase RPC error:', error.message);
      return res.status(500).json({ error: 'Failed to log purchase in database' });
    }

    res.status(200).json({ message: 'Payment confirmed and email sent.' });
  } catch (err) {
    console.error('Payment confirmation failed:', err.message);
    res.status(400).json({ error: err.message });
  }
}

async function handleCreateOrder(req, res) {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "EUR",
          value: "10.00" // à remplacer plus tard par un vrai prix dynamique
        }
      }],
      application_context: {
        return_url: "http://localhost:5173/payment/success", // ou domaine prod
        cancel_url: "http://localhost:5173/payment/cancel"
      }
    });

    const order = await client.execute(request);
    const approveLink = order.result.links.find(link => link.rel === "approve");

    res.status(200).json({
      orderID: order.result.id,
      approveLink: approveLink.href
    });
  } catch (err) {
    console.error('Error creating PayPal order:', err.message);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
}

module.exports = { handlePaymentConfirmation, handleCreateOrder };

