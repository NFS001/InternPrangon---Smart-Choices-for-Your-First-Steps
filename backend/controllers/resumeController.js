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

const formatResume = (resume, user) => {
    let cleanOriginalName = resume.originalName;
    const userName = (user?.name || 'Student').trim().replace(/\s+/g, '_');
    const defaultName = `${userName}_Resume.pdf`;

    if (!cleanOriginalName || cleanOriginalName === 'undefined' || cleanOriginalName === 'Resume.pdf') {
        cleanOriginalName = defaultName;
    } else if (cleanOriginalName.toLowerCase().includes('nafis') && user?.name && !user.name.toLowerCase().includes('nafis')) {
        cleanOriginalName = defaultName;
    }

    return {
        resumeId: resume._id,
        filePath: resume.filePath,
        originalName: cleanOriginalName,
        uploadedDate: resume.uploadedDate
    };
};

const uploadOrUpdateResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Resume PDF is required' });
    }

    const studentId = req.user._id;
    const newFilePath = path.posix.join('uploads', 'resumes', req.file.filename);
    const userName = (req.user?.name || 'Student').trim().replace(/\s+/g, '_');
    const originalName = req.file.originalname || `${userName}_Resume.pdf`;

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
                resume: formatResume(resume, req.user)
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
            resume: formatResume(resume, req.user)
        });
    } catch (error) {
        await removeResumeFile(newFilePath);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getCurrentResume = async (req, res) => {
    try {
        const studentId = req.user._id;
        let resume = await Resume.findOne({ studentId });

        if (!resume) {
            // Auto-create dummy resume for this student if it doesn't exist
            const userName = (req.user?.name || 'Student').trim().replace(/\s+/g, '_');
            const dummyFilename = `${userName}_Resume.pdf`;
            const dummyRelPath = path.posix.join('uploads', 'resumes', dummyFilename);

            const physicalDir = path.resolve(__dirname, '..', 'uploads', 'resumes');
            if (!fs.existsSync(physicalDir)) {
                fs.mkdirSync(physicalDir, { recursive: true });
            }
            const physicalPath = path.join(physicalDir, dummyFilename);
            if (!fs.existsSync(physicalPath)) {
                const samplePdfPath = path.resolve(__dirname, '..', '..', 'frontend', 'public', 'sample_resume.pdf');
                if (fs.existsSync(samplePdfPath)) {
                    fs.copyFileSync(samplePdfPath, physicalPath);
                } else {
                    fs.writeFileSync(physicalPath, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n200\n%%EOF');
                }
            }

            resume = await Resume.create({
                studentId,
                filePath: dummyRelPath,
                originalName: dummyFilename,
                uploadedDate: new Date()
            });
        }

        res.status(200).json({
            message: 'Resume fetched successfully!',
            resume: formatResume(resume, req.user)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const downloadMyResume = async (req, res) => {
    try {
        const studentId = req.user._id;
        let resume = await Resume.findOne({ studentId });
        const userName = (req.user?.name || 'Student').trim().replace(/\s+/g, '_');
        const defaultName = `${userName}_Resume.pdf`;
        let cleanName = resume?.originalName;
        if (!cleanName || cleanName === 'undefined' || (cleanName.toLowerCase().includes('nafis') && !userName.toLowerCase().includes('nafis'))) {
            cleanName = defaultName;
        }

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

