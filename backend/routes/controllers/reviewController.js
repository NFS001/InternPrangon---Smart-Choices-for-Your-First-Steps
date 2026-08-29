const mongoose = require('mongoose');
const CompanyProfile = require('../models/CompanyProfile');
const Review = require('../models/Review');

const formatAnonymousReview = (review) => ({
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

    if (!mongoose.isValidObjectId(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID' });
    }

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
        const company = await CompanyProfile.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const existingReview = await Review.findOne({
            company: company._id,
            student: req.user._id
        });

        if (existingReview) {
            return res.status(409).json({ message: 'You have already reviewed this company' });
        }

        const review = await Review.create({
            company: company._id,
            student: req.user._id,
            rating,
            comment: trimmedComment,
            createdAt: new Date()
        });

        res.status(201).json({
            message: 'Review submitted successfully!',
            review: formatAnonymousReview(review)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'You have already reviewed this company' });
        }

        res.status(500).json({ message: 'Server Error' });
    }
};

const getCompanyReviews = async (req, res) => {
    const { companyId } = req.params;

    if (!mongoose.isValidObjectId(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID' });
    }

    try {
        const company = await CompanyProfile.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const reviews = await Review.find({ company: company._id })
            .select('rating comment createdAt -_id')
            .sort({ createdAt: -1 });

        res.status(200).json({
            companyId: company._id,
            averageRating: calculateAverageRating(reviews),
            reviewCount: reviews.length,
            reviews: reviews.map(formatAnonymousReview)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createReview, getCompanyReviews };
