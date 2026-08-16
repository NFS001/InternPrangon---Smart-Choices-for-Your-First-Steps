const express = require('express');
const { updateStudentProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Route: http://localhost:5000/api/student/profile
router.post('/profile', protect, authorize('student'), updateStudentProfile);

module.exports = router;
