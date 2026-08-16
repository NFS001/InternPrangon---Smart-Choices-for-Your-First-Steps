const mongoose = require('mongoose');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Resume = require('../models/Resume');

const formatApplication = (application) => ({
    applicationId: application._id,
    internship: application.internship,
    resume: application.resume,
    status: application.status,
    appliedDate: application.appliedDate
});

const applyToInternship = async (req, res) => {
    const student = req.user._id;
    const { internshipId } = req.params;

    if (!mongoose.isValidObjectId(internshipId)) {
        return res.status(400).json({ message: 'Invalid internship ID' });
    }

    try {
        const internship = await Internship.findById(internshipId);

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        const resume = await Resume.findOne({ studentId: student });

        if (!resume) {
            return res.status(400).json({ message: 'Please upload a resume before applying.' });
        }

        const existingApplication = await Application.findOne({
            student,
            internship: internship._id
        });

        if (existingApplication) {
            return res.status(409).json({ message: 'You have already applied to this internship' });
        }

        const application = await Application.create({
            student,
            internship: internship._id,
            resume: resume._id,
            status: 'Applied',
            appliedDate: new Date()
        });

        res.status(201).json({
            message: 'Application submitted successfully!',
            application: formatApplication(application)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'You have already applied to this internship' });
        }

        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { applyToInternship };
