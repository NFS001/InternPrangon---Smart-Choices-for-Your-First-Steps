// Feature 16: Contributor Badge System
// Badge tiers are based on total contributor points. Keep this list in one
// place so points awarded anywhere in the app always map to the same badge.

const BADGE_TIERS = [
    { minPoints: 1000, name: 'Elite' },
    { minPoints: 600, name: 'Veteran' },
    { minPoints: 300, name: 'Insider' },
    { minPoints: 100, name: 'Explorer' },
    { minPoints: 0, name: 'Newbie' }
];

const getBadgeForPoints = (points) => {
    const tier = BADGE_TIERS.find((badgeTier) => points >= badgeTier.minPoints);
    return tier.name;
};

// Adds (or subtracts, if a negative amount is passed) points to a student's
// profile and keeps the badge field in sync with the new point total.
// Returns the updated profile, or null if the student has no profile yet.
const awardPointsToStudent = async (StudentProfile, userId, pointsToAdd) => {
    let profile = await StudentProfile.findOne({ user: userId });

    if (!profile) {
        profile = new StudentProfile({
            user: userId,
            points: 0,
            badge: getBadgeForPoints(0)
        });
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
