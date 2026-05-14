const express = require('express');
const router = express.Router();
const { getFamilyMembers, addFamilyMember, deleteFamilyMember } = require('../controllers/familyController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.route('/')
    .get(getFamilyMembers)
    .post(addFamilyMember);

router.route('/:id')
    .delete(deleteFamilyMember);

module.exports = router;
