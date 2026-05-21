const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, upgradeSubscription } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register — Register new user
router.post('/register', register);

// POST /api/auth/login — Login user
router.post('/login', login);

// GET /api/auth/me — Get current user (protected)
router.get('/me', protect, getMe);

// PUT /api/auth/profile - Update user profile
router.put('/profile', protect, updateProfile);

// PUT /api/auth/upgrade-subscription - Upgrade user subscription tier
router.put('/upgrade-subscription', protect, upgradeSubscription);

module.exports = router;
