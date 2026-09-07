const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');
const StudentProfile = require('../models/StudentProfile');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Register API
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, industry } = req.body;
        const normalizedRole = (role || 'student').toLowerCase();

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: normalizedRole
        });

        if (normalizedRole === 'company') {
            await CompanyProfile.create({
                user: user._id,
                companyName: name,
                industry: industry || 'Software & Technology',
                description: 'Innovative company providing internship opportunities.',
                verificationStatus: 'Pending',
                verificationDocument: 'registration_document.pdf'
            }).catch(() => {});
        } else if (normalizedRole === 'student') {
            await StudentProfile.create({
                user: user._id,
                bio: '',
                skills: [],
                points: 0,
                badge: 'Newbie'
            }).catch(() => {});
        }

        res.status(201).json({
            message: 'User registered successfully!',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Login API
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password!' });
        }

        res.status(200).json({
            message: 'Login successful!',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getCurrentUser = async (req, res) => {
    res.status(200).json({
        user: req.user
    });
};

// Exporting both functions
module.exports = { registerUser, loginUser, getCurrentUser };
