const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        required: true
    },
    mode: {
        type: String,
        enum: ['Remote', 'On-site'],
        required: true
    },
    deadline: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
