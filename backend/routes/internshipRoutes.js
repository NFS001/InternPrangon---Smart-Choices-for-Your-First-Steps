const express = require('express');
const {
    postInternship,
    searchInternships,
    getUpcomingDeadlines,
    getMyCompanyInternships,
    deleteInternship,
    getInternshipById
} = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Company: Get all internships posted by logged in company
router.get('/company/my', protect, authorize('company'), getMyCompanyInternships);

// Feature 4: Post an internship
// URL: http://localhost:5000/api/internship/post
router.post('/post', protect, authorize('company'), postInternship);

// Feature 6: Search, filter, sort, and paginate active internships
// URL: http://localhost:5000/api/internship/search?type=Paid&mode=Remote&page=1&limit=10&sortBy=deadline&sortOrder=asc
router.get('/search', searchInternships);

// Feature 20: Internships with a deadline in the next 3 days
// URL: http://localhost:5000/api/internship/deadlines/soon
router.get('/deadlines/soon', getUpcomingDeadlines);

// Public: Get specific internship details by ID
router.get('/:id', getInternshipById);

// Company: Delete an internship
router.delete('/:id', protect, authorize('company'), deleteInternship);

module.exports = router;

