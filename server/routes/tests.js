const express = require('express');
const router = express.Router();
const { getTests, getMyLabTests, createTest, updateTest, deleteTest } = require('../controllers/testController');
const { protect, requireAdmin } = require('../middleware/auth');

// GET /api/tests — Get all tests (public, optional labId filter)
router.get('/', getTests);

// GET /api/tests/my-lab — Get tests for current admin's lab
router.get('/my-lab', protect, requireAdmin, getMyLabTests);

// POST /api/tests — Create test (admin)
router.post('/', protect, requireAdmin, createTest);

// PUT /api/tests/:id — Update test (admin)
router.put('/:id', protect, requireAdmin, updateTest);

// DELETE /api/tests/:id — Delete test (admin)
router.delete('/:id', protect, requireAdmin, deleteTest);

module.exports = router;
