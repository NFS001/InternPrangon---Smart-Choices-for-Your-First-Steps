const express = require('express');
const { applyToInternship } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:internshipId', protect, authorize('student'), applyToInternship);

module.exports = router;
