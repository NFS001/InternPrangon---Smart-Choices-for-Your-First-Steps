const Internship = require('../models/Internship');
const CompanyProfile = require('../models/CompanyProfile');
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
        const companyProfile = await CompanyProfile.findOne({ user: companyId });

        if (!companyProfile) {
            return res.status(404).json({ message: 'Company profile not found!' });
        }

        if (companyProfile.verificationStatus !== 'Approved') {
            return res.status(403).json({ message: 'Only Approved companies can post internships!' });
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

        const query = {};
        query.deadline = { $gte: new Date() };

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

        // Lookup CompanyProfiles for the returned internships
        const userIds = [...new Set(internships.map((i) => String(i.companyId)))];
        const companyProfiles = await CompanyProfile.find({ user: { $in: userIds } }).lean();
        const profileMap = new Map();
        companyProfiles.forEach((cp) => profileMap.set(String(cp.user), cp));

        res.status(200).json({
            message: 'Internships fetched successfully!',
            resultsFound: internships.length,
            totalResults,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalResults / limitNumber),
            internships: internships.map((internship) => {
                const cp = profileMap.get(String(internship.companyId));
                const companyName = cp ? cp.companyName : 'Enterprise Partner';
                return {
                    ...internship.toObject(),
                    company: companyName,
                    companyProfileId: cp ? cp._id : null,
                    companyLogo: companyName.slice(0, 2).toUpperCase(),
                    companyLogoBg: '#eff6ff',
                    companyLogoColor: '#2563eb',
                    location: 'Dhaka, Bangladesh',
                    industry: cp ? cp.industry : 'Technology',
                    website: cp ? cp.website : '',
                    deadlineSoon: isDeadlineSoon(internship.deadline)
                };
            })
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

// Get single internship by ID
const getInternshipById = async (req, res) => {
    try {
        const { id } = req.params;
        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        const companyProfile = await CompanyProfile.findOne({ user: internship.companyId });
        const companyName = companyProfile ? companyProfile.companyName : 'Enterprise Partner';
        res.status(200).json({
            message: 'Internship fetched successfully',
            internship: {
                ...internship.toObject(),
                company: companyName,
                companyProfileId: companyProfile ? companyProfile._id : null,
                companyLogo: companyName.slice(0, 2).toUpperCase(),
                companyLogoBg: '#eff6ff',
                companyLogoColor: '#2563eb',
                location: 'Dhaka, Bangladesh',
                industry: companyProfile ? companyProfile.industry : 'Technology',
                website: companyProfile ? companyProfile.website : '',
                deadlineSoon: isDeadlineSoon(internship.deadline)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// HR: Get logged-in company's posted internships with live statistics (active, applicants, etc.)
const getMyCompanyInternships = async (req, res) => {
    try {
        const companyId = req.user._id;
        const Application = require('../models/Application');

        // Look up either by User ID or CompanyProfile ID
        const profile = await CompanyProfile.findOne({ user: companyId });
        const possibleIds = [companyId];
        if (profile) possibleIds.push(profile._id);

        const internships = await Internship.find({ companyId: { $in: possibleIds } }).sort({ createdAt: -1 });

        const now = new Date();
        const enrichedInternships = await Promise.all(
            internships.map(async (internship) => {
                const [totalApplicants, shortlisted, interviewing, applied, rejected] = await Promise.all([
                    Application.countDocuments({ internship: internship._id }),
                    Application.countDocuments({ internship: internship._id, status: 'Shortlisted' }),
                    Application.countDocuments({ internship: internship._id, status: 'Interviewing' }),
                    Application.countDocuments({ internship: internship._id, status: 'Applied' }),
                    Application.countDocuments({ internship: internship._id, status: 'Rejected' })
                ]);

                const daysLeft = Math.max(
                    0,
                    Math.ceil((new Date(internship.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                );

                const status = new Date(internship.deadline) >= now ? 'active' : 'expired';

                return {
                    _id: internship._id,
                    companyId: internship.companyId,
                    title: internship.title,
                    description: internship.description,
                    type: internship.type,
                    mode: internship.mode,
                    deadline: internship.deadline,
                    status,
                    daysLeft,
                    totalApplicants,
                    shortlisted,
                    interviewing,
                    applied,
                    rejected,
                    createdAt: internship.createdAt
                };
            })
        );

        res.status(200).json({
            message: 'Company internships fetched successfully',
            count: enrichedInternships.length,
            internships: enrichedInternships
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// HR: Delete company's internship post
const deleteCompanyInternship = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user._id;
        const profile = await CompanyProfile.findOne({ user: companyId });
        const allowedIds = [String(companyId)];
        if (profile) allowedIds.push(String(profile._id));

        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        if (!allowedIds.includes(String(internship.companyId))) {
            return res.status(403).json({ message: 'You are not authorized to delete this internship' });
        }

        const Application = require('../models/Application');
        await Application.deleteMany({ internship: internship._id });
        await Internship.deleteOne({ _id: internship._id });

        res.status(200).json({ message: 'Internship deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    postInternship,
    searchInternships,
    getUpcomingDeadlines,
    getInternshipById,
    getMyCompanyInternships,
    deleteCompanyInternship
};

