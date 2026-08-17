const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CompanyProfile = require('../models/CompanyProfile');
const Review = require('../models/Review');
const User = require('../models/User');
const reviewRoutes = require('../routes/reviewRoutes');

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
        'user',
        'userId',
        'name',
        'email',
        'username',
        'profile'
    ]);

    const inspect = (currentValue) => {
        if (!currentValue || typeof currentValue !== 'object') {
            return;
        }

        for (const [key, nestedValue] of Object.entries(currentValue)) {
            if (forbiddenKeys.has(key)) {
                throw new Error(`Anonymous response exposed forbidden field: ${key}`);
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
        await Review.deleteMany({
            $or: [
                { student: { $in: createdUserIds } },
                { company: { $in: createdCompanyProfileIds } }
            ]
        });
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

    console.log('Temporary Feature 10 test data cleaned up');
};

const createUser = async (name, role, label) => {
    const user = await User.create({
        name,
        email: `feature10-${label}-${runId}@example.com`,
        password,
        role
    });
    createdUserIds.push(user._id);
    return user;
};

const createCompanyProfile = async (companyUser, label) => {
    const companyProfile = await CompanyProfile.create({
        user: companyUser._id,
        companyName: `Feature 10 Company ${label}`,
        verificationDocument: `feature10-${label}-${runId}.pdf`,
        verificationStatus: 'Approved'
    });
    createdCompanyProfileIds.push(companyProfile._id);
    return companyProfile;
};

const postReview = (baseUrl, companyId, token, body) => fetch(
    `${baseUrl}/company/${companyId}`,
    {
        method: 'POST',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
);

const runTests = async () => {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        throw new Error('MONGO_URI and JWT_SECRET must exist in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    await Review.init();

    const studentA = await createUser('Feature 10 Student A', 'student', 'student-a');
    const studentB = await createUser('Feature 10 Student B', 'student', 'student-b');
    const studentC = await createUser('Feature 10 Student C', 'student', 'student-c');
    const companyUserX = await createUser('Feature 10 Company User X', 'company', 'company-x');
    const companyUserY = await createUser('Feature 10 Company User Y', 'company', 'company-y');
    const companyX = await createCompanyProfile(companyUserX, 'X');
    const companyY = await createCompanyProfile(companyUserY, 'Y');

    const studentAToken = createToken(studentA._id);
    const studentBToken = createToken(studentB._id);
    const studentCToken = createToken(studentC._id);
    const companyToken = createToken(companyUserX._id);

    const app = express();
    app.use(express.json());
    app.use('/api/reviews', reviewRoutes);
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/reviews`;

    let response = await postReview(baseUrl, companyX._id, studentAToken, {
        rating: 5,
        comment: '  Excellent experience.  ',
        studentId: studentB._id
    });
    const createdBody = await expectJson(response, 201, 'Test 1 valid review');
    assertAnonymous(createdBody);
    const studentAReview = await Review.findOne({
        company: companyX._id,
        student: studentA._id
    }).select('+student');
    if (!studentAReview ||
        studentAReview.student.toString() !== studentA._id.toString() ||
        studentAReview.comment !== 'Excellent experience.') {
        throw new Error('Test 1: authenticated student or trimmed comment was not stored correctly');
    }
    console.log('PASS Test 1: student creates a valid anonymous review');

    response = await postReview(baseUrl, companyX._id, companyToken, {
        rating: 5,
        comment: 'Company users cannot review'
    });
    await expectJson(response, 403, 'Test 2 company review attempt');
    console.log('PASS Test 2: company review attempt returns 403');

    response = await postReview(baseUrl, companyX._id, null, {
        rating: 5,
        comment: 'Unauthenticated review'
    });
    await expectJson(response, 401, 'Test 3 unauthenticated review');
    console.log('PASS Test 3: unauthenticated review returns 401');

    response = await postReview(baseUrl, companyY._id, studentBToken, {
        rating: 0,
        comment: 'Invalid rating'
    });
    await expectJson(response, 400, 'Test 4 rating zero');
    console.log('PASS Test 4: rating 0 returns 400');

    response = await postReview(baseUrl, companyY._id, studentBToken, {
        rating: 6,
        comment: 'Invalid rating'
    });
    await expectJson(response, 400, 'Test 5 rating six');
    console.log('PASS Test 5: rating 6 returns 400');

    response = await postReview(baseUrl, companyY._id, studentBToken, {
        rating: 3.5,
        comment: 'Invalid rating'
    });
    await expectJson(response, 400, 'Test 6 decimal rating');
    console.log('PASS Test 6: decimal rating returns 400');

    response = await postReview(baseUrl, companyY._id, studentBToken, { rating: 5 });
    await expectJson(response, 400, 'Test 7 missing comment');
    console.log('PASS Test 7: missing comment returns 400');

    response = await postReview(baseUrl, companyY._id, studentBToken, {
        rating: 5,
        comment: '   '
    });
    await expectJson(response, 400, 'Test 8 empty comment');
    console.log('PASS Test 8: empty comment returns 400');

    response = await postReview(baseUrl, companyX._id, studentAToken, {
        rating: 4,
        comment: 'Duplicate review'
    });
    await expectJson(response, 409, 'Test 9 duplicate review');
    const duplicateCount = await Review.countDocuments({
        company: companyX._id,
        student: studentA._id
    });
    if (duplicateCount !== 1) {
        throw new Error(`Test 9: expected one review, found ${duplicateCount}`);
    }
    let uniqueIndexRejectedDuplicate = false;
    try {
        await Review.create({
            company: companyX._id,
            student: studentA._id,
            rating: 4,
            comment: 'Database duplicate'
        });
    } catch (error) {
        uniqueIndexRejectedDuplicate = error.code === 11000;
    }
    if (!uniqueIndexRejectedDuplicate) {
        throw new Error('Test 9: database unique index accepted a duplicate review');
    }
    console.log('PASS Test 9: duplicate review is rejected by API and database');

    response = await postReview(baseUrl, companyY._id, studentAToken, {
        rating: 4,
        comment: 'Another company review'
    });
    await expectJson(response, 201, 'Test 10 another company');
    console.log('PASS Test 10: one student can review another company');

    response = await postReview(baseUrl, companyX._id, studentBToken, {
        rating: 4,
        comment: 'Good mentorship.'
    });
    await expectJson(response, 201, 'Test 11 student B review');
    response = await postReview(baseUrl, companyX._id, studentCToken, {
        rating: 3,
        comment: 'Useful experience.'
    });
    await expectJson(response, 201, 'Test 11 student C review');
    const companyXReviewCount = await Review.countDocuments({ company: companyX._id });
    if (companyXReviewCount !== 3) {
        throw new Error(`Test 11: expected three reviews, found ${companyXReviewCount}`);
    }
    console.log('PASS Test 11: multiple students can review the same company');

    response = await fetch(`${baseUrl}/company/${companyX._id}`);
    const publicBody = await expectJson(response, 200, 'Test 12 average rating');
    assertAnonymous(publicBody);
    if (publicBody.averageRating !== 4 || publicBody.reviewCount !== 3 || publicBody.reviews.length !== 3) {
        throw new Error('Test 12: average, review count, or public reviews are incorrect');
    }
    console.log('PASS Test 12: average rating is calculated and response remains anonymous');

    response = await postReview(baseUrl, new mongoose.Types.ObjectId(), studentBToken, {
        rating: 5,
        comment: 'Missing company'
    });
    await expectJson(response, 404, 'Test 13 nonexistent company');
    console.log('PASS Test 13: nonexistent company returns 404');

    response = await postReview(baseUrl, 'not-an-object-id', studentBToken, {
        rating: 5,
        comment: 'Invalid company ID'
    });
    await expectJson(response, 400, 'Test 14 invalid company ID');
    console.log('PASS Test 14: invalid company ID returns 400');

    console.log('Feature 10 end-to-end tests passed');
};

runTests()
    .catch((error) => {
        console.error(`FAIL: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(cleanUp);
