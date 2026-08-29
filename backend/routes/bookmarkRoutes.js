const express = require('express');
const { addBookmark, removeBookmark, getMyBookmarks } = require('../controllers/bookmarkController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Route: http://localhost:5000/api/bookmarks
router.get('/', protect, authorize('student'), getMyBookmarks);

// Route: http://localhost:5000/api/bookmarks/:internshipId
router.post('/:internshipId', protect, authorize('student'), addBookmark);
router.delete('/:internshipId', protect, authorize('student'), removeBookmark);

module.exports = router;
