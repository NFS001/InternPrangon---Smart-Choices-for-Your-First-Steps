const express = require('express');
const { flagReview, getFlags, updateFlagStatus } = require('../controllers/flagController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/review/:reviewId', protect, authorize('student'), flagReview);
router.get('/', protect, authorize('admin'), getFlags);
router.patch('/:flagId/status', protect, authorize('admin'), updateFlagStatus);

module.exports = router;
