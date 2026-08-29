// Feature 20: Internship Deadline Reminder
// Shared so both the dedicated reminder endpoint and the bookmark list can
// flag internships the same way.

const DEADLINE_REMINDER_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const isDeadlineSoon = (deadline) => {
    const now = new Date();
    const msUntilDeadline = new Date(deadline).getTime() - now.getTime();

    return msUntilDeadline >= 0 && msUntilDeadline <= DEADLINE_REMINDER_WINDOW_MS;
};

module.exports = { isDeadlineSoon, DEADLINE_REMINDER_WINDOW_MS };
