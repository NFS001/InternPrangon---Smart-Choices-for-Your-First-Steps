const mongoose = require('mongoose');
const CompanyProfile = require('../models/CompanyProfile');
const InterviewExperience = require('../models/InterviewExperience');
const StudentProfile = require('../models/StudentProfile');
const { awardPointsToStudent } = require('../utils/badgeHelper');

const INTERVIEW_EXPERIENCE_POINTS = 5;

const formatAnonymousInterviewExperience = (experience) => ({
    id: experience._id,
    company: experience.company?.companyName || 'Partner Company',
    companyId: experience.company?._id || experience.company,
    role: experience.role || 'Intern Applicant',
    interviewType: experience.interviewType || 'Online',
    rounds: experience.rounds || '1',
    difficulty: experience.difficulty || 'Medium',
    process: experience.process || '',
    questions: experience.questions || '',
    tips: experience.tips || '',
    outcome: experience.outcome || 'Waiting',
    interviewDate: experience.interviewDate || '',
    datePosted: experience.datePosted
});

const createInterviewExperience = async (req, res) => {
    const { companyId } = req.params;
    const {
        role,
        interviewType,
        rounds,
        difficulty,
        process,
        questions,
        tips,
        outcome,
        interviewDate
    } = req.body || {};

    const effectiveProcess = typeof process === 'string' ? process.trim() : '';
    const effectiveQuestions = typeof questions === 'string' ? questions.trim() : '';

    if (!effectiveProcess && !effectiveQuestions) {
        return res.status(400).json({ message: 'Interview process or questions are required' });
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
            role: (typeof role === 'string' && role.trim()) ? role.trim() : 'Intern Applicant',
            interviewType: typeof interviewType === 'string' && interviewType.trim() ? interviewType.trim() : 'Online',
            rounds: String(rounds || '1'),
            difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium',
            process: effectiveProcess,
            questions: effectiveQuestions || effectiveProcess || 'General Interview Discussion',
            tips: typeof tips === 'string' ? tips.trim() : '',
            outcome: outcome || 'Waiting',
            interviewDate: typeof interviewDate === 'string' ? interviewDate.trim() : '',
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
            .populate({ path: 'company', select: 'companyName industry website' })
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
                role: e.role || 'Intern Applicant',
                interviewType: e.interviewType || 'Online',
                rounds: e.rounds || '1',
                difficulty: e.difficulty || 'Medium',
                process: e.process || '',
                questions: e.questions || '',
                tips: e.tips || '',
                outcome: e.outcome || 'Waiting',
                interviewDate: e.interviewDate || '',
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
