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
        enum: ['Paid', 'Unpaid'], // তোমার রিকয়ারমেন্ট অনুযায়ী
        required: true
    },
    mode: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'], // তোমার রিকয়ারমেন্ট অনুযায়ী
        required: true
    },
    deadline: {
        type: String, // উদাহরণ: "20 August"
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);