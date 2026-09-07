const express = require('express');
const { createReview, getCompanyReviews, getAllReviews, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllReviews);
router.post('/company/:companyId', protect, authorize('student'), createReview);
router.get('/company/:companyId', getCompanyReviews);
router.delete('/:reviewId', protect, authorize('admin'), deleteReview);

module.exports = router;
