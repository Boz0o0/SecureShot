const express = require('express');
const router = express.Router();
const { handlePaymentConfirmation, handleCreateOrder } = require('../controllers/paymentController');

router.post('/create', handleCreateOrder);
router.post('/confirm', handlePaymentConfirmation);

module.exports = router;