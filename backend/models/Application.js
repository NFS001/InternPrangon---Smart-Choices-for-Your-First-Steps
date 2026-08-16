const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Shortlisted', 'Interviewing', 'Rejected'],
        default: 'Applied',
        required: true
    },
    appliedDate: {
        type: Date,
        default: Date.now,
        required: true
    }
});

applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
