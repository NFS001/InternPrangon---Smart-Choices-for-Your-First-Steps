const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    filePath: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        default: ''
    },
    uploadedDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('Resume', resumeSchema);
