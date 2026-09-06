const express = require('express');
const {
    createInterviewExperience,
    getCompanyInterviewExperiences
} = require('../controllers/interviewExperienceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/company/:companyId', protect, authorize('student'), createInterviewExperience);
router.get('/company/:companyId', getCompanyInterviewExperiences);

module.exports = router;
