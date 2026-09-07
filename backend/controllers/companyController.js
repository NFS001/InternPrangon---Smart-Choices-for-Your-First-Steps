const CompanyProfile = require('../models/CompanyProfile');
const { createNotification } = require('./notificationController');

// HR Submitting/Updating Document (Feature 1)
const submitCompanyProfile = async (req, res) => {
    try {
        const { companyName, industry, description, website, verificationDocument } = req.body;
        const user = req.user._id;

        // Check if profile already exists
        let profile = await CompanyProfile.findOne({ user });
        if (profile) {
            if (companyName) profile.companyName = companyName;
            if (industry) profile.industry = industry;
            if (description) profile.description = description;
            if (website) profile.website = website;
            if (verificationDocument) profile.verificationDocument = verificationDocument;
            await profile.save();

            return res.status(200).json({
                message: 'Company profile updated successfully!',
                profile
            });
        }

        // Create new company profile
        const newProfile = await CompanyProfile.create({
            user, 
            companyName,
            industry: industry || 'Software & Technology',
            description: description || 'Innovative company providing internship opportunities.',
            website: website || '',
            verificationDocument: verificationDocument || 'trade_license.pdf',
            verificationStatus: 'Pending'
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

        // Feature 18: notify the company's account of the approval/rejection
        await createNotification({
            recipient: updatedCompany.user,
            type: 'CompanyVerification',
            message: `Your company profile "${updatedCompany.companyName}" was ${status.toLowerCase()}.`
        });

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
        const companies = await CompanyProfile.find().populate('user', 'name email role');
        res.status(200).json({
            message: 'Successfully fetched all companies',
            companies
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Admin: Add a company directly
const addCompanyByAdmin = async (req, res) => {
    try {
        const { companyName, industry, description, website, verificationStatus = 'Pending', verificationDocument = 'trade_license.pdf' } = req.body;
        if (!companyName) {
            return res.status(400).json({ message: 'Company name is required' });
        }
        const newProfile = await CompanyProfile.create({
            user: req.user._id,
            companyName,
            industry: industry || 'Technology',
            description: description || 'Enterprise partner in Bangladesh.',
            website: website || 'https://example.com',
            verificationDocument: verificationDocument || 'trade_license.pdf',
            verificationStatus: verificationStatus || 'Pending'
        });

        res.status(201).json({
            message: 'Company added successfully by admin',
            company: newProfile
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

const mongoose = require('mongoose');
const Review = require('../models/Review');
const StipendReport = require('../models/StipendReport');
const Internship = require('../models/Internship');

// Public: Company Directory with dynamic rating and stipend aggregation (Feature 13)
const getCompanyDirectory = async (req, res) => {
    const { sortBy, sortOrder = 'desc', page = 1, limit = 20, verifiedOnly } = req.query;

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
        const matchStage = verifiedOnly === 'true' ? { verificationStatus: 'Approved' } : {};
        const pipeline = [
            ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
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

// Public: Get specific company details by ID
const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        let company = null;

        if (mongoose.isValidObjectId(id)) {
            company = await CompanyProfile.findById(id).populate('user', 'name email');
            if (!company) {
                company = await CompanyProfile.findOne({ user: id }).populate('user', 'name email');
            }
        }

        if (!company) {
            company = await CompanyProfile.findOne({ companyName: new RegExp('^' + id + '$', 'i') }).populate('user', 'name email');
        }

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const companyUserTarget = company.user?._id || company.user;
        const [reviews, stipends, internships] = await Promise.all([
            Review.find({ company: company._id }).sort({ createdAt: -1 }),
            StipendReport.find({ company: company._id }),
            Internship.find({
                $or: [
                    ...(companyUserTarget ? [{ companyId: companyUserTarget }] : []),
                    { companyId: company._id }
                ]
            }).sort({ createdAt: -1 })
        ]);

        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
            : 0;

        const stipendReportCount = stipends.length;
        const averageStipend = stipendReportCount > 0
            ? Math.round(stipends.reduce((acc, s) => acc + s.amount, 0) / stipendReportCount)
            : 0;

        res.status(200).json({
            message: 'Company details fetched successfully',
            company: {
                _id: company._id,
                companyName: company.companyName,
                industry: company.industry || 'Software & Technology',
                description: company.description || 'Verified organization on InternPrangon.',
                website: company.website || '',
                verificationStatus: company.verificationStatus,
                averageRating,
                reviewCount,
                averageStipend,
                stipendReportCount,
                internshipsCount: internships.length,
                internships: internships.map((i) => ({
                    _id: i._id,
                    id: i._id,
                    title: i.title,
                    description: i.description,
                    type: i.type,
                    mode: i.mode,
                    deadline: i.deadline,
                    createdAt: i.createdAt
                })),
                reviews: reviews.map((r) => ({
                    _id: r._id,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.createdAt
                })),
                createdAt: company.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Feature 3: Get logged in Company Profile
const getMyCompanyProfile = async (req, res) => {
    try {
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        res.status(200).json({
            message: 'Company profile fetched successfully',
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            },
            profile: companyProfile || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    submitCompanyProfile,
    verifyCompany,
    getAllCompanies,
    addCompanyByAdmin,
    deleteCompany,
    getCompanyDirectory,
    getCompanyById,
    getMyCompanyProfile
};
