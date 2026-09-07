const CompanyProfile = require('../models/CompanyProfile');

const requireApprovedCompany = async (req, res, next) => {
    try {
        let companyProfile = await CompanyProfile.findOne({
            user: req.user._id
        });

        if (!companyProfile) {
            companyProfile = await CompanyProfile.create({
                user: req.user._id,
                companyName: req.user.name || 'Company',
                industry: 'Software & Technology',
                description: 'Technology partner providing internship opportunities.',
                verificationStatus: 'Pending',
                verificationDocument: 'company_reg_doc.pdf'
            });
        }

        if (companyProfile.verificationStatus !== 'Approved') {
            return res.status(403).json({
                message: 'Your company verification is currently Pending Admin approval. Please wait for an Admin to verify your account.'
            });
        }

        req.companyProfile = companyProfile;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { requireApprovedCompany };