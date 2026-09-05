const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        select: false
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Reason cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved'],
        default: 'Pending',
        required: true
    },
    dateFlagged: {
        type: Date,
        default: Date.now,
        required: true
    }
});

flagSchema.index({ reporter: 1, review: 1 }, { unique: true });

module.exports = mongoose.model('Flag', flagSchema);
