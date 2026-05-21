const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createOrder,
    verifyPayment,
    getCurrentSubscription,
    getPaymentHistory,
    cancelSubscription
} = require('../controllers/subscriptionController');

// POST /api/subscription/create-order — Create Razorpay payment order
router.post('/create-order', protect, createOrder);

// POST /api/subscription/verify-payment — Verify & activate subscription
router.post('/verify-payment', protect, verifyPayment);

// GET /api/subscription/current — Get current subscription details
router.get('/current', protect, getCurrentSubscription);

// GET /api/subscription/history — Get payment transaction history
router.get('/history', protect, getPaymentHistory);

// POST /api/subscription/cancel — Cancel active subscription
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
