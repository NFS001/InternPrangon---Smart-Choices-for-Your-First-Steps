const express = require('express');
const { postInternship, searchInternships } = require('../controllers/internshipController');

const router = express.Router();

// Feature 4: Post an internship
// URL: http://localhost:5000/api/internship/post
router.post('/post', postInternship);

// Feature 5: Search and filter internships
// URL: http://localhost:5000/api/internship/search?keyword=Software
router.get('/search', searchInternships);

module.exports = router;