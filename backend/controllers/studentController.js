const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

// Create or Update Student Profile (Feature 3)
const updateStudentProfile = async (req, res) => {
    try {
        const { bio, skills, avatar } = req.body; // Points and Badges will be automatically assigned initially
        const user = req.user._id;

        // Check if profile exists, if yes, update it. If not, create a new one.
        let profile = await StudentProfile.findOne({ user });

        if (profile) {
            // Update existing profile
            profile.bio = bio !== undefined ? bio : profile.bio;
            profile.skills = skills !== undefined ? skills : profile.skills;
            if (avatar !== undefined) profile.avatar = avatar;
            await profile.save();
        } else {
            // Create new profile
            profile = await StudentProfile.create({ user, bio, skills, avatar: avatar || '' });
        }

        if (avatar !== undefined) {
            await User.findByIdAndUpdate(user, { avatar });
        }

        res.status(200).json({
            message: 'Student Profile updated successfully!',
            profile
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Feature 17: Contributor Leaderboard
// Public ranking of students by contributor points (highest first).
const getLeaderboard = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 100);

        const topContributors = await StudentProfile.find({ points: { $gt: 0 } })
            .sort({ points: -1 })
            .limit(limit)
            .populate({ path: 'user', select: 'name' });

        const leaderboard = topContributors.map((profile, index) => ({
            rank: index + 1,
            name: profile.user ? profile.user.name : 'Unknown',
            points: profile.points,
            badge: profile.badge
        }));

        res.status(200).json({
            message: 'Leaderboard fetched successfully!',
            leaderboard
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Feature 3: Get logged in Student Profile
const getStudentProfile = async (req, res) => {
    try {
        let profile = await StudentProfile.findOne({ user: req.user._id });
        if (!profile) {
            profile = await StudentProfile.create({
                user: req.user._id,
                bio: '',
                skills: [],
                points: 0,
                badge: 'Newbie',
                avatar: req.user.avatar || ''
            });
        }
        res.status(200).json({
            message: 'Student profile fetched successfully',
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                avatar: profile.avatar || req.user.avatar || ''
            },
            profile: {
                bio: profile.bio,
                skills: profile.skills,
                points: profile.points,
                badge: profile.badge,
                avatar: profile.avatar || req.user.avatar || ''
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Feature: Upload Student Photo / Avatar
const uploadStudentAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const avatarRelativePath = `/uploads/avatars/${req.file.filename}`;
        const userId = req.user._id;

        await User.findByIdAndUpdate(userId, { avatar: avatarRelativePath });

        let profile = await StudentProfile.findOne({ user: userId });
        if (profile) {
            profile.avatar = avatarRelativePath;
            await profile.save();
        } else {
            profile = await StudentProfile.create({
                user: userId,
                avatar: avatarRelativePath
            });
        }

        res.status(200).json({
            message: 'Profile picture uploaded successfully!',
            avatarUrl: avatarRelativePath,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                avatar: avatarRelativePath
            },
            profile: {
                bio: profile.bio,
                skills: profile.skills,
                points: profile.points,
                badge: profile.badge,
                avatar: avatarRelativePath
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { updateStudentProfile, getLeaderboard, getStudentProfile, uploadStudentAvatar };
