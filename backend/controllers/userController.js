const User = require('../models/User');

// Register API
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        res.status(201).json({
            message: 'User registered successfully!',
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

        // Check if password matches
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid email or password!' });
        }

        // Send success response
        res.status(200).json({
            message: 'Login successful!',
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

// Exporting both functions
module.exports = { registerUser, loginUser };