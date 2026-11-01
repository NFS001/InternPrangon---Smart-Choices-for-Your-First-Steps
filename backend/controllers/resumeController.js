const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');

const resumeDirectory = path.resolve(__dirname, '..', 'uploads', 'resumes');

const removeResumeFile = async (filePath) => {
    if (!filePath) {
        return;
    }

    const absoluteFilePath = path.resolve(__dirname, '..', filePath);

    if (path.dirname(absoluteFilePath) !== resumeDirectory) {
        return;
    }

    try {
        await fs.promises.unlink(absoluteFilePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Failed to remove resume file:', error.message);
        }
    }
};

const formatResume = (resume) => ({
    resumeId: resume._id,
    filePath: resume.filePath,
    originalName: resume.originalName || 'Nafis_Uddin_Chowdhury_Resume_2026.pdf',
    uploadedDate: resume.uploadedDate
});

const uploadOrUpdateResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Resume PDF is required' });
    }

    const studentId = req.user._id;
    const newFilePath = path.posix.join('uploads', 'resumes', req.file.filename);
    const originalName = req.file.originalname || 'Nafis_Uddin_Chowdhury_Resume_2026.pdf';

    try {
        let resume = await Resume.findOne({ studentId });

        if (!resume) {
            resume = await Resume.create({
                studentId,
                filePath: newFilePath,
                originalName,
                uploadedDate: new Date()
            });

            return res.status(201).json({
                message: 'Resume uploaded successfully!',
                resume: formatResume(resume)
            });
        }

        const oldFilePath = resume.filePath;
        resume.filePath = newFilePath;
        resume.originalName = originalName;
        resume.uploadedDate = new Date();
        await resume.save();

        await removeResumeFile(oldFilePath);

        res.status(200).json({
            message: 'Resume updated successfully!',
            resume: formatResume(resume)
        });
    } catch (error) {
        await removeResumeFile(newFilePath);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getCurrentResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ studentId: req.user._id });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json({
            message: 'Resume fetched successfully!',
            resume: formatResume(resume)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const downloadMyResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ studentId: req.user._id });
        const cleanName = resume?.originalName || 'Nafis_Uddin_Chowdhury_Resume.pdf';

        if (resume && resume.filePath) {
            const absolutePath = path.resolve(__dirname, '..', resume.filePath);
            if (fs.existsSync(absolutePath)) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${cleanName}"`);
                return fs.createReadStream(absolutePath).pipe(res);
            }
        }

        // Check fallback sample_resume.pdf in frontend/public
        const samplePdfPath = path.resolve(__dirname, '..', '..', 'frontend', 'public', 'sample_resume.pdf');
        if (fs.existsSync(samplePdfPath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${cleanName}"`);
            return fs.createReadStream(samplePdfPath).pipe(res);
        }

        res.status(404).json({ message: 'Resume document not available on disk' });
    } catch (error) {
        res.status(500).json({ message: 'Server error downloading resume' });
    }
};

module.exports = { uploadOrUpdateResume, getCurrentResume, downloadMyResume };

