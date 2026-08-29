const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const Internship = require('../models/Internship');
const { isDeadlineSoon } = require('../utils/deadlineHelper');

// Feature 19: Internship Bookmark
const addBookmark = async (req, res) => {
    const { internshipId } = req.params;

    if (!mongoose.isValidObjectId(internshipId)) {
        return res.status(400).json({ message: 'Invalid internship ID' });
    }

    try {
        const internship = await Internship.findById(internshipId);

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        const bookmark = await Bookmark.create({
            student: req.user._id,
            internship: internship._id
        });

        res.status(201).json({
            message: 'Internship bookmarked successfully!',
            bookmarkId: bookmark._id
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'You have already bookmarked this internship' });
        }

        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const removeBookmark = async (req, res) => {
    const { internshipId } = req.params;

    if (!mongoose.isValidObjectId(internshipId)) {
        return res.status(400).json({ message: 'Invalid internship ID' });
    }

    try {
        const deletedBookmark = await Bookmark.findOneAndDelete({
            student: req.user._id,
            internship: internshipId
        });

        if (!deletedBookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        res.status(200).json({ message: 'Bookmark removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getMyBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ student: req.user._id })
            .populate('internship')
            .sort({ createdAt: -1 });

        const validBookmarks = bookmarks.filter((bookmark) => bookmark.internship);

        res.status(200).json({
            message: 'Bookmarks fetched successfully!',
            bookmarks: validBookmarks.map((bookmark) => ({
                bookmarkId: bookmark._id,
                internship: bookmark.internship,
                deadlineSoon: isDeadlineSoon(bookmark.internship.deadline)
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { addBookmark, removeBookmark, getMyBookmarks };
