const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Small helper other controllers call to drop a notification in the DB.
// Not a route handler itself - just a shared writer.
const createNotification = async ({ recipient, type, message }) => {
    try {
        await Notification.create({ recipient, type, message });
    } catch (error) {
        // A failed notification shouldn't break the action that triggered it
        // (e.g. a company still gets verified even if this insert fails).
        console.error('Failed to create notification:', error.message);
    }
};

// Feature 18: Notification Center
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Notifications fetched successfully!',
            unreadCount: notifications.filter((notification) => !notification.isRead).length,
            notifications
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;

    if (!mongoose.isValidObjectId(notificationId)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
    }

    try {
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You cannot access this notification' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            message: 'Notification marked as read!',
            notification
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { createNotification, getMyNotifications, markNotificationAsRead };
