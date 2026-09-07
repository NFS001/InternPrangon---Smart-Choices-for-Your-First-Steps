const mongoose = require('mongoose');
const CompanyProfile = require('../models/CompanyProfile');
const Review = require('../models/Review');
const StudentProfile = require('../models/StudentProfile');
const Flag = require('../models/Flag');
const { awardPointsToStudent } = require('../utils/badgeHelper');

// Reviews feed the shared badge and leaderboard points system.
const POINTS_PER_REVIEW = 5;

const formatAnonymousReview = (review) => ({
    id: review._id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt
});

const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
        return 0;
    }

    const ratingTotal = reviews.reduce((total, review) => total + review.rating, 0);
    return Number((ratingTotal / reviews.length).toFixed(1));
};

const createReview = async (req, res) => {
    const { companyId } = req.params;
    const { rating, comment } = req.body || {};

    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    if (typeof comment !== 'string') {
        return res.status(400).json({ message: 'Comment is required and must be text' });
    }

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
        return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    if (trimmedComment.length > 1000) {
        return res.status(400).json({ message: 'Comment cannot exceed 1000 characters' });
    }

    try {
        let company;
        if (mongoose.isValidObjectId(companyId)) {
            company = await CompanyProfile.findById(companyId);
            if (!company) {
                return res.status(404).json({ message: 'Company not found' });
            }
        } else {
            company = await CompanyProfile.findOne({ companyName: new RegExp(`^${companyId}$`, 'i') });
            if (!company) {
                return res.status(400).json({ message: 'Invalid company ID' });
            }
        }

        const existingReview = await Review.findOne({
            company: company._id,
            student: req.user._id
        });

        if (existingReview) {
            return res.status(409).json({ message: 'You have already reviewed this company' });
        }

        review = await Review.create({
            company: company._id,
            student: req.user._id,
            rating,
            comment: trimmedComment,
            createdAt: new Date()
        });

        // Award points for the contribution and refresh the badge.
        await awardPointsToStudent(StudentProfile, req.user._id, POINTS_PER_REVIEW);

        res.status(201).json({
            message: 'Review submitted successfully!',
            review: formatAnonymousReview(review)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'You have already reviewed this company' });
        }

        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getCompanyReviews = async (req, res) => {
    const { companyId } = req.params;

    try {
        let company;
        if (mongoose.isValidObjectId(companyId)) {
            company = await CompanyProfile.findById(companyId);
        }
        if (!company) {
            company = await CompanyProfile.findOne({ companyName: new RegExp(companyId, 'i') });
        }

        if (!company) {
            return res.status(200).json({
                companyId,
                averageRating: 0,
                reviewCount: 0,
                reviews: []
            });
        }

        const reviews = await Review.find({ company: company._id })
            .select('rating comment createdAt _id')
            .sort({ createdAt: -1 });

        res.status(200).json({
            companyId: company._id,
            averageRating: calculateAverageRating(reviews),
            reviewCount: reviews.length,
            reviews: reviews.map((r) => ({
                id: r._id,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Feature: Global All Reviews endpoint for the public Reviews section
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate({ path: 'company', select: 'companyName industry website' })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Reviews fetched successfully',
            count: reviews.length,
            reviews: reviews.map((r) => ({
                id: r._id,
                company: r.company?.companyName || 'Partner Company',
                companyId: r.company?._id || null,
                industry: r.company?.industry || 'Technology',
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const deleteReview = async (req, res) => {
    const { reviewId } = req.params;

    if (!mongoose.isValidObjectId(reviewId)) {
        return res.status(400).json({ message: 'Invalid review ID' });
    }

    try {
        const review = await Review.findByIdAndDelete(reviewId);
        // Also mark any associated flags as Resolved
        await Flag.updateMany({ review: reviewId }, { status: 'Resolved' });

        res.status(200).json({
            message: 'Review deleted successfully',
            reviewId
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    POINTS_PER_REVIEW,
    createReview,
    getCompanyReviews,
    getAllReviews,
    deleteReview
};
