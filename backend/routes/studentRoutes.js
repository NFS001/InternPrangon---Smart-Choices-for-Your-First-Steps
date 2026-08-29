const express = require('express');
const { updateStudentProfile, getLeaderboard } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Route: http://localhost:5000/api/student/profile
router.post('/profile', protect, authorize('student'), updateStudentProfile);

// Feature 17: Public contributor leaderboard
// Route: http://localhost:5000/api/student/leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;
