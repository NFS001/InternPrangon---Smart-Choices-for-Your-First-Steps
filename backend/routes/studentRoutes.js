const express = require('express');
const { updateStudentProfile } = require('../controllers/studentController');

const router = express.Router();

// Route: http://localhost:5000/api/student/profile
router.post('/profile', updateStudentProfile);

module.exports = router;