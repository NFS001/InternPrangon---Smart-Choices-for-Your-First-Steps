const CompanyProfile = require('../models/CompanyProfile');

// HR Submitting Document (Feature 1)
const submitCompanyProfile = async (req, res) => {
    try {
        const { companyName, industry, description, website, verificationDocument } = req.body;
        const user = req.user._id;

        // Check if profile already exists
        const existingProfile = await CompanyProfile.findOne({ user });
        if (existingProfile) {
            return res.status(400).json({ message: 'Company profile already exists!' });
        }

        // Create new company profile
        const newProfile = await CompanyProfile.create({
            user, 
            companyName,
            industry,
            description,
            website,
            verificationDocument
            // verificationStatus will automatically be 'Pending' by default
        });

        res.status(201).json({
            message: 'Company profile and document submitted successfully! Status is Pending.',
            profile: newProfile
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Admin Verifying Company (Feature 1 - Part 2)
const verifyCompany = async (req, res) => {
    try {
        const { status } = req.body; // 'Approved' or 'Rejected'
        const companyId = req.params.id; // Company Profile ID from URL

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be Approved or Rejected' });
        }

        // Find company and update status
        const updatedCompany = await CompanyProfile.findByIdAndUpdate(
            companyId,
            { verificationStatus: status },
            { new: true } // Returns the updated document
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Company not found!' });
        }

        res.status(200).json({
            message: `Company successfully ${status}!`,
            company: updatedCompany
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
// Admin: Get all companies (Feature 2)
const getAllCompanies = async (req, res) => {
    try {
        const companies = await CompanyProfile.find();
        res.status(200).json({
            message: 'Successfully fetched all companies',
            companies
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Admin: Delete a company (Feature 2)
const deleteCompany = async (req, res) => {
    try {
        const companyId = req.params.id;

        const deletedCompany = await CompanyProfile.findByIdAndDelete(companyId);

        if (!deletedCompany) {
            return res.status(404).json({ message: 'Company not found!' });
        }

        res.status(200).json({ message: 'Company deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Public: Company Directory with dynamic rating and stipend aggregation (Feature 13)
const getCompanyDirectory = async (req, res) => {
    const { sortBy, sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        return res.status(400).json({ message: 'Page must be a positive integer' });
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        return res.status(400).json({ message: 'Limit must be an integer between 1 and 100' });
    }

    if (sortBy !== undefined && !['rating', 'averageStipend'].includes(sortBy)) {
        return res.status(400).json({ message: "sortBy must be 'rating' or 'averageStipend'" });
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
        return res.status(400).json({ message: "sortOrder must be 'asc' or 'desc'" });
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    let sortStage = {};

    if (sortBy === 'rating') {
        sortStage = { averageRating: sortDirection, _id: 1 };
    } else if (sortBy === 'averageStipend') {
        sortStage = { averageStipend: sortDirection, _id: 1 };
    } else {
        sortStage = { _id: sortDirection };
    }

    const skip = (pageNumber - 1) * limitNumber;

    try {
        const pipeline = [
            {
                $match: { verificationStatus: 'Approved' }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'company',
                    as: 'reviews'
                }
            },
            {
                $lookup: {
                    from: 'stipendreports',
                    localField: '_id',
                    foreignField: 'company',
                    as: 'stipendReports'
                }
            },
            {
                $addFields: {
                    reviewCount: { $size: '$reviews' },
                    averageRating: {
                        $cond: [
                            { $gt: [{ $size: '$reviews' }, 0] },
                            { $round: [{ $avg: '$reviews.rating' }, 1] },
                            0
                        ]
                    },
                    stipendReportCount: { $size: '$stipendReports' },
                    averageStipend: {
                        $cond: [
                            { $gt: [{ $size: '$stipendReports' }, 0] },
                            { $round: [{ $avg: '$stipendReports.amount' }, 2] },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    companyName: 1,
                    industry: 1,
                    description: 1,
                    website: 1,
                    verificationStatus: 1,
                    averageRating: 1,
                    reviewCount: 1,
                    averageStipend: 1,
                    stipendReportCount: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: sortStage
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [{ $skip: skip }, { $limit: limitNumber }]
                }
            }
        ];

        const results = await CompanyProfile.aggregate(pipeline);
        const totalCompanies = results[0]?.metadata[0]?.total || 0;
        const totalPages = Math.ceil(totalCompanies / limitNumber) || 1;
        const companies = results[0]?.data || [];

        res.status(200).json({
            totalCompanies,
            totalPages,
            currentPage: pageNumber,
            limit: limitNumber,
            companies
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update the exports at the bottom
module.exports = {
    submitCompanyProfile,
    verifyCompany,
    getAllCompanies,
    deleteCompany,
    getCompanyDirectory
};
