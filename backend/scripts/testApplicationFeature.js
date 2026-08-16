const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Resume = require('../models/Resume');
const User = require('../models/User');
const applicationRoutes = require('../routes/applicationRoutes');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'resumes');
fs.mkdirSync(uploadDirectory, { recursive: true });
const initialFiles = new Set(fs.readdirSync(uploadDirectory));
const runId = crypto.randomUUID();
const password = `Test-${crypto.randomUUID()}-A1`;

const createdUserIds = [];
const createdInternshipIds = [];
let server;
let studentWithResume;
let studentWithoutResume;
let company;
let resume;

const expectStatus = async (response, expectedStatus, testName) => {
    const body = await response.json();

    if (response.status !== expectedStatus) {
        throw new Error(
            `${testName}: expected ${expectedStatus}, received ${response.status} ${JSON.stringify(body)}`
        );
    }

    return body;
};

const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const cleanUp = async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }

    if (createdUserIds.length > 0 || createdInternshipIds.length > 0) {
        await Application.deleteMany({
            $or: [
                { student: { $in: createdUserIds } },
                { internship: { $in: createdInternshipIds } }
            ]
        });
    }

    if (createdUserIds.length > 0) {
        await Resume.deleteMany({ studentId: { $in: createdUserIds } });
        await User.deleteMany({ _id: { $in: createdUserIds } });
    }

    if (createdInternshipIds.length > 0) {
        await Internship.deleteMany({ _id: { $in: createdInternshipIds } });
    }

    for (const filename of fs.readdirSync(uploadDirectory)) {
        if (!initialFiles.has(filename)) {
            fs.unlinkSync(path.join(uploadDirectory, filename));
        }
    }

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    console.log('Temporary Feature 8 test data cleaned up');
};

