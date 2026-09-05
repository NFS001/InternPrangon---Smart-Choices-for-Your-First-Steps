const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CompanyProfile = require('../models/CompanyProfile');
const StudentProfile = require('../models/StudentProfile');
const Review = require('../models/Review');
const StipendReport = require('../models/StipendReport');
const InterviewExperience = require('../models/InterviewExperience');
const Flag = require('../models/Flag');
const User = require('../models/User');

const companyRoutes = require('../routes/companyRoutes');
const reviewRoutes = require('../routes/reviewRoutes');
const stipendRoutes = require('../routes/stipendRoutes');
const interviewExperienceRoutes = require('../routes/interviewExperienceRoutes');
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
        throw new Error(
            `${testName}: expected ${expectedStatus}, received ${response.status} ${JSON.stringify(body)}`
        );
    }

    return body;
};

const assertAnonymous = (value) => {
    const forbiddenKeys = new Set([
        'student',
        'studentId',
        'reporter',
        'reporterId',
        'user',
        'userId',
        'password',
        'email'
    ]);

    const inspect = (currentValue) => {
        if (!currentValue || typeof currentValue !== 'object') {
            return;
        }

        for (const [key, nestedValue] of Object.entries(currentValue)) {
            if (forbiddenKeys.has(key)) {
                throw new Error(`Anonymous response exposed forbidden field: "${key}" with value ${JSON.stringify(nestedValue)}`);
            }
            inspect(nestedValue);
        }
    };

    inspect(value);
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
            StipendReport.deleteMany({
                $or: [
                    { student: { $in: createdUserIds } },
                    { company: { $in: createdCompanyProfileIds } }
                ]
            }),
            InterviewExperience.deleteMany({
                $or: [
                    { student: { $in: createdUserIds } },
                    { company: { $in: createdCompanyProfileIds } }
                ]
            }),
            Flag.deleteMany({
                reporter: { $in: createdUserIds }
            }),
            StudentProfile.deleteMany({
                user: { $in: createdUserIds }
            })
        ]);
    }

    if (createdCompanyProfileIds.length > 0) {
        await CompanyProfile.deleteMany({ _id: { $in: createdCompanyProfileIds } });
    }

    if (createdUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: createdUserIds } });
    }

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    console.log('Temporary Sprint 3 test data cleaned up successfully');
};

const createUser = async (name, role, label) => {
    const user = await User.create({
        name,
        email: `sprint3-${label}-${runId}@example.com`,
        password,
        role
    });
    createdUserIds.push(user._id);
    return user;
};

const createCompanyProfile = async (companyUser, label, status = 'Approved') => {
    const companyProfile = await CompanyProfile.create({
        user: companyUser._id,
        companyName: `Sprint3 Company ${label} ${runId.slice(0, 8)}`,
        industry: 'Software',
        description: `Description for ${label}`,
        website: `https://${label.toLowerCase()}-${runId.slice(0, 8)}.example.com`,
        verificationDocument: `sprint3-${label}-${runId}.pdf`,
        verificationStatus: status
    });
    createdCompanyProfileIds.push(companyProfile._id);
    return companyProfile;
};

