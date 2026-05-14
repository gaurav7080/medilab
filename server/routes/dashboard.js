const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// GET /api/dashboard/stats — Get dashboard statistics
router.get('/stats', protect, getStats);

module.exports = router;
