const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const { headers = {}, ...rest } = options;
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        ...rest
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
}

async function verify() {
    console.log('=== VERIFYING REVIEWS SUBMISSION & DISPLAY FLOW ===');
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
        // 1. Student Login
        console.log('\n--- Step 1: Student Login ---');
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

        // 2. Get Companies
        console.log('\n--- Step 2: Get Company Directory ---');
        const compRes = await request('/company/directory');
        const companies = compRes.data.companies || [];
        assert(companies.length > 0, `Found ${companies.length} companies in directory`);

        const testCompany = companies[0];
        assert(testCompany && testCompany._id, `Selected company: ${testCompany.companyName} (${testCompany._id})`);

        // 3. Submit / Update Review for this company
        console.log('\n--- Step 3: Submit Review ---');
        const testComment = `Automated Verification Review for ${testCompany.companyName}: Fantastic learning experience! [${Date.now()}]`;
        const reviewRes = await request(`/reviews/company/${testCompany._id}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                rating: 5,
                comment: testComment
            })
        });
        assert(reviewRes.status === 200 || reviewRes.status === 201, `Review submitted/updated with status ${reviewRes.status}: "${reviewRes.data.message}"`);

        // 4. Submit Interview Experience
        console.log('\n--- Step 4: Submit Interview Experience ---');
        const testQuestions = `1. Explain React Virtual DOM. 2. Implement debounce in TypeScript. [${Date.now()}]`;
        const ieRes = await request(`/interview-experiences/company/${testCompany._id}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                questions: testQuestions
            })
        });
        assert(ieRes.status === 201, `Interview experience submitted with status 201: "${ieRes.data.message}"`);

        // 5. Verify GET /api/reviews returns the submitted review
        console.log('\n--- Step 5: Verify Global All Reviews ---');
        const allReviewsRes = await request('/reviews');
        assert(allReviewsRes.status === 200, 'GET /api/reviews returned status 200');
        const reviews = allReviewsRes.data.reviews || [];
        assert(reviews.length > 0, `GET /api/reviews returned ${reviews.length} reviews`);

        const foundReview = reviews.find(r => r.comment === testComment);
        assert(!!foundReview, `Found newly submitted review in global reviews list (Company: ${foundReview?.company})`);

        // 6. Verify GET /api/interview-experiences returns the submitted experience
        console.log('\n--- Step 6: Verify Global Interview Experiences ---');
        const allIERes = await request('/interview-experiences');
        assert(allIERes.status === 200, 'GET /api/interview-experiences returned status 200');
        const ies = allIERes.data.interviewExperiences || [];
        assert(ies.length > 0, `GET /api/interview-experiences returned ${ies.length} entries`);

        const foundIE = ies.find(i => i.questions === testQuestions);
        assert(!!foundIE, `Found newly submitted interview experience in global list (Company: ${foundIE?.company})`);

        // 7. Verify GET /api/reviews/company/:id returns company reviews
        console.log('\n--- Step 7: Verify Company-Specific Reviews ---');
        const compRevRes = await request(`/reviews/company/${testCompany._id}`);
        assert(compRevRes.status === 200, `GET /api/reviews/company/${testCompany._id} returned status 200`);
        const compReviews = compRevRes.data.reviews || [];
        assert(compReviews.length > 0, `Company has ${compReviews.length} review(s)`);

        console.log(`\n================================`);
        console.log(`VERIFICATION RESULT: ${passCount}/${totalCount} tests passed`);
        console.log(`================================\n`);
        process.exit(passCount === totalCount ? 0 : 1);
    } catch (err) {
        console.error('Verification error:', err);
        process.exit(1);
    }
}

verify();
