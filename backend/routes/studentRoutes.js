const express = require('express');
const { updateStudentProfile, getLeaderboard, getStudentProfile, uploadStudentAvatar } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/avatarUploadMiddleware');

const router = express.Router();

// Route: http://localhost:5000/api/student/profile
router.get('/profile', protect, authorize('student'), getStudentProfile);
router.post('/profile', protect, authorize('student'), updateStudentProfile);

// Route: http://localhost:5000/api/student/avatar
router.post('/avatar', protect, authorize('student'), uploadAvatar, uploadStudentAvatar);

// Feature 17: Public contributor leaderboard
// Route: http://localhost:5000/api/student/leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;
