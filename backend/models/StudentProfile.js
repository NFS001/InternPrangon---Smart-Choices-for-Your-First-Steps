const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    skills: {
        type: [String], // Example: ['React', 'Node.js']
        default: []
    },
    points: {
        type: Number,
        default: 0 // Starting points
    },
    badge: {
        type: String,
        default: 'Newbie' // Starting badge (UML BadgeTier: Newbie)
    }
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);