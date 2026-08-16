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

// Search & Filter Internships (Feature 5)
const searchInternships = async (req, res) => {
    try {
        const { keyword, type, mode } = req.query; // Query parameters থেকে ডেটা নিব

        let query = {};

        // 1. Keyword Search (Title বা Description-এ খুঁজবে)
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } }, // 'i' মানে Case Insensitive
                { description: { $regex: keyword, $options: 'i' } }
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
        const internships = await Internship.find(query);

        res.status(200).json({
            message: 'Internships fetched successfully!',
            resultsFound: internships.length,
            internships
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
module.exports = { postInternship, searchInternships };
