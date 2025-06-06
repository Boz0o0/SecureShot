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