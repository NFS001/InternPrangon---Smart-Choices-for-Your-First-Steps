const mongoose = require('mongoose');

const stipendReportSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
            message: 'Amount must be a finite number greater than or equal to 0'
        }
    },
    datePosted: {
        type: Date,
        default: Date.now,
        required: true
    }
});

stipendReportSchema.index({ student: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('StipendReport', stipendReportSchema);
