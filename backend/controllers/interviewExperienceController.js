const mongoose = require('mongoose');
const CompanyProfile = require('../models/CompanyProfile');
const InterviewExperience = require('../models/InterviewExperience');
const StudentProfile = require('../models/StudentProfile');
const { awardPointsToStudent } = require('../utils/badgeHelper');

const INTERVIEW_EXPERIENCE_POINTS = 3;

const formatAnonymousInterviewExperience = (experience) => ({
    id: experience._id,
    questions: experience.questions,
    datePosted: experience.datePosted
});

const createInterviewExperience = async (req, res) => {
    const { companyId } = req.params;
    const { questions } = req.body || {};

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
        let company;
        if (mongoose.isValidObjectId(companyId)) {
            company = await CompanyProfile.findById(companyId);
        }
        if (!company) {
            company = await CompanyProfile.findOne({ companyName: new RegExp(companyId, 'i') }) || await CompanyProfile.findOne();
        }

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const interviewExperience = await InterviewExperience.create({
            company: company._id,
            student: req.user._id,
            questions: trimmedQuestions,
            datePosted: new Date()
        });

        // Award points for the contribution and refresh the badge.
        await awardPointsToStudent(
            StudentProfile,
            req.user._id,
            INTERVIEW_EXPERIENCE_POINTS
        );

        res.status(201).json({
            message: 'Interview experience submitted successfully!',
            interviewExperience: formatAnonymousInterviewExperience(interviewExperience)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getCompanyInterviewExperiences = async (req, res) => {
    const { companyId } = req.params;

    try {
        let company;
        if (mongoose.isValidObjectId(companyId)) {
            company = await CompanyProfile.findById(companyId);
        }
        if (!company) {
            company = await CompanyProfile.findOne({ companyName: new RegExp(companyId, 'i') });
        }

        if (!company) {
            return res.status(200).json({
                companyId,
                count: 0,
                interviewExperiences: []
            });
        }

        const experiences = await InterviewExperience.find({ company: company._id })
            .select('questions datePosted _id')
            .sort({ datePosted: -1 });

        res.status(200).json({
            companyId: company._id,
            count: experiences.length,
            interviewExperiences: experiences.map(formatAnonymousInterviewExperience)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Feature: Global All Interview Experiences for Reviews Page
const getAllInterviewExperiences = async (req, res) => {
    try {
        const experiences = await InterviewExperience.find()
            .populate({ path: 'company', select: 'companyName industry website' })
            .sort({ datePosted: -1 });

        res.status(200).json({
            message: 'Interview experiences fetched successfully',
            count: experiences.length,
            interviewExperiences: experiences.map((e) => ({
                id: e._id,
                company: e.company?.companyName || 'Partner Company',
                companyId: e.company?._id || null,
                industry: e.company?.industry || 'Technology',
                questions: e.questions,
                datePosted: e.datePosted
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    INTERVIEW_EXPERIENCE_POINTS,
    createInterviewExperience,
    getCompanyInterviewExperiences,
    getAllInterviewExperiences
};
