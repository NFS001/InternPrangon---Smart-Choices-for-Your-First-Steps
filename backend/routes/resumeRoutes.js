const express = require('express');
const { uploadOrUpdateResume, getCurrentResume } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/resumeUploadMiddleware');

const router = express.Router();

router.post('/', protect, authorize('student'), uploadResume, uploadOrUpdateResume);
router.get('/me', protect, authorize('student'), getCurrentResume);

module.exports = router;
