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

// Update the exports at the bottom
module.exports = { submitCompanyProfile, verifyCompany, getAllCompanies, deleteCompany };
