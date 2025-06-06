<<<<<<< HEAD
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

=======
const paypal = require('../services/paypalClient');
const supabase = require('../services/supabaseClient');
const validateEmail = require('../utils/validateEmail');

class PaymentController {
  async createPayment(req, res, next) {
    try {
      const { sessionId, buyer_email } = req.body;

      if (!validateEmail(buyer_email)) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      // Get session details
      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (new Date(session.expires_at) < new Date()) {
        return res.status(410).json({ error: 'Session has expired' });
      }

      const paymentData = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
        },
        transactions: [{
          item_list: {
            items: [{
              name: `Photo Session ${session.code}`,
              sku: session.id,
              price: session.price.toString(),
              currency: 'USD',
              quantity: 1
            }]
          },
          amount: {
            currency: 'USD',
            total: session.price.toString()
          },
          description: `Purchase of photo session ${session.code}`
        }]
      };

      paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
          console.error('PayPal Error:', error);
          return res.status(500).json({ error: 'Payment creation failed' });
        }

        const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
        res.json({
          paymentId: payment.id,
          approvalUrl: approvalUrl.href
        });
      });
    } catch (error) {
      next(error);
    }
  }

  async executePayment(req, res, next) {
    try {
      const { paymentId, payerId, sessionId, buyer_email } = req.body;

      const executePaymentData = {
        payer_id: payerId
      };

      paypal.payment.execute(paymentId, executePaymentData, async (error, payment) => {
        if (error) {
          console.error('PayPal Execute Error:', error);
          return res.status(500).json({ error: 'Payment execution failed' });
        }

        if (payment.state === 'approved') {
          try {
            // Record purchase in database
            const { data: purchase, error: purchaseError } = await supabase
              .from('purchases')
              .insert({
                session_id: sessionId,
                buyer_email: buyer_email,
                paypal_txn_id: payment.id
              })
              .select()
              .single();

            if (purchaseError) throw purchaseError;

            res.json({
              success: true,
              purchase: purchase,
              payment: payment
            });
          } catch (dbError) {
            console.error('Database Error:', dbError);
            res.status(500).json({ error: 'Payment successful but failed to record purchase' });
          }
        } else {
          res.status(400).json({ error: 'Payment not approved' });
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPurchase(req, res, next) {
    try {
      const { sessionId, buyer_email } = req.params;

      const { data: purchase, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('session_id', sessionId)
        .eq('buyer_email', buyer_email)
        .single();

      if (error || !purchase) {
        return res.status(404).json({ error: 'Purchase not found' });
      }

      res.json({ verified: true, purchase });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
>>>>>>> 082af8bbc7db5ae2b8832fef46b4ba980abbeb59
