const express = require('express');
const router = express.Router();
const { getStats, getTrends } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// GET /api/dashboard/stats — Get dashboard statistics
router.get('/stats', protect, getStats);

// GET /api/dashboard/trends — Get patient health parameter trends
router.get('/trends', protect, getTrends);

module.exports = router;
