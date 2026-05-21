const express = require('express');
const router = express.Router();
const { getReports, createReport, getReport, downloadReport, getAiSummary } = require('../controllers/reportController');
const { protect, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/reports — Get reports for current user
router.get('/', protect, getReports);

// GET /api/reports/:id/ai-summary — Get AI-analyzed smart summary
router.get('/:id/ai-summary', protect, getAiSummary);

// GET /api/reports/:id — Get single report
router.get('/:id', protect, getReport);

// GET /api/reports/:id/download — Download report file
router.get('/:id/download', protect, downloadReport);

// POST /api/reports — Upload report (admin, with file)
router.post('/', protect, requireAdmin, upload.single('reportFile'), createReport);

module.exports = router;
