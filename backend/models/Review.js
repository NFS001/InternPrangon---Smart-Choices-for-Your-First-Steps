const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyProfile',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        select: false
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer between 1 and 5'
        }
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

reviewSchema.index({ student: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
