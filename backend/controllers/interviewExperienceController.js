const mongoose = require('mongoose');
const CompanyProfile = require('../models/CompanyProfile');
const InterviewExperience = require('../models/InterviewExperience');
const StudentProfile = require('../models/StudentProfile');

const INTERVIEW_EXPERIENCE_POINTS = 3;

const formatAnonymousInterviewExperience = (experience) => ({
    questions: experience.questions,
    datePosted: experience.datePosted
});

const createInterviewExperience = async (req, res) => {
    const { companyId } = req.params;
    const { questions } = req.body || {};

    if (!mongoose.isValidObjectId(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID' });
    }

    if (typeof questions !== 'string') {
        return res.status(400).json({ message: 'Questions are required and must be text' });
    }

    const trimmedQuestions = questions.trim();

    if (!trimmedQuestions) {
        return res.status(400).json({ message: 'Questions cannot be empty' });
    }

    if (trimmedQuestions.length > 3000) {
        return res.status(400).json({ message: 'Questions cannot exceed 3000 characters' });
    }

    try {
        const company = await CompanyProfile.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const interviewExperience = await InterviewExperience.create({
            company: company._id,
            student: req.user._id,
            questions: trimmedQuestions,
            datePosted: new Date()
        });

        // Award points atomically to author upon successful creation
        await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $inc: { points: INTERVIEW_EXPERIENCE_POINTS } },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        res.status(201).json({
            message: 'Interview experience submitted successfully!',
            interviewExperience: formatAnonymousInterviewExperience(interviewExperience)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getCompanyInterviewExperiences = async (req, res) => {
    const { companyId } = req.params;

    if (!mongoose.isValidObjectId(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID' });
    }

    try {
        const company = await CompanyProfile.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const experiences = await InterviewExperience.find({ company: company._id })
            .select('questions datePosted -_id')
            .sort({ datePosted: -1 });

        res.status(200).json({
            companyId: company._id,
            count: experiences.length,
            interviewExperiences: experiences.map(formatAnonymousInterviewExperience)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    INTERVIEW_EXPERIENCE_POINTS,
    createInterviewExperience,
    getCompanyInterviewExperiences
};
