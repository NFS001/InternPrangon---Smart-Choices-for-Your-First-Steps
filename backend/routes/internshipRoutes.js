const express = require('express');
const { postInternship, searchInternships } = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Feature 4: Post an internship
// URL: http://localhost:5000/api/internship/post
router.post('/post', protect, authorize('company'), postInternship);

// Feature 6: Search, filter, sort, and paginate active internships
// URL: http://localhost:5000/api/internship/search?type=Paid&mode=Remote&page=1&limit=10&sortBy=deadline&sortOrder=asc
router.get('/search', searchInternships);

module.exports = router;
