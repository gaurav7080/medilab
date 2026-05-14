const express = require('express');
const router = express.Router();
const { getLabs, getAllLabs, getLab } = require('../controllers/labController');
const { protect, requireAdmin } = require('../middleware/auth');

// GET /api/labs — Get all verified labs (public)
router.get('/', getLabs);

// GET /api/labs/all — Get all labs including pending (admin)
router.get('/all', protect, requireAdmin, getAllLabs);

// GET /api/labs/:id — Get single lab
router.get('/:id', getLab);

module.exports = router;
