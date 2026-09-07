const Internship = require('../models/Internship');
const CompanyProfile = require('../models/CompanyProfile');
const Application = require('../models/Application');
const { isDeadlineSoon, DEADLINE_REMINDER_WINDOW_MS } = require('../utils/deadlineHelper');

// Post a new Internship (Feature 4)
const postInternship = async (req, res) => {
    try {
        const { title, description, type, mode, deadline } = req.body;
        const companyId = req.user._id;
        const parsedDeadline = new Date(deadline);

        if (!['Paid', 'Unpaid'].includes(type)) {
            return res.status(400).json({ message: 'Type must be Paid or Unpaid' });
        }

        if (!['Remote', 'On-site'].includes(mode)) {
            return res.status(400).json({ message: 'Mode must be Remote or On-site' });
        }

        if (Number.isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({ message: 'Deadline must be a valid date' });
        }

        // Step 1: Check company profile and its verification status
        let companyProfile = await CompanyProfile.findOne({ user: companyId });

        if (!companyProfile) {
            companyProfile = await CompanyProfile.create({
                user: companyId,
                companyName: req.user.name || 'Company',
                industry: 'Software & Technology',
                description: 'Technology partner providing internship opportunities.',
                verificationStatus: 'Pending',
                verificationDocument: 'company_reg_doc.pdf'
            });
        }

        if (companyProfile.verificationStatus !== 'Approved') {
            return res.status(403).json({
                message: 'Only Approved companies can post internships! Your verification status is currently ' + companyProfile.verificationStatus + '.'
            });
        }

        // Step 2: If Approved, create the internship post
        const newInternship = await Internship.create({
            companyId,
            title,
            description,
            type,
            mode,
            deadline: parsedDeadline
        });

        res.status(201).json({
            message: 'Internship posted successfully!',
            internship: newInternship
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Search, filter, sort, and paginate active internships (Feature 6)
const searchInternships = async (req, res) => {
    try {
        const { keyword, type, mode } = req.query; // Query parameters থেকে ডেটা নিব
        const { page = '1', limit = '10', sortBy = 'deadline', sortOrder = 'asc' } = req.query;
        const validTypes = ['Paid', 'Unpaid'];
        const validModes = ['Remote', 'On-site'];
        const validSortFields = ['deadline', 'title', 'createdAt'];
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (type && !validTypes.includes(type)) {
            return res.status(400).json({ message: 'Type must be Paid or Unpaid' });
        }

        if (mode && !validModes.includes(mode)) {
            return res.status(400).json({ message: 'Mode must be Remote or On-site' });
        }

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ message: 'Page must be a positive integer' });
        }

        if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
            return res.status(400).json({ message: 'Limit must be an integer between 1 and 100' });
        }

        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({ message: 'Sort field must be deadline, title, or createdAt' });
        }

        if (!['asc', 'desc'].includes(sortOrder)) {
            return res.status(400).json({ message: 'Sort order must be asc or desc' });
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const query = {};
        query.deadline = { $gte: startOfToday };

        // 1. Keyword Search (Title বা Description-এ খুঁজবে)
        if (keyword) {
            if (typeof keyword !== 'string') {
                return res.status(400).json({ message: 'Keyword must be text' });
            }

            const escapedKeyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            query.$or = [
                { title: { $regex: escapedKeyword, $options: 'i' } }, // 'i' মানে Case Insensitive
                { description: { $regex: escapedKeyword, $options: 'i' } }
            ];
        }

        // 2. Filter by Type (Paid/Unpaid)
        if (type) {
            query.type = type;
        }

        // 3. Filter by Mode (Remote/On-site)
        if (mode) {
            query.mode = mode;
        }

        // Search in database
        const skip = (pageNumber - 1) * limitNumber;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sort = { [sortBy]: sortDirection, _id: 1 };
        const [totalResults, internships] = await Promise.all([
            Internship.countDocuments(query),
            Internship.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limitNumber)
        ]);

        const companyUserIds = [...new Set(internships.map((i) => i.companyId).filter(Boolean))];
        const companyProfiles = await CompanyProfile.find({ user: { $in: companyUserIds } });
        const profileMap = {};
        companyProfiles.forEach((p) => {
            profileMap[p.user.toString()] = p;
        });

        res.status(200).json({
            message: 'Internships fetched successfully!',
            resultsFound: internships.length,
            totalResults,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalResults / limitNumber),
            internships: internships.map((internship) => {
                const compProfile = profileMap[internship.companyId?.toString()];
                return {
                    ...internship.toObject(),
                    company: compProfile?.companyName || 'Partner Company',
                    companyProfileId: compProfile?._id,
                    companyIndustry: compProfile?.industry || 'Software & Technology',
                    deadlineSoon: isDeadlineSoon(internship.deadline)
                };
            })
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Public: Get specific internship details by ID
const getInternshipById = async (req, res) => {
    try {
        const { id } = req.params;
        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        const companyProfile = await CompanyProfile.findOne({ user: internship.companyId });
        const now = new Date();
        const deadlineDate = new Date(internship.deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        res.status(200).json({
            message: 'Internship fetched successfully!',
            internship: {
                ...internship.toObject(),
                company: companyProfile?.companyName || 'Partner Company',
                companyProfileId: companyProfile?._id,
                companyIndustry: companyProfile?.industry || 'Software & Technology',
                companyWebsite: companyProfile?.website || '',
                companyVerified: companyProfile?.verificationStatus === 'Approved',
                daysLeft,
                deadlineSoon: isDeadlineSoon(internship.deadline)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Feature 20: Internship Deadline Reminder
// Returns active internships whose deadline falls within the next 3 days,
// soonest first, so the frontend can render a "closing soon" reminder list.
const getUpcomingDeadlines = async (req, res) => {
    try {
        const now = new Date();
        const reminderCutoff = new Date(now.getTime() + DEADLINE_REMINDER_WINDOW_MS);

        const internships = await Internship.find({
            deadline: { $gte: now, $lte: reminderCutoff }
        }).sort({ deadline: 1 });

        res.status(200).json({
            message: 'Internships closing soon fetched successfully!',
            resultsFound: internships.length,
            internships
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Company: Get all internships posted by logged-in company with applicant statistics
const getMyCompanyInternships = async (req, res) => {
    try {
        const companyId = req.user._id;
        const internships = await Internship.find({ companyId }).sort({ createdAt: -1 });

        const now = new Date();
        const internshipsWithMetrics = await Promise.all(
            internships.map(async (internship) => {
                const applications = await Application.find({ internship: internship._id });
                const totalApplicants = applications.length;
                const shortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
                const interviewing = applications.filter((a) => a.status === 'Interviewing').length;
                const applied = applications.filter((a) => a.status === 'Applied').length;
                const rejected = applications.filter((a) => a.status === 'Rejected').length;

                const deadlineDate = new Date(internship.deadline);
                const diffTime = deadlineDate.getTime() - now.getTime();
                const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                const isExpired = deadlineDate < now;

                return {
                    ...internship.toObject(),
                    status: isExpired ? 'expired' : 'active',
                    daysLeft,
                    totalApplicants,
                    shortlisted,
                    interviewing,
                    applied,
                    rejected
                };
            })
        );

        res.status(200).json({
            message: 'Company internships fetched successfully!',
            count: internshipsWithMetrics.length,
            internships: internshipsWithMetrics
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Company: Delete an internship
const deleteInternship = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user._id;

        const internship = await Internship.findOneAndDelete({ _id: id, companyId });
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found or unauthorized' });
        }

        await Application.deleteMany({ internship: id });

        res.status(200).json({
            message: 'Internship and associated applications deleted successfully!'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    postInternship,
    searchInternships,
    getUpcomingDeadlines,
    getMyCompanyInternships,
    deleteInternship,
    getInternshipById
};
