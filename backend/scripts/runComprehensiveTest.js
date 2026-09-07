const assert = require('assert');

async function runTestSuite() {
  console.log('====================================================');
  console.log('RUNNING COMPREHENSIVE VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Company Directory API
  console.log('--- TEST 1: Company Directory ---');
  const dirRes = await fetch('http://localhost:5000/api/company/directory');
  assert.strictEqual(dirRes.status, 200, 'Directory status should be 200');
  const dirData = await dirRes.json();
  console.log(`✅ Fetched ${dirData.companies.length} approved companies from directory.`);
  assert(dirData.companies.length >= 8, 'Expected at least 8 approved companies');

  const companyNames = dirData.companies.map(c => c.companyName);
  console.log('Companies present in directory:', companyNames.join(', '));
  assert(!companyNames.includes('ByteForge Solutions'), 'ByteForge must NOT be in company directory');

  // Test 2: Individual Company Details API
  console.log('\n--- TEST 2: Individual Company Details & Internships ---');
  for (const company of dirData.companies) {
    const compRes = await fetch(`http://localhost:5000/api/company/${company._id}`);
    assert.strictEqual(compRes.status, 200, `Fetch company by ID ${company._id} failed`);
    const compDetails = await compRes.json();
    assert.strictEqual(compDetails.company.companyName, company.companyName);
    console.log(`✅ [${company.companyName}] Fetched details. Internships: ${compDetails.internships.length}`);
    for (const intern of compDetails.internships) {
      assert(intern.title, 'Internship title must exist');
      console.log(`   └─ "${intern.title}" (${intern.mode}, ${intern.type})`);
    }
  }

  // Test 3: Search Internships API & Detail lookup
  console.log('\n--- TEST 3: Internships Search & Detail Matching ---');
  const internRes = await fetch('http://localhost:5000/api/internship/search');
  assert.strictEqual(internRes.status, 200, 'Search internships failed');
  const internData = await internRes.json();
  console.log(`✅ Fetched ${internData.internships.length} internships.`);
  assert(internData.internships.length > 0, 'Internships list should not be empty');

  for (const intern of internData.internships) {
    assert.notStrictEqual(intern.title.toLowerCase(), 'bug fixer', 'Dummy "Bug fixer" must not exist');
    assert.notStrictEqual(intern.title.toLowerCase(), 'teacher', 'Dummy "Teacher" must not exist');
    assert.notStrictEqual(intern.title.toLowerCase(), 'lab assistant', 'Dummy "Lab assistant" must not exist');

    // Test individual detail lookup
    const singleRes = await fetch(`http://localhost:5000/api/internship/${intern._id}`);
    assert.strictEqual(singleRes.status, 200, `Fetch internship by ID ${intern._id} failed`);
    const singleData = await singleRes.json();
    assert.strictEqual(singleData.internship.title, intern.title, 'Title must match');
    assert.strictEqual(singleData.internship.company, intern.company, 'Company must match');
    console.log(`✅ Internship "${intern.title}" matches Company "${intern.company}"`);
  }

  // Test 4: Verify Login for all companies
  console.log('\n--- TEST 4: Company Logins (companyname@gmail.com / companyname123) ---');
  const testAccounts = [
    { email: 'brainstation@gmail.com', pass: 'brainstation123', name: 'Brain Station 23' },
    { email: 'chaldal@gmail.com', pass: 'chaldal123', name: 'Chaldal' },
    { email: 'square@gmail.com', pass: 'square123', name: 'Square' },
    { email: 'pathao@gmail.com', pass: 'pathao123', name: 'Pathao' },
    { email: 'bkash@gmail.com', pass: 'bkash123', name: 'bKash Limited' },
    { email: 'optimizely@gmail.com', pass: 'optimizely123', name: 'Optimizely' },
    { email: 'shopup@gmail.com', pass: 'shopup123', name: 'ShopUp' },
    { email: 'daraz@gmail.com', pass: 'daraz123', name: 'Daraz' },
    { email: 'rokomari@gmail.com', pass: 'rokomari123', name: 'Rokomari' },
    { email: '10minuteschool@gmail.com', pass: '10minuteschool123', name: '10 Minute School' },
    { email: 'incepta@gmail.com', pass: 'incepta123', name: 'Incepta Pharmaceuticals' },
    { email: 'biopharma@gmail.com', pass: 'biopharma123', name: 'BioPharma Group' },
    { email: 'sheba@gmail.com', pass: 'sheba123', name: 'Sheba.xyz' },
    { email: 'fintech@gmail.com', pass: 'fintech123', name: 'FinTech Hub' },
    { email: 'edtech@gmail.com', pass: 'edtech123', name: 'EdTech Global' },
  ];

  for (const acct of testAccounts) {
    const loginRes = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: acct.email, password: acct.pass })
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, `Login failed for ${acct.email}: ${JSON.stringify(loginData)}`);
    assert.strictEqual(loginData.user.role, 'company', `Role should be company for ${acct.email}`);
    console.log(`✅ Login SUCCESS: ${acct.email.padEnd(25)} (Password: ${acct.pass}) -> User: ${loginData.user.name}`);
  }

  console.log('\n====================================================');
  console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('====================================================');
}

runTestSuite().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
