const Internship = require('../models/Internship');
const CompanyProfile = require('../models/CompanyProfile');

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

        res.status(200).json({
            message: 'Internships fetched successfully!',
            resultsFound: internships.length,
            totalResults,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalResults / limitNumber),
            internships
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
module.exports = { postInternship, searchInternships };
