const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
}

async function verify() {
    console.log('=== VERIFYING INTERNSHIPS APPLY & PROFILE SYNC ===');
    let passCount = 0;
    let totalCount = 0;

    const assert = (condition, desc) => {
        totalCount++;
        if (condition) {
            console.log(`✅ [PASS] ${desc}`);
            passCount++;
        } else {
            console.error(`❌ [FAIL] ${desc}`);
        }
    };

    try {
        // 1. Login demo student
        console.log('\n--- Test 1: Student Login ---');
        const loginRes = await request('/users/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'student@internprangon.com',
                password: 'student123'
            })
        });
        const token = loginRes.data.token;
        assert(token && token.length > 10, 'Student login returned valid JWT token');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Student Profile & 100% Completion Criteria
        console.log('\n--- Test 2: Student Profile & 100% Completion Criteria ---');
        const profileRes = await request('/student/profile', { headers });
        const hasBio = (profileRes.data.profile?.bio?.trim().length || 0) > 0;
        const hasSkills = (profileRes.data.profile?.skills?.length || 0) > 0;
        assert(hasBio, `Student bio exists: "${profileRes.data.profile?.bio?.slice(0, 30)}..."`);
        assert(hasSkills, `Student skills exist: ${profileRes.data.profile?.skills?.join(', ')}`);

        const resumeRes = await request('/resume/me', { headers });
        const hasResume = !!resumeRes.data.resume?.filePath;
        assert(hasResume, `Student resume exists in MongoDB: ${resumeRes.data.resume?.filePath}`);

        // Dynamic formula: 25% base + 25% bio + 25% skills + 25% resume = 100%
        let comp = 25;
        if (hasBio) comp += 25;
        if (hasSkills) comp += 25;
        if (hasResume) comp += 25;
        assert(comp === 100, `Profile completion strictly equals 100% (computed: ${comp}%)`);

        // 3. Search Internships & View Details Backend Integration
        console.log('\n--- Test 3: Search Internships & Live Backend IDs ---');
        const searchRes = await request('/internships/search');
        const internships = searchRes.data.internships || [];
        assert(internships.length > 0, `Search internships returned ${internships.length} active opportunities`);

        const targetInternship = internships[0];
        assert(targetInternship && targetInternship._id, `First internship resolved ID: ${targetInternship._id} ("${targetInternship.title}")`);

        // 4. Apply to Internship
        console.log('\n--- Test 4: Apply to Internship ---');
        const applyRes = await request(`/applications/${targetInternship._id}`, {
            method: 'POST',
            headers
        });
        if (applyRes.status === 201) {
            assert(true, `Application submitted successfully for ${targetInternship.title}`);
        } else if (applyRes.status === 409) {
            assert(true, `Already applied to ${targetInternship.title} (409 Conflict handled cleanly)`);
        } else {
            assert(false, `Unexpected apply status: ${applyRes.status} (${JSON.stringify(applyRes.data)})`);
        }

        // 5. Verify in My Applications
        console.log('\n--- Test 5: Verify My Applications ---');
        const myAppsRes = await request('/applications/my', { headers });
        const apps = myAppsRes.data.applications || [];
        assert(apps.length > 0, `My Applications contains ${apps.length} submitted application(s)`);

        // 6. Test Fresh Student without prior resume auto-resume creation on apply
        console.log('\n--- Test 6: Fresh Student Auto-Resume on Apply ---');
        const freshEmail = `test_student_${Date.now()}@example.com`;
        const regRes = await request('/users/register', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Auto Resume Tester',
                email: freshEmail,
                password: 'password123',
                role: 'student'
            })
        });
        const freshToken = regRes.data.token;
        const freshHeaders = { Authorization: `Bearer ${freshToken}` };

        // Apply to 2nd internship or 1st internship
        const target2 = internships[1] || internships[0];
        const freshApplyRes = await request(`/applications/${target2._id}`, {
            method: 'POST',
            headers: freshHeaders
        });
        assert(freshApplyRes.status === 201, `Fresh student without prior resume successfully applied (auto-generated standard resume)!`);

        const freshResumeCheck = await request('/resume/me', { headers: freshHeaders });
        assert(!!freshResumeCheck.data.resume, 'Auto-generated resume verified in database for fresh student');

        console.log(`\n================================`);
        console.log(`VERIFICATION RESULT: ${passCount}/${totalCount} tests passed`);
        console.log(`================================\n`);
        process.exit(passCount === totalCount ? 0 : 1);
    } catch (error) {
        console.error('Test execution error:', error);
        process.exit(1);
    }
}

verify();
