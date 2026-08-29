const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

bookmarkSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
