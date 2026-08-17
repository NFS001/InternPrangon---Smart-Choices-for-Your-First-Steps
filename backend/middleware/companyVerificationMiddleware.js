const CompanyProfile = require('../models/CompanyProfile');

const requireApprovedCompany = async (req, res, next) => {
    try {
        const companyProfile = await CompanyProfile.findOne({
            user: req.user._id
        });

        if (!companyProfile) {
            return res.status(404).json({
                message: 'Company profile not found'
            });
        }

        if (companyProfile.verificationStatus !== 'Approved') {
            return res.status(403).json({
                message: 'Only approved companies can manage applicants'
            });
        }

        req.companyProfile = companyProfile;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { requireApprovedCompany };