const runTests = async () => {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        throw new Error('MONGO_URI and JWT_SECRET must exist in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([Application.init(), Resume.init()]);

    studentWithResume = await User.create({
        name: 'Feature 8 Student With Resume',
        email: `feature8-resume-${runId}@example.com`,
        password,
        role: 'student'
    });
    createdUserIds.push(studentWithResume._id);

    studentWithoutResume = await User.create({
        name: 'Feature 8 Student Without Resume',
        email: `feature8-no-resume-${runId}@example.com`,
        password,
        role: 'student'
    });
    createdUserIds.push(studentWithoutResume._id);

    company = await User.create({
        name: 'Feature 8 Test Company',
        email: `feature8-company-${runId}@example.com`,
        password,
        role: 'company'
    });
    createdUserIds.push(company._id);

    const firstInternship = await Internship.create({
        companyId: company._id,
        title: 'Feature 8 Test Internship One',
        description: 'Temporary internship for one-click application testing.',
        type: 'Paid',
        mode: 'Remote',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    createdInternshipIds.push(firstInternship._id);

    const secondInternship = await Internship.create({
        companyId: company._id,
        title: 'Feature 8 Test Internship Two',
        description: 'Second temporary internship for relationship testing.',
        type: 'Unpaid',
        mode: 'On-site',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    createdInternshipIds.push(secondInternship._id);

    const resumeFilename = `${studentWithResume._id}-${Date.now()}-${crypto.randomUUID()}.pdf`;
    fs.writeFileSync(path.join(uploadDirectory, resumeFilename), '%PDF-1.4 Feature 8 test resume');

    resume = await Resume.create({
        studentId: studentWithResume._id,
        filePath: `uploads/resumes/${resumeFilename}`,
        uploadedDate: new Date()
    });

    const studentToken = createToken(studentWithResume._id);
    const noResumeToken = createToken(studentWithoutResume._id);
    const companyToken = createToken(company._id);

    const app = express();
    app.use(express.json());
    app.use('/api/applications', applicationRoutes);

    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    const baseUrl = `http://127.0.0.1:${server.address().port}/api/applications`;

    let response = await fetch(`${baseUrl}/${firstInternship._id}`, { method: 'POST' });
    await expectStatus(response, 401, 'Test 1 unauthenticated application');
    console.log('PASS Test 1: unauthenticated application returns 401');

    response = await fetch(`${baseUrl}/${firstInternship._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${companyToken}` }
    });
    await expectStatus(response, 403, 'Test 2 company application');
    console.log('PASS Test 2: company application returns 403');

    response = await fetch(`${baseUrl}/${firstInternship._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${noResumeToken}` }
    });
    await expectStatus(response, 400, 'Test 3 student without Resume');
    const noResumeApplicationCount = await Application.countDocuments({
        student: studentWithoutResume._id
    });
    if (noResumeApplicationCount !== 0) {
        throw new Error('Test 3: an Application was created without a Resume');
    }
    console.log('PASS Test 3: student without Resume is rejected');

    response = await fetch(`${baseUrl}/${firstInternship._id}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${studentToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            studentId: studentWithoutResume._id,
            resumeId: new mongoose.Types.ObjectId(),
            status: 'Rejected'
        })
    });
    const firstApplicationResponse = await expectStatus(
        response,
        201,
        'Test 4 student application'
    );
    const firstApplication = await Application.findOne({
        student: studentWithResume._id,
        internship: firstInternship._id
    });

    if (
        !firstApplication ||
        firstApplication.resume.toString() !== resume._id.toString() ||
        firstApplication.status !== 'Applied' ||
        !firstApplication.appliedDate
    ) {
        throw new Error('Test 4: Application relationships or initial values are incorrect');
    }
    console.log('PASS Test 4: valid student application is stored with Applied status');

    if (
        firstApplicationResponse.application.resume.toString() !== resume._id.toString() ||
        firstApplication.student.toString() !== studentWithResume._id.toString()
    ) {
        throw new Error('Test 5: Resume or student was taken from untrusted request data');
    }
    console.log('PASS Test 5: saved Resume is attached automatically');

    response = await fetch(`${baseUrl}/not-an-object-id`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` }
    });
    await expectStatus(response, 400, 'Test 6 malformed internship ID');

    response = await fetch(`${baseUrl}/${new mongoose.Types.ObjectId()}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` }
    });
    await expectStatus(response, 404, 'Test 6 missing internship');
    console.log('PASS Test 6: malformed and nonexistent internships are rejected');

    response = await fetch(`${baseUrl}/${firstInternship._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` }
    });
    await expectStatus(response, 409, 'Test 7 duplicate application');

    const duplicateCount = await Application.countDocuments({
        student: studentWithResume._id,
        internship: firstInternship._id
    });
    if (duplicateCount !== 1) {
        throw new Error(`Test 7: expected one Application, found ${duplicateCount}`);
    }

    let uniqueIndexRejectedDuplicate = false;
    try {
        await Application.create({
            student: studentWithResume._id,
            internship: firstInternship._id,
            resume: resume._id,
            status: 'Applied',
            appliedDate: new Date()
        });
    } catch (error) {
        uniqueIndexRejectedDuplicate = error.code === 11000;
    }
    if (!uniqueIndexRejectedDuplicate) {
        throw new Error('Test 7: database unique index did not reject a duplicate');
    }
    console.log('PASS Test 7: duplicate application is rejected by API and database');

    response = await fetch(`${baseUrl}/${secondInternship._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` }
    });
    await expectStatus(response, 201, 'Test 8 second internship application');

    const studentApplications = await Application.find({
        student: studentWithResume._id
    }).sort({ internship: 1 });
    if (
        studentApplications.length !== 2 ||
        studentApplications.some((application) => application.resume.toString() !== resume._id.toString())
    ) {
        throw new Error('Test 8: applications to different internships are incorrect');
    }
    console.log('PASS Test 8: student can apply to two internships using one saved Resume');
    console.log('Feature 8 end-to-end tests passed');
};

runTests()
    .catch((error) => {
        console.error(`FAIL: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(cleanUp);
