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
    role: {
        type: String,
        trim: true,
        default: 'Intern Applicant'
    },
    interviewType: {
        type: String,
        default: 'Online'
    },
    rounds: {
        type: String,
        default: '1'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    process: {
        type: String,
        trim: true,
        default: '',
        maxlength: [5000, 'Process cannot exceed 5000 characters']
    },
    questions: {
        type: String,
        required: true,
        trim: true,
        maxlength: [5000, 'Questions cannot exceed 5000 characters']
    },
    tips: {
        type: String,
        trim: true,
        default: '',
        maxlength: [3000, 'Tips cannot exceed 3000 characters']
    },
    outcome: {
        type: String,
        default: 'Waiting'
    },
    interviewDate: {
        type: String,
        default: ''
    },
    datePosted: {
        type: Date,
        default: Date.now,
        required: true
    }
});

interviewExperienceSchema.index({ company: 1, datePosted: -1 });

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
