const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CompanyProfile = require('../models/CompanyProfile');
const StudentProfile = require('../models/StudentProfile');
const Review = require('../models/Review');
const Flag = require('../models/Flag');
const User = require('../models/User');

const reviewRoutes = require('../routes/reviewRoutes');
const flagRoutes = require('../routes/flagRoutes');

const runId = crypto.randomUUID();
const password = `Test-${crypto.randomUUID()}-A1`;

const createdUserIds = [];
const createdCompanyProfileIds = [];
let server;

const createToken = (userId) => jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

const expectJson = async (response, expectedStatus, testName) => {
    const body = await response.json();
    if (response.status !== expectedStatus) {
        throw new Error(`${testName}: expected ${expectedStatus}, received ${response.status} ${JSON.stringify(body)}`);
    }
    return body;
};

const cleanUp = async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    if (createdUserIds.length > 0 || createdCompanyProfileIds.length > 0) {
        await Promise.all([
            Review.deleteMany({
                $or: [
                    { student: { $in: createdUserIds } },
                    { company: { $in: createdCompanyProfileIds } }
                ]
            }),
            Flag.deleteMany({
                reporter: { $in: createdUserIds }
            }),
            CompanyProfile.deleteMany({ _id: { $in: createdCompanyProfileIds } }),
            StudentProfile.deleteMany({ user: { $in: createdUserIds } }),
            User.deleteMany({ _id: { $in: createdUserIds } })
        ]);
    }
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    console.log('Test review moderation data cleaned up successfully');
};

const runTests = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const app = express();
    app.use(express.json());
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/flags', flagRoutes);

    server = app.listen(0);
    const { port } = server.address();
    const rootUrl = `http://127.0.0.1:${port}/api`;

    // 1. Create student, company, and admin users
    const student = await User.create({
        name: 'Reviewer Student',
        email: `student-${runId}@example.com`,
        password,
        role: 'student'
    });
    createdUserIds.push(student._id);
    await StudentProfile.create({ user: student._id, points: 0, badge: 'Newbie' });

    const reporterStudent = await User.create({
        name: 'Reporter Student',
        email: `reporter-${runId}@example.com`,
        password,
        role: 'student'
    });
    createdUserIds.push(reporterStudent._id);
    await StudentProfile.create({ user: reporterStudent._id, points: 0, badge: 'Newbie' });

    const companyUser = await User.create({
        name: 'Company User',
        email: `company-${runId}@example.com`,
        password,
        role: 'company'
    });
    createdUserIds.push(companyUser._id);

    const company = await CompanyProfile.create({
        user: companyUser._id,
        companyName: `Moderation Test Co ${runId.slice(0, 6)}`,
        industry: 'Software',
        verificationDocument: 'moderation-doc.pdf',
        verificationStatus: 'Approved'
    });
    createdCompanyProfileIds.push(company._id);

    const admin = await User.create({
        name: 'Admin User',
        email: `admin-${runId}@example.com`,
        password,
        role: 'admin'
    });
    createdUserIds.push(admin._id);

    const studentToken = createToken(student._id);
    const reporterToken = createToken(reporterStudent._id);
    const adminToken = createToken(admin._id);

    console.log('--- STARTING ADMIN REVIEW MODERATION & DELETION TESTS ---');

    // 2. Student creates a review
    let res = await fetch(`${rootUrl}/reviews/company/${company._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ rating: 1, comment: 'Suspicious fake claim in review.' })
    });
    const reviewBody = await expectJson(res, 201, 'Student post review');
    const reviewId = reviewBody.review.id;
    console.log('PASS: Student posted initial review');

    // 3. Reporter student flags the review
    res = await fetch(`${rootUrl}/flags/review/${reviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${reporterToken}` },
        body: JSON.stringify({ reason: 'Fake or misleading' })
    });
    const flagBody = await expectJson(res, 201, 'Student flag review');
    const flagId = flagBody.flag._id;
    console.log('PASS: Student reported review with reason "Fake or misleading"');

    // 4. Unauthorized DELETE attempts
    res = await fetch(`${rootUrl}/reviews/${reviewId}`, {
        method: 'DELETE'
    });
    await expectJson(res, 401, 'Unauthenticated review deletion');
    console.log('PASS: Unauthenticated review deletion rejected with 401');

    res = await fetch(`${rootUrl}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${reporterToken}` }
    });
    await expectJson(res, 403, 'Student review deletion');
    console.log('PASS: Student review deletion rejected with 403');

    // 5. Admin DELETE review
    res = await fetch(`${rootUrl}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    await expectJson(res, 200, 'Admin review deletion');
    console.log('PASS: Admin deleted review with 200 OK');

    // 6. Verify review is gone from DB
    const deletedReview = await Review.findById(reviewId);
    if (deletedReview) {
        throw new Error('Review was not removed from DB');
    }
    console.log('PASS: Review successfully removed from DB');

    // 7. Verify associated flag was automatically resolved
    const resolvedFlag = await Flag.findById(flagId);
    if (!resolvedFlag || resolvedFlag.status !== 'Resolved') {
        throw new Error(`Associated flag status was expected to be 'Resolved', got ${resolvedFlag?.status}`);
    }
    console.log('PASS: Associated flag was automatically resolved upon review deletion');

    console.log('\n======================================================');
    console.log('ALL REVIEW MODERATION & DELETION TESTS PASSED (100%)');
    console.log('======================================================\n');
};

runTests()
    .catch((error) => {
        console.error(`FAIL: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(cleanUp);
