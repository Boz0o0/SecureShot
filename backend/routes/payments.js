const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Create PayPal payment
router.post('/create', paymentController.createPayment);

// Execute PayPal payment
router.post('/execute', paymentController.executePayment);

// Verify purchase
router.get('/verify/:sessionId/:buyer_email', paymentController.verifyPurchase);

module.exports = router;