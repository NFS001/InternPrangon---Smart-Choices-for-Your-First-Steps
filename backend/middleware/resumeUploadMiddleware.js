const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const uploadDirectory = path.join(__dirname, '..', 'uploads', 'resumes');

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (req, file, callback) => {
        const studentId = req.user._id.toString();
        const uniqueValue = `${Date.now()}-${crypto.randomUUID()}`;

        callback(null, `${studentId}-${uniqueValue}.pdf`);
    }
});

const fileFilter = (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isPdfExtension = extension === '.pdf';
    const isPdfMimeType = file.mimetype === 'application/pdf';

    if (!isPdfExtension || !isPdfMimeType) {
        const error = new Error('Only PDF resume files are allowed');
        error.code = 'INVALID_FILE_TYPE';
        return callback(error);
    }

    callback(null, true);
};

const upload = multer({
    storage,
    limits: { fileSize: MAX_RESUME_SIZE },
    fileFilter
});

const uploadResume = (req, res, next) => {
    upload.single('resume')(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Resume PDF must not exceed 5 MB' });
        }

        if (error.code === 'INVALID_FILE_TYPE') {
            return res.status(400).json({ message: error.message });
        }

        res.status(400).json({ message: 'Resume upload failed' });
    });
};

module.exports = { uploadResume };