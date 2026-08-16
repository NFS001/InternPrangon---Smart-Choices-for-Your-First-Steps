require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Resume = require('../models/Resume');
const resumeRoutes = require('../routes/resumeRoutes');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'resumes');
const initialFiles = new Set(fs.readdirSync(uploadDirectory));
const runId = crypto.randomUUID();
const password = `Test-${crypto.randomUUID()}-A1`;

let student;
let company;
let server;

const expectStatus = async (response, expectedStatus, testName) => {
    const body = await response.json();

    if (response.status !== expectedStatus) {
        throw new Error(
            `${testName}: expected ${expectedStatus}, received ${response.status} ${JSON.stringify(body)}`
        );
    }

    return body;
};

const cleanUp = async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }

    if (student) {
        await Resume.deleteMany({ studentId: student._id });
    }

    const userIds = [student?._id, company?._id].filter(Boolean);
    if (userIds.length > 0) {
        await User.deleteMany({ _id: { $in: userIds } });
    }

    for (const filename of fs.readdirSync(uploadDirectory)) {
        if (!initialFiles.has(filename)) {
            fs.unlinkSync(path.join(uploadDirectory, filename));
        }
    }

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    console.log('Temporary Feature 7 test data cleaned up');
};

const runTests = async () => {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        throw new Error('MONGO_URI and JWT_SECRET must exist in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    await Resume.init();

    student = await User.create({
        name: 'Feature 7 Test Student',
        email: `feature7-student-${runId}@example.com`,
        password,
        role: 'student'
    });

    company = await User.create({
        name: 'Feature 7 Test Company',
        email: `feature7-company-${runId}@example.com`,
        password,
        role: 'company'
    });

    const studentToken = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const companyToken = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const app = express();
    app.use(express.json());
    app.use('/api/resume', resumeRoutes);

    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    const baseUrl = `http://127.0.0.1:${server.address().port}/api/resume`;

    let response = await fetch(baseUrl, { method: 'POST' });
    await expectStatus(response, 401, 'Test 1 unauthenticated upload');
    console.log('PASS Test 1: unauthenticated upload returns 401');

    let form = new FormData();
    form.append('resume', new Blob(['%PDF-1.4 company'], { type: 'application/pdf' }), 'company.pdf');
    response = await fetch(baseUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${companyToken}` },
        body: form
    });
    await expectStatus(response, 403, 'Test 2 company upload');
    console.log('PASS Test 2: company upload returns 403');

    const invalidFiles = [
        { name: 'resume.jpg', type: 'image/jpeg' },
        { name: 'resume.png', type: 'image/png' },
        {
            name: 'resume.docx',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
    ];

    for (const invalidFile of invalidFiles) {
        form = new FormData();
        form.append('resume', new Blob(['invalid'], { type: invalidFile.type }), invalidFile.name);
        response = await fetch(baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${studentToken}` },
            body: form
        });
        await expectStatus(response, 400, `Test 3 ${invalidFile.name}`);
    }
    console.log('PASS Test 3: JPG, PNG, and DOCX uploads return 400');

    form = new FormData();
    form.append(
        'resume',
        new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'application/pdf' }),
        'oversized.pdf'
    );
    response = await fetch(baseUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: form
    });
    await expectStatus(response, 400, 'Test 4 oversized PDF');
    console.log('PASS Test 4: oversized PDF returns 400');

    form = new FormData();
    form.append('resume', new Blob(['%PDF-1.4 first resume'], { type: 'application/pdf' }), 'first.pdf');
    response = await fetch(baseUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: form
    });
    const firstUpload = await expectStatus(response, 201, 'Test 5 valid PDF upload');
    const firstResume = await Resume.findOne({ studentId: student._id });

    if (!firstResume || firstResume.studentId.toString() !== student._id.toString()) {
        throw new Error('Test 5: Resume document was not saved for the correct student');
    }

    const firstResumeId = firstResume._id.toString();
    const firstFilePath = firstResume.filePath;
    const firstUploadedDate = firstResume.uploadedDate;
    const firstAbsolutePath = path.join(__dirname, '..', firstFilePath);

    if (!fs.existsSync(firstAbsolutePath) || firstUpload.resume.filePath !== firstFilePath) {
        throw new Error('Test 5: physical PDF or stored file path is incorrect');
    }
    console.log('PASS Test 5: valid PDF saved to disk and Atlas');

    response = await fetch(`${baseUrl}/me`, {
        headers: { Authorization: `Bearer ${studentToken}` }
    });
    const fetchedResume = await expectStatus(response, 200, 'Test 6 retrieve resume');

    if (fetchedResume.resume.resumeId.toString() !== firstResumeId) {
        throw new Error('Test 6: the wrong Resume document was returned');
    }
    console.log('PASS Test 6: current resume information retrieved');

    await new Promise((resolve) => setTimeout(resolve, 20));
    form = new FormData();
    form.append('resume', new Blob(['%PDF-1.4 second resume'], { type: 'application/pdf' }), 'second.pdf');
    response = await fetch(baseUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: form
    });
    await expectStatus(response, 200, 'Test 7 replacement upload');

    const updatedResume = await Resume.findOne({ studentId: student._id });
    const secondAbsolutePath = path.join(__dirname, '..', updatedResume.filePath);

    if (
        updatedResume._id.toString() !== firstResumeId ||
        updatedResume.filePath === firstFilePath ||
        updatedResume.uploadedDate <= firstUploadedDate ||
        fs.existsSync(firstAbsolutePath) ||
        !fs.existsSync(secondAbsolutePath)
    ) {
        throw new Error('Test 7: resume replacement state is incorrect');
    }
    console.log('PASS Test 7: second PDF updates one document and removes the old file');

    const resumeCount = await Resume.countDocuments({ studentId: student._id });
    if (resumeCount !== 1) {
        throw new Error(`Test 8: expected one Resume document, found ${resumeCount}`);
    }

    let duplicateRejected = false;
    try {
        await Resume.create({
            studentId: student._id,
            filePath: 'uploads/resumes/duplicate.pdf',
            uploadedDate: new Date()
        });
    } catch (error) {
        duplicateRejected = error.code === 11000;
    }

    if (!duplicateRejected) {
        throw new Error('Test 8: unique studentId constraint did not reject a duplicate');
    }
    console.log('PASS Test 8: Atlas enforces one current resume per student');
    console.log('Feature 7 end-to-end tests passed');
};

runTests()
    .catch((error) => {
        console.error(`FAIL: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(cleanUp);
