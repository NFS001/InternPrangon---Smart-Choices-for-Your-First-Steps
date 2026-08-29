// Feature 16: Contributor Badge System
// Badge tiers are based on total contributor points. Keep this list in one
// place so points awarded anywhere in the app always map to the same badge.

const BADGE_TIERS = [
    { minPoints: 100, name: 'Legend' },
    { minPoints: 50, name: 'Top Contributor' },
    { minPoints: 25, name: 'Active Contributor' },
    { minPoints: 10, name: 'Contributor' },
    { minPoints: 0, name: 'Beginner' }
];

const getBadgeForPoints = (points) => {
    const tier = BADGE_TIERS.find((badgeTier) => points >= badgeTier.minPoints);
    return tier.name;
};

// Adds (or subtracts, if a negative amount is passed) points to a student's
// profile and keeps the badge field in sync with the new point total.
// Returns the updated profile, or null if the student has no profile yet.
const awardPointsToStudent = async (StudentProfile, userId, pointsToAdd) => {
    const profile = await StudentProfile.findOne({ user: userId });

    if (!profile) {
        return null;
    }

    profile.points += pointsToAdd;
    if (profile.points < 0) {
        profile.points = 0;
    }

    profile.badge = getBadgeForPoints(profile.points);
    await profile.save();

    return profile;
};

module.exports = { getBadgeForPoints, awardPointsToStudent, BADGE_TIERS };
