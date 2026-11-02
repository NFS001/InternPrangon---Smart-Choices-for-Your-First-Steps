const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10MB
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDirectory = isServerless
    ? path.join('/tmp', 'uploads', 'avatars')
    : path.join(__dirname, '..', 'uploads', 'avatars');

try {
    fs.mkdirSync(uploadDirectory, { recursive: true });
} catch (e) {
    console.warn('Could not create avatar upload directory:', e.message);
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (req, file, callback) => {
        const userId = req.user ? req.user._id.toString() : 'guest';
        const ext = path.extname(file.originalname).toLowerCase() || '.png';
        const uniqueValue = `${Date.now()}-${crypto.randomUUID()}`;
        callback(null, `avatar-${userId}-${uniqueValue}${ext}`);
    }
});

const fileFilter = (req, file, callback) => {
    // Allow jpg, png, and any other image format
    const ext = path.extname(file.originalname).toLowerCase();
    const isImageExt = /^\.(jpg|jpeg|png|webp|gif|bmp|svg|avif|ico|tiff|heic)$/i.test(ext);
    const isImageMime = file.mimetype && file.mimetype.startsWith('image/');

    if (isImageExt || isImageMime) {
        return callback(null, true);
    }

    const error = new Error('Only image files (JPG, PNG, WebP, GIF, SVG, etc.) are allowed');
    error.code = 'INVALID_FILE_TYPE';
    callback(error);
};

const upload = multer({
    storage,
    limits: { fileSize: MAX_AVATAR_SIZE },
    fileFilter
});

const uploadAvatar = (req, res, next) => {
    upload.single('avatar')(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Avatar image file must be smaller than 10MB' });
        }

        if (error.code === 'INVALID_FILE_TYPE' || error.message.includes('Only image files')) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(400).json({ message: 'Failed to upload image' });
    });
};

module.exports = { uploadAvatar };

