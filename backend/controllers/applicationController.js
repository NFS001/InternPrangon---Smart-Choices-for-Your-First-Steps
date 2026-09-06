const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Resume = require('../models/Resume');
const { createNotification } = require('./notificationController');

const resumeDirectory = path.resolve(__dirname, '..', 'uploads', 'resumes');

const formatApplication = (application) => ({
    applicationId: application._id,
    internship: application.internship,
    resume: application.resume,
    status: application.status,
    appliedDate: application.appliedDate
});

const companyOwnsInternship = (internship, companyId) => {
    return internship.companyId.toString() === companyId.toString();
};

const resolveResumeFilePath = (filePath) => {
    if (!filePath) {
        return null;
    }

    const absoluteFilePath = path.resolve(__dirname, '..', filePath);

    if (path.dirname(absoluteFilePath) !== resumeDirectory) {
        return null;
    }

    return absoluteFilePath;
};

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

        let resume = await Resume.findOne({ studentId: student });

        if (!resume) {
            // Auto-create standard resume record so application is never blocked
            const resumesDir = path.resolve(__dirname, '..', 'uploads', 'resumes');
            if (!fs.existsSync(resumesDir)) {
                fs.mkdirSync(resumesDir, { recursive: true });
            }
            const dummyFilename = `resume_${student}_${Date.now()}.pdf`;
            const dummyFilePath = path.join(resumesDir, dummyFilename);
            if (!fs.existsSync(dummyFilePath)) {
                fs.writeFileSync(dummyFilePath, '%PDF-1.4 Default Student Resume Placeholder');
            }
            resume = await Resume.create({
                studentId: student,
                filePath: path.posix.join('uploads', 'resumes', dummyFilename),
                uploadedDate: new Date()
            });
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

        // Feature 18: notify the company that a new application came in
        await createNotification({
            recipient: internship.companyId,
            type: 'ApplicationStatus',
            message: `A new applicant applied to your internship "${internship.title}".`
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

const getApplicantsForInternship = async (req, res) => {
    const { internshipId } = req.params;

    if (!mongoose.isValidObjectId(internshipId)) {
        return res.status(400).json({ message: 'Invalid internship ID' });
    }

    try {
        const internship = await Internship.findById(internshipId);

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        if (!companyOwnsInternship(internship, req.user._id)) {
            return res.status(403).json({ message: 'You cannot access applicants for this internship' });
        }

        const applications = await Application.find({ internship: internship._id })
            .populate({ path: 'student', select: 'name email' })
            .populate({ path: 'resume', select: 'uploadedDate' })
            .sort({ appliedDate: -1 });

        res.status(200).json({
            message: 'Applicants fetched successfully!',
            internship: {
                id: internship._id,
                title: internship.title
            },
            applications: applications.map((application) => ({
                applicationId: application._id,
                student: application.student ? {
                    id: application.student._id,
                    name: application.student.name,
                    email: application.student.email
                } : null,
                status: application.status,
                appliedDate: application.appliedDate,
                resumeAvailable: Boolean(application.resume)
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const downloadApplicantResume = async (req, res) => {
    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    try {
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const internship = await Internship.findById(application.internship);

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        if (!companyOwnsInternship(internship, req.user._id)) {
            return res.status(403).json({ message: 'You cannot access this applicant resume' });
        }

        const resume = await Resume.findById(application.resume);

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const resumeFilePath = resolveResumeFilePath(resume.filePath);

        if (!resumeFilePath) {
            return res.status(404).json({ message: 'Resume file not found' });
        }

        try {
            const fileStats = await fs.promises.stat(resumeFilePath);

            if (!fileStats.isFile()) {
                return res.status(404).json({ message: 'Resume file not found' });
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({ message: 'Resume file not found' });
            }

            throw error;
        }

        res.type('application/pdf');
        res.download(resumeFilePath, `resume-${application._id}.pdf`, (error) => {
            if (error && !res.headersSent) {
                res.status(500).json({ message: 'Resume download failed' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateApplicationStatus = async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body || {};
    const allowedStatuses = ['Shortlisted', 'Interviewing', 'Rejected'];

    if (!mongoose.isValidObjectId(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: 'Status must be Shortlisted, Interviewing, or Rejected'
        });
    }

    try {
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const internship = await Internship.findById(application.internship);

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        if (!companyOwnsInternship(internship, req.user._id)) {
            return res.status(403).json({ message: 'You cannot update this application' });
        }

        application.status = status;
        await application.save();

        // Feature 18: notify the student their application status changed
        await createNotification({
            recipient: application.student,
            type: 'ApplicationStatus',
            message: `Your application for "${internship.title}" is now ${status}.`
        });

        res.status(200).json({
            message: 'Application status updated successfully!',
            application: {
                applicationId: application._id,
                internship: application.internship,
                status: application.status,
                appliedDate: application.appliedDate
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user._id })
            .populate('internship')
            .sort({ appliedDate: -1 });

        res.status(200).json({
            message: 'Applications fetched successfully!',
            totalApplications: applications.length,
            applications: applications.map((app) => ({
                applicationId: app._id,
                internship: app.internship,
                status: app.status,
                appliedDate: app.appliedDate
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    applyToInternship,
    getApplicantsForInternship,
    downloadApplicantResume,
    updateApplicationStatus,
    getMyApplications
};

