const StudentProfile = require('../models/StudentProfile');

// Create or Update Student Profile (Feature 3)
const updateStudentProfile = async (req, res) => {
    try {
        const { bio, skills } = req.body; // Points and Badges will be automatically assigned initially
        const user = req.user._id;

        // Check if profile exists, if yes, update it. If not, create a new one.
        let profile = await StudentProfile.findOne({ user });

        if (profile) {
            // Update existing profile
            profile.bio = bio || profile.bio;
            profile.skills = skills || profile.skills;
            await profile.save();
        } else {
            // Create new profile
            profile = await StudentProfile.create({ user, bio, skills });
        }

        res.status(200).json({
            message: 'Student Profile updated successfully!',
            profile
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { updateStudentProfile };