const runTests = async () => {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        throw new Error('MONGO_URI and JWT_SECRET must exist in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([
        StipendReport.init(),
        InterviewExperience.init(),
        Flag.init(),
        Review.init(),
        CompanyProfile.init(),
        StudentProfile.init(),
        User.init()
    ]);

    // Setup Express App with all Sprint 3 routes
    const app = express();
    app.use(express.json());
    app.use('/api/company', companyRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/stipends', stipendRoutes);
    app.use('/api/interview-experiences', interviewExperienceRoutes);
    app.use('/api/flags', flagRoutes);

    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const rootUrl = `http://127.0.0.1:${server.address().port}/api`;

    // Seed test users
    const student1 = await createUser('Sprint 3 Student 1', 'student', 'student1');
    const student2 = await createUser('Sprint 3 Student 2', 'student', 'student2');
    const student3 = await createUser('Sprint 3 Student 3', 'student', 'student3');
    const companyOwner1 = await createUser('Sprint 3 Company Owner 1', 'company', 'compowner1');
    const companyOwner2 = await createUser('Sprint 3 Company Owner 2', 'company', 'compowner2');
    const companyOwner3 = await createUser('Sprint 3 Company Owner 3', 'company', 'compowner3');
    const adminUser = await createUser('Sprint 3 Admin User', 'admin', 'admin');

    const s1Token = createToken(student1._id);
    const s2Token = createToken(student2._id);
    const s3Token = createToken(student3._id);
    const compToken = createToken(companyOwner1._id);
    const adminToken = createToken(adminUser._id);

    // Seed companies (2 Approved, 1 Pending, 1 Rejected)
    const companyA = await createCompanyProfile(companyOwner1, 'A', 'Approved');
    const companyB = await createCompanyProfile(companyOwner2, 'B', 'Approved');
    const companyPending = await createCompanyProfile(companyOwner3, 'Pending', 'Pending');

    console.log('--- STARTING FEATURE 11 (STIPEND CROWDSOURCING) TESTS ---');
    // 1. Unauthenticated POST stipend -> 401
    let res = await fetch(`${rootUrl}/stipends/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 15000 })
    });
    await expectJson(res, 401, 'F11: Unauthenticated stipend report');
    console.log('PASS F11: Unauthenticated stipend report rejected with 401');

    // 2. Company role POST stipend -> 403
    res = await fetch(`${rootUrl}/stipends/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${compToken}` },
        body: JSON.stringify({ amount: 15000 })
    });
    await expectJson(res, 403, 'F11: Company role stipend report');
    console.log('PASS F11: Company role stipend report rejected with 403');

    // 3. Invalid inputs
    res = await fetch(`${rootUrl}/stipends/company/invalid-object-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ amount: 15000 })
    });
    await expectJson(res, 400, 'F11: Invalid company ID');

    res = await fetch(`${rootUrl}/stipends/company/${new mongoose.Types.ObjectId()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ amount: 15000 })
    });
    await expectJson(res, 404, 'F11: Nonexistent company ID');

    res = await fetch(`${rootUrl}/stipends/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ amount: -500 })
    });
    await expectJson(res, 400, 'F11: Negative stipend amount');

    res = await fetch(`${rootUrl}/stipends/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ amount: 'invalid' })
    });
    await expectJson(res, 400, 'F11: String stipend amount');
    console.log('PASS F11: Validation for negative amounts and invalid IDs passed');

    // 4. Valid stipend creation by student 1
    res = await fetch(`${rootUrl}/stipends/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ amount: 12500.5 })
    });
    const s1StipendBody = await expectJson(res, 201, 'F11: Valid stipend report');
    assertAnonymous(s1StipendBody);
    console.log('PASS F11: Student 1 submitted stipend report (anonymous response)');

    // 5. Duplicate stipend submission by same student -> 409
    res = await fetch(`${rootUrl}/stipends/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ amount: 18000 })
    });
    await expectJson(res, 409, 'F11: Duplicate stipend report');
    console.log('PASS F11: Duplicate stipend submission rejected with 409');

    // 6. Student 2 submits stipend for company A
    res = await fetch(`${rootUrl}/stipends/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s2Token}` },
        body: JSON.stringify({ amount: 15000 })
    });
    await expectJson(res, 201, 'F11: Student 2 stipend report');

    // 7. Student 1 submits stipend for company B
    res = await fetch(`${rootUrl}/stipends/company/${companyB._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ amount: 20000 })
    });
    await expectJson(res, 201, 'F11: Student 1 stipend report for company B');

    // 8. Public GET stipends for company A
    res = await fetch(`${rootUrl}/stipends/company/${companyA._id}`);
    const compAStipends = await expectJson(res, 200, 'F11: Public GET stipends');
    assertAnonymous(compAStipends);
    // Average of 12500.5 and 15000 = 13750.25
    if (compAStipends.averageStipend !== 13750.25 || compAStipends.stipendReportCount !== 2) {
        throw new Error(`F11: Incorrect average stipend calculation: ${JSON.stringify(compAStipends)}`);
    }
    console.log('PASS F11: Public stipend summary computed correctly and anonymous');

    console.log('--- STARTING FEATURE 12 (INTERVIEW EXPERIENCE ARCHIVE) TESTS ---');
    // 1. Auth & role boundaries
    res = await fetch(`${rootUrl}/interview-experiences/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: '1. Explain React hooks\n2. Event loop in Node' })
    });
    await expectJson(res, 401, 'F12: Unauthenticated interview experience');

    res = await fetch(`${rootUrl}/interview-experiences/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${compToken}` },
        body: JSON.stringify({ questions: '1. Explain React hooks' })
    });
    await expectJson(res, 403, 'F12: Company role interview experience');

    // 2. Validation
    res = await fetch(`${rootUrl}/interview-experiences/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ questions: '   ' })
    });
    await expectJson(res, 400, 'F12: Empty questions');

    res = await fetch(`${rootUrl}/interview-experiences/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ questions: 'A'.repeat(3001) })
    });
    await expectJson(res, 400, 'F12: Oversized questions');
    console.log('PASS F12: Validation tests for questions passed');

    // 3. Valid creation by student 1
    res = await fetch(`${rootUrl}/interview-experiences/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ questions: 'Technical Round: Binary search trees, RESTful API design.' })
    });
    const ie1Body = await expectJson(res, 201, 'F12: Valid interview experience');
    assertAnonymous(ie1Body);

    // 4. Student 1 submits a SECOND experience for same company (Allowed!)
    res = await fetch(`${rootUrl}/interview-experiences/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ questions: 'HR Round: Behavioral questions and salary expectations.' })
    });
    await expectJson(res, 201, 'F12: Second interview experience by same student');
    console.log('PASS F12: Student successfully posted multiple interview experiences');

    // 5. Public GET interview experiences
    res = await fetch(`${rootUrl}/interview-experiences/company/${companyA._id}`);
    const compAExperiences = await expectJson(res, 200, 'F12: Public GET interview experiences');
    assertAnonymous(compAExperiences);
    if (compAExperiences.count !== 2 || compAExperiences.interviewExperiences.length !== 2) {
        throw new Error(`F12: Expected 2 experiences, got ${JSON.stringify(compAExperiences)}`);
    }
    console.log('PASS F12: Public interview experiences fetched anonymously');

    console.log('--- STARTING FEATURE 15 (CONTRIBUTOR POINTS SYSTEM) TESTS ---');
    // Student 1 has submitted:
    // - 1 stipend report (0 pts)
    // - 2 interview experiences (3 * 2 = 6 pts)
    let s1Profile = await StudentProfile.findOne({ user: student1._id });
    if (!s1Profile || s1Profile.points !== 6) {
        throw new Error(`F15: Expected student 1 to have 6 points, got ${s1Profile?.points}`);
    }

    // Submit a review by student 1 -> earns 5 points
    res = await fetch(`${rootUrl}/reviews/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ rating: 4, comment: 'Great working environment!' })
    });
    const reviewBody = await expectJson(res, 201, 'F15: Student 1 review creation');
    const createdReview1 = await Review.findOne({ company: companyA._id, student: student1._id }).select('+student');

    s1Profile = await StudentProfile.findOne({ user: student1._id });
    if (s1Profile.points !== 11) {
        throw new Error(`F15: Expected student 1 to have 11 points (6 + 5), got ${s1Profile.points}`);
    }
    if (s1Profile.badge !== 'Beginner') {
        throw new Error(`F15: Student badge must remain untouched, found: ${s1Profile.badge}`);
    }

    // Submit review by student 2 for company A (rating 2)
    res = await fetch(`${rootUrl}/reviews/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s2Token}` },
        body: JSON.stringify({ rating: 2, comment: 'Could improve management.' })
    });
    await expectJson(res, 201, 'F15: Student 2 review creation');
    const createdReview2 = await Review.findOne({ company: companyA._id, student: student2._id }).select('+student');

    const s2Profile = await StudentProfile.findOne({ user: student2._id });
    if (s2Profile.points !== 5) {
        throw new Error(`F15: Expected student 2 to have 5 points, got ${s2Profile.points}`);
    }

    // Attempt duplicate review (fails with 409) -> points should NOT increment
    res = await fetch(`${rootUrl}/reviews/company/${companyA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ rating: 5, comment: 'Duplicate review' })
    });
    await expectJson(res, 409, 'F15: Duplicate review attempt');
    s1Profile = await StudentProfile.findOne({ user: student1._id });
    if (s1Profile.points !== 11) {
        throw new Error(`F15: Points increased on failed review attempt! Got ${s1Profile.points}`);
    }
    console.log('PASS F15: Points system correctly awards 5 pts for review, 3 pts for experience, 0 for stipend, preserves badge');

    console.log('--- STARTING FEATURE 13 (COMPANY DIRECTORY) TESTS ---');
    // Company A: 2 reviews (4 and 2 -> avg 3.0, count 2), 2 stipend reports (12500.5 and 15000 -> avg 13750.25, count 2)
    // Company B: 0 reviews (avg 0, count 0), 1 stipend report (20000 -> avg 20000, count 1)
    // Company Pending: Approved status is false -> MUST NOT APPEAR IN DIRECTORY

    // 1. Directory query default
    res = await fetch(`${rootUrl}/company/directory`);
    const dirDefault = await expectJson(res, 200, 'F13: Default directory listing');
    assertAnonymous(dirDefault);

    const dirCompIds = dirDefault.companies.map((c) => c._id.toString());
    if (dirCompIds.includes(companyPending._id.toString())) {
        throw new Error('F13: Pending company was included in directory!');
    }
    if (!dirCompIds.includes(companyA._id.toString()) || !dirCompIds.includes(companyB._id.toString())) {
        throw new Error('F13: Approved companies missing from directory');
    }
    console.log('PASS F13: Directory returns approved companies only and excludes pending');

    // 2. Sort by rating desc
    res = await fetch(`${rootUrl}/company/directory?sortBy=rating&sortOrder=desc`);
    const dirRatingDesc = await expectJson(res, 200, 'F13: Sort by rating desc');
    const compAInDir = dirRatingDesc.companies.find((c) => c._id.toString() === companyA._id.toString());
    const compBInDir = dirRatingDesc.companies.find((c) => c._id.toString() === companyB._id.toString());

    if (compAInDir.averageRating !== 3.0 || compAInDir.reviewCount !== 2 || compAInDir.averageStipend !== 13750.25) {
        throw new Error(`F13: Company A stats incorrect: ${JSON.stringify(compAInDir)}`);
    }
    if (compBInDir.averageRating !== 0 || compBInDir.reviewCount !== 0 || compBInDir.averageStipend !== 20000) {
        throw new Error(`F13: Company B zero review stats incorrect: ${JSON.stringify(compBInDir)}`);
    }

    const idxA = dirRatingDesc.companies.findIndex((c) => c._id.toString() === companyA._id.toString());
    const idxB = dirRatingDesc.companies.findIndex((c) => c._id.toString() === companyB._id.toString());
    if (idxA > idxB) {
        throw new Error(`F13: In rating desc, Company A (3.0) should come before Company B (0.0). Found indices: A=${idxA}, B=${idxB}`);
    }
    console.log('PASS F13: Sorting by computed rating desc works correctly');

    // 3. Sort by averageStipend desc
    res = await fetch(`${rootUrl}/company/directory?sortBy=averageStipend&sortOrder=desc`);
    const dirStipendDesc = await expectJson(res, 200, 'F13: Sort by averageStipend desc');
    const idxAStipend = dirStipendDesc.companies.findIndex((c) => c._id.toString() === companyA._id.toString());
    const idxBStipend = dirStipendDesc.companies.findIndex((c) => c._id.toString() === companyB._id.toString());
    if (idxBStipend > idxAStipend) {
        throw new Error(`F13: In averageStipend desc, Company B (20000) should come before Company A (13750.25). Indices: A=${idxAStipend}, B=${idxBStipend}`);
    }
    console.log('PASS F13: Sorting by computed averageStipend desc works correctly');

    // 4. Invalid query params
    res = await fetch(`${rootUrl}/company/directory?sortBy=invalidParam`);
    await expectJson(res, 400, 'F13: Invalid sortBy param');

    res = await fetch(`${rootUrl}/company/directory?sortOrder=invalidOrder`);
    await expectJson(res, 400, 'F13: Invalid sortOrder param');

    res = await fetch(`${rootUrl}/company/directory?limit=0`);
    await expectJson(res, 400, 'F13: Limit 0');

    res = await fetch(`${rootUrl}/company/directory?limit=101`);
    await expectJson(res, 400, 'F13: Limit 101');

    res = await fetch(`${rootUrl}/company/directory?page=0`);
    await expectJson(res, 400, 'F13: Page 0');
    console.log('PASS F13: Directory input validation passed');

    console.log('--- STARTING FEATURE 14 (FAKE REVIEW REPORTING) TESTS ---');
    // 1. Role boundaries for flagging
    res = await fetch(`${rootUrl}/flags/review/${createdReview1._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'This is spam.' })
    });
    await expectJson(res, 401, 'F14: Unauthenticated review flag');

    res = await fetch(`${rootUrl}/flags/review/${createdReview1._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${compToken}` },
        body: JSON.stringify({ reason: 'This is spam.' })
    });
    await expectJson(res, 403, 'F14: Company role review flag');

    // 2. Reject self-reporting: Student 1 cannot flag Student 1's review
    res = await fetch(`${rootUrl}/flags/review/${createdReview1._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ reason: 'Flagging my own review' })
    });
    await expectJson(res, 400, 'F14: Student self-flagging rejection');
    console.log('PASS F14: Self-reporting a review is rejected with 400');

    // 3. Validation: empty reason, oversized reason, invalid review ID
    res = await fetch(`${rootUrl}/flags/review/${createdReview1._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s2Token}` },
        body: JSON.stringify({ reason: '   ' })
    });
    await expectJson(res, 400, 'F14: Empty flag reason');

    res = await fetch(`${rootUrl}/flags/review/${createdReview1._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s2Token}` },
        body: JSON.stringify({ reason: 'A'.repeat(1001) })
    });
    await expectJson(res, 400, 'F14: Oversized flag reason');
    console.log('PASS F14: Flag input validation passed');

    // 4. Student 2 reports review 1
    res = await fetch(`${rootUrl}/flags/review/${createdReview1._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s2Token}` },
        body: JSON.stringify({ reason: 'Contains inaccurate and suspicious claims.' })
    });
    const flag1Body = await expectJson(res, 201, 'F14: Student 2 flags review 1');
    assertAnonymous(flag1Body);
    const flag1Id = flag1Body.flag._id;

    // 5. Duplicate flag attempt by Student 2 -> 409
    res = await fetch(`${rootUrl}/flags/review/${createdReview1._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s2Token}` },
        body: JSON.stringify({ reason: 'Reporting again.' })
    });
    await expectJson(res, 409, 'F14: Duplicate review flag');
    console.log('PASS F14: Duplicate review flag rejected with 409');

    // 6. Student 3 reports review 2
    res = await fetch(`${rootUrl}/flags/review/${createdReview2._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s3Token}` },
        body: JSON.stringify({ reason: 'Possible promotional review.' })
    });
    const flag2Body = await expectJson(res, 201, 'F14: Student 3 flags review 2');
    const flag2Id = flag2Body.flag._id;

    // 7. Admin GET flags
    // Student attempt -> 403
    res = await fetch(`${rootUrl}/flags`, {
        headers: { Authorization: `Bearer ${s1Token}` }
    });
    await expectJson(res, 403, 'F14: Student accessing admin flag list');

    // Admin access -> 200
    res = await fetch(`${rootUrl}/flags?status=Pending`, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminFlags = await expectJson(res, 200, 'F14: Admin GET pending flags');
    assertAnonymous(adminFlags);

    if (adminFlags.flags.length < 2) {
        throw new Error(`F14: Admin did not receive all pending flags: ${JSON.stringify(adminFlags)}`);
    }
    // Check populated review and safe company info
    const sampleFlag = adminFlags.flags.find((f) => f._id.toString() === flag1Id);
    if (!sampleFlag || !sampleFlag.review || !sampleFlag.review.comment || !sampleFlag.review.company.companyName) {
        throw new Error(`F14: Populated review or company data missing in flag moderation response: ${JSON.stringify(sampleFlag)}`);
    }
    console.log('PASS F14: Admin retrieved pending flags with populated review data without leaking reporter');

    // 8. Admin PATCH flag status
    // Student attempt -> 403
    res = await fetch(`${rootUrl}/flags/${flag1Id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s1Token}` },
        body: JSON.stringify({ status: 'Resolved' })
    });
    await expectJson(res, 403, 'F14: Student patching flag status');

    // Invalid status -> 400
    res = await fetch(`${rootUrl}/flags/${flag1Id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'InvalidStatus' })
    });
    await expectJson(res, 400, 'F14: Invalid flag status');

    // Valid patch to 'Resolved'
    res = await fetch(`${rootUrl}/flags/${flag1Id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'Resolved' })
    });
    const patchedFlagBody = await expectJson(res, 200, 'F14: Admin resolved flag');
    if (patchedFlagBody.flag.status !== 'Resolved') {
        throw new Error('F14: Flag status was not updated to Resolved');
    }

    // Verify Review still exists (not deleted)
    const reviewStillExists = await Review.findById(createdReview1._id);
    if (!reviewStillExists) {
        throw new Error('F14: Review was improperly deleted during flag resolution');
    }

    // Filter by status=Resolved
    res = await fetch(`${rootUrl}/flags?status=Resolved`, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    const resolvedFlags = await expectJson(res, 200, 'F14: Admin GET resolved flags');
    if (!resolvedFlags.flags.some((f) => f._id.toString() === flag1Id)) {
        throw new Error('F14: Resolved flag not returned when filtering by status=Resolved');
    }
    console.log('PASS F14: Admin flag resolution and filtering verified');

    console.log('\n===========================================');
    console.log('ALL SPRINT 3 END-TO-END TESTS PASSED (100%)');
    console.log('===========================================\n');
};

runTests()
    .catch((error) => {
        console.error(`FAIL: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(cleanUp);
