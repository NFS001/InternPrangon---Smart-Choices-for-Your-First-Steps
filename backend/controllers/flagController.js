const mongoose = require('mongoose');
const Flag = require('../models/Flag');
const Review = require('../models/Review');

const formatFlagResponse = (flag) => ({
    _id: flag._id,
    review: flag.review,
    reason: flag.reason,
    status: flag.status,
    dateFlagged: flag.dateFlagged
});

const flagReview = async (req, res) => {
    const { reviewId } = req.params;
    const { reason } = req.body || {};

    if (!mongoose.isValidObjectId(reviewId)) {
        return res.status(400).json({ message: 'Invalid review ID' });
    }

    if (typeof reason !== 'string') {
        return res.status(400).json({ message: 'Reason is required and must be text' });
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
        return res.status(400).json({ message: 'Reason cannot be empty' });
    }

    if (trimmedReason.length > 1000) {
        return res.status(400).json({ message: 'Reason cannot exceed 1000 characters' });
    }

    try {
        const review = await Review.findById(reviewId).select('+student');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.student.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot report your own review' });
        }

        const existingFlag = await Flag.findOne({
            review: review._id,
            reporter: req.user._id
        });

        if (existingFlag) {
            return res.status(409).json({ message: 'You have already reported this review' });
        }

        const flag = await Flag.create({
            review: review._id,
            reporter: req.user._id,
            reason: trimmedReason,
            status: 'Pending',
            dateFlagged: new Date()
        });

        res.status(201).json({
            message: 'Review reported successfully!',
            flag: formatFlagResponse(flag)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'You have already reported this review' });
        }

        res.status(500).json({ message: 'Server Error' });
    }
};

const getFlags = async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        return res.status(400).json({ message: 'Page must be a positive integer' });
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        return res.status(400).json({ message: 'Limit must be an integer between 1 and 100' });
    }

    const query = {};

    if (status !== undefined) {
        if (!['Pending', 'Resolved'].includes(status)) {
            return res.status(400).json({ message: "Status must be 'Pending' or 'Resolved'" });
        }
        query.status = status;
    }

    try {
        const totalFlags = await Flag.countDocuments(query);
        const totalPages = Math.ceil(totalFlags / limitNumber) || 1;
        const skip = (pageNumber - 1) * limitNumber;

        const flags = await Flag.find(query)
            .select('review reason status dateFlagged')
            .populate({
                path: 'review',
                select: 'rating comment createdAt company',
                populate: {
                    path: 'company',
                    select: 'companyName industry website'
                }
            })
            .sort({ dateFlagged: -1 })
            .skip(skip)
            .limit(limitNumber);

        res.status(200).json({
            totalFlags,
            totalPages,
            currentPage: pageNumber,
            limit: limitNumber,
            flags
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateFlagStatus = async (req, res) => {
    const { flagId } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(flagId)) {
        return res.status(400).json({ message: 'Invalid flag ID' });
    }

    if (!status || !['Pending', 'Resolved'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'Pending' or 'Resolved'" });
    }

    try {
        const updatedFlag = await Flag.findByIdAndUpdate(
            flagId,
            { status },
            { returnDocument: 'after' }
        ).select('review reason status dateFlagged');

        if (!updatedFlag) {
            return res.status(404).json({ message: 'Flag not found' });
        }

        res.status(200).json({
            message: `Flag status updated to ${updatedFlag.status}`,
            flag: formatFlagResponse(updatedFlag)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    flagReview,
    getFlags,
    updateFlagStatus
};
