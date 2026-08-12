const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    // User relation
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Feature 3: Basic Company Info
    companyName: {
        type: String,
        required: true
    },
    industry: {
        type: String
    },
    description: {
        type: String
    },
    website: {
        type: String
    },
    rating: {
        type: Number,
        default: 0
    },

    // Feature 1: Company Verification Fields
    verificationDocument: {
        type: String, // Here we will store the document link/name
        required: true 
    },
    verificationStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending' // default status is Pending as per your list
    }
}, { timestamps: true });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);