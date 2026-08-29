const express = require('express');
const { getMyNotifications, markNotificationAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route: http://localhost:5000/api/notifications
router.get('/', protect, getMyNotifications);

// Route: http://localhost:5000/api/notifications/:notificationId/read
router.patch('/:notificationId/read', protect, markNotificationAsRead);

module.exports = router;
