const mongoose = require('mongoose');

const interviewExperienceSchema = new mongoose.Schema({
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
    questions: {
        type: String,
        required: true,
        trim: true,
        maxlength: [3000, 'Questions cannot exceed 3000 characters']
    },
    datePosted: {
        type: Date,
        default: Date.now,
        required: true
    }
});

interviewExperienceSchema.index({ company: 1, datePosted: -1 });

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
