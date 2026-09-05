const mongoose = require('mongoose');
const CompanyProfile = require('../models/CompanyProfile');
const StipendReport = require('../models/StipendReport');

const formatAnonymousStipendReport = (report) => ({
    amount: report.amount,
    datePosted: report.datePosted
});

const calculateAverageStipend = (reports) => {
    if (reports.length === 0) {
        return 0;
    }

    const totalAmount = reports.reduce((total, report) => total + report.amount, 0);
    return Number((totalAmount / reports.length).toFixed(2));
};

const createStipendReport = async (req, res) => {
    const { companyId } = req.params;
    const { amount } = req.body || {};

    if (!mongoose.isValidObjectId(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID' });
    }

    if (amount === undefined || amount === null || typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
        return res.status(400).json({ message: 'Amount is required and must be a non-negative finite number' });
    }

    try {
        const company = await CompanyProfile.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const existingReport = await StipendReport.findOne({
            company: company._id,
            student: req.user._id
        });

        if (existingReport) {
            return res.status(409).json({ message: 'You have already submitted a stipend report for this company' });
        }

        const stipendReport = await StipendReport.create({
            company: company._id,
            student: req.user._id,
            amount,
            datePosted: new Date()
        });

        res.status(201).json({
            message: 'Stipend report submitted successfully!',
            stipendReport: formatAnonymousStipendReport(stipendReport)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'You have already submitted a stipend report for this company' });
        }

        res.status(500).json({ message: 'Server Error' });
    }
};

const getCompanyStipends = async (req, res) => {
    const { companyId } = req.params;

    if (!mongoose.isValidObjectId(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID' });
    }

    try {
        const company = await CompanyProfile.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const reports = await StipendReport.find({ company: company._id })
            .select('amount datePosted -_id')
            .sort({ datePosted: -1 });

        res.status(200).json({
            companyId: company._id,
            averageStipend: calculateAverageStipend(reports),
            stipendReportCount: reports.length,
            stipendReports: reports.map(formatAnonymousStipendReport)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createStipendReport, getCompanyStipends };
