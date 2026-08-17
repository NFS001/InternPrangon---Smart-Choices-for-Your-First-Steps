const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Application = require('../models/Application');
const CompanyProfile = require('../models/CompanyProfile');
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
const createdCompanyProfileIds = [];
const createdInternshipIds = [];
const createdApplicationIds = [];
const createdResumeIds = [];
const createdFiles = [];
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

const cleanUp = async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }

    if (createdApplicationIds.length > 0) {
        await Application.deleteMany({ _id: { $in: createdApplicationIds } });
    }

    if (createdResumeIds.length > 0) {
        await Resume.deleteMany({ _id: { $in: createdResumeIds } });
    }

    if (createdCompanyProfileIds.length > 0) {
        await CompanyProfile.deleteMany({ _id: { $in: createdCompanyProfileIds } });
    }

    if (createdInternshipIds.length > 0) {
        await Internship.deleteMany({ _id: { $in: createdInternshipIds } });
    }

    if (createdUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: createdUserIds } });
    }

    for (const filename of createdFiles) {
        const filePath = path.join(uploadDirectory, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    for (const filename of fs.readdirSync(uploadDirectory)) {
        if (!initialFiles.has(filename)) {
            fs.unlinkSync(path.join(uploadDirectory, filename));
        }
    }

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    console.log('Temporary Feature 9 test data cleaned up');
};

const createResume = async (student, label) => {
    const filename = `${student._id}-${runId}-${label}.pdf`;
    fs.writeFileSync(path.join(uploadDirectory, filename), `%PDF-1.4 Feature 9 ${label}`);
    createdFiles.push(filename);

    const resume = await Resume.create({
        studentId: student._id,
        filePath: `uploads/resumes/${filename}`,
        uploadedDate: new Date()
    });
    createdResumeIds.push(resume._id);
    return resume;
};

const runTests = async () => {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        throw new Error('MONGO_URI and JWT_SECRET must exist in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([Application.init(), Resume.init()]);

    const student = await User.create({
        name: 'Feature 9 Test Student',
        email: `feature9-student-${runId}@example.com`,
        password,
        role: 'student'
    });
    createdUserIds.push(student._id);

    const companyA = await User.create({
        name: 'Feature 9 Test Company A',
        email: `feature9-company-a-${runId}@example.com`,
        password,
        role: 'company'
    });
    createdUserIds.push(companyA._id);

    const companyB = await User.create({
        name: 'Feature 9 Test Company B',
        email: `feature9-company-b-${runId}@example.com`,
        password,
        role: 'company'
    });
    createdUserIds.push(companyB._id);

    for (const company of [companyA, companyB]) {
        const profile = await CompanyProfile.create({
            user: company._id,
            companyName: company.name,
            verificationDocument: `feature9-${company._id}.pdf`,
            verificationStatus: 'Approved'
        });
        createdCompanyProfileIds.push(profile._id);
    }

    const internshipA = await Internship.create({
        companyId: companyA._id,
        title: 'Feature 9 Internship A',
        description: 'Temporary Feature 9 internship A.',
        type: 'Paid',
        mode: 'Remote',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    createdInternshipIds.push(internshipA._id);

    const internshipB = await Internship.create({
        companyId: companyB._id,
        title: 'Feature 9 Internship B',
        description: 'Temporary Feature 9 internship B.',
        type: 'Unpaid',
        mode: 'On-site',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    createdInternshipIds.push(internshipB._id);

    const resume = await createResume(student, 'resume');
    const secondResume = await createResume(
        await User.create({
            name: 'Feature 9 Second Applicant',
            email: `feature9-student-two-${runId}@example.com`,
            password,
            role: 'student'
        }),
        'second-resume'
    );
    const secondStudent = await User.findById(secondResume.studentId);
    createdUserIds.push(secondStudent._id);

    const applicationA = await Application.create({
        student: student._id,
        internship: internshipA._id,
        resume: resume._id,
        status: 'Applied',
        appliedDate: new Date()
    });
    createdApplicationIds.push(applicationA._id);

    const secondApplicationA = await Application.create({
        student: secondStudent._id,
        internship: internshipA._id,
        resume: secondResume._id,
        status: 'Applied',
        appliedDate: new Date()
    });
    createdApplicationIds.push(secondApplicationA._id);

    const applicationB = await Application.create({
        student: student._id,
        internship: internshipB._id,
        resume: resume._id,
        status: 'Applied',
        appliedDate: new Date()
    });
    createdApplicationIds.push(applicationB._id);

    const studentToken = createToken(student._id);
    const companyAToken = createToken(companyA._id);
    const companyBToken = createToken(companyB._id);

    const app = express();
    app.use(express.json());
    app.use('/api/applications', applicationRoutes);

    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/applications`;

    let response = await fetch(`${baseUrl}/internship/${internshipA._id}`);
    await expectJson(response, 401, 'Test 1 unauthenticated applicant list');
    console.log('PASS Test 1: unauthenticated applicant list returns 401');

    response = await fetch(`${baseUrl}/internship/${internshipA._id}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
    });
    await expectJson(response, 403, 'Test 2 student applicant list');
    console.log('PASS Test 2: student applicant list returns 403');

    response = await fetch(`${baseUrl}/internship/${internshipA._id}`, {
        headers: { Authorization: `Bearer ${companyAToken}` }
    });
    const applicantBody = await expectJson(response, 200, 'Test 3 authorized applicant list');
    if (applicantBody.applications.length !== 2 ||
        applicantBody.applications.some((application) => !application.student || !application.resumeAvailable)) {
        throw new Error('Test 3: authorized applicant list is incomplete or exposes incorrect resume state');
    }
    console.log('PASS Test 3: authorized company views its applicants');

    response = await fetch(`${baseUrl}/internship/${internshipB._id}`, {
        headers: { Authorization: `Bearer ${companyAToken}` }
    });
    await expectJson(response, 403, 'Test 4 cross-company applicant list');
    console.log('PASS Test 4: cross-company applicant list returns 403');

    if (applicantBody.applications.length !== 2) {
        throw new Error('Test 5: multiple applicants were not returned');
    }
    console.log('PASS Test 5: multiple applicants are returned');

    response = await fetch(`${baseUrl}/${applicationA._id}/resume`, {
        headers: { Authorization: `Bearer ${companyAToken}` }
    });
    const downloadedPdf = await response.arrayBuffer();
    if (response.status !== 200 || response.headers.get('content-type')?.split(';')[0] !== 'application/pdf') {
        throw new Error(`Test 6: expected PDF download, received ${response.status}`);
    }
    if (!Buffer.from(downloadedPdf).toString().includes('Feature 9 resume')) {
        throw new Error('Test 6: downloaded PDF content was incorrect');
    }
    console.log('PASS Test 6: authorized resume download returns a PDF');

    response = await fetch(`${baseUrl}/${applicationB._id}/resume`, {
        headers: { Authorization: `Bearer ${companyAToken}` }
    });
    await expectJson(response, 403, 'Test 7 cross-company resume download');
    console.log('PASS Test 7: cross-company resume download returns 403');

    const resumeFilePath = path.join(uploadDirectory, path.basename(resume.filePath));
    fs.unlinkSync(resumeFilePath);
    response = await fetch(`${baseUrl}/${applicationA._id}/resume`, {
        headers: { Authorization: `Bearer ${companyAToken}` }
    });
    await expectJson(response, 404, 'Test 8 missing resume file');
    console.log('PASS Test 8: missing resume file returns 404');

    for (const status of ['Shortlisted', 'Interviewing', 'Rejected']) {
        response = await fetch(`${baseUrl}/${applicationA._id}/status`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${companyAToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        await expectJson(response, 200, `status update to ${status}`);
        const savedApplication = await Application.findById(applicationA._id);
        if (savedApplication.status !== status) {
            throw new Error(`Status update to ${status} was not persisted`);
        }
        console.log(`PASS status update: ${status}`);
    }
    console.log('PASS Tests 9-11: all valid status updates are persisted');

    const statusBeforeInvalidUpdate = (await Application.findById(applicationA._id)).status;
    response = await fetch(`${baseUrl}/${applicationA._id}/status`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${companyAToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Hired' })
    });
    await expectJson(response, 400, 'Test 12 invalid status');
    if ((await Application.findById(applicationA._id)).status !== statusBeforeInvalidUpdate) {
        throw new Error('Test 12: invalid status changed the application');
    }
    console.log('PASS Test 12: invalid status returns 400 and does not change the application');

    response = await fetch(`${baseUrl}/${applicationB._id}/status`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${companyAToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Shortlisted' })
    });
    await expectJson(response, 403, 'Test 13 cross-company status update');
    if ((await Application.findById(applicationB._id)).status !== 'Applied') {
        throw new Error('Test 13: unauthorized status update changed the application');
    }
    console.log('PASS Test 13: cross-company status update returns 403');

    response = await fetch(`${baseUrl}/not-an-object-id/status`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${companyAToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Shortlisted' })
    });
    await expectJson(response, 400, 'Test 14 invalid application ID');
    console.log('PASS Test 14: invalid application ID returns 400');

    response = await fetch(`${baseUrl}/${new mongoose.Types.ObjectId()}/status`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${companyAToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Shortlisted' })
    });
    await expectJson(response, 404, 'Test 15 nonexistent application');
    console.log('PASS Test 15: nonexistent application returns 404');

    console.log('Feature 9 end-to-end tests passed');
};

runTests()
    .catch((error) => {
        console.error(`FAIL: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(cleanUp);
