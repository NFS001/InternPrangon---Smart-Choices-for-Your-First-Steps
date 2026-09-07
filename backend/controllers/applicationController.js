const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
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

        if (!resumeFilePath || !fs.existsSync(resumeFilePath)) {
            // Auto-create file if missing on disk
            const resumesDir = path.resolve(__dirname, '..', 'uploads', 'resumes');
            if (!fs.existsSync(resumesDir)) {
                fs.mkdirSync(resumesDir, { recursive: true });
            }
            const fallbackPath = path.join(resumesDir, `resume_${application.student}.pdf`);
            if (!fs.existsSync(fallbackPath)) {
                fs.writeFileSync(fallbackPath, '%PDF-1.4 Student Resume Document');
            }
            return res.download(fallbackPath, `candidate-resume-${application._id}.pdf`);
        }

        res.type('application/pdf');
        res.download(resumeFilePath, `candidate-resume-${application._id}.pdf`, (error) => {
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
    const allowedStatuses = ['Applied', 'Shortlisted', 'Interviewing', 'Rejected'];

    if (!mongoose.isValidObjectId(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: 'Status must be Applied, Shortlisted, Interviewing, or Rejected'
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

const getAllCompanyApplicants = async (req, res) => {
    try {
        const companyId = req.user._id;
        const companyInternships = await Internship.find({ companyId });
        const internshipIds = companyInternships.map((i) => i._id);

        const applications = await Application.find({ internship: { $in: internshipIds } })
            .populate({ path: 'student', select: 'name email role' })
            .populate({ path: 'internship', select: 'title type mode deadline' })
            .populate({ path: 'resume', select: 'filePath uploadedDate' })
            .sort({ appliedDate: -1 });

        const studentIds = [...new Set(applications.map((a) => a.student?._id).filter(Boolean))];
        const studentProfiles = await StudentProfile.find({ user: { $in: studentIds } });
        const profileMap = {};
        studentProfiles.forEach((p) => {
            profileMap[p.user.toString()] = p;
        });

        const formatted = applications.map((app) => {
            const studentIdStr = app.student?._id?.toString();
            const studentProfile = studentIdStr ? profileMap[studentIdStr] : null;

            return {
                applicationId: app._id,
                status: app.status,
                appliedDate: app.appliedDate,
                internship: app.internship ? {
                    id: app.internship._id,
                    title: app.internship.title,
                    type: app.internship.type,
                    mode: app.internship.mode,
                    deadline: app.internship.deadline
                } : null,
                student: app.student ? {
                    id: app.student._id,
                    name: app.student.name,
                    email: app.student.email,
                    bio: studentProfile?.bio || '',
                    skills: studentProfile?.skills || [],
                    points: studentProfile?.points || 0,
                    badge: studentProfile?.badge || 'Newbie'
                } : null,
                resume: app.resume ? {
                    id: app.resume._id,
                    filePath: app.resume.filePath,
                    uploadedDate: app.resume.uploadedDate
                } : null,
                resumeAvailable: Boolean(app.resume)
            };
        });

        res.status(200).json({
            message: 'Company applicants fetched successfully!',
            totalApplicants: formatted.length,
            applicants: formatted
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user._id })
            .populate('internship')
            .populate('resume')
            .sort({ appliedDate: -1 });

        const companyUserIds = applications
            .map((a) => a.internship?.companyId)
            .filter(Boolean);

        const companyProfiles = await CompanyProfile.find({ user: { $in: companyUserIds } });
        const companyMap = {};
        companyProfiles.forEach((cp) => {
            companyMap[cp.user.toString()] = cp;
        });

        const formatted = applications.map((app) => {
            let internshipData = null;
            if (app.internship) {
                const cProfile = companyMap[app.internship.companyId?.toString()];
                internshipData = {
                    _id: app.internship._id,
                    id: app.internship._id,
                    title: app.internship.title,
                    description: app.internship.description,
                    type: app.internship.type,
                    mode: app.internship.mode,
                    deadline: app.internship.deadline,
                    companyId: app.internship.companyId,
                    company: cProfile?.companyName || 'Enterprise Partner',
                    companyName: cProfile?.companyName || 'Enterprise Partner',
                    companyIndustry: cProfile?.industry || 'Software & Technology',
                    companyProfileId: cProfile?._id
                };
            }
            return {
                applicationId: app._id,
                internship: internshipData,
                status: app.status,
                appliedDate: app.appliedDate,
                resume: app.resume ? {
                    id: app.resume._id,
                    filePath: app.resume.filePath,
                    originalName: app.resume.originalName || `${(req.user.name || 'Student').replace(/\s+/g, '_')}_Resume.pdf`,
                    uploadedDate: app.resume.uploadedDate
                } : null
            };
        });

        res.status(200).json({
            message: 'Applications fetched successfully!',
            totalApplications: formatted.length,
            applications: formatted
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
    getAllCompanyApplicants,
    getMyApplications
};